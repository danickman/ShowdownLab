'use strict';
// Read-only prospective Turtle guardian source A/B. No game runtime is modified.
// Evolved Turtle would protect nearby allies without stacking with Knight Bastion.
// Compare true terminal winners, positive HP damage and connected real fronts.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const liveCore=read('v3/legacy-sim-core.js'),liveUlt=read('v3/ultimate-abilities.js'),evo=read('v3/evolution-rules.js');
const once=(s,a,b)=>{assert.equal(s.split(a).length,2,'source anchor drift: '+a.slice(0,85));return s.replace(a,b)};
let prototypeCore=once(liveCore,'let bastions=[];','let bastions=[],turtleGuardians=[];');
prototypeCore=once(prototypeCore,
 'bastions=units.filter(u=>u.type===\'knight\'&&ultimate.rank(u));lastAliveCount',
 'bastions=units.filter(u=>u.type===\'knight\'&&ultimate.rank(u));turtleGuardians=units.filter(u=>u.type===\'turtle\'&&ultimate.rank(u));lastAliveCount');
prototypeCore=once(prototypeCore,'ultimate.incoming(t,dmg,units,tick,bastions)',
 'ultimate.incoming(t,dmg,units,tick,bastions,turtleGuardians)');
let prototypeUlt=once(liveUlt,'function incoming(t,damage,units,tick,bastions=units){',
 'function incoming(t,damage,units,tick,bastions=units,turtleGuardians=units){');
prototypeUlt=once(prototypeUlt,
 " if(protection){damage*=1-protection;cue(protector,'bastion',tick,t)}\n return damage;",
 " let shelter=0,guardian=null;\n for(const u of turtleGuardians)if(u!==t&&u.team===t.team&&u.hp>0&&u.type==='turtle'&&rank(u)&&near(u,t,rank(u)===2?.14:.12)){\n  const amount=rank(u)===2?.28:.18;if(amount>shelter){shelter=amount;guardian=u}\n }\n if(shelter>protection){damage*=1-shelter;cue(guardian,'shelter',tick,t)}\n else if(protection){damage*=1-protection;cue(protector,'bastion',tick,t)}\n return damage;");
const guardAnchor="if(shelter>protection){damage*=1-shelter;cue(guardian,'shelter',tick,t)}";
const observedUlt=once(prototypeUlt,guardAnchor,
 "if(shelter>protection){window.__qaGuard({tick,guardian:guardian.id,target:t.id,team:t.team,rank:rank(guardian),nominal:damage*shelter});damage*=1-shelter;cue(guardian,'shelter',tick,t)}");
const hitAnchor='const dealt=Math.min(t.hp,dmg);';
const observeCore=s=>once(s,hitAnchor,hitAnchor+
 "if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,attacker:a.id,target:t.id,role:a.type,team:a.team,damage:dealt,x:t.x,y:t.y});");
