'use strict';
// All-ten actual authored Guide presentation at three DPR3 Chromium touch sizes.
// This cannot certify physical iPhone Safari, but catches blank/cropped image panels.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'../..'),out=path.resolve(process.env.QA_THEATRE_GALLERY_OUTPUT||'/tmp/showdown-theatre-all');
const mime={'.html':'text/html','.css':'text/css','.js':'application/javascript','.webp':'image/webp','.png':'image/png','.json':'application/json','.webmanifest':'application/manifest+json'};
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
 try{res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}
 catch{res.writeHead(404);res.end()}
});
(async()=>{
 await new Promise(done=>server.listen(0,'127.0.0.1',done));let browser;
 const results=[],errors=[];
 try{
 browser=await puppeteer.launch({headless:true,executablePath:process.env.QA_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [width,height] of [[430,932],[390,844],[375,667]]){
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width,height,deviceScaleFactor:3,isMobile:true,hasTouch:true});
  await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&window.FighterAssets,{timeout:90000});
  await page.click('[data-go="guide"]');await page.waitForSelector('.sl-guide-card[data-guide="barbarian"]');
  await page.waitForFunction(()=>{const x=window.FighterAssets?.assetStatus?.();return x&&x.requested>=30&&x.ready===x.requested&&x.errors===0},{timeout:90000});
  await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
  const view=await page.evaluate(()=>{
   const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
   const b=el=>{const r=el.getBoundingClientRect();return{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height}};
   const art=[];
   for(const type of types){
    const card=document.querySelector('.sl-guide-card[data-guide="'+type+'"]'),wrap=card.querySelector('.guide-form-pair'),bounds=b(wrap);
    for(const [idx,fig] of [...wrap.querySelectorAll('figure')].entries()){
     const cv=fig.querySelector('canvas'),ctx=cv.getContext('2d',{willReadFrequently:true}),d=ctx.getImageData(0,0,cv.width,cv.height).data;let opaque=0,edge=0;
     for(let y=0;y<cv.height;y+=3)for(let x=0;x<cv.width;x+=3){
      if(d[(y*cv.width+x)*4+3]<100)continue;opaque++;if(x<cv.width*.008||x>cv.width*.992||y<cv.height*.008||y>cv.height*.992)edge++;
     }
     art.push({type,level:[1,2,4][idx],opaque,edge,pixels:cv.width*cv.height,figure:b(fig),canvas:b(cv),wrap:bounds});
    }
   }
   const tips=Object.fromEntries(['turtle','goblin','barbarian'].map(t=>[t,document.querySelector('.sl-guide-card[data-guide="'+t+'"] .guide-strategy')?.textContent]));
   return{art,tips,overflow:document.documentElement.scrollWidth-innerWidth,assets:window.FighterAssets.assetStatus()};
  });
  assert.equal(view.art.length,30,'ten full fighter families, each L1/L2/L4');
  assert.equal(view.assets.errors,0,'all authored requested art loaded');
  assert(view.overflow<=1,'no page horizontal overflow');
  assert(view.tips.turtle.includes('Shell Rebound')&&view.tips.goblin.includes('Rabble')&&view.tips.barbarian.includes('Measured Charge'),'current live L5 tactical advice must be truthful');
  for(const a of view.art){
    assert(a.opaque>Math.max(100,a.pixels/2200),'blank full-body image '+a.type+' L'+a.level);
    assert(a.figure.x>=a.wrap.x-2&&a.figure.right<=a.wrap.right+2,'art figure wider than gallery '+a.type+' L'+a.level);
    assert(a.figure.bottom<=a.wrap.bottom+3,'gallery bottom clipping '+a.type+' L'+a.level);
    assert(a.canvas.x>=a.figure.x-2&&a.canvas.right<=a.figure.right+2,'canvas horizontal clipping '+a.type+' L'+a.level);
    assert(a.edge<Math.max(40,a.opaque*.035),'substantial art pixels cut by canvas '+a.type+' L'+a.level);
  }
  if(width===430)for(const t of ['sniper','turtle','goblin','barbarian','dragon']){
    await(await page.$('.sl-guide-card[data-guide="'+t+'"] .guide-form-pair')).screenshot({path:path.join(out,'guide-'+t+'-430.png')});
  }
  // Match the same authored actual image QA against Upgrade Bay and Draft.
  // Unlike Guide, both use cropped square/wide thumbnails and sticky overlays.
  const measure=selector=>page.evaluate(sel=>[...document.querySelectorAll(sel)].map(cv=>{
    const r=cv.getBoundingClientRect(),ctx=cv.getContext('2d',{willReadFrequently:true}),buf=ctx.getImageData(0,0,cv.width,cv.height).data;
    let opaque=0,edge=0;for(let y=0;y<cv.height;y+=3)for(let x=0;x<cv.width;x+=3){
      const alpha=buf[(y*cv.width+x)*4+3];if(alpha<100)continue;opaque++;
      if(x<cv.width*.008||x>cv.width*.992||y<cv.height*.008||y>cv.height*.992)edge++;
    }
    return{type:cv.dataset.art,opaque,edge,pixels:cv.width*cv.height,width:r.width,height:r.height};
  }),selector);
  const verify=(rows,count,stage)=>{assert.equal(rows.length,count,stage+' fighter art count');for(const r of rows){
    assert(r.type&&r.opaque>Math.max(35,r.pixels/4000),stage+' blank art '+r.type);
    assert(r.edge<Math.max(42,r.opaque*.09),stage+' fighter clipped by canvas '+r.type);
    assert(r.width>40&&r.height>40,stage+' tiny touch art '+r.type);
  }};
  await page.click('[data-screen="guide"].active [data-go="home"]');
  await page.click('[data-screen="home"].active [data-go="roster"]');
  await page.waitForSelector('[data-screen="roster"].active .roster-card canvas');
  await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
  const rosterArt=await measure('[data-screen="roster"].active .roster-card canvas');
  verify(rosterArt,10,'Upgrade Bay');
  if(width===430)await(await page.$('[data-screen="roster"].active .fighter-bay')).screenshot({path:path.join(out,'upgrade-bay-430.png')});
  await page.click('[data-screen="roster"].active [data-go="home"]');
  await page.click('[data-screen="home"].active [data-go="draft"]');
  await page.waitForSelector('[data-screen="draft"].active #draftGrid .fighter-card');
  await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
  const draftArt=await measure('[data-screen="draft"].active #draftGrid canvas[data-art]');
  verify(draftArt,10,'Draft cards');
  // Verify each real touch viewport; full-element screenshots alone hide sticky overlaps.
  const draft=await page.evaluate(()=>{
    const screen=document.querySelector('[data-screen="draft"].active'),h=screen.querySelector('.screen-head'),
      grid=screen.querySelector('#draftGrid'),f=screen.querySelector('.draft-footer'),first=grid.firstElementChild;
    const rect=e=>{const r=e.getBoundingClientRect();return{top:r.top,bottom:r.bottom}};
    return{screenOverflow:getComputedStyle(screen).overflowY,gridOverflow:getComputedStyle(grid).overflowY,
      range:grid.scrollHeight-grid.clientHeight,header:rect(h),grid:rect(grid),footer:rect(f),first:rect(first)};
  });
  assert.equal(draft.screenOverflow,'hidden','Draft chrome stays fixed');
  assert.equal(draft.gridOverflow,'auto','Draft 10-card grid must scroll independently by touch');
  assert(draft.range>150,'all five Draft rows need an actual scroll range');
  assert(draft.header.bottom<=draft.grid.top+2,'header occludes first card');
  assert(draft.grid.bottom<=draft.footer.top+2,'footer occludes bottom card');
  assert(draft.first.top>=draft.header.bottom-2,'fighter head behind Draft header');
  if(width===430)await page.screenshot({path:path.join(out,'draft-first-viewport-430.png')});
  const last=await page.evaluate(async()=>{
    const grid=document.querySelector('[data-screen="draft"].active #draftGrid');
    grid.scrollTop=grid.scrollHeight;
    await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
    const card=grid.lastElementChild,r=card.getBoundingClientRect(),g=grid.getBoundingClientRect(),
      x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);
    return{unit:card.dataset.unit,scrollTop:grid.scrollTop,visible:r.top>=g.top-2&&r.bottom<=g.bottom+2,
      hittable:!!hit&&(hit===card||card.contains(hit)),insideViewport:y>0&&y<innerHeight};
  });
  assert(last.unit,'the last Draft fighter must have a real unit identity');
  assert(last.scrollTop>100&&last.visible&&last.hittable&&last.insideViewport,'last Draft row physically scrolls into unobstructed tap area');
  if(width===430)await page.screenshot({path:path.join(out,'draft-last-viewport-430.png')});
  await page.click('[data-screen="draft"].active #draftGrid .fighter-card:last-child');
  assert.equal(await page.$eval('[data-screen="draft"].active #draftGrid .fighter-card:last-child',e=>e.getAttribute('aria-pressed')),'true','last-card touch pick');
  await page.click('[data-screen="draft"].active #draftGrid .fighter-card:last-child');
  assert.equal(await page.$eval('[data-screen="draft"].active #draftGrid .fighter-card:last-child',e=>e.getAttribute('aria-pressed')),'false','last-card touch undo');
  await page.evaluate(()=>document.querySelector('[data-screen="draft"].active #draftGrid').scrollTop=0);
  if(width===430)await(await page.$('[data-screen="draft"].active #draftGrid')).screenshot({path:path.join(out,'draft-cards-430.png')});
  await page.click('[data-screen="draft"].active [data-unit="knight"]');
  await page.click('[data-screen="draft"].active [data-unit="sniper"]');
  await page.click('[data-screen="draft"].active #confirmDraft');
  await page.waitForSelector('[data-screen="ready"].active .ready-showcase');
  await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
  const readyArt=await measure('[data-screen="ready"].active .ready-team canvas[data-art]');
  verify(readyArt,2,'Ready duel');
  if(width===430)await(await page.$('[data-screen="ready"].active .ready-showcase')).screenshot({path:path.join(out,'ready-duel-430.png')});
  // Real authored Knight art must show team color above the floor rings,
  // even as combat sprites overlap; extreme 300-density must stay image-only.
  await page.waitForFunction(()=>FighterAssets.diagnostics().byFighter.knight.idle==='ready',{timeout:60000});
  const teamRims=await page.evaluate(()=>{
    const measure=density=>{
      const paint=team=>{
        const cv=document.createElement('canvas');cv.width=260;cv.height=280;
        const ctx=cv.getContext('2d',{willReadFrequently:true});
        FighterAssets.draw(ctx,'knight',130,240,150,team,{id:771,time:1200,action:'idle',level:1,density});
        return{pixels:ctx.getImageData(0,0,cv.width,cv.height).data,cv};
      };
      const blue=paint('blue'),red=paint('red');let changed=0,redDominant=0,blueDominant=0;
      for(let y=25;y<195;y+=2)for(let x=25;x<235;x+=2){
        const i=(y*260+x)*4,p=blue.pixels,q=red.pixels;
        if(Math.abs(p[i]-q[i])+Math.abs(p[i+1]-q[i+1])+Math.abs(p[i+2]-q[i+2])>65)changed++;
        if(p[i+2]>p[i]*1.2&&p[i+2]>p[i+1]*1.05&&p[i+3]>170)blueDominant++;
        if(q[i]>q[i+1]*1.15&&q[i]>q[i+2]*1.15&&q[i+3]>170)redDominant++;
      }
      return{density,changed,blueDominant,redDominant};
    };
    const comparisons=[measure(40),measure(120),measure(300)];
    const proof=document.createElement('canvas');proof.width=520;proof.height=310;
    const c=proof.getContext('2d');c.fillStyle='#eee5c8';c.fillRect(0,0,520,310);
    c.fillStyle='#254550';c.font='bold 18px sans-serif';c.fillText('BLUE',95,28);c.fillText('RED',375,28);
    FighterAssets.draw(c,'knight',130,250,155,'blue',{id:100,time:1200,action:'idle',level:1,density:40});
    FighterAssets.draw(c,'knight',390,250,155,'red',{id:101,time:1200,action:'idle',level:1,density:40});
    return{comparisons,proof:proof.toDataURL('image/png')};
  });
  assert(teamRims.comparisons[0].changed>90,'40-fighter teams need visible authored silhouette difference above rings');
  assert(teamRims.comparisons[1].changed>90,'120-fighter teams need visible authored silhouette difference above rings');
  assert.equal(teamRims.comparisons[2].changed,0,'300 fighters must skip extra per-body rim rendering');
  if(width===430)fs.writeFileSync(path.join(out,'team-rims-430.png'),Buffer.from(teamRims.proof.split(',')[1],'base64'));
  // A stopped/abandoned battle has no surviving MVP; a prior portrait must NEVER linger.
  await page.evaluate(()=>{
    const cv=document.querySelector('#resultArt');cv.dataset.art='dragon';cv.dataset.team='red';cv.dataset.level='5';
    const ctx=cv.getContext('2d');ctx.fillStyle='#e33';ctx.fillRect(0,0,cv.width,cv.height);
    document.querySelector('[data-screen="battle"] [data-go="results"]').click();
  });
  await page.waitForSelector('[data-screen="results"].active #resultArt');
  const empty=await page.evaluate(()=>{
    const cv=document.querySelector('#resultArt'),buf=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
    let painted=0;for(let i=3;i<buf.length;i+=4)if(buf[i])painted++;
    return{artVisible:getComputedStyle(cv).visibility,badgeVisible:getComputedStyle(document.querySelector('.mvp-badge')).visibility,
      painted,staleData:cv.hasAttribute('data-art')||cv.hasAttribute('data-team')||cv.hasAttribute('data-level'),
      message:document.querySelector('#resultMvp').textContent};
  });
  assert.equal(empty.artVisible,'hidden','no-MVP results must hide prior art');
  assert.equal(empty.badgeVisible,'hidden','no-MVP results must hide stale MVP badge');
  assert.equal(empty.painted,0,'no-MVP results must clear prior fighter pixels');
  assert.equal(empty.staleData,false,'no-MVP results must clear prior fighter metadata');
  assert.equal(empty.message,'BATTLE COMPLETE','clear no-MVP copy');
  if(width===430)await(await page.$('[data-screen="results"].active .podium')).screenshot({path:path.join(out,'no-mvp-result-430.png')});

  results.push({width,height,assets:{requested:view.assets.requested,ready:view.assets.ready},art:view.art.map(x=>({type:x.type,level:x.level,opaque:x.opaque,edge:x.edge})),overflow:view.overflow,teamRims:teamRims.comparisons,draftScroll:{initial:draft,final:last},extraSurfaces:{roster:rosterArt.length,draft:draftArt.length,ready:readyArt.length,noMvp:empty}});
  await page.close();
 }
 assert.deepEqual(errors,[],'no portrait rendering exceptions');
 fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify({note:'Chromium DPR3 touch only; native Safari not tested',results},null,2)+'\n');
 console.log('PASS: 90 actual authored art canvases (10 fighters x3 forms x3 DPR3 viewports), panel geometry, nonblank full-body alpha, tactical Guide truth, team-color combat silhouette proof at 40/120 with 300 bypass, bottom-row Draft tapping, zero missing art');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
