'use strict';
// Historical fixed-fixture research: preserve accepted pre-Impact Goose source.
// New all-roster first-tier tests exercise current live Goose Impact separately.
// One draft-pick opportunity cost, source-real. Never imported into game or PWA.
// Choices: level up one fighter FAMILY (all copies), add two copies, or level
// up the existing Beetank family. No winner, front, or performance shortcuts.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const live=read('v3/legacy-sim-core.js'),ability=read('tools/qa/fixtures/goose-before-impact-ultimate.js'),evolution=read('v3/evolution-rules.js');
const replace=(s,a,b)=>{assert.equal(s.split(a).length,2,'observer anchor drift: '+a.slice(0,90));return s.replace(a,b)};
const hitAnchor='const dealt=Math.min(t.hp,dmg);';
const reflectLoop='if(!secondary)for(const hit of ultimate.afterHit(a,t,dealt,units,tick))hurt(hit.target,hit.damage,hit.source,true)';
const guarded="if(t.hp/t.maxHp<.6&&shelter>protection){damage*=1-shelter;cue(guardian,'shelter',tick,t)}";
const watchedAbility=replace(ability,guarded,
 "if(t.hp/t.maxHp<.6&&shelter>protection){window.__qaGuard({guardianId:guardian.id,defenderId:t.id,team:t.team,strength:shelter,alternativeKnightProtection:protection,tick});damage*=1-shelter;cue(guardian,'shelter',tick,t)}");
const witnessedCore=replace(replace(live,hitAnchor,hitAnchor+
 "window.__qaResolved({id:t.id,tick,remainingHp:t.hp,postDodgeDamage:dmg});"+
 "if(dealt>0&&window.__qaReflectionContext)window.__qaReflect({...window.__qaReflectionContext,damage:dealt,tick});"+
 "if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,attacker:a.id,team:a.team,target:t.id,targetRole:t.type,role:a.type,damage:dealt,x:t.x,y:t.y});"),
 reflectLoop,
 "if(!secondary)for(const hit of ultimate.afterHit(a,t,dealt,units,tick)){"+
 "window.__qaReflectionContext=hit.source===null&&a&&t.type==='turtle'?{source:t.id,team:t.team}:null;"+
 "hurt(hit.target,hit.damage,hit.source,true);window.__qaReflectionContext=null}");
