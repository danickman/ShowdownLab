'use strict';
// QA-only source-real current-vs-Twin Mole L5 80/120/300 fighter CPU and source safety.
// Node CPU and state safety only: neither browser rendering nor iPhone FPS.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {performance}=require('node:perf_hooks');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');

const ult=read('v3/ultimate-abilities.js'),core=read('v3/legacy-sim-core.js'),evo=read('v3/evolution-rules.js');
const study=read('tools/qa/check-mole-l5-low-collateral-ab.cjs');
const first=study.indexOf('function fissure('),last=study.indexOf('const inject=[',first);
assert(first>=0&&last>first,'accepted candidate generator moved');
const fn=vm.runInNewContext(study.slice(first,last)+';fissure',{});
assert(study.includes("fissure('.20','.060','2','.62','3')"),'Twin constants changed');
const body=fn('.20','.060','2','.62','3');
const gate="['sniper','dragon','beetank','barbarian']";
const marker="if(a.type==='barbarian'&&['axe_swing','rage_swing'].includes(a.action)){";
assert(ult.split(gate).length===2&&ult.split(marker).length===2,'ultimate insertion anchors drift');
const twin=ult.replace(gate,"['sniper','dragon','beetank','mole','barbarian']").replace(marker,body+String.fromCharCode(10)+marker);
new vm.Script(twin,{filename:'mole-twin-source-only'});
const arms={current:ult,twin};
const other=['knight','sniper','dragon','assassin','beetank','turtle','goblin','barbarian','goose'];
function roster(n,level,withMole){
 const moleCount=withMole?Math.round(n*.26):0;
 const result=Array.from({length:moleCount},(_,i)=>({type:'mole',level,squad:Math.floor(i/5)}));
 for(let i=0;i<n-moleCount;i++)result.push({
  type:other[i%other.length],level:i%4===0?4:3,squad:Math.floor((moleCount+i)/5)
 });
 assert.equal(result.length,n);return result;
}
function run(arm,count,seed,withMole,blueLevel=5){
 let now=0,seq=0,queue=new Map(),errors=[],tick0=0;const durations=[],steps=[];
 const env={window:null,Math,performance:{now:()=>now},
  requestAnimationFrame(cb){const id=++seq;queue.set(id,cb);return id},
  cancelAnimationFrame(id){queue.delete(id)},
  console:{error:(...a)=>errors.push(a.join(' '))}};
 env.window=env;vm.createContext(env);vm.runInContext(evo,env);
 vm.runInContext(arms[arm],env);vm.runInContext(core,env);
 const sim=env.LegacySimCore,half=count/2,blue=roster(half,blueLevel,withMole),red=roster(half,4,withMole);
 sim.configure({seed,speed:1,onState:()=>{}});sim.deploy(blue,red);
 const initial=sim.getState();assert.equal(initial.units.length,count,'full physical population');
 assert.equal(initial.units.filter(u=>u.team==='blue'&&u.type==='mole'&&u.level===5).length,withMole&&blueLevel===5?Math.round(half*.26):0);
 const hasher=crypto.createHash('sha256');
 sim.setRunning(true);
 for(const speed of [1,10]){
  sim.setSpeed(speed);
  const sample=[];
  for(let i=0;i<16;i++){
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
 return{arm,count,seed,withMole,blueLevel,hash,active:state.units.filter(u=>u.hp>0).length,finalTick:state.tick,
  winner:state.winner||null,steps};
}

const results=[],seeds=[37991,44033];
for(const count of [80,120,300])for(const seed of seeds)
 for(const arm of seed===seeds[0]?['current','twin']:['twin','current'])
  results.push(run(arm,count,seed,true));
assert.equal(results.length,12,'12 live physical 80/120/300 body runs');
const matched=[];
for(const count of [80,120,300])for(const seed of seeds){
 const base=results.find(x=>x.count===count&&x.seed===seed&&x.arm==='current'),
  trial=results.find(x=>x.count===count&&x.seed===seed&&x.arm==='twin');
 assert(base&&trial);
 const b=base.steps[1].p95Ms,t=trial.steps[1].p95Ms;
 assert(t<Math.max(300,b*15),'catastrophic >15x density CPU increase');
 assert.notEqual(base.hash,trial.hash,'must witness at least one actual Mole L5 Twin effect at density');
 matched.push({count,seed,current10xP95Ms:b,twin10xP95Ms:t,ratio:b?+(t/b).toFixed(2):null,physicalChange:true});
}
const offTarget=[];
for(const count of [20,80,300])for(const speedMode of [1,10]){
 const seed=6083+count+speedMode;
 for(const [group,withMole,blueLevel] of [['none',false,5],['L4-moles',true,4]]){
  const a=run('current',count,seed,withMole,blueLevel);
  const b=run('twin',count,seed,withMole,blueLevel);
  assert.equal(a.hash,b.hash,'no-L5 entire-RAF source parity '+JSON.stringify({count,seed,group}));
  offTarget.push({count,seed,group,entireRafExact:true});
 }
}
assert.equal(offTarget.length,12);
const receipt={
 status:'QA-only matched 80/120/300 mixed-fighter CPU and exact off-target RAF checks, not integrated.',
 method:'Same generated Twin code from prior passed heldout study: length .20 lateral .060, cap 2, .62 Mole attack after real burrow eruption, 3 tick stagger. Current live ultimate source vs Twin source, no core changes. 12 density samples 80/120/300, 26% Mole, blue L5/red L4, two new seeds 37991/44033, 16 real RAF frames at 1x then 16 at 10x each. CPU Node p50/p95, finite and bounded whole-unit physical state, require actual candidate-vs-baseline state difference. 12 whole-RAF exact SHA pairs with no Mole or Mole all L4 at 20/80/300, two seed choices. Native Safari is NOT tested.',
 matched,offTarget,results};
if(process.env.QA_MOLE_TWIN_DENSITY_RECEIPT)fs.writeFileSync(process.env.QA_MOLE_TWIN_DENSITY_RECEIPT,JSON.stringify(receipt,null,2)+String.fromCharCode(10));
console.log('MOLE TWIN DENSITY '+JSON.stringify({matched,offTarget}));
console.log('PASS: 12 80/120/300 source CPU samples, 12 exact whole-RAF no-L5 controls');
