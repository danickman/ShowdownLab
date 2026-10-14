// Turn 5H: real Chromium matched-state baseline/candidate sprite contact sheets.
// This is a visual diagnostic, NOT a runtime camera change.
'use strict';
const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'../..'),out=path.resolve(process.env.QA_VISUAL_OUTPUT||'/tmp/showdown-5h');
fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png'};
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end()}});
(async()=>{
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await puppeteer.launch({headless:true,executablePath:process.env.QA_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const report={device:'Chromium 430x932 @3x; synthetic stationary fixtures using real authored sprites, staging, and 5G dense ordering',cases:[],failures:[]};
 try{
 const page=await browser.newPage();page.on('pageerror',e=>report.failures.push(e.message));
 await page.setViewport({width:430,height:932,deviceScaleFactor:3,isMobile:true,hasTouch:true});
 await page.goto('http://127.0.0.1:'+server.address().port+'/index.html?qa=1',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.FighterAssets&&window.ShowdownCamera&&document.body.classList.contains('assets-ok'),{timeout:90000});
 const camSource=fs.readFileSync(path.join(root,'v3/camera.js'),'utf8');
 for(const fixture of [20,40,60,80,120,'live120']){
  const count=fixture==='live120'?120:fixture,live=fixture==='live120';
  const result=await page.evaluate(async({count,camSource,live})=>{
   const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
   let rng=1337;const rand=()=>{rng=(Math.imul(1664525,rng)+1013904223)>>>0;return rng/4294967296};
   let units=Array.from({length:count},(_,i)=>({id:i+1,type:types[i%10],team:i%2?'red':'blue',level:1+i%5,hp:100,
    x:.5+(i%2?.08:-.08)+(rand()-.5)*.20,y:.24+rand()*.55}));
   if(live){
    ShowdownAdapter.setSpeed(1);
    ShowdownAdapter.startMatch({blue:{knight:20,goose:20,sniper:20},red:{beetank:20,goblin:20,barbarian:20},blueLives:1,redLives:1,seed:7301});
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const snapshot=ShowdownQA.snapshot();
    if(snapshot.units.length!==120)throw Error('live combat snapshot not 120 units: '+snapshot.units.length);
    units=snapshot.units.map(u=>({id:u.id,type:u.type,team:u.team,level:u.level,hp:100,x:u.x,y:u.y}));
   }
   await Promise.all([...new Set(units.map(u=>u.type))].map(t=>FighterAssets.preloadSpecies(t)));
   const candidateSource=camSource.replace('density>55?.80','density>55?.74');
   if(candidateSource===camSource)throw Error('camera candidate substitution failed');
     // The module references window.FighterAssets / CombatStaging. Preserve those reads via proxy.
   const make=(src)=>{const windowProxy={FighterAssets,CombatStaging};new Function('window',src)(windowProxy);return windowProxy.ShowdownCamera.create(430,932)};
   const cvs=document.createElement('canvas');cvs.width=860;cvs.height=932;cvs.style.cssText='position:fixed;inset:0;z-index:999999;width:860px;height:932px;max-width:none;pointer-events:none';document.body.append(cvs);
   const ctx=cvs.getContext('2d');const results=[];
   for(const [index,source] of [[0,camSource],[1,candidateSource]]){
    const cam=make(source);for(let frame=0;frame<120;frame++)cam.focus(units);
    const own=document.createElement('canvas');own.width=430;own.height=932;const c=own.getContext('2d');
    c.fillStyle='#dce7d9';c.fillRect(0,0,430,932);const a=cam.arena;c.fillStyle='#cfbc94';c.fillRect(a.x,a.y,a.w,a.h);
    // Use real authored sprites and the same deterministic coordinates in both views.
    const stage=CombatStaging.create();for(let step=0;step<16;step++)stage.prepare(units,cam,step*16);
    const ordered=units.map(u=>({u,p:stage.point(u,cam)})).sort((a,b)=>{
      if(count<=60)return a.p.y-b.p.y||a.p.x-b.p.x;
      const laneA=Math.floor(a.p.y/12),laneB=Math.floor(b.p.y/12);
      if(laneA!==laneB)return laneA-laneB;
      const prominence=t=>t==='dragon'?3:t==='beetank'||t==='turtle'?2:t==='knight'||t==='barbarian'?1:0;
      return prominence(a.u.type)-prominence(b.u.type)||a.p.y-b.p.y||a.p.x-b.p.x||a.u.id-b.u.id;
    });
    let drawn=0;for(const {u,p} of ordered){const kind=u.type==='dragon'?'large':['turtle','beetank'].includes(u.type)?'heavy':['goblin','goose'].includes(u.type)?'small':'normal';
      const ok=FighterAssets.draw(c,u.type,p.x,p.y,cam.unitSize(kind,count),u.team,{level:u.level,action:'idle',density:count,time:2400,id:u.id});if(ok)drawn++;}
    ctx.drawImage(own,index*430,0);
    results.push({mode:index?'candidate':'baseline',drawn,zoom:cam.zoom,arena:a});
   }
   // Save pixels rather than relying on CSS viewport clipping.
   const png=cvs.toDataURL('image/png');cvs.remove();return {count,results,png};
  },{count,camSource,live});
  assert(result.results.every(x=>x.drawn===count),'authored fighter draw missing for '+count+': '+JSON.stringify(result.results));
  fs.writeFileSync(path.join(out,'composition-'+fixture+'.png'),Buffer.from(result.png.split(',')[1],'base64'));
  report.cases.push({count,fixture,results:result.results.map(({mode,drawn,zoom})=>({mode,drawn,zoom}))});
 }
 await page.close();assert.deepStrictEqual(report.failures,[]);
 report.passed=true;console.log('PASS: paired authored-sprite composition screenshots at 20/40/60/80/120 fighters plus one fixed real-combat snapshot');
 }finally{fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(report,null,2));await browser.close()}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1}).finally(()=>server.close());
