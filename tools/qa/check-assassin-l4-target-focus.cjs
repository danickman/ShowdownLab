'use strict';
// Historical fixed-fixture research: preserve accepted pre-Impact Goose source.
// New all-roster first-tier tests exercise current live Goose Impact separately.
// L4 Assassin target-continuity source study: never imported by game.
// Uses the shipping simulator and real terminal matches, no synthetic outcomes.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const core=read('v3/legacy-sim-core.js'),ult=read('tools/qa/fixtures/goose-before-impact-ultimate.js'),evo=read('v3/evolution-rules.js');
const once=(s,a,b)=>{assert.equal(s.split(a).length,2,'source drift '+a.slice(0,80));return s.replace(a,b)};
const choose="function assassinStep(u){const[t,d]=nearest(u,true);if(!t)return;trackTarget(u,t.id);";
const action="u.special--;if(d>r){if(u.special<=0&&d<.42){u.action='vanish'";
const back="u.backstabTick=tick;";
const resolved="const dealt=Math.min(t.hp,dmg);";
const execute="cue(a,'execution',tick,t);return damage";
const variants={baseline:0,woundedFocus06:.06,woundedFocus12:.12};
const sources={};
for(const [name,margin] of Object.entries(variants)){
 let c=core;
 if(margin)c=once(c,choose,
  "function assassinStep(u){let[t,d]=nearest(u,true);if(!t)return;"+
  "if(u.level===4){const v=units.find(q=>q.id===u._assassinFocus&&q.hp>0&&q.team!==u.team&&BACK.has(q.type)&&q.burrow<=0);"+
  "if(v&&v.hp/v.maxHp<.4){const vd=Math.hypot(v.x-u.x,v.y-u.y);if(vd<=d+"+margin+"){t=v;d=vd}}"+
  "u._assassinFocus=t.id}trackTarget(u,t.id);");
 let observed=once(c,action,
  "u.special--;window.__qaChoice({id:u.id,level:u.level,team:u.team,tick,target:t.id,role:t.type,hpFraction:t.hp/t.maxHp,dist:d,reach:r,cooldown:u.cooldown,special:u.special,action:d>r?(u.special<=0&&d<.42?'vanish':'stalk'):(u.cooldown<=0?'backstab':'disengage')},units);"+
  "if(d>r){if(u.special<=0&&d<.42){u.action='vanish'");
 observed=once(observed,back,back+"window.__qaBack({id:u.id,level:u.level,team:u.team,tick,target:t.id,targetRole:t.type});");
 observed=once(observed,resolved,resolved+"if(dealt>0&&a&&a.team!==t.team)window.__qaHit({attacker:a.id,level:a.level,role:a.type,team:a.team,tick,target:t.id,targetRole:t.type,damage:dealt,x:t.x,y:t.y});");
 const watchedUlt=once(ult,execute,"window.__qaExecution({id:a.id,team:a.team,level:a.level,tick,targetRole:t.type});"+execute);
 sources[name]={raw:c,observed,watchedUlt};
}
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
const g=read('tools/qa/check-role-fronts-baseline.cjs'),start=g.indexOf('const cell='),stop=g.indexOf('// Synthetic truth fixtures',start);
assert(start>=0&&stop>start,'authentic HP-damage graph must exist');
const damageFronts=vm.runInNewContext(g.slice(start,stop)+';damageFronts',{Math});
function simulate(c,name,observe=true){
 let now=0,next=0,queue=new Map(),state,errors=[],hits=[],backstabs=[],executions=[];
 const hash=c.hash?crypto.createHash('sha256'):null;
 const counters={decisions:0,stalk:0,vanish:0,backstabDecision:0,disengage:0,targetSwitches:0,woundedBacklineAbandons:0,
  stuckOutsideReachWithReadyAttack:0,reachableWoundedBacklineNotSelected:0,chosenWoundedBackline:0,armoredSelected:0};
 const previous=new Map();
 const env={window:null,Math,performance:{now:()=>now},requestAnimationFrame(fn){let id=++next;queue.set(id,fn);return id},
  cancelAnimationFrame(id){queue.delete(id)},console:{error:(...s)=>errors.push(s.join(' '))}};
 env.window=env;
 env.__qaHit=x=>hits.push(x);
 env.__qaBack=x=>backstabs.push(x);
 env.__qaExecution=x=>executions.push(x);
 env.__qaChoice=(x,units)=>{
  if(x.level!==4||(c.kind!=='standard'&&x.team!==c.side))return;
  counters.decisions++;counters[x.action==='backstab'?'backstabDecision':x.action]++;
  if(x.dist>x.reach&&x.cooldown<=0)counters.stuckOutsideReachWithReadyAttack++;
  if(['beetank','turtle','knight'].includes(x.role))counters.armoredSelected++;
  if(x.hpFraction<.4&&['dragon','sniper'].includes(x.role))counters.chosenWoundedBackline++;
  const possible=units.some(u=>u.hp>0&&u.team!==x.team&&(u.type==='sniper'||u.type==='dragon')&&u.hp/u.maxHp<.4&&Math.hypot(u.x-units.find(v=>v.id===x.id).x,u.y-units.find(v=>v.id===x.id).y)<=x.dist+.12);
  if(possible&&!(x.hpFraction<.4&&['dragon','sniper'].includes(x.role)))counters.reachableWoundedBacklineNotSelected++;
  const prev=previous.get(x.id);
  if(prev&&prev.target!==x.target){
   counters.targetSwitches++;
   const from=units.find(u=>u.id===prev.target);
   if(from&&from.hp>0&&(from.type==='sniper'||from.type==='dragon')&&from.hp/from.maxHp<.4)counters.woundedBacklineAbandons++;
  }
  previous.set(x.id,{target:x.target});
 };
 vm.createContext(env);
 vm.runInContext(evo,env);vm.runInContext(observe?sources[name].watchedUlt:ult,env);
 vm.runInContext(observe?sources[name].observed:sources[name].raw,env);
 const sim=env.LegacySimCore;
 const roster=team=>Array.from({length:c.count/2},(_,i)=>{
  let type,level;
  if(c.solo){type=team===c.side?'assassin':c.solo;level=c.level||5}
  else if(c.kind==='noL4'){type=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'][i%10];level=[1,2,5][i%3]}
  else if(c.kind==='standard'){type=standard[c.mode][team==='blue'?(c.mirror?1:0):(c.mirror?0:1)][i%10];level=[1,2,4,5][i%4]}
  else{type=(team===c.side?selected[c.mode].ours:selected[c.mode].foe)[i%10];level=team===c.side&&type==='assassin'?4:4}
  return{type,level,squad:Math.floor(i/5)};
 });
 sim.configure({seed:c.seed,speed:c.speed||10,onState:()=>{}});
 sim.deploy(roster('blue'),roster('red'));sim.setRunning(true);
 for(let i=0;i<(c.frames||(c.kind==='noL4'?15:c.solo?600:700));i++){
  now+=16.667;const calls=[...queue.values()];queue.clear();for(const fn of calls)fn(now);
  state=sim.getState();if(hash)hash.update(JSON.stringify(state)+'\n');
  if(state.winner)break;
 }
 assert.deepEqual(errors,[],'source simulator threw '+JSON.stringify({c,name}));
 assert(state&&state.units.length===c.count&&state.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.x)&&Number.isFinite(u.y)), 'physical state finite');
 if(c.kind!=='noL4')assert(state.winner,'every match must actually finish '+JSON.stringify({c,name}));
 if(!observe)return{digest:hash?.digest('hex'),winner:state.winner};
 const chosen=hits.filter(h=>h.role==='assassin'&&h.level===4&&(c.kind==='standard'||h.team===c.side));
 const bs=backstabs.filter(h=>h.level===4&&(c.kind==='standard'||h.team===c.side));
 const exec=executions.filter(h=>h.level===4&&(c.kind==='standard'||h.team===c.side));
 const sum=(items,k)=>items.reduce((n,v)=>n+v[k],0);
 const fronts=c.solo||c.kind==='noL4'?null:damageFronts(hits,state.tick,30);
 return{winner:state.winner,win:state.winner===c.side,digest:hash?.digest('hex'),
  realAssassinHp:sum(chosen,'damage'),damageOnSniper:sum(chosen.filter(h=>h.targetRole==='sniper'),'damage'),
  damageOnDragon:sum(chosen.filter(h=>h.targetRole==='dragon'),'damage'),
  damageOnBeetank:sum(chosen.filter(h=>h.targetRole==='beetank'),'damage'),
  damageOnTurtle:sum(chosen.filter(h=>h.targetRole==='turtle'),'damage'),
  backstabs:bs.length,executions:exec.length,
  realFronts:fronts?.consecutivePersistentMultiFrontWindows||0,
  realSeparated:fronts?.windowsWithTwoGeographicallySeparatedDamageComponents||0,
  knightHp:sum(hits.filter(h=>h.role==='knight'),'damage'),goblinHp:sum(hits.filter(h=>h.role==='goblin'),'damage'),...counters};
}
// Mandatory exact same observed/unobserved physical-frame states for each candidate.
for(const name of Object.keys(variants))for(const count of [20,40]){
 const c={kind:'standard',count,mode:'mixed',seed:1337,mirror:false,hash:true};
 assert.equal(simulate(c,name).digest,simulate(c,name,false).digest,'read-only observation changed physical state '+name+'/'+count);
}
// All L5 solo counters AND all no-L4 crowd populations must stay physically identical to current QA.
for(const foe of ['beetank','turtle','sniper','dragon','knight'])for(const seed of [1337,9917]){
 const c={kind:'selected',count:2,solo:foe,side:'blue',level:5,seed,hash:true};
 const live=simulate(c,'baseline',false);
 for(const name of Object.keys(variants).slice(1))assert.equal(simulate(c,name,false).digest,live.digest,'L5 solo physical drift '+name+'/'+foe);
}
for(const count of [80,120,300])for(const speed of [1,10]){
 const c={kind:'noL4',count,seed:1337,speed,hash:true};
 const live=simulate(c,'baseline',false);
 for(const name of Object.keys(variants).slice(1))assert.equal(simulate(c,name,false).digest,live.digest,'no-L4 physical drift '+name+'/'+count+'/'+speed);
}
const fixtures=[];
for(const count of [20,40])for(const mode of Object.keys(standard))
 for(const seed of [1337,9917])for(const mirror of [false,true])fixtures.push({kind:'standard',count,mode,seed,mirror});
