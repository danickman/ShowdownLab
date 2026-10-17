'use strict';
// Historical fixed-fixture research: preserve accepted pre-Impact Goose source.
// New all-roster first-tier tests exercise current live Goose Impact separately.
// Read-only prospective Turtle guardian source A/B. No game runtime is modified.
// Evolved Turtle would protect nearby allies without stacking with Knight Bastion.
// Compare true terminal winners, positive HP damage and connected real fronts.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const releasedCore=read('v3/legacy-sim-core.js'),releasedUlt=read('tools/qa/fixtures/goose-before-impact-ultimate.js'),evo=read('v3/evolution-rules.js');
const once=(s,a,b)=>{assert.equal(s.split(a).length,2,'source anchor drift: '+a.slice(0,85));return s.replace(a,b)};
const {withoutGuardian}=require('./historical-guardian-control.cjs');
const prototypeCore=releasedCore,prototypeUlt=releasedUlt;
const {core:liveCore,ability:liveUlt}=withoutGuardian(releasedCore,releasedUlt);
const guardAnchor="if(t.hp/t.maxHp<.6&&shelter>protection){damage*=1-shelter;cue(guardian,'shelter',tick,t)}";
const observedUlt=once(prototypeUlt,guardAnchor,
 "if(t.hp/t.maxHp<.6&&shelter>protection){window.__qaGuard({tick,guardian:guardian.id,target:t.id,team:t.team,rank:rank(guardian),shelter,nominal:damage*shelter});damage*=1-shelter;cue(guardian,'shelter',tick,t)}");
const hitAnchor='const dealt=Math.min(t.hp,dmg);';
const observeCore=s=>once(s,hitAnchor,hitAnchor+
 "window.__qaResolvedHit({tick,target:t.id,hpBefore:t.hp,postDodgeDamage:dmg,dealt});"+
 "if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,attacker:a.id,target:t.id,role:a.type,team:a.team,damage:dealt,x:t.x,y:t.y});");
