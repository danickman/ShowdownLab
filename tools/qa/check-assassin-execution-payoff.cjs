'use strict';
// L5 Assassin Execution potency only: 55% -> 75% pre-hit target HP gate.
// True HP-damage effects, counters, independent-front preservation and 300 parity.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),
 crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
// Historical L5 55%→75% discovery comparisons intentionally retain the
// pre-premium Barbarian ecosystem; after that fixed witness we ALSO observe
// the currently shipped premium-roster cross-evolution effects separately.
const shippedCore=read('v3/legacy-sim-core.js'),
 currentAbility=read('v3/ultimate-abilities.js'),
 shippedAbility=read('tools/qa/fixtures/barbarian-before-premium-ultimate.js');
const {withoutGuardian}=require('./historical-guardian-control.cjs');
const {core,ability:live}=withoutGuardian(shippedCore,shippedAbility);
// Original Assassin 55%→75% controlled study excludes future Turtle support physics.
assert(shippedAbility.includes("t.hp/t.maxHp<.6&&shelter>protection"),'historical Guardian source contract');
assert(currentAbility.includes("t.hp/t.maxHp<.6&&shelter>protection"),'current live Guardian contract');
assert(currentAbility.includes("t.hp/t.maxHp<(r===2?.75:.4)"),'current live Assassin L5 Execution HP gate');
const oldGate='t.hp/t.maxHp<(r===2?.55:.4)',newGate='t.hp/t.maxHp<(r===2?.75:.4)';
assert.equal(live.split(newGate).length,2,'L5 Execution condition changed; review battle QA');
const baseline=live.replace(newGate,oldGate);
assert(baseline.includes(oldGate),'historic L5 Execution 55% control reconstructable');
const graph=read('tools/qa/check-role-fronts-baseline.cjs');
const start=graph.indexOf('const cell='),end=graph.indexOf('// Synthetic truth fixtures',start);
assert(start>=0&&end>start,'true damage-edge connected-front measurement moved');
const damageFronts=vm.runInNewContext(graph.slice(start,end)+';damageFronts',{Math});
const realDamage='const dealt=Math.min(t.hp,dmg);';
assert.equal(core.split(realDamage).length,2,'real HP damage source anchor moved');
const instrumented=core.replace(realDamage,realDamage+
 'if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,attacker:a.id,target:t.id,role:a.type,team:a.team,damage:dealt,x:t.x,y:t.y});');
