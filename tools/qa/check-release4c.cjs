'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const sw=fs.readFileSync('sw.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const required=[...html.matchAll(/<(?:script|link)\b[^>]*?(?:src|href)="([^"]+)"/g)].map(x=>x[1]).filter(x=>x.startsWith('/v3/')&&/\.(js|css)\?/.test(x));
const dependencyList=JSON.parse(sw.match(/const RUNTIME=(\[[\s\S]*?\]);/)[1]);
assert.deepEqual(dependencyList,required,'service-worker runtime dependencies must match current HTML');
function create({failure=null,stores=new Map()}={}){
 const actions={},deleted=[],networkCalls=[],origin='https://showdownlab.vercel.app';
 let online=true;
 function key(q){return typeof q==='string'?q:new URL(q.url).pathname+new URL(q.url).search}
 const cacheName=sw.match(/const CACHE='([^']+)'/)[1];
 const caches={
  open:async name=>{
   if(!stores.has(name))stores.set(name,new Map());
   const store=stores.get(name);
   return{
    addAll:async urls=>{for(const url of urls){networkCalls.push(url);if(failure===url)throw Error('network refused '+url);store.set(url,new Response('installed:'+url))}},
    put:async(req,response)=>{store.set(key(req),response.clone())},
    match:async req=>store.get(key(req))?.clone()
   }},
  keys:async()=>[...stores.keys()],
  delete:async name=>{deleted.push(name);return stores.delete(name)}
 };
 const obj={self:{location:{origin},addEventListener:(k,fn)=>actions[k]=fn,clients:{claim:async()=>{}}},URL,Response,caches,
 fetch:async req=>{networkCalls.push(key(req));if(!online)throw Error('offline');return new Response('live:'+key(req))}};
 vm.createContext(obj);vm.runInContext(sw,obj,{filename:'sw.js'});
 async function event(type,request){
  const pending=[];let returned;
  const e={request,waitUntil:p=>pending.push(p),respondWith:p=>returned=p};
  actions[type](e);
  const val=returned?await returned:undefined;
  await Promise.all(pending);return val;
 }
 return{event,stores,deleted,networkCalls,cacheName,setOnline:v=>online=v};
}
const request=(p,mode='cors')=>({url:'https://showdownlab.vercel.app'+p,method:'GET',mode});
(async()=>{
 const old=new Map([['/',new Response('old-shell')],['/v3/v3.js?v=stream4a1',new Response('old-module')]]);
 const stores=new Map([['showdown-lab-old',old],['unrelated-app',new Map()]]);
 const broken=create({failure:required[3],stores});
 await assert.rejects(broken.event('install'));
 assert(stores.has('showdown-lab-old'),'failed update must leave old app');
 assert(!stores.has(broken.cacheName),'failed staged cache must be discarded');
 const active=create({stores});
 await active.event('install');
 assert(stores.has(active.cacheName),'new install must create full bundle');
 assert.equal(active.networkCalls.length,required.length+7,'entire dependency graph precached');
 active.setOnline(false);
 // The waiting worker has not activated while older tabs remain.
 assert(stores.has('showdown-lab-old'),'waiting worker must not discard previous release');
 await active.event('activate');
 assert(!stores.has('showdown-lab-old'),'old release removed only after activation');
 assert(stores.has('unrelated-app'),'unrelated app cache untouched');
 assert.equal(await(await active.event('fetch',request('/v3/v3.js?v=stream4a1'))).text(),'installed:/v3/v3.js?v=stream4a1');
 assert.equal(await(await active.event('fetch',request('/home','navigate'))).text(),'installed:/');
 assert.equal(await(await active.event('fetch',request('/v3/','navigate'))).text(),'installed:/v3/index.html');
 const image=request('/v3/assets/authored/knight/idle.webp?v=knight-base256b');
 assert.equal((await active.event('fetch',image)).status,0,'uncached optional image must not masquerade as ready offline');
 active.setOnline(true);
 assert.equal(await(await active.event('fetch',image)).text(),'live:/v3/assets/authored/knight/idle.webp?v=knight-base256b');
 active.setOnline(false);
 assert.equal(await(await active.event('fetch',image)).text(),'live:/v3/assets/authored/knight/idle.webp?v=knight-base256b');
 // Requests to an unexpected runtime revision must fail rather than mixing module releases.
 assert.equal((await active.event('fetch',request('/v3/v3.js?v=unexpected'))).status,0,'do not serve mismatched module versions offline');
 console.log('PASS: staged all-'+required.length+'-module install; interrupted rollback; waiting-worker release isolation; offline launch; immutable image caching');
})().catch(e=>{console.error(e);process.exitCode=1});
