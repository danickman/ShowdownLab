'use strict';
// Evolution-choice opportunity cost: unchanged production combat source.
// An upgrade choice vs +1/+2 new same-role squad members. Real full terminal
// results, physical guard/reflect HP and true independent HP-damaging fronts.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const evo=read('v3/evolution-rules.js'),ult=read('v3/ultimate-abilities.js'),core=read('v3/legacy-sim-core.js');
const replace=(s,a,b)=>{assert.equal(s.split(a).length,2,'expected single source control anchor '+a.slice(0,80));return s.replace(a,b)};
const graph=read('tools/qa/check-role-fronts-baseline.cjs'),g0=graph.indexOf('const cell='),g1=graph.indexOf('// Synthetic truth fixtures',g0);
assert(g0>=0&&g1>g0);const damageFronts=vm.runInNewContext(graph.slice(g0,g1)+';damageFronts',{Math});
const guardianAnchor="if(t.hp/t.maxHp<.6&&shelter>protection){damage*=1-shelter;cue(guardian,'shelter',tick,t)}";
const watchedUlt=replace(ult,guardianAnchor,
 "if(t.hp/t.maxHp<.6&&shelter>protection){window.__qaGuardian({guardianId:guardian.id,team:guardian.team,defenderId:t.id,level:guardian.level,protection,strength:shelter});damage*=1-shelter;cue(guardian,'shelter',tick,t)}");
let watchedCore=replace(core,'const dealt=Math.min(t.hp,dmg);',
 'const dealt=Math.min(t.hp,dmg);window.__qaResolved({id:t.id,remaining:t.hp,damage:dmg});'+
 'if(dealt>0&&window.__qaReflecting)window.__qaReflect({...window.__qaReflecting,damage:dealt});'+
 'if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,attacker:a.id,level:a.level,role:a.type,team:a.team,target:t.id,targetRole:t.type,damage:dealt,x:t.x,y:t.y});');
watchedCore=replace(watchedCore,
 'if(!secondary)for(const hit of ultimate.afterHit(a,t,dealt,units,tick))hurt(hit.target,hit.damage,hit.source,true)',
 "if(!secondary)for(const hit of ultimate.afterHit(a,t,dealt,units,tick)){window.__qaReflecting=hit.source===null&&t.type==='turtle'?{id:t.id,team:t.team,level:t.level}:null;hurt(hit.target,hit.damage,hit.source,true);window.__qaReflecting=null}");