function localHpPrevented(hp,afterShieldDamage,shelter){
 // Same defender HP and dodge result; remove *only* the guardian reduction.
 // A local realized saved-HP measurement, not a full counterfactual match outcome.
 assert(hp>=0&&afterShieldDamage>=0&&shelter>0&&shelter<1);
 return Math.max(0,Math.min(hp,afterShieldDamage/(1-shelter))-Math.min(hp,afterShieldDamage));
}
assert.equal(localHpPrevented(5,8,.25),0,'overkill may save no actual HP');
assert(Math.abs(localHpPrevented(100,24,.2)-6)<1e-9,'real local HP protected');
assert(Math.abs(localHpPrevented(100,6,.2)-1.5)<1e-9,'post-dodge protection must shrink');
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
  foe:['sniper','sniper','dragon','dragon','sniper','knight','beetank','turtle','mole','barbarian']},
 // Independent stress scenarios to avoid fitting only a few friendly compositions.
 noKnight:{ours:['turtle','turtle','goblin','barbarian','mole','goose','turtle','sniper','assassin','dragon'],
  foe:['sniper','dragon','beetank','barbarian','knight','goblin','assassin','turtle','mole','goose']},
 armored:{ours:['turtle','knight','turtle','goblin','barbarian','mole','turtle','sniper','goose','assassin'],
  foe:['beetank','beetank','dragon','turtle','knight','barbarian','beetank','sniper','mole','assassin']}
};
function battle(c,candidate,observe=true){
 let now=0,frameId=0,queue=new Map(),state,frames=0,errors=[],hits=[],guards=[],pendingGuard=null;
 const sha=c.trace?crypto.createHash('sha256'):null;
 const env={window:null,Math,performance:{now:()=>now},
  requestAnimationFrame(fn){const n=++frameId;queue.set(n,fn);return n},
  cancelAnimationFrame(n){queue.delete(n)},
  console:{error:(...a)=>errors.push(a.join(' '))}};
 env.window=env;env.__qaHit=x=>hits.push(x);
 env.__qaGuard=x=>{assert.equal(pendingGuard,null,'guardian event not settled before next hurt');
  assert(x.shelter>0&&x.shelter<1,'valid nonstacking mitigation');
  x.actualHpPreventedLocally=0;guards.push(x);pendingGuard=x};
 env.__qaResolvedHit=x=>{
  if(pendingGuard){
   assert.equal(pendingGuard.target,x.target,'same defender must receive guardian benefit');
   assert.equal(pendingGuard.tick,x.tick,'same deterministic hit tick');
   pendingGuard.actualHpPreventedLocally=localHpPrevented(x.hpBefore,x.postDodgeDamage,pendingGuard.shelter);
   assert(pendingGuard.actualHpPreventedLocally>=0&&pendingGuard.actualHpPreventedLocally<=pendingGuard.nominal+1e-7,
    'post-dodge or HP-cap saved damage must not exceed pre-dodge nominal');
   pendingGuard=null;
  }
 };
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
 const runtimeStart=process.hrtime.bigint();
 const maxFrames=c.maxFrames||800;
 for(;frames<maxFrames;frames++){
  now+=16.667;const q=[...queue.values()];queue.clear();for(const fn of q)fn(now);
  state=sim.getState();if(sha)sha.update(JSON.stringify(state)+'\n');
  if(state.winner){frames++;break}
 }
 const runtimeMs=Number(process.hrtime.bigint()-runtimeStart)/1e6;
 assert.equal(pendingGuard,null,'all real defender guardian events must resolve');
 assert.deepEqual(errors,[],'source error '+JSON.stringify(c));
 assert.equal(state.units.length,c.count,'density must remain intact');
 assert(state.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.x)&&Number.isFinite(u.y)),'finite physical state');
 if(c.requireTerminal!==false)assert(state.winner,'no censored sample '+JSON.stringify(c));
 if(!observe)return{digest:sha?.digest('hex'),winner:state.winner,tick:state.tick,runtimeMs};
 const fronts=c.requireTerminal===false?null:damageFronts(hits,state.tick,30);
 const ours=hits.filter(h=>h.team===side),turtle=ours.filter(h=>h.role==='turtle');
 return{digest:sha?.digest('hex'),winner:state.winner,tick:state.tick,
  won:state.winner===side,runtimeMs,teamHpDamage:ours.reduce((n,h)=>n+h.damage,0),
  turtleHpDamage:turtle.reduce((n,h)=>n+h.damage,0),
  realPersistentFronts:fronts?.consecutivePersistentMultiFrontWindows,
  separatedRealDamageWindows:fronts?.windowsWithTwoGeographicallySeparatedDamageComponents,
  guardianProtectionHits:guards.length,
  nominalProtectionBeforeDodgeAndHpCap:guards.reduce((n,g)=>n+g.nominal,0),
  immediateActualHpPrevented:guards.reduce((n,g)=>n+g.actualHpPreventedLocally,0),
  protectingTurtleIds:[...new Set(guards.map(g=>g.guardian))]
 };
}
// Observer cannot influence actual state, at either 20 or 40 body densities.
for(const count of [20,40]){
 const c={count,mode:'ranged',seed:1337,level:5,trace:true};
 assert.equal(battle(c,true).digest,battle(c,true,false).digest,'guardian observer changed physics');
 assert.equal(battle(c,false).digest,battle(c,false,false).digest,'baseline hit observer changed physics');
}
// Shipped direct rules: allied cover only, bounded ranges, never additive to Knight.
{
 const sandbox={window:null,Math};sandbox.window=sandbox;vm.createContext(sandbox);
 vm.runInContext(evo,sandbox);vm.runInContext(prototypeUlt,sandbox);
 const incoming=sandbox.ShowdownUltimates.incoming;
 const t={id:99,type:'goblin',team:'blue',level:1,hp:50,maxHp:100,x:.5,y:.5};
 const turtle=(id,level,x=.52,team='blue')=>({id,type:'turtle',team,level,hp:200,maxHp:200,x,y:.5});
 const knight=level=>({id:50,type:'knight',team:'blue',level,hp:200,maxHp:200,x:.52,y:.5});
 const check=(expected,ts=[],ks=[],target=t)=>assert(Math.abs(incoming(target,100,[target,...ks,...ts],50,ks,ts)-expected)<1e-7,'nonstacking proximity/side/level protector contract');
 check(100,[turtle(1,1)]);check(100,[turtle(1,5,.8)]);check(82,[turtle(1,4)]);
 check(72,[turtle(1,5)]);check(72,[turtle(1,5),turtle(2,5)]);
 check(72,[turtle(1,5)],[knight(4)]);check(70,[turtle(1,5)],[knight(5)]);
 check(100,[turtle(1,5,.52,'red')]);const healthy={...t,hp:60};check(100,[turtle(1,5)],[],healthy);const self=turtle(1,5);self.hp=80;check(100,[self],[],self);
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
for(const level of [4,5])for(const mode of ['mixed','swarm','ranged'])
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
  actualImmediateHpPrevented:+sum('after','immediateActualHpPrevented').toFixed(2),
  byPopulation:{}
 };
 for(const count of [20,40]){
  const r=group.filter(x=>x.c.count===count);
  a.byPopulation[count]={matches:r.length,baselineWins:r.filter(x=>x.before.won).length,
   guardianWins:r.filter(x=>x.after.won).length,
   baselinePersistentFronts:r.reduce((n,x)=>n+x.before.realPersistentFronts,0),
   guardianPersistentFronts:r.reduce((n,x)=>n+x.after.realPersistentFronts,0)};
 }
 assert(a.guardianHits>0&&a.nominalPreDodgePreHpCapReduction>0&&a.actualImmediateHpPrevented>0,
  'no verified live defender HP protection');
 assert(a.actualImmediateHpPrevented<=a.nominalPreDodgePreHpCapReduction,
  'locally true saved HP exceeded theoretical nominal reduction');
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
// Independent holdout: do not choose a candidate only by its earlier 48 pairs.
 // Additional 80 fully terminal pairs: 48 new-seed matches across the three
 // original strategies, and 32 no-Knight/armored-stress strategy mirrors.
 // Unfavourable role/front/win outcomes remain visible and DO NOT get erased
 // by relaxing the prespecified 48-pair gates above.
