'use strict';
// QA-only read-only measurement: Beetank starts vs renderer charge evidence.
// A charge initiation does NOT prove impact. Old action, current special and
// charge>0 must not be conflated; evidence is sampled at 1/4/10x.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const renderer=read('v3/v3.js'),base=read('v3/legacy-sim-core.js');
const first=renderer.indexOf('function beetankChargeReset('),last=renderer.indexOf('function spawnFX(next){',first);
assert(first>0&&last>first&&renderer.indexOf('function beetankChargeReset(',first+1)<0,'exactly one Beetank reset helper');
const chargeReset=vm.runInNewContext(renderer.slice(first,last)+';beetankChargeReset',{Number});
assert.equal(chargeReset({special:20},{type:'beetank',special:99}),true,'source reset should trigger');
assert.equal(chargeReset({special:55},{type:'beetank',special:54}),false,'ordinary decrement must not trigger');
assert.equal(chargeReset({special:30},{type:'turtle',special:100}),false,'wrong role');
assert.equal(chargeReset(null,{type:'beetank',special:100}),false,'no initial cue');
assert.equal(chargeReset({special:2},{type:'beetank',special:NaN}),false,'not on invalid state');
const cueStart=renderer.indexOf('if(beetankChargeReset(old,u)'),cueEnd=renderer.indexOf("if(u.type==='beetank'&&u.action==='ram'&&Number.isFinite(old.cooldown)",cueStart);
assert(cueStart>0&&cueEnd>cueStart,'Beetank recovery must precede original impact cue');
const cue=renderer.slice(cueStart,cueEnd);
for(const anchor of ["!(u.action==='ram'&&old.action!==u.action)","kind:'dustkick'","u.charge>0","kind:'chargeWake'","density<=36","!rapid","f.kind==='dustkick'&&now-f.t<300","f.kind==='chargeWake'&&now-f.t<420","prefers-reduced-motion"])
 assert(cue.includes(anchor),'missing visual guard '+anchor);