for(const mode of ['mixed','backline','swarm'])
 for(const count of [20,40])for(const seed of [1337,9917])for(const side of ['blue','red'])
  fixtures.push({kind:'selected',phase:'prespecified',count,mode,seed,side});
for(const mode of ['mixed','backline','swarm'])
 for(const count of [20,40])for(const seed of [2017,4201])for(const side of ['blue','red'])
  fixtures.push({kind:'selected',phase:'unseen-seeds',count,mode,seed,side});
for(const mode of ['noKnight','armored'])
 for(const count of [20,40])for(const seed of [1337,9917,4201])for(const side of ['blue','red'])
  fixtures.push({kind:'selected',phase:'counter-stress',count,mode,seed,side});
assert.equal(fixtures.length,104,'32 standard + 24 first +24 holdout +24 stress');
const names=Object.keys(variants),receipts=Object.fromEntries(names.map(n=>[n,[]]));
for(const f of fixtures)for(const n of names)receipts[n].push(simulate(f,n));
const summary={},sums=['realAssassinHp','damageOnSniper','damageOnDragon','damageOnBeetank','damageOnTurtle','backstabs','executions','realFronts','realSeparated','knightHp','goblinHp','decisions','stalk','vanish','backstabDecision','disengage','targetSwitches','woundedBacklineAbandons','stuckOutsideReachWithReadyAttack','reachableWoundedBacklineNotSelected','chosenWoundedBackline','armoredSelected'];
for(const name of names){
 summary[name]={};
 for(const phase of ['standard','prespecified','unseen-seeds','counter-stress']){
  const indices=fixtures.flatMap((f,i)=>(f.kind==='standard'?'standard':f.phase)===phase?[i]:[]);
  const v=receipts[name],base=receipts.baseline;
  const x={completed:indices.length,wins:phase==='standard'?null:indices.filter(i=>v[i].win).length,
   flippedWinners:indices.filter(i=>v[i].winner!==base[i].winner).length,
   perPopulation:Object.fromEntries([20,40].map(count=>[count,{
    persistent:indices.filter(i=>fixtures[i].count===count).reduce((s,i)=>s+v[i].realFronts,0),
    separated:indices.filter(i=>fixtures[i].count===count).reduce((s,i)=>s+v[i].realSeparated,0)}]))};
  for(const key of sums)x[key]=+indices.reduce((s,i)=>s+v[i][key],0).toFixed(2);
  summary[name][phase]=x;
 }
}
assert(summary.baseline.standard.perPopulation[20].persistent>=1,'current genuine 20-fighter fronts lost');
assert(summary.baseline.standard.perPopulation[40].persistent>=40,'current genuine 40-fighter fronts lost');
const verdict={};
for(const name of names.slice(1)){
 const x=summary[name],b=summary.baseline;
 const tests={
  standard20Persistent:x.standard.perPopulation[20].persistent>=b.standard.perPopulation[20].persistent,
  standard40Persistent:x.standard.perPopulation[40].persistent>=b.standard.perPopulation[40].persistent,
  standard20Separated:x.standard.perPopulation[20].separated>=b.standard.perPopulation[20].separated,
  standard40Separated:x.standard.perPopulation[40].separated>=b.standard.perPopulation[40].separated,
  selectedWinNonRegression:x.prespecified.wins>=b.prespecified.wins,
  unseenWinNonRegression:x['unseen-seeds'].wins>=b['unseen-seeds'].wins,
  counterWinNonRegression:x['counter-stress'].wins>=b['counter-stress'].wins,
  accessImprovement:x.prespecified.realAssassinHp>b.prespecified.realAssassinHp*1.05
 };
 verdict[name]={...tests,status:Object.values(tests).every(Boolean)?'REVIEW_ONLY':'REJECTED'};
}
const report={status:'SOURCE ONLY: chosen-target continuity is not released gameplay',
 method:'3 source versions × 104 true terminal games; 32 standard and 72 selected mixed/backline/swarm/new seed/counter-stress; real Assassin L4 target decisions, repeated switching, wounded-backline abandonments, actual HP on Sniper/Dragon/Turtle/Beetank, full terminal winners, independently persistent actual HP-damaging fronts, exact source observer parity, unchanged L5 solo and no-L4 80/120/300 physical states.',
 caution:'Observer measures decisions as ticks, NOT independent executed attacks. Target focus is compared from a stable chosen backline ID, not overwritten step() current target. Real iPhone 14 Pro Max Safari still unverified. REJECTED research candidates must remain unshipped.',summary,verdict,fixtures};
if(process.env.QA_ASSASSIN_FOCUS_RECEIPT)fs.writeFileSync(process.env.QA_ASSASSIN_FOCUS_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('ASSASSIN TARGET CONTINUITY RECEIPT '+JSON.stringify({summary,verdict}));
console.log('PASS: original simulator + matched 312 true terminal source games; full L5 & 300 no-L4 parity; no runtime gameplay changes');
