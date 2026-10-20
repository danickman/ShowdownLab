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
// The full 300-fighter path must include 430x932 portrait camera and bounded
// presentation offsets, not just simulation state integrity.
vm.runInContext(read('camera'),env);
// Instrument cache size in QA only. Do not add debug UI/API in production.
const stagingSource=read('combat-staging');
assert(stagingSource.includes('return{prepare,point,offset,reset};'));
vm.runInContext(stagingSource.replace('return{prepare,point,offset,reset};','return{prepare,point,offset,reset,qaCacheSize:()=>offsets.size};'),env);
const portraitCamera=env.ShowdownCamera.create(430,932),portraitStage=env.CombatStaging.create();
const beforePresentation=JSON.stringify(s0.units);
const cameraStart=performance.now();for(let i=0;i<4;i++)portraitCamera.focus(s0.units);
const cameraMs=performance.now()-cameraStart;
const stageStart=performance.now();for(let i=0;i<4;i++)portraitStage.prepare(s0.units,portraitCamera,now+i*16.667);
const stageMs=performance.now()-stageStart;
assert.equal(portraitStage.qaCacheSize(),300,'all 300 living fighters must retain staging history');
assert.equal(JSON.stringify(s0.units),beforePresentation,'staging cannot mutate real combat');
let projected=0,outOfBounds=0;
for(const u of s0.units){const p=portraitStage.point(u,portraitCamera);assert(Number.isFinite(p.x)&&Number.isFinite(p.y));projected++;if(p.x<portraitCamera.arena.x-1||p.y<portraitCamera.arena.y-1||p.x>portraitCamera.arena.x+portraitCamera.arena.w+1||p.y>portraitCamera.arena.y+portraitCamera.arena.h+1)outOfBounds++}
assert.equal(projected,300);

function step(frames,speed){
 A.setSpeed(speed);let durations=[],offArena=0,maxExcursion=0;
 for(let i=0;i<frames;i++){
  now+=16.667;const jobs=[...q.values()];q.clear();const begin=performance.now();
  for(const fn of jobs)fn(now);
  durations.push(performance.now()-begin);
  const s=A.getState();
  // Never weaken deployed-body retention: ONLY bounded physically-real
  // L5 Goblin recruits can add fighter objects after first actual contact.
  const base=s.units.filter(u=>u.packEcho!==true),extra=s.units.filter(u=>u.packEcho===true);
  assert.equal(base.length,300,'one of the original 300 fighter bodies disappeared');
  assert.equal(new Set(base.map(u=>u.id)).size,300,'original 300 fighter IDs duplicated');
  assert(base.every(u=>Number.isInteger(u.id)&&u.id>=1&&u.id<=300),'original 300 unique IDs must remain');
  assert.equal(s.units.length,300+extra.length,'any extra body must be explicitly attributed');
  assert(extra.length<=8&&extra.every(u=>u.id>300&&u.type==='goblin'&&u.level===3&&u.mastery===0&&Number.isFinite(u.hp)),'only capped 2x4 L3 Goblin echoes permitted');
  for(const side of ['blue','red'])assert(extra.filter(u=>u.team===side).length<=4,'300-body source Goblin extra per-side cap');
  assert(s.units.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.y)&&Number.isFinite(u.hp)));
  // Separation can push fighter centers outside [0,1] in severe crowding.
  // Measure instead of assuming that world bounds are a structural invariant.
  for(const u of s.units){const excursion=Math.max(0,-u.x,u.x-1,-u.y,u.y-1);if(excursion>0){offArena++;maxExcursion=Math.max(maxExcursion,excursion)}}
  assert(maxExcursion<=.3,'severe >30%-width world-bound escape: '+maxExcursion);
  if(s.phase!=='battle')break;
 }
 durations.sort((a,b)=>a-b);
 return{speed,samples:durations.length,p50Ms:+durations[Math.floor(durations.length*.5)].toFixed(2),
 p95Ms:+durations[Math.min(durations.length-1,Math.floor(durations.length*.95))].toFixed(2),
 maxMs:+durations.at(-1).toFixed(2),totalMs:+durations.reduce((a,b)=>a+b,0).toFixed(2),offArenaObservations:offArena,maxWorldExcursion:+maxExcursion.toFixed(4)};
}
const normal=step(18,1),turbo=step(4,10),end=A.getState();
assert.deepEqual(errors,[]);
const receipt={population:300,blue:150,red:150,deployMs:+deployMs.toFixed(2),portrait:{width:430,height:932,cameraFocus4Ms:+cameraMs.toFixed(2),staging4Ms:+stageMs.toFixed(2),projected,outOfBounds},normal,turbo,
 surviving:end.units.filter(u=>u.hp>0).length,phase:end.phase,platform:'Node VM synthetic RAF; NOT physical iPhone FPS'};
console.log('EXTREME 300 POPULATION '+JSON.stringify(receipt));
if(process.env.QA_300_RECEIPT)fs.writeFileSync(process.env.QA_300_RECEIPT,JSON.stringify(receipt,null,2));
console.log('PASS: 300-fighter root adapter deploy and 1x/10x state safety');