for(const forbidden of ["kind:'clash'","kind:'hit'","kind:'shockring'","kind:'ram'","kind:'koBurst'","shake=","flash=","u.hp="])assert(!cue.includes(forbidden),'false visual impact '+forbidden);
assert(renderer.includes('cooldown:u.cooldown,special:u.special'),'previous beetank special counter retained');
const startAnchor='u.charge=26;u.special=100';
assert.equal(base.split(startAnchor).length,2,'real charge start source moved');
const instrumented=base.replace(startAnchor,startAnchor+';window.__qaStart({tick,id:u.id})');
const A=['beetank','beetank','knight','beetank','dragon','goblin','beetank','turtle','mole','barbarian'];
const B=['knight','beetank','goblin','sniper','turtle','dragon','knight','goose','barbarian','assassin'];
function scenario(src,cfg,audit=true){
 let env={},next=0,now=0,q=new Map(),starts=[],prev=null,metrics={actual:0,action:0,reset:0,active:0,activeRecovered:0,completed:0,missed:0,incorrect:0,windows:0};
 const hash=crypto.createHash('sha256'),raf=fn=>{const i=++next;q.set(i,fn);return i};
 env.__qaStart=x=>starts.push(x);
 for(const dep of ['evolution-rules','ultimate-abilities'])new Function('window','performance','requestAnimationFrame','cancelAnimationFrame',read('v3/'+dep+'.js'))(env,{now:()=>now},raf,k=>q.delete(k));
 new Function('window','performance','requestAnimationFrame','cancelAnimationFrame',src)(env,{now:()=>now},raf,k=>q.delete(k));
 const roster=side=>Array.from({length:cfg.count/2},(_,i)=>({type:(cfg.mirror?(side==='blue'?B:A):(side==='blue'?A:B))[i%10],level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
 const core=env.LegacySimCore;
 core.configure({seed:cfg.seed,speed:cfg.speed,onState:s=>{
  hash.update(JSON.stringify(s)+'\n');
  if(prev&&audit){
   const old=new Map(prev.units.map(u=>[u.id,u])),started=new Set(starts.filter(x=>x.tick>prev.tick&&x.tick<=s.tick).map(x=>x.id));
   const action=new Set(),reset=new Set(),active=new Set(),completed=new Set();
   for(const u of s.units){
    const p=old.get(u.id);
    if(u.type!=='beetank'||u.hp<=0||!p)continue;
    if(u.action==='ram'&&p.action!==u.action)action.add(u.id);
    if(chargeReset(p,u)){
     reset.add(u.id);
     if(u.charge>0)active.add(u.id);else completed.add(u.id);
    }
   }
   metrics.actual+=started.size;metrics.action+=[...started].filter(x=>action.has(x)).length;
   metrics.reset+=[...started].filter(x=>reset.has(x)).length;
   metrics.active+=[...started].filter(x=>active.has(x)).length;
   metrics.activeRecovered+=[...started].filter(x=>active.has(x)&&!action.has(x)).length;
   metrics.completed+=[...started].filter(x=>completed.has(x)).length;
   metrics.missed+=[...started].filter(x=>!reset.has(x)).length;
   metrics.incorrect+=[...reset].filter(x=>!started.has(x)).length;metrics.windows++;
  }
  prev=s;
 }});
 core.deploy(roster('blue'),roster('red'));core.setRunning(true);
 const frames=cfg.count===80?135:180;
 for(let t=0;t<frames;t++){now+=16.667;const tasks=[...q.values()];q.clear();for(const fn of tasks)fn(now);if(core.getState().winner)break;}
 return{...metrics,tick:core.getState().tick,digest:hash.digest('hex')};
}
const smoke={count:20,speed:4,mirror:false,seed:1337};
assert.equal(scenario(base,smoke,false).digest,scenario(instrumented,smoke,true).digest,'observer must preserve unchanged RC4 simulator state');
const rows=[];
for(const count of [20,40,80])for(const speed of [1,4,10])for(const mirror of [false,true]){
 const cfg={count,speed,mirror,seed:1337},s=scenario(instrumented,cfg,true);
 assert.equal(s.incorrect,0,'visual cue invented nonexistent charge '+JSON.stringify(cfg));
 rows.push({...cfg,actual:s.actual,action:s.action,reset:s.reset,active:s.active,activeRecovered:s.activeRecovered,completed:s.completed,missed:s.missed,incorrect:s.incorrect});
 console.log('BEETANK CHARGE CASE '+JSON.stringify(rows[rows.length-1]));
}
const aggregate=x=>x.reduce((acc,row)=>{for(const k of ['actual','action','reset','active','activeRecovered','completed','missed','incorrect'])acc[k]=(acc[k]||0)+row[k];return acc},{});
const totals=aggregate(rows),rapid=aggregate(rows.filter(r=>r.speed===10));
assert(totals.actual>=500,'sample did not include enough genuine Beetank charges');
assert(totals.reset>=totals.actual*.99,'real charge reset recovery too weak');
const report={status:'render-only Beetank real charge dust, active wake gated by >0 charge, no fake hit',totals,rapid,rows,
 limitations:'Cooldown reset signals true initiation, not damage or successful impact. By the next snapshot some charges ended: recover ground dust only for those, NEVER a fresh active charge wake or RAM impact. Do not infer physical iPhone FPS from VM tests. Visible cues obey reduced motion, fxCap, 36-fighter dust and 28-fighter wake limits.'};
if(process.env.QA_RAM_RECEIPT)fs.writeFileSync(process.env.QA_RAM_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('BEETANK CHARGE CUE SUMMARY '+JSON.stringify({totals,rapid,sourceParity:true}));
console.log('PASS: Beetank charge visualization anchored to real initiation, no fictitious contact damage');
