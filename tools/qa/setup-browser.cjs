// Reconstruct a verified Linux x64 Chromium binary from pinned @sparticuz/chromium.
'use strict';
const fs=require('fs'),path=require('path'),z=require('zlib'),cp=require('child_process');
const root=path.join(__dirname,'.runtime'),bin=path.resolve(path.dirname(require.resolve('@sparticuz/chromium')),'../bin'),browser=path.join(root,'chromium');
fs.mkdirSync(root,{recursive:true});
function valid(){try{const fd=fs.openSync(browser,'r'),buf=Buffer.alloc(4);fs.readSync(fd,buf,0,4,0);fs.closeSync(fd);if(buf.toString('hex')!=='7f454c46')return false;const result=cp.spawnSync(browser,['--version'],{timeout:10000,encoding:'utf8'});return result.status===0&&/chrom/i.test((result.stdout||'')+(result.stderr||''))}catch{return false}}
if(!valid()){
 const tmp=browser+'.tmp-'+process.pid;
 try{fs.writeFileSync(tmp,z.brotliDecompressSync(fs.readFileSync(path.join(bin,'chromium.br'))),{mode:0o755});fs.chmodSync(tmp,0o755);fs.renameSync(tmp,browser)}
 finally{if(fs.existsSync(tmp))fs.rmSync(tmp)}
 if(!valid())throw Error('Rebuilt Chromium failed executable integrity/version check');
}
for(const name of ['fonts','swiftshader']){
 const dir=path.join(root,name);fs.mkdirSync(dir,{recursive:true});
 cp.execFileSync('tar',['xf','-','--no-same-owner','-C',dir],{input:z.brotliDecompressSync(fs.readFileSync(path.join(bin,name+'.tar.br')))});
}
console.log('VERIFIED browser:',browser);
