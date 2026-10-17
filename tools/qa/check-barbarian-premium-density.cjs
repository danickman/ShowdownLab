'use strict';
// QA-only: actual dense combat simulation of current and premium Barbarian Cleave.
// Node CPU and state safety only: neither browser rendering nor iPhone FPS.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {performance}=require('node:perf_hooks');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const ult=read('v3/ultimate-abilities.js'),core=read('v3/legacy-sim-core.js'),evo=read('v3/evolution-rules.js');
const study=read('tools/qa/check-barbarian-first-ultimate-ab.cjs');
const from=study.indexOf('const section='),to=study.indexOf('const prelude=[',from);
assert(from>=0&&to>from,'accepted 408-game premium Cleave source declaration moved');
const expression=study.slice(from,to)+'\n;barb(".205","1.00","12")';
const premiumBody=vm.runInNewContext(expression,{});
const marker="if(a.type==='barbarian'&&['axe_swing','rage_swing'].includes(a.action)){";
const first=ult.indexOf(marker),last=ult.indexOf('return hits;',first);
assert(first>0&&last>first,'authoritative Barbarian afterHit block moved');
const premium=ult.slice(0,first)+premiumBody+'\n'+ult.slice(last);
new vm.Script(premium,{filename:'premium-barbarian-source'});
const arms={current:ult,premium};
const other=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','goose'];
function roster(n,level,withBarb){
 const barbCount=withBarb?Math.round(n*.26):0;
 const result=Array.from({length:barbCount},(_,i)=>({type:'barbarian',level,squad:Math.floor(i/5)}));
 for(let i=0;i<n-barbCount;i++)result.push({
  type:other[i%other.length],level:i%4===0?4:3,squad:Math.floor((barbCount+i)/5)
 });
 assert.equal(result.length,n);return result;
}
function run(arm,count,seed,withBarb){
 let now=0,seq=0,queue=new Map(),errors=[],tick0=0;const durations=[],steps=[];
 const env={window:null,Math,performance:{now:()=>now},
  requestAnimationFrame(cb){const id=++seq;queue.set(id,cb);return id},
  cancelAnimationFrame(id){queue.delete(id)},
  console:{error:(...a)=>errors.push(a.join(' '))}};
 env.window=env;vm.createContext(env);vm.runInContext(evo,env);
 vm.runInContext(arms[arm],env);vm.runInContext(core,env);
 const sim=env.LegacySimCore,half=count/2,blue=roster(half,5,withBarb),red=roster(half,4,withBarb);
 sim.configure({seed,speed:1,onState:()=>{}});sim.deploy(blue,red);
 const initial=sim.getState();assert.equal(initial.units.length,count,'full physical population');
 assert.equal(initial.units.filter(u=>u.team==='blue'&&u.type==='barbarian'&&u.level===5).length,withBarb?Math.round(half*.26):0);
 const hasher=crypto.createHash('sha256');
 sim.setRunning(true);
 for(const speed of [1,10]){
  sim.setSpeed(speed);
  const sample=[];
  for(let i=0;i<(speed===1?16:8);i++){
   now+=16.667;const next=[...queue.values()];queue.clear();
   const begin=performance.now();for(const fn of next)fn(now);
   sample.push(performance.now()-begin);
   const state=sim.getState();
   hasher.update(JSON.stringify(state)+'\n');
   assert.equal(state.units.length,count,'source combat removed/duplicated physical units');
   assert(state.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.x)&&Number.isFinite(u.y)),'invalid physical unit state');
   assert(state.tick>=tick0,'tick reversal');
   tick0=state.tick;
   const excursion=state.units.reduce((max,u)=>Math.max(max,Math.max(0,-u.x,u.x-1,-u.y,u.y-1)),0);
   assert(excursion<=.3,'physical coordinate escaped 30% beyond arena');
   if(state.winner)break;
  }
  const sorted=sample.slice().sort((a,b)=>a-b),quantile=p=>sorted[Math.min(sorted.length-1,Math.floor(sorted.length*p))];
  steps.push({speed,frames:sample.length,p50Ms:+quantile(.5).toFixed(3),
   p95Ms:+quantile(.95).toFixed(3),maxMs:+sorted.at(-1).toFixed(3)});
 }
 assert.deepEqual(errors,[],'simulated source logged errors');
 const state=sim.getState(),hash=hasher.digest('hex');
 return{arm,count,seed,withBarb,hash,active:state.units.filter(u=>u.hp>0).length,finalTick:state.tick,
  winner:state.winner||null,steps};
}
const results=[],seeds=[31847,42361];
for(const count of [80,120,300])for(const seed of seeds){
 for(const arm of seed===seeds[0]?['current','premium']:['premium','current'])results.push(run(arm,count,seed,true));
}
assert.equal(results.length,12,'12 dense source-real measured physical battles');
const matched=[];
for(const count of [80,120,300])for(const seed of seeds){
 const a=results.find(x=>x.count===count&&x.seed===seed&&x.arm==='current'),
  b=results.find(x=>x.count===count&&x.seed===seed&&x.arm==='premium');
 const base=a.steps[1].p95Ms,modified=b.steps[1].p95Ms,ratio=base?modified/base:null;
 assert(Number.isFinite(ratio),'measured source CPU ratio');
 assert(modified<Math.max(300,base*15),'catastrophic >15x premium source CPU regression');
 matched.push({count,seed,baseline10xP95Ms:base,premium10xP95Ms:modified,premiumVsBaseline10xP95Ratio:+ratio.toFixed(2)});
}
const offTarget=[];
for(const count of [20,80,300])for(const speedSet of [1,10]){
 // Same implementation of unrelated classes; distinguish L4/L5 Barbarian changes
 // from genuine off-target source drift via exact state traces.
 const seed=5779+count+speedSet;
 const a=run('current',count,seed,false),b=run('premium',count,seed,false);
 assert.equal(a.hash,b.hash,'non-Barbarian entire physical RAF source drift '+JSON.stringify({count,seed}));
 offTarget.push({count,seed,exactRAF:true});
}
const receipt={
 status:'QA-ONLY premium Barbarian source CPU / exact non-Barbarian physics research. NO live ability change.',
 method:'Unmodified combat core, current vs premium L4-wide (.135,3 targets, .58 attack damage,8 tick stagger) and L5 (.205,5 targets,1.0 attack,12 tick stagger) generated from accepted 408-match research. Twelve 26%-Barbarian mixed-roster 80/120/300 body 1x then 10x physical RAF samples (16+8 frames), two seeds each, plus 6 additional exact SHA parity same-roster no-Barbarian pairs at 20/80/300. Complete battle winners not required at high density. Node CPU does NOT measure Safari FPS, GPU or iPhone thermals.',
 matched,offTarget,results
};
if(process.env.QA_BARBARIAN_DENSITY_RECEIPT)fs.writeFileSync(process.env.QA_BARBARIAN_DENSITY_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('BARBARIAN PREMIUM DENSITY '+JSON.stringify({matched,offTarget,states:results.map(x=>({arm:x.arm,count:x.count,seed:x.seed,steps:x.steps,finalTick:x.finalTick}))}));
console.log('PASS: 12 80/120/300 real physical source battles, 6 non-Barbarian complete RAF parity controls');
