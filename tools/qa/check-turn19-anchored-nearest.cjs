'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto'),assert=require('node:assert/strict'),{performance}=require('perf_hooks');
const read=n=>fs.readFileSync(path.resolve(__dirname,'../../v3',n+'.js'),'utf8');
const source=read('legacy-sim-core'),a=source.indexOf('function nearest(u,preferBack=false){'),b=source.indexOf('function bodyRadius(',a);
assert(a>=0&&b>a,'nearest source signature moved');
const optimized="function nearest(u,preferBack=false){\n if(pressureTick!==tick)refreshPressureCache();\n const laneWeight=units.length<=40?.12:units.length<60?(60-units.length)*.006:0;\n let pool=units.filter(v=>v.team!==u.team&&v.hp>0&&v.burrow<=0&&Number.isFinite(v.x)&&Number.isFinite(v.y));\n if(!pool.length)return[null,Infinity];\n let restrictBack=false;\n if(preferBack){const backs=pool.filter(v=>BACK.has(v.type));if(backs.length){pool=backs;restrictBack=true}}\n const pressureByTarget=pressureCache[u.team],lanePenalty=!!(laneWeight&&!BACK.has(u.type)&&u.type!=='assassin'&&u.type!=='mole');\n let best=null,score=Infinity,bd=Infinity,cutoffSquared=Infinity;\n const prior=u.target==null?null:units[u.target-1];\n if(prior&&prior.team!==u.team&&prior.hp>0&&prior.burrow<=0&&Number.isFinite(prior.x)&&Number.isFinite(prior.y)&&(!restrictBack||BACK.has(prior.type))){\n  const dx=prior.x-u.x,dy=prior.y-u.y,d=Math.hypot(dx,dy),pressure=pressureByTarget.get(prior.id)||0;\n  score=d+Math.max(0,pressure-2)*.035+(lanePenalty?Math.abs(dy)*laneWeight:0);\n  bd=d;best=prior;const bound=score+1e-12;cutoffSquared=bound*bound;\n }\n for(const v of pool){\n  const dx=v.x-u.x,dy=v.y-u.y;\n  if(dx*dx+dy*dy>=cutoffSquared)continue;\n  const d=Math.hypot(dx,dy),pressure=pressureByTarget.get(v.id)||0,s=d+Math.max(0,pressure-2)*.035+(lanePenalty?Math.abs(dy)*laneWeight:0);\n  if(s<score||(s===score&&best&&v.id<best.id)){\n   score=s;bd=d;best=v;const bound=score+1e-12;cutoffSquared=bound*bound;\n  }\n }\n return[best,bd];\n}";
const variants={current:source,anchored:source.slice(0,a)+optimized+source.slice(b)};
const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const percentile=(x,q)=>{let a=[...x].sort((a,b)=>a-b);return a[Math.min(a.length-1,Math.floor((a.length-1)*q))]||0};
function run(arm,count,speed,frames,seed){
 let now=0,id=0,queue=new Map(),errors=[],durations=[],digest=crypto.createHash('sha256'),last=null;
 const e={window:null,Math,performance:{now:()=>now},requestAnimationFrame:f=>{let n=++id;queue.set(n,f);return n},cancelAnimationFrame:n=>queue.delete(n),console:{error:(...m)=>errors.push(m.join(' '))}};e.window=e;vm.createContext(e);
 for(const s of [read('evolution-rules'),read('ultimate-abilities'),variants[arm]])vm.runInContext(s,e);
 const sim=e.LegacySimCore,make=()=>Array.from({length:count/2},(_,i)=>({type:types[i%10],level:[1,4,5][i%3],squad:Math.floor(i/5)}));
 sim.configure({seed,speed,onState:()=>{}});sim.deploy(make(),make());sim.setRunning(true);
 for(let frame=0;frame<frames;frame++){
  now+=16.667;const jobs=[...queue.values()];queue.clear();
  const t0=performance.now();for(const cb of jobs)cb(now);durations.push(performance.now()-t0);
  last=sim.getState();digest.update(JSON.stringify(last)+'\n');
  assert.equal(last.units.length,count);assert(last.units.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.y)&&Number.isFinite(u.hp)));
 }
 assert.deepEqual(errors,[]);return{hash:digest.digest('hex'),tick:last.tick,
  p50:+percentile(durations,.5).toFixed(3),p95:+percentile(durations,.95).toFixed(3),
  mean:+(durations.reduce((a,b)=>a+b,0)/durations.length).toFixed(3)};
}
const baseline=[],matched=[],start=performance.now();
for(const count of [20,40,80,120,300])for(const speed of [1,10]){
 const frames=count===300?(speed===10?12:20):(speed===10?16:28),seed=81337+count;
 const current=run('current',count,speed,frames,seed),anchored=run('anchored',count,speed,frames,seed);
 assert.equal(anchored.hash,current.hash,'EXACT full RAF state mismatch '+count+' '+speed+'x');baseline.push({count,speed,frames,current,anchored});
}
for(let n=0;n<3;n++)for(const speed of [1,10]){
 const order=n%2===0?['anchored','current']:['current','anchored'],result={};
 for(const arm of order)result[arm]=run(arm,300,speed,speed===10?12:20,92731+n);
 assert.equal(result.current.hash,result.anchored.hash,'300 heldout exact SHA mismatch');
 matched.push({n,speed,order,current:result.current,anchored:result.anchored,ratio:+(result.anchored.p95/Math.max(.001,result.current.p95)).toFixed(3)});
}
const result={sourceSHA:crypto.createHash('sha256').update(source).digest('hex'),kind:'Node JS source-real RAF callback CPU milliseconds, not Chromium actual RAF interval or Safari FPS',baseline,matched,wallMs:+(performance.now()-start).toFixed(1)};
if(process.env.QA_TURN19_ANCHORED_RECEIPT)fs.writeFileSync(process.env.QA_TURN19_ANCHORED_RECEIPT,JSON.stringify(result,null,2)+'\n');
console.log('TURN19 ANCHORED SAME-RUN '+JSON.stringify({cases:baseline.map(r=>({count:r.count,speed:r.speed,old:r.current.p95,new:r.anchored.p95,ratio:+(r.anchored.p95/Math.max(.001,r.current.p95)).toFixed(3),tick:r.current.tick})),matched:matched.map(r=>({run:r.n,speed:r.speed,old:r.current.p95,new:r.anchored.p95,ratio:r.ratio})),wallMs:result.wallMs}));
console.log('PASS: 10 original-vs-candidate exact source RAF SHA pairs at 20/40/80/120/300 x 1/10x, six heldout 300 pairs; no claimed real iPhone FPS');