const graph=read('tools/qa/check-role-fronts-baseline.cjs');
const lo=graph.indexOf('const cell='),hi=graph.indexOf('// Synthetic truth fixtures',lo);
assert(lo>=0&&hi>lo,'real front metric definition moved');
const damageFronts=vm.runInNewContext(graph.slice(lo,hi)+';damageFronts',{Math});
const patterns={
 mixed:{ours:['turtle','knight','sniper','turtle','mole','goblin','barbarian','goose','turtle','dragon'],
  foe:['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose']},
 swarm:{ours:['turtle','turtle','knight','goblin','goose','barbarian','mole','turtle','sniper','knight'],
  foe:['goblin','goblin','goose','goblin','barbarian','knight','goblin','beetank','turtle','mole']},
 ranged:{ours:['turtle','knight','turtle','goblin','barbarian','mole','goose','turtle','sniper','knight'],
  foe:['sniper','sniper','dragon','dragon','sniper','knight','beetank','turtle','mole','barbarian']}
};
function battle(c,candidate,observe=true){
 let now=0,frameId=0,queue=new Map(),state,frames=0,errors=[],hits=[],guards=[];
 const sha=c.trace?crypto.createHash('sha256'):null;
 const env={window:null,Math,performance:{now:()=>now},
  requestAnimationFrame(fn){const n=++frameId;queue.set(n,fn);return n},
  cancelAnimationFrame(n){queue.delete(n)},
  console:{error:(...a)=>errors.push(a.join(' '))}};
 env.window=env;env.__qaHit=x=>hits.push(x);env.__qaGuard=x=>guards.push(x);
 vm.createContext(env);vm.runInContext(evo,env);
 vm.runInContext(candidate?(observe?observedUlt:prototypeUlt):liveUlt,env);
 vm.runInContext(observe?observeCore(candidate?prototypeCore:liveCore):candidate?prototypeCore:liveCore,env);
 const sim=env.LegacySimCore,side=c.side||'blue';
 const roster=team=>{
  const solo=c.solo;
  const pattern=solo?(team===side?['turtle']:[solo]):team===side?patterns[c.mode].ours:patterns[c.mode].foe;
  return Array.from({length:c.count/2},(_,i)=>{
   const type=pattern[i%pattern.length];
   return{type,level:team===side&&type==='turtle'?c.level:c.otherLevel||4,squad:Math.floor(i/5)};
  });
 };
 sim.configure({seed:c.seed||1337,speed:c.speed||10,onState:()=>{}});
 sim.deploy(roster('blue'),roster('red'));sim.setRunning(true);
 const maxFrames=c.maxFrames||800;
 for(;frames<maxFrames;frames++){
  now+=16.667;const q=[...queue.values()];queue.clear();for(const fn of q)fn(now);
  state=sim.getState();if(sha)sha.update(JSON.stringify(state)+'\n');
  if(state.winner){frames++;break}
 }
 assert.deepEqual(errors,[],'source error '+JSON.stringify(c));
 assert.equal(state.units.length,c.count,'density must remain intact');
 assert(state.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.x)&&Number.isFinite(u.y)),'finite physical state');
 if(c.requireTerminal!==false)assert(state.winner,'no censored sample '+JSON.stringify(c));
 if(!observe)return{digest:sha?.digest('hex'),winner:state.winner,tick:state.tick};
 const fronts=c.requireTerminal===false?null:damageFronts(hits,state.tick,30);
 const ours=hits.filter(h=>h.team===side),turtle=ours.filter(h=>h.role==='turtle');
 return{digest:sha?.digest('hex'),winner:state.winner,tick:state.tick,
  won:state.winner===side,teamHpDamage:ours.reduce((n,h)=>n+h.damage,0),
  turtleHpDamage:turtle.reduce((n,h)=>n+h.damage,0),
  realPersistentFronts:fronts?.consecutivePersistentMultiFrontWindows,
  separatedRealDamageWindows:fronts?.windowsWithTwoGeographicallySeparatedDamageComponents,
  guardianProtectionHits:guards.length,
  nominalProtectionBeforeDodgeAndHpCap:guards.reduce((n,g)=>n+g.nominal,0)
 };
}
// Observer cannot influence actual state, at either 20 or 40 body densities.
for(const count of [20,40]){
 const c={count,mode:'ranged',seed:1337,level:5,trace:true};
 assert.equal(battle(c,true).digest,battle(c,true,false).digest,'guardian observer changed physics');
 assert.equal(battle(c,false).digest,battle(c,false,false).digest,'baseline hit observer changed physics');
}
// Without a ranked allied Turtle, the prototype must preserve every physical state.
// Solo against heavy Beetank, ranged Sniper and Assassin retains counter ecology.
for(const solo of ['beetank','sniper','assassin']){
 const c={count:2,solo,level:5,trace:true,maxFrames:450};
 const a=battle(c,false),b=battle(c,true);
 assert(a.winner&&b.winner,'real solo counter must terminate '+solo);
 assert.equal(b.digest,a.digest,'self-only guardian must not alter solo '+solo);
 assert.equal(b.guardianProtectionHits,0,'no ally to protect in solo '+solo);
}
for(const count of [20,40]){
 const c={count,mode:'mixed',level:1,otherLevel:1,trace:true};
 assert.equal(battle(c,true).digest,battle(c,false).digest,'no evolved Turtle exact-state control');
}
// 48 source-real paired completed matches: 2 levels x 3 modes x 2 densities x
// 2 seeds x 2 mirrors. No proximity-only credit for fronts or win outcomes.
const cases=[];
for(const level of [4,5])for(const mode of Object.keys(patterns))
 for(const count of [20,40])for(const seed of [1337,9917])
  for(const side of ['blue','red']){
   const c={level,mode,count,seed,side};
   const before=battle(c,false),after=battle(c,true);
   assert(before.winner&&after.winner,'fully terminal paired A/B only');
   cases.push({c,before,after});
  }
