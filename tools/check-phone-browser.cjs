// Real Puppeteer/Chromium evidence. Run against a local server or preview URL.
// NODE_PATH=<qa node_modules> QA_BROWSER_PATH=<chrome> node tools/check-phone-browser.cjs URL OUTPUT_DIR
const fs=require('fs'),path=require('path'),assert=require('assert'),puppeteer=require('puppeteer');
let base=process.argv[2]||'local';const out=path.resolve(process.argv[3]||'../phone-browser-review');
fs.mkdirSync(out,{recursive:true});
const delay=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 let server;if(base==='local'){server=require('http').createServer((req,res)=>{const file=path.resolve(__dirname,'..','.'+new URL(req.url,'http://local').pathname.replace(/\/$/,'/index.html'));if(!file.startsWith(path.resolve(__dirname,'..')+path.sep)){res.writeHead(403);return res.end()}try{const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.webmanifest':'application/manifest+json'};res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.end(fs.readFileSync(file))}catch{res.writeHead(404);res.end()}});await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port}
 const browser=await puppeteer.launch({headless:true,executablePath:process.env.QA_BROWSER_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 const report={browser:await browser.version(),emulation:'Chromium desktop, not physical Safari/FPS approval',scenes:[],errors:[],assetFailures:[],frameSamples:[],flows:[]};
 try{
 const page=await browser.newPage();await page.setViewport({width:430,height:932,deviceScaleFactor:3,isMobile:true,hasTouch:true});
 page.on('pageerror',e=>report.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)report.assetFailures.push({url:r.url(),status:r.status()})});
 await page.goto(base+'/?qa=1',{waitUntil:'networkidle0'});await page.waitForFunction(()=>document.body.classList.contains('assets-ok')&&window.ShowdownQA&&FighterAssets.diagnostics().ready===FighterAssets.diagnostics().total);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'portrait horizontal overflow');
 await page.screenshot({path:path.join(out,'portrait-home.png')});
 await page.click('[data-go="guide"]');await page.waitForSelector('.sl-guide-card');assert.equal(await page.$$eval('.sl-guide-card',es=>es.length),10);await page.screenshot({path:path.join(out,'portrait-guide.png')});
 await page.click('.screen-guide [data-go="home"]');await page.click('[data-mode="quick"]');
 if(await page.$('.screen-ready.active'))await page.click('.screen-ready [data-go="battle"]');
 await page.waitForSelector('.screen-battle.active');
 const fixtures=[{name:'dragon-duel',blue:{dragon:1},red:{dragon:1}},{name:'dragon-pack',blue:{dragon:8},red:{knight:6,turtle:2}},{name:'mixed-heavies',blue:{dragon:3,beetank:3,turtle:3},red:{dragon:3,barbarian:3,knight:3}},{name:'ultimate-knight',blue:{knight:6},red:{barbarian:3,goblin:6}},{name:'extreme',blue:{dragon:40,knight:50},red:{turtle:40,goblin:50}}];
 for(const fixture of fixtures.filter(f=>!process.env.QA_CASES||process.env.QA_CASES.split(',').includes(f.name))){
  await page.click('#battleMenu');await page.click('#battleSheet [data-go="home"]');
  await page.evaluate(f=>{const original=ShowdownAdapter.startBattle,levels=a=>Object.fromEntries(Object.keys(a).map(t=>[t,5]));ShowdownAdapter.startBattle=cfg=>{ShowdownAdapter.startBattle=original;original({...cfg,...f,blueLevels:levels(f.blue),redLevels:levels(f.red),seed:1337});LegacySimCore.setRunning(false)}},fixture);
  await page.click('[data-mode="quick"]');if(await page.$('.screen-ready.active'))await page.click('.screen-ready [data-go="battle"]');await page.waitForSelector('.screen-battle.active');
  await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
  const first=await page.evaluate(()=>ShowdownQA.snapshot());assert(first.units.length);assert(first.units.every(u=>Number.isFinite(u.screenX)&&Number.isFinite(u.screenY)));
  const blue=first.units.filter(u=>u.team==='blue'),red=first.units.filter(u=>u.team==='red');
  const ordered=Math.max(...blue.map(u=>u.screenX))<Math.min(...red.map(u=>u.screenX));
  const contained=first.units.every(u=>u.box.left>=first.arena.x-1&&u.box.right<=first.arena.x+first.arena.w+1&&u.box.top>=first.arena.y-1&&u.box.bottom<=first.arena.y+first.arena.h+1);
  report.scenes.push({name:fixture.name,firstFrame:first,ordered,contained});
  await page.screenshot({path:path.join(out,fixture.name+'-opening.png')});
  await page.evaluate(()=>LegacySimCore.setRunning(true));
  if(fixture.name==='dragon-pack'||fixture.name==='extreme')report.frameSamples.push({name:fixture.name,viewport:'430x932 DPR3',speed:1,values:await page.evaluate(()=>new Promise(resolve=>{const values=[];let last=performance.now(),done=false;const finish=()=>{if(!done){done=true;resolve(values)}};setTimeout(finish,3500);function frame(t){if(done)return;values.push(t-last);last=t;if(values.length>=90)finish();else requestAnimationFrame(frame)}requestAnimationFrame(frame)}))});
  for(const [label,ms]of [['half-second',500],['two-seconds',1500],['five-seconds',3000]]){await delay(ms);report.scenes.push({name:fixture.name+'-'+label,snapshot:await page.evaluate(()=>ShowdownQA.snapshot())});await page.screenshot({path:path.join(out,fixture.name+'-'+label+'.png')})}
 }
 await page.evaluate(()=>LegacySimCore.setRunning(false));
 await page.setViewport({width:932,height:430,deviceScaleFactor:3,isMobile:true,hasTouch:true});await delay(200);await page.screenshot({path:path.join(out,'landscape-battle.png')});
 // Exercise real Draft and Lab navigation, level input, spell and round transition.
 await page.click('#battleMenu');await page.click('#battleSheet [data-go="home"]');await page.setViewport({width:430,height:932,deviceScaleFactor:3,isMobile:true,hasTouch:true});
 await page.click('.screen-home [data-go="draft"]');await page.waitForSelector('.screen-draft.active');
 const cards=await page.$$('.screen-draft .fighter-card');assert(cards.length>=2);await cards[0].click();await cards[1].click();assert(await page.evaluate(()=>!document.querySelector('#confirmDraft').disabled),'Draft two-card selection');await page.click('#confirmDraft');await page.click('.screen-ready [data-go="battle"]');await page.waitForSelector('.screen-battle.active');
 report.flows.push({name:'draft',screen:await page.evaluate(()=>ShowdownQA.snapshot().screen)});
 await page.click('#battleMenu');await page.click('#battleSheet [data-go="home"]');await page.click('[data-go="lab"]');
 await page.evaluate(()=>{const input=document.querySelector('#labBlueLevel');input.value='4';input.dispatchEvent(new Event('input',{bubbles:true}));const pick=document.querySelector('#labBlue [data-lab-unit]')||document.querySelector('#labBlue button');pick?.click()});
 await page.click('#labRun');await page.waitForSelector('.screen-battle.active');await delay(200);const lab=await page.evaluate(()=>ShowdownAdapter.getState());assert(lab.units.some(u=>u.team==='blue'&&u.level===4),'Lab L4 input reaches core');
 await page.click('[data-spell="zap"]');await delay(250);assert(await page.evaluate(()=>ShowdownQA.snapshot().effects>0),'spell effects emitted');report.flows.push({name:'lab-L4-spell',levels:lab.levels});
 for(let i=0;i<6;i++)await page.evaluate(()=>ShowdownAdapter.castSpell('quake',100));
 await page.waitForFunction(()=>['round_over','match_over'].includes(ShowdownAdapter.getState().phase),{timeout:15000});report.flows.push({name:'round-terminal',phase:await page.evaluate(()=>ShowdownAdapter.getState().phase)});
 await page.screenshot({path:path.join(out,'lab-terminal.png')});
 assert.equal(report.errors.length,0,'application page errors');assert.equal(report.assetFailures.length,0,'failed asset responses');
 if(process.env.QA_ENFORCE_OPENING==='1')for(const scene of report.scenes.filter(s=>s.firstFrame)){assert(scene.ordered,scene.name+' opening team order');assert(scene.contained,scene.name+' opening sprite containment')}
 console.log('PASS: real browser cold-load, ten Guide cards, Quick/Draft/Lab/spell/terminal flows, '+report.scenes.filter(s=>s.firstFrame).length+' simulator fixtures, time-series screenshots, landscape smoke and error capture');
 }finally{fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(report,null,2));await browser.close();if(server)server.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
