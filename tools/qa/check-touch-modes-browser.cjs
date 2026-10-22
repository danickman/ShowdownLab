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
   assert.match(await page.$eval('#rosterContent .bay-wallet small',x=>x.textContent),
      /Play Quick or Draft for Parts.*Blue victories earn a bonus/,
      'visible Upgrade Bay description must match actual currency rewards');
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
   await page.waitForSelector('[data-screen="lab"].active #labRun');
   await touch('#labChooseEnemies',true);
   await page.waitForSelector('[data-screen="lab-enemies"].active #labEnemyPicker');
   await touch('[data-enemy-plus-five="turtle"]',true);
   assert.match(await page.$eval('#labEnemyTotal',x=>x.textContent),/^5 \/ 60/);
   await touch('#labEnemyDone',true);
   await page.waitForSelector('[data-screen="lab"].active');
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

   // Only the native 430px viewport runs a COMPLETE true terminal Lab
   // journey. Do not synthesize match_over, inject winner events, fake HP
   // or click "End test battle": actual L1 combat must eliminate a side.
   let terminal=null;
   if(width===430){
     const partsBefore=await page.$eval('[data-screen="home"] [data-parts]',x=>Number(x.textContent));
     await touch('.screen-home.active [data-go="lab"]');
     await page.waitForSelector('[data-screen="lab"].active #labRun');
     await touch('[data-lab-unit="knight"]',true);
     await touch('[data-preset="boss"]',true);
     async function tapRange(selector,maximum){
       const r=await page.$eval(selector,e=>{const p=e.getBoundingClientRect();return{left:p.left,right:p.right,y:p.top+p.height/2}});
       await page.touchscreen.tap(maximum?r.right-4:r.left+4,r.y);
       await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
       return Number(await page.$eval(selector,e=>e.value));
     }
     const lives=await tapRange('#labLives',false);
     const speedSetting=await tapRange('#labSpeed',true);
     assert.equal(lives,1,'one-life Lab slider must respond to a real touch');
     assert.equal(speedSetting,4,'Lab speed slider must reach 10x using real touch');
     await touch('#labRun',true);
     const finalStart=await battle('lab');
     const initial=await page.evaluate(()=>{const s=ShowdownAdapter.getState();return{
       blue:s.armies?.blue,red:s.armies?.red,blueLives:s.blueLives,redLives:s.redLives,
       speed:s.speed,round:s.round,phase:s.phase,units:s.units.length};});
     assert(initial.blue?.knight>0&&Object.entries(initial.blue).filter(([,n])=>n>0).length===1,'one selected Knight SQUAD must map to its actual source battle count');
     assert(initial.red?.dragon>0&&Object.entries(initial.red).filter(([,n])=>n>0).length===1,'Boss Dragon SQUAD must map to its actual source battle count');
     assert.equal(initial.blueLives,1,'one-life Blue setup');assert.equal(initial.redLives,1,'one-life Red setup');
     assert.equal(initial.speed,10,'touch-selected Lab speed persisted into original engine');
     await page.waitForFunction(()=>ShowdownAdapter.getState().phase==='match_over' &&
       !!document.querySelector('.match-finish:not(.hidden) #mfContinue'),{timeout:60000});
     const finished=await page.evaluate(()=>{const s=ShowdownAdapter.getState();return{
       phase:s.phase,winner:s.winner,round:s.round,blueLives:s.blueLives,redLives:s.redLives,
       blueAlive:s.units.filter(u=>u.team==='blue'&&u.hp>0).length,
       redAlive:s.units.filter(u=>u.team==='red'&&u.hp>0).length,
       finish:document.querySelector('#mfTitle')?.textContent};});
     assert.equal(finished.phase,'match_over','real original core must finish');
     assert(['blue','red','draw'].includes(finished.winner),'true terminal result must name a winner or physical draw');
     assert(finished.blueAlive===0||finished.redAlive===0,'actual positive-HP army eliminated');
     if(finished.winner==='blue')assert(finished.blueAlive>0&&finished.redAlive===0,'Blue actual terminal winner');
     if(finished.winner==='red')assert(finished.redAlive>0&&finished.blueAlive===0,'Red actual terminal winner');
     if(finished.winner==='draw')assert(finished.blueAlive===0&&finished.redAlive===0,'draw only for physical double KO');
     // Genuine match-finish HTML layout at three DPR3 portrait sizes.
     // Test existing actual winner and text; no synthetic DOM or fake result.
     const finishLayouts=[];
     for(const [vw,vh] of [[430,932],[390,844],[375,667]]){
       await page.setViewport({width:vw,height:vh,deviceScaleFactor:3,isMobile:true,hasTouch:true});
       const metrics=await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(()=>{
         const rect=e=>{const r=e.getBoundingClientRect();return{top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height}},
           card=rect(document.querySelector('.match-finish:not(.hidden) .mf-card')),
           message=rect(document.querySelector('.match-finish:not(.hidden) #mfText')),
           button=rect(document.querySelector('.match-finish:not(.hidden) #mfContinue'));
         done({viewport:[innerWidth,innerHeight],card,message,button,gap:button.top-message.bottom});
       }))));
       assert(metrics.gap>=14,'real terminal message/button must have 14px separation '+JSON.stringify(metrics));
       assert(metrics.button.height>=48&&metrics.button.bottom<=vh-12&&metrics.card.top>=12,
         'finish card and finger target must fit viewport '+JSON.stringify(metrics));
       finishLayouts.push(metrics);
     }
     await page.setViewport({width,height,deviceScaleFactor:3,isMobile:true,hasTouch:true});
     await page.evaluate(()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done))));
     await page.screenshot({path:path.join(output,'lab-terminal-430.png')});
     await touch('#mfContinue');
     await page.waitForSelector('[data-screen="results"].active #resultTitle');
     const shown=await page.evaluate(()=>({
       screen:ShowdownQA.snapshot().screen,title:document.querySelector('#resultTitle').textContent,
       reward:document.querySelector('#resultReward').textContent,
       parts:Number(document.querySelector('[data-screen="home"] [data-parts]').textContent),
       calls:document.querySelectorAll('.ability-callout').length}));
     assert.equal(shown.screen,'results');
     assert.equal(await page.$eval('.screen-results .eyebrow',e=>e.textContent),'EXPERIMENT COMPLETE');
     assert.match(shown.reward,/no Parts awarded/i,'Lab must not earn match currency');
     assert.equal(shown.parts,partsBefore,'no Lab Parts farming');
     assert.equal(shown.calls,0,'no stale spell callout on Results');
     assert.match(shown.title,finished.winner==='draw'?/DRAW/:new RegExp(finished.winner.toUpperCase()+' WINS'));
     await page.screenshot({path:path.join(output,'lab-results-430.png')});
     await touch('[data-screen="results"].active [data-go="battle"]');
     const rematch=await battle('lab');
     const resumed=await page.evaluate(()=>{const s=ShowdownAdapter.getState();return{
       blue:s.armies?.blue,red:s.armies?.red,blueLives:s.blueLives,redLives:s.redLives,
       speed:s.speed,round:s.round,units:s.units.length,
       staleEffects:document.querySelectorAll('.ability-callout,.match-finish:not(.hidden),.round-draft:not(.hidden)').length};});
     assert.equal(resumed.blue?.knight,initial.blue.knight,'rematch keeps exact genuine Blue squad count');
     assert.equal(resumed.red?.dragon,initial.red.dragon,'rematch keeps exact genuine Boss squad count');
     assert.equal(resumed.blueLives,1,'rematch restores actual Blue life');
     assert.equal(resumed.redLives,1,'rematch restores actual Red life');
     assert.equal(resumed.speed,10,'rematch retains configured speed');
     assert.equal(resumed.staleEffects,0,'rematch cannot inherit old end-of-match overlays');
     terminal={initial,finished,finishLayouts,shown,rematch:{...rematch,...resumed}};
     console.log('REAL LAB TERMINAL '+JSON.stringify(terminal));
     await exitBattle();

     // Complete BOTH standard four-life modes through their true own
     // between-round flows. Never fake match_over, units, winner or lives.
     // One 430px viewport is enough here; 390/375 retain all touch gates.
     async function completeMultiround(mode){
       const firstParts=Number(await page.$eval('[data-screen="home"] [data-parts]',x=>x.textContent));
       if(mode==='quick'){
         await touch('.screen-home.active [data-mode="quick"]');
         await page.waitForSelector('.screen-ready.active');
       }else{
         await touch('.screen-home.active [data-go="draft"]');
         await page.waitForSelector('.screen-draft.active #draftGrid .fighter-card');
         await touch('#draftGrid [data-unit="knight"]');
         await touch('#draftGrid [data-unit="sniper"]');
         await touch('#confirmDraft');
         await page.waitForSelector('.screen-ready.active');
       }
       await touch('.screen-ready.active [data-go="battle"]');
       const started=await battle(mode);
       const initial=await page.evaluate(()=>{const s=ShowdownAdapter.getState();return{
         lives:[s.blueLives,s.redLives],round:s.round,phase:s.phase,speed:s.speed,battleId:s.battleId};});
       assert.deepEqual(initial.lives,[4,4],mode+' original four-life rules');
       assert.equal(initial.round,1,mode+' starts Round 1');
       await touch('#battleMenu');
       await touch('#battleSheet:not(.hidden) [data-speed="10"]');
       assert.equal(Number(await page.$eval('#speedReadout',x=>x.textContent.replace(/[^\d]/g,''))),10,
         mode+' real touchscreen switched to 10x');
       // Observe transitions on the ACTUAL adapter; state is read-only.
       await page.evaluate(()=>{
         window.__modeRoundQA=[];
         window.__modeStateUnsubQA?.();
         window.__modeStateUnsubQA=ShowdownAdapter.subscribe(s=>{
           if(s.phase==='round_over'||s.phase==='match_over'){
             const prev=window.__modeRoundQA.at(-1);
             if(prev?.battleId!==s.battleId||prev?.phase!==s.phase)
               window.__modeRoundQA.push({phase:s.phase,battleId:s.battleId,round:s.round,
                 winner:s.winner,roundWinner:s.roundWinner,
                 blueLives:s.blueLives,redLives:s.redLives,
                 blueAlive:s.units.filter(u=>u.team==='blue'&&u.hp>0).length,
                 redAlive:s.units.filter(u=>u.team==='red'&&u.hp>0).length});
           }
         });
       });
       let selections=0,autoPicks=0;
       for(let step=0;step<14;step++){
         await page.waitForFunction(()=>
           ShowdownAdapter.getState().phase==='match_over' ||
           !!document.querySelector('.round-draft:not(.hidden) .rd-choices button'),
           {timeout:100000});
         const current=await page.evaluate(()=>{
           const s=ShowdownAdapter.getState(),pane=document.querySelector('.round-draft');
           return{phase:s.phase,round:s.round,paneVisible:!!pane&&!pane.classList.contains('hidden'),
             quick:pane?.classList.contains('quick-pick'),choices:pane?.querySelectorAll('.rd-choices button').length||0};
         });
         if(current.phase==='match_over')break;
         assert.equal(current.phase,'round_over',mode+' draft only after actual engine round ends');
         assert(current.paneVisible&&current.choices>0,'real RoundLoop presents playable choices');
         if(mode==='quick'){
           // On round one a real finger chooses; subsequent rounds also
           // prove the natural four-second quick auto-pick is functional.
           if(selections===0){
             await touch('.round-draft:not(.hidden) .rd-choices button:first-child',true);
             selections++;
           }else{
             const priorRound=current.round;
             await page.waitForFunction(r=>ShowdownAdapter.getState().round>r||
               ShowdownAdapter.getState().phase==='match_over',{timeout:12000},priorRound);
             autoPicks++;
           }
         }else{
           // Real Draft preview must first ENABLE its Deploy control.
           await touch('.round-draft:not(.hidden) .rd-choices button:first-child',true);
           assert.equal(await page.$eval('#rdNext',e=>e.disabled),false,'Draft pick enables deploy');
           await touch('.round-draft:not(.hidden) #rdNext',true);
           selections++;
         }
         // Do not issue another choice until the original engine starts
         // the next battle, or naturally finishes the whole match.
         await page.waitForFunction(r=>
           ShowdownAdapter.getState().round>r ||
           ShowdownAdapter.getState().phase==='match_over',{timeout:20000},current.round);
       }
       await page.waitForFunction(()=>ShowdownAdapter.getState().phase==='match_over'&&
         !!document.querySelector('.match-finish:not(.hidden) #mfContinue'),{timeout:100000});
       const completed=await page.evaluate(()=>{
         const s=ShowdownAdapter.getState();return{phase:s.phase,round:s.round,winner:s.winner,
           lives:[s.blueLives,s.redLives],blueAlive:s.units.filter(u=>u.team==='blue'&&u.hp>0).length,
           redAlive:s.units.filter(u=>u.team==='red'&&u.hp>0).length,
           rounds:window.__modeRoundQA.slice(),banner:document.querySelector('#mfTitle').textContent};
       });
       assert(completed.round>=2,mode+' must naturally finish AFTER at least one round transition');
       assert(completed.rounds.filter(x=>x.phase==='round_over').length>=1,
         mode+' must really register a nonfinal terminal round');
       assert.equal(completed.rounds.filter(x=>x.phase==='match_over').length,1,
         mode+' has exactly one final match result');
       assert(completed.lives.some(l=>l===0),'original four-life match ended due to depleted lives');
       assert(completed.blueAlive===0||completed.redAlive===0,'terminal has true eliminated army');
       assert(['blue','red','draw'].includes(completed.winner));
       if(completed.winner==='blue')assert(completed.blueAlive>0&&completed.redAlive===0,'actual Blue survivors');
       if(completed.winner==='red')assert(completed.redAlive>0&&completed.blueAlive===0,'actual Red survivors');
       if(completed.winner==='draw')assert(completed.blueAlive===0&&completed.redAlive===0,'real double KO');
       if(mode==='quick')assert(selections===1,'Quick touchscreen boost chosen on first opportunity');
       else assert(selections>=1,'Draft user must actually pick and deploy');
       const finishCheck=await page.evaluate(()=>{
         const a=document.querySelector('#mfText').getBoundingClientRect(),
           b=document.querySelector('#mfContinue').getBoundingClientRect();
         return{gap:b.top-a.bottom,buttonHeight:b.height,ctaReach:document.elementFromPoint(
           b.left+b.width/2,b.top+b.height/2)?.closest('#mfContinue')!==null};
       });
       assert(finishCheck.gap>=14&&finishCheck.ctaReach&&finishCheck.buttonHeight>=48,
         mode+' natural end panel stays touch readable');
       await page.screenshot({path:path.join(output,mode+'-real-four-life-finish-430.png')});
       await touch('#mfContinue');
       await page.waitForSelector('[data-screen="results"].active #resultTitle');
       const shown=await page.evaluate(()=>({
         heading:document.querySelector('.screen-results .eyebrow').textContent,
         title:document.querySelector('#resultTitle').textContent,
         parts:Number(document.querySelector('[data-screen="home"] [data-parts]').textContent),
         reward:document.querySelector('#resultReward').textContent,
         screen:ShowdownQA.snapshot().screen}));
       assert.equal(shown.screen,'results');
       assert.equal(shown.heading,'SHOWDOWN COMPLETE','Quick/Draft Results label must not say experiment');
       assert.match(shown.title,completed.winner==='draw'?/DRAW/:new RegExp(completed.winner.toUpperCase()+' WINS'));
       if(completed.winner==='draw')assert.equal(shown.parts,firstParts,'draw does not mint Parts');
       else{
         assert(shown.parts>firstParts,mode+' terminal should earn real match reward');
         assert.match(shown.reward,/PARTS/);
       }
       await page.screenshot({path:path.join(output,mode+'-real-four-life-results-430.png')});
       const next=mode==='quick'?'[data-screen="results"].active [data-mode="quick"]':
         '[data-screen="results"].active .result-actions .primary';
       await touch(next);
       await page.waitForSelector(mode==='quick'?'.screen-ready.active':'.screen-draft.active');
       const restarted=await page.evaluate(()=>({
         screen:ShowdownQA.snapshot().screen,
         leaks:document.querySelectorAll('.round-draft:not(.hidden),.match-finish:not(.hidden),.ability-callout').length,
         parts:Number(document.querySelector('[data-screen="home"] [data-parts]').textContent)}));
       assert.equal(restarted.screen,mode==='quick'?'ready':'draft');
       assert.equal(restarted.parts,shown.parts,'restart cannot double-award old result');
       assert.equal(restarted.leaks,0,'no old battle overlays leak into next match');
       return{started,initial,completed,shown,finishCheck,selections,autoPicks,restarted};
     }
     // Leave no artificial adapter manipulation. Only legal finger actions
     // and the original 10x speed switch accelerate these terminal matches.
     const naturalQuick=await completeMultiround('quick');
     if(naturalQuick.restarted.screen==='ready'){
       await touch('.screen-ready.active [data-go="battle"]');
       await exitBattle();
     }
     const naturalDraft=await completeMultiround('draft');
     if(naturalDraft.restarted.screen==='draft')await touch('.screen-draft.active [data-go="home"]');
     terminal.naturalModes={quick:naturalQuick,draft:naturalDraft};
     console.log('REAL FOUR-LIFE MODE TERMINALS '+JSON.stringify({
       quick:{round:naturalQuick.completed.round,winner:naturalQuick.completed.winner,
         picks:naturalQuick.selections,auto:naturalQuick.autoPicks,parts:naturalQuick.shown.parts},
       draft:{round:naturalDraft.completed.round,winner:naturalDraft.completed.winner,
         picks:naturalDraft.selections,parts:naturalDraft.shown.parts}}));
   }
   const receipt={width,height,quick:{ready:quickReady,...quick,exit:quickExit},
     draft:{picks,...draft,exit:draftExit},lab:{...lab,customEnemyTurtles:configured,swipe:{beforeRack,afterRack},aegis,exit:labExit,terminal}};
   results.push(receipt);
   assert.deepEqual(errors,[],'browser page errors at '+width);
   console.log('REAL TOUCH MODES '+JSON.stringify({width,quick:quick.units,draft:draft.units,
     customTurtles:configured,swipe:afterRack.scrollLeft,aegis}));
   await page.close();
  }
  fs.writeFileSync(path.join(output,'receipt.json'),JSON.stringify({note:'Real Chromium DPR3 touchscreen events; physical iPhone Safari untested',results},null,2)+'\n');
  console.log('PASS: Quick/Draft/Lab original-core touch starts, AEGIS finger swipe, natural single-life squad terminal Results and rematch, no Lab rewards, clean exits at 430/390/375 DPR3');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;server.close();});
