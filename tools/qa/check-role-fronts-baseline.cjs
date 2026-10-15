'use strict';
// B1/B2: QA-only role contribution + genuinely damage-positive battle fronts.
// NO behavior/stat change, no PWA import. Instrumented RC4 must match exact
// hash of every original simulator state under seed/formation/speed.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=n=>fs.readFileSync(path.join(root,'v3',n+'.js'),'utf8');
const coreSource=read('legacy-sim-core'),types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const damageAnchor='const dealt=Math.min(t.hp,dmg);';
const tickAnchor='}separate(false)}function winner(){';
assert.equal(coreSource.split(damageAnchor).length,2,'damage anchor must be unique');
assert.equal(coreSource.split(tickAnchor).length,2,'tick anchor must be unique');
const instrumentation=coreSource.replace(damageAnchor,damageAnchor+"if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,attacker:a.id,target:t.id,role:a.type,team:a.team,level:a.level,damage:dealt,kill:dealt>=t.hp,x:t.x,y:t.y,secondary:!!secondary});")
 .replace(tickAnchor,'}window.__qaTick(tick,units);separate(false)}function winner(){');
const PURSUIT=new Set(['stalk','move','march','rage_charge','charge','rush','zigzag','bulldoze','trudge','scuttle','waddle','shell_roll','burrow','ram','dig','guard']);
const ATTACK=new Set(['attack','backstab','buttstroke','fire','claw_swipe','claw','erupt','horn','snap','shell_slam','stab','peck','rage_swing','axe_swing','swing','bite','bash']);
const SPECIAL=new Set(['vanish','backstab','fire_windup','fire','aim','reload','honk','burrow','erupt','shell','shell_slam','ram','rage_swing','charge']);
const cell=(x,y)=>Math.max(0,Math.min(3,Math.floor(x*4)))+':'+Math.max(0,Math.min(2,Math.floor(y*3)));
function damageFronts(hits,maxTick,windowTicks=30){
 const bins=new Map();
 for(const h of hits){const k=Math.floor((h.tick-1)/windowTicks);if(!bins.has(k))bins.set(k,[]);bins.get(k).push(h)}
 const windows=[];
 for(let w=0;w<Math.ceil(maxTick/windowTicks);w++){
  const events=bins.get(w)||[],parent=new Map(),rank=new Map();
  const find=x=>{if(!parent.has(x)){parent.set(x,x);rank.set(x,0)}let p=parent.get(x);while(p!==parent.get(p))p=parent.get(p);while(x!==p){let q=parent.get(x);parent.set(x,p);x=q}return p};
  const union=(a,b)=>{a=find(a);b=find(b);if(a===b)return;if(rank.get(a)<rank.get(b))[a,b]=[b,a];parent.set(b,a);if(rank.get(a)===rank.get(b))rank.set(a,rank.get(a)+1)};
  for(const h of events)union(h.attacker,h.target);
  const groups=new Map();
  for(const h of events){const root=find(h.attacker);if(!groups.has(root))groups.set(root,{hits:0,damage:0,x:0,y:0,members:new Set(),teams:new Set(),roles:new Set(),cells:new Set()});
   const g=groups.get(root);g.hits++;g.damage+=h.damage;g.x+=h.x*h.damage;g.y+=h.y*h.damage;g.members.add(h.attacker);g.members.add(h.target);g.teams.add(h.team);g.teams.add(h.team==='blue'?'red':'blue');g.roles.add(h.role);g.cells.add(cell(h.x,h.y))}
  const components=[...groups.values()].map(g=>({hits:g.hits,damage:+g.damage.toFixed(2),x:g.x/g.damage,y:g.y/g.damage,actors:g.members.size,
    cells:[...g.cells].sort(),roles:[...g.roles].sort(),members:[...g.members].sort((a,b)=>a-b)}));
  const substantial=components.filter(g=>g.hits>=2&&g.actors>=2&&g.damage>0);
  let separatedPairs=0;
  for(let i=0;i<substantial.length;i++)for(let j=i+1;j<substantial.length;j++){
   const a=substantial[i],b=substantial[j];
   if(Math.hypot(a.x-b.x,a.y-b.y)>=.18)separatedPairs++;
  }
  windows.push({fromTick:w*windowTicks+1,toTick:Math.min(maxTick,(w+1)*windowTicks),hits:events.length,totalDamage:+events.reduce((n,h)=>n+h.damage,0).toFixed(2),
   components:components.length,substantial:substantial.length,separatedPairs,damageCells:[...new Set(events.map(h=>cell(h.x,h.y)))].sort(),
   groups:substantial.map(g=>({hits:g.hits,damage:g.damage,x:+g.x.toFixed(3),y:+g.y.toFixed(3),actors:g.actors,cells:g.cells,members:g.members}))});
 }
 let persistence=0;
 for(let i=1;i<windows.length;i++){const before=windows[i-1],after=windows[i];
  if(!before.separatedPairs||!after.separatedPairs)continue;
  const matching=after.groups.filter(g=>before.groups.some(h=>Math.hypot(g.x-h.x,g.y-h.y)<.16&&g.members.some(id=>h.members.includes(id))));
  if(matching.length>=2&&Math.hypot(matching[0].x-matching[1].x,matching[0].y-matching[1].y)>=.18)persistence++;
 }
 return{windowTicks,totalWindows:windows.length,damageWindows:windows.filter(w=>w.hits>0).length,
  windowsWithTwoGeographicallySeparatedDamageComponents:windows.filter(w=>w.separatedPairs>0).length,
  consecutivePersistentMultiFrontWindows:persistence,
  maxSeparatedPairs:Math.max(0,...windows.map(w=>w.separatedPairs)),
  windows:windows.map(({groups,...row})=>row)};
}
// Synthetic truth fixtures guard against simply treating distance/aim as fighting.
const independent=[{tick:1,attacker:1,target:2,team:'blue',role:'sniper',damage:9,x:.15,y:.3},
{tick:2,attacker:1,target:2,team:'blue',role:'sniper',damage:9,x:.15,y:.3},
{tick:3,attacker:3,target:4,team:'red',role:'dragon',damage:14,x:.80,y:.7},
{tick:4,attacker:3,target:4,team:'red',role:'dragon',damage:14,x:.80,y:.7}];
assert.equal(damageFronts(independent,30).windowsWithTwoGeographicallySeparatedDamageComponents,1,'two separate damage fronts fixture');
assert.equal(damageFronts(independent.slice(0,2),30).windowsWithTwoGeographicallySeparatedDamageComponents,0,'one real fight is not two fronts');
assert.equal(damageFronts([],30).windowsWithTwoGeographicallySeparatedDamageComponents,0,'threat-only is not real battle');
const modes={
 mixed:{blue:types,red:types.slice().reverse()},
 swarm:{blue:['goblin','goose','assassin','goblin','knight','barbarian','mole','sniper','goblin','goose'],
        red:['goblin','goblin','turtle','beetank','dragon','goose','knight','barbarian','mole','sniper']},
 heavy:{blue:['beetank','turtle','knight','dragon','barbarian','beetank','turtle','sniper','mole','assassin'],
        red:['dragon','beetank','barbarian','turtle','knight','sniper','assassin','goblin','goose','mole']},
 ranged:{blue:['sniper','dragon','sniper','knight','turtle','assassin','goose','beetank','goblin','mole'],
         red:['sniper','dragon','dragon','knight','beetank','assassin','goblin','goose','barbarian','turtle']},
 assassinAccess:{blue:['assassin','assassin','assassin','knight','goblin','mole','sniper','dragon','beetank','goose'],
        red:['sniper','dragon','sniper','turtle','knight','beetank','goose','goblin','barbarian','mole']}
};
const roster=(mode,count,mirror,side)=>{
 const pattern=modes[mode],list=(mirror?(side==='blue'?pattern.red:pattern.blue):pattern[side]);
 return Array.from({length:count/2},(_,i)=>({type:list[i%list.length],level:[1,2,3,4,5][i%5],squad:Math.floor(i/6)}));
};
const makeCounters=()=>({aliveTicks:0,targetTicks:0,rangeTicks:0,attackTicks:0,pursuitTicks:0,stunnedTicks:0,hitReactionTicks:0,
 targetSwitches:0,actions:{},fighters:new Set(),attackingFighters:new Set(),pursuingFighters:new Set(),firstHitTick:null,
 firstDamageTick:null,hits:0,damage:0,kills:0,secondaryHits:0});
