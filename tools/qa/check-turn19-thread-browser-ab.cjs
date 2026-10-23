'use strict';
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'../..'),output=path.resolve(process.env.QA_TURN19_BROWSER_OUTPUT||'/tmp/turn19-browser');
fs.mkdirSync(output,{recursive:true});
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
 const browser=await puppeteer.launch({headless:true,executablePath:process.env.QA_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const result={sha:process.env.GITHUB_SHA||'',browser:await browser.version(),viewport:'430x932 DPR3',kind:'real Chromium RAF source-only classic worker bridge / original, not Safari',cases:[],failures:[]};
 try{
  async function trial(mode,count,speed,rep){
   const page=await browser.newPage(),errors=[];
   try{
    await page.setBypassServiceWorker(true);
    await page.setViewport({width:430,height:932,deviceScaleFactor:3,isMobile:true,hasTouch:true});
    page.on('pageerror',e=>errors.push('page: '+(e.stack||e.message)));
    page.on('workercreated',w=>w.on('error',e=>errors.push('worker: '+e.message)));
    await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&window.ShowdownQA&&window.ShowdownAdapter,{timeout:90000});
    if(mode==='worker')await page.addScriptTag({url:'/tools/qa/turn19-thread-bridge.js'});
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
     const observations=count===300?(speed===10?20:38):18,stamps=[],started=performance.now(),minElapsed=count===300?5500:0;let censored=false;
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
      elapsedMs:performance.now()-started,worker:window.__showdownThreadStats||null};
    },{count,speed,rep});
    assert.equal(data.population,count,'true source match population');assert(data.frames>=12,'not enough real RAF samples');
    if(mode==='worker'&&count===300){
     assert(data.worker?.workerSnapshots>=3&&!data.worker.errors.length,'worker did not emit multiple real states');
     assert(data.progressed&&data.tick>25,'worker failed to advance genuine HP-damaging combat');
    }
    return{mode,count,speed,rep,...data,actualTicksPerSecond:+(data.tick/(data.elapsedMs/1000)).toFixed(2),errors};
   }finally{await page.close()}
  }
  // Alternating same-host order at both speeds. 80/120 controls never trigger worker.
  for(let rep=0;rep<2;rep++)for(const speed of [1,10]){
   const values={},order=rep===0?['current','worker']:['worker','current'];
   for(const mode of order){values[mode]=await trial(mode,300,speed,rep);console.log('TURN19 RAF CASE '+JSON.stringify(values[mode]))}
   result.cases.push({rep,speed,count:300,order,current:values.current,worker:values.worker,ratio:values.worker.p95IntervalMs/values.current.p95IntervalMs});
  }
  for(const count of [80,120])for(const speed of [1,10]){
   const candidate=await trial('worker',count,speed,0);result.cases.push({count,speed,control:candidate});console.log('TURN19 CONTROL '+JSON.stringify(candidate));
  }
  result.passed=result.cases.every(x=>x.control||x.worker?.worker?.errors?.length===0);result.failures.push(...result.cases.flatMap(x=>(x.control?[x.control]:[x.current,x.worker]).flatMap(v=>v.errors)));
  assert.deepEqual(result.failures,[],'browser/worker fatal errors');
  console.log('TURN19 WORKER RAF MATCHED '+JSON.stringify(result.cases.filter(x=>x.count===300).map(x=>({speed:x.speed,rep:x.rep,currentP95:x.current.p95IntervalMs,workerP95:x.worker.p95IntervalMs,ratio:x.ratio,currentTps:x.current.actualTicksPerSecond,workerTps:x.worker.actualTicksPerSecond,currentTick:x.current.tick,workerTick:x.worker.tick,currentHP:x.current.snapshotHp,workerHP:x.worker.snapshotHp,workerStates:x.worker.worker?.workerSnapshots,censored:[x.current.censored,x.worker.censored]}))));
 }finally{fs.writeFileSync(path.join(output,'turn19-thread-raf.json'),JSON.stringify(result,null,2)+'\n');await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1}).finally(()=>server.close());
