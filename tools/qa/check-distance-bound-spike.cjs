'use strict';
// QA parity/perf regression for promoted conservative nearest bound.
// Since target pressure penalty is non-negative, candidates farther than
// current winning score cannot beat it; retain Math.hypot for feasible foes.
// 1e-12 additive margin prevents floating-point boundary misclassification.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {performance}=require('node:perf_hooks');
const root=path.resolve(__dirname,'../..'),read=n=>fs.readFileSync(path.join(root,'v3',n+'.js'),'utf8');
const shipped=read('legacy-sim-core');
const old='for(const v of pool){const d=Math.hypot(v.x-u.x,v.y-u.y),pressure=pressureByTarget.get(v.id)||0,s=d+Math.max(0,pressure-2)*.035;if(s<score){score=s;bd=d;best=v}}';
const changed='for(const v of pool){const dx=v.x-u.x,dy=v.y-u.y,bound=score+1e-12;if(dx*dx+dy*dy>=bound*bound)continue;const d=Math.hypot(dx,dy),pressure=pressureByTarget.get(v.id)||0,s=d+Math.max(0,pressure-2)*.035;if(s<score){score=s;bd=d;best=v}}';
assert.equal(shipped.split(changed).length,2,'shipped nearest-bound guard moved; inspect semantics');
const base=shipped.replace(changed,old);
const optimized=shipped;
assert.equal(base.split(old).length,2,'reconstructed RC4 control missing');
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
const populations=(process.env.QA_DISTANCE_COUNTS||'40,80,120,180,300').split(',').map(Number);
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
    assert.deepEqual(trial.traces,source.traces,'distance-bound targeting diverged '+label+' '+count+' fighters '+speed+'x mirror '+mirror);
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
// Longer seeded fights exercise pressure penalties, deaths, burrows and
// Assassin backline reach after targets are already under contention.
const lateParity=[];
for(const [count,speed,frames] of [[40,10,80],[80,10,65],[120,4,65]])
 for(const seed of [1337,9917])for(const mirror of [false,true]){
  const control=scenario(base,count,seed,mirror,speed,frames);
  const candidate=scenario(optimized,count,seed,mirror,speed,frames);
  assert.deepEqual(candidate.traces,control.traces,'distance bound drift late '+count+' '+seed+' '+mirror);
  lateParity.push({count,seed,mirror,speed,frames:control.samples,tick:control.tick,exactTraceParity:true});
 }
const receipt={status:'QA-only nonnegative-score distance bound; no live combat changes',platform:'Node GitHub runner VM synthetic RAF, not iPhone or browser FPS',
 warnings:'ABBA timings are directional Node VM synthetic callbacks, not Safari; conservative 1e-12 squared-score guard preserves exact scoring for plausible distances. Require full-role parity, device frame checks and release gates before promotion.',
 scenarios:rows,summary,lateParity};
console.log('DISTANCE BOUND SPIKE '+JSON.stringify(receipt));
if(process.env.QA_DISTANCE_RECEIPT)fs.writeFileSync(process.env.QA_DISTANCE_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('PASS: conservative distance bound matches exact nearest/scoring combat across sizes/speeds/mirrors; speed result exploratory');
