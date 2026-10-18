'use strict';
// Exact current-runtime target-selection performance benchmark; no source freeze.
// Restores the prior filter-array algorithm verbatim as the per-state reference.
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const {performance}=require('perf_hooks');
const root=path.resolve(__dirname,'../..'),read=n=>fs.readFileSync(path.join(root,'v3',n+'.js'),'utf8');
const optimized=read('legacy-sim-core');
const fastNearest="function nearest(u,preferBack=false){if(pressureTick!==tick)refreshPressureCache();const laneWeight=units.length<=40?.12:units.length<60?(60-units.length)*.006:0;let requireBack=false;if(preferBack)for(const v of units){if(v.team!==u.team&&v.hp>0&&v.burrow<=0&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&BACK.has(v.type)){requireBack=true;break}}const pressureByTarget=pressureCache[u.team];let best=null,score=Infinity,bd=Infinity;for(const v of units){if(v.team===u.team||!(v.hp>0)||!(v.burrow<=0)||!Number.isFinite(v.x)||!Number.isFinite(v.y)||(requireBack&&!BACK.has(v.type)))continue;const dx=v.x-u.x,dy=v.y-u.y,bound=score+1e-12;if(dx*dx+dy*dy>=bound*bound)continue;const d=Math.hypot(dx,dy),pressure=pressureByTarget.get(v.id)||0,s=d+Math.max(0,pressure-2)*.035+(laneWeight&&!BACK.has(u.type)&&u.type!=='assassin'&&u.type!=='mole'?Math.abs(dy)*laneWeight:0);if(s<score){score=s;bd=d;best=v}}return[best,bd]}";
const oldNearest="function nearest(u,preferBack=false){if(pressureTick!==tick)refreshPressureCache();const laneWeight=units.length<=40?.12:units.length<60?(60-units.length)*.006:0;let pool=units.filter(v=>v.team!==u.team&&v.hp>0&&v.burrow<=0&&Number.isFinite(v.x)&&Number.isFinite(v.y));if(!pool.length)return[null,Infinity];if(preferBack){const backs=pool.filter(v=>BACK.has(v.type));if(backs.length)pool=backs}const pressureByTarget=pressureCache[u.team];let best=null,score=Infinity,bd=Infinity;for(const v of pool){const dx=v.x-u.x,dy=v.y-u.y,bound=score+1e-12;if(dx*dx+dy*dy>=bound*bound)continue;const d=Math.hypot(dx,dy),pressure=pressureByTarget.get(v.id)||0,s=d+Math.max(0,pressure-2)*.035+(laneWeight&&!BACK.has(u.type)&&u.type!=='assassin'&&u.type!=='mole'?Math.abs(dy)*laneWeight:0);if(s<score){score=s;bd=d;best=v}}return[best,bd]}";
assert.equal(optimized.split(fastNearest).length,2,'live nearest implementation moved');
assert(oldNearest.includes('units.filter')&&oldNearest.includes('pressureByTarget'),'original must preserve pressure semantics');
const original=optimized.replace(fastNearest,oldNearest);
function simulate(source,n,seed,mirror,speed,frames){
 let now=0,next=0,errors=[],queue=new Map();
 const sandbox={window:null,Math,performance:{now:()=>now},
 requestAnimationFrame(fn){const id=++next;queue.set(id,fn);return id},cancelAnimationFrame(id){queue.delete(id)},console:{error:(...a)=>errors.push(a.join(' '))}};
 sandbox.window=sandbox;vm.createContext(sandbox);
 for(const script of ['evolution-rules','ultimate-abilities'])vm.runInContext(read(script),sandbox);
 vm.runInContext(source,sandbox,{filename:'legacy-sim-core.perf.js'});
 const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
 const team=t=>Array.from({length:n/2},(_,i)=>({type:types[(i*3+((mirror?t==='blue':t==='red')?5:0))%10],level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
 const core=sandbox.LegacySimCore;core.configure({seed,speed,onState:()=>{}});core.deploy(team('blue'),team('red'));core.setRunning(true);
 const digest=crypto.createHash('sha256');let total=0,framesRan=0,max=0,first=null,last=null,terminal=false;
 for(let i=0;i<frames;i++){
  now+=16.667;const jobs=[...queue.values()];queue.clear();const before=performance.now();
  for(const j of jobs)j(now);const ms=performance.now()-before;
  total+=ms;max=Math.max(max,ms);framesRan++;
  const s=core.getState();
  if(!first)first=s;
  last=s;
  assert.equal(s.units.length,n,'no missing units at '+n);
  assert(s.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.x)&&Number.isFinite(u.y)),'finite physical units');
  digest.update(JSON.stringify(s));
  if(s.winner){terminal=true;break}
 }
 assert.deepEqual(errors,[],'no source runtime errors at '+n+' fighters');
 return{digest:digest.digest('hex'),totalMs:total,frames:framesRan,peakMs:max,tick:last.tick,terminal,alive:last.units.filter(u=>u.hp>0).length};
}
const populations=[20,40,80,120,300],data=[],t0=performance.now();
for(const count of populations){
 const seeds=count>=80?[1337,27919]:[27919];
 const pairs=count===300?[[1,14],[10,3]]:count===120?[[1,30],[10,5]]:count===80?[[1,38],[10,7]]:[[1,48],[10,9]];
 for(const seed of seeds)for(const mirror of [false,true])for(const [speed,frames] of pairs){
  // ABBA makes scheduler noise less correlated with reference-vs-candidate order.
  const a=simulate(original,count,seed,mirror,speed,frames);
  const b=simulate(optimized,count,seed,mirror,speed,frames);
  const c=simulate(optimized,count,seed,mirror,speed,frames);
  const d=simulate(original,count,seed,mirror,speed,frames);
  for(const trial of [b,c,d]){
   assert.equal(trial.digest,a.digest,'full physical snapshot RAF divergence: '+JSON.stringify({count,seed,mirror,speed}));
   assert.equal(trial.tick,a.tick,'combat ticks diverged');
   assert.equal(trial.terminal,a.terminal,'battle terminal changed');
   assert.equal(trial.alive,a.alive,'real surviving population changed');
  }
  const baseline=(a.totalMs+d.totalMs)/2,candidate=(b.totalMs+c.totalMs)/2;
  data.push({count,seed,mirror,speed,frames:a.frames,ticks:a.tick,complete:a.terminal,
    referenceMs:+baseline.toFixed(2),optimizedMs:+candidate.toFixed(2),
    performanceRatio:+(candidate/Math.max(.0001,baseline)).toFixed(3),exactWholeRafSha:true});
 }
}
assert.equal(data.length,24,'2 small populations x 1 seed and 3 large x 2 seeds, 2 mirrors, 2 speeds');
const summary=populations.map(count=>{
 const a=data.filter(x=>x.count===count),ratios=a.map(x=>x.performanceRatio).sort((a,b)=>a-b);
 return{count,scenarios:a.length,medianRatio:ratios[Math.floor(ratios.length/2)],
  maxRatio:Math.max(...ratios),avgReferenceMs:+(a.reduce((s,x)=>s+x.referenceMs,0)/a.length).toFixed(2),
  avgOptimizedMs:+(a.reduce((s,x)=>s+x.optimizedMs,0)/a.length).toFixed(2)};
});
const receipt={status:'shipped source target selection vs byte-for-byte previous nearest original',
 method:'Source-only ABBA synthetic Node RAF comparing exact SHA256 of EVERY physical frame, 20/40/80/120/300 1x/10x, both mirror teams, 2 seeds at 80+, original pressure-cache/tie rules and backline precedence. Does not measure Canvas, GPU or native iPhone.',
 pairs:data.length,simulations:data.length*4,summary,scenarios:data,elapsedMs:+(performance.now()-t0).toFixed(2)};
if(process.env.QA_TARGET_SCAN_RECEIPT)fs.writeFileSync(process.env.QA_TARGET_SCAN_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('ALLOC-FREE NEAREST WHOLE-RAF PARITY '+JSON.stringify({summary,pairs:receipt.pairs,simulations:receipt.simulations,elapsedMs:receipt.elapsedMs}));
console.log('PASS: exact snapshots across 96 real frame traces, 20/40/80/120/300 at 1x/10x, red-blue mirrors; perf directional only');
