'use strict';
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict'),puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'../..'),out=path.resolve(process.env.QA_FAST300_LIFECYCLE_OUTPUT||'/tmp/fast300-lifecycle');fs.mkdirSync(out,{recursive:true});
// Direct live QA execution: no request intercept, no injected production Worker, no duplicate adapter patch.
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const old=read('tools/qa/fast300-preoptimized-core-reference.js'),current=read('v3/legacy-sim-core.js');
assert.equal(current,require('./fast300-physical-combined-candidate.cjs')(old),'actual QA playable 300 physics differs from exact proven candidate');
const worker=read('v3/fast300-physics-worker.js'),bridge=read('v3/fast300-worker-bridge.js'),adapter=read('v3/simulation-adapter.js');
assert(worker.includes("'/v3/legacy-sim-core.js?v=fast300-exact1'")&&bridge.includes('THRESHOLD=159'),'real pinned 300 Worker is not loaded');
assert(adapter.includes('if(r?.ok&&!r.pending)'),'real adapter must emit Worker spell only after successful acknowledgment');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png'};
const server=http.createServer((req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/\/$/,'/index.html'),file=path.resolve(root,'.'+p);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 try{res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
 catch(e){res.writeHead(404);res.end()}
});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await puppeteer.launch({headless:true,executablePath:process.env.QA_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
const report={sha:process.env.GITHUB_SHA||'',kind:'live QA-playable 300 Worker/adapter/round lifecycle with pinned source and no request interception',cases:[],errors:[]};
try{
const page=await browser.newPage();await page.setBypassServiceWorker(true);await page.setViewport({width:430,height:932,deviceScaleFactor:3,isMobile:true,hasTouch:true});
page.on('pageerror',e=>report.errors.push('page: '+e.message));page.on('workercreated',w=>w.on('error',e=>report.errors.push('worker: '+e.message)));
await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&window.ShowdownAdapter&&window.ShowdownQA,{timeout:90000});
await page.click('[data-mode="quick"]');if(await page.$('.screen-ready.active'))await page.click('.screen-ready [data-go="battle"]');
await page.waitForFunction(()=>ShowdownQA.snapshot().screen==='battle',{timeout:20000});
const result=await page.evaluate(async()=>{
 const wait=ms=>new Promise(r=>setTimeout(r,ms)),types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
 const army=Object.fromEntries(types.map(t=>[t,15])),levels=Object.fromEntries(types.map((t,i)=>[t,[1,4,5][i%3]]));
 ShowdownAdapter.startMatch({blue:army,red:army,blueLevels:levels,redLevels:levels,blueLives:1,redLives:1,seed:81337});
 const started=performance.now();while(ShowdownAdapter.getState().units.length!==300&&performance.now()-started<25000){if(window.__showdownThreadStats?.errors.length)throw Error('worker startup error '+JSON.stringify(window.__showdownThreadStats));await wait(50)}
 if(ShowdownAdapter.getState().units.length!==300)throw Error('worker deployment never reached 300 fighters');
 const initialMode=window.__showdownThreadStats?.mode;
 ShowdownAdapter.setSpeed(1);await wait(700);ShowdownAdapter.pauseBattle();await wait(700);
 const stoppedAt=ShowdownAdapter.getState().debug?.tick||0;await wait(650);const stoppedAfter=ShowdownAdapter.getState().debug?.tick||0;
 const forbidden=ShowdownAdapter.castSpell('quake',1);
 ShowdownAdapter.pauseBattle();ShowdownAdapter.setSpeed(10);await wait(1700);
 const before=ShowdownAdapter.getState(),beforeHp=before.units.reduce((s,u)=>s+u.hp,0);
 const eventLog=[];const listener=e=>{if(e.detail?.spell==='quake')eventLog.push({...e.detail})};window.addEventListener('showdown:spell',listener);
 const immediate=ShowdownAdapter.castSpell('quake',1);await wait(1200);window.removeEventListener('showdown:spell',listener);
 const after=ShowdownAdapter.getState(),afterHp=after.units.reduce((s,u)=>s+u.hp,0),activeStats={...window.__showdownThreadStats};
 ShowdownAdapter.stopBattle();ShowdownAdapter.startMatch({blue:{knight:20},red:{turtle:20},blueLives:1,redLives:1,seed:81437});
 await wait(650);const inline=ShowdownAdapter.getState();
 return{mode:initialMode,stoppedAt,stoppedAfter,forbidden,immediate,eventLog,beforeTick:before.debug?.tick||0,afterTick:after.debug?.tick||0,damage:beforeHp-afterHp,physicalStats:activeStats.physicalStats,workerSnapshots:activeStats.workerSnapshots,workerErrors:activeStats.errors,small:{count:inline.units.length,phase:inline.phase,mode:window.__showdownThreadStats?.mode}};
});
assert.equal(result.mode,'worker');assert.equal(result.stoppedAfter,result.stoppedAt,'pause must freeze authentic ticks');
assert.equal(result.forbidden.ok,false,'pause must reject spell');assert(result.immediate.ok&&result.immediate.pending,'Worker optimistic result must be pending');
assert.equal(result.eventLog.length,1,'exactly one actual Worker spell event');assert(result.eventLog[0].ok&&!result.eventLog[0].pending&&result.eventLog[0].targets>0,'real quake result required');
assert(result.afterTick>result.beforeTick&&result.damage>0&&result.workerSnapshots>=3,'real physical progression needed');
assert(result.physicalStats?.targetBuilds>0&&result.physicalStats?.collisionPasses>0,'optimized physical Worker not active');
assert.equal(result.small.count,40);assert.equal(result.small.mode,'inline');assert.deepEqual(result.workerErrors,[]);
report.cases.push({name:'worker-spell-pause-speed-retire',...result});console.log('FAST300 LIVE LIFECYCLE '+JSON.stringify(result));await page.close();
const fallback=await browser.newPage();await fallback.setBypassServiceWorker(true);await fallback.evaluateOnNewDocument(()=>{Object.defineProperty(window,'Worker',{value:undefined,configurable:true})});
fallback.on('pageerror',e=>report.errors.push('fallback: '+e.message));await fallback.goto('http://127.0.0.1:'+server.address().port+'/?qa=1',{waitUntil:'domcontentloaded'});
await fallback.waitForFunction(()=>document.body.classList.contains('assets-ok')&&window.ShowdownAdapter,{timeout:90000});
// Bridge was already loaded by the real root entrypoint and exits safely without Worker.
const safe=await fallback.evaluate(()=>{ShowdownAdapter.startMatch({blue:{knight:80},red:{turtle:80},blueLives:1,redLives:1,seed:420});return{count:ShowdownAdapter.getState().units.length,phase:ShowdownAdapter.getState().phase,stats:!!window.__showdownThreadStats}});
assert.equal(safe.count,160);assert.equal(safe.phase,'battle');assert(!safe.stats,'unsupported Worker must remain inline');report.cases.push({name:'no-worker-fallback',...safe});await fallback.close();
assert.deepEqual(report.errors,[]);report.passed=true;
}finally{fs.writeFileSync(path.join(out,'lifecycle.json'),JSON.stringify(report,null,2)+'\n');await browser.close()}
})().catch(e=>{console.error('FAST300 LIVE LIFECYCLE FAIL',e.stack||e);process.exitCode=1}).finally(()=>server.close());
