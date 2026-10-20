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
  results.push({width,height,assets:{requested:view.assets.requested,ready:view.assets.ready},art:view.art.map(x=>({type:x.type,level:x.level,opaque:x.opaque,edge:x.edge})),overflow:view.overflow});
  await page.close();
 }
 assert.deepEqual(errors,[],'no portrait rendering exceptions');
 fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify({note:'Chromium DPR3 touch only; native Safari not tested',results},null,2)+'\n');
 console.log('PASS: 90 actual authored art canvases (10 fighters x3 forms x3 DPR3 viewports), panel geometry, nonblank full-body alpha, tactical Guide truth, zero missing art');
 }finally{if(browser)await browser.close();server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
