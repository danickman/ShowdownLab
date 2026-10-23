'use strict';
// Goose L5 Impact Shockwave source-only CPU / physical-state density safety.
// No browser, GPU or physical-iPhone performance claims. Never loaded by runtime.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {performance}=require('node:perf_hooks');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const impactStudy=read('tools/qa/check-goose-impact-shockwave-ab.cjs');
const from=impactStudy.indexOf('const honkImpact=['),to=impactStudy.indexOf('const insert=',from);
assert(from>=0&&to>from,'source A/B proposed Impact Honk block drift');
const hitSource=vm.runInNewContext(impactStudy.slice(from,to)+';honkImpact',{});
const originalUltimate=read('tools/qa/fixtures/goose-before-impact-ultimate.js');
const h0=originalUltimate.indexOf('function honk(u,units,tick){'),h1=originalUltimate.indexOf('function burn(u)',h0);
assert(h0>=0&&h1>h0,'authoritative honk boundaries changed');
const impactUltimate=originalUltimate.slice(0,h0)+hitSource+'\n'+originalUltimate.slice(h1);
const baseCore=read('v3/legacy-sim-core.js'),evolution=read('v3/evolution-rules.js');
const candidates={current:originalUltimate,impact:impactUltimate};
const ROLES=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian'];
function units(total,level){
 const geese=Math.round(total*.26);
 const arr=Array.from({length:geese},(_,i)=>({type:'goose',level,squad:Math.floor(i/5)}));
 for(let i=0;i<total-geese;i++){
  const role=ROLES[i%ROLES.length];
  arr.push({type:role,level:(i%4===0?4:3),squad:Math.floor((geese+i)/5)});
 }
 assert.equal(arr.length,total);
 return arr;
}
function run(arm,count,seed){
 const start=performance.now(),ticks=[],errors=[];let now=0,token=0,q=new Map();
 const env={window:null,Math,performance:{now:()=>now},
  requestAnimationFrame(cb){let id=++token;q.set(id,cb);return id},
  cancelAnimationFrame(id){q.delete(id)},
  console:{error:(...a)=>errors.push(a.join(' '))}};
 env.window=env;
 vm.createContext(env);vm.runInContext(evolution,env);
 vm.runInContext(candidates[arm],env);vm.runInContext(baseCore,env);
 const sim=env.LegacySimCore,half=count/2;
 sim.configure({seed,speed:1,onState:()=>{}});
 sim.deploy(units(half,5),units(half,4));
 assert.equal(sim.getState().units.length,count,'all fighters actually present');
 const first=sim.getState();
 assert.equal(first.units.filter(u=>u.type==='goose'&&u.team==='blue'&&u.level===5).length,Math.round(half*.26));
 assert.equal(first.units.filter(u=>u.type==='goose'&&u.team==='red'&&u.level===4).length,Math.round(half*.26));
 sim.setRunning(true);
 const steps=[];
 for(const speed of [1,10]){
  sim.setSpeed(speed);
  const durations=[];
  for(let i=0;i<(speed===1?16:8);i++){
   now+=16.667;const next=[...q.values()];q.clear();
   const before=performance.now();for(const cb of next)cb(now);
   const elapsed=performance.now()-before;durations.push(elapsed);
   const state=sim.getState();assert.equal(state.units.length,count,'no fighter objects removed or duplicated');
   assert(state.units.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.y)&&Number.isFinite(u.hp)),'physical state finite');
   assert(state.tick>=first.tick,'no backwards source combat');
   ticks.push(state.tick);
   const radiusExcursions=state.units.reduce((max,u)=>Math.max(max,Math.max(0,-u.x,u.x-1,-u.y,u.y-1)),0);
   assert(radiusExcursions<=.3,'physical world coordinate exceeded 30% arena excursion');
   if(state.winner)break;
  }
  assert(durations.length>=1);
  const sorted=durations.slice().sort((a,b)=>a-b),at=q=>sorted[Math.min(sorted.length-1,Math.floor(sorted.length*q))];
  steps.push({speed,frames:durations.length,p50Ms:+at(.5).toFixed(3),p95Ms:+at(.95).toFixed(3),
   maxMs:+sorted.at(-1).toFixed(3),totalMs:+durations.reduce((a,b)=>a+b,0).toFixed(3)});
 }
 assert.deepEqual(errors,[],'source console errors');
 const state=sim.getState();
 return{arm,count,seed,elapsedMs:+(performance.now()-start).toFixed(3),
  activeFighters:state.units.filter(u=>u.hp>0).length,finalTick:state.tick,
  winner:state.winner||null,steps};
}
const results=[];
for(const count of [80,120,300])for(const seed of [31337,41117]){
 // Interleave before and after sources to limit runner load/order artifacts.
 for(const arm of (seed===31337?['current','impact']:['impact','current']))
  results.push(run(arm,count,seed));
}
assert.equal(results.length,12);
const matched=[];
for(const count of [80,120,300])for(const seed of [31337,41117]){
 const current=results.find(x=>x.count===count&&x.seed===seed&&x.arm==='current'),
  impact=results.find(x=>x.count===count&&x.seed===seed&&x.arm==='impact');
 assert(current&&impact);
 const p95Current=current.steps[1].p95Ms,p95Impact=impact.steps[1].p95Ms;
 // Only catch catastrophic deterministic algorithmic explosions; performance
 // deltas are INFORMATIVE, not iPhone/Safari pass/fail criteria.
 assert(p95Impact<Math.max(300,p95Current*15),'Impact shockwave catastrophic >15x CPU source-frame cost');
 matched.push({count,seed,currentTurboP95Ms:p95Current,impactTurboP95Ms:p95Impact,
  ratio:p95Current>0?+(p95Impact/p95Current).toFixed(2):null});
}
const report={status:'SOURCE-ONLY stress sample, NOT Safari FPS or permission to ship',target:'iPhone 14 Pro Max 430x932 DPR3 requires separate device sign-off',
 method:'Original and Impact-only ultimate source, unmodified LegacySimCore. 80/120/300 total live fighters, per side 26% Goose (Blue L5, Red L4) among frozen ten-role roster, 2 seeds, 1x 16 synthetic RAF frames then 10x 8 frames in each battle. Physical non-NaN/count bounds, p50/p95 frame CPU sample. No terminal-win claim at high population; independent first-tier real 416-terminal matched impact A/B supports match value. No GPU, artwork, staging or real iOS runtime measurement.',
 matched,results};
if(process.env.QA_GOOSE_DENSITY_RECEIPT)fs.writeFileSync(process.env.QA_GOOSE_DENSITY_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('GOOSE IMPACT DENSITY '+JSON.stringify({matched,states:results.map(x=>({arm:x.arm,count:x.count,seed:x.seed,winner:x.winner,finalTick:x.finalTick,steps:x.steps}))}));
console.log('PASS: 12 80/120/300 mixed-roster source-real CPU samples at 1x and 10x with physical state safety');
