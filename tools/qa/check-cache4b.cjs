'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync('sw.js','utf8');
async function boot({online=true,failInstall=false}={}){
 const handlers={},stores=new Map([['showdown-lab-older',new Map([['/old','old']])],['other-app',new Map([['/safe','safe']])]]);
 let net=online,networkCount=0,status=200,body='fresh',deleted=[];
 const key=r=>typeof r==='string'?r:r.url;
 const worker={URL,Response,console,
 self:{location:{origin:'https://showdownlab.vercel.app'},addEventListener:(type,fn)=>handlers[type]=fn,skipWaiting:async()=>{},clients:{claim:async()=>{}}},
 caches:{
  open:async name=>{if(!stores.has(name))stores.set(name,new Map());const store=stores.get(name);return{
   addAll:async urls=>{if(failInstall)throw Error('partial shell installation');assert(urls.includes('/'));for(const u of urls)store.set(u,new Response('shell:'+u))},
   match:async request=>store.get(key(request))?.clone(),
   put:async(req,res)=>{store.set(key(req),res.clone())}
  }},
  keys:async()=>[...stores.keys()],
  delete:async name=>{deleted.push(name);return stores.delete(name)}
 },
 fetch:async()=>{networkCount++;if(!net)throw Error('offline');return new Response(body,{status})}
 };
 vm.createContext(worker);vm.runInContext(src,worker,{filename:'sw.js'});
 const fire=async(type,request)=>{let response,pending=[];const event={request,waitUntil:p=>pending.push(p),respondWith:p=>response=p};handlers[type](event);const value=response?await response:null;await Promise.all(pending);return value};
 return{fire,stores,deleted,setNetwork:(v,b='fresh',code=200)=>{net=v;body=b;status=code},networkCount:()=>networkCount};
}
const req=(path,mode='cors')=>({url:'https://showdownlab.vercel.app'+path,method:'GET',mode});
(async()=>{
 const x=await boot();await x.fire('install');await x.fire('activate');
 assert(x.deleted.includes('showdown-lab-older')&&!x.deleted.includes('other-app'),'cache version migration');
 let image=req('/v3/assets/authored/knight/idle.webp?v=knight-base256b');
 assert.equal(await(await x.fire('fetch',image)).text(),'fresh');
 x.setNetwork(true,'new-data');
 assert.equal(await(await x.fire('fetch',image)).text(),'fresh','revisioned art should be cache-first');
 assert.equal(x.networkCount(),1,'immutable art must not revalidate');
 let changed=req('/v3/assets/authored/knight/idle.webp?v=knight-base256c');
 assert.equal(await(await x.fire('fetch',changed)).text(),'new-data','new revision cannot use old sprite');
 const module=req('/v3/v3.js?v=stream4a1');
 assert.equal(await(await x.fire('fetch',module)).text(),'new-data');
 x.setNetwork(true,'latest');
 assert.equal(await(await x.fire('fetch',module)).text(),'latest','modules must remain network-first');
 x.setNetwork(false);
 assert.equal(await(await x.fire('fetch',module)).text(),'latest','cached runtime offline');
 assert.equal(await(await x.fire('fetch',req('/missing','navigate'))).text(),'shell:/','offline navigation shell fallback');
 x.setNetwork(true,'not-found',404);
 const bad=req('/v3/assets/authored/turtle/ultimate/attack.webp?v=broken');
 assert.equal((await x.fire('fetch',bad)).status,404);
 x.setNetwork(false);
 assert.equal((await x.fire('fetch',bad)).status,0,'404 cannot contaminate asset cache');
 const partial=await boot({failInstall:true});await assert.rejects(partial.fire('install'),'failed mandatory shell must fail install');
 console.log('PASS: revisioned image cache-first; module network-first; offline cached module/navigation; 404 rejection; failed mandatory install; old cache cleanup');
})().catch(e=>{console.error(e);process.exitCode=1});
