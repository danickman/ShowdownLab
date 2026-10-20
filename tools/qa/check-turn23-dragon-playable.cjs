'use strict';
// Permanent playable contract: actual L4 dragon charge 40 simulated ticks; L3/L5 remain original 16.
// Run genuine source frame() physics, not a guessed formula or artificial hit.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const live=read('v3/legacy-sim-core.js');
const anchor="u.windup=u.windupTicks+(ultimate.rank(u)===1?24:0);u.action='fire_windup'";
assert.equal(live.split(anchor).length,2,'Dragon L4-only exposed telegraph must remain in source');
function firstBreath(level){
 let time=0,n=0,q=new Map(),errors=[],first=null,last=null;
 const env={window:null,Math,performance:{now:()=>time},requestAnimationFrame(cb){const id=++n;q.set(id,cb);return id},cancelAnimationFrame(id){q.delete(id)},console:{error:(...x)=>errors.push(x.join(' '))}};
 env.window=env;vm.createContext(env);for(const file of ['v3/evolution-rules.js','v3/ultimate-abilities.js','v3/legacy-sim-core.js'])vm.runInContext(read(file),env,{filename:file});
 const sim=env.LegacySimCore;sim.configure({seed:83117,speed:1,onState:()=>{}});
 sim.deploy([{type:'dragon',level}], [{type:'turtle',level:1}]);sim.setRunning(true);
 for(let frame=0;frame<1100;frame++){
  time+=16.667;const pending=[...q.values()];q.clear();for(const cb of pending)cb(time);
  const z=sim.getState(),d=z.units.find(u=>u.type==='dragon');
  if(!d||d.hp<=0)break;
  if(d.action==='fire_windup'&&first===null)first=z.tick;
  if(d.action==='fire'&&first!==null){last=z.tick;break}
 }
 assert.deepEqual(errors,[],'no source simulator error');
 assert(first!==null&&last!==null,'Dragon must land first actual physical breath');
 return last-first;
}
assert.equal(firstBreath(3),16,'L3 Dragon windup unchanged');
assert.equal(firstBreath(4),40,'L4 Dragon real 16+24 windup');
assert.equal(firstBreath(5),16,'L5 Dragon retains premium original fast windup');
console.log('PASS: source-real L3/L4/L5 Dragon windup 16 / 40 / 16 ticks; no changed damage, AI or L5.');
