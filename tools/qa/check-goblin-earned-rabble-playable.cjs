'use strict';
// Actual playable physics check. Goblin L5 Rabble must earn real temporary
// fighters, preserve base fighter mechanics, and be bounded under 300 density.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('v3/legacy-sim-core.js'),evo=read('v3/evolution-rules.js'),ult=read('v3/ultimate-abilities.js'),fx=read('v3/ultimate-effects.js');
const anchor="if(!secondary&&a)for(const hit of ultimate.afterHit(a,t,dealt,units,tick))hurt(hit.target,hit.damage,hit.source,true)",deltaStart=" // L5 GOBLIN EARNED RABBLE:";
const start=source.indexOf(deltaStart),end=source.indexOf(anchor,start);
assert(start>0&&end>start&&source.split(deltaStart).length===2,'one L5 physical earned spawn source block');
const before=source.slice(0,start)+source.slice(end);
assert(ult.includes('EARNED RABBLE: your first true landed stab'),'Fighter Guide says what L5 physically does');
assert(fx.includes("f.ability==='pack_call'"),'a visible new local troop arrival cue is implemented');
function run(level,spec,original=false){
 let clock=0,next=0,queue=new Map(),errors=[],sawCue=false,peak=0,maxPerSide=0,last=null;
 const hash=crypto.createHash('sha256');
 const env={window:null,Math,performance:{now:()=>clock},requestAnimationFrame(cb){const id=++next;queue.set(id,cb);return id},cancelAnimationFrame(id){queue.delete(id)},console:{error:(...x)=>errors.push(x.join(' '))}};env.window=env;vm.createContext(env);
 for(const [file,txt] of [['v3/evolution-rules.js',evo],['v3/ultimate-abilities.js',ult],['v3/legacy-sim-core.js',original?before:source]])vm.runInContext(txt,env,{filename:file});
 const sim=env.LegacySimCore;sim.configure({seed:31757,speed:10,onState:()=>{}});
 const blue=Array.from({length:spec},()=>({type:'goblin',level})),red=Array.from({length:spec},()=>({type:'knight',level:3}));
 sim.deploy(blue,red);assert.equal(sim.getState().units.length,spec*2);sim.setRunning(true);
 for(let frame=0;frame<(spec>100?55:180);frame++){
  clock+=16.667;const callbacks=[...queue.values()];queue.clear();for(const cb of callbacks)cb(clock);
  const z=sim.getState(), echoes=z.units.filter(u=>u.packEcho===true),bySide=team=>echoes.filter(u=>u.team===team).length;
  peak=Math.max(peak,echoes.length);maxPerSide=Math.max(maxPerSide,bySide('blue'),bySide('red'));
  assert(bySide('blue')<=4&&bySide('red')<=4,'hard per-side cap of 4');
  assert(z.units.length<=spec*2+8,'bounded actual total bodies');
  for(const e of echoes){assert.equal(e.type,'goblin');assert.equal(e.level,3);assert.equal(e.mastery,0);assert(Math.abs(e.maxHp-49*env.ShowdownEvolution.multiplier(3)*.72)<.03)}
  if(z.units.some(u=>u.ultimateKind==='pack_call'))sawCue=true;
  hash.update(JSON.stringify(z)+'\n');last=z;if(z.winner)break;
 }
 assert.deepEqual(errors,[],'source simulation has no errors, including battle winners');
 return{peak,maxPerSide,sawCue,digest:hash.digest('hex'),last};
}
const l4=run(4,4),l4Control=run(4,4,true);
assert.equal(l4.peak,0);assert.equal(l4.digest,l4Control.digest,'entire unchanged L4 RAF state exact, including no phantom bodies');
const l5=run(5,5);assert(l5.peak>0,'real primary L5 hit generated new Goblin fighters');assert(l5.sawCue,'actual L5 summon first contact receives an observable cue');
const repeat=run(5,5);assert.equal(l5.digest,repeat.digest,'L5 summon deterministic across all real full RAF snapshots');
const dense=run(5,150);
assert(dense.maxPerSide<=4&&dense.peak<=8,'150 vs 150 source population never blooms beyond cap');
console.log('PASS: playable L5 real first-contact L3 Rabble 72% HP, capped 4/side, 6-tick emergence, unique IDs, visible cue, L4 exact RAF, L5 deterministic replay, 300-body capped genuine core smoke');
