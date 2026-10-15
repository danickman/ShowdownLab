'use strict';
// QA-only, stat-neutral nearest-target scan A/B. Never imported into the PWA.
// Tests unmodified RC4 against an allocation-lean implementation using
// the SAME pressure calculation, tie order, live-state and backline precedence.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {performance}=require('node:perf_hooks');
const root=path.resolve(__dirname,'../..'),read=n=>fs.readFileSync(path.join(root,'v3',n+'.js'),'utf8');
const base=read('legacy-sim-core');
const start=base.indexOf('function nearest(u,preferBack=false){'),end=base.indexOf('function bodyRadius(u)',start);
assert(start>0&&end>start&&base.indexOf('function nearest(u,preferBack=false){',start+1)<0,'target source anchor must be unique');
const original=base.slice(start,end);
assert(original.includes('units.filter')&&original.includes('pressureByTarget')&&original.includes('BACK.has'),'protected pressure/backline targeting semantics changed');
const candidate=`function nearest(u,preferBack=false){
 const pressureByTarget=new Map();
 for(const a of units)if(a.team===u.team&&a.hp>0)pressureByTarget.set(a.target,(pressureByTarget.get(a.target)||0)+1);
 let requireBack=false;
 if(preferBack)for(const v of units){
  if(v.team!==u.team&&v.hp>0&&v.burrow<=0&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&BACK.has(v.type)){
   requireBack=true;break;
  }
 }
 let best=null,score=Infinity,bd=Infinity;
 for(const v of units){
  if(v.team===u.team||v.hp<=0||v.burrow>0||!Number.isFinite(v.x)||!Number.isFinite(v.y)||(requireBack&&!BACK.has(v.type)))continue;
  const d=Math.hypot(v.x-u.x,v.y-u.y),pressure=pressureByTarget.get(v.id)||0,s=d+Math.max(0,pressure-2)*.035;
  if(s<score){score=s;bd=d;best=v}
 }
 return[best,bd];
}`;
const optimized=base.slice(0,start)+candidate+base.slice(end);
function scenario(code,count,seed,mirror,speed,frames){
 let now=0,latest=null,next=0,errors=[],q=new Map();
 const env={window:null,Math,performance:{now:()=>now},
   requestAnimationFrame(fn){const i=++next;q.set(i,fn);return i},
   cancelAnimationFrame(i){q.delete(i)},
   console:{error:(...args)=>errors.push(args.join(' '))}};
 env.window=env;vm.createContext(env);
 for(const n of ['evolution-rules','ultimate-abilities'])vm.runInContext(read(n),env,{filename:n+'.js'});
 vm.runInContext(code,env,{filename:'legacy-sim-core.ab.js'});
 const core=env.LegacySimCore,types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
 const roster=side=>Array.from({length:count/2},(_,i)=>({type:types[(i*3+((mirror?side==='blue':side==='red')?5:0))%10],level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
 core.configure({seed,speed,onState:s=>{latest=s}});
 core.deploy(roster('blue'),roster('red'));core.setRunning(true);
 const durations=[],traces=[];
 for(let i=0;i<frames;i++){
  now+=16.667;const callbacks=[...q.values()];q.clear();
  const before=performance.now();for(const cb of callbacks)cb(now);durations.push(performance.now()-before);
  const state=core.getState();traces.push(JSON.stringify(state));
  if(state.winner)break;
 }
 assert.deepEqual(errors,[],'simulation error in '+count+' fighters '+speed+'x');
 const sorted=[...durations].sort((a,b)=>a-b),quant=q=>+sorted[Math.min(sorted.length-1,Math.floor((sorted.length-1)*q))].toFixed(2);
 return{traces,samples:durations.length,p50Ms:quant(.5),p95Ms:quant(.95),totalMs:+durations.reduce((a,b)=>a+b,0).toFixed(2),tick:core.getState().tick,winner:core.getState().winner||null};
}
const populations=(process.env.QA_NEAREST_COUNTS||'40,80,120,180,300').split(',').map(Number);
assert(populations.every(n=>[40,80,120,180,300].includes(n)));
const rows=[];
for(const count of populations){
 const variants=count===300?[[1,14],[10,3]]:count===180?[[1,20],[10,4]]:count===120?[[1,32],[10,6]]:[[1,42],[10,7]];
 for(const mirror of [false,true])for(const [speed,frames] of variants){
  // ABBA: reduce systematic run-order bias (still a noisy Node/VM estimate).
  const source=scenario(base,count,1337,mirror,speed,frames);
  const lean=scenario(optimized,count,1337,mirror,speed,frames);
  const leanAgain=scenario(optimized,count,1337,mirror,speed,frames);
  const sourceAgain=scenario(base,count,1337,mirror,speed,frames);
  for(const [label,trial] of [['candidate A',lean],['candidate B',leanAgain],['control B',sourceAgain]]){
    assert.deepEqual(trial.traces,source.traces,'nearest target behavior changed '+label+' '+count+' fighters '+speed+'x mirror '+mirror);
  }
  const avg=(a,b)=>+(0.5*(a+b)).toFixed(2);
  const reference=avg(source.totalMs,sourceAgain.totalMs),trial=avg(lean.totalMs,leanAgain.totalMs);
  const ratio=+(trial/reference).toFixed(3);
  rows.push({count,mirror,speed,frames:source.samples,tick:source.tick,
    baseline:{p50Ms:avg(source.p50Ms,sourceAgain.p50Ms),p95Ms:avg(source.p95Ms,sourceAgain.p95Ms),totalMs:reference,runsMs:[source.totalMs,sourceAgain.totalMs]},
    candidate:{p50Ms:avg(lean.p50Ms,leanAgain.p50Ms),p95Ms:avg(lean.p95Ms,leanAgain.p95Ms),totalMs:trial,runsMs:[lean.totalMs,leanAgain.totalMs]},
    ratio,exactTraceParity:true});
 }
}
const summary=populations.map(count=>{
 const cases=rows.filter(r=>r.count===count);
 return{count,medianRatio:cases.map(x=>x.ratio).sort((a,b)=>a-b)[Math.floor(cases.length/2)],worstRatio:Math.max(...cases.map(x=>x.ratio))};
});
const receipt={status:'QA source-swap research only; allocation-free nearest not in game runtime',platform:'Node GitHub runner VM synthetic RAF, not iPhone or browser FPS',
 warnings:'Order-balanced ABBA repetitions reduce but do not eliminate JIT/VM scheduling noise. Benchmarked step+state emission, not full Canvas renderer. Require meaningful repeatable gains, role counterplay and 300-duel QA before promoting.',
 scenarios:rows,summary};
console.log('NEAREST SCAN SPIKE '+JSON.stringify(receipt));
if(process.env.QA_NEAREST_RECEIPT)fs.writeFileSync(process.env.QA_NEAREST_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('PASS: exact per-callback RC4 state parity for all size/mirror/speed combinations; speed result is exploratory');
