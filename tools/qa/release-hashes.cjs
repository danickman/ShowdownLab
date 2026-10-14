'use strict';
// Regenerate a pinned SHA-256 manifest from committed release HTML and JS/CSS.
// Run: node tools/qa/release-hashes.cjs > /tmp/release-hashes.json
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..');
if(fs.existsSync(path.join(root,'v3/index.html')))throw Error('Duplicate v3/index.html entrypoint is forbidden; use root index.html');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const list=JSON.parse(sw.match(/const RUNTIME=(\[[\s\S]*?\]);/)[1]);
const refs=[...html.matchAll(/<(?:script|link)\b[^>]*?(?:src|href)="([^"]+)"/g)].map(m=>m[1]).filter(u=>u.startsWith('/v3/')&&/\.(?:js|css)\?/.test(u));
if(JSON.stringify(refs)!==JSON.stringify(list))throw Error('HTML and service-worker module list diverged');
const urls=['/',...list];
const data={};
for(const url of urls){
 const rel=url==='/'?'index.html':url.replace(/^\//,'').split('?')[0];
 const full=path.resolve(root,rel);
 if(!full.startsWith(root+path.sep))throw Error('unsafe path '+url);
 const bytes=fs.readFileSync(full);
 data[url]=crypto.createHash('sha256').update(bytes).digest('hex');
}

if(process.argv.includes('--verify')){
 const match=sw.match(/const RELEASE_SHA256=(\{[^\n]*\});/);
 if(!match)throw Error('Pinned manifest missing from service worker');
 const pinned=JSON.parse(match[1]);
 if(JSON.stringify(pinned)!==JSON.stringify(data))throw Error('Pinned SHA-256 manifest stale. Regenerate from committed source files.');
 console.log('PASS: '+urls.length+' pinned SHA-256 shell/module digests');
}else console.log(JSON.stringify(data));
