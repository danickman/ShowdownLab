// Turn 5C: matched-seed heavy combat simulation-only benchmark. No browser/canvas.
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const {performance}=require('perf_hooks');
const path=require('path'),root=path.resolve(__dirname,'../..');
const read=n=>fs.readFileSync(path.join(root,'v3',n+'.js'),'utf8');
const optimized=read('legacy-sim-core');
const optimizedNearest='const pressureByTarget=new Map();for(const a of units)if(a.team===u.team&&a.hp>0)pressureByTarget.set(a.target,(pressureByTarget.get(a.target)||0)+1);';
const baselineNearest='';
const optimizedPressure='pressure=pressureByTarget.get(v.id)||0';
const baselinePressure='pressure=units.reduce((n,a)=>n+(a.team===u.team&&a.hp>0&&a.target===v.id?1:0),0)';
const optimizedRadii='passes=initial?10:alive.length>32?4:3,radii=alive.map(visualSpacingRadius);';
const baselineRadii='passes=initial?10:alive.length>32?4:3;';
const optimizedMin='min=(radii[i]+radii[j])*(same?1.14:1.00)';
const baselineMin='min=(visualSpacingRadius(a)+visualSpacingRadius(b))*(same?1.14:1.00)';
for(const part of [optimizedNearest,optimizedPressure,optimizedRadii,optimizedMin])assert(optimized.includes(part),'optimized source anchor changed');
const baseline=optimized.replace(optimizedNearest,baselineNearest).replace(optimizedPressure,baselinePressure).replace(optimizedRadii,baselineRadii).replace(optimizedMin,baselineMin);
assert(baseline!==optimized,'baseline reconstruction unsuccessful');
const variants=[['original-algorithm',baseline],['optimized-algorithm',optimized]];
const typeSet=['knight','goose','assassin','sniper','dragon','beetank','mole','turtle','goblin','barbarian'];
function run(source,number,seed){
 let now=0,next=0,queue=new Map(),errors=[];
 const env={window:null,Math,performance:{now:()=>now},requestAnimationFrame:f=>{const id=++next;queue.set(id,f);return id},cancelAnimationFrame:id=>queue.delete(id),console:{error:(...xs)=>errors.push(xs.join(' '))},CustomEvent:class{},dispatchEvent(){}};
 env.window=env;vm.createContext(env);
 for(const name of ['evolution-rules','ultimate-abilities'])vm.runInContext(read(name),env);
 vm.runInContext(source,env);
 const core=env.LegacySimCore;
 const roster=(team)=>Array.from({length:number/2},(_,i)=>({type:typeSet[(i*3+(team==='red'?5:0))%typeSet.length],level:[1,2,4,5][i%4],mastery:i%3,squad:Math.floor(i/6)}));
 let lastState=null;
 core.configure({seed,speed:1,onState:x=>{lastState=x}});
 core.deploy(roster('blue'),roster('red'));
 core.setSpeed(1);core.setRunning(true);
 const durations=[],samples=[];
 for(let f=0;f<90;f++){
  now+=16.667;
  const callbacks=[...queue.values()];queue.clear();
  const begin=performance.now();
  for(const callback of callbacks)callback(now);
  durations.push(performance.now()-begin);
  if(f%15===14){
   const st=core.getState();
   const snapshot=JSON.stringify({tick:st.tick,winner:st.winner,units:st.units.map(u=>[u.id,u.team,u.type,u.hp,u.x,u.y,u.target,u.action,u.cooldown,u.burrow,u.ward])});
   samples.push(crypto.createHash('sha256').update(snapshot).digest('hex'));
  }
 }
 assert.deepStrictEqual(errors,[],'core frame errors');
 const sorted=durations.slice().sort((a,b)=>a-b);
 return{samples,frames:durations.length,units:number,seed,meanMs:durations.reduce((a,b)=>a+b,0)/durations.length,p50Ms:sorted[44],p95Ms:sorted[85],maxMs:sorted[89],totalMs:durations.reduce((a,b)=>a+b,0),endTick:core.getState().tick};
}
const rows=[];
for(const number of [80,120])for(const seed of [1337,7301,27919]){
 // Alternate order by seed to reduce JIT/warmup bias.
 const order=seed===7301?variants.slice().reverse():variants;
 const results={};
 for(const [name,code] of order)results[name]=run(code,number,seed);
 assert.deepStrictEqual(results['original-algorithm'].samples,results['optimized-algorithm'].samples,'deterministic state divergence: '+number+' seed '+seed);
 assert.equal(results['original-algorithm'].endTick,results['optimized-algorithm'].endTick,'tick mismatch');
 rows.push({units:number,seed,baseline:results['original-algorithm'],optimized:results['optimized-algorithm'],speedup:results['original-algorithm'].totalMs/results['optimized-algorithm'].totalMs});
}
const receipt={method:'paired vm RAF at 1x, 90 frames, identical source except two micro-optimizations; wall-clock measurements include JS VM cost; not a physical iPhone benchmark',rows};
const out=process.env.QA_STRESS_RECEIPT;
if(out)fs.writeFileSync(out,JSON.stringify(receipt,null,2)+'\n');
console.log('PASS: exact deterministic snapshots for 80/120-unit matches, six matched scenarios');
console.log(JSON.stringify(rows.map(r=>({units:r.units,seed:r.seed,oldTotalMs:+r.baseline.totalMs.toFixed(2),newTotalMs:+r.optimized.totalMs.toFixed(2),speedup:+r.speedup.toFixed(2),oldP95:+r.baseline.p95Ms.toFixed(2),newP95:+r.optimized.p95Ms.toFixed(2)}))));
