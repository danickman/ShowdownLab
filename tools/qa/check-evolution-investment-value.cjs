'use strict';
// Source-authentic evolution investment analysis: only the nominated squad's level
// changes; all opposing fighters, non-target allies, rosters and seeds are held fixed.
// This is a read-only QA metric, not a combat change or a claim about Safari FPS.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const live=read('v3/legacy-sim-core.js'),ability=read('v3/ultimate-abilities.js');
const once=(s,a,b)=>{assert.equal(s.split(a).length,2,'source observer anchor changed: '+a.slice(0,85));return s.replace(a,b)};
let observed=once(live,'const dealt=Math.min(t.hp,dmg);','const dealt=Math.min(t.hp,dmg);'+
 "if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,attacker:a.id,target:t.id,role:a.type,team:a.team,targetRole:t.type,damage:dealt,x:t.x,y:t.y});");
observed=once(observed,'if(t.shell>0)dmg*=.42;',
 "if(t.shell>0){const preShell=dmg;dmg*=.42;window.__qaShell({team:t.team,role:t.type,nominal:preShell-dmg});}");
observed=once(observed,'if(!secondary)for(const hit of ultimate.afterHit(a,t,dealt,units,tick))hurt(hit.target,hit.damage,hit.source,true)',
 "if(!secondary)for(const hit of ultimate.afterHit(a,t,dealt,units,tick)){const hp=hit.target.hp;hurt(hit.target,hit.damage,hit.source,true);if(hit.source===null)window.__qaReflect({team:t.team,role:t.type,amount:Math.max(0,hp-hit.target.hp)});}");
observed=once(observed,'}separate(false)}function winner(){',
 "}window.__qaAlive(units);separate(false)}function winner(){");
const abilityObserved=once(ability,"cue(a,'execution',tick,t);return damage",
 "window.__qaExecution({team:a.team,role:a.type,level:a.level,preHitHpFraction:t.hp/t.maxHp,targetRole:t.type});cue(a,'execution',tick,t);return damage");
