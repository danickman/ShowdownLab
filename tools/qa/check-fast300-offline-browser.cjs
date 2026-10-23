'use strict';
// End-to-end offline PWA installation: actual Chromium service worker, no mock cache/network.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'../..'),out=path.resolve(process.env.QA_FAST300_OFFLINE_OUTPUT||'/tmp/fast300-offline');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost'),route=decodeURIComponent(url.pathname).replace(/\/$/,'/index.html'),file=path.resolve(root,'.'+route);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}try{res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}catch(error){res.writeHead(404);res.end('missing '+route)}});
(async()=>{await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const address='http://127.0.0.1:'+server.address().port;
const browser=await puppeteer.launch({headless:true,executablePath:process.env.QA_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
const report={sha:process.env.GITHUB_SHA||'',kind:'real offline-controlled PWA cold reload and exact 300-fighter Worker import/ticks',browser:await browser.version(),checks:[],errors:[]};
try{const page=await browser.newPage();await page.setViewport({width:430,height:932,deviceScaleFactor:3,isMobile:true,hasTouch:true});
page.on('pageerror',e=>report.errors.push('script: '+e.message));page.on('workercreated',w=>w.on('error',e=>report.errors.push('worker: '+e.message)));
await page.goto(address+'/?qa=1',{waitUntil:'load',timeout:90000});
await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&window.ShowdownAdapter&&window.ShowdownQA,{timeout:90000});
// Registration is initiated from the original root pwa.js load handler.
await page.waitForFunction(()=>navigator.serviceWorker?.controller?.state==='activated',{timeout:105000,polling:250});
const precache=await page.evaluate(async({cacheName,workerUrl,engineUrl})=>{const names=await caches.keys(),cache=await caches.open(cacheName);
const urls=['/',workerUrl,engineUrl,'/v3/fast300-worker-bridge.js?v=fast300-thread3','/v3/simulation-adapter.js?v=fast300-thread1'];
const entries=await Promise.all(urls.map(async url=>({url,present:!!(await cache.match(url))})));
return{controller:navigator.serviceWorker.controller.state,active:(await navigator.serviceWorker.getRegistration())?.active?.state,cache:names.includes(cacheName),entries}},
{cacheName:"showdown-lab-release-fast300-worker-raster70-qa3",workerUrl:"/v3/fast300-physics-worker.js?v=fast300-thread1",engineUrl:"/v3/legacy-sim-core.js?v=fast300-exact1"});
assert.equal(precache.controller,'activated');assert(precache.cache);assert(precache.entries.every(e=>e.present),'offline release bundle incomplete');report.checks.push({type:'online-atomic-install',...precache});
await page.setOfflineMode(true);
// A genuine offline navigation must be served entirely by the installed worker.
await page.reload({waitUntil:'domcontentloaded',timeout:50000});
await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&window.ShowdownAdapter&&window.ShowdownQA&&navigator.serviceWorker.controller,{timeout:40000});
const offline=await page.evaluate(async({workerUrl,engineUrl})=>{const [a,b]=await Promise.all([fetch(workerUrl),fetch(engineUrl)]);return{navigatorOnline:navigator.onLine,workerStatus:a.status,engineStatus:b.status,workerSource:(await a.text()).includes('importScripts'),engineSource:(await b.text()).includes('LegacySimCore'),controller:!!navigator.serviceWorker.controller}},{workerUrl:"/v3/fast300-physics-worker.js?v=fast300-thread1",engineUrl:"/v3/legacy-sim-core.js?v=fast300-exact1"});
assert.equal(offline.navigatorOnline,false);assert(offline.controller);assert.equal(offline.workerStatus,200);assert.equal(offline.engineStatus,200);assert(offline.workerSource&&offline.engineSource,'actual offline Worker and physics source unavailable');report.checks.push({type:'offline-root-and-worker-code',...offline});
await page.click('[data-mode="quick"]');if(await page.$('.screen-ready.active'))await page.click('.screen-ready [data-go="battle"]');
await page.waitForFunction(()=>ShowdownQA.snapshot().screen==='battle',{timeout:20000});
const combat=await page.evaluate(async()=>{const wait=ms=>new Promise(r=>setTimeout(r,ms));const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const army=Object.fromEntries(types.map(t=>[t,15])),levels=Object.fromEntries(types.map((t,i)=>[t,[1,4,5][i%3]]));
ShowdownAdapter.setSpeed(1);ShowdownAdapter.startMatch({blue:army,red:army,blueLevels:levels,redLevels:levels,blueLives:2,redLives:2,seed:93561});
const limit=performance.now()+20000;let s=ShowdownAdapter.getState();
while((s.units.length<300||!(s.debug?.tick>=10))&&performance.now()<limit){if(window.__showdownThreadStats?.errors?.length)throw Error('offline Worker error '+JSON.stringify(window.__showdownThreadStats.errors));await wait(60);s=ShowdownAdapter.getState()}
const began={population:s.units.length,tick:s.debug?.tick||0,phase:s.phase,mode:window.__showdownThreadStats?.mode,errors:window.__showdownThreadStats?.errors||[]};
if(began.population<300||began.tick<10)throw Error('offline Worker never advanced an authentic 300-fighter battle: '+JSON.stringify(began));
ShowdownAdapter.setSpeed(10);const latestLimit=performance.now()+20000;
while(window.__showdownThreadStats?.workerDamage<=0&&performance.now()<latestLimit){if(window.__showdownThreadStats?.errors?.length)throw Error('offline Worker crashed midbattle');await wait(75)}
s=ShowdownAdapter.getState();const stats=window.__showdownThreadStats;
const ended={tick:s.debug?.tick||stats.workerTicks,damage:stats.workerDamage,mode:stats.mode,snapshots:stats.workerSnapshots,physicalStats:stats.physicalStats,errors:stats.errors,rollbacks:stats.rollbacks,phase:s.phase};
ShowdownAdapter.stopBattle();ShowdownAdapter.startMatch({blue:{knight:20},red:{turtle:20},blueLives:1,redLives:1,seed:93562});
return{began,ended,small:{population:ShowdownAdapter.getState().units.length,mode:window.__showdownThreadStats?.mode}};});
assert.equal(combat.began.mode,'worker');assert(combat.ended.damage>0,'no genuine offline HP damage');assert(combat.ended.tick>combat.began.tick);
assert(combat.ended.snapshots>=3&&combat.ended.physicalStats?.targetBuilds>0&&combat.ended.physicalStats?.collisionPasses>0);
assert.deepEqual(combat.ended.errors,[]);assert.equal(combat.ended.rollbacks,0);assert.equal(combat.small.population,40);assert.equal(combat.small.mode,'inline');
report.checks.push({type:'offline-300-authentic-combat',...combat});report.passed=true;assert.deepEqual(report.errors,[]);
console.log('FAST300 OFFLINE PWA '+JSON.stringify(report.checks));
}finally{await page.setOfflineMode(false).catch(()=>{});fs.writeFileSync(path.join(out,'fast300-offline.json'),JSON.stringify(report,null,2)+'\n');await browser.close()}})().catch(e=>{console.error('FAST300 OFFLINE PWA FAILURE',e.stack||e);process.exitCode=1}).finally(()=>server.close());
