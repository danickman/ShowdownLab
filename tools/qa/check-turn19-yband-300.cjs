'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto'),assert=require('node:assert/strict'),{performance}=require('perf_hooks');
const read=n=>fs.readFileSync(path.resolve(__dirname,'../../v3',n+'.js'),'utf8');
const source=read('legacy-sim-core'),a=source.indexOf('function separate(initial=false){'),b=source.indexOf('function slotPoint(',a);
assert.equal(source.slice(a,b).length,1016,'baseline source moved');
const optimized="function separate(initial=false){\nconst alive=units.filter(u=>u.hp>0&&u.burrow<=0);\nif(alive.length<=60){const passes=initial?10:alive.length>32?4:3,radii=alive.map(visualSpacingRadius),globalBound=2*Math.max(...radii)*1.14;for(let pass=0;pass<passes;pass++)for(let i=0;i<alive.length;i++)for(let j=i+1;j<alive.length;j++){const a=alive[i],b=alive[j],dx=b.x-a.x;if(dx>=globalBound||dx<=-globalBound)continue;const dy=b.y-a.y;if(dy>=globalBound||dy<=-globalBound)continue;const same=a.team===b.team,min=(radii[i]+radii[j])*(same?1.14:1.00);if(dx>=min||dx<=-min||dy>=min||dy<=-min)continue;const d0=Math.hypot(dx,dy);if(d0>=min)continue;let nx,ny,d=d0;if(d<.0001){const angle=((a.id*37+b.id*19+pass*11)%360)*Math.PI/180;nx=Math.cos(angle);ny=Math.sin(angle);d=.0001}else{nx=dx/d;ny=dy/d}const overlap=(min-d)*(initial?.72:same?.52:.38),ma=HEAVY.has(a.type)?2:1,mb=HEAVY.has(b.type)?2:1,total=ma+mb;a.x=clamp(a.x-nx*overlap*(mb/total));a.y=clamp(a.y-ny*overlap*(mb/total));b.x=clamp(b.x+nx*overlap*(ma/total));b.y=clamp(b.y+ny*overlap*(ma/total))}}\nelse {\nconst n=alive.length,passes=initial?10:n>32?4:3,radii=alive.map(visualSpacingRadius),globalBound=2*Math.max(...radii)*1.14;\nconst x=new Float64Array(n),y=new Float64Array(n),mass=new Uint8Array(n),team=new Uint8Array(n),ids=new Int32Array(n);\nconst stepSize=Math.max(.000001,globalBound),words=Math.ceil(n/32),binCount=Math.ceil(1/stepSize)+2;\nconst yBins=new Int16Array(n),bits=new Uint32Array(words*binCount);\nconst coord=v=>Math.max(0,Math.min(binCount-1,Math.floor(v/stepSize)));\nfor(let k=0;k<n;k++){const u=alive[k];x[k]=u.x;y[k]=u.y;mass[k]=HEAVY.has(u.type)?2:1;team[k]=u.team==='blue'?1:2;ids[k]=u.id;}\nfunction relocate(i){\n const bin=coord(y[i]),old=yBins[i];if(bin===old)return;\n const word=i>>>5,bit=1<<(i&31);\n bits[old*words+word]&=~bit;bits[bin*words+word]|=bit;yBins[i]=bin;\n}\nfunction nearbyAfter(i,after){\n const bi=yBins[i],start=after+1;\n for(let w=start>>>5;w<words;w++){\n  const left=bi>0?bits[(bi-1)*words+w]:0,middle=bits[bi*words+w],right=bi+1<binCount?bits[(bi+1)*words+w]:0;\n  let candidates=left|middle|right;\n  if(w===(start>>>5))candidates&=(-1<<(start&31));\n  if(!candidates)continue;\n  const j=(w<<5)+31-Math.clz32(candidates&-candidates);\n  if(j<n)return j;\n }\n return -1;\n}\nfor(let pass=0;pass<passes;pass++){\n bits.fill(0);\n for(let k=0;k<n;k++){const bin=coord(y[k]);yBins[k]=bin;bits[bin*words+(k>>>5)]|=1<<(k&31);}\n for(let i=0;i<n;i++){\n  let ax=x[i],ay=y[i],cursor=i,j;const ri=radii[i],ti=team[i],mi=mass[i],idi=ids[i];\n  while((j=nearbyAfter(i,cursor))>=0){\n   cursor=j;\n   const dx=x[j]-ax;if(dx>=globalBound||dx<=-globalBound)continue;\n   const dy=y[j]-ay;if(dy>=globalBound||dy<=-globalBound)continue;\n   const same=ti===team[j],min=(ri+radii[j])*(same?1.14:1.00);\n   if(dx>=min||dx<=-min||dy>=min||dy<=-min)continue;\n   const d0=Math.hypot(dx,dy);if(d0>=min)continue;\n   let nx,ny,d=d0;\n   if(d<.0001){const angle=((idi*37+ids[j]*19+pass*11)%360)*Math.PI/180;nx=Math.cos(angle);ny=Math.sin(angle);d=.0001}\n   else{nx=dx/d;ny=dy/d}\n   const overlap=(min-d)*(initial?.72:same?.52:.38),mj=mass[j],total=mi+mj;\n   ax=clamp(ax-nx*overlap*(mj/total));ay=clamp(ay-ny*overlap*(mj/total));\n   x[j]=clamp(x[j]+nx*overlap*(mi/total));y[j]=clamp(y[j]+ny*overlap*(mi/total));\n   y[i]=ay;relocate(i);relocate(j);\n  }\n  x[i]=ax;y[i]=ay;\n }\n}\nfor(let k=0;k<n;k++){alive[k].x=x[k];alive[k].y=y[k];}\n}\n}";
const variants={current:source,yband:source.slice(0,a)+optimized+source.slice(b)};
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
 const current=run('current',count,speed,frames,seed),yband=run('yband',count,speed,frames,seed);
 assert.equal(yband.hash,current.hash,'EXACT full RAF state mismatch '+count+' '+speed+'x');baseline.push({count,speed,frames,current,yband});
}
for(let n=0;n<3;n++)for(const speed of [1,10]){
 const order=n%2===0?['yband','current']:['current','yband'],result={};
 for(const arm of order)result[arm]=run(arm,300,speed,speed===10?12:20,92731+n);
 assert.equal(result.current.hash,result.yband.hash,'300 heldout exact SHA mismatch');
 matched.push({n,speed,order,current:result.current,yband:result.yband,ratio:+(result.yband.p95/Math.max(.001,result.current.p95)).toFixed(3)});
}
const result={sourceSHA:crypto.createHash('sha256').update(source).digest('hex'),kind:'Node JS source-real RAF callback CPU milliseconds, not Chromium actual RAF interval or Safari FPS',baseline,matched,wallMs:+(performance.now()-start).toFixed(1)};
if(process.env.QA_TURN19_RECEIPT)fs.writeFileSync(process.env.QA_TURN19_RECEIPT,JSON.stringify(result,null,2)+'\n');
console.log('TURN19 YBAND SAME-RUN '+JSON.stringify({cases:baseline.map(r=>({count:r.count,speed:r.speed,old:r.current.p95,new:r.yband.p95,ratio:+(r.yband.p95/Math.max(.001,r.current.p95)).toFixed(3),tick:r.current.tick})),matched:matched.map(r=>({run:r.n,speed:r.speed,old:r.current.p95,new:r.yband.p95,ratio:r.ratio})),wallMs:result.wallMs}));
console.log('PASS: 10 original-vs-candidate exact source RAF SHA pairs at 20/40/80/120/300 x 1/10x, six heldout 300 pairs; no claimed real iPhone FPS');