assert.equal(cases.length,48,'complete guardian experiment matrix');
const summary={};
for(const level of [4,5]){
 const group=cases.filter(x=>x.c.level===level),sum=(which,key)=>group.reduce((n,x)=>n+x[which][key],0);
 const a=summary[level]={
  matches:group.length,baselineWins:sum('before','won'),guardianWins:sum('after','won'),
  baselineTurtlePositiveHp:+sum('before','turtleHpDamage').toFixed(2),
  guardianTurtlePositiveHp:+sum('after','turtleHpDamage').toFixed(2),
  baselineTeamPositiveHp:+sum('before','teamHpDamage').toFixed(2),
  guardianTeamPositiveHp:+sum('after','teamHpDamage').toFixed(2),
  baselinePersistentFronts:sum('before','realPersistentFronts'),
  guardianPersistentFronts:sum('after','realPersistentFronts'),
  baselineSeparatedWindows:sum('before','separatedRealDamageWindows'),
  guardianSeparatedWindows:sum('after','separatedRealDamageWindows'),
  guardianHits:sum('after','guardianProtectionHits'),
  nominalPreDodgePreHpCapReduction:+sum('after','nominalProtectionBeforeDodgeAndHpCap').toFixed(2),
  byPopulation:{}
 };
 for(const count of [20,40]){
  const r=group.filter(x=>x.c.count===count);
  a.byPopulation[count]={matches:r.length,baselineWins:r.filter(x=>x.before.won).length,
   guardianWins:r.filter(x=>x.after.won).length,
   baselinePersistentFronts:r.reduce((n,x)=>n+x.before.realPersistentFronts,0),
   guardianPersistentFronts:r.reduce((n,x)=>n+x.after.realPersistentFronts,0)};
 }
 assert(a.guardianHits>0&&a.nominalPreDodgePreHpCapReduction>0,'no tactical defensive exposure');
 assert(a.guardianWins>=a.baselineWins,'guardian loses team value in this controlled sample');
 assert(a.guardianPersistentFronts>=a.baselinePersistentFronts-4,'authentic independent fights degraded');
 assert(a.guardianTurtlePositiveHp>=a.baselineTurtlePositiveHp*.85,'Turtle real attacking contribution degraded');
}
assert(summary[5].guardianPersistentFronts>summary[5].baselinePersistentFronts,
 'L5 protection must improve actual independent fronts in sample');
// Dense execution correctness only; 300-body samples are NOT terminal matches or phone FPS.
// Include both 1x and 10x: never cap rare 300-population battles.
for(const count of [80,120,300])for(const speed of [1,10]){
 const c={count,mode:'mixed',seed:9917,level:5,speed,maxFrames:count===300?12:18,requireTerminal:false};
 const v=battle(c,true);
 assert(v.tick>0,'dense evolved guardians did not run');
}
const receipt={
 status:'Source-only A/B prospective Guardian Shell; NOT SHIPPED OR DEPLOYED',
 specification:'L4 18% damage reduction within 0.12 units, L5 28% within 0.14; highest of guardian and Knight Bastion only; never protects the Turtle itself. Defender must be an actual living ally.',
 caveats:'Nominal mitigation before dodge and HP cap is NOT HP genuinely prevented. All wins and damage fronts from completed true source games. 300 bodies are limited finite source-state checks, NOT FPS or full terminal. Physical iPhone 14 Pro Max Safari still manual.',
 summary,cases};
if(process.env.QA_TURTLE_GUARDIAN_RECEIPT)fs.writeFileSync(process.env.QA_TURTLE_GUARDIAN_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('TURTLE GUARDIAN SOURCE A/B '+JSON.stringify(summary));
console.log('PASS: 48 completed matched guardian source A/B and finite uncapped 300 source, pure trace parity; prototype not shipped');
