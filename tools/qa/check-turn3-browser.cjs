// Turn 3 browser gate: actual DOM hit regions and Dragon guide sprites at five levels.
// NODE_PATH=tools/qa/node_modules QA_BROWSER_PATH=tools/qa/.runtime/chromium node tools/qa/check-turn3-browser.cjs
'use strict';
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert'),puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'../..'),out=path.resolve(process.env.QA_BROWSER_OUTPUT||'/tmp/showdown-turn3-browser');
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/\/$/,'/index.html'),file=path.resolve(root,'.'+name);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end()}});
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await puppeteer.launch({headless:true,executablePath:process.env.QA_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const report={browser:await browser.version(),note:'Chromium emulation only; not physical iPhone Safari',screens:[],dragon:[],knight:[],errors:[],failedResponses:[],passed:false};
 try{
  for(const [width,height] of [[430,932],[390,844],[375,667]]){
   const page=await browser.newPage();
   page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.failedResponses.push({status:r.status(),url:r.url()})});
   await page.setViewport({width,height,deviceScaleFactor:3,isMobile:true,hasTouch:true});
   await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&window.FighterAssets&&window.ShowdownAdapter,{timeout:90000});
   const homeAssets=await page.evaluate(()=>FighterAssets.assetStatus());
   assert(homeAssets.requested<=12,'Home requested unnecessary authored forms: '+JSON.stringify(homeAssets)+' '+JSON.stringify(await page.evaluate(()=>performance.getEntriesByType('resource').filter(x=>x.name.includes('/assets/authored/')).map(x=>x.name))));
   assert(homeAssets.total>=200,'full roster manifest unexpectedly reduced');
   report.screens.push({width,height,homeAssets});
   await page.click('[data-go="lab"]');
   const lab=await page.evaluate(()=>{
    const measure=selector=>[...document.querySelectorAll(selector)].filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,id:e.id,width:r.width,height:r.height}});
    return{sliders:measure('[data-screen="lab"] input[type="range"]'),checkboxes:measure('[data-screen="lab"] label:has(input[type="checkbox"])'),overflow:document.documentElement.scrollWidth-innerWidth};
   });
   assert(lab.sliders.length>0,'No visible Lab sliders');
   assert(lab.sliders.every(x=>x.height>=47.5),'Lab slider pointer area below 48px');
   assert(lab.checkboxes.length>0,'No visible Lab checkbox labels');
   assert(lab.checkboxes.every(x=>x.height>=47.5),'Lab checkbox touch row below 48px');
   assert(lab.overflow<=1,'Lab document horizontal overflow');
   await page.screenshot({path:path.join(out,'lab-'+width+'.png')});
   await page.click('[data-screen="lab"] [data-go="home"]');
   await page.click('[data-go="roster"]');
   const shop=await page.evaluate(()=>[...document.querySelectorAll('[data-screen="roster"] [data-upgrade-unit],[data-screen="roster"] [data-upgrade-spell],[data-screen="roster"] [data-buy-spell]')].filter(x=>x.getClientRects().length).map(x=>({label:x.textContent.trim(),height:x.getBoundingClientRect().height})));
   assert(shop.length>0,'No shop upgrade controls');
   assert(shop.every(x=>x.height>=47.5),'Shop control below 48px');
   report.screens.push({width,height,lab,shopCount:shop.length,shopMinHeight:Math.min(...shop.map(x=>x.height))});
   await page.screenshot({path:path.join(out,'shop-'+width+'.png')});
   if(width===430){
    await page.click('[data-screen="roster"] [data-go="home"]');await page.click('[data-go="guide"]');
    await page.waitForSelector('.sl-guide-card');
    const count=await page.$$eval('.sl-guide-card',es=>es.length);assert.strictEqual(count,10);
    for(let level=1;level<=5;level++){
     const result=await page.evaluate(async level=>{
      const c=document.querySelector('.sl-guide-card[data-guide="dragon"] canvas.sl-guide-art');if(!c)throw Error('Dragon guide canvas missing');
      c.dataset.level=String(level);window.dispatchEvent(new Event('resize'));
      await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      const data=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
      let nonzero=0;for(let i=3;i<data.length;i+=4)if(data[i])nonzero++;
      return{level,w:c.width,h:c.height,visiblePixels:nonzero};
     },level);
     assert(result.visiblePixels>1000,'Dragon canvas rendered blank: L'+level);
     report.dragon.push(result);
     const canvas=await page.$('.sl-guide-card[data-guide="dragon"] canvas.sl-guide-art');
     await canvas.screenshot({path:path.join(out,'dragon-guide-L'+level+'.png')});
    }
    const knight=await page.evaluate(async()=>{
     const urls=Object.entries(FighterAssets.authored.knight.urls);
     const sourceDimensions=[];
     for(const [pose,url] of urls){
      const img=new Image();img.src=url;await img.decode();
      sourceDimensions.push({pose,width:img.naturalWidth,height:img.naturalHeight,url});
     }
     const cv=document.createElement('canvas');cv.width=430;cv.height=360;cv.id='qa-knight-render';
     cv.style.cssText='position:fixed;left:0;top:0;z-index:999999;width:430px;height:360px';
     document.body.appendChild(cv);
     const c=cv.getContext('2d');c.fillStyle='#f7f1dd';c.fillRect(0,0,430,360);
     for(const [level,x,y] of [[1,110,155],[2,315,155],[4,110,330],[5,315,330]]){
      if(!FighterAssets.draw(c,'knight',x,y,88,'blue',{level,action:'idle',density:2,time:2500,id:100+level}))throw Error('Missing Knight render L'+level);
     }
     let drawn=0;const a=c.getImageData(0,0,430,360).data;for(let i=0;i<a.length;i+=4)if(a[i]<75&&a[i+1]<85&&a[i+2]<95)drawn++;
     return{sourceDimensions,darkOutlinePixels:drawn};
    });
    for(const a of knight.sourceDimensions.filter(x=>x.pose!=='defeat'))assert.strictEqual(a.width,256,'Base Knight pose '+a.pose+' not high resolution');
    assert.strictEqual(knight.sourceDimensions.length,7);
    assert(knight.darkOutlinePixels>1000,'Knight artwork unexpectedly blank');
    report.knight.push(knight);
    await (await page.$('#qa-knight-render')).screenshot({path:path.join(out,'knight-base-vs-evolved-430.png')});
    await page.evaluate(()=>document.querySelector('#qa-knight-render')?.remove());
   }
   if(width===430){
    await page.click('[data-screen="guide"] [data-go="home"]');
    await page.click('[data-go="lab"]');
    await page.click('[data-preset="swarm"]');
    await page.click('#labRun');
    await page.waitForFunction(()=>window.ShowdownQA?.snapshot().screen==='battle',{timeout:15000});
    const cpuSession=await page.createCDPSession();
    await cpuSession.send('Profiler.enable');
    await cpuSession.send('Profiler.setSamplingInterval',{interval:1000});
    await cpuSession.send('Profiler.start');
    const perf=await page.evaluate(async()=>{
      ShowdownQA.clearRenderProfile();
      const times=[],start=performance.now();
      await new Promise(resolve=>{
       const run=now=>{times.push(now);if(times.length>=181)resolve();else requestAnimationFrame(run)};
       requestAnimationFrame(run);
      });
      const intervals=times.slice(1).map((t,i)=>t-times[i]).sort((a,b)=>a-b);
      const pct=p=>intervals[Math.min(intervals.length-1,Math.floor((intervals.length-1)*p))];
      const snap=ShowdownQA.snapshot();
      const prof=ShowdownQA.renderProfile().slice(-180);
      const keys=['total','setup','arena','fighters','effects','overlay'];
      const renderPasses=Object.fromEntries(keys.map(k=>{
       const sorted=prof.map(x=>x[k]).sort((a,b)=>a-b);
       const pct=v=>sorted[Math.floor((sorted.length-1)*v)]||0;
       return[k,{p50Ms:pct(.5),p95Ms:pct(.95),maxMs:sorted[sorted.length-1]||0}];
      }));
      return{renderPasses,renderSamples:prof.length,width:430,frames:intervals.length,elapsedMs:performance.now()-start,p50IntervalMs:pct(.5),p95IntervalMs:pct(.95),slowFrames:intervals.filter(x=>x>33.3).length,unitCount:snap.units.length,effects:snap.effects,phase:snap.phase};
    });
    const cpu=await cpuSession.send('Profiler.stop');
    await cpuSession.detach();
    fs.writeFileSync(path.join(out,'swarm-cpu-profile.cpuprofile'),JSON.stringify(cpu.profile));
    const hotspots=(cpu.profile.nodes||[]).filter(n=>n.hitCount>0).sort((a,b)=>b.hitCount-a.hitCount).slice(0,15).map(n=>({function:n.callFrame.functionName,url:n.callFrame.url.split('/').pop(),hits:n.hitCount}));
    perf.cpuHotspots=hotspots;
    assert(perf.frames===180&&perf.elapsedMs>0,'Swarm frame sample did not complete');
    assert(perf.renderSamples>=90,'Render-pass profiler failed to collect sufficient battle samples');
    report.swarmPerformance=perf;
    await page.screenshot({path:path.join(out,'swarm-430.png')});
    await page.evaluate(()=>{
      ShowdownAdapter.setSpeed(1);
      ShowdownAdapter.startMatch({
        blue:{knight:20,goose:20,sniper:20},
        red:{beetank:20,goblin:20,barbarian:20},
        blueLives:1,redLives:1,seed:7301
      });
    });
    await page.waitForFunction(()=>ShowdownQA.snapshot().units.length>=100,{timeout:15000});
    await new Promise(resolve=>setTimeout(resolve,800));
    const crowded=await page.evaluate(()=>{
      const snap=ShowdownQA.snapshot(),units=snap.units.filter(x=>x.box),arena=snap.arena;
      let clipped=0,closeOverlap=0,boxesIntersect=0;
      for(let i=0;i<units.length;i++){
        const a=units[i].box;
        if(a.left<arena.x-2||a.right>arena.x+arena.w+2||a.top<arena.y-2||a.bottom>arena.y+arena.h+2)clipped++;
        for(let j=i+1;j<units.length;j++){
          const b=units[j].box;if(units[i].team!==units[j].team)continue;
          if(Math.abs(units[i].screenX-units[j].screenX)<20&&Math.abs(units[i].screenY-units[j].screenY)<26)closeOverlap++;
          if(Math.min(a.right,b.right)>Math.max(a.left,b.left)&&Math.min(a.bottom,b.bottom)>Math.max(a.top,b.top))boxesIntersect++;
        }
      }
      return{count:units.length,clipped,closeOverlap,boxesIntersect,arena};
    });
    assert(crowded.count>=80,'large battle did not render enough active fighters');
    report.denseBattle=crowded;
    await page.screenshot({path:path.join(out,'dense120-430.png')});

   }
   await page.close();
  }
  assert.deepStrictEqual(report.errors,[],'JavaScript errors');
  assert.deepStrictEqual(report.failedResponses,[],'asset errors');
  report.passed=true;
  console.log('PASS: mobile viewport/Dragon/Knight and 180-frame swarm benchmark '+JSON.stringify({swarm:report.swarmPerformance,dense:report.denseBattle}));
 }finally{fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(report,null,2)+'\n');await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1}).finally(()=>server.close());