const roles=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const patterns={
 mixed:[roles,roles.slice().reverse()],
 swarm:[['goblin','goose','assassin','goblin','knight','barbarian','mole','sniper','goblin','goose'],
  ['goblin','goblin','turtle','beetank','dragon','goose','knight','barbarian','mole','sniper']],
 heavy:[['beetank','turtle','knight','dragon','barbarian','beetank','turtle','sniper','mole','assassin'],
  ['dragon','beetank','barbarian','turtle','knight','sniper','assassin','goblin','goose','mole']],
 ranged:[['sniper','sniper','dragon','dragon','sniper','knight','beetank','turtle','mole','barbarian'],
  ['goblin','goblin','goose','assassin','knight','barbarian','mole','beetank','turtle','sniper']],
 backline:[['assassin','assassin','assassin','knight','goblin','barbarian','turtle','beetank','sniper','mole'],
  ['sniper','sniper','sniper','dragon','dragon','knight','beetank','turtle','mole','goblin']],
 noAssassin:[['knight','sniper','dragon','goblin','barbarian','turtle','mole','goose','beetank','knight'],
  ['goose','beetank','turtle','knight','sniper','dragon','barbarian','mole','goblin','turtle']]
};
function simulate(ultimateSrc,c,observe=true){
 let now=0,id=0,callbacks=new Map(),state,err=[],events=[],execution=[],backs=0,frames=0;
 const sha=c.fullTrace?crypto.createHash('sha256'):null;
 const env={window:null,Math,performance:{now:()=>now},
 requestAnimationFrame(fn){let n=++id;callbacks.set(n,fn);return n},
 cancelAnimationFrame(k){callbacks.delete(k)},
 console:{error:(...x)=>err.push(x.join(' '))}};
 env.window=env;
 env.__qaHit=h=>events.push(h);
 env.__qaExec=e=>execution.push(e);
 env.__qaBack=()=>backs++;
 vm.createContext(env);
 vm.runInContext(read('v3/evolution-rules.js'),env);
 const ability=observe?ultimateSrc.replace("cue(a,'execution',tick,t);return damage",
  "window.__qaExec({level:a.level,tick,target:t.type});cue(a,'execution',tick,t);return damage"):ultimateSrc;
 assert(!observe||ability!==ultimateSrc,'execution real event observer moved');
 vm.runInContext(ability,env);
 const runner=observe?instrumented.replace("u.action='backstab';u.backstabTick=tick;hit(u,t,",
  "u.action='backstab';u.backstabTick=tick;window.__qaBack();hit(u,t,"):core;
 assert(!observe||runner!==instrumented,'real backstab action observer moved');
 vm.runInContext(runner,env);
 const sim=env.LegacySimCore,side=c.mirror?'red':'blue',part=c.mode;
 const roster=team=>{
  let p;if(part.startsWith('solo'))p=team===side?['assassin']:[part.slice(4)];
  else p=patterns[part][team==='blue'?(c.mirror?1:0):(c.mirror?0:1)];
  return Array.from({length:c.count/2},(_,i)=>({type:p[i%p.length],level:c.level||[1,2,4,5][i%4],squad:Math.floor(i/5)}));
 };
 sim.configure({seed:c.seed||1337,speed:c.speed||10,onState:()=>{}});
 sim.deploy(roster('blue'),roster('red'));sim.setRunning(true);
 const limit=c.frames||(c.count===2?270:c.count>=300?12:c.count>=120?24:450);
 for(;frames<limit;frames++){
  now+=16.667;const tasks=[...callbacks.values()];callbacks.clear();
  for(const fn of tasks)fn(now);
  state=sim.getState();
  if(sha)sha.update(JSON.stringify(state)+'\n');
  if(state.winner){frames++;break}
 }
 assert.deepEqual(err,[],'simulation threw '+JSON.stringify(c));
 assert(state.units.every(x=>Number.isFinite(x.hp)&&Number.isFinite(x.x)&&Number.isFinite(x.y)),'nonfinite physical state');
 if(!observe)return{trace:sha?.digest('hex'),winner:state.winner,tick:state.tick};
 const fronts=part.startsWith('solo')||part==='noAssassin'?null:damageFronts(events,state.tick,30);
 const ass=events.filter(e=>e.role==='assassin'&&e.team===side);
 return{trace:sha?.digest('hex'),winner:state.winner,tick:state.tick,
  assassinTeamWin:state.winner===side,defenderWin:state.winner&&state.winner!==side,
  executions:execution.length,backstabs:backs,assassinHits:ass.length,
  assassinDamage:+ass.reduce((a,h)=>a+h.damage,0).toFixed(2),
  realSeparatedWindows:fronts?.windowsWithTwoGeographicallySeparatedDamageComponents,
  realPersistentWindows:fronts?.consecutivePersistentMultiFrontWindows};
}
const e={window:null,Math};e.window=e;vm.createContext(e);
vm.runInContext(read('v3/evolution-rules.js'),e);vm.runInContext(live,e);
const mk=(level,hp)=>({type:'assassin',team:'blue',id:1,level,action:'backstab',x:.4,y:.5,dmg:100,hp:100,maxHp:100,stun:0});
const foe=hp=>({type:'beetank',team:'red',id:2,x:.44,y:.5,hp,maxHp:100,armor:0,stun:0});
for(const level of [1,2,3,4,5]){
 for(const [hp,expected] of [[76,100],[75,100],[74,level===5?220.00000000000003:100],[39,level===5?220.00000000000003:level===4?180:100]]){
  const a=mk(level),b=foe(hp);
  assert.equal(e.ShowdownUltimates.outgoing(a,b,100,[a,b],50),expected,
   'L5 75% inclusive/exclusive and protected L4/low-tier behavior');
 }
}
assert(live.includes("l5:'120% extra damage to enemies below 75% health.'"),
 'public Execution description disagrees with L5 actual damage threshold');
