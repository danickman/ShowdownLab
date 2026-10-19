'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),crypto=require('crypto'),assert=require('node:assert/strict'),{performance}=require('perf_hooks');
const read=n=>fs.readFileSync(path.resolve(__dirname,'../../v3',n+'.js'),'utf8');
const source=read('legacy-sim-core'),a=source.indexOf('function separate(initial=false){'),b=source.indexOf('function slotPoint(',a);
assert.equal(source.slice(a,b).length,1016,'baseline source moved');
const optimized=source.replace('function separate(initial=false){',"const __wasm=new WebAssembly.Instance(new WebAssembly.Module(Uint8Array.from(atob(\"AGFzbQEAAAABFwRgAnx8AXxgAXwBfGAAAX9gBH9/f3wAAiEDA2VudgVoeXBvdAAAA2VudgNjb3MAAQNlbnYDc2luAAEDCAcCAgICAgIDBAUBcAEBAQUEAQECAgYIAX8BQYCYBQsHPQgGbWVtb3J5AgAEeHB0cgADBHlwdHIABARycHRyAAUFaWRwdHIABgRocHRyAAcEdHB0cgAIBXNvbHZlAAkKywcHCABBgIiAgAALCABBgKiAgAALCABBgMiAgAALCABBgOiAgAALCABBgPiAgAALCABBgIiBgAALkgcHAXwRfwF8AX8BfAF/BXwCQCABQQFIDQAgAEEBSA0AIAOaIQQgAEF/aiEFQQAhBgNAIAZBC2whB0EIIQhBACEJIAUhCkEAIQsDQAJAIAtBAWoiDCAATg0AIAtBAnQiDUGA+ICAAGohDiANQYDogIAAaiEPIAtBA3QiC0GAyICAAGohECANQYCIgYAAaiERIAtBgKiAgABqIRIgC0GAiICAAGohEyAIIQsgCSENIAohFANAAkAgC0GAiICAAGoiFSsDACATKwMAoSIWIANmDQAgFiAEZQ0AIAtBgKiAgABqIhcrAwAgEisDAKEiGCADZg0AIBggBGUNACAWRD0K16NwPfI/RAAAAAAAAPA/IBEoAgAgDUGEiIGAAGooAgBGIhkbIBArAwAgC0GAyICAAGorAwCgoiIaZg0AIBggGpoiG2UNACAWIBtlDQAgGCAaZg0AIBYgGBCAgICAACIbIBpmDQACQAJAIBtELUMc6+I2Gj9jDQAgGCAboyEYIBYgG6MhFgwBC0QtQxzr4jYaPyEbIA8oAgBBJWwgB2ogDUGE6ICAAGooAgBBE2xqQegCb7dEGC1EVPshCUCiRAAAAAAAgGZAoyIYEIGAgIAAIRYgGBCCgICAACEYCyATROxRuB6F66E/ROF6FK5H4e4/IBMrAwAgFkQK16NwPQrnP0SkcD0K16PgP0RSuB6F61HYPyAZGyACGyAaIBuhoiIaoiIbRAAAAAAAAABARAAAAAAAAPA/IA1BhPiAgABqKAIAGyIWIBZEAAAAAAAAAEBEAAAAAAAA8D8gDigCABsiHKAiHaMiHqKhIhYgFkThehSuR+HuP2QbIBZE7FG4HoXroT9jGzkDACASROxRuB6F66E/ROF6FK5H4e4/IBIrAwAgGCAaoiIYIB6ioSIWIBZE4XoUrkfh7j9kGyAWROxRuB6F66E/Yxs5AwAgFUTsUbgeheuhP0ThehSuR+HuPyAVKwMAIBsgHCAdoyIaoqAiFiAWROF6FK5H4e4/ZBsgFkTsUbgeheuhP2MbOQMAIBdE7FG4HoXroT9E4XoUrkfh7j8gGCAaoiAXKwMAoCIWIBZE4XoUrkfh7j9kGyAWROxRuB6F66E/Yxs5AwALIAtBCGohCyANQQRqIQ0gFEF/aiIUDQALCyAIQQhqIQggCUEEaiEJIApBf2ohCiAMIQsgDCAARw0ACyAGQQFqIgYgAUcNAAsLCw==\"),c=>c.charCodeAt(0))),{env:{hypot:Math.hypot,cos:Math.cos,sin:Math.sin}}).exports;const __wm=__wasm.memory.buffer,__wx=new Float64Array(__wm,__wasm.xptr(),512),__wy=new Float64Array(__wm,__wasm.yptr(),512),__wr=new Float64Array(__wm,__wasm.rptr(),512),__wi=new Int32Array(__wm,__wasm.idptr(),512),__wh=new Int32Array(__wm,__wasm.hptr(),512),__wt=new Int32Array(__wm,__wasm.tptr(),512);function wasmCollisionPass(initial){const a=units.filter(u=>u.hp>0&&u.burrow<=0),n=a.length;if(n>512)return false;const radii=a.map(visualSpacingRadius),bound=2*Math.max(...radii)*1.14;for(let k=0;k<n;k++){const u=a[k];__wx[k]=u.x;__wy[k]=u.y;__wr[k]=radii[k];__wi[k]=u.id;__wh[k]=HEAVY.has(u.type)?1:0;__wt[k]=u.team==='blue'?1:0;}__wasm.solve(n,initial?10:n>32?4:3,initial?1:0,bound);for(let k=0;k<n;k++){a[k].x=__wx[k];a[k].y=__wy[k];}return true;}"+'function separate(initial=false){if(units.length>=80&&wasmCollisionPass(initial))return;');
const variants={current:source,wasm:optimized};
const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const percentile=(x,q)=>{let a=[...x].sort((a,b)=>a-b);return a[Math.min(a.length-1,Math.floor((a.length-1)*q))]||0};
function run(arm,count,speed,frames,seed){
 let now=0,id=0,queue=new Map(),errors=[],durations=[],digest=crypto.createHash('sha256'),last=null;
 const e={window:null,Math,performance:{now:()=>now},requestAnimationFrame:f=>{let n=++id;queue.set(n,f);return n},cancelAnimationFrame:n=>queue.delete(n),console:{error:(...m)=>errors.push(m.join(' '))},atob:globalThis.atob};e.window=e;vm.createContext(e);
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
 const current=run('current',count,speed,frames,seed),wasm=run('wasm',count,speed,frames,seed);
 assert.equal(wasm.hash,current.hash,'EXACT full RAF state mismatch '+count+' '+speed+'x');baseline.push({count,speed,frames,current,wasm});
}
for(let n=0;n<3;n++)for(const speed of [1,10]){
 const order=n%2===0?['wasm','current']:['current','wasm'],result={};
 for(const arm of order)result[arm]=run(arm,300,speed,speed===10?12:20,92731+n);
 assert.equal(result.current.hash,result.wasm.hash,'300 heldout exact SHA mismatch');
 matched.push({n,speed,order,current:result.current,wasm:result.wasm,ratio:+(result.wasm.p95/Math.max(.001,result.current.p95)).toFixed(3)});
}
const result={sourceSHA:crypto.createHash('sha256').update(source).digest('hex'),kind:'Node JS source-real RAF callback CPU milliseconds, not Chromium actual RAF interval or Safari FPS',baseline,matched,wallMs:+(performance.now()-start).toFixed(1)};
if(process.env.QA_TURN19_WASM_RECEIPT)fs.writeFileSync(process.env.QA_TURN19_WASM_RECEIPT,JSON.stringify(result,null,2)+'\n');
console.log('TURN19_WASM WASM SAME-RUN '+JSON.stringify({cases:baseline.map(r=>({count:r.count,speed:r.speed,old:r.current.p95,new:r.wasm.p95,ratio:+(r.wasm.p95/Math.max(.001,r.current.p95)).toFixed(3),tick:r.current.tick})),matched:matched.map(r=>({run:r.n,speed:r.speed,old:r.current.p95,new:r.wasm.p95,ratio:r.ratio})),wallMs:result.wallMs}));
console.log('PASS: 10 original-vs-candidate exact source RAF SHA pairs at 20/40/80/120/300 x 1/10x, six heldout 300 pairs; no claimed real iPhone FPS');
