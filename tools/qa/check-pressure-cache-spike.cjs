'use strict';
// QA-only hypothesis: single per-tick pressure maps, incrementally maintained.
// Scanning live team targets per attacker costs O(live fighters^2) allocations.
// NEVER loaded in PWA; exact state/role outcomes are promotion prerequisites.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {performance}=require('node:perf_hooks');
const root=path.resolve(__dirname,'../..'),read=n=>fs.readFileSync(path.join(root,'v3',n+'.js'),'utf8');
const base=read('legacy-sim-core');
function candidateFor(src){
 let result=src;
 const replaceOne=(old,replacement)=>{assert.equal(result.split(old).length,2,'source drift: '+old.slice(0,60));result=result.replace(old,replacement)};
 replaceOne('function nearest(u,preferBack=false){',`let qaPressures=null;
function qaStartPressures(){const blue=new Map(),red=new Map();for(const a of units){if(a.hp<=0)continue;const p=a.team==='blue'?blue:red;p.set(a.target,(p.get(a.target)||0)+1)}qaPressures={blue,red}}
function qaTarget(u,t){if(qaPressures&&u.hp>0&&u.target!==t){const p=qaPressures[u.team];p.set(u.target,(p.get(u.target)||0)-1);p.set(t,(p.get(t)||0)+1)}u.target=t}
function nearest(u,preferBack=false){`);
 replaceOne('const pressureByTarget=new Map();for(const a of units)if(a.team===u.team&&a.hp>0)pressureByTarget.set(a.target,(pressureByTarget.get(a.target)||0)+1);','const pressureByTarget=qaPressures?qaPressures[u.team]:new Map();if(!qaPressures)for(const a of units)if(a.team===u.team&&a.hp>0)pressureByTarget.set(a.target,(pressureByTarget.get(a.target)||0)+1);');
 replaceOne('t.hp=Math.max(0,t.hp-dmg);lastDamageTick=tick;','const qaAliveBefore=t.hp>0;t.hp=Math.max(0,t.hp-dmg);if(qaPressures&&qaAliveBefore&&t.hp<=0){const p=qaPressures[t.team];p.set(t.target,(p.get(t.target)||0)-1)}lastDamageTick=tick;');
 replaceOne('function step(){tick++;for(const u of units)sanitize(u);for(const u of units){','function step(){tick++;for(const u of units)sanitize(u);qaStartPressures();try{for(const u of units){');
 replaceOne('}separate(false)}function winner(){','}separate(false)}finally{qaPressures=null}}function winner(){');
 for(const [old,replacement] of [['u.target=t.id','qaTarget(u,t.id)'],['u.target=mt.id','qaTarget(u,mt.id)'],['u.target=null','qaTarget(u,null)'],['u.target=nearest(u)[0]?.id??null','qaTarget(u,nearest(u)[0]?.id??null)']]){
  assert(result.includes(old),'target assignment changed: '+old);
  result=result.replaceAll(old,replacement);
 }
 return result;
}
const optimized=candidateFor(base);
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
const populations=(process.env.QA_PRESSURE_COUNTS||'40,80,120,180,300').split(',').map(Number);
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
    assert.deepEqual(trial.traces,source.traces,'incremental pressure cache changed combat '+label+' '+count+' fighters '+speed+'x mirror '+mirror);
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
// Late-battle pressure: cover kills, role re-targets, burns, stuns and deadlock
// across hundreds of ticks with two seeds and both directions.
const durability=[];
for(const [count,speed,frames] of [[40,10,80],[80,10,70],[120,4,70]]){
 for(const seed of [1337,9917])for(const mirror of [false,true]){
  const control=scenario(base,count,seed,mirror,speed,frames);
  const candidate=scenario(optimized,count,seed,mirror,speed,frames);
  assert.deepEqual(candidate.traces,control.traces,'LATE pressure-cache drift '+count+' '+speed+'x seed '+seed+' mirror '+mirror);
  durability.push({count,speed,seed,mirror,frames:control.samples,tick:control.tick,winner:control.winner,exactTraceParity:true});
 }
}
const receipt={status:'QA-only incremental per-tick target-pressure A/B, not loaded by game',platform:'Node GitHub runner VM synthetic RAF, not iPhone or browser FPS',
 warnings:'Order-balanced ABBA repetitions reduce but do not eliminate JIT/VM scheduling noise. Benchmarked step+state emission, not Canvas. Target bookkeeping includes deaths, burrow retargeting and Assassin override, and is reset in finally. Require meaningful repeatable speed gain, long-run combat checks, 300 stress, browser gate and role counterplay before promotion.',
 scenarios:rows,summary,lateParity:durability};
console.log('PRESSURE CACHE SPIKE '+JSON.stringify(receipt));
if(process.env.QA_PRESSURE_RECEIPT)fs.writeFileSync(process.env.QA_PRESSURE_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('PASS: cached-pressure exact per-callback parity for all density/mirror/speed combinations; timing remains exploratory');
