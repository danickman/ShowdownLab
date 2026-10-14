// Atomically installed shell/runtime: generated from index.html on 2026-10-14.
// A new worker does not activate until every critical module has been cached.
const CACHE='showdown-lab-release4c1';
const SHELL=["/","/v3/index.html","/manifest.webmanifest?v=duel1","/icon-192.png?v=duel1","/icon-512.png?v=duel1","/icon-maskable-512.png?v=duel1","/apple-touch-icon.png?v=duel1","/v3/assets/authored/knight/presentation.webp?v=ultimate-roster10","/v3/assets/authored/dragon/presentation.webp?v=ultimate-roster10"];
const RUNTIME=[
  "/v3/v3.css?v=guide-room2",
  "/v3/presentation.css?v=turn3-touch1",
  "/v3/evolution-rules.js?v=five1",
  "/v3/ultimate-abilities.js?v=five1",
  "/v3/legacy-sim-core.js?v=evolution-five1",
  "/v3/simulation-adapter.js?v=evolution-five1",
  "/v3/camera.js?v=portrait-fronts1",
  "/v3/fighter-art.js?v=package16-rc1",
  "/v3/evolved-knight.js?v=registered1",
  "/v3/evolved-beetank.js?v=registered1",
  "/v3/evolved-goose.js?v=registered1",
  "/v3/evolved-sniper.js?v=registered1",
  "/v3/evolved-dragon.js?v=registered1",
  "/v3/evolved-assassin.js?v=registered1",
  "/v3/evolved-mole.js?v=registered1",
  "/v3/evolved-turtle.js?v=registered1",
  "/v3/evolved-goblin.js?v=registered1",
  "/v3/evolved-barbarian.js?v=registered1",
  "/v3/ultimate-knight.js?v=ultimate1",
  "/v3/ultimate-dragon.js?v=ultimate1",
  "/v3/ultimate-barbarian.js?v=ultimate1",
  "/v3/ultimate-goblin.js?v=ultimate1",
  "/v3/ultimate-beetank.js?v=ultimate1",
  "/v3/ultimate-turtle.js?v=ultimate1",
  "/v3/ultimate-mole.js?v=ultimate1",
  "/v3/ultimate-sniper.js?v=ultimate1",
  "/v3/ultimate-assassin.js?v=ultimate1",
  "/v3/ultimate-goose.js?v=ultimate1",
  "/v3/base-dragon.js?v=registered1",
  "/v3/asset-renderer.js?v=stream4a1",
  "/v3/arena-art.js?v=locations6",
  "/v3/battle-theatre.js?v=honk4",
  "/v3/arena-floor-art.js?v=garden2",
  "/v3/arena-stage.js?v=locations6",
  "/v3/arena-ambience.js?v=living1",
  "/v3/combat-staging.js?v=contact4",
  "/v3/ultimate-effects.js?v=five1",
  "/v3/v3.js?v=stream4a1",
  "/v3/stage5b-ui.js?v=package14-upgradefix1",
  "/v3/round-loop.js?v=locations6",
  "/v3/pwa.js?v=launch1"
];
const isVersionedImage=u=>u.pathname.startsWith('/v3/assets/')&&/\.(?:webp|png|jpe?g)$/i.test(u.pathname)&&u.searchParams.has('v');
const isCorePath=u=>RUNTIME.includes(u.pathname+u.search)||SHELL.includes(u.pathname+u.search)||u.pathname==='/'||u.pathname==='/v3/index.html';
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 try{await cache.addAll([...SHELL,...RUNTIME]);}
 catch(error){await caches.delete(CACHE);throw error;}
 // No skipWaiting: retain old worker and complete old release while old tabs remain.
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 // Old worker has no active clients once this waiting worker activates.
 for(const key of await caches.keys())if(key.startsWith('showdown-lab-')&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 const req=event.request,u=new URL(req.url);
 if(req.method!=='GET'||u.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  // Only serve the shell+module set that passed the atomic install gate.
  // Do not refetch individual executable modules into a live release.
  if(req.mode==='navigate'||isCorePath(u)){
   const key=req.mode==='navigate'?(u.pathname==='/v3'||u.pathname==='/v3/'?'/v3/index.html':'/'):req;
   const hit=await cache.match(key);
   if(hit)return hit;
   // Any missing critical installed module is a hard failure; never mix releases.
   return Response.error();
  }
  // Never fetch a module outside the validated installation set.
  if(u.pathname.startsWith('/v3/')&&/\.(?:js|css)$/i.test(u.pathname))return Response.error();
  if(isVersionedImage(u)){
   const hit=await cache.match(req);if(hit)return hit;
  }
  try{
   const res=await fetch(req);
   if(res.ok&&res.status===200&&res.type!=='opaque')event.waitUntil(cache.put(req,res.clone()).catch(()=>{}));
   return res;
  }catch{
   return await cache.match(req)||Response.error();
  }
 })());
});

// An explicit, opt-in offline pack for chosen fighter art. Nothing is downloaded
// unless the user/app requests it; a failed pack is reported, never called ready.
self.addEventListener('message',event=>{
 const data=event.data||{};
 if(data.type!=='CACHE_FIGHTER_PACK')return;
 const port=event.ports?.[0];if(!port)return;
 const urls=Array.isArray(data.urls)?data.urls:[];
 event.waitUntil((async()=>{
   if(!urls.length||urls.length>48)throw Error('Invalid pack size');
   const cache=await caches.open(CACHE);
   for(const raw of urls){
     if(typeof raw!=='string'||!raw.startsWith('/'))throw Error('Unsafe pack URL');
     const u=new URL(raw,self.location.origin);
     if(u.origin!==self.location.origin||!isVersionedImage(u))throw Error('Not a versioned authored image');
     if(await cache.match(raw))continue;
     const response=await fetch(raw);
     if(!response.ok||response.status!==200||response.type==='opaque')throw Error('Unavailable pack asset: '+u.pathname);
     await cache.put(raw,response);
   }
   port.postMessage({ok:true,count:urls.length});
 })().catch(error=>port.postMessage({ok:false,error:String(error.message||error)})));
});