const graph=read('tools/qa/check-role-fronts-baseline.cjs');
const lo=graph.indexOf('const cell='),hi=graph.indexOf('// Synthetic truth fixtures',lo);
assert(lo>=0&&hi>lo,'real HP-damage graph source moved');
const damageFronts=vm.runInNewContext(graph.slice(lo,hi)+';damageFronts',{Math});
const fighters=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
// TARGET is substituted in identical slots for Assassin / Turtle / Beetank.
const modes={
 mixed:{
  ours:['TARGET','knight','sniper','TARGET','mole','goblin','barbarian','goose','TARGET','dragon'],
  foe:['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose']
 },
 swarm:{
  ours:['TARGET','TARGET','knight','goblin','goose','barbarian','mole','TARGET','sniper','turtle'],
  foe:['goblin','goblin','goose','goblin','barbarian','knight','goblin','beetank','turtle','mole']
 },
 ranged:{
  ours:['TARGET','knight','TARGET','goblin','barbarian','mole','goose','TARGET','sniper','turtle'],
  foe:['sniper','sniper','dragon','dragon','sniper','knight','beetank','turtle','mole','barbarian']
 }
};
function fight(c,observe=true,parity=false){
 let clock=0,frameId=0,queue=new Map(),state,frames=0,errors=[];
 const hits=[],reflections=[],shells=[],executions=[],aliveRole={};
 const sha=crypto.createHash('sha256');
 const env={window:null,Math,performance:{now:()=>clock},console:{error:(...a)=>errors.push(a.join(' '))},
  requestAnimationFrame(fn){const id=++frameId;queue.set(id,fn);return id},
  cancelAnimationFrame(id){queue.delete(id)}};
 env.window=env;
 env.__qaHit=record=>hits.push(record);
 env.__qaReflect=record=>reflections.push(record);
 env.__qaShell=record=>shells.push(record);
 env.__qaExecution=record=>executions.push(record);
 env.__qaAlive=units=>{for(const u of units)if(u.hp>0&&u.team===c.side&&u.type===c.role)aliveRole[u.id]=(aliveRole[u.id]||0)+1};
 vm.createContext(env);
 vm.runInContext(read('v3/evolution-rules.js'),env);
 vm.runInContext(observe?abilityObserved:ability,env);
 vm.runInContext(observe?observed:live,env);
 const sim=env.LegacySimCore;
 const roster=team=>{
  const pattern=team===c.side?modes[c.mode].ours:modes[c.mode].foe;
  return Array.from({length:c.count/2},(_,i)=>{
   const selected=pattern[i%pattern.length],isTarget=team===c.side&&selected==='TARGET';
   return {type:isTarget?c.role:selected,level:isTarget?c.level:4,squad:Math.floor(i/5)};
  });
 };
 const deployed=roster(c.side).filter(u=>u.type===c.role).length;
 assert(deployed>=3&&deployed<=c.count/2,'target role deployment denominator');
 sim.configure({seed:c.seed,speed:10,onState:()=>{}});
 sim.deploy(roster('blue'),roster('red'));sim.setRunning(true);
 for(;frames<800;frames++){
  clock+=16.667;const pending=[...queue.values()];queue.clear();
  for(const fn of pending)fn(clock);
  state=sim.getState();
  if(parity)sha.update(JSON.stringify(state)+'\n');
  if(state.winner){frames++;break}
 }
 assert.deepEqual(errors,[],'simulation errors '+JSON.stringify(c));
 assert.equal(state.units.length,c.count,'full population maintained');
 assert(state.units.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.y)&&Number.isFinite(u.hp)),
  'physical state must be finite');
 assert(state.winner,'must finish a real terminal match, not a censored snapshot '+JSON.stringify(c));
 if(!observe)return {digest:sha.digest('hex'),winner:state.winner,tick:state.tick};
 const ourHit=hits.filter(x=>x.team===c.side&&x.role===c.role);
 const ourReflection=reflections.filter(x=>x.team===c.side&&x.role===c.role);
 const ourShell=shells.filter(x=>x.team===c.side&&x.role===c.role);
 const ourExec=executions.filter(x=>x.team===c.side&&x.role===c.role);
 const graphOut=damageFronts(hits,state.tick,30);
 const damage=ourHit.reduce((n,h)=>n+h.damage,0);
 const reflected=ourReflection.reduce((n,h)=>n+h.amount,0);
 // Nominal shell reduction BEFORE armor/dodge/HP cap is not actual HP prevented.
 const nominalShelled=ourShell.reduce((n,x)=>n+x.nominal,0);
 return{
  ...c,deployed,winner:state.winner,won:state.winner===c.side,tick:state.tick,
  executed:ourExec.length,executionTargetRoles:ourExec.reduce((map,x)=>(map[x.targetRole]=(map[x.targetRole]||0)+1,map),{}),
  positiveHits:ourHit.length,directHpDamage:+damage.toFixed(2),directPerDeployed:+(damage/deployed).toFixed(2),
  trueReflectedHp:+reflected.toFixed(2),reflectionEvents:ourReflection.length,
  reflectedPerDeployed:+(reflected/deployed).toFixed(2),shellEvents:ourShell.length,
  nominalPreArmorShellReduction:+nominalShelled.toFixed(2),
  roleAliveUnitTicks:Object.values(aliveRole).reduce((n,v)=>n+v,0),
  realSeparatedDamageWindows:graphOut.windowsWithTwoGeographicallySeparatedDamageComponents,
  persistentRealIndependentFronts:graphOut.consecutivePersistentMultiFrontWindows,
  digest:parity?sha.digest('hex'):null
 };
}
// Instrumentation must not change exact physical game behavior.
for(const c of [
 {count:20,mode:'swarm',seed:1337,side:'blue',role:'turtle',level:5},
 {count:40,mode:'ranged',seed:9917,side:'red',role:'assassin',level:5}
]){
 const observedMatch=fight(c,true,true),control=fight(c,false,true);
 assert.equal(observedMatch.digest,control.digest,'read-only evolution ROI events changed physics');
}
const cases=[];
for(const role of ['assassin','turtle','beetank'])
 for(const mode of Object.keys(modes))
  for(const count of [20,40])
   for(const seed of [1337,9917])
    for(const side of ['blue','red'])
     for(const level of [1,4,5])
      cases.push(fight({role,mode,count,seed,side,level}));
