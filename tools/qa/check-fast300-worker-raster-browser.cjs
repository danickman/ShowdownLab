'use strict';
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'../..'),output=path.resolve(process.env.QA_FAST300_WORKER_RASTER_OUTPUT||'/tmp/raf-clock-worker');
fs.mkdirSync(output,{recursive:true});
// Combined exact target+ordered-contact Worker at current density raster. QA research only.
const readSource=p=>fs.readFileSync(path.join(root,p),'utf8');
const makePhysical=require('./fast300-physical-combined-candidate.cjs');
const originalCore=readSource('v3/legacy-sim-core.js');
const v3Original=readSource('v3/v3.js');
const v3RasterCandidate=require('./fast300-worker-raster-candidate.cjs')(v3Original);
assert(v3RasterCandidate!==v3Original&&v3RasterCandidate.includes('>=10?.85:.75'),'raster not applied');

const physicalCore=makePhysical(originalCore);
const oldWorker=readSource('tools/qa/turn20-raf-clock-worker.js'),oldBridge=readSource('tools/qa/turn20-raf-clock-bridge.js');
const originalImport="importScripts('/v3/evolution-rules.js?v=draft-cap6','/v3/ultimate-abilities.js?v=beetank-hammer-anvil4','/v3/legacy-sim-core.js?v=doubleko1');",oldBridgePath="const WORKER_PATH='/tools/qa/turn20-raf-clock-worker.js',THRESHOLD=120;";
assert(oldWorker.includes(originalImport)&&oldBridge.includes(oldBridgePath),'research Worker signatures changed');
assert(physicalCore.includes('collisionPasses+=passes')&&physicalCore.includes('function __nearestOriginal('),'wrong current-core study');
const mime={'.html':'text/html','.js':'text/javascript','.cjs':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(u.pathname).replace(/\/$/,'/index.html'),file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 try{res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
 catch{res.writeHead(404);res.end()}
});
const p95=x=>{const a=[...x].sort((a,b)=>a-b);return a[Math.floor((a.length-1)*.95)]||null};
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const host='http://127.0.0.1:'+server.address().port;
const sourceImports='importScripts('+JSON.stringify(host+'/v3/evolution-rules.js?v=draft-cap6')+','+JSON.stringify(host+'/v3/ultimate-abilities.js?v=goblin-earned-rabble1')+');';
const workerPhysics=(oldWorker.replace(originalImport,sourceImports+'\n'+physicalCore))
 .replace('snapshot:s,delivery:delivered','snapshot:s,delivery:delivered,physicalStats:self.__fast300PhysicalStats');
const bridgePhysics=oldBridge.replace(oldBridgePath,'const WORKER_PATH=window.__fast300WorkerUrl,THRESHOLD=120;')
 .replace('last=m.snapshot;stats.workerSnapshots++','last=m.snapshot;stats.physicalStats=m.physicalStats;stats.workerSnapshots++');
