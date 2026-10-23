'use strict';
// Browser-real source A/B, source-only candidate delivered via CDP intercept.
// Preserve original game/UI, 300 fighter portraits, all FX, real canvas path.
// This is Chromium/Linux NOT iPhone Safari. No browser runtime files rewritten.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'../..'),output=path.resolve(process.env.QA_TURN19_PROFILE_OUTPUT||'/tmp/turn19-mainthread-profile');
fs.mkdirSync(output,{recursive:true});
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),original=read('v3/legacy-sim-core.js');
// Separate actual browser frame latency, physical step CPU, adapter receive,
// and Chrome sampled JavaScript self-time without changing any combat mechanics.
const instrumented=original
 .replace("function step(){","function step(){const __stepStarted=performance.now();")
 .replace("separate(false)}function winner(){","separate(false);const s=window.__real300Timing.steps;s.push(performance.now()-__stepStarted);if(s.length>12000)s.shift()}function winner(){")
 .replace("try{onState(snapshot)}catch(err){","try{const __pubStarted=performance.now();onState(snapshot);const s=window.__real300Timing.publish;s.push(performance.now()-__pubStarted);if(s.length>1200)s.shift()}catch(err){");
const candidate=instrumented.replace("(()=>{'use strict';","(()=>{'use strict';window.__real300Timing={steps:[],publish:[]};");
assert(candidate!==original&&candidate.includes("__real300Timing.steps")&&candidate.includes("__real300Timing.publish"),'source instrumentation missing');
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(u.pathname).replace(/\/$/,'/index.html'),file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 try{res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
 catch{res.writeHead(404);res.end()}
});
const percentile=(a,q)=>{const xs=[...a].sort((a,b)=>a-b);return xs.length?xs[Math.min(xs.length-1,Math.floor((xs.length-1)*q))]:null};
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await puppeteer.launch({headless:true,executablePath:process.env.QA_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const report={sha:process.env.GITHUB_SHA||'',browser:await browser.version(),viewport:'430x932 DPR3',kind:'actual Chromium single game 300, 1x/10x sampled CDP CPU profiler plus real RAF+step and publish timing; NOT Safari',cases:[],failures:[]};
 try{
 async function run(arm,speed,rep){
  const page=await browser.newPage();let intercepted=0;
  try{
   await page.setBypassServiceWorker(true);
   await page.setViewport({width:430,height:932,deviceScaleFactor:3,isMobile:true,hasTouch:true});
   await page.setRequestInterception(true);
   page.on('request',req=>{
    if(/\/v3\/legacy-sim-core\.js\?/.test(req.url())){intercepted++;return req.respond({status:200,contentType:'text/javascript',body:candidate})}
    return req.continue();
   });
   page.on('pageerror',e=>report.failures.push(arm+': '+e.message));
   await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&window.ShowdownQA&&window.ShowdownAdapter,{timeout:90000});
   assert.equal(intercepted,1,'expected exactly one complete real core load');
   await page.click('[data-mode="quick"]');
   if(await page.$('.screen-ready.active'))await page.click('.screen-ready [data-go="battle"]');
   await page.waitForFunction(()=>ShowdownQA.snapshot().screen==='battle',{timeout:20000});
   const client=await page.target().createCDPSession();await client.send('Profiler.enable');await client.send('Profiler.setSamplingInterval',{interval:1000});await client.send('Profiler.start');
   const result=await page.evaluate(async({speed,rep})=>{
    const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'],army=Object.fromEntries(types.map(t=>[t,15])),levels=Object.fromEntries(types.map((t,i)=>[t,[1,4,5][i%3]]));
    ShowdownAdapter.startMatch({blue:army,red:army,blueLevels:levels,redLevels:levels,blueLives:1,redLives:1,seed:81337+rep});
    ShowdownAdapter.setSpeed(1);ShowdownAdapter.pauseBattle();
    await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
    const initial=ShowdownAdapter.getState();
    ShowdownQA.clearRenderProfile();
    ShowdownAdapter.setSpeed(speed);ShowdownAdapter.pauseBattle();
    const count=speed===10?20:38,stamps=[],begun=performance.now(),minElapsed=10000;
    let timedOut=false;
    await new Promise(resolve=>{
      let done=false;const timer=setTimeout(()=>{if(!done){done=true;timedOut=true;resolve()}},80000);
      function tick(t){if(done)return;stamps.push(t);if(stamps.length>=count+1&&performance.now()-begun>=minElapsed){done=true;clearTimeout(timer);resolve();return}requestAnimationFrame(tick)}
      requestAnimationFrame(tick);
    });
    const deltas=stamps.slice(1).map((x,i)=>x-stamps[i]);const ordered=[...deltas].sort((a,b)=>a-b),p=q=>ordered[Math.min(ordered.length-1,Math.floor((ordered.length-1)*q))]||null;
    const canvasSamples=ShowdownQA.renderProfile().slice(-count).map(v=>v.total).filter(Number.isFinite),sorted=[...canvasSamples].sort((a,b)=>a-b);
    const after=ShowdownAdapter.getState();return{startHp:initial.units.reduce((s,u)=>s+u.hp,0),endHp:after.units.reduce((s,u)=>s+u.hp,0),count:initial.units.length,active:after.units.filter(x=>x.hp>0).length,frames:deltas.length,censored:timedOut||deltas.length<count,elapsedMs:performance.now()-begun,p50IntervalMs:p(.5),p95IntervalMs:p(.95),renderP95Ms:sorted[Math.floor((sorted.length-1)*.95)]||null,tick:after.debug?.tick||0,actualTicksPerSecond:+((after.debug?.tick||0)/((performance.now()-begun)/1000)).toFixed(2),stepDurations:window.__real300Timing.steps,publishDurations:window.__real300Timing.publish};
   },{speed,rep});
   const {profile}=await client.send('Profiler.stop');await client.detach();
   const map=new Map(profile.nodes.map(n=>[n.id,n])),hits=new Map();
   for(const id of profile.samples||[]){const n=map.get(id);if(!n)continue;const name=n.callFrame.functionName||'(anonymous)',key=name+' @ '+n.callFrame.url.split('/').pop();hits.set(key,(hits.get(key)||0)+1)}
   const samples=[...hits].sort((a,b)=>b[1]-a[1]).slice(0,35).map(([functionName,count])=>({functionName,count}));
   const percentile=(v,p)=>{const a=[...v].sort((x,y)=>x-y);return a.length?a[Math.floor((a.length-1)*p)]:null};
   const cpu={samplesTotal:profile.samples?.length||0,top:samples,step:{count:result.stepDurations.length,p50:percentile(result.stepDurations,.5),p95:percentile(result.stepDurations,.95),total:result.stepDurations.reduce((a,b)=>a+b,0)},publish:{count:result.publishDurations.length,p50:percentile(result.publishDurations,.5),p95:percentile(result.publishDurations,.95),total:result.publishDurations.reduce((a,b)=>a+b,0)}};
   delete result.stepDurations;delete result.publishDurations;
   console.log('TURN19 MAINTHREAD PROFILE CPU '+JSON.stringify({speed,rep,cpu}));
   console.log('TURN19 MAINTHREAD PROFILE RAW '+JSON.stringify({arm,speed,rep,...result}));assert.equal(result.count,300,'actual 300 deployed fighters required');
   assert(!result.censored&&result.frames>=(speed===10?20:38),'insufficient uncensored real RAF observations');assert(result.endHp<result.startHp&&result.tick>25,'actual simulation must advance and inflict damage');
   return{arm,speed,rep,intercepted,...result,cpu};
  }finally{await page.close()}
 }
 for(const speed of [1,10]){
  const r=await run('profile',speed,0);
  report.cases.push({speed,...r});
 }
 assert.deepEqual(report.failures,[]);
 report.passed=true;
 console.log('TURN19 PROFILE FINISHED '+JSON.stringify(report.cases.map(x=>({speed:x.speed,p95IntervalMs:x.p95IntervalMs,realTickPerSecond:x.actualTicksPerSecond,cpu:x.cpu}))));
 }finally{fs.writeFileSync(path.join(output,'turn19-mainthread-profile.json'),JSON.stringify(report,null,2)+'\n');await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1}).finally(()=>server.close());
