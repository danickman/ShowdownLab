'use strict';
// QA-only: universal collision-radius coarse guard before accessing per-pair
// team, radii or y geometry. All true candidate collisions use the EXACT
// original RC4 collision resolution and fighter visit order. No game import.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {performance}=require('node:perf_hooks');
const root=path.resolve(__dirname,'../..'),read=n=>fs.readFileSync(path.join(root,'v3',n+'.js'),'utf8');
const base=read('legacy-sim-core');
const setup='function separate(initial=false){const alive=units.filter(u=>u.hp>0&&u.burrow<=0),passes=initial?10:alive.length>32?4:3,radii=alive.map(visualSpacingRadius);';
const setupFast=setup.slice(0,-1)+',globalBound=2*Math.max(...radii)*1.14;';
const pair='const a=alive[i],b=alive[j],dx=b.x-a.x,dy=b.y-a.y,same=a.team===b.team,min=(radii[i]+radii[j])*(same?1.14:1.00);if(dx>=min||dx<=-min||dy>=min||dy<=-min)continue;';
const guarded='const a=alive[i],b=alive[j],dx=b.x-a.x;if(dx>=globalBound||dx<=-globalBound)continue;const dy=b.y-a.y;if(dy>=globalBound||dy<=-globalBound)continue;const same=a.team===b.team,min=(radii[i]+radii[j])*(same?1.14:1.00);if(dx>=min||dx<=-min||dy>=min||dy<=-min)continue;';
assert.equal(base.split(setup).length,2,'sim collision setup anchor changed');
assert.equal(base.split(pair).length,2,'sim collision pair anchor changed');
const optimized=base.replace(setup,setupFast).replace(pair,guarded);
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
const populations=(process.env.QA_COARSE_COUNTS||'40,80,120,180,300').split(',').map(Number);
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
    assert.deepEqual(trial.traces,source.traces,'coarse universal bound changed RC4 state '+label+' '+count+' fighters '+speed+'x mirror '+mirror);
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
// Cumulative later pressure, melee pair reorder, stunned fighters and dense
// collisions: compare *all* callback unit states, not only final winners.
const lateParity=[];
for(const [count,speed,frames] of [[40,10,75],[80,4,65],[120,4,55]])
 for(const seed of [1337,9917])for(const mirror of [false,true]){
  const control=scenario(base,count,seed,mirror,speed,frames);
  const proposed=scenario(optimized,count,seed,mirror,speed,frames);
  assert.deepEqual(proposed.traces,control.traces,'late coarse radius changed combat '+count+' seed '+seed+' mirror '+mirror);
  lateParity.push({count,speed,seed,mirror,frames:control.samples,tick:control.tick,parity:true});
 }
const receipt={status:'QA-only coarse universal radius pair pruning, not loaded into game',platform:'Node GitHub runner VM synthetic RAF, not iPhone or browser FPS',
 warnings:'Order-balanced ABBA repetitions reduce but do not eliminate JIT/VM scheduling noise. Benchmarked step+state emission, not full Canvas renderer. Require meaningful repeatable gains, role counterplay and 300-duel QA before promoting.',
 scenarios:rows,summary,lateParity};
console.log('COLLISION COARSE SPIKE '+JSON.stringify(receipt));
if(process.env.QA_COARSE_RECEIPT)fs.writeFileSync(process.env.QA_COARSE_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('PASS: coarse radius pair rejection exact per-callback RC4 parity; perf directional only');
