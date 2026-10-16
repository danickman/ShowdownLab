'use strict';
// Assassin L4 Execution investment: source-only, fully terminal paired match study.
// Changes are never imported by the game. The true L5 threshold stays at 75%.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const liveCore=read('v3/legacy-sim-core.js'),liveAbility=read('v3/ultimate-abilities.js'),evo=read('v3/evolution-rules.js');
const once=(s,from,to)=>{assert.equal(s.split(from).length,2,'source contract drift '+from.slice(0,90));return s.replace(from,to)};
const gate='t.hp/t.maxHp<(r===2?.75:.4)';
const execCue="cue(a,'execution',tick,t);return damage";
const back='u.action=\x27backstab\x27;u.backstabTick=tick;';
const hp='const dealt=Math.min(t.hp,dmg);';
const observerCore=once(once(liveCore,hp,hp+
 "if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,attacker:a.id,role:a.type,level:a.level,team:a.team,target:t.id,targetRole:t.type,damage:dealt,x:t.x,y:t.y});"),
 back,back+"window.__qaBack({attacker:u.id,level:u.level,team:u.team,tick});");
const variants={baseline:.4,execute50:.5,execute55:.55,execute60:.6};
const sources={};
for(const [name,threshold] of Object.entries(variants)){
 const gateSource=threshold===.4?liveAbility:once(liveAbility,gate,"t.hp/t.maxHp<(r===2?.75:"+threshold+")");
 sources[name]={raw:gateSource,observed:once(gateSource,execCue,
  "window.__qaExec({attacker:a.id,level:a.level,team:a.team,tick,preHp:t.hp/t.maxHp,targetRole:t.type});"+execCue)};
}
const graph=read('tools/qa/check-role-fronts-baseline.cjs');
const lo=graph.indexOf('const cell='),hi=graph.indexOf('// Synthetic truth fixtures',lo);
assert(lo>=0&&hi>lo,'real damage graph declaration drift');
const damageFronts=vm.runInNewContext(graph.slice(lo,hi)+';damageFronts',{Math});
const all=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const standard={
 mixed:[all,all.slice().reverse()],
 swarm:[['goblin','goose','assassin','goblin','knight','barbarian','mole','sniper','goblin','goose'],
  ['goblin','goblin','turtle','beetank','dragon','goose','knight','barbarian','mole','sniper']],
 heavy:[['beetank','turtle','knight','dragon','barbarian','beetank','turtle','sniper','mole','assassin'],
  ['dragon','beetank','barbarian','turtle','knight','sniper','assassin','goblin','goose','mole']],
 ranged:[['sniper','sniper','dragon','dragon','sniper','knight','beetank','turtle','mole','barbarian'],
  ['goblin','goblin','goose','assassin','knight','barbarian','mole','beetank','turtle','sniper']]
};
const selected={
 mixed:{ours:['assassin','knight','sniper','assassin','mole','goblin','barbarian','goose','assassin','dragon'],
  foe:['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose']},
 backline:{ours:['assassin','assassin','assassin','knight','goblin','barbarian','mole','assassin','turtle','goose'],
  foe:['sniper','sniper','dragon','dragon','sniper','knight','beetank','turtle','mole','barbarian']},
 swarm:{ours:['assassin','assassin','knight','goblin','goose','barbarian','mole','assassin','sniper','turtle'],
  foe:['goblin','goblin','goose','goblin','barbarian','knight','goblin','beetank','turtle','mole']},
 noKnight:{ours:['assassin','assassin','goblin','barbarian','mole','goose','assassin','sniper','dragon','turtle'],
  foe:['sniper','dragon','beetank','barbarian','knight','goblin','assassin','turtle','mole','goose']},
 armored:{ours:['assassin','knight','assassin','goblin','barbarian','mole','goose','assassin','sniper','turtle'],
  foe:['beetank','beetank','dragon','turtle','knight','barbarian','beetank','sniper','mole','assassin']}
};
function fight(c,name,observe=true){
 let now=0,next=0,q=new Map(),state,errors=[],hits=[],executions=[],backstabs=[];
 const hash=c.hash?crypto.createHash('sha256'):null;
 const env={window:null,Math,performance:{now:()=>now},
  requestAnimationFrame(fn){let id=++next;q.set(id,fn);return id},
  cancelAnimationFrame(id){q.delete(id)},
  console:{error:(...a)=>errors.push(a.join(' '))}};
 env.window=env;env.__qaHit=x=>hits.push(x);env.__qaExec=x=>executions.push(x);env.__qaBack=x=>backstabs.push(x);
 vm.createContext(env);
 vm.runInContext(evo,env);vm.runInContext(observe?sources[name].observed:sources[name].raw,env);
 vm.runInContext(observe?observerCore:liveCore,env);
 const s=env.LegacySimCore;
 function roster(team){
  return Array.from({length:c.count/2},(_,i)=>{
   let type,level;
   if(c.solo){type=team===c.side?'assassin':c.solo;level=c.level||5}
   else if(c.kind==='standard'){
    type=standard[c.mode][team==='blue'?(c.mirror?1:0):(c.mirror?0:1)][i%10];
    level=[1,2,4,5][i%4];
   }else if(c.kind==='nonAssassin'){
    type=['knight','sniper','dragon','beetank','mole','turtle','goblin','barbarian','goose'][i%9];
    level=[1,2,4,5][i%4];
   }else{
    type=(team===c.side?selected[c.mode].ours:selected[c.mode].foe)[i%10];
    level=team===c.side&&type==='assassin'?4:4;
   }
   return{type,level,squad:Math.floor(i/5)};
  });
 }
 s.configure({seed:c.seed,speed:c.speed||10,onState:()=>{}});
 s.deploy(roster('blue'),roster('red'));s.setRunning(true);
 const limit=c.frames||(c.kind==='nonAssassin'?15:c.solo?600:700);
 for(let frame=0;frame<limit;frame++){
  now+=16.667;const pending=[...q.values()];q.clear();
  for(const fn of pending)fn(now);
  state=s.getState();if(hash)hash.update(JSON.stringify(state)+'\n');
  if(state.winner)break;
 }
 assert.deepEqual(errors,[],'live simulation errors '+JSON.stringify(c));
 assert(state&&state.units.length===c.count&&state.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.x)&&Number.isFinite(u.y)), 'finite true simulator state');
 if(c.kind!=='nonAssassin')assert(state.winner,'only true terminal outcomes accepted '+JSON.stringify(c));
 const digest=hash?.digest('hex');
 if(!observe)return{digest,winner:state.winner};
 const chosen=hits.filter(h=>h.role==='assassin'&&h.level===4&&(c.kind==='standard'||h.team===c.side));
 const exe=executions.filter(e=>e.level===4&&(c.kind==='standard'||e.team===c.side));
 const backs=backstabs.filter(e=>e.level===4&&(c.kind==='standard'||e.team===c.side));
 const sum=(arr,key)=>arr.reduce((n,x)=>n+x[key],0);
 const fronts=c.kind==='nonAssassin'||c.solo?null:damageFronts(hits,state.tick,30);
 return{winner:state.winner,digest,win:state.winner===c.side,
  executed:exe.length,backstabCount:backs.length,actualAssassinL4Hp:sum(chosen,'damage'),
  damageOnBeetank:sum(chosen.filter(h=>h.targetRole==='beetank'),'damage'),
  damageOnTurtle:sum(chosen.filter(h=>h.targetRole==='turtle'),'damage'),
  damageOnSniper:sum(chosen.filter(h=>h.targetRole==='sniper'),'damage'),
  executionAgainstArmor:exe.filter(e=>['beetank','turtle','knight'].includes(e.targetRole)).length,
  truePersistentFronts:fronts?.consecutivePersistentMultiFrontWindows||0,
  realSeparatedWindows:fronts?.windowsWithTwoGeographicallySeparatedDamageComponents||0,
  goblinHp:sum(hits.filter(h=>h.role==='goblin'),'damage'),
  knightHp:sum(hits.filter(h=>h.role==='knight'),'damage')};
}
// Observing every real hit and Execution event must not affect any physical frame or RNG.
for(const name of Object.keys(variants)){
 for(const c of [
  {kind:'standard',count:20,mode:'mixed',seed:1337,mirror:false,hash:true},
  {kind:'standard',count:40,mode:'mixed',seed:9917,mirror:true,hash:true}]){
  assert.equal(fight(c,name,true).digest,fight(c,name,false).digest,
   'instrumentation must not mutate physical frame state '+name+'/'+c.count);
 }
}
// The L4-only candidate may NEVER rewrite a single L5 Assassin physical frame.
for(const foe of ['beetank','turtle','sniper','dragon','knight'])
 for(const seed of [1337,9917]){
  const c={solo:foe,kind:'selected',count:2,side:'blue',level:5,seed,hash:true};
  const original=fight(c,'baseline');
  for(const name of Object.keys(variants).slice(1)){
   const probe=fight(c,name);
   assert.equal(probe.digest,original.digest,'L5 solo counter changed by L4-only threshold '+name+'/'+foe);
  }
 }
