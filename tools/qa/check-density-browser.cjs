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
    // Reset persisted stress speed BEFORE deployment; otherwise previous 10x can eliminate
    // fighters before the asynchronous 160+ Worker emits its initial exact population.
    ShowdownAdapter.setSpeed(1);
    ShowdownAdapter.startMatch({blue,red,blueLevels:levels,redLevels:levels,blueLives:4,redLives:4,seed:81337});
    // The 160+ Worker publishes its initial state asynchronously. Pause immediately:
    // waiting while it fights will invalidate the exact-deployment population test.
    ShowdownAdapter.pauseBattle();
    const deadline=performance.now()+25000;
    while(ShowdownAdapter.getState().units.length<count&&performance.now()<deadline){
      if(window.__showdownThreadStats?.errors?.length)throw Error('dense Worker failure: '+JSON.stringify(window.__showdownThreadStats));
      await new Promise(r=>setTimeout(r,50));
    }
    // Capture ALL original bodies while paused; no real combat time elapses here.
    ShowdownQA.clearRenderProfile();
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const s=ShowdownQA.snapshot();
    if(s.units.length!==count)throw Error('Expected '+count+' living initial deployment sprites, observed '+s.units.length+'; '+JSON.stringify({phase:ShowdownAdapter.getState().phase,speed:ShowdownAdapter.getState().speed,rawUnits:ShowdownAdapter.getState().units.length,worker:window.__showdownThreadStats||null}));
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
    const expectedScale=count>=160?(speed>=10?.85:.70):2;
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
   ShowdownAdapter.setSpeed(1);
   ShowdownAdapter.startMatch({blue:large,red:large,blueLevels:stages,redLevels:stages,blueLives:1,redLives:1,seed:81337});
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
   // QA-only instrumentation of the LIVE registered Canvas painter.
   // Read pixels before and after the actual seed-0 fracture draw on the
   // same 40-fighter frame. No mocked ctx, synthetic ink or gameplay change.
   window.__quakeInkQA=null;
   const realGround=window.BattleTheatre.drawDamage;
   window.BattleTheatre.drawDamage=function(ctx,p,mark,age,tier){
     if(mark?.type!=='quake'||mark.seed!==0||age<.018||age>.3||window.__quakeInkQA)
       return realGround.apply(this,arguments);
     const matrix=ctx.getTransform(),scaleX=matrix.a,scaleY=matrix.d,
       x=Math.max(0,Math.floor((p.x-190)*scaleX+matrix.e)),
       y=Math.max(0,Math.floor((p.y-38)*scaleY+matrix.f)),
       width=Math.min(ctx.canvas.width-x,Math.ceil(210*scaleX)),
       height=Math.min(ctx.canvas.height-y,Math.ceil(280*scaleY));
     if(scaleX<=0||scaleY<=0||width<30||height<30)
       return realGround.apply(this,arguments);
     const pre=ctx.getImageData(x,y,width,height).data;
     const result=realGround.apply(this,arguments);
     const post=ctx.getImageData(x,y,width,height).data;
     let changed=0,darkened=0,foregroundChanged=0,foregroundDarkened=0;
     for(let i=0;i<post.length;i+=4){
       const dr=pre[i]-post[i],dg=pre[i+1]-post[i+1],db=pre[i+2]-post[i+2],
         change=Math.abs(dr)+Math.abs(dg)+Math.abs(db)>=32,
         dark=dr>12&&dg>12&&db>8;
       if(change)changed++;
       if(dark)darkened++;
       // In the original source the farthest seed-0 crack reached only
       // +~50 CSS pixels. The open foreground starts +125px below target.
       const row=Math.floor(i/4/width),near=row>=Math.floor(163*scaleY);
       if(near&&change)foregroundChanged++;
       if(near&&dark)foregroundDarkened++;
     }
     window.__quakeInkQA={changed,darkened,foregroundChanged,foregroundDarkened,pixels:width*height,
       rect:[x,y,width,height],age,tier,seed:mark.seed,
       population:ShowdownAdapter.getState().units.filter(u=>u.hp>0).length,
       canvas:[ctx.canvas.width,ctx.canvas.height]};
     return result;
   };
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
  // A synchronous snapshot of the REAL composited Canvas, before the
  // full-page screenshot can outlive the QUAKE foreground animation.
  await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,260)));
  const quakeFrame=await page.evaluate(()=>{
    const canvas=document.querySelector('#battleCanvas');
    return{paint:window.__quakeInkQA,png:canvas.toDataURL('image/png')};
  });
  fs.writeFileSync(path.join(out,'quake-live-canvas-430.png'),Buffer.from(quakeFrame.png.split(',')[1],'base64'));
  report.quakeInk=quakeFrame.paint;
  console.log('QUAKE SAME-FRAME REAL FRACTURE PIXELS '+JSON.stringify(report.quakeInk));
  assert.equal(report.quakeInk?.seed,0,'source-seeded central QUAKE fracture was actually painted');
  assert.equal(report.quakeInk?.population,40,'real 40-body current-source QUAKE');
  assert.notEqual(report.quakeInk?.tier,'minimal','40-body QUAKE retains daylight fissure');
  assert(report.quakeInk.changed>=300,'QUAKE must create a materially broad real Canvas fracture');
  assert(report.quakeInk.darkened>=120,'QUAKE must open visibly dark earth, not only bright flash overlays');
  assert(report.quakeInk.foregroundChanged>=600,'seed-0 QUAKE fault must paint genuine changed pixels on previously open foreground floor');
  assert(report.quakeInk.foregroundDarkened>=250,'seed-0 foreground QUAKE must create visibly dark soil, not bright UI overlays');
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
      if(kind==='heal'){
        window.__bloomFillTrace=[];
        const baseFill=CanvasRenderingContext2D.prototype.fill;
        CanvasRenderingContext2D.prototype.fill=function(...args){
          const color=this.fillStyle;
          const result=baseFill.apply(this,args);
          if(['#dcf49c','#54ae55','#85ca61','#f5edb2'].includes(color)&&window.__bloomFillTrace.length<25){
            const t=this.getTransform(),cx=Math.max(0,Math.min(this.canvas.width-12,Math.floor(t.e)-6)),
              cy=Math.max(0,Math.min(this.canvas.height-12,Math.floor(t.f)-6));
            const pixels=this.getImageData(cx,cy,12,12).data;let green=0;
            for(let i=0;i<pixels.length;i+=4)if(pixels[i+1]>pixels[i]*1.2&&pixels[i+1]>pixels[i+2]*1.2)green++;
            window.__bloomFillTrace.push({color,alpha:this.globalAlpha,mode:this.globalCompositeOperation,
              transform:[t.a,t.b,t.c,t.d,t.e,t.f],canvas:[this.canvas.width,this.canvas.height],
              immediateGreen:green,sampleCenter:[cx,cy]});
          }
          return result;
        };
      }
      addEventListener('showdown:spell',e=>{if(e.detail?.spell===kind)window.__spellCastQA={spell:e.detail.spell,power:e.detail.power,amount:e.detail.amount,targets:e.detail.targets||1}},{once:true});
      document.querySelector('[data-spell="'+kind+'"]').addEventListener('click',()=>window.__spellTouchQA++,{capture:true,once:true});
      if(kind==='zap'){
        const canvas=document.querySelector('#battleCanvas'),ctx=canvas.getContext('2d'),original=ctx.stroke;
        window.__arcBoltPaint=[];window.__arcOuterPaint=[];
        ctx.stroke=function(...args){
          if(this.strokeStyle==='#116b9b'&&window.__arcBoltPaint.length<8)
            window.__arcBoltPaint.push({mode:this.globalCompositeOperation,width:this.lineWidth});
          if(this.strokeStyle==='#10293f'&&window.__arcOuterPaint.length<8)
            window.__arcOuterPaint.push({mode:this.globalCompositeOperation,width:this.lineWidth});
          return original.apply(this,args);
        };
      }
      new MutationObserver(()=>{if(document.querySelector('.ability-callout.spell-'+kind))window.__spellCalloutQA=true})
        .observe(document.querySelector('.screen-battle'),{childList:true,subtree:true});
    },kind);
    // AEGIS is the FOURTH spell in a deliberately horizontally-scrollable
    // mobile rack. First scroll it into the finger-accessible viewport; a
    // hit-test of its *off-screen* center is an invalid reachability test.
    const rackReach=await page.evaluate(kind=>{
      const rack=document.querySelector('.spell-rack'),button=rack.querySelector('[data-spell="'+kind+'"]');
      const scrollable=rack.scrollWidth>rack.clientWidth+2;
      rack.scrollLeft=kind==='aegis'?rack.scrollWidth-rack.clientWidth:0;
      return{kind,scrollable,maxScroll:rack.scrollWidth-rack.clientWidth,requested:rack.scrollLeft,hidden:button.hidden,disabled:button.disabled};
    },kind);
    await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
    const rackActual=await page.evaluate(kind=>{
      const rack=document.querySelector('.spell-rack'),button=rack.querySelector('[data-spell="'+kind+'"]'),
        r=button.getBoundingClientRect(),b=rack.getBoundingClientRect();
      return{scrollLeft:rack.scrollLeft,visible:r.left>=b.left-2&&r.right<=b.right+2,screenX:r.left+r.width/2};
    },kind);
    console.log('SPELL RACK TOUCH ACCESS '+JSON.stringify({...rackReach,...rackActual}));
    if(kind==='aegis')assert(rackActual.visible&&(!rackReach.scrollable||rackActual.scrollLeft>0),
      'AEGIS must be physically reachable after horizontal rack scroll');
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
    // Capture the real composited battle canvas before Puppeteer's slow
    // full-page PNG work allows the ~1s spell burst to expire. The earlier
    // gate inspected the framebuffer AFTER awaiting screenshot, causing a
    // false failure despite source-observed green leaf pixels (144 immediate).
    if(kind==='heal'){
      const nowBloom=await page.evaluate(()=>{
        const cv=document.querySelector('#battleCanvas'),
          ctx=cv.getContext('2d',{willReadFrequently:true}),
          factor=cv.width/cv.getBoundingClientRect().width,w=cv.width,h=cv.height,
          rgba=ctx.getImageData(0,0,w,h).data,step=Math.max(1,Math.round(2*factor));
        let greens=0,light=0,samples=0;
        for(let y=Math.round(200*factor);y<Math.min(h-Math.round(90*factor),Math.round(790*factor));y+=step){
          for(let x=Math.round(18*factor);x<Math.min(w,Math.round(116*factor));x+=step){
            const i=(y*w+x)*4,r=rgba[i],g=rgba[i+1],b=rgba[i+2];samples++;
            if(g>r*1.24&&g>b*1.20&&g>80)greens++;
            if(r>150&&g>170&&b<175&&g>r*1.04)light++;
          }
        }
        const trace=window.__bloomFillTrace||[],leaf=trace.find(e=>e.color==='#54ae55'&&e.immediateGreen>0);
        const painter=window.__bloomPainter||null;
        // This encodes the CURRENT real battle canvas immediately, without
        // another RAF or a full-page screenshot scheduling delay.
        return{greens,light,samples,leaf:leaf?{sample:leaf.sampleCenter,immediate:leaf.immediateGreen}:null,
          painter,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,
          density:ShowdownAdapter.getState().units.filter(u=>u.hp>0).length,
          png:cv.toDataURL('image/png')};
      });
      fs.writeFileSync(path.join(out,'spell-heal-live-canvas-430.png'),Buffer.from(nowBloom.png.split(',')[1],'base64'));
      const {png,...proof}=nowBloom;
      report.bloomSideline=proof;
      console.log('BLOOM ON-FRAME REAL PIXELS '+JSON.stringify(proof));
      assert.equal(proof.density,40,'real 40-fighter BLOOM snapshot');
      assert(proof.painter?.density===40,'real BLOOM painter ran in the same fight');
      assert(proof.leaf&&proof.leaf.immediate>0,'actual source-green leaf must paint on Canvas');
      assert(proof.greens>=55,'visible BLOOM greenery should survive on its ACTUAL immediate frame');
    }
    if(kind==='zap'){
      const evidence=await page.evaluate(()=>{
        const canvas=document.querySelector('#battleCanvas');
        return{strokes:window.__arcBoltPaint||[],outer:window.__arcOuterPaint||[],png:canvas.toDataURL('image/png')};
      });
      fs.writeFileSync(path.join(out,'spell-zap-live-canvas-430.png'),Buffer.from(evidence.png.split(',')[1],'base64'));
      report.arcInk=evidence.strokes;report.arcOuter=evidence.outer;
      console.log('ARC REAL BOLT COMPOSITOR '+JSON.stringify({blue:report.arcInk,navy:report.arcOuter}));
      assert(report.arcInk.length>0,'real ARC draws blue bolt');
      assert(report.arcOuter.length>0,'real ARC draws dark outer channel');
      assert(report.arcOuter.every(x=>x.mode==='source-over'&&x.width>=6.4),'bold navy ARC contrast required');
    }
    // Supplementary full-page screenshot may land after the brief FX fades;
    // do NOT use it as a same-frame pixel measurement.
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
