'use strict';
// Actual Chromium mobile touch input, NOT native iPhone Safari.
// Exercises Home→Quick→Battle, Home→Draft→Ready→Battle, Home→Lab custom
// enemies→real 40-fighter AEGIS, and safe exit/new-battle isolation.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict'),puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'../..');
const output=process.env.QA_TOUCH_MODES_OUTPUT||'/tmp/showdown-touch-modes';
fs.mkdirSync(output,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webp':'image/webp','.json':'application/json','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
 const raw=new URL(req.url,'http://localhost').pathname;
 const f=path.resolve(root,'.'+(raw==='/'?'/index.html':raw));
 if(!f.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 try{res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',mime[path.extname(f)]||'application/octet-stream');res.end(fs.readFileSync(f));}
 catch{res.writeHead(404);res.end();}
});
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await puppeteer.launch({headless:true,executablePath:process.env.QA_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const results=[];
 try{
  for(const [width,height] of [[430,932],[390,844],[375,667]]){
   const page=await browser.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height,deviceScaleFactor:3,isMobile:true,hasTouch:true});
   const port=server.address().port;
   await page.goto('http://127.0.0.1:'+port+'/?qa=1&touch-modes=1',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&!!window.ShowdownAdapter&&!!window.ShowdownQA,{timeout:90000});
   async function touch(selector,scroll=false){
    const rect=await page.evaluate(({selector,scroll})=>{
      const e=document.querySelector(selector);
      if(!e)throw Error('missing '+selector);
      if(scroll)e.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
      const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);
      return{x,y,w:r.width,h:r.height,hit:hit===e||e.contains(hit),hidden:e.hidden,disabled:e.disabled};
    },{selector,scroll});
    assert(!rect.hidden&&!rect.disabled&&rect.hit,'touch target unavailable '+width+' '+selector+' '+JSON.stringify(rect));
    assert(rect.w>=38&&rect.h>=36,'touch target too small '+width+' '+selector+' '+JSON.stringify(rect));
    await page.touchscreen.tap(rect.x,rect.y);
    return rect;
   }
   async function battle(mode){
     await page.waitForFunction(mode=>window.ShowdownQA.snapshot().screen==='battle'&&document.body.dataset.gameMode===mode,{timeout:20000},mode);
     return page.evaluate(()=>({screen:ShowdownQA.snapshot().screen,mode:document.body.dataset.gameMode,
       speed:ShowdownAdapter.getState().speed,phase:ShowdownAdapter.getState().phase,
       units:ShowdownAdapter.getState().units.length,
       overlay:!!document.querySelector('.round-draft:not(.hidden)')}));
   }
   async function exitBattle(){
     await touch('#battleMenu');
     await touch('#battleSheet:not(.hidden) [data-go="home"]');
     await page.waitForSelector('.screen-home.active');
     return page.evaluate(()=>({screen:ShowdownQA.snapshot().screen,
       overlays:[...document.querySelectorAll('.round-draft:not(.hidden),.ability-callout')].length,
       visibleBattle:document.querySelector('.screen-battle').classList.contains('active')}));
   }
   // Quick enters the genuine ready screen, then deploys real source fighters.
   await touch('[data-mode="quick"]');
   await page.waitForSelector('.screen-ready.active');
   const quickReady=await page.$eval('#readyMode',e=>e.textContent);
   assert.match(quickReady,/QUICK/);
   await touch('.screen-ready.active [data-go="battle"]');
   const quick=await battle('quick');
   assert(quick.units>=2&&quick.speed===1&&quick.phase==='battle','quick real deployment '+JSON.stringify(quick));
   // The sheet controls are finger-accessible, including speed and return.
   await touch('#battleMenu');
   await touch('#battleSheet:not(.hidden) [data-speed="1"]');
   assert.equal(await page.$eval('#speedReadout',x=>x.textContent),'1×');
   if(width===430)await page.screenshot({path:path.join(output,'quick-battle-430.png')});
   const quickExit=await exitBattle();
   assert.equal(quickExit.screen,'home');
   assert(!quickExit.visibleBattle,'quick left battle on screen');

   // Draft genuinely selects both available fighters using touch, confirms
   // the army and starts gameplay; no DOM-injected draft choice.
   await touch('.screen-home.active [data-go="draft"]');
   await page.waitForSelector('.screen-draft.active #draftGrid .fighter-card');
   await touch('#draftGrid [data-unit="knight"]');
   await touch('#draftGrid [data-unit="sniper"]');
   const picks=await page.evaluate(()=>({
     pressed:[...document.querySelectorAll('#draftGrid .fighter-card[aria-pressed="true"]')].map(x=>x.dataset.unit),
     confirmDisabled:document.querySelector('#confirmDraft').disabled
   }));
   assert.deepEqual(picks.pressed.sort(),['knight','sniper']);
   assert.equal(picks.confirmDisabled,false);
   await touch('#confirmDraft');
   await page.waitForSelector('.screen-ready.active');
   assert.match(await page.$eval('#readyMode',e=>e.textContent),/DRAFT/);
   await touch('.screen-ready.active [data-go="battle"]');
   const draft=await battle('draft');
   assert(draft.units>=4&&draft.speed===1&&draft.phase==='battle','draft real deployment '+JSON.stringify(draft));
   if(width===430)await page.screenshot({path:path.join(output,'draft-battle-430.png')});
   const draftExit=await exitBattle();
   assert.equal(draftExit.screen,'home');

   // Lab customization must carry through to the ORIGINAL source adapter
   // before the isolated 40-fighter spell visibility fixture is arranged.
   await touch('.screen-home.active [data-go="lab"]');
   await page.waitForSelector('.screen-lab.active #labRun');
   await touch('#labChooseEnemies',true);
   await page.waitForSelector('[data-screen="lab-enemies"].active #labEnemyPicker');
   await touch('[data-enemy-plus-five="turtle"]',true);
   assert.match(await page.$eval('#labEnemyTotal',x=>x.textContent),/^5 \/ 60/);
   await touch('#labEnemyDone',true);
   await page.waitForSelector('.screen-lab.active');
   await touch('#labRun',true);
   const lab=await battle('lab');
   const configured=await page.evaluate(()=>ShowdownAdapter.getState().armies?.red?.turtle||0);
   assert.equal(configured,5,'Lab custom five turtles must reach actual source battle');
   assert(lab.units>=7&&lab.speed===1,'Lab fixture startup '+JSON.stringify(lab));

   // Once true UI settings are proven, use the SAME running original-core Lab
   // instance to create a sustained 20v20 spell interaction (not mocked HP).
   await page.evaluate(()=>{
     ShowdownAdapter.startMatch({blue:{knight:20},red:{knight:20},blueLives:1,redLives:1,seed:42026});
     ShowdownAdapter.setSpeed(1);
     window.__aegisTouches=0;window.__aegisCast=null;
     document.querySelector('[data-spell="aegis"]').addEventListener('click',()=>window.__aegisTouches++,{capture:true});
     addEventListener('showdown:spell',e=>{if(e.detail?.spell==='aegis')
       window.__aegisCast={spell:e.detail.spell,targets:e.detail.targets,amount:e.detail.amount};});
   });
   const beforeRack=await page.evaluate(()=>{
      const rack=document.querySelector('.spell-rack'),a=document.querySelector('[data-spell="aegis"]'),r=rack.getBoundingClientRect(),ar=a.getBoundingClientRect();
      return{scrollLeft:rack.scrollLeft,maxScroll:rack.scrollWidth-rack.clientWidth,
        x1:r.right-18,x2:r.left+18,y:r.top+r.height/2,buttonVisible:ar.left>=r.left-1&&ar.right<=r.right+1};
   });
   // Native CDP touchscreen gesture. Unlike setting scrollLeft, this asserts
   // the user's finger can actually reveal the fourth spell.
   if(beforeRack.maxScroll>2){
     const cdp=await page.createCDPSession();
     await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:beforeRack.x1,y:beforeRack.y}]});
     for(let i=1;i<=8;i++){
       await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:beforeRack.x1+(beforeRack.x2-beforeRack.x1)*i/8,y:beforeRack.y}]});
       await new Promise(done=>setTimeout(done,22));
     }
     await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
     await cdp.detach();
     await page.waitForFunction(()=>document.querySelector('.spell-rack').scrollLeft>10,{timeout:5000});
   }
   const afterRack=await page.evaluate(()=>{
     const rack=document.querySelector('.spell-rack'),a=document.querySelector('[data-spell="aegis"]'),
       r=rack.getBoundingClientRect(),ar=a.getBoundingClientRect(),
       hit=document.elementFromPoint(ar.left+ar.width/2,ar.top+ar.height/2);
     return{scrollLeft:rack.scrollLeft,maxScroll:rack.scrollWidth-rack.clientWidth,
       visible:ar.left>=r.left-2&&ar.right<=r.right+2,
       hit:hit===a||a.contains(hit),disabled:a.disabled,width:ar.width,height:ar.height};
   });
   assert(afterRack.visible&&afterRack.hit&&afterRack.scrollLeft>=(beforeRack.maxScroll>2?4:0),
     'true swipe must make AEGIS finger-reachable '+width+' '+JSON.stringify({beforeRack,afterRack}));
   await touch('[data-spell="aegis"]');
   const aegis=await page.evaluate(()=>({touches:window.__aegisTouches,cast:window.__aegisCast,
     protected:ShowdownAdapter.getState().units.filter(u=>u.team==='blue'&&u.ward>0).length}));
   assert.equal(aegis.touches,1,'exactly one real AEGIS touchscreen event');
   assert.equal(aegis.cast?.spell,'aegis','actual engine AEGIS event');
   assert(aegis.protected>0&&aegis.cast.targets>0,'real source AEGIS warded live blue units');
   if(width===430)await page.screenshot({path:path.join(output,'lab-aegis-touch-430.png')});
   const labExit=await exitBattle();
   assert.equal(labExit.screen,'home');
   assert.equal(labExit.overlays,0,'old spell callout leaked after leaving Lab');
   const receipt={width,height,quick:{ready:quickReady,...quick,exit:quickExit},
     draft:{picks,...draft,exit:draftExit},lab:{...lab,customEnemyTurtles:configured,swipe:{beforeRack,afterRack},aegis,exit:labExit}};
   results.push(receipt);
   assert.deepEqual(errors,[],'browser page errors at '+width);
   console.log('REAL TOUCH MODES '+JSON.stringify({width,quick:quick.units,draft:draft.units,
     customTurtles:configured,swipe:afterRack.scrollLeft,aegis}));
   await page.close();
  }
  fs.writeFileSync(path.join(output,'receipt.json'),JSON.stringify({note:'Real Chromium DPR3 touchscreen events; physical iPhone Safari untested',results},null,2)+'\n');
  console.log('PASS: Quick/Draft/Lab original-core starts, native touch navigation, real horizontal AEGIS swipe/cast and clean mode exits at 430/390/375 DPR3');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;server.close();});