const holdouts=[];
for(const mode of ['mixed','swarm','ranged'])
 for(const level of [4,5])for(const count of [20,40])
  for(const seed of [2017,4201])for(const side of ['blue','red']){
   const c={mode,level,count,seed,side},before=battle(c,false),after=battle(c,true);
   assert(before.winner&&after.winner,'no censored unseen-seed holdout');
   holdouts.push({c,before,after});
  }
for(const mode of ['noKnight','armored'])
 for(const level of [4,5])for(const count of [20,40])
  for(const seed of [1337,9917])for(const side of ['blue','red']){
   const c={mode,level,count,seed,side},before=battle(c,false),after=battle(c,true);
   assert(before.winner&&after.winner,'no censored role-counter holdout');
   holdouts.push({c,before,after});
  }
assert.equal(holdouts.length,80,'expected 48 unseen seed + 32 composition stress paired matches');
const holdoutSummary={};
for(const mode of Object.keys(patterns))for(const level of [4,5]){
 const subset=holdouts.filter(x=>x.c.mode===mode&&x.c.level===level);
 const sum=(side,key)=>subset.reduce((n,x)=>n+x[side][key],0);
 holdoutSummary[mode+'-L'+level]={
  pairs:subset.length,
  baselineWins:sum('before','won'),guardianWins:sum('after','won'),
  baselinePersistentRealFronts:sum('before','realPersistentFronts'),
  guardianPersistentRealFronts:sum('after','realPersistentFronts'),
  baselineTurtleHp:+sum('before','turtleHpDamage').toFixed(2),
  guardianTurtleHp:+sum('after','turtleHpDamage').toFixed(2),
  actualImmediateSavedHp:+sum('after','immediateActualHpPrevented').toFixed(2),
  winnerFlips:subset.filter(x=>x.before.winner!==x.after.winner).length
 };
 assert.equal(subset.length,8,'fully mirrored held-out comparisons per mode/level');
}
assert(Object.values(holdoutSummary).some(x=>x.actualImmediateSavedHp>0),
 'holdout did not exercise any real Guardian mitigation');
// Performance comparison is NOT a substitute for real iPhone hardware acceptance.

// Real Node wall-clock simulator-only cost, no source instrumentation, 1x and 10x.
 // Warm both variants before timing to reduce VM warm-up distortion. Numbers are
 // diagnostic, NOT benchmarks of iOS Safari RAF, GPU, battery or thermal limits.
const perf={};
const median=arr=>{const a=arr.slice().sort((x,y)=>x-y);return a[Math.floor(a.length/2)]};
for(const count of [120,300])for(const speed of [1,10]){
 const c={count,mode:'mixed',seed:9917,level:5,speed,maxFrames:10,requireTerminal:false};
 battle(c,false,false);battle(c,true,false);
 const baseline=[],prototype=[];
 for(let i=0;i<5;i++){
  if(i%2===0){baseline.push(battle(c,false,false).runtimeMs);prototype.push(battle(c,true,false).runtimeMs)}
  else{prototype.push(battle(c,true,false).runtimeMs);baseline.push(battle(c,false,false).runtimeMs)}
 }
 const b=median(baseline),p=median(prototype);
 perf[count+'@'+speed+'x']={baselineMedianMs:+b.toFixed(3),prototypeMedianMs:+p.toFixed(3),
  prototypeToBaseline:+(p/b).toFixed(3),baselineRuns:baseline.map(x=>+x.toFixed(3)),
  prototypeRuns:prototype.map(x=>+x.toFixed(3))};
 assert(Number.isFinite(p/b)&&b>0,'valid real median times');
}
const receipt={
 status:'QA-shipped Guardian Shell versus historical no-guardian source baseline; main/production unchanged',
 specification:'If allied defender is strictly below 60% HP before the hit: L4 18% reduction within 0.12, L5 28% within 0.14. Highest of Guardian and Knight Bastion only, no self-protection.',
 caveats:'Immediate saved HP is measured on the same resolved hit after dodge and remaining-HP cap; it is not total team counterfactual HP saved across a divergent match. Nominal incoming mitigation is separate. All wins and damage fronts from completed true source games. 300 bodies are limited finite source-state checks, NOT FPS or full terminal. Node/V8 median simulator times are not physical iPhone 14 Pro Max Safari FPS.',
 summary,holdoutSummary,holdouts,simulatorCpu:perf,cases};
if(process.env.QA_TURTLE_GUARDIAN_RECEIPT)fs.writeFileSync(process.env.QA_TURTLE_GUARDIAN_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('TURTLE GUARDIAN SOURCE A/B '+JSON.stringify(summary));
console.log('TURTLE GUARDIAN HOLDOUT '+JSON.stringify(holdoutSummary));
console.log('TURTLE GUARDIAN NODE CPU '+JSON.stringify(perf));
console.log('PASS: 48 baseline and 80 independent held-out true-terminal Turtle A/B pairs, actual-HP parity and uncapped 300 states');
