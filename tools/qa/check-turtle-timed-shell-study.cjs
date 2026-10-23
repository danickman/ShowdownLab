'use strict';
// Historical fixed-fixture research: preserve accepted pre-Impact Goose source.
// New all-roster first-tier tests exercise current live Goose Impact separately.
// Timed L4 Turtle shell response study. All candidate rules are source-only substitutions,
// with physically real HP hits, terminal outcomes and matched seeds/mirrors.
// Does not modify shipped code, the service worker, or production.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const core=read('v3/legacy-sim-core.js'),ability=read('tools/qa/fixtures/goose-before-impact-ultimate.js'),evolution=read('v3/evolution-rules.js');
const once=(s,a,b)=>{assert.equal(s.split(a).length,2,'source anchor drift: '+a.slice(0,70));return s.replace(a,b)};
const hitAnchor='const dealt=Math.min(t.hp,dmg);';
const reflectionLoop='if(!secondary)for(const hit of ultimate.afterHit(a,t,dealt,units,tick))hurt(hit.target,hit.damage,hit.source,true)';
const hitObserver=s=>once(once(s,hitAnchor,hitAnchor+
 "window.__qaResolved({target:t.id,tick,remainingHp:t.hp,postDodgeDamage:dmg});"+
 "if(dealt>0&&window.__qaSecondaryContext)window.__qaReflect({...window.__qaSecondaryContext,tick,damage:dealt});"+
 "if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,attacker:a.id,target:t.id,team:a.team,role:a.type,damage:dealt,x:t.x,y:t.y});"),
 reflectionLoop,
 "if(!secondary)for(const hit of ultimate.afterHit(a,t,dealt,units,tick)){"+
 "window.__qaSecondaryContext=hit.source===null&&a&&t.type==='turtle'?{turtleId:t.id,level:t.level,team:t.team}:null;"+
 "hurt(hit.target,hit.damage,hit.source,true);window.__qaSecondaryContext=null}");