const g=read('tools/qa/check-role-fronts-baseline.cjs'),first=g.indexOf('const cell='),last=g.indexOf('// Synthetic truth fixtures',first);
assert(first>=0&&last>first,'source-authentic HP-damage front algorithm moved');
const graph=vm.runInNewContext(g.slice(first,last)+';damageFronts',{Math});
const modes={
 swarm:{
  ours:['TARGET','TARGET','knight','goblin','goose','barbarian','beetank','TARGET','sniper','mole'],
  foe:['goblin','goblin','goose','goblin','barbarian','knight','goblin','beetank','turtle','mole']},
 backline:{
  ours:['TARGET','knight','TARGET','goblin','barbarian','beetank','goose','TARGET','sniper','mole'],
  foe:['sniper','sniper','dragon','dragon','sniper','knight','beetank','turtle','mole','barbarian']},
 armored:{
  ours:['TARGET','knight','TARGET','goblin','barbarian','beetank','goose','TARGET','sniper','mole'],
  foe:['beetank','beetank','dragon','turtle','knight','barbarian','beetank','sniper','mole','assassin']}
};
const choices=['hold','evolve','recruit2','evolveBeetank'];
function roster(c,team){
 const original=(team===c.side?modes[c.mode].ours:modes[c.mode].foe);
 const own=team===c.side;
 const body=Array.from({length:c.count/2},(_,i)=>{
  const type=original[i%10],isTarget=own&&type==='TARGET',isBee=own&&type==='beetank';
  return{type:isTarget?c.role:type,
   level:isTarget?(c.choice==='evolve'?c.level+1:c.level):
    isBee?(c.choice==='evolveBeetank'?c.level+1:c.level):4,
   squad:Math.floor(i/5),isTarget,isBee};
 });
 if(own&&c.choice==='recruit2'){
  body.push({type:c.role,level:c.level,squad:100,isTarget:true,isBee:false},
   {type:c.role,level:c.level,squad:100,isTarget:true,isBee:false});
 }
 return body;
}
function simulate(c,observed=true,trace=false){
 let clock=0,next=0,queue=new Map(),state,errors=[],hits=[],reflect=[],guards=[],pending=null;
 const hash=trace?crypto.createHash('sha256'):null;
 const env={window:null,Math,performance:{now:()=>clock},
  requestAnimationFrame(fn){const id=++next;queue.set(id,fn);return id},cancelAnimationFrame(id){queue.delete(id)},
  console:{error:(...a)=>errors.push(a.join(' '))}};
 env.window=env;
 env.__qaHit=x=>hits.push(x);
 env.__qaReflect=x=>{assert(x.damage>0&&Number.isFinite(x.damage),'reflection actual positive HP');reflect.push(x)};
 env.__qaGuard=x=>{assert.equal(pending,null,'guardian event must finish per hurt');
  pending={...x,actualHpSaved:0};guards.push(pending)};
 env.__qaResolved=x=>{if(!pending)return;
  assert.equal(x.id,pending.defenderId,'defender physical ID mismatch');
  assert.equal(x.tick,pending.tick,'defender tick mismatch');
  pending.actualHpSaved=Math.max(0,
   Math.min(x.remainingHp,x.postDodgeDamage*(1-pending.alternativeKnightProtection)/(1-pending.strength))-
   Math.min(x.remainingHp,x.postDodgeDamage));
  assert(pending.actualHpSaved>=0&&pending.actualHpSaved<=x.postDodgeDamage/(1-pending.strength)*pending.strength+1e-7,'saved ally HP must be physical and within shell budget');
  pending=null};
 vm.createContext(env);
 vm.runInContext(evolution,env);
 vm.runInContext(observed?watchedAbility:ability,env);
 vm.runInContext(observed?witnessedCore:live,env);
 const sim=env.LegacySimCore;
 const blue=roster(c,'blue'),red=roster(c,'red'),ours=c.side==='blue'?blue:red;
 const back=e=>e.type==='sniper'||e.type==='dragon';
 const deployed=ours.filter(e=>!back(e)).concat(ours.filter(back));
 assert.equal(ours.filter(e=>e.type===c.role).length,c.count/2/10*3+(c.choice==='recruit2'?2:0), 'all own family copies must be nominated: draft upgrades apply family-wide');
 const start=c.side==='blue'?1:blue.length+1;
 const chosen=new Set(),bee=new Set();
 deployed.forEach((e,i)=>{if(e.isTarget)chosen.add(start+i);if(e.isBee)bee.add(start+i)});
 assert.equal(chosen.size,c.count/2/10*3+(c.choice==='recruit2'?2:0),'physical nominated family size');
 assert.equal(bee.size,c.count/2/10,'physical Beetank family size');
 const strip=arr=>arr.map(({isTarget,isBee,...e})=>e);
 sim.configure({seed:c.seed,speed:10,onState:()=>{}});
 sim.deploy(strip(blue),strip(red));
 const expected=sim.getState().units.filter(u=>chosen.has(u.id));
 assert.equal(expected.length,chosen.size,'missing selected physical IDs');
 assert(expected.every(u=>u.type===c.role&&u.team===c.side&&u.level===c.level+(c.choice==='evolve'?1:0)),
  'selected family physical level/team mismatch');
 assert(sim.getState().units.filter(u=>bee.has(u.id)).every(u=>u.type==='beetank'&&u.team===c.side),'Beetank nominated IDs mismatch');
 sim.setRunning(true);
 for(let frame=0;frame<1000;frame++){
  clock+=16.667;const jobs=[...queue.values()];queue.clear();for(const fn of jobs)fn(clock);
  state=sim.getState();if(hash)hash.update(JSON.stringify(state)+'\n');
  if(state.winner)break;
 }
 assert.equal(pending,null,'unfinished guardian local receipt');
 assert.deepEqual(errors,[],'source-real sim error: '+JSON.stringify(c));
 assert(state?.winner,'genuine full-terminal winner required '+JSON.stringify(c));
 assert.equal(state.units.length,c.count+(c.choice==='recruit2'?2:0),'unexpected deployed total');
 const digest=hash?.digest('hex');
 if(!observed)return{digest,winner:state.winner};
 const hitSum=(pred)=>hits.reduce((n,h)=>n+(pred(h)?h.damage:0),0);
 const reflectSum=(pred)=>reflect.reduce((n,h)=>n+(pred(h)?h.damage:0),0);
 const shellSave=guards.reduce((n,h)=>n+(chosen.has(h.guardianId)?h.actualHpSaved:0),0);
 const front=graph(hits,state.tick,30);
 return{digest,winner:state.winner,win:state.winner===c.side?1:0,ticks:state.tick,
  nominatedCount:chosen.size,beetankCount:bee.size,
  nominatedDirectHp:hitSum(h=>chosen.has(h.attacker)),
  nominatedReflectedHp:reflectSum(h=>chosen.has(h.source)),
  nominatedRealAllyHpSaved:shellSave,
  beetankDirectHp:hitSum(h=>bee.has(h.attacker)),
  enemyHpRemoved:hitSum(h=>h.team===c.side)+reflectSum(h=>h.team===c.side),
  allyHpLost:hitSum(h=>h.team!==c.side)+reflectSum(h=>h.team!==c.side),
  realPersistentFronts:front.consecutivePersistentMultiFrontWindows,
  realSeparatedDamageWindows:front.windowsWithTwoGeographicallySeparatedDamageComponents};
}
const fixtures=[];
for(const role of ['turtle','assassin'])for(const level of [3,4])
 for(const mode of ['swarm','backline','armored'])for(const count of [20,40])
 for(const seed of [1337,2017])for(const side of ['blue','red'])
  fixtures.push({role,level,mode,count,seed,side});
