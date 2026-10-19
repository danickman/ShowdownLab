'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto'),assert=require('node:assert/strict'),{performance}=require('perf_hooks');
const read=n=>fs.readFileSync(path.resolve(__dirname,'../../v3',n+'.js'),'utf8');
const source=read('legacy-sim-core'),a=source.indexOf('function separate(initial=false){'),b=source.indexOf('function slotPoint(',a);
assert.equal(source.slice(a,b).length,1016,'baseline source moved');
const optimized="function separate(initial=false){const alive=units.filter(u=>u.hp>0&&u.burrow<=0),passes=initial?10:alive.length>32?4:3,radii=alive.map(visualSpacingRadius),globalBound=2*Math.max(...radii)*1.14;\nconst cell=Math.max(.000001,globalBound),grid=new Map(),bucket=new Array(alive.length);\nconst key=(x,y)=>Math.floor(x/cell)+':'+Math.floor(y/cell);\nconst locate=i=>{const k=key(alive[i].x,alive[i].y),prior=bucket[i];if(prior===k)return;\n if(prior!=null){const p=grid.get(prior);p.delete(i);if(!p.size)grid.delete(prior)}\n let p=grid.get(k);if(!p){p=new Set();grid.set(k,p)}p.add(i);bucket[i]=k;};\nfor(let pass=0;pass<passes;pass++){\n grid.clear();bucket.fill(null);\n for(let i=0;i<alive.length;i++)locate(i);\n for(let i=0;i<alive.length;i++){\n  let cursor=i;\n  for(;;){\n   const ax=alive[i].x,ay=alive[i].y,gx=Math.floor(ax/cell),gy=Math.floor(ay/cell);\n   let j=alive.length;\n   for(let xx=gx-1;xx<=gx+1;xx++)for(let yy=gy-1;yy<=gy+1;yy++){\n    const p=grid.get(xx+':'+yy);if(!p)continue;\n    for(const n of p)if(n>cursor&&n<j)j=n;\n   }\n   if(j===alive.length)break;\n   cursor=j;\n   const a=alive[i],b=alive[j],dx=b.x-a.x;if(dx>=globalBound||dx<=-globalBound)continue;const dy=b.y-a.y;if(dy>=globalBound||dy<=-globalBound)continue;const same=a.team===b.team,min=(radii[i]+radii[j])*(same?1.14:1.00);if(dx>=min||dx<=-min||dy>=min||dy<=-min)continue;const d0=Math.hypot(dx,dy);if(d0>=min)continue;let nx,ny,d=d0;if(d<.0001){const angle=((a.id*37+b.id*19+pass*11)%360)*Math.PI/180;nx=Math.cos(angle);ny=Math.sin(angle);d=.0001}else{nx=dx/d;ny=dy/d}const overlap=(min-d)*(initial?.72:same?.52:.38),ma=HEAVY.has(a.type)?2:1,mb=HEAVY.has(b.type)?2:1,total=ma+mb;a.x=clamp(a.x-nx*overlap*(mb/total));a.y=clamp(a.y-ny*overlap*(mb/total));b.x=clamp(b.x+nx*overlap*(ma/total));b.y=clamp(b.y+ny*overlap*(ma/total))\n   locate(i);locate(j);\n  }\n }\n}\n}";
const variants={current:source,spatial:source.slice(0,a)+optimized+source.slice(b)};
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
 const current=run('current',count,speed,frames,seed),spatial=run('spatial',count,speed,frames,seed);
 assert.equal(spatial.hash,current.hash,'EXACT full RAF state mismatch '+count+' '+speed+'x');baseline.push({count,speed,frames,current,spatial});
}
for(let n=0;n<3;n++)for(const speed of [1,10]){
 const order=n%2===0?['spatial','current']:['current','spatial'],result={};
 for(const arm of order)result[arm]=run(arm,300,speed,speed===10?12:20,92731+n);
 assert.equal(result.current.hash,result.spatial.hash,'300 heldout exact SHA mismatch');
 matched.push({n,speed,order,current:result.current,spatial:result.spatial,ratio:+(result.spatial.p95/Math.max(.001,result.current.p95)).toFixed(3)});
}
const result={sourceSHA:crypto.createHash('sha256').update(source).digest('hex'),kind:'Node JS source-real RAF callback CPU milliseconds, not Chromium actual RAF interval or Safari FPS',baseline,matched,wallMs:+(performance.now()-start).toFixed(1)};
if(process.env.QA_TURN14_RECEIPT)fs.writeFileSync(process.env.QA_TURN14_RECEIPT,JSON.stringify(result,null,2)+'\n');
console.log('TURN14 SPATIAL SAME-RUN '+JSON.stringify({cases:baseline.map(r=>({count:r.count,speed:r.speed,old:r.current.p95,new:r.spatial.p95,ratio:+(r.spatial.p95/Math.max(.001,r.current.p95)).toFixed(3),tick:r.current.tick})),matched:matched.map(r=>({run:r.n,speed:r.speed,old:r.current.p95,new:r.spatial.p95,ratio:r.ratio})),wallMs:result.wallMs}));
console.log('PASS: 10 original-vs-candidate exact source RAF SHA pairs at 20/40/80/120/300 x 1/10x, six heldout 300 pairs; no claimed real iPhone FPS');