const guardAnchor="if(t.hp/t.maxHp<.6&&shelter>protection){damage*=1-shelter;cue(guardian,'shelter',tick,t)}";
const prototypes={
 baseline:{},
 reactiveShell24:{shellBoost:.24,react:true},
 protectiveGap24:{shellBoost:.24,react:true,gapOnly:true},
 gapDuringRecovery24:{shellBoost:.24,react:true,gapOnly:true,recovery:true}
};
const programs={};
for(const [name,p] of Object.entries(prototypes)){
 let source=ability;
 if(p.shellBoost!==undefined)source=once(source,'const amount=rank(u)===2?.28:.18;',
   'const amount=rank(u)===2?.28:(u.shell>0?'+p.shellBoost+':.18);');
 if(p.react)source=once(source,'if(t.hp/t.maxHp<.6&&shelter>protection){',
   'if(guardian&&rank(guardian)===1&&t.hp/t.maxHp<.45&&guardian.shell===0&&guardian.special<=0'+(p.gapOnly?'&&shelter>protection':'')+(p.recovery?'&&guardian.cooldown>=16':'')+'){guardian.shell=22;guardian.special=85;guardian.action=\'shell\';window.__qaShellReact({tick,guardianId:guardian.id,team:t.team,defenderId:t.id,level:guardian.level,defenderHpFraction:t.hp/t.maxHp,preShellShelter:shelter,existingProtection:protection,recoveryCooldown:guardian.cooldown});shelter='+p.shellBoost+';}if(t.hp/t.maxHp<.6&&shelter>protection){');
 source=once(source,guardAnchor,
 "if(t.hp/t.maxHp<.6&&shelter>protection){window.__qaGuard({tick,defenderId:t.id,team:t.team,guardianId:guardian.id,guardianLevel:guardian.level,shellActive:guardian.shell>0,strength:shelter,nominal:damage*shelter});damage*=1-shelter;cue(guardian,'shelter',tick,t)}");
 programs[name]={observedAbility:source,rawAbility:source.replace(
  "window.__qaGuard({tick,defenderId:t.id,team:t.team,guardianId:guardian.id,guardianLevel:guardian.level,shellActive:guardian.shell>0,strength:shelter,nominal:damage*shelter});",'').replace('window.__qaShellReact({tick,guardianId:guardian.id,team:t.team,defenderId:t.id,level:guardian.level,defenderHpFraction:t.hp/t.maxHp,preShellShelter:shelter,existingProtection:protection,recoveryCooldown:guardian.cooldown});','')};
}
const graph=read('tools/qa/check-role-fronts-baseline.cjs'),start=graph.indexOf('const cell='),end=graph.indexOf('// Synthetic truth fixtures',start);
assert(start>=0&&end>start,'real damage-edge front score not found');
const damageFronts=vm.runInNewContext(graph.slice(start,end)+';damageFronts',{Math});
const roles=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const standard={
 mixed:[roles,roles.slice().reverse()],
 swarm:[['goblin','goose','assassin','goblin','knight','barbarian','mole','sniper','goblin','goose'],
  ['goblin','goblin','turtle','beetank','dragon','goose','knight','barbarian','mole','sniper']],
 heavy:[['beetank','turtle','knight','dragon','barbarian','beetank','turtle','sniper','mole','assassin'],
  ['dragon','beetank','barbarian','turtle','knight','sniper','assassin','goblin','goose','mole']],
 ranged:[['sniper','sniper','dragon','dragon','sniper','knight','beetank','turtle','mole','barbarian'],
  ['goblin','goblin','goose','assassin','knight','barbarian','mole','beetank','turtle','sniper']]
};
const selections={
 mixed:{ours:['turtle','knight','sniper','turtle','mole','goblin','barbarian','goose','turtle','dragon'],
  foe:['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose']},
 swarm:{ours:['turtle','turtle','knight','goblin','goose','barbarian','mole','turtle','sniper','knight'],
  foe:['goblin','goblin','goose','goblin','barbarian','knight','goblin','beetank','turtle','mole']},
 ranged:{ours:['turtle','knight','turtle','goblin','barbarian','mole','goose','turtle','sniper','knight'],
  foe:['sniper','sniper','dragon','dragon','sniper','knight','beetank','turtle','mole','barbarian']},
 noKnight:{ours:['turtle','turtle','goblin','barbarian','mole','goose','turtle','sniper','assassin','dragon'],
  foe:['sniper','dragon','beetank','barbarian','knight','goblin','assassin','turtle','mole','goose']},
 armored:{ours:['turtle','knight','turtle','goblin','barbarian','mole','turtle','sniper','goose','assassin'],
  foe:['beetank','beetank','dragon','turtle','knight','barbarian','beetank','sniper','mole','assassin']}
};
function match(c,kind,observed=true){
 let now=0,nextId=0,queue=new Map(),state,errors=[],hits=[],guards=[],reflections=[],shellReactions=[],pending=null;
 const sha=c.trace?crypto.createHash('sha256'):null;
 const env={window:null,Math,performance:{now:()=>now},
  requestAnimationFrame(fn){const id=++nextId;queue.set(id,fn);return id},cancelAnimationFrame(id){queue.delete(id)},
  console:{error:(...x)=>errors.push(x.join(' '))}};
 env.window=env;
 env.__qaGuard=x=>{assert.equal(pending,null,'unresolved guardian event');
  assert(x.strength>0&&x.strength<1,'invalid guardian fraction');x.actualSavedHp=0;guards.push(x);pending=x};
 env.__qaResolved=x=>{if(!pending)return;
  assert.equal(x.target,pending.defenderId,'guardian source and resolved target differ');
  assert.equal(x.tick,pending.tick,'guardian tick differs');
  pending.actualSavedHp=Math.max(0,
   Math.min(x.remainingHp,x.postDodgeDamage/(1-pending.strength))-Math.min(x.remainingHp,x.postDodgeDamage));
  assert(pending.actualSavedHp>=0&&pending.actualSavedHp<=pending.nominal+1e-7,'actual saved > nominal');
  pending=null};
 env.__qaHit=h=>hits.push(h);
 env.__qaReflect=x=>{assert(x.damage>0&&Number.isFinite(x.damage),'invalid actual reflection HP');reflections.push(x)};
 env.__qaShellReact=x=>{
  assert.equal(x.level,4,'only evolved L4 Turtle is allowed to react');
  assert(x.defenderHpFraction<.45&&x.defenderHpFraction>=0,'real critical pre-hit defender required');
  if(kind==='protectiveGap24'||kind==='gapDuringRecovery24')assert(x.preShellShelter>x.existingProtection,'gap-only shell must not replace already stronger Knight');
  if(kind==='gapDuringRecovery24')assert(x.recoveryCooldown>=16,'recovery-only shell cannot interrupt a ready attack');
  shellReactions.push(x);
 };
 vm.createContext(env);
 vm.runInContext(evolution,env);
 vm.runInContext(observed?programs[kind].observedAbility:programs[kind].rawAbility,env);
 vm.runInContext(observed?hitObserver(core):core,env);
 const sim=env.LegacySimCore;
 const roster=team=>Array.from({length:c.count/2},(_,i)=>{
  let type,level;
  if(c.solo){type=team===c.side?'turtle':c.solo;level=team===c.side?c.level:5}
  else if(c.kind==='standard'){
   type=standard[c.mode][team==='blue'?(c.mirror?1:0):(c.mirror?0:1)][i%10];level=[1,2,4,5][i%4];
  }else{
   type=(team===c.side?selections[c.mode].ours:selections[c.mode].foe)[i%10];
   level=team===c.side&&type==='turtle'?c.level:4;
  }
  return{type,level,squad:Math.floor(i/5)};
 });
 sim.configure({seed:c.seed||1337,speed:10,onState:()=>{}});
 sim.deploy(roster('blue'),roster('red'));sim.setRunning(true);
 const budget=c.solo?600:700;
 for(let frame=0;frame<budget;frame++){
  now+=16.667;const callbacks=[...queue.values()];queue.clear();
  for(const cb of callbacks)cb(now);
  state=sim.getState();if(sha)sha.update(JSON.stringify(state)+'\n');
  if(state.winner)break;
 }
 assert.equal(pending,null,'unresolved local defender HP saving');
 assert.deepEqual(errors,[],'simulation error '+JSON.stringify({c,kind}));
 assert(state?.winner,'must reach true terminal winner '+JSON.stringify({c,kind}));
 assert.equal(state.units.length,c.count,'missing physical fighters');
 const digest=sha?.digest('hex');
 if(!observed)return{winner:state.winner,digest};
 const graph=damageFronts(hits,state.tick,30),ally=c.side;
 const turtle=hits.filter(h=>h.role==='turtle'&&(c.kind==='standard'||h.team===ally));
 const sum=a=>a.reduce((n,x)=>n+x.damage,0);
 const l4Saves=guards.filter(g=>g.guardianLevel===4&&(c.kind==='standard'||g.team===ally));
 const activeShellGuards=l4Saves.filter(g=>g.shellActive);
 const l4Reflect=reflections.filter(r=>r.level===4&&(c.kind==='standard'||r.team===ally));
 return{winner:state.winner,digest,tick:state.tick,
  won:state.winner===ally,realPersistentFronts:graph.consecutivePersistentMultiFrontWindows,
  realSeparatedWindows:graph.windowsWithTwoGeographicallySeparatedDamageComponents,
  actualTurtleHp:sum(turtle),realL4ImmediateAllyHpSaved:l4Saves.reduce((n,x)=>n+x.actualSavedHp,0),
  l4GuardianEvents:l4Saves.length,activeL4ShellGuardEvents:activeShellGuards.length,trueL4ShellReactions:shellReactions.filter(x=>c.kind==='standard'||x.team===ally).length,actualL4ReflectedHp:l4Reflect.reduce((n,r)=>n+r.damage,0),l4ReflectionEvents:l4Reflect.length,
  realKnightHp:sum(hits.filter(h=>h.role==='knight')),realGoblinHp:sum(hits.filter(h=>h.role==='goblin'))};
}
const controls=[
 {kind:'standard',count:20,mode:'mixed',seed:1337,mirror:false,trace:true},
 {kind:'standard',count:40,mode:'mixed',seed:9917,mirror:true,trace:true}
];
for(const name of Object.keys(prototypes))for(const c of controls)
 assert.equal(match(c,name,true).digest,match(c,name,false).digest,'source observers changed physical trace '+name);