assert(workerPhysics.includes('physicalStats:self.__fast300PhysicalStats')&&bridgePhysics.includes('stats.physicalStats=m.physicalStats'),'active Worker evidence missing');
new Function(workerPhysics);new Function(bridgePhysics);
const browser=await puppeteer.launch({headless:true,executablePath:process.env.QA_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const result={sha:process.env.GITHUB_SHA||'',browser:await browser.version(),viewport:'430x932 DPR3',kind:'real current-raster authored fighters at 300 1x .75 source-only vs 1.0; original .85 at 10x; full exact worker vs current baseline, NOT Safari',cases:[],failures:[]};
 try{
  async function trial(mode,count,speed,rep){
   const page=await browser.newPage(),errors=[];
   try{
    await page.setBypassServiceWorker(true);
    let rasterIntercepted=0;
    await page.setRequestInterception(true);
    page.on('request',req=>{
      if(/\/v3\/v3\.js\?/.test(req.url())){
        rasterIntercepted++;
        return req.respond({status:200,contentType:'text/javascript',body:mode==='worker'?v3RasterCandidate:v3Original});
      }
      return req.continue();
    });
    await page.setViewport({width:430,height:932,deviceScaleFactor:3,isMobile:true,hasTouch:true});
    page.on('pageerror',e=>errors.push('page: '+(e.stack||e.message)));
    page.on('workercreated',w=>w.on('error',e=>errors.push('worker: '+e.message)));
    await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&window.ShowdownQA&&window.ShowdownAdapter,{timeout:90000});
    assert.equal(rasterIntercepted,1,'must intercept exactly one real canvas renderer');
    if(mode==='worker'){
  await page.evaluate(source=>{window.__fast300WorkerUrl=URL.createObjectURL(new Blob([source],{type:'text/javascript'}))},workerPhysics);
  await page.addScriptTag({content:bridgePhysics});
}
    await page.click('[data-mode="quick"]');
    if(await page.$('.screen-ready.active'))await page.click('.screen-ready [data-go="battle"]');
    await page.waitForFunction(()=>ShowdownQA.snapshot().screen==='battle',{timeout:20000});
    const data=await page.evaluate(async({count,speed,rep})=>{
     const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'],each=count/20;
     const army=Object.fromEntries(types.map(t=>[t,each])),levels=Object.fromEntries(types.map((t,i)=>[t,[1,4,5][i%3]]));
     ShowdownAdapter.startMatch({blue:army,red:army,blueLevels:levels,redLevels:levels,blueLives:1,redLives:1,seed:81337+rep});
     // Dedicated Worker initial deployment emits asynchronously; never measure stale previous Quick Match 11-unit snapshot.
     const deployedAt=performance.now();
     while(ShowdownAdapter.getState().units.length!==count&&performance.now()-deployedAt<20000){
       if(window.__showdownThreadStats?.errors.length)throw Error('Worker deployment: '+JSON.stringify(window.__showdownThreadStats));
       await new Promise(r=>setTimeout(r,60));
     }
     if(ShowdownAdapter.getState().units.length!==count)throw Error('Timed out waiting for '+count+' real fighters: '+JSON.stringify(window.__showdownThreadStats||{}));
     ShowdownAdapter.setSpeed(1);ShowdownAdapter.pauseBattle();
     await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
     const before=ShowdownAdapter.getState(),startHp=before.units.reduce((s,u)=>s+u.hp,0);
     ShowdownQA.clearRenderProfile();
     ShowdownAdapter.setSpeed(speed);ShowdownAdapter.pauseBattle();
     const observations=count===300?(speed===10?20:38):18,stamps=[],started=performance.now(),minElapsed=count===300?10000:0;let censored=false;
     await new Promise(resolve=>{
      let done=false;const timer=setTimeout(()=>{if(!done){done=true;censored=true;resolve()}},60000);
      function frame(now){if(done)return;stamps.push(now);if(stamps.length>=observations+1&&performance.now()-started>=minElapsed){done=true;clearTimeout(timer);resolve();return}requestAnimationFrame(frame)}
      requestAnimationFrame(frame);
     });
     const a=stamps.slice(1).map((v,i)=>v-stamps[i]),state=ShowdownAdapter.getState(),rp=ShowdownQA.renderProfile().slice(-Math.max(observations,20)).map(x=>x.total).filter(Number.isFinite);
     return{population:before.units.length,alive:state.units.filter(u=>u.hp>0).length,frames:a.length,censored:censored||a.length<observations,
      tick:state.debug?.tick||0,snapshotHp:state.units.reduce((s,u)=>s+u.hp,0),startHp,progressed:!!state.debug?.tick&&state.units.reduce((s,u)=>s+u.hp,0)<startHp,
      p50IntervalMs:[...a].sort((x,y)=>x-y)[Math.floor((a.length-1)*.5)]||null,p95IntervalMs:[...a].sort((x,y)=>x-y)[Math.floor((a.length-1)*.95)]||null,
      renderP95Ms:[...rp].sort((x,y)=>x-y)[Math.floor((rp.length-1)*.95)]||null,
      elapsedMs:performance.now()-started,worker:window.__showdownThreadStats||null,
       backingScale:(document.querySelector('#battleCanvas').width/Math.max(1,document.querySelector('#battleCanvas').getBoundingClientRect().width))};
    },{count,speed,rep});
    assert.equal(data.population,count,'true source match population');assert(data.frames>=12&&!data.censored,'not enough uncensored real RAF samples');
    if(count===300){
      assert(data.progressed&&data.tick>25&&data.renderP95Ms!==null,'real 300 HP combat and visible renderer must progress');
      const expected=mode==='worker'?(speed===10?.85:.75):(speed===10?.85:1);
      assert(Math.abs(data.backingScale-expected)<.025,'actual original/candidate canvas backing scale mismatch: '+data.backingScale+' / '+expected);
      await page.screenshot({path:path.join(output,mode+'-speed'+speed+'-seed'+rep+'.png')});
    }
    if(mode==='worker'&&count<=120)assert(data.worker?.mode==='inline','80/120 must keep original inline engine');
    if(mode==='worker'&&count===300){
     assert(data.worker?.mode==='worker'&&data.worker.workerSnapshots>=3&&!data.worker.errors.length,'worker did not emit multiple real states');
     assert(data.worker?.physicalStats?.targetBuilds>0&&data.worker?.physicalStats?.collisionPasses>0,'actual optimized target+contact Worker not active');
     assert(data.progressed&&data.tick>25,'worker failed to advance genuine HP-damaging combat');
    }
    return{mode,count,speed,rep,rasterIntercepted,...data,actualTicksPerSecond:+(data.tick/(data.elapsedMs/1000)).toFixed(2),errors};
   }finally{await page.close()}
  }
  // Alternating same-host order at both speeds. 80/120 controls never trigger worker.
  for(let rep=0;rep<2;rep++)for(const speed of [1,10]){
   const values={},order=rep===0?['current','worker']:['worker','current'];
   for(const mode of order){values[mode]=await trial(mode,300,speed,rep);console.log('300 WORKER RASTER CASE '+JSON.stringify(values[mode]))}
   result.cases.push({rep,speed,count:300,order,current:values.current,worker:values.worker,ratio:values.worker.p95IntervalMs/values.current.p95IntervalMs});
  }
  for(const count of [80,120])for(const speed of [1,10]){
   const candidate=await trial('worker',count,speed,0);result.cases.push({count,speed,control:candidate});console.log('COMBINED EXACT WORKER CONTROL '+JSON.stringify(candidate));
  }
  result.passed=result.cases.every(x=>x.control||x.worker?.worker?.errors?.length===0);result.failures.push(...result.cases.flatMap(x=>(x.control?[x.control]:[x.current,x.worker]).flatMap(v=>v.errors)));
  assert.deepEqual(result.failures,[],'browser/worker fatal errors');
  result.promotionEligible=result.cases.filter(x=>x.count===300).every(c=>
    c.ratio<=.80 && c.worker.actualTicksPerSecond>=c.current.actualTicksPerSecond*.95 &&
    !c.worker.censored && c.worker.progressed && c.worker.worker.workerSnapshots>=3);
  console.log('COMBINED EXACT WORKER DECISION '+JSON.stringify({promotionEligible:result.promotionEligible,
    pairs:result.cases.filter(x=>x.count===300).map(c=>({speed:c.speed,rep:c.rep,
      baselineP95:c.current.p95IntervalMs,workerP95:c.worker.p95IntervalMs,ratio:c.ratio,
      baselineTPS:c.current.actualTicksPerSecond,workerTPS:c.worker.actualTicksPerSecond}))}));
  console.log('COMBINED EXACT WORKER ACTUAL '+JSON.stringify(result.cases.filter(x=>x.count===300).map(x=>({speed:x.speed,rep:x.rep,currentP95:x.current.p95IntervalMs,workerP95:x.worker.p95IntervalMs,ratio:x.ratio,currentTps:x.current.actualTicksPerSecond,workerTps:x.worker.actualTicksPerSecond,currentTick:x.current.tick,workerTick:x.worker.tick,currentHP:x.current.snapshotHp,workerHP:x.worker.snapshotHp,workerStates:x.worker.worker?.workerSnapshots,censored:[x.current.censored,x.worker.censored]}))));
 }finally{fs.writeFileSync(path.join(output,'fast300-worker-raster-study.json'),JSON.stringify(result,null,2)+'\n');await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1}).finally(()=>server.close());
