'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),{performance}=require('perf_hooks');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('v3/legacy-sim-core.js'),study=read('tools/qa/check-turn19-wasm-300.cjs');
const prefix="const optimized=source.replace('function separate(initial=false){',",suffix="+'function separate(initial=false){if(units.length>=80&&wasmCollisionPass(initial))return;'";
const a=study.indexOf(prefix),b=study.indexOf(suffix,a);assert(a>=0&&b>a);
const helper=JSON.parse(study.slice(a+prefix.length,b));
const wasm=source.replace('function separate(initial=false){',helper+'function separate(initial=false){if(units.length>=80&&wasmCollisionPass(initial))return;');
const defs=[['nearest','u,preferBack=false','u,preferBack','function bodyRadius('],['separate','initial=false','initial','function slotPoint('],['slotPoint','u,t','u,t','function hurt('],['hurt','t,dmg,a,secondary=false','t,dmg,a,secondary','function hit('],['step','','','function winner('],['emit','force=false','force','function frame(']];
function instrument(src){
 let s=src;
 for(const [name,args,passed,marker] of defs){
  const sig='function '+name+'('+args+'){',orig='function __original_'+name+'('+args+'){';
  assert.equal(s.split(sig).length,2,'signature moved '+name);s=s.replace(sig,orig);
  const wrap='function '+name+'('+args+'){const z=__perfClock();try{return __original_'+name+'('+passed+')}finally{__qaProfile.'+name+'.count++;__qaProfile.'+name+'.ms+=__perfClock()-z}}';
  assert(s.includes(marker));s=s.replace(marker,wrap+marker);
 }
 s=s.replace('function __original_nearest(','const __qaProfile={nearest:{count:0,ms:0},separate:{count:0,ms:0},slotPoint:{count:0,ms:0},hurt:{count:0,ms:0},step:{count:0,ms:0},emit:{count:0,ms:0}};function __original_nearest(');
 assert(s.includes('window.LegacySimCore={configure'));
 return s.replace('window.LegacySimCore={configure','window.LegacySimCore={getProfile:()=>JSON.parse(JSON.stringify(__qaProfile)),configure');
}
const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
function run(variant,speed,seed){
 let now=0,id=0,queue=new Map(),errors=[];
 const e={window:null,Math,WebAssembly,atob:globalThis.atob,performance:{now:()=>now},__perfClock:()=>performance.now(),requestAnimationFrame:f=>{const i=++id;queue.set(i,f);return i},cancelAnimationFrame:i=>queue.delete(i),console:{error:(...x)=>errors.push(x.join(' '))}};e.window=e;vm.createContext(e);
 for(const p of ['v3/evolution-rules.js','v3/ultimate-abilities.js'])vm.runInContext(read(p),e);
 vm.runInContext(instrument(variant==='wasm'?wasm:source),e);
 const sim=e.LegacySimCore,roster=()=>Array.from({length:150},(_,i)=>({type:types[i%10],level:[1,4,5][i%3],squad:Math.floor(i/5)}));
 sim.configure({seed,speed,onState:()=>{}});sim.deploy(roster(),roster());sim.setRunning(true);
 for(let k=0;k<(speed===10?16:32);k++){now+=16.667;const c=[...queue.values()];queue.clear();for(const f of c)f(now)}
 const state=sim.getState(),profile=sim.getProfile();
 assert.deepEqual(errors,[]);assert.equal(state.units.length,300);assert(state.tick>0);
 return{seed,speed,variant,tick:state.tick,alive:state.units.filter(u=>u.hp>0).length,profile};
}
const result=[];for(const seed of [81337,81338])for(const speed of [1,10])for(const variant of ['current','wasm'])result.push(run(variant,speed,seed));
for(const x of result)console.log('TURN19 CPU ATTRIBUTION '+JSON.stringify({seed:x.seed,variant:x.variant,speed:x.speed,tick:x.tick,alive:x.alive,parts:Object.entries(x.profile).map(([name,v])=>({name,calls:v.count,ms:+v.ms.toFixed(2),perCallMs:+(v.ms/Math.max(1,v.count)).toFixed(4)}))}));
if(process.env.QA_TURN19_PROFILE_RECEIPT)fs.writeFileSync(process.env.QA_TURN19_PROFILE_RECEIPT,JSON.stringify(result,null,2)+'\n');
console.log('PASS: true 300 source CPU attribution at 1x/10x, not actual browser RAF');