for(const foe of ['beetank','sniper','assassin']){
 const c={kind:'selected',count:2,side:'blue',level:5,seed:9917,solo:foe,trace:true};
 const a=match(c,'baseline');
 for(const name of Object.keys(prototypes)){
  const x=match(c,name);
  assert.equal(x.digest,a.digest,'L5 solo changed by L4-only candidate '+name+' / '+foe);
 }
}
const fixtures=[];
for(const count of [20,40])for(const mode of Object.keys(standard))
 for(const seed of [1337,9917])for(const mirror of [false,true])
  fixtures.push({kind:'standard',count,mode,seed,mirror});
for(const mode of ['mixed','swarm','ranged'])
 for(const count of [20,40])for(const seed of [1337,9917])for(const side of ['blue','red'])
  fixtures.push({kind:'selected',phase:'prespecified',level:4,count,mode,seed,side});
for(const mode of ['mixed','swarm','ranged'])
 for(const count of [20,40])for(const seed of [2017,4201])for(const side of ['blue','red'])
  fixtures.push({kind:'selected',phase:'unseen-seeds',level:4,count,mode,seed,side});
for(const mode of ['noKnight','armored'])
 for(const count of [20,40])for(const seed of [1337,9917,4201])for(const side of ['blue','red'])
  fixtures.push({kind:'selected',phase:'counter-stress',level:4,count,mode,seed,side});
