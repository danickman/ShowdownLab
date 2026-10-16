'use strict';
// Read-only source A/B: small-army target pressure cannot be tuned by counting
// proximity or fake lanes. Every measurement comes from real positive HP hurt()
// and FULL terminal matches. No runtime alterations or deployment in this study.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const core=read('v3/legacy-sim-core.js');
const ability=read('v3/ultimate-abilities.js'),evolution=read('v3/evolution-rules.js');
const pressureAnchor='Math.max(0,pressure-2)*.035',hitAnchor='const dealt=Math.min(t.hp,dmg);';
function one(s,a,b){assert.equal(s.split(a).length,2,'source anchor drift: '+a.slice(0,90));return s.replace(a,b)}
const variants={
 baseline:core,
 allSmall:one(core,pressureAnchor,'(units.length<=20?Math.max(0,pressure-1)*.015:Math.max(0,pressure-2)*.035)'),
 turtleOnly:one(core,pressureAnchor,"(units.length<=20&&u.type==='turtle'?Math.max(0,pressure-1)*.015:Math.max(0,pressure-2)*.035)")
};
const observe=s=>one(s,hitAnchor,hitAnchor+
 "if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,attacker:a.id,target:t.id,team:a.team,role:a.type,damage:dealt,x:t.x,y:t.y});");
const graph=read('tools/qa/check-role-fronts-baseline.cjs');
const a=graph.indexOf('const cell='),b=graph.indexOf('// Synthetic truth fixtures',a);
assert(a>=0&&b>a,'real positive HP-damage-connected front score moved');
const fronts=vm.runInNewContext(graph.slice(a,b)+';damageFronts',{Math});
const roles=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const rosters={
 mixed:[roles,roles.slice().reverse()],
 swarm:[['goblin','goose','assassin','goblin','knight','barbarian','mole','sniper','goblin','goose'],
  ['goblin','goblin','turtle','beetank','dragon','goose','knight','barbarian','mole','sniper']],
 heavy:[['beetank','turtle','knight','dragon','barbarian','beetank','turtle','sniper','mole','assassin'],
  ['dragon','beetank','barbarian','turtle','knight','sniper','assassin','goblin','goose','mole']],
 ranged:[['sniper','sniper','dragon','dragon','sniper','knight','beetank','turtle','mole','barbarian'],
  ['goblin','goblin','goose','assassin','knight','barbarian','mole','beetank','turtle','sniper']]
};
function battle(c,kind,observeHits=true){
 let clock=0,seq=0,queue=new Map(),state,errors=[],hits=[],frames=0;
 const hash=crypto.createHash('sha256');
 const env={window:null,Math,performance:{now:()=>clock},console:{error:(...e)=>errors.push(e.join(' '))},
  requestAnimationFrame(fn){const id=++seq;queue.set(id,fn);return id},
  cancelAnimationFrame(id){queue.delete(id)}};
 env.window=env;env.__qaHit=h=>hits.push(h);vm.createContext(env);
 vm.runInContext(evolution,env);vm.runInContext(ability,env);
 vm.runInContext(observeHits?observe(variants[kind]):variants[kind],env);
 const sim=env.LegacySimCore;
 const roster=team=>Array.from({length:c.count/2},(_,i)=>({
  type:rosters[c.mode][team==='blue'?(c.mirror?1:0):(c.mirror?0:1)][i%10],
  level:[1,2,4,5][i%4],squad:Math.floor(i/5)
 }));
 sim.configure({seed:c.seed,speed:10,onState:()=>{}});
 sim.deploy(roster('blue'),roster('red'));sim.setRunning(true);
 for(;frames<460;frames++){
  clock+=16.667;const work=[...queue.values()];queue.clear();
  for(const fn of work)fn(clock);
  state=sim.getState();hash.update(JSON.stringify(state)+'\n');
  if(state.winner){frames++;break}
 }
 assert.deepEqual(errors,[],'no simulator errors '+JSON.stringify({c,kind}));
 assert(state?.winner,'full genuine terminal battle required '+JSON.stringify({c,kind}));
 assert.equal(state.units.length,c.count,'population must remain physical');
 assert(state.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.x)&&Number.isFinite(u.y)),
  'no non-finite HP or positions');
 const digest=hash.digest('hex');
 if(!observeHits)return{winner:state.winner,tick:state.tick,digest};
 const graph=fronts(hits,state.tick,30);
 const damage={};
 for(const h of hits)damage[h.role]=(damage[h.role]||0)+h.damage;
 return{winner:state.winner,tick:state.tick,digest,
  separated:graph.windowsWithTwoGeographicallySeparatedDamageComponents,
  persistent:graph.consecutivePersistentMultiFrontWindows,
  actualHpByRole:Object.fromEntries(roles.map(r=>[r,+(damage[r]||0).toFixed(2)]))};
}
const representative={count:20,mode:'mixed',seed:1337,mirror:false};
assert.equal(battle(representative,'baseline').digest,battle(representative,'baseline',false).digest,
 'read-only real HP observer changed physical 20-fighter state');