function simulate(source,{count,mode,mirror,seed,speed,frames},collect){
 let now=0,seq=0,queue=new Map(),errors=[],lastTick=0,winner=null;
 const stateHash=crypto.createHash('sha256'),byRole=new Map(),byFighter=new Map(),hits=[],roleLevel=new Map(),windows=[];
 const env={Math,window:null,performance:{now:()=>now},requestAnimationFrame(fn){const i=++seq;queue.set(i,fn);return i},
   cancelAnimationFrame(i){queue.delete(i)},console:{error:(...a)=>errors.push(a.join(' '))}};
 env.window=env;
 const ctr=(key,map=byRole)=>{if(!map.has(key))map.set(key,makeCounters());return map.get(key)};
 const first=new Map(),prevTarget=new Map();
 env.__qaHit=h=>{
  hits.push(h);const a=ctr(h.role),b=ctr(h.role+'@L'+h.level,roleLevel),f=ctr(h.attacker,byFighter);
  for(const o of [a,b,f]){o.damage+=h.damage;o.hits++;if(h.kill)o.kills++;if(h.secondary)o.secondaryHits++;if(o.firstDamageTick===null)o.firstDamageTick=h.tick}
 };
 env.__qaTick=(tick,units)=>{
  const byId=new Map(units.filter(u=>u.hp>0).map(u=>[u.id,u]));
  for(const u of units){
   const k=u.type;const role=ctr(k),level=ctr(k+'@L'+u.level,roleLevel),f=ctr(u.id,byFighter);
   if(!first.has(u.id))first.set(u.id,tick);
   const alive=u.hp>0,t=byId.get(u.target),hasTarget=alive&&t&&t.team!==u.team&&!(t.burrow>0);
   for(const a of [role,level,f]){
    a.fighters.add(u.id);
    if(alive){a.aliveTicks++;if(hasTarget){a.targetTicks++;if(Math.hypot(t.x-u.x,t.y-u.y)<=u.range/500)a.rangeTicks++}}
    if(alive&&PURSUIT.has(u.action)){a.pursuitTicks++;a.pursuingFighters.add(u.id)}
    if(alive&&ATTACK.has(u.action)){a.attackTicks++;a.attackingFighters.add(u.id);if(a.firstHitTick===null)a.firstHitTick=tick}
    if(alive&&u.stun>0)a.stunnedTicks++;
    if(alive&&u.action==='hit')a.hitReactionTicks++;
    if(alive){a.actions[u.action]=(a.actions[u.action]||0)+1}
    if(prevTarget.has(u.id)&&prevTarget.get(u.id)!==u.target)a.targetSwitches++;
   }
   prevTarget.set(u.id,u.target);
  }
 };
 vm.createContext(env);
 for(const dep of ['evolution-rules','ultimate-abilities'])vm.runInContext(read(dep),env,{filename:dep+'.js'});
 vm.runInContext(source,env,{filename:'core-role-audit.js'});
 const core=env.LegacySimCore;
 core.configure({seed,speed,onState:()=>{}});
 core.deploy(roster(mode,count,mirror,'blue'),roster(mode,count,mirror,'red'));
 core.setRunning(true);
 let samples=0;
 for(let frame=0;frame<frames;frame++){
  now+=16.667;const q=[...queue.values()];queue.clear();for(const fn of q)fn(now);
  const snap=core.getState();stateHash.update(JSON.stringify(snap)+'\n');lastTick=snap.tick;winner=snap.winner;samples++;
  if(winner)break;
 }
 assert.deepEqual(errors,[],'no simulation console error: '+mode+' '+count);
 const digest=stateHash.digest('hex');
 if(!collect)return{digest,samples,lastTick,winner};
 const serialize=x=>Object.fromEntries([...x].map(([role,o])=>[role,{aliveTicks:o.aliveTicks,targetTicks:o.targetTicks,rangeTicks:o.rangeTicks,
   attackTicks:o.attackTicks,pursuitTicks:o.pursuitTicks,stunnedTicks:o.stunnedTicks,hitReactionTicks:o.hitReactionTicks,
   targetSwitches:o.targetSwitches,actions:o.actions,fighters:o.fighters.size,attackingFighters:o.attackingFighters.size,
   pursuingFighters:o.pursuingFighters.size,firstAttackTick:o.firstHitTick,firstDamageTick:o.firstDamageTick,
   hits:o.hits,damage:+o.damage.toFixed(2),kills:o.kills,secondaryHits:o.secondaryHits,
   damagePer1000AliveTicks:+(1000*o.damage/Math.max(1,o.aliveTicks)).toFixed(2),
   damagePer1000TargetTicks:+(1000*o.damage/Math.max(1,o.targetTicks)).toFixed(2)}]));
 const hitFighters=new Set(hits.map(h=>h.attacker));const pursueFighters=[...byFighter].filter(([,o])=>o.pursuitTicks>0);
 const fronts=damageFronts(hits,lastTick,30);
 return{digest,samples,lastTick,winner,hits:hits.length,totalDamage:+hits.reduce((n,h)=>n+h.damage,0).toFixed(2),
   distinctDamageActors:hitFighters.size,distinctPursuers:pursueFighters.length,
   pursuingFightersWhoDealtDamage:pursueFighters.filter(([id])=>hitFighters.has(id)).length,
   role:serialize(byRole),roleLevel:serialize(roleLevel),
   fronts,censored:!winner,observationOnly:true};
}
const cases=[];
for(const count of (process.env.QA_ROLE_COUNTS||'20,40,80,120,180,300').split(',').map(Number)){
 assert([20,40,80,120,180,300].includes(count),'unsupported count');
 const all=count<=120?Object.keys(modes):['mixed'];
 const seeds=count<=120?[1337]:[1337];
 for(const mode of all)for(const seed of seeds)for(const mirror of [false,true]){
  const speed=count>=180?1:4,frames=count===300?14:count===180?24:count===120?48:count===80?60:72;
  cases.push({count,mode,mirror,seed,speed,frames});
 }
}
const receipt={status:'read-only B1+B2 baseline, no balancing or runtime patches',
 source:'current QA RC4 core',windowDefinition:'30 logical ticks per window; actual fighter-attributed positive damage, connected via attacker-target edges; separate components require >=2 hits and .18 normalized centroid distance',
 caveats:'Short 180/300 cases are censored. Stunned ticks measure experienced control NOT attribution to controlling enemy. Actions represent tick states and may be overwritten by hit reactions. No spell-cast observations in fixtures. Independent graph components require damage-positive edges, not physical contact. Components in same region are not independent fronts.',
 scenarios:[],parityCases:0,errors:[]};
