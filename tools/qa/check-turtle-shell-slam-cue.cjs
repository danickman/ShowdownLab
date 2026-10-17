'use strict';
// Permanent source-anchored Turtle slam cue QA, including no gameplay drift.
// An actual attempted shell slam is observable even if action state is skipped
// between 4x/10x display snapshots. The stamp is TELEMETRY, never combat logic.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const shipped=read('v3/legacy-sim-core.js'),renderer=read('v3/v3.js');
const oldStep="u.action='shell_slam';hit(u,t,1.65);",newStep="u.action='shell_slam';u.shellSlamTick=tick;hit(u,t,1.65);";
assert.equal(shipped.split(newStep).length,2,'real shell-slam event marker missing');
const baseline=shipped.replace(newStep,oldStep);
const instrumented=shipped.replace(newStep,"u.action='shell_slam';u.shellSlamTick=tick;window.__qaSlam({tick,id:u.id});hit(u,t,1.65);");
const start=renderer.indexOf('function turtleSlamOccurred('),end=renderer.indexOf('function spawnFX(next){',start);
assert(start>0&&end>start&&renderer.indexOf('function turtleSlamOccurred(',start+1)<0,'renderer stamp detection helper changed');
const turtleSlamOccurred=vm.runInNewContext(renderer.slice(start,end)+';turtleSlamOccurred',{Number});
assert(turtleSlamOccurred({shellSlamTick:20},{type:'turtle',shellSlamTick:34}));
assert(!turtleSlamOccurred({shellSlamTick:20},{type:'turtle',shellSlamTick:20}));
assert(!turtleSlamOccurred({shellSlamTick:20},{type:'knight',shellSlamTick:34}));
assert(!turtleSlamOccurred({shellSlamTick:undefined},{type:'turtle',shellSlamTick:undefined}));
assert(!turtleSlamOccurred(null,{type:'turtle',shellSlamTick:undefined}));
const cueStart=renderer.indexOf('if(u.hp>0&&turtleSlamOccurred(old,u)'),cueEnd=renderer.indexOf('if(beetankChargeReset(old,u)',cueStart);
assert(cueStart>0&&cueEnd>cueStart,'Turtle cue missing from actual spawnFX logic');
const cue=renderer.slice(cueStart,cueEnd);
for(const a of ["!(u.action==='shell_slam'&&old.action!==u.action)","kind:'shell_slam'","kind:'impactArc'","action:'shell_slam'","density<=48","f.kind==='shell_slam'&&now-f.t<280","density<30"])
 assert(cue.includes(a),'missing duplicate/density/real-action cue safety '+a);
for(const a of ["kind:'shot'","kind:'koBurst'","kind:'hit'","kind:'earthImpact'","t.hp=","u.hp=","shake=","flash="])
 assert(!cue.includes(a),'Turtle visual cue must not fabricate damage, KO, targeting or shake '+a);
