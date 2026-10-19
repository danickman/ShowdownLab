'use strict';
// Browser-real source A/B, source-only candidate delivered via CDP intercept.
// Preserve original game/UI, 300 fighter portraits, all FX, real canvas path.
// This is Chromium/Linux NOT iPhone Safari. No browser runtime files rewritten.
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('node:assert/strict');
const puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'../..'),output=path.resolve(process.env.QA_TURN19_CANVAS_BROWSER_OUTPUT||'/tmp/turn19-canvas-scale-browser');
fs.mkdirSync(output,{recursive:true});
const read=p=>fs.readFileSync(path.join(root,p),'utf8'),original=read('v3/legacy-sim-core.js');
const originalArt=read('v3/v3.js'),marker="function draw(time){if(current!=='battle'||!cam)return;",replacement="function draw(time){if(current!=='battle'||!cam)return;const __denseScale=state.units.length>=160?((state.speed||1)>=10?.85:1):Math.min(devicePixelRatio||1,2),__bw=Math.round(view.w*__denseScale),__bh=Math.round(view.h*__denseScale);if(canvas.width!==__bw||canvas.height!==__bh){canvas.width=__bw;canvas.height=__bh;ctx.setTransform(__denseScale,0,0,__denseScale,0,0);}";assert.equal(originalArt.split(marker).length,2,'battle draw entry changed');const candidate=originalArt.replace(marker,replacement);assert(candidate.includes('__denseScale'),'dynamic viewport candidate');
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
 const report={sha:process.env.GITHUB_SHA||'',browser:await browser.version(),viewport:'430x932 DPR3',kind:'real Chromium 300 fullFX DPR3 viewport, original vs low-resolution battle canvas, unchanged core physics; not Safari',cases:[],failures:[]};
 try{
 async function run(arm,speed,rep){
  const page=await browser.newPage();let intercepted=0;
  try{
   await page.setBypassServiceWorker(true);
   await page.setViewport({width:430,height:932,deviceScaleFactor:3,isMobile:true,hasTouch:true});
   await page.setRequestInterception(true);
   page.on('request',req=>{
    if(/\/v3\/v3\.js\?/.test(req.url())){intercepted++;return req.respond({status:200,contentType:'text/javascript',body:arm==='canvas'?candidate:originalArt})}
    return req.continue();
   });
   page.on('pageerror',e=>report.failures.push(arm+': '+e.message));
   await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&window.ShowdownQA&&window.ShowdownAdapter,{timeout:90000});
   assert.equal(intercepted,1,'expected one actual battle theatre intercept');
   await page.click('[data-mode="quick"]');
   if(await page.$('.screen-ready.active'))await page.click('.screen-ready [data-go="battle"]');
   await page.waitForFunction(()=>ShowdownQA.snapshot().screen==='battle',{timeout:20000});
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
    const after=ShowdownAdapter.getState(),cv=document.querySelector('#battleCanvas');return{canvasPixels:[cv.width,cv.height],startHp:initial.units.reduce((s,u)=>s+u.hp,0),endHp:after.units.reduce((s,u)=>s+u.hp,0),count:initial.units.length,active:after.units.filter(x=>x.hp>0).length,frames:deltas.length,censored:timedOut||deltas.length<count,elapsedMs:performance.now()-begun,p50IntervalMs:p(.5),p95IntervalMs:p(.95),renderP95Ms:sorted[Math.floor((sorted.length-1)*.95)]||null,tick:after.debug?.tick||0,actualTicksPerSecond:+((after.debug?.tick||0)/((performance.now()-begun)/1000)).toFixed(2)};
   },{speed,rep});
   console.log('TURN19 CANVAS BROWSER RAW '+JSON.stringify({arm,speed,rep,...result}));assert.equal(result.count,300,'actual 300 deployed fighters required');
   assert(!result.censored&&result.frames>=(speed===10?20:38),'insufficient uncensored real RAF observations');if(arm==='canvas')assert(result.canvasPixels[0]<=(speed===10?400:500),'dense candidate must genuinely reduce canvas backing');assert(result.endHp<result.startHp&&result.tick>25,'actual simulation must advance and inflict damage');
   return{arm,speed,rep,intercepted,...result};
  }finally{await page.close()}
 }
 for(let rep=0;rep<2;rep++)for(const speed of [1,10]){
  const order=rep===0?['current','canvas']:['canvas','current'],values={};
  for(const arm of order){const result=await run(arm,speed,rep);values[arm]=result;console.log('TURN19 CANVAS BROWSER CASE '+JSON.stringify(result))}
  report.cases.push({rep,speed,order,current:values.current,canvas:values.canvas,ratio:values.canvas.p95IntervalMs/values.current.p95IntervalMs});
 }
 assert.deepEqual(report.failures,[]);
 for(const c of report.cases){
  const oldRate=c.current.tick/(c.current.elapsedMs/1000),canvasRate=c.canvas.tick/(c.canvas.elapsedMs/1000);
  assert(canvasRate>=.85*oldRate,'REJECT insufficient 300 true physics tick throughput at '+c.speed+'x: '+canvasRate.toFixed(2)+' vs '+oldRate.toFixed(2));
  assert(c.ratio<=.60,'REJECT insufficient >=40% genuine Chromium 300 P95 gain at '+c.speed+'x: '+c.ratio.toFixed(3));
 }
 report.passed=true;
 console.log('TURN19 CANVAS BROWSER MATCHED '+JSON.stringify(report.cases.map(x=>({rep:x.rep,speed:x.speed,currentP95:x.current.p95IntervalMs,canvasP95:x.canvas.p95IntervalMs,ratio:+x.ratio.toFixed(3),censored:[x.current.censored,x.canvas.censored]}))));
 }finally{fs.writeFileSync(path.join(output,'turn19-canvas-scale-browser.json'),JSON.stringify(report,null,2)+'\n');await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1}).finally(()=>server.close());
