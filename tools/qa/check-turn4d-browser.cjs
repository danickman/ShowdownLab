// Real Chromium PWA install/offline and network measurements. Not a physical Safari certification.
'use strict';
const fs=require('fs'),http=require('http'),path=require('path'),assert=require('assert'),puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'../..'),out=path.resolve(process.env.QA_BROWSER_OUTPUT||'/tmp/showdown-turn4d');
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://local').pathname).replace(/\/$/,'/index.html');
 const file=path.resolve(root,'.'+name);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 try{const data=fs.readFileSync(file);res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(data)}
 catch{res.writeHead(404);res.end()}
});
const collect=async(page,label)=>{
 const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(x=>({url:x.name.split('?')[0],transfer:x.transferSize||0,decoded:x.decodedBodySize||0,duration:x.duration})));
 return{label,requests:resources.length,transferBytes:resources.reduce((n,x)=>n+x.transfer,0),decodedBytes:resources.reduce((n,x)=>n+x.decoded,0),
 authored:resources.filter(x=>x.url.includes('/v3/assets/authored/')).length,
 moduleRequests:resources.filter(x=>/\/v3\/.*\.(js|css)$/.test(x.url)).length};
};
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await puppeteer.launch({headless:true,executablePath:process.env.QA_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const report={browser:await browser.version(),mode:'Chromium phone viewport, local server, not Safari',runs:[],errors:[],passed:false};
 try{
 const page=await browser.newPage();
 await page.setViewport({width:430,height:932,deviceScaleFactor:3,isMobile:true,hasTouch:true});
 page.on('pageerror',err=>report.errors.push(err.message));
 const url='http://127.0.0.1:'+server.address().port+'/?qa=1';
 const session=await page.createCDPSession();await session.send('Network.enable');await session.send('Network.setCacheDisabled',{cacheDisabled:true});
 await page.goto(url,{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.classList.contains('assets-ok'),{timeout:30000});
 report.runs.push(await collect(page,'cold'));
 await page.waitForFunction(()=>navigator.serviceWorker?.controller||navigator.serviceWorker?.ready,{timeout:60000});
 await page.evaluate(()=>navigator.serviceWorker.ready);
 // First controlled navigation should use the installed release cache even when offline.
 await session.send('Network.setCacheDisabled',{cacheDisabled:false});
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.classList.contains('assets-ok'),{timeout:30000});
 assert(await page.evaluate(()=>!!navigator.serviceWorker.controller),'service worker failed to control reloaded page');
 report.runs.push(await collect(page,'warm'));
 const prepared=await page.evaluate(()=>FighterAssets.prepareOffline('turtle',4));
 assert(prepared.ready&&prepared.count>=7,'Ultimate Turtle offline pack failed preparation');
 report.offlinePack=prepared;
 const packUrls=await page.evaluate(()=>FighterAssets.offlinePackUrls('turtle',4));
 const stored=await page.evaluate(async urls=>{
   const keys=await caches.keys(),stores=keys.filter(x=>x.startsWith('showdown-lab-release'));
   let found=0;for(const u of urls){for(const key of stores){const c=await caches.open(key);if(await c.match(u)){found++;break}}}
   return found;
 },packUrls);
 assert.strictEqual(stored,packUrls.length,'offline selected pack not fully stored');
 await page.setOfflineMode(true);
 await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.body.classList.contains('assets-ok'),{timeout:30000});
 assert.equal(await page.evaluate(()=>document.querySelector('.screen-home.active')!==null),true,'offline Home missing');
 const assets=await page.evaluate(()=>FighterAssets.assetStatus());
 assert(assets.ready>=2,'Home portraits missing offline');
 report.runs.push({...await collect(page,'offline'),readyPortraits:assets.ready,offlinePackCached:stored});
 await page.screenshot({path:path.join(out,'offline-home.png')});
 await page.setOfflineMode(false);
 assert.equal(report.errors.length,0,'application errors in cold/warm/offline runs');
 assert(report.runs[0].authored<=12,'Home loads too much optional artwork');
 // Isolated new browser context so the first view has no installed worker or warm cache.
 const slowContext=await browser.createBrowserContext();
 try{
  const slow=await slowContext.newPage();
  await slow.setViewport({width:430,height:932,deviceScaleFactor:3,isMobile:true,hasTouch:true});
  const slowSession=await slow.createCDPSession();
  await slowSession.send('Network.enable');
  await slowSession.send('Network.setCacheDisabled',{cacheDisabled:true});
  await slowSession.send('Network.emulateNetworkConditions',{offline:false,latency:140,downloadThroughput:180000,uploadThroughput:100000,connectionType:'cellular3g'});
  const start=Date.now();
  await slow.goto(url,{waitUntil:'domcontentloaded',timeout:90000});
  await slow.waitForFunction(()=>document.body.classList.contains('assets-ok'),{timeout:90000});
  const elapsedMs=Date.now()-start;
  const net=await collect(slow,'throttled-first-view');
  report.slow={...net,elapsedMs,latencyMs:140,downloadBytesPerSec:180000,profile:'synthetic Chromium CDP throttle'};
  assert(elapsedMs<90000,'throttled initial view exceeded 90s');
  await slow.screenshot({path:path.join(out,'throttled-home.png')});
 }finally{await slowContext.close()}
 report.passed=true;
 console.log('PASS: browser cold/warm/offline controlled PWA boot; request/byte receipt request/byte receipt '+JSON.stringify(report.runs));
 }finally{fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(report,null,2)+'\n');await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1}).finally(()=>server.close());
