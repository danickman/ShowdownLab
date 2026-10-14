'use strict';
// Extreme edge smoke: 300 fighters total, not a new soft or hard army limit.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const {performance}=require('perf_hooks');
const read=n=>fs.readFileSync(path.join(__dirname,'../../v3',n+'.js'),'utf8');
const types=['knight','goose','assassin','sniper','dragon','beetank','mole','turtle','goblin','barbarian'];
let now=0,next=0,q=new Map(),errors=[];
const env={window:null,Math,performance:{now:()=>now},requestAnimationFrame(fn){const id=++next;q.set(id,fn);return id},
 cancelAnimationFrame(id){q.delete(id)},console:{error:(...args)=>errors.push(args.join(' '))},CustomEvent:class{},dispatchEvent(){}};
env.window=env;vm.createContext(env);
for(const name of ['evolution-rules','ultimate-abilities','legacy-sim-core','simulation-adapter'])vm.runInContext(read(name),env);
const A=env.ShowdownAdapter,E=env.ShowdownEvolution;
const blue={},red={},levels={};
for(let i=0;i<types.length;i++){blue[types[i]]=15;red[types[i]]=15;levels[types[i]]=[1,4,5][i%3]}
assert.equal(E.population({armies:{blue,red}}),300);
const deployStart=performance.now();
A.startMatch({blue,red,blueLevels:levels,redLevels:levels,blueLives:2,redLives:2,seed:31337});
const deployMs=performance.now()-deployStart;
const s0=A.getState();assert.equal(s0.units.length,300);
function step(frames,speed){
 A.setSpeed(speed);let durations=[];
 for(let i=0;i<frames;i++){
  now+=16.667;const jobs=[...q.values()];q.clear();const begin=performance.now();
  for(const fn of jobs)fn(now);
  durations.push(performance.now()-begin);
  const s=A.getState();
  assert(s.units.length===300,'no simulated fighter objects may disappear');
  assert(s.units.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.y)&&Number.isFinite(u.hp)));
  assert(s.units.every(u=>u.x>=0&&u.x<=1&&u.y>=0&&u.y<=1));
  if(s.phase!=='battle')break;
 }
 durations.sort((a,b)=>a-b);
 return{speed,samples:durations.length,p50Ms:+durations[Math.floor(durations.length*.5)].toFixed(2),
 p95Ms:+durations[Math.min(durations.length-1,Math.floor(durations.length*.95))].toFixed(2),
 maxMs:+durations.at(-1).toFixed(2),totalMs:+durations.reduce((a,b)=>a+b,0).toFixed(2)};
}
const normal=step(18,1),turbo=step(4,10),end=A.getState();
assert.deepEqual(errors,[]);
const receipt={population:300,blue:150,red:150,deployMs:+deployMs.toFixed(2),normal,turbo,
 surviving:end.units.filter(u=>u.hp>0).length,phase:end.phase,platform:'Node VM synthetic RAF; NOT physical iPhone FPS'};
console.log('EXTREME 300 POPULATION '+JSON.stringify(receipt));
if(process.env.QA_300_RECEIPT)fs.writeFileSync(process.env.QA_300_RECEIPT,JSON.stringify(receipt,null,2));
console.log('PASS: 300-fighter root adapter deploy and 1x/10x state safety');