// Full physical state parity: hooks must be observational, for both reference and candidate.
for(const n of [20,40]){
 const c={count:n,mode:'mixed',seed:1337,mirror:false,fullTrace:true};
 assert.equal(simulate(live,c).trace,simulate(live,c,false).trace,'observer altered combat state '+n);
}
const rows=[],summary={};
for(const count of [20,40])for(const mode of ['mixed','swarm','heavy','ranged','backline'])
 for(const seed of [1337,9917])for(const mirror of [false,true]){
  const c={count,mode,seed,mirror},
   before=simulate(baseline,c),after=simulate(live,c);
  assert(before.winner&&after.winner,'only fully completed battle outcomes may certify balancing');
  rows.push({c,before,after});
 }
for(const n of [20,40]){
 const r=rows.filter(x=>x.c.count===n);
 const sum=(v,k)=>r.reduce((a,x)=>a+(x[v][k]||0),0);
 summary[n]={completed:r.length,execBefore:sum('before','executions'),execAfter:sum('after','executions'),
  assDamageBefore:+sum('before','assassinDamage').toFixed(2),
  assDamageAfter:+sum('after','assassinDamage').toFixed(2),
  separatedBefore:sum('before','realSeparatedWindows'),
  separatedAfter:sum('after','realSeparatedWindows'),
  persistentBefore:sum('before','realPersistentWindows'),
  persistentAfter:sum('after','realPersistentWindows'),
  winnerChanges:r.filter(x=>x.before.winner!==x.after.winner).length};
 assert.equal(summary[n].completed,20,'sample count changed; rerun A/B evidence');
 assert(summary[n].execAfter>summary[n].execBefore,
  'actual Execution did not become more attainable in finished '+n+' fighter matches');
 assert(summary[n].assDamageAfter>summary[n].assDamageBefore,
  'Assassin did not deliver additional true HP damage at '+n);
 assert(summary[n].persistentAfter>=summary[n].persistentBefore,
  'real independent front persistence regressed at '+n);
 assert(summary[n].separatedAfter>=summary[n].separatedBefore,
  'actual geographically independent damage-window coverage regressed at '+n);
 assert.equal(summary[n].winnerChanges,0,
  'completed battle winner changed in counter-balanced fixed representative sample');
}
const solo=[];
for(const level of [1,4,5])for(const target of ['turtle','beetank','dragon','sniper','knight'])
 for(const seed of [1337,9917])for(const mirror of [false,true]){
 const c={mode:'solo'+target,count:2,level,seed,mirror},before=simulate(baseline,c),after=simulate(live,c);
 assert(before.winner&&after.winner,'solo match must reach terminal');
 if(level<5)assert.deepEqual([after.winner,after.tick,after.executions,after.assassinDamage],
  [before.winner,before.tick,before.executions,before.assassinDamage],
  'L1/L4 counter matchup altered by L5-only Execution '+JSON.stringify(c));
 if(level===5)assert.equal(after.winner,before.winner,
  'L5 buff erased an existing single-defender counter '+JSON.stringify(c));
 if(['turtle','beetank','dragon','knight'].includes(target))assert(after.defenderWin,
  'armored or guard defender must remain capable of stopping solo Assassin');
 if(target==='sniper')assert(after.assassinTeamWin,'Assassin should counter an exposed Sniper');
 solo.push({c,before,after});
}
const l5=solo.filter(x=>x.c.level===5);
assert(l5.reduce((n,x)=>n+x.after.executions,0)>l5.reduce((n,x)=>n+x.before.executions,0),
 'L5 should gain extra real Execution triggers in solo counter matchups');
