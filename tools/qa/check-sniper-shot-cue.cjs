'use strict';
// Read-only shooter telemetry: prove the renderer's recovered muzzle flash is
// a REAL sniper rifle fire, not a buttstroke or phantom bullet at high speeds.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const render=read('v3/v3.js'),base=read('v3/legacy-sim-core.js');
const head=render.indexOf('function sniperShotReset('),tail=render.indexOf('function spawnFX(next){',head);
assert(head>0&&tail>head&&render.indexOf('function sniperShotReset(',head+1)<0,'single sniper cooldown helper');
const sniperShotReset=vm.runInNewContext(render.slice(head,tail)+';sniperShotReset',{Number});
assert(sniperShotReset({cooldown:0},{type:'sniper',cooldown:60}),'rifle reset should be recognized');
assert(!sniperShotReset({cooldown:26},{type:'sniper',cooldown:25}),'countdown is not a shot');
assert(!sniperShotReset({cooldown:0},{type:'sniper',cooldown:26}),'buttstroke must not look like rifle fire');
assert(!sniperShotReset({cooldown:0},{type:'knight',cooldown:78}),'other types cannot create sniper cues');
assert(!sniperShotReset(null,{type:'sniper',cooldown:78}),'initial snapshot does not imply a shot');
assert(!sniperShotReset({cooldown:10},{type:'sniper',cooldown:NaN}),'invalid numeric state');
const cueStart=render.indexOf('if(sniperShotReset(old,u)'),cueEnd=render.indexOf("if(old.action!==u.action&&p&&density<26",cueStart);
assert(cueStart>0&&cueEnd>cueStart,'recovered sniper cue must exist in spawnFX');
const cue=render.slice(cueStart,cueEnd);
assert(cue.includes("!(u.action==='attack'&&old.action!==u.action)"),'never double-render ordinary observed shot');
assert(cue.includes("kind:'muzzle'")&&cue.includes("kind:'casing'")&&cue.includes("kind:'muzzleShock'"),'existing authored shooter FX reused');
assert(!cue.includes("kind:'shot'"),'unknown old shot target must not create artificial tracer');
assert(cue.includes("density<=48||(u.id+next.tick)%Math.max(2,Math.ceil(density/40))===0"),'300-body visual density cap');
assert(render.includes('cooldown:u.cooldown'),'prev snapshot retains shooter cooldown');
const marker="u.action='attack';hit(u,t);u.aim=0;u.cooldown=u.cd;return";
assert.equal(base.split(marker).length,2,'Sniper actual fire code moved');
const observed=base.replace(marker,marker.replace('return',"window.__qaShot({tick,id:u.id});return"));
const A=['sniper','sniper','knight','sniper','dragon','goblin','sniper','turtle','mole','barbarian'];
const B=['knight','beetank','goblin','sniper','turtle','dragon','knight','goose','barbarian','assassin'];
const trials=[];
function test(src,{count,speed,mirror,seed,frames},audit){
 let env={},queue=new Map(),id=0,now=0,shots=[],prev=null,events={fires:0,actionVisible:0,resetObserved:0,recovered:0,misses:0,falsePositives:0,windows:0},errors=[];
 const hash=crypto.createHash('sha256'),raf=fn=>{const k=++id;queue.set(k,fn);return k};
 env.__qaShot=x=>shots.push(x);
 for(const js of ['evolution-rules','ultimate-abilities'])new Function('window','performance','requestAnimationFrame','cancelAnimationFrame',read('v3/'+js+'.js'))(env,{now:()=>now},raf,k=>queue.delete(k));
 new Function('window','performance','requestAnimationFrame','cancelAnimationFrame',src)(env,{now:()=>now},raf,k=>queue.delete(k));
 const form=side=>Array.from({length:count/2},(_,i)=>({type:(mirror?(side==='blue'?B:A):(side==='blue'?A:B))[i%10],level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
 const core=env.LegacySimCore;
 core.configure({seed,speed,onState:s=>{
  hash.update(JSON.stringify(s)+'\n');
  if(prev&&audit){
   const oldBy=new Map(prev.units.map(u=>[u.id,u]));
   const eventsThis=new Set(shots.filter(h=>h.tick>prev.tick&&h.tick<=s.tick).map(h=>h.id));
   let predicted=new Set(),visible=new Set(),reset=new Set();
   for(const u of s.units){
    if(u.hp<=0||u.type!=='sniper')continue;
    const old=oldBy.get(u.id);if(!old)continue;
    if(u.action==='attack'&&old.action!==u.action)visible.add(u.id);
    if(sniperShotReset(old,u))reset.add(u.id);
    if(visible.has(u.id)||reset.has(u.id))predicted.add(u.id);
   }
   events.fires+=eventsThis.size;
   events.actionVisible+=[...eventsThis].filter(id=>visible.has(id)).length;
   events.resetObserved+=[...eventsThis].filter(id=>reset.has(id)).length;
   events.recovered+=[...eventsThis].filter(id=>predicted.has(id)).length;
   events.misses+=[...eventsThis].filter(id=>!predicted.has(id)).length;
   events.falsePositives+=[...predicted].filter(id=>!eventsThis.has(id)).length;
   events.windows++;
  }
  prev=s;
 }});
 core.deploy(form('blue'),form('red'));core.setRunning(true);
 for(let i=0;i<frames;i++){
  now+=16.667;const batch=[...queue.values()];queue.clear();for(const fn of batch)fn(now);
  if(core.getState().winner)break;
 }
 return{...events,shotCalls:shots.length,snapshotDigest:hash.digest('hex'),lastTick:core.getState().tick};
}
for(const cfg of [{count:20,speed:4,mirror:false,seed:1337,frames:170},
 {count:40,speed:10,mirror:true,seed:9917,frames:140}]){
 assert.equal(test(base,cfg,false).snapshotDigest,test(observed,cfg,true).snapshotDigest,'read-only fire callback changed RC4 state');
}
for(const count of [20,40,80])for(const speed of [1,4,10])for(const mirror of [false,true]){
 const cfg={count,speed,mirror,seed:1337,frames:count===80?125:170};
 const {snapshotDigest,...row}=test(observed,cfg,true);
 assert.equal(row.falsePositives,0,'phantom Sniper fire at '+JSON.stringify(cfg));
 assert(row.recovered<=row.fires,'more recovered shots than actual shots');
 trials.push({...cfg,...row});
 console.log('SNIPER SHOT CUE '+JSON.stringify({count,speed,mirror,shots:row.fires,actionOnly:row.actionVisible,cooldownRecovered:row.resetObserved,realRecovered:row.recovered,falsePositives:row.falsePositives}));
}
const totals=(arr)=>arr.reduce((r,x)=>{for(const k of ['fires','actionVisible','resetObserved','recovered','misses','falsePositives'])r[k]=(r[k]||0)+x[k];return r},{});
const report={status:'renderer-only actual Sniper shot FX recovery, never changes RC4',totals:totals(trials),rapid:totals(trials.filter(x=>x.speed===10)),trials,
 caveats:'At 1x early samples no shots may have fired yet. Rifle cooldown reset >26 excludes 26-tick melee buttstroke. Excludes dead shooters before next sample, otherwise matches actual shot calls. Target may change between frames: render muzzle/casing only, no invented bullet tracer. At density >48 only sampled units get recovery to cap FX.'};
assert(report.totals.fires>=100,'sample too small to validate real rifle fire');
assert(report.totals.recovered>=report.totals.fires*.97,'recovery dropped too many real shots');
if(process.env.QA_SNIPER_RECEIPT)fs.writeFileSync(process.env.QA_SNIPER_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('SNIPER SHOT RECOVERY SUMMARY '+JSON.stringify({totals:report.totals,rapid:report.rapid,parity:true}));
console.log('PASS: actual rifle firing FX recovered without synthetic bullets or 300-fighter VFX flood');