assert(renderer.includes('special:u.special,shellSlamTick:u.shellSlamTick'),'renderer must retain previous true event stamp');
const A=['turtle','turtle','turtle','knight','beetank','goblin','turtle','mole','sniper','goose'];
const B=['turtle','goblin','beetank','knight','turtle','barbarian','dragon','goose','assassin','turtle'];
function test(source,{count,speed,mirror,seed},observe=false){
 let win={},queue=new Map(),i=0,now=0,prev=null,events=[],errors=[],metrics={actual:0,action:0,stamped:0,missed:0,falsePositives:0,windows:0};
 const digest=crypto.createHash('sha256'),raf=f=>{const id=++i;queue.set(id,f);return id};
 win.__qaSlam=e=>events.push(e);
 for(const s of ['v3/evolution-rules.js','v3/ultimate-abilities.js',source]){
  const code=s.endsWith('.js')?read(s):s;
  new Function('window','performance','requestAnimationFrame','cancelAnimationFrame',code)(win,{now:()=>now},raf,k=>queue.delete(k));
 }
 const roster=side=>Array.from({length:count/2},(_,i)=>({type:(mirror?(side==='blue'?B:A):(side==='blue'?A:B))[i%10],level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
 win.LegacySimCore.configure({seed,speed,onState:state=>{
  const withoutTelem={...state,units:state.units.map(u=>{const c={...u};delete c.shellSlamTick;return c;})};
  digest.update(JSON.stringify(withoutTelem)+'\n');
  if(prev&&observe){
   const original=new Map(prev.units.map(u=>[u.id,u]));
   const trueEvents=new Set(events.filter(h=>h.tick>prev.tick&&h.tick<=state.tick).map(h=>h.id)),seen=new Set(),action=new Set();
   for(const u of state.units){
    const p=original.get(u.id);if(!p||u.type!=='turtle'||u.hp<=0)continue;
    if(u.action==='shell_slam'&&u.action!==p.action)action.add(u.id);
    if(turtleSlamOccurred(p,u))seen.add(u.id);
   }
   metrics.actual+=trueEvents.size;metrics.action+=[...trueEvents].filter(id=>action.has(id)).length;
   metrics.stamped+=[...trueEvents].filter(id=>seen.has(id)).length;
   metrics.missed+=[...trueEvents].filter(id=>!seen.has(id)).length;
   metrics.falsePositives+=[...seen].filter(id=>!trueEvents.has(id)).length;metrics.windows++;
  }
  prev=state;
 }});
 win.LegacySimCore.deploy(roster('blue'),roster('red'));win.LegacySimCore.setRunning(true);
 for(let tick=0;tick<(count===80?185:235);tick++){
  now+=16.667;const callbacks=[...queue.values()];queue.clear();for(const cb of callbacks)cb(now);
  if(win.LegacySimCore.getState().winner)break;
 }
 assert.deepEqual(errors,[],'simulator errors');
 return{...metrics,hash:digest.digest('hex'),realCalls:events.length,simTick:win.LegacySimCore.getState().tick};
}
const smoke={count:40,speed:10,mirror:true,seed:1337};
assert.equal(test(shipped,smoke).hash,test(instrumented,smoke,true).hash,'read-only source hook must have exact same physical state');
assert.equal(test(baseline,smoke).hash,test(shipped,smoke).hash,'true-event telemetry must have zero effect on original RC4 physical state');
const rows=[];for(const count of [20,40,80])for(const speed of [1,4,10])for(const mirror of [false,true]){
 const cfg={count,speed,mirror,seed:1337};
 const old=test(baseline,cfg),current=test(instrumented,cfg,true);
 assert.equal(current.hash,old.hash,'Turtle telemetry changed RC4 combat or RNG: '+JSON.stringify(cfg));
 assert.equal(current.falsePositives,0,'Turtle FX cue without executed slam: '+JSON.stringify(cfg));
 rows.push({...cfg,actual:current.actual,action:current.action,stamped:current.stamped,missed:current.missed,falsePositives:current.falsePositives});
 console.log('TURTLE SHELL STAMP CASE '+JSON.stringify(rows[rows.length-1]));
}
const fold=x=>x.reduce((t,row)=>{for(const key of ['actual','action','stamped','missed','falsePositives'])t[key]=(t[key]||0)+row[key];return t},{});
const all=fold(rows),rapid=fold(rows.filter(x=>x.speed===10));
assert(all.actual>=100,'insufficient real shell slams to validate cue');
assert(all.stamped>all.action*7,'visual recovery failed to beat transient action');
assert(all.stamped>=all.actual*.90,'real slam missed at too high a rate');
const report={status:'QA turtle shell-slam telemetry, no combat behavior change',all,rapid,rows,
 caveats:'Real slams executed while Turtle was alive can become invisible if Turtle dies by the next snapshot, multiple events happen between frames or snapshot misses action. Stamp holds last real event and is not a hit confirmation or extra damage. FX is suppressed at >48 live and globally capped; current cue does not synthesize opponent or target impact.'};
if(process.env.QA_TURTLE_RECEIPT)fs.writeFileSync(process.env.QA_TURTLE_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('TURTLE SHELL SLAM SUMMARY '+JSON.stringify({all,rapid,physicalCombatParity:true}));
console.log('PASS: stable real Turtle slam FX telemetry at 1x 4x and 10x with no phantom slams or physics drift');
