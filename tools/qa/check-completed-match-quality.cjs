'use strict';
// Completed-match, read-only measurable battle-quality budget.
// A "front" is connected by real positive HP-damage attacker→target edges;
// proximity, target intent, action names or merely visible VFX do not count.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const core=read('v3/legacy-sim-core.js');
const graph=read('tools/qa/check-role-fronts-baseline.cjs');
const graphStart=graph.indexOf('const cell='),graphEnd=graph.indexOf('// Synthetic truth fixtures',graphStart);
assert(graphStart>=0&&graphEnd>graphStart,'true damage-graph function moved; review quality metric');
const damageFronts=vm.runInNewContext(graph.slice(graphStart,graphEnd)+';damageFronts',{Math});
const ANCHOR='const dealt=Math.min(t.hp,dmg);';
assert.equal(core.split(ANCHOR).length,2,'true HP attribution instrument anchor changed');
const observed=core.replace(ANCHOR,ANCHOR+
 'if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,attacker:a.id,target:t.id,role:a.type,team:a.team,damage:dealt,x:t.x,y:t.y});');
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
function completed(source,c,watch=true){
 let now=0,nextId=0,queue=new Map(),errors=[],hits=[],snapshots=[],state=null,frames=0;
 const sha=crypto.createHash('sha256');
 const env={window:null,Math,performance:{now:()=>now},
  requestAnimationFrame(fn){const id=++nextId;queue.set(id,fn);return id},
  cancelAnimationFrame(id){queue.delete(id)},
  console:{error:(...parts)=>errors.push(parts.join(' '))}};
 env.window=env;env.__qaHit=h=>hits.push(h);vm.createContext(env);
 vm.runInContext(read('v3/evolution-rules.js'),env);
 vm.runInContext(read('v3/ultimate-abilities.js'),env);
 vm.runInContext(source,env,{filename:'completed-match-core.js'});
 const sim=env.LegacySimCore;
 const roster=side=>{
  const pat=rosters[c.mode][side==='blue'?(c.mirror?1:0):(c.mirror?0:1)];
  return Array.from({length:c.count/2},(_,i)=>({type:pat[i%pat.length],level:[1,2,4,5][i%4],squad:Math.floor(i/5)}));
 };
 sim.configure({seed:c.seed,speed:10,onState:()=>{}});
 const blueRoster=roster('blue'),redRoster=roster('red');
 const roleDeployed=Object.fromEntries(roles.map(r=>[r,0]));
 for(const entry of [...blueRoster,...redRoster])roleDeployed[entry.type]++;
 sim.deploy(blueRoster,redRoster);sim.setRunning(true);
 for(;frames<450;frames++){
  now+=16.667;const actions=[...queue.values()];queue.clear();for(const action of actions)action(now);
  state=sim.getState();sha.update(JSON.stringify(state)+'\n');
  // Side-specific living counts only: a read-only sample at each real RAF frame.
  const alive=state.units.filter(u=>u.hp>0);
  snapshots.push({tick:state.tick,alive:alive.length,
   blue:alive.filter(u=>u.team==='blue').length,red:alive.filter(u=>u.team==='red').length});
  if(state.winner){frames++;break}
 }
 assert.deepEqual(errors,[],'simulation errors '+JSON.stringify(c));
 assert(state&&state.winner,'battle did not actually terminate '+JSON.stringify(c));
 assert.equal(state.units.length,c.count,'fighters disappeared '+JSON.stringify(c));
 assert(state.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.x)&&Number.isFinite(u.y)),'nonfinite battle state');
 const trace=sha.digest('hex');
 if(!watch)return {trace,winner:state.winner,tick:state.tick};
 const fronts=damageFronts(hits,state.tick,30);
 const roleData=Object.fromEntries(roles.map(r=>[r,{hits:0,damage:0}]));
 const teamData={blue:{hits:0,damage:0},red:{hits:0,damage:0}};
 for(const h of hits){
  roleData[h.role].hits++;roleData[h.role].damage+=h.damage;
  teamData[h.team].hits++;teamData[h.team].damage+=h.damage;
 }
 for(const r of roles)roleData[r].damage=+roleData[r].damage.toFixed(2);
 for(const r of ['blue','red'])teamData[r].damage=+teamData[r].damage.toFixed(2);
 const bucket=()=>({totalWindows:0,damageWindows:0,separated:0,eligibleWindows:0,eligibleDamageWindows:0,eligibleSeparatedWindows:0,lopsidedWindows:0});
 const phase={early:bucket(),middle:bucket(),late:bucket()};
 for(const w of fronts.windows){
  const f=(w.fromTick+w.toTick)/(2*state.tick);
  const p=f<1/3?'early':f<2/3?'middle':'late';
  phase[p].totalWindows++;
  if(w.hits>0)phase[p].damageWindows++;
  if(w.separatedPairs>0)phase[p].separated++;
  // A viable opportunity requires living opponents; it is NOT a claim of fighting.
  const alive=snapshots.find(s=>s.tick>=w.fromTick)||snapshots.at(-1);
  if(alive.blue>=4&&alive.red>=4){
   phase[p].eligibleWindows++;
   if(w.hits>0)phase[p].eligibleDamageWindows++;
   if(w.separatedPairs>0)phase[p].eligibleSeparatedWindows++;
  }
  if(Math.min(alive.blue,alive.red)<=2)phase[p].lopsidedWindows++;
 }
 const center={early:1/6,middle:1/2,late:5/6};
 const phaseSurvivors=Object.fromEntries(Object.entries(center).map(([name,f])=>{
  const s=snapshots.find(s=>s.tick>=state.tick*f)||snapshots.at(-1);
  return [name,{blue:s.blue,red:s.red,alive:s.alive,bothAtLeast4:s.blue>=4&&s.red>=4,
   oneTeamAtMost2:Math.min(s.blue,s.red)<=2}];
 }));
 const lifespan={};
 for(const t of [25,50,75]){
  const s=snapshots.find(x=>x.tick>=state.tick*t/100)||snapshots.at(-1);
  lifespan[t]=s.alive;
 }
 return{trace,count:c.count,mode:c.mode,seed:c.seed,mirror:c.mirror,winner:state.winner,
  tick:state.tick,frames,aliveEnd:state.units.filter(u=>u.hp>0).length,
  attributedHitCount:hits.length,attributedDamage:+hits.reduce((n,h)=>n+h.damage,0).toFixed(2),
  separated:fronts.windowsWithTwoGeographicallySeparatedDamageComponents,
  persistent:fronts.consecutivePersistentMultiFrontWindows,
  damageWindows:fronts.damageWindows,fullWindows:fronts.totalWindows,
  phase,phaseSurvivors,lifespan,teamDamage:teamData,roleDamage:roleData,roleDeployed};
}
// The observer must not change any complete state, frame-to-frame, across both scales.
for(const count of [20,40]){
 const c={count,mode:'mixed',seed:1337,mirror:false};
 assert.equal(completed(observed,c).trace,completed(core,c,false).trace,'observer physically changed RC4 '+count);
 assert.equal(completed(observed,c).trace,completed(observed,c).trace,'nondeterministic full battle '+count);
}
const cases=[];
for(const count of [20,40])for(const mode of Object.keys(rosters))
 for(const seed of [1337,9917])for(const mirror of [false,true])
  cases.push(completed(observed,{count,mode,seed,mirror}));