assert.equal(fixtures.length,96,'two roles × two upgrade rungs × 3 enemy counter modes × 2 populations × 2 seeds × 2 side mirrors');
const parity=fixtures.filter((c,i)=>i%24===0);
for(const c of parity)for(const choice of choices){
 const scenario={...c,choice};
 assert.equal(simulate(scenario,true,true).digest,simulate(scenario,false,true).digest,
  'read-only damage/reflect/protection observer must not affect any RAF state '+JSON.stringify(scenario));
}
const results=[],metric=['win','nominatedDirectHp','nominatedReflectedHp','nominatedRealAllyHpSaved',
 'beetankDirectHp','enemyHpRemoved','allyHpLost','realPersistentFronts','realSeparatedDamageWindows'];
for(const fixture of fixtures){
 const variants={};for(const choice of choices)variants[choice]=simulate({...fixture,choice});
 results.push({fixture,variants});
}
const group=(role,level,mode)=>results.filter(x=>x.fixture.role===role&&x.fixture.level===level&&(mode===null||x.fixture.mode===mode));
const summaries={};
for(const role of ['turtle','assassin'])for(const level of [3,4])for(const mode of [null,'swarm','backline','armored']){
 const matches=group(role,level,mode);
 const out={matchedGroups:matches.length,completedMatches:matches.length*choices.length};
 for(const choice of choices){
  out[choice]={};
  for(const m of metric)out[choice][m]=+matches.reduce((n,x)=>n+x.variants[choice][m],0).toFixed(2);
  out[choice].winnerFlipsVsHold=matches.filter(x=>x.variants[choice].winner!==x.variants.hold.winner).length;
 }
 const named=mode||'all';
 summaries[role+'-L'+level+'-to-L'+(level+1)+'-'+named]=out;
}
for(const x of results){
 for(const choice of choices){
  const z=x.variants[choice];
  assert.equal(z.nominatedCount,x.fixture.count/2/10*3+(choice==='recruit2'?2:0));
  assert(z.enemyHpRemoved>=z.nominatedDirectHp-1e-5,'attribution exceeds team HP');
 }
}
const method={
 baseline:'Each pair starts with 20 or 40 total bodies; the one nominated side has 3 or 6 same-family TARGET fighters plus 1 or 2 Beetanks, all at L3 or L4. Opposing side and other allied fighters hold level 4 and identical slots/seeds.',
 options:{
  hold:'No draft choice, nominated family at current L3/L4',
  evolve:'One drafted evolution advances *all* nominated Turtle or Assassin copies L3→L4 or L4→L5 (3 copies at 20, 6 at 40)',
  recruit2:'One drafted reinforcement adds 2 more nominated family fighters at L3/L4, increasing field population to 22/42',
  evolveBeetank:'One drafted evolution advances existing Beetank family L3→L4 or L4→L5 while nominated family remains at base tier (1/2 Beetanks at 20/40)'
 },
 honesty:'These are fixed controlled draft-option examples, NOT guaranteed real-game offer amounts or exactly matched population/evolution purchasing power. Actual drafted add quantities and team-composition availability vary. Report absolute real winner/HP and comparisons, not a fake universal value score.',
 metrics:'Real physically resolved full-terminal winner, direct HP by nominated physical IDs, true post-armor/dodge/cap reflected HP, true *marginal over Knight* immediate HP spared by nominated guardians, Beetank-family attacker HP, opposing team damage, actual independent attacker/defender HP-damage fronts. No proximity-based false fronts. Source observer full-frame parity on 16 matches; 384 complete fights. No Safari performance claim.'
};
const report={status:'READ-ONLY controlled choice audit; no game/Guide/stat/pwa/production changes',method,summary:summaries,matched:results};
if(process.env.QA_DRAFT_VALUE_RECEIPT)fs.writeFileSync(process.env.QA_DRAFT_VALUE_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('DRAFT EVOLUTION OPPORTUNITY SUMMARY '+JSON.stringify(summaries));
console.log('PASS: 384 full terminal real match variants, read-only physical hit/protect/reflect attribution and full RAF observer parity');