for(const c of cases){
 const original=simulate(coreSource,c,false),audit=simulate(instrumentation,c,true);
 assert.equal(audit.digest,original.digest,'OBSERVATION CHANGED RC4 STATE '+JSON.stringify(c));
 assert.equal(audit.samples,original.samples,'sampling changed termination '+JSON.stringify(c));
 receipt.parityCases++;
 receipt.scenarios.push({...c,framesObserved:audit.samples,lastTick:audit.lastTick,winner:audit.winner,censored:audit.censored,
  totalDamage:audit.totalDamage,hitEvents:audit.hits,distinctDamageActors:audit.distinctDamageActors,
  distinctPursuers:audit.distinctPursuers,pursuingFightersWhoDealtDamage:audit.pursuingFightersWhoDealtDamage,
  role:audit.role,roleLevel:audit.roleLevel,fronts:audit.fronts,exactStateParity:true});
 console.log('ROLE FRONT CASE '+JSON.stringify({count:c.count,mode:c.mode,mirror:c.mirror,lastTick:audit.lastTick,hits:audit.hits,
  multiWindows:audit.fronts.windowsWithTwoGeographicallySeparatedDamageComponents,persistent:audit.fronts.consecutivePersistentMultiFrontWindows,assassinDamage:audit.role.assassin?.damage||0}));
}
receipt.summary=Object.fromEntries(types.map(type=>{
 const all=receipt.scenarios.filter(s=>s.count<=120&&s.role[type]);return[type,{scenarioCount:all.length,
  roleDamage:+all.reduce((n,s)=>n+(s.role[type]?.damage||0),0).toFixed(2),attackTicks:all.reduce((n,s)=>n+(s.role[type]?.attackTicks||0),0),
  pursueTicks:all.reduce((n,s)=>n+(s.role[type]?.pursuitTicks||0),0),hits:all.reduce((n,s)=>n+(s.role[type]?.hits||0),0)}];
}));
receipt.frontSummary=Object.fromEntries([20,40,80,120,180,300].map(n=>{
 const all=receipt.scenarios.filter(s=>s.count===n);return[n,{scenarios:all.length,
  withMultipleDamageFronts:all.filter(s=>s.fronts.windowsWithTwoGeographicallySeparatedDamageComponents>0).length,
  withPersistentMultipleFronts:all.filter(s=>s.fronts.consecutivePersistentMultiFrontWindows>0).length,
  windowsAcrossCases:all.reduce((v,s)=>v+s.fronts.totalWindows,0),
  simultaneousDamageWindows:all.reduce((v,s)=>v+s.fronts.windowsWithTwoGeographicallySeparatedDamageComponents,0)}];
}));
if(process.env.QA_ROLE_RECEIPT)fs.writeFileSync(process.env.QA_ROLE_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('ROLE FRONT SUMMARY '+JSON.stringify({parityCases:receipt.parityCases,role:receipt.summary,fronts:receipt.frontSummary}));
console.log('PASS: B1 role damage/opportunity and B2 damage-positive separated fight components, original/core parity');
