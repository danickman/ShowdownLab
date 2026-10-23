'use strict';
// Physical-source Chromium failure recovery: actual 300 fighter Worker after positive HP damage.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),puppeteer=require('puppeteer');
const root=path.resolve(__dirname,'../..'),out=path.resolve(process.env.QA_FAST300_RECOVERY_OUTPUT||'/tmp/showdown-fast300-recovery');fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json'};
const server=http.createServer((req,res)=>{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/\/$/,'/index.html');const full=path.resolve(root,'.'+p);if(!full.startsWith(root+path.sep)){res.writeHead(403);return res.end()}try{res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type',mime[path.extname(full)]||'application/octet-stream');res.end(fs.readFileSync(full))}catch(e){res.writeHead(404);res.end()}});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await puppeteer.launch({headless:true,executablePath:process.env.QA_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
const report={sha:process.env.GITHUB_SHA||'',kind:'direct source-backed 300 browser Worker mid-battle fault, explicit safe-mode restart and no ghost winner',checks:[],errors:[]};
try{const page=await browser.newPage();page.on('pageerror',e=>report.errors.push(String(e.message)));
await page.setBypassServiceWorker(true);await page.setViewport({width:430,height:932,deviceScaleFactor:3,isMobile:true,hasTouch:true});
await page.evaluateOnNewDocument(()=>{const Native=window.Worker;window.Worker=new Proxy(Native,{construct(C,args){const w=Reflect.construct(C,args);window.__qaLiveWorker=w;return w}})});
await page.goto('http://127.0.0.1:'+server.address().port+'/?qa=1',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&window.ShowdownQA&&window.ShowdownAdapter,{timeout:90000});
const result=await page.evaluate(async()=>{
 const wait=ms=>new Promise(r=>setTimeout(r,ms)),types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
 const army=Object.fromEntries(types.map(t=>[t,15])),levels=Object.fromEntries(types.map((t,i)=>[t,[1,4,5][i%3]]));
 ShowdownAdapter.setSpeed(1);ShowdownAdapter.startMatch({blue:army,red:army,blueLevels:levels,redLevels:levels,blueLives:4,redLives:4,seed:81337});
 const deadline=performance.now()+15000;let state=ShowdownAdapter.getState();
 while((state.debug?.tick||0)<20&&performance.now()<deadline){if(window.__showdownThreadStats?.errors?.length)throw Error('Worker failed before fault injection');await wait(60);state=ShowdownAdapter.getState()}
 if((state.debug?.tick||0)<20||window.__showdownThreadStats.mode!=='worker')throw Error('300 real Worker tick>=20 required');
 const previous={tick:state.debug.tick,battleId:state.battleId,unitCount:state.units.length,phase:state.phase,health:state.units.reduce((s,u)=>s+u.hp,0)};
 window.__qaLiveWorker.dispatchEvent(new ErrorEvent('error',{message:'QA controlled browser error after real combat'}));
 await wait(200);state=ShowdownAdapter.getState();
 const failure={tick:state.debug?.tick,battleId:state.battleId,unitCount:state.units.length,phase:state.phase,playing:state.playing,health:state.units.reduce((s,u)=>s+u.hp,0),mode:window.__showdownThreadStats.mode,rollbacks:window.__showdownThreadStats.rollbacks,stops:window.__showdownThreadStats.recoveryStops,prompt:!!document.querySelector('#fast300-recovery'),spell:ShowdownAdapter.castSpell('quake',1).ok};
 if(!failure.prompt)throw Error('No visible safe-mode recovery prompt after combat Worker fault');
 document.querySelector('#fast300-recovery button').click();await wait(300);state=ShowdownAdapter.getState();
 const restarted={battleId:state.battleId,phase:state.phase,mode:window.__showdownThreadStats.mode,initialUnits:state.units.length,recoveryPrompt:!!document.querySelector('#fast300-recovery')};
 return{previous,failure,restarted};
});
assert(result.previous.tick>=20&&result.previous.unitCount>=300,'genuine battle must have progressed');
assert.equal(result.failure.battleId,result.previous.battleId);assert.equal(result.failure.phase,'battle');
assert.equal(result.failure.playing,false);assert.equal(result.failure.tick,result.previous.tick,'must retain last confirmed physics tick, not reset it');
assert.equal(result.failure.health,result.previous.health,'must not fabricate full HP restore before opt-in');
assert.equal(result.failure.mode,'recovery');assert.equal(result.failure.rollbacks,0);assert.equal(result.failure.stops,1);
assert.equal(result.failure.spell,false);assert(result.restarted.battleId>result.previous.battleId);
assert.equal(result.restarted.mode,'inline');assert.equal(result.restarted.phase,'battle');assert(!result.restarted.recoveryPrompt);
report.checks.push(result);assert.deepEqual(report.errors,[]);report.passed=true;console.log('FAST300 FAILURE RECOVERY '+JSON.stringify(result));
}finally{fs.writeFileSync(path.join(out,'worker-recovery.json'),JSON.stringify(report,null,2)+'\n');await browser.close()}})().catch(e=>{console.error('FAST300 RECOVERY ERROR',e.stack||e);process.exitCode=1}).finally(()=>server.close());
