'use strict';
// Browser-only viewport/frame budget evidence for iPhone 14 Pro Max portrait, 430x932 DPR3.
// NOT iPhone Safari: do not claim phone FPS, battery or touch success.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'../..'),out=path.resolve(process.env.QA_DENSITY_OUTPUT||'/tmp/showdown-density-browser');
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(url.pathname).replace(/\/$/,'/index.html');
 const file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 try{res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
 catch{res.writeHead(404);res.end()}
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await puppeteer.launch({headless:true,executablePath:process.env.QA_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const report={browser:await browser.version(),targetDevice:'iPhone 14 Pro Max (portrait viewport emulation only)',viewport:{width:430,height:932,dpr:3},note:'Chromium/Linux emulated mobile CSS/Canvas. NOT physical iPhone/Safari FPS, GPU power, memory or battery.',cases:[],failures:[]};
 try{
  const page=await browser.newPage();
  page.on('pageerror',e=>report.failures.push('page: '+e.message));
  await page.setViewport({width:430,height:932,deviceScaleFactor:3,isMobile:true,hasTouch:true});
  await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&window.ShowdownQA&&window.ShowdownAdapter,{timeout:90000});
  await page.click('[data-mode="quick"]');
  if(await page.$('.screen-ready.active'))await page.click('.screen-ready [data-go="battle"]');
  await page.waitForFunction(()=>ShowdownQA.snapshot().screen==='battle',{timeout:20000});
  const counts=(process.env.QA_DENSITY_COUNTS||'40,80,120,180,300').split(',').map(Number);
  assert(counts.length&&counts.every(x=>[40,80,120,180,300].includes(x)));
  for(const count of counts){
   // Explicit per-species mixed fighters, identical symmetric counts and L1/L4/L5.
   const trial=await page.evaluate(async count=>{
    const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
    const perSide=count/2;
    const make=()=>{const o={};for(let i=0;i<perSide;i++)o[types[i%10]]=(o[types[i%10]]||0)+1;return o};
    const blue=make(),red=make(),levels=Object.fromEntries(types.map((t,i)=>[t,[1,4,5][i%3]]));
    ShowdownAdapter.startMatch({blue,red,blueLevels:levels,redLevels:levels,blueLives:4,redLives:4,seed:81337});
    ShowdownAdapter.setSpeed(1);
    // Capture ALL 300 bodies at the same unadvanced deployment state; later
    // timed screenshots are expected to have casualties and cannot prove it.
    ShowdownAdapter.pauseBattle();
    ShowdownQA.clearRenderProfile();
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const s=ShowdownQA.snapshot();
    const rect=document.querySelector('#battleCanvas').getBoundingClientRect();
    return{count:s.units.length,arena:s.arena,canvas:{width:rect.width,height:rect.height,backingWidth:document.querySelector('#battleCanvas').width,backingHeight:document.querySelector('#battleCanvas').height},assetStatus:typeof FighterAssets.assetStatus==='function'?FighterAssets.assetStatus():null};
   },count);
   assert.equal(trial.count,count,'browser adapter lost fighter objects at deployment');
   if([40,120,300].includes(count)){
    await page.screenshot({path:path.join(out,'density-deploy-'+count+'-portrait.png')});
   }
   await page.evaluate(()=>ShowdownAdapter.pauseBattle()); // Resume only after the intact deployment capture.
   // Frame sampling intentionally short at stress densities; bounded wall time and
   // censored samples are reported instead of fabricating a full-match FPS.
   const speeds=count===300?[1,10]:[1,10];
   for(const speed of speeds){
    const result=await page.evaluate(async({count,speed})=>{
     ShowdownAdapter.setSpeed(speed);
     ShowdownQA.clearRenderProfile();
     const wanted=speed===10?count>=180?12:30:count>=180?28:60;
     const timestamps=[],start=performance.now();
     await new Promise(resolve=>{
      let done=false,deadline=setTimeout(()=>{if(!done){done=true;resolve()}},18000);
      function frame(t){if(done)return;timestamps.push(t);if(timestamps.length>=wanted+1){done=true;clearTimeout(deadline);resolve();return}requestAnimationFrame(frame)}
      requestAnimationFrame(frame);
     });
     const elapsed=performance.now()-start;
     const frames=timestamps.slice(1).map((t,i)=>t-timestamps[i]).sort((a,b)=>a-b);
     const percentile=(x,q)=>x.length?+(x[Math.min(x.length-1,Math.floor((x.length-1)*q))]||0).toFixed(2):null;
     const passes=ShowdownQA.renderProfile().slice(-Math.max(1,wanted+2));
     const timings={};for(const name of ['total','setup','arena','fighters','effects','overlay']){
      const p=passes.map(o=>o[name]).filter(Number.isFinite).sort((a,b)=>a-b);
      timings[name]={count:p.length,p50Ms:percentile(p,.5),p95Ms:percentile(p,.95)};
     }
     const s=ShowdownQA.snapshot(),a=s.arena,units=s.units.filter(u=>u.box),viewport={width:innerWidth,height:innerHeight};
     let clipped=0,outsideViewport=0,outsideWorld=0;const contact=new Set(),rendered=new Set();
     for(const u of units){
      if(u.box.left<a.x-2||u.box.right>a.x+a.w+2||u.box.top<a.y-2||u.box.bottom>a.y+a.h+2)clipped++;
      if(u.screenX<0||u.screenX>innerWidth||u.screenY<0||u.screenY>innerHeight)outsideViewport++;
      if(u.x<0||u.x>1||u.y<0||u.y>1)outsideWorld++;
      rendered.add(Math.max(0,Math.min(3,Math.floor(u.screenX/Math.max(1,innerWidth)*4)))+':'+Math.max(0,Math.min(2,Math.floor(u.screenY/Math.max(1,innerHeight)*3))));
     }
     const cv=document.querySelector('#battleCanvas'),cr=cv.getBoundingClientRect();
     return{rasterScale:+(cv.width/Math.max(1,cr.width)).toFixed(3),speed,frames:frames.length,targetFrames:wanted,censored:frames.length<wanted,elapsedMs:+elapsed.toFixed(2),
      p50IntervalMs:percentile(frames,.5),p95IntervalMs:percentile(frames,.95),over33Ms:frames.filter(x=>x>33.3).length,
      over100Ms:frames.filter(x=>x>100).length,timings,
      onScreen:s.screen,phase:s.phase,aliveOrDrawn:units.length,clippedSpriteBoxes:clipped,outsideViewportCenters:outsideViewport,outsideNormalizedWorld:outsideWorld,occupiedViewportCells:rendered.size,effects:s.effects,viewport};
    },{count,speed});
    report.cases.push({population:count,initial:trial,...result});
    // Keep screenshots for key densities only; do not overwhelm CI artifact quotas.
    if(speed===1&&[40,120,300].includes(count)){
     await page.screenshot({path:path.join(out,'density-'+count+'-portrait.png')});
    }
    assert(result.frames>0,'browser RAF did not produce frames at '+count+' fighters '+speed+'x');
    const expectedScale=count>=160?(speed>=10?.85:1):2;
    assert(Math.abs(result.rasterScale-expectedScale)<.05,'real browser backing scale mismatch at '+count+' units '+speed+'x: '+result.rasterScale+' expected '+expectedScale);
    assert(result.onScreen==='battle'||result.phase==='round_over'||result.phase==='match_over','browser navigated away unexpectedly');
    console.log('DENSITY BROWSER '+JSON.stringify({count,speed,frames:result.frames,p95IntervalMs:result.p95IntervalMs,renderP95Ms:result.timings.total.p95Ms,alive:result.aliveOrDrawn,clipped:result.clippedSpriteBoxes,censored:result.censored}));
   }
  }
  // Profile *after* timing the density sweep: CDP sampling otherwise skews
  // frame budget measurement. Attribution identifies the next real bottleneck.
  await page.evaluate(()=>{
   const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
   const large=Object.fromEntries(types.map(t=>[t,15]));
   const stages=Object.fromEntries(types.map((t,i)=>[t,[1,4,5][i%3]]));
   ShowdownAdapter.startMatch({blue:large,red:large,blueLevels:stages,redLevels:stages,blueLives:1,redLives:1,seed:81337});
   ShowdownAdapter.setSpeed(1);
  });
  const cpuSession=await page.createCDPSession();
  await cpuSession.send('Profiler.enable');
  await cpuSession.send('Profiler.setSamplingInterval',{interval:1000});
  await cpuSession.send('Profiler.start');
  const cpuStart=Date.now();
  await page.evaluate(()=>new Promise(resolve=>{
   let frames=0;
   const onFrame=()=>{if(++frames>=16)resolve();else requestAnimationFrame(onFrame)};
   requestAnimationFrame(onFrame);
  }));
  const {profile}=await cpuSession.send('Profiler.stop');
  await cpuSession.detach();
  fs.writeFileSync(path.join(out,'density-300-1x.cpuprofile'),JSON.stringify(profile));
  const names=new Map();
  for(const node of profile.nodes||[]){
   const key=node.callFrame?.functionName||'(anonymous)',url=(node.callFrame?.url||'').split('/').pop();
   if(!node.hitCount)continue;
   const label=url+':'+key;
   names.set(label,(names.get(label)||0)+node.hitCount);
  }
  const hotspots=[...names].map(([name,hits])=>({name,hits})).sort((a,b)=>b.hits-a.hits).slice(0,20);
  report.cpuProfile={population:300,speed:1,frames:16,elapsedMs:Date.now()-cpuStart,
   samples:profile.samples?.length||0,topSelfSamples:hotspots,note:'CDP V8 profiler, sampled after density timing; includes JS and profiler overhead. Not Safari.'};
  assert(report.cpuProfile.samples>0,'Chromium V8 CPU profile contains no samples');
  console.log('DENSITY CPU HOTSPOTS '+JSON.stringify(report.cpuProfile));
  // The 300 stress sweep can leave a *real* between-rounds draft overlay
  // on top of the battle. Re-enter a fresh Quick Match UI before asserting
  // that the QUAKE control is physically hittable by a touch.
  await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&window.ShowdownQA&&window.ShowdownAdapter,{timeout:90000});
  // Use the genuine Ultimate Lab entry point: its spells are available
  // without manipulating the Quick Match permanent unlock state.
  await page.click('[data-go="lab"]');
  await page.waitForSelector('[data-screen="lab"].active #labRun');
  await page.click('#labRun');
  await page.waitForFunction(()=>ShowdownQA.snapshot().screen==='battle',{timeout:20000});
  // Real original physics QUAKE cast: actual Lab-mode clickable spell.
  await page.evaluate(()=>{
   ShowdownAdapter.startMatch({blue:{knight:20},red:{knight:20},blueLives:1,redLives:1,seed:42026});
   ShowdownAdapter.setSpeed(1);
   window.__quakeSpellQA=null;window.__quakeClickQA=0;window.__quakeRibbonQA=false;
   addEventListener('showdown:spell',e=>{if(e.detail?.spell==='quake')window.__quakeSpellQA={spell:'quake',power:e.detail.power}},{once:true});
   const button=document.querySelector('[data-spell="quake"]');
   button.addEventListener('click',()=>window.__quakeClickQA++,{capture:true,once:true});
   new MutationObserver(()=>{if(document.querySelector('.ability-callout.spell-quake'))window.__quakeRibbonQA=true})
     .observe(document.querySelector('.screen-battle'),{childList:true,subtree:true});
  });
  await page.waitForFunction(()=>{
    if(ShowdownQA.snapshot().phase!=='battle'||!ShowdownAdapter.getState().playing)return false;
    const b=document.querySelector('[data-spell="quake"]');if(!b||b.disabled||b.hidden)return false;
    const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);
    return hit===b||b.contains(hit);
  },{timeout:12000});
  await page.screenshot({path:path.join(out,'quake-before-430.png')});
  await page.click('[data-spell="quake"]');
  const castDiagnostic=await page.evaluate(()=>({
    clickCount:window.__quakeClickQA,cast:window.__quakeSpellQA,observedRibbon:window.__quakeRibbonQA,
    adapter:{phase:ShowdownAdapter.getState().phase,playing:ShowdownAdapter.getState().playing,
      enemies:ShowdownAdapter.getState().units.filter(u=>u.team==='red'&&u.hp>0).length},
    cooling:document.querySelector('[data-spell="quake"]').classList.contains('cooling')
  }));
  console.log('QUAKE TOUCH RECEIPT '+JSON.stringify(castDiagnostic));
  assert.equal(castDiagnostic.clickCount,1,'actual Lab QUAKE touch reached the button');
  assert.equal(castDiagnostic.cast?.spell,'quake','actual QUAKE touch triggered live engine cast');
  assert(castDiagnostic.observedRibbon,'real QUAKE DOM callout appeared during cast');
  await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,180)));
  await page.screenshot({path:path.join(out,'quake-impact-430.png')});
  await page.evaluate(()=>ShowdownAdapter.pauseBattle());
  await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,980)));
  await page.screenshot({path:path.join(out,'quake-fractures-430.png')});
  report.quakeCast=await page.evaluate(()=>({spell:window.__quakeSpellQA,screen:ShowdownQA.snapshot().screen,mode:document.body.dataset.gameMode,clicks:window.__quakeClickQA}));
  assert.equal(report.quakeCast.spell?.spell,'quake','real current-source QUAKE cast');
  console.log('PASS: actual 40-unit QUAKE cast/impact and persistent arena screenshot receipts');
  // Genuine touch-cast visibility probes for all remaining spells, using
  // current LIVE Ultimate Lab controls (never simulated pixels/unlocked Quick
  // buttons). Reset each match to avoid residue and enforce true physics.
  report.spellGallery=[];
  for(const kind of ['zap','heal','aegis']){
    await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1&spell='+kind,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&window.ShowdownAdapter&&window.ShowdownQA,{timeout:90000});
    await page.click('[data-go="lab"]');await page.waitForSelector('[data-screen="lab"].active #labRun');
    await page.click('#labRun');await page.waitForFunction(()=>ShowdownQA.snapshot().screen==='battle',{timeout:20000});
    await page.evaluate(kind=>{
      ShowdownAdapter.startMatch({blue:{knight:20},red:{knight:20},blueLives:1,redLives:1,seed:48000+kind.length});
      ShowdownAdapter.setSpeed(1);
      window.__spellCastQA=null;window.__spellTouchQA=0;window.__spellCalloutQA=false;
      addEventListener('showdown:spell',e=>{if(e.detail?.spell===kind)window.__spellCastQA={spell:e.detail.spell,power:e.detail.power,amount:e.detail.amount,targets:e.detail.targets||1}},{once:true});
      document.querySelector('[data-spell="'+kind+'"]').addEventListener('click',()=>window.__spellTouchQA++,{capture:true,once:true});
      new MutationObserver(()=>{if(document.querySelector('.ability-callout.spell-'+kind))window.__spellCalloutQA=true})
        .observe(document.querySelector('.screen-battle'),{childList:true,subtree:true});
    },kind);
    await page.waitForFunction(kind=>{
      if(ShowdownQA.snapshot().phase!=='battle'||!ShowdownAdapter.getState().playing)return false;
      const b=document.querySelector('[data-spell="'+kind+'"]');if(!b||b.disabled||b.hidden)return false;
      const r=b.getBoundingClientRect(),hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
      return hit===b||b.contains(hit);
    },{timeout:12000},kind);
    await page.screenshot({path:path.join(out,'spell-'+kind+'-before-430.png')});
    await page.click('[data-spell="'+kind+'"]');
    const receipt=await page.evaluate(()=>({touch:window.__spellTouchQA,cast:window.__spellCastQA,callout:window.__spellCalloutQA,
      playing:ShowdownAdapter.getState().playing,redAlive:ShowdownAdapter.getState().units.filter(u=>u.team==='red'&&u.hp>0).length}));
    assert.equal(receipt.touch,1,kind+' touch dispatched');
    assert.equal(receipt.cast?.spell,kind,kind+' actual original physics cast');
    assert(receipt.callout,kind+' real DOM ribbon');
    await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,185)));
    await page.screenshot({path:path.join(out,'spell-'+kind+'-impact-430.png')});
    await page.evaluate(()=>ShowdownAdapter.pauseBattle());
    await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,900)));
    await page.screenshot({path:path.join(out,'spell-'+kind+'-aftermath-430.png')});
    report.spellGallery.push({kind,...receipt});
    console.log('LIVE SPELL QA '+JSON.stringify({kind,...receipt}));
  }
  console.log('PASS: source-native ARC/BLOOM/AEGIS Lab touch casts, real callouts and nine Chromium viewport receipts');
  assert.deepEqual(report.failures,[]);
  report.passed=true;
  console.log('PASS: Chromium density snapshot/frame-budget diagnostic; performance remains advisory until physical Safari validation');
 }finally{
  fs.writeFileSync(path.join(out,'density-report.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();
 }
})().catch(err=>{console.error(err.stack||err);process.exitCode=1}).finally(()=>server.close());