assert.equal(cases.length,216,'complete 3x3x2x2x2x3 matched ROI matrix');
const summaries={};
for(const role of ['assassin','turtle','beetank']){
 summaries[role]={};
 for(const level of [1,4,5]){
  const a=cases.filter(x=>x.role===role&&x.level===level),sum=k=>a.reduce((n,r)=>n+r[k],0);
  const dep=sum('deployed');
  const score=summaries[role][level]={
   matchCount:a.length,completed:a.filter(x=>x.winner).length,winCount:a.filter(x=>x.won).length,
   deployed:dep,actualDamage:+sum('directHpDamage').toFixed(2),
   directDamagePerDeployed:+(sum('directHpDamage')/dep).toFixed(2),
   trueReflectedHp:+sum('trueReflectedHp').toFixed(2),
   reflectedPerDeployed:+(sum('trueReflectedHp')/dep).toFixed(2),
   nominalPreArmorShellReduction:+sum('nominalPreArmorShellReduction').toFixed(2),
   roleAliveUnitTicks:sum('roleAliveUnitTicks'),
   executionEvents:sum('executed'),realSeparatedWindows:sum('realSeparatedDamageWindows'),
   persistentRealFronts:sum('persistentRealIndependentFronts')
  };
  assert.equal(score.completed,24,'no censored matches may enter tier ROI comparisons');
  assert(Number.isFinite(score.directDamagePerDeployed)&&score.actualDamage>0,'real role damage');
  if(level===1){assert.equal(score.executionEvents,0);assert.equal(score.trueReflectedHp,0)}
 }
}
assert(summaries.assassin[4].executionEvents>0&&summaries.assassin[5].executionEvents>0,
 'execution investment gave zero true backstab activations');
assert(summaries.turtle[4].trueReflectedHp>0&&summaries.turtle[5].trueReflectedHp>0,
 'Turtle Ricochet investment yielded no actual reflected HP');
assert(summaries.beetank[5].actualDamage>0,'Beetank counter comparison absent');
const comparisons=[];
for(const mode of Object.keys(modes))for(const count of [20,40])
 for(const seed of [1337,9917])for(const side of ['blue','red']){
  const group=cases.filter(x=>x.mode===mode&&x.count===count&&x.seed===seed&&x.side===side);
  for(const role of ['assassin','turtle','beetank']){
   const x=group.filter(v=>v.role===role).sort((a,b)=>a.level-b.level);
   assert.equal(x.length,3,'paired level denominators');
   comparisons.push({mode,count,seed,side,role,winByTier:x.map(r=>r.won),
    damageByTier:x.map(r=>r.directPerDeployed),
    reflectByTier:x.map(r=>r.reflectedPerDeployed),
    executionByTier:x.map(r=>r.executed),
    realFrontsByTier:x.map(r=>r.persistentRealIndependentFronts)});
  }
 }
const report={
 status:'QA read-only fully terminal marginal evolution investment audit; production unchanged',
 notes:'Matched selected squad level L1/L4/L5, same other ally/enemy L4, seeds, side, fighter count and roster slots. Only positive attacker-credited HP damage, plus actual HP removed by reflection; Turtle shell mitigation is pre-armor/dodge nominal reduction and is NOT actual HP prevented. Non-DPS control, armor, positioning and art not valued in these totals. Distinct true HP-damage fronts are not fabricated. 10x Node VM performance is not iPhone 14 Pro Max Safari FPS.',
 summary:summaries,comparisons,cases};
if(process.env.QA_EVOLUTION_ROI_RECEIPT)fs.writeFileSync(process.env.QA_EVOLUTION_ROI_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('EVOLUTION TRUE ROI '+JSON.stringify(summaries));
console.log('PASS: 216 fully completed matched Assassin/Turtle/Beetank tier trials, real-reflection vs shell nominal and Execution, source trace parity');