assert.equal(fixtures.length,104,'32 standard + 24 prespecified + 24 new-seed + 24 stress fixture count');
const names=Object.keys(prototypes),receipts={};
for(const name of names)receipts[name]=[];
for(const c of fixtures)for(const name of names)
 receipts[name].push(match(c,name));
const summary={};
for(const name of names){
 summary[name]={};
 for(const phase of ['standard','prespecified','unseen-seeds','counter-stress']){
  const index=fixtures.map((c,i)=>[c,i]).filter(([c])=>(c.kind==='standard'?'standard':c.phase)===phase).map(([,i])=>i);
  const sum=k=>index.reduce((n,i)=>n+receipts[name][i][k],0);
  const won=sum('won');
  const baseline=receipts.baseline;
  summary[name][phase]={
   completed:index.length,wins:phase==='standard'?null:won,
   winnersFlipped:index.filter(i=>receipts[name][i].winner!==baseline[i].winner).length,
   persistentRealFronts:sum('realPersistentFronts'),
   separatedRealDamageWindows:sum('realSeparatedWindows'),
   actualTurtleHp:+sum('actualTurtleHp').toFixed(2),
   L4GuardianEvents:sum('l4GuardianEvents'),activeL4ShellGuardEvents:sum('activeL4ShellGuardEvents'),trueL4ShellReactions:sum('trueL4ShellReactions'),
   realImmediateL4AllyHpSaved:+sum('realL4ImmediateAllyHpSaved').toFixed(2),
   realActualL4ReflectedHp:+sum('actualL4ReflectedHp').toFixed(2),l4ReflectionEvents:sum('l4ReflectionEvents'),
   realKnightHp:+sum('realKnightHp').toFixed(2),
   realGoblinHp:+sum('realGoblinHp').toFixed(2),
   byPopulation:Object.fromEntries([20,40].map(count=>[count,{
    persisted:index.filter(i=>fixtures[i].count===count).reduce((n,i)=>n+receipts[name][i].realPersistentFronts,0),
    separated:index.filter(i=>fixtures[i].count===count).reduce((n,i)=>n+receipts[name][i].realSeparatedWindows,0)
   }]))
  };
 }
}
assert(summary.baseline.prespecified.realActualL4ReflectedHp>0,'Ricochet must be observed as actual target HP, not nominal');
assert(summary.reactiveShell24.prespecified.trueL4ShellReactions>0,'a real prespecified critical attack must trigger reactive shell');
assert(summary.protectiveGap24['counter-stress'].trueL4ShellReactions>0,'true no-bastion stress response required');
assert(summary.gapDuringRecovery24['counter-stress'].trueL4ShellReactions>0,'true recovery-window stress response required');
assert.equal(summary.baseline.prespecified.trueL4ShellReactions,0,'baseline cannot trigger the new response');
for(const name of names.slice(1)){
 assert(summary[name].standard.byPopulation[20].persisted>=1,'small true fronts must persist '+name);
 assert(summary[name].standard.byPopulation[40].persisted>=40,'40 real front safety floor '+name);
}
const report={
 status:'Timed Turtle L4 Shell Guardian SOURCE A/B ONLY, no shipped physics changed',
 methods:'Each of four variants: 32 standard completed fights + 24 prespecified L4 Turtle selected + 24 new-seed + 24 counter-stress; same seed, rosters, mirrors and level. Actual positive attacker-HP damage, source-connected independent fronts, physical post-shield/armor/dodge/HP-cap reflected target HP on otherwise unattributed secondary hits, per-hit local after-dodge and HP-cap guardian saving. Solo L5 unchanged full trace. Node source VM only, not iPhone Safari.',
 caveat:'Meaningful evolution is not proven by solo gross DPS or front count alone: consider wins, role HP, counter style and whether Knight/Goblin decline; immediate saved HP is per-hit, not entire divergent-match counterfactual. No balancing decision preselected from holdout.',
 summary,fixtures};
if(process.env.QA_L4_TURTLE_RECEIPT)fs.writeFileSync(process.env.QA_L4_TURTLE_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('TIMED TURTLE SHELL RESPONSE SOURCE A/B '+JSON.stringify(summary));
console.log('PASS: four source options x 104 completed matches, timed real shell protection, reflected/saved HP, L5 physical SHA and true fronts; no gameplay patch');