// Unrelated unit mixes must be identical at the 80/120/300 edge, both 1x and 10x.
for(const count of [80,120,300])for(const speed of [1,10]){
 const c={kind:'nonAssassin',count,seed:1337,speed,hash:true};
 const original=fight(c,'baseline',false);
 for(const name of Object.keys(variants).slice(1))
  assert.equal(fight(c,name,false).digest,original.digest,
   'no-Assassin high-population parity broken at '+count+'/'+speed+'/'+name);
}
const fixtures=[];
for(const count of [20,40])for(const mode of Object.keys(standard))
 for(const seed of [1337,9917])for(const mirror of [false,true])
  fixtures.push({kind:'standard',count,mode,seed,mirror});
for(const mode of ['mixed','backline','swarm'])
 for(const count of [20,40])for(const seed of [1337,9917])for(const side of ['blue','red'])
  fixtures.push({kind:'selected',phase:'prespecified',count,mode,seed,side});
for(const mode of ['mixed','backline','swarm'])
 for(const count of [20,40])for(const seed of [2017,4201])for(const side of ['blue','red'])
  fixtures.push({kind:'selected',phase:'unseen-seeds',count,mode,seed,side});
for(const mode of ['noKnight','armored'])
 for(const count of [20,40])for(const seed of [1337,9917,4201])for(const side of ['blue','red'])
  fixtures.push({kind:'selected',phase:'counter-stress',count,mode,seed,side});