for(const count of [80,120,300])for(const speed of [1,10]){
 const c={mode:'noAssassin',count,seed:1337,mirror:true,speed,frames:count>=300?12:24,fullTrace:true};
 assert.equal(simulate(live,c).trace,simulate(baseline,c).trace,
  'Unrelated 80/120/300 physical combat state changed '+JSON.stringify(c));
}
for(const level of [1,4])for(const mode of ['mixed','backline']){
 const c={mode,count:20,level,seed:1337,mirror:true,fullTrace:true};
 assert.equal(simulate(live,c).trace,simulate(baseline,c).trace,
  'L1/L4 fights must remain physically identical under L5-only change '+JSON.stringify(c));
}

// Modern premium-Barbarian cross-evolution diagnostic: replay identical
// matched completed fixtures against the exact new gameplay. Do NOT replace
// the historical fixed 20/40 HP/front thresholds with arbitrary new floors.
// This reports current dangerous front/role interactions as a release review.
const {ability:modernLive}=withoutGuardian(shippedCore,currentAbility);
const modernOld=modernLive.replace(newGate,oldGate);
assert(modernOld!==modernLive,'contemporary L5 Execution reference did not change');
const contemporary={};
for(const n of [20,40]){
 const observations=[];
 for(const mode of ['mixed','swarm','heavy','ranged','backline'])
  for(const seed of [1337,9917])for(const mirror of [false,true]){
   const c={count:n,mode,seed,mirror};
   const before=simulate(modernOld,c),after=simulate(modernLive,c);
   assert(before.winner&&after.winner,'modern cross-evolution outcome must be terminal');
   observations.push({before,after});
  }
 const total=(side,key)=>+observations.reduce((v,x)=>v+(x[side][key]||0),0).toFixed(2);
 contemporary[n]={completed:observations.length,
   executionsBefore:total('before','executions'),executionsAfter:total('after','executions'),
   physicalAssassinHpBefore:total('before','assassinDamage'),physicalAssassinHpAfter:total('after','assassinDamage'),
   realPersistentFrontsBefore:total('before','realPersistentWindows'),realPersistentFrontsAfter:total('after','realPersistentWindows'),
   separatedPositiveHpWindowsBefore:total('before','realSeparatedWindows'),
   separatedPositiveHpWindowsAfter:total('after','realSeparatedWindows'),
   winnerFlips:observations.filter(x=>x.before.winner!==x.after.winner).length};
 assert.equal(contemporary[n].completed,20,'contemporary sample regression');
 assert(contemporary[n].executionsAfter>=contemporary[n].executionsBefore,
  'L5 chosen threshold cannot execute less frequently in current live source');
}
console.log('ASSASSIN L5 PREMIUM-BARBARIAN CONTEMPORARY FRONT DIAGNOSTIC '+JSON.stringify(contemporary));

const report={status:'L5-only 55→75 threshold historical fixed evidence plus modern Premium Barbarian cross-evolution live outcomes; QA branch only',
 summary,contemporary,solo:solo.map(x=>({c:x.c,before:x.before,after:x.after})),cases:rows,
 caveats:'Attacker-attributed HP excludes source-less burns/reflection. Ordinary L1-L4 Execution unchanged. 20-body persistence remains a weak 1-window baseline, not a gameplay-quality signoff. Matches are terminated, unlike earlier short stage snapshots; phone Safari still manual.'};
if(process.env.QA_ASSASSIN_EXECUTION_RECEIPT)fs.writeFileSync(process.env.QA_ASSASSIN_EXECUTION_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('ASSASSIN L5 EXECUTION COMPLETE MATCH '+JSON.stringify(summary));
console.log('PASS: exact L5 75% true damage, complete 20/40 front preservation and changed-hit gain, solo counterplay, L1/L4 and 300 no-Assassin parity');
