// Real Chromium regression: a broken next release cannot evict the working offline PWA.
// Uses two service-worker script versions behind the same local URL, with an HTTP 200 but SHA-256 mismatched runtime module.
'use strict';
const http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert'),puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'../..'),out=path.resolve(process.env.QA_UPGRADE_OUTPUT||'/tmp/showdown-upgrade');
fs.mkdirSync(out,{recursive:true});
const original=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const oldVersion=original.match(/const CACHE='([^']+)'/)[1];
const newVersion=oldVersion+'-candidate';
const badModule='/v3/ultimate-knight.js?v=ultimate1';
const broken=original.replace("const CACHE='"+oldVersion+"'","const CACHE='"+newVersion+"'");
let candidate=false,failedFetches=0;
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://local');
 if(u.pathname==='/sw.js'){res.setHeader('Content-Type','text/javascript');res.setHeader('Cache-Control','no-store');res.end(candidate?broken:original);return}
 if(candidate&&u.pathname+u.search===badModule){failedFetches++;res.writeHead(200,{'Content-Type':'text/javascript'});res.end('/* tampered HTTP 200 runtime payload */');return}
 const name=decodeURIComponent(u.pathname).replace(/\/$/,'/index.html'),file=path.resolve(root,'.'+name);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return}
 try{res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(fs.readFileSync(file))}
 catch{res.writeHead(404);res.end()}
});
const sleep=ms=>new Promise(done=>setTimeout(done,ms));
(async()=>{
 await new Promise(done=>server.listen(0,'127.0.0.1',done));
 const browser=await puppeteer.launch({headless:true,executablePath:process.env.QA_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const receipt={oldVersion,newVersion,badModule,failedFetches:0,offlineRecovered:false,passed:false};
 try{
  const page=await browser.newPage();
  const url='http://127.0.0.1:'+server.address().port+'/?qa=1';
  await page.goto(url,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.body.classList.contains('assets-ok'),{timeout:30000});
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&!!navigator.serviceWorker.controller,{timeout:30000});
  const oldCache=await page.evaluate(async()=>{const keys=await caches.keys();return keys.find(k=>k.startsWith('showdown-lab-release'))});
  assert.equal(oldCache,oldVersion,'working prior release not installed');
  candidate=true;
  // Force fetch of a different service worker script. The new bundle must fail installation.
  await page.evaluate(async()=>{const reg=await navigator.serviceWorker.getRegistration();await reg.update()});
  for(let i=0;i<25&&failedFetches===0;i++)await sleep(400);
  assert(failedFetches>0,'candidate SHA-256 mismatch was never exercised');
  // Wait for failed SW install cleanup rather than racing on a 500ms sleep.
  await page.waitForFunction(async version=>{const reg=await navigator.serviceWorker.getRegistration();return !(await caches.keys()).includes(version)&&!reg?.installing},{timeout:15000},newVersion);
  const state=await page.evaluate(async()=>{
   const reg=await navigator.serviceWorker.getRegistration();
   return {keys:await caches.keys(),active:!!reg.active,waiting:!!reg.waiting};
  });
  assert(state.active&&!state.waiting,'failed candidate must not replace active worker');
  assert(state.keys.includes(oldVersion),'working cache was removed');
  assert(!state.keys.includes(newVersion),'failed candidate staged cache was not discarded');
  await page.setOfflineMode(true);
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&!!navigator.serviceWorker.controller,{timeout:30000});
  assert(await page.evaluate(()=>!!document.querySelector('.screen-home.active')),'failed upgrade broke offline Home');
  receipt.failedFetches=failedFetches;receipt.offlineRecovered=true;receipt.passed=true;
  await page.screenshot({path:path.join(out,'offline-after-failed-upgrade.png')});
  console.log('PASS: Chromium rejected tampered HTTP 200 JavaScript via SHA-256; old worker/cache retained; offline Home boots');
 }finally{fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(receipt,null,2)+'\n');await browser.close()}
})().catch(err=>{console.error(err.stack||err);process.exitCode=1}).finally(()=>server.close());
