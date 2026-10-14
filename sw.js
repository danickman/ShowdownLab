// Showdown Lab service worker. Revisioned image URLs are cache-first;
// HTML and executable modules remain network-first until atomic release bundles exist.
const CACHE='showdown-lab-stream4b1';
const SHELL=['/','/manifest.webmanifest?v=duel1','/icon-192.png?v=duel1','/icon-512.png?v=duel1','/icon-maskable-512.png?v=duel1','/apple-touch-icon.png?v=duel1'];
const isVersionedImage=u=>u.pathname.startsWith('/v3/assets/')&&/\.(?:webp|png|jpe?g)$/i.test(u.pathname)&&u.searchParams.has('v');
self.addEventListener('install',event=>event.waitUntil(
  caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())
));
self.addEventListener('activate',event=>event.waitUntil(
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('showdown-lab-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())
));
self.addEventListener('fetch',event=>{
  const req=event.request,url=new URL(req.url);
  if(req.method!=='GET'||url.origin!==self.location.origin)return;
  event.respondWith((async()=>{
    const store=await caches.open(CACHE),immutable=isVersionedImage(url);
    if(immutable){
      const hit=await store.match(req);
      if(hit)return hit;
    }
    try{
      const res=await fetch(req);
      if(res.ok&&res.type!=='opaque'){
        // Cache only successful GET responses. Never cache 404s, temporary errors, or partial content.
        if(res.status===200)event.waitUntil(store.put(req,res.clone()).catch(()=>{}));
      }
      return res;
    }catch(error){
      const cached=await store.match(req);
      if(cached)return cached;
      if(req.mode==='navigate'){
        const shell=await store.match('/');
        if(shell)return shell;
      }
      return Response.error();
    }
  })());
});