assert.equal(cases.length,32);
const summary={};
for(const count of [20,40]){
 const a=cases.filter(x=>x.count===count);
 const sum=k=>a.reduce((n,x)=>n+x[k],0);
 const dmgRole=Object.fromEntries(roles.map(r=>[r,+a.reduce((n,x)=>n+x.roleDamage[r].damage,0).toFixed(2)]));
 const deployedRole=Object.fromEntries(roles.map(r=>[r,a.reduce((n,x)=>n+x.roleDeployed[r],0)]));
 const damagePerDeployed=Object.fromEntries(roles.map(r=>[r,deployedRole[r]>0?+(dmgRole[r]/deployedRole[r]).toFixed(2):null]));
 const damage=+sum('attributedDamage').toFixed(2);
 summary[count]={matches:a.length,completed:a.filter(x=>x.winner).length,totalTicks:sum('tick'),
  meanBattleTicks:Math.round(sum('tick')/a.length),damagePositiveEvents:sum('attributedHitCount'),
  totalAttributedDamage:damage,realSeparatedWindows:sum('separated'),
  persistentIndependentWindows:sum('persistent'),damagingWindows:sum('damageWindows'),
  dragonSharePercent:+(dmgRole.dragon/damage*100).toFixed(1),
  roleDamage:dmgRole,roleDeployed:deployedRole,roleDamagePerDeployedFighter:damagePerDeployed,
  phases:Object.fromEntries(['early','middle','late'].map(p=>[p,{
   damagingWindows:a.reduce((n,x)=>n+x.phase[p].damageWindows,0),
   separatedWindows:a.reduce((n,x)=>n+x.phase[p].separated,0),
   totalWindows:a.reduce((n,x)=>n+x.phase[p].totalWindows,0),
   eligibleWindows:a.reduce((n,x)=>n+x.phase[p].eligibleWindows,0),
   eligibleDamageWindows:a.reduce((n,x)=>n+x.phase[p].eligibleDamageWindows,0),
   eligibleSeparatedWindows:a.reduce((n,x)=>n+x.phase[p].eligibleSeparatedWindows,0),
   lopsidedWindows:a.reduce((n,x)=>n+x.phase[p].lopsidedWindows,0),
   midpointMeanAlive:+(a.reduce((n,x)=>n+x.phaseSurvivors[p].alive,0)/a.length).toFixed(1),
   midpointMeanBlue:+(a.reduce((n,x)=>n+x.phaseSurvivors[p].blue,0)/a.length).toFixed(1),
   midpointMeanRed:+(a.reduce((n,x)=>n+x.phaseSurvivors[p].red,0)/a.length).toFixed(1),
   balanced4v4MidpointCases:a.filter(x=>x.phaseSurvivors[p].bothAtLeast4).length,
   oneTeamAtMost2MidpointCases:a.filter(x=>x.phaseSurvivors[p].oneTeamAtMost2).length}]))};
 assert.equal(summary[count].completed,16,'real terminal winners mandatory');
 for(const p of ['early','middle','late']){
  const v=summary[count].phases[p];
  assert(v.eligibleSeparatedWindows<=v.separatedWindows,'false eligible separated front '+p);
  assert(v.eligibleDamageWindows<=v.damagingWindows,'false eligible damage '+p);
  assert(v.eligibleWindows+v.lopsidedWindows<=v.totalWindows,'side-survival classes overlap '+p);
  assert(v.balanced4v4MidpointCases+v.oneTeamAtMost2MidpointCases<=a.length,'midpoint classes overlap '+p);
 }
 if(count===20)assert(summary[count].phases.early.balanced4v4MidpointCases>=12,
  '20-fighter early eligible opponent count regressed');
 assert(summary[count].damagePositiveEvents>500,'actual damage events missing at '+count);
 assert(summary[count].realSeparatedWindows>=(count===20?16:140),'independent damage fronts severely regressed at '+count);
 assert(summary[count].persistentIndependentWindows>=(count===20?1:40),'persistent genuine fronts regressed at '+count);
 for(const role of roles){
  assert(summary[count].roleDamage[role]>0,'role contributes zero actual HP damage: '+role+' at '+count);
  assert(summary[count].roleDeployed[role]>0,'missing actual deployed role: '+role+' at '+count);
  assert(Number.isFinite(summary[count].roleDamagePerDeployedFighter[role])&&summary[count].roleDamagePerDeployedFighter[role]>0,
   'invalid per-deployed-fighter contribution: '+role+' at '+count);
  const sampleSum=a.reduce((n,x)=>n+x.roleDeployed[role],0);
  assert.equal(sampleSum,summary[count].roleDeployed[role],'role population denominator drift: '+role);
 }
 assert(summary[count].dragonSharePercent<=50,'Dragon dominates attributed damage beyond documented safety threshold at '+count);
}
// Do not assert equal per-role DPS (tanks/CC have non-damage utility).
// Current 20-body baseline has very few persistent fronts; it is a tracked
// quality deficiency, not a justification to stage fake combat or weaken QA.
const report={status:'Completed terminal-quality baseline on green QA runtime; runtime unchanged',
 caveat:'Eligible windows mean four or more actually living fighters on each side near a 30-tick window start, not proof of distinct fights. Living side counts are sampled at every RAF (~10 sim ticks at 10x) and phase centers are 1/6,1/2,5/6 of finished battle time. Per-deployed-fighter damage divides by all original fighters of each type, including non-survivors and all levels; it is NOT per-level DPS. Attacker-attributed positive HP damage excludes source-less Dragon burn, Turtle reflection and spells; solo stuns/guard utility not equivalent to DPS. Front persistence requires real independent attacker-target groups in adjacent 30-tick windows; does not infer actual mobile FPS. 20-body persistence remains an explicit design weakness.',
 summary,cases};
if(process.env.QA_COMPLETED_BATTLES_RECEIPT)fs.writeFileSync(process.env.QA_COMPLETED_BATTLES_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('COMPLETED MATCH QUALITY '+JSON.stringify(summary));
console.log('PASS: 32 terminal matches; damage-edge fronts conditioned on real 4v4 opportunity; role-normalized HP; physical observer parity');