assert.equal(fixtures.length,104,'32 standard + 24 prespecified + 24 heldout + 24 counter-stress');
const names=Object.keys(variants);
const receipts=Object.fromEntries(names.map(n=>[n,[]]));
for(const f of fixtures)for(const name of names)receipts[name].push(fight(f,name));
const summary={};
for(const name of names){
 summary[name]={};
 for(const phase of ['standard','prespecified','unseen-seeds','counter-stress']){
  const ids=fixtures.flatMap((f,i)=>(f.kind==='standard'?'standard':f.phase)===phase?[i]:[]);
  const sum=k=>ids.reduce((n,i)=>n+receipts[name][i][k],0);
  const base=receipts.baseline;
  summary[name][phase]={
   completed:ids.length,wins:phase==='standard'?null:sum('win'),
   winnerFlips:ids.filter(i=>receipts[name][i].winner!==base[i].winner).length,
   trueExecutions:sum('executed'),trueBackstabs:sum('backstabCount'),
   actualL4AssassinHp:+sum('actualAssassinL4Hp').toFixed(2),
   hpAgainstBeetank:+sum('damageOnBeetank').toFixed(2),
   hpAgainstTurtle:+sum('damageOnTurtle').toFixed(2),
   hpAgainstSniper:+sum('damageOnSniper').toFixed(2),
   executionsAgainstArmoredRoles:sum('executionAgainstArmor'),
   realPersistentFronts:sum('truePersistentFronts'),
   realSeparatedWindows:sum('realSeparatedWindows'),
   trueGoblinHp:+sum('goblinHp').toFixed(2),
   trueKnightHp:+sum('knightHp').toFixed(2),
   byPopulation:Object.fromEntries([20,40].map(count=>[count,{
    persistent:ids.filter(i=>fixtures[i].count===count).reduce((n,i)=>n+receipts[name][i].truePersistentFronts,0),
    separated:ids.filter(i=>fixtures[i].count===count).reduce((n,i)=>n+receipts[name][i].realSeparatedWindows,0)
   }]))
  };
 }
}
for(const name of names.slice(1)){
 assert(summary[name].standard.byPopulation[20].persistent>=1,
  'cannot erase actual small-army front '+name);
 assert(summary[name].standard.byPopulation[40].persistent>=40,
  'existing nontrivial full-pop independent fight gate '+name);
}
assert(summary.baseline.prespecified.trueExecutions>0,'real L4 Execution must be exercised');
const report={
 status:'L4 Assassin Execution source-only trigger study, NOT A GAMEPLAY CHANGE',
 method:'4 source variants × 104 fully terminal matches: 32 standard, 24 prespecified selected L4 Assassin, 24 unseen seeds, 24 noKnight/armored heavy. Pre-hit real Execution events, true backstab count, actual post-armor/dodge/HP-cap direct HP by selected L4 Assassins, meaningful role counter damage, positive-attacker-HP independent fronts and 80/120/300 no-Assassin 1x/10x state parity. L5 solo full physical frame SHA unchanged; observer full frame SHA unchanged.',
 warning:'Do not accept an L4 buff merely for increasing trigger counts. Need win/counter/front stability, Fighter Guide and PWA integrity if later shipping. Match recordings use Node VM, not iPhone 14 Pro Max Safari.',
 summary,fixtures};
if(process.env.QA_L4_ASSASSIN_RECEIPT)fs.writeFileSync(process.env.QA_L4_ASSASSIN_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('ASSASSIN L4 SOURCE STUDY '+JSON.stringify(summary));
console.log('PASS: four versions x104 real terminal matches, original L5 frame SHA, 80/120/300 non-Assassin physical parity; no gameplay patch');