const cases=[];
for(const count of [20,40])for(const mode of Object.keys(rosters))
 for(const seed of [1337,9917])for(const mirror of [false,true]){
  const c={count,mode,seed,mirror};
  const baseline=battle(c,'baseline'),allSmall=battle(c,'allSmall'),turtleOnly=battle(c,'turtleOnly');
  if(count===40){
   // The alternate pressure only applies to populations <=20: 40 must stay
   // bitwise physically identical at each RAF, not merely have the same winner.
   assert.equal(allSmall.digest,baseline.digest,'allSmall leaked into 40-fighter combat');
   assert.equal(turtleOnly.digest,baseline.digest,'turtleOnly leaked into 40-fighter combat');
  }
  cases.push({c,baseline,allSmall,turtleOnly});
 }
assert.equal(cases.length,32,'16 matched fully terminal cases each for 20 and 40');
const summary={};
for(const count of [20,40]){
 const rows=cases.filter(x=>x.c.count===count);
 summary[count]={};
 for(const k of Object.keys(variants)){
  const own=rows.map(x=>x[k]),base=rows.map(x=>x.baseline);
  const sum=key=>own.reduce((n,x)=>n+x[key],0);
  const hp=role=>+own.reduce((n,x)=>n+x.actualHpByRole[role],0).toFixed(2);
  summary[count][k]={matches:own.length,completed:own.filter(x=>x.winner).length,
   persistentRealFronts:sum('persistent'),separatedRealDamageWindows:sum('separated'),
   winnerFlipsFromBaseline:own.filter((x,i)=>x.winner!==base[i].winner).length,
   actualGoblinHp:hp('goblin'),actualKnightHp:hp('knight'),
   actualTurtleHp:hp('turtle'),actualBeetankHp:hp('beetank')};
  assert.equal(summary[count][k].completed,16,'no censored outcomes');
 }
}
assert(summary[20].baseline.persistentRealFronts>=1,'actual small battle baseline has no sustained fights');
assert(summary[20].allSmall.persistentRealFronts>summary[20].baseline.persistentRealFronts,
 'exploratory spread candidate no longer creates independent real HP combat: reevaluate');
const b20=summary[20].baseline,x20=summary[20].allSmall;
assert(x20.winnerFlipsFromBaseline>0&&
 (x20.actualKnightHp<b20.actualKnightHp*.9||x20.actualGoblinHp<b20.actualGoblinHp*.9),
 'rejected broadly tuned target pressure no longer harms original roles; revisit source decision');
// Preserve *honest* rejection: apparent front gains alone are insufficient if
// Knight/Goblin real contribution drops and battle winners unexpectedly flip.
const report={
 status:'Exploratory candidate REJECTED — source-only pressure controls, no combat change',
 reason:'Small-army target-pressure penalties yielded some more true independent fronts but caused winner flips and reduced actual Knight/Goblin HP contributions. Avoid scoring target proximity as real damage and do not silently ship.',
 controls:'Same seeds, rosters, 1/2/4/5 levels, both mirrors, 16 completed 20-body and 16 completed 40-body matches for each alternative. 40-body complete RAF-state SHA parity.',
 summary,cases};
if(process.env.QA_SMALL_PRESSURE_RECEIPT)fs.writeFileSync(process.env.QA_SMALL_PRESSURE_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('SMALL TARGET PRESSURE SOURCE STUDY '+JSON.stringify(summary));
console.log('PASS: rejected misleading small-army target allocation, fully terminal HP fronts and protected 40-body source-state parity');