const opponents={
 swarm:['goblin','goblin','goblin','goblin','goose','goose','barbarian','knight','mole','sniper'],
 backline:['sniper','sniper','sniper','dragon','dragon','knight','knight','beetank','turtle','mole'],
 armored:['beetank','beetank','beetank','turtle','turtle','knight','knight','dragon','barbarian','sniper']
};
const selected=['assassin','turtle','beetank'],paths=['upgrade','addOne','addTwo'];
function match(c,choice,observe=true){
 let now=0,next=0,queue=new Map(),state,errors=[],hits=[],reflects=[],saves=[],pending=null;
 const hash=c.hash?crypto.createHash('sha256'):null;
 const env={window:null,Math,performance:{now:()=>now},
  requestAnimationFrame(fn){const id=++next;queue.set(id,fn);return id},
  cancelAnimationFrame(id){queue.delete(id)},console:{error:(...a)=>errors.push(a.join(' '))}};
 env.window=env;
 env.__qaHit=x=>hits.push(x);env.__qaReflect=x=>reflects.push(x);
 env.__qaGuardian=x=>{assert.equal(pending,null,'guard event before prior resolved');pending=x};
 env.__qaResolved=x=>{if(!pending)return;assert.equal(x.id,pending.defenderId,'sheltered defender mismatch');
  const p=pending;
  // Post-dodge, post-shell, and HP-capped marginal saved HP over what
  // the strongest Knight Bastion would otherwise have prevented.
  const noGuardian=x.damage*(1-p.protection)/(1-p.strength);
  const saved=Math.max(0,Math.min(x.remaining,noGuardian)-Math.min(x.remaining,x.damage));
  assert(Number.isFinite(saved)&&saved>=0,'physical Guardian saved HP invalid');
  saves.push({...p,saved});pending=null;
 };
 vm.createContext(env);vm.runInContext(evo,env);vm.runInContext(observe?watchedUlt:ult,env);
 vm.runInContext(observe?watchedCore:core,env);
 const half=c.count/2,team=c.side;
 const start=[c.role,c.role,c.role,'knight','sniper','dragon','mole','goblin','goose','barbarian'];
 const own=Array.from({length:half},(_,i)=>({type:start[i%start.length],
  level:start[i%start.length]===c.role?(choice==='upgrade'?c.tier+1:c.tier):4,
  squad:Math.floor(i/5)}));
 if(choice==='addOne'||choice==='addTwo')for(let j=0;j<(choice==='addOne'?1:2);j++)
  own.push({type:c.role,level:c.tier,squad:Math.floor((half+j)/5)});
 const enemy=Array.from({length:half},(_,i)=>({type:opponents[c.mode][i%10],level:4,squad:Math.floor(i/5)}));
 const sim=env.LegacySimCore;
 sim.configure({seed:c.seed,speed:10,onState:()=>{}});
 sim.deploy(team==='blue'?own:enemy,team==='blue'?enemy:own);sim.setRunning(true);
 for(let frame=0;frame<700;frame++){
  now+=16.667;const callbacks=[...queue.values()];queue.clear();
  for(const cb of callbacks)cb(now);state=sim.getState();
  if(hash)hash.update(JSON.stringify(state)+'\n');
  if(state.winner)break;
 }
 assert.deepEqual(errors,[],'sim errors '+JSON.stringify({c,choice}));
 assert(state?.winner,'must resolve true match winner '+JSON.stringify({c,choice}));
 assert.equal(state.units.length,c.count+(choice==='upgrade'?0:choice==='addOne'?1:2),'physical population mismatch');
 assert.equal(pending,null,'unresolved physical shelter');
 if(!observe)return{digest:hash?.digest('hex'),winner:state.winner};
 const fronts=damageFronts(hits,state.tick,30);
 const ownHit=hits.filter(x=>x.team===team),roleHits=ownHit.filter(x=>x.role===c.role),
  reflect=reflects.filter(x=>x.team===team&&x.level>0),
  saved=saves.filter(x=>x.team===team),
  sum=(a,k)=>a.reduce((n,x)=>n+x[k],0);
 return{winner:state.winner,digest:hash?.digest('hex'),won:state.winner===team,realFronts:fronts.consecutivePersistentMultiFrontWindows,
  realSeparated:fronts.windowsWithTwoGeographicallySeparatedDamageComponents,
  roleDirectHp:sum(roleHits,'damage'),roleReflectedHp:sum(reflect.filter(x=>c.role==='turtle'),'damage'),
  savedAllyHp:sum(saved.filter(x=>c.role==='turtle'),'saved'),otherAllyHp:sum(ownHit.filter(x=>x.role!==c.role),'damage'),
  roleFighters:own.filter(x=>x.type===c.role).length,teamPopulation:own.length,
  knockoutTick:state.tick,realHpDamageEvents:hits.length};
}
// A read-only observer must preserve the exact complete physical RAF trace.
for(const c of [{role:'assassin',tier:3,count:20,mode:'backline',seed:1337,side:'blue',hash:true},
 {role:'turtle',tier:4,count:40,mode:'armored',seed:2017,side:'red',hash:true},
 {role:'beetank',tier:4,count:20,mode:'swarm',seed:1337,side:'blue',hash:true}])
 for(const strategy of paths)
 assert.equal(match(c,strategy,true).digest,match(c,strategy,false).digest,'observer changed state '+JSON.stringify({c,strategy}));
const fixtures=[];
for(const role of selected)for(const tier of [3,4])
 for(const mode of Object.keys(opponents))for(const count of [20,40])
  for(const seed of [1337,2017])for(const side of ['blue','red'])
   fixtures.push({role,tier,mode,count,seed,side});
assert.equal(fixtures.length,144,'3 roles ×2 tiers ×3 modes ×2 populations ×2 seeds ×2 sides');
const records=[];
for(const c of fixtures)records.push({c,result:Object.fromEntries(paths.map(p=>[p,match(c,p)]))});
function summarise(role,tier){
 const tests=records.filter(r=>r.c.role===role&&r.c.tier===tier),report={};
 for(const p of paths){
  const x=tests.map(r=>r.result[p]),sum=k=>x.reduce((n,r)=>n+r[k],0);
  report[p]={matches:x.length,wins:x.filter(r=>r.won).length,
   directHp:+sum('roleDirectHp').toFixed(2),realTurtleReflectedHp:+sum('roleReflectedHp').toFixed(2),
   marginalGuardianSavedHp:+sum('savedAllyHp').toFixed(2),
   allyDirectHp:+sum('otherAllyHp').toFixed(2),
   realPersistentFronts:sum('realFronts'),realSeparatedWindows:sum('realSeparated'),
   byMode:Object.fromEntries(Object.keys(opponents).map(mode=>[mode,{
    wins:tests.filter(t=>t.c.mode===mode&&t.result[p].won).length,
    realFronts:tests.filter(t=>t.c.mode===mode).reduce((n,t)=>n+t.result[p].realFronts,0)
   }])),
   byPopulation:Object.fromEntries([20,40].map(pop=>[pop,{
    wins:tests.filter(t=>t.c.count===pop&&t.result[p].won).length,
    realFronts:tests.filter(t=>t.c.count===pop).reduce((n,t)=>n+t.result[p].realFronts,0),
    separated:tests.filter(t=>t.c.count===pop).reduce((n,t)=>n+t.result[p].realSeparated,0)
   }]))
  };
 }
 report.pairedWins=Object.fromEntries(['addOne','addTwo'].map(p=>[p,{
  upgradeWinsWhenRecruitLoses:tests.filter(t=>t.result.upgrade.won&&!t.result[p].won).length,
  recruitWinsWhenUpgradeLoses:tests.filter(t=>!t.result.upgrade.won&&t.result[p].won).length
 }]));
 return report;
}
const matrix=Object.fromEntries(selected.map(role=>[role,Object.fromEntries([3,4].map(tier=>[tier+'to'+(tier+1),summarise(role,tier)]))]));
const report={
 title:'True draft-choice evolution investment ROI, not source gameplay experiment',
 state:'Current live QA physics only. Compare 3 equal-cost selectable types of a draft-choice consequence: evolve every chosen family unit L3→L4 or L4→L5, vs recruit +1 or +2 copies without evolution. No claim these are the actual amounts of every generated Draft offer.',
 methodology:'432 fully terminal matches from 144 mirrored seeds/20-40 formations x three choices, 3 classes x L3/L4 opening x opposing swarm/backline/armored. Real damage and actual team winners; sources exclude synthetic geographic fronts. Nonstacking Guardian marginal saved HP is computed after dodging/HP cap and net of strongest otherwise eligible Knight protection. Ricochet damage credits actual secondary HP, distinct from direct attacker HP. Extra recruit models inherently add 1 or 2 physical fighters and are not forced into fixed 20/40 states.',
 notes:'Matches sample two seeds and should motivate, not certify, draft value. Differences between upgrades/recruit options reflect both team population and statistical upgrades; direct HP is not interchangeable with defense saved HP. Primary physical iPhone 14 Pro Max Safari acceptance open.',
 matrix,fixtures
};
if(process.env.QA_EVOLUTION_CHOICE_RECEIPT)fs.writeFileSync(process.env.QA_EVOLUTION_CHOICE_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('EVOLUTION CHOICE INVESTMENT ACTUAL RESULT '+JSON.stringify(matrix));
console.log('PASS: 432 fully terminal actual simulator draft-choice ROI games, true HP front & physical defender utility, observer/full trace SHA');
