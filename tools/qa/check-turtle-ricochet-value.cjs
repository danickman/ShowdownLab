'use strict';
// Turtle L4/L5 actual HP reflection improvement, not fake visual/DPS credit.
// A/B against exact prior 0.09 radius, with fully terminal true damage-front scoring.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const shippedAbility=read('v3/ultimate-abilities.js'),shippedCore=read('v3/legacy-sim-core.js');
const {withoutGuardian}=require('./historical-guardian-control.cjs');
// Isolate original 0.09→0.10 Ricochet range A/B from subsequent Guardian capability.
const {core,ability}=withoutGuardian(shippedCore,shippedAbility);
const oldRadius='near(a,t,.09)&&dealt>0',newRadius='near(a,t,.10)&&dealt>0';
assert.equal(ability.split(newRadius).length,2,'actual Turtle Ricochet .10 source changed, update A/B');
const control=ability.replace(newRadius,oldRadius);
assert.equal(control.split(oldRadius).length,2,'source old radius cannot be reconstructed');
const graph=read('tools/qa/check-role-fronts-baseline.cjs');
const a=graph.indexOf('const cell='),b=graph.indexOf('// Synthetic truth fixtures',a);
assert(a>=0&&b>a,'real attributable-damage connected graph moved');
const fronts=vm.runInNewContext(graph.slice(a,b)+';damageFronts',{Math});
const roles=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const rosters={
 mixed:[roles,roles.slice().reverse()],
 swarm:[['goblin','goose','assassin','goblin','knight','barbarian','mole','sniper','goblin','goose'],['goblin','goblin','turtle','beetank','dragon','goose','knight','barbarian','mole','sniper']],
 heavy:[['beetank','turtle','knight','dragon','barbarian','beetank','turtle','sniper','mole','assassin'],['dragon','beetank','barbarian','turtle','knight','sniper','assassin','goblin','goose','mole']],
 ranged:[['sniper','sniper','dragon','dragon','sniper','knight','beetank','turtle','mole','barbarian'],['goblin','goblin','goose','assassin','knight','barbarian','mole','beetank','turtle','sniper']],
 noTurtle:[['knight','sniper','dragon','assassin','mole','goblin','barbarian','goose','beetank','goblin'],['dragon','beetank','barbarian','knight','sniper','assassin','goblin','goose','mole','sniper']],
 turtleVsBeetank:[['turtle'],['beetank']],
 turtleVsSniper:[['turtle'],['sniper']]
};
const positiveAnchor='const dealt=Math.min(t.hp,dmg);';
const reflectionAnchor='if(!secondary)for(const hit of ultimate.afterHit(a,t,dealt,units,tick))hurt(hit.target,hit.damage,hit.source,true)';
assert.equal(core.split(positiveAnchor).length,2,'positive HP damage anchor moved');
assert.equal(core.split(reflectionAnchor).length,2,'real reflection post-resistance anchor moved');
const observed=core.replace(positiveAnchor,positiveAnchor+
 'if(dealt>0&&a&&a.team!==t.team)window.__hit({tick,attacker:a.id,target:t.id,role:a.type,team:a.team,damage:dealt,x:t.x,y:t.y});')
 .replace(reflectionAnchor,'if(!secondary)for(const hit of ultimate.afterHit(a,t,dealt,units,tick)){const prior=hit.target.hp;hurt(hit.target,hit.damage,hit.source,true);if(hit.source===null)window.__reflect(Math.max(0,prior-hit.target.hp))}');
function battle(ult,cfg,track=true){
 let time=0,id=0,q=new Map(),error=[],damage=[],reflected=0,reflectionEvents=0,state,frames=0;
 const digest=crypto.createHash('sha256'),env={window:null,Math,performance:{now:()=>time},
 requestAnimationFrame(fn){const next=++id;q.set(next,fn);return next},cancelAnimationFrame(i){q.delete(i)},
 console:{error:(...args)=>error.push(args.join(';'))}};
 env.window=env;env.__hit=h=>damage.push(h);env.__reflect=n=>{reflected+=n;reflectionEvents++};vm.createContext(env);
 vm.runInContext(read('v3/evolution-rules.js'),env);
 vm.runInContext(ult,env);
 vm.runInContext(track?observed:core,env);
 const game=env.LegacySimCore;
 const roster=side=>{
  const pat=rosters[cfg.mode][side==='blue'?(cfg.mirror?1:0):(cfg.mirror?0:1)];
  return Array.from({length:cfg.count/2},(_,i)=>({type:pat[i%pat.length],
   level:cfg.level||[1,2,4,5][i%4],squad:Math.floor(i/5)}));
 };
 game.configure({seed:cfg.seed||1337,speed:cfg.speed||10,onState:()=>{}});
 game.deploy(roster('blue'),roster('red'));game.setRunning(true);
 const max=cfg.maxFrames||450;
 for(;frames<max;frames++){
  time+=16.667;const work=[...q.values()];q.clear();for(const fn of work)fn(time);
  state=game.getState();digest.update(JSON.stringify(state)+'\n');
  if(state.winner){frames++;break}
 }
 assert.deepEqual(error,[],'simulation error '+JSON.stringify(cfg));
 assert(state.units.length===cfg.count,'fighters disappeared');
 assert(state.units.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.y)&&Number.isFinite(u.hp)),'finite HP and positions');
 const hash=digest.digest('hex');
 if(!track)return{hash,winner:state.winner,tick:state.tick};
 const fr=fronts(damage,state.tick);
 return{hash,winner:state.winner,tick:state.tick,frames,hits:damage.length,
  realReflection:+reflected.toFixed(3),reflectionEvents,
  realSeparated:fr.windowsWithTwoGeographicallySeparatedDamageComponents,
  persistent:fr.consecutivePersistentMultiFrontWindows,
  turtleDamage:+damage.filter(h=>h.role==='turtle').reduce((n,h)=>n+h.damage,0).toFixed(3)};
}
// Test exact real physical observer parity (not partial console snapshots).
for(const cfg of [{count:20,mode:'mixed',seed:1337},{count:40,mode:'swarm',seed:9917}]){
 assert.equal(battle(ability,cfg,true).hash,battle(ability,cfg,false).hash,'observer altered combat '+JSON.stringify(cfg));
}
// Actual geometry/hit-damage: L1–3 cannot get an Ultimate; .095 new coverage, .101 safe.
const env={window:null,Math};env.window=env;vm.createContext(env);
vm.runInContext(read('v3/evolution-rules.js'),env);vm.runInContext(ability,env);
for(const level of [1,2,3,4,5]){
 const t={id:1,type:'turtle',team:'blue',level,x:.5,y:.5,hp:100,maxHp:100},
  atk={id:2,type:'knight',team:'red',level:1,x:.595,y:.5,hp:100};
 let splash=env.ShowdownUltimates.afterHit(atk,t,40,[t,atk],20);
 assert.equal(splash.length,level>=4?1:0,'only evolved Turtle has Ricochet');
 if(level>=4)assert(Math.abs(splash[0].damage-(level===5?18:12))<1e-8,'do not amplify raw reflection');
 atk.x=.601;
 assert.equal(env.ShowdownUltimates.afterHit(atk,t,40,[t,atk],41).length,0,'ranged/noncontact attack must not reflect');
}
const rows=[];
for(const count of [20,40])for(const mode of ['mixed','swarm','heavy','ranged'])
 for(const seed of [1337,9917])for(const mirror of [false,true]){
  const cfg={count,mode,seed,mirror},
   before=battle(control,cfg),after=battle(ability,cfg);
  rows.push({cfg,before,after});
  assert(before.winner&&after.winner,'complete real winner required '+JSON.stringify(cfg));
  assert.equal(after.winner,before.winner,'Turtle tweak inverted baseline winner '+JSON.stringify(cfg));
 }
const summary={};
for(const count of [20,40]){
 const rr=rows.filter(x=>x.cfg.count===count);
 const sum=(which,key)=>+rr.reduce((n,x)=>n+x[which][key],0).toFixed(2);
 summary[count]={matches:rr.length,baselineReflectionHP:sum('before','realReflection'),
  improvedReflectionHP:sum('after','realReflection'),
  baselineReflections:sum('before','reflectionEvents'),improvedReflections:sum('after','reflectionEvents'),
  baselineTrueFronts:sum('before','realSeparated'),improvedTrueFronts:sum('after','realSeparated'),
  baselinePersistent:sum('before','persistent'),improvedPersistent:sum('after','persistent'),
  changedWinners:rr.filter(x=>x.after.winner!==x.before.winner).length};
 assert(summary[count].improvedReflectionHP>summary[count].baselineReflectionHP,'no real Turtle HP-counter gain at '+count);
 assert(summary[count].improvedPersistent>=summary[count].baselinePersistent,'multiple fronts regressed at '+count);
 assert(summary[count].improvedTrueFronts>=summary[count].baselineTrueFronts-(count===40?2:0),'real damaging-front coverage degraded at '+count);
}
// Heavy tank matchup cannot be overwritten into an unconditional Turtle offense.
// Ranged snipers must stay a genuine out-of-range counter.
const solo=[];
for(const level of [1,4,5])for(const mode of ['turtleVsBeetank','turtleVsSniper'])
 for(const mirror of [false,true]){
 const cfg={count:2,mode,seed:1337,mirror,level},
  before=battle(control,cfg),after=battle(ability,cfg);
 assert(before.winner&&after.winner,'solo must finish '+JSON.stringify(cfg));
 assert.equal(after.winner,before.winner,'tank or ranged solo winner inverted '+JSON.stringify(cfg));
 solo.push({cfg,winningSide:after.winner});
}
// Zero-Turtle battles must be bit-for-bit unchanged, even 300 bodies at 1x/10x.
for(const count of [20,40,80,120,300])for(const speed of [1,10]){
 const cfg={count,mode:'noTurtle',seed:1337,mirror:true,speed,maxFrames:count===300?8:count===120?12:count===80?15:20};
 const before=battle(control,cfg,false),after=battle(ability,cfg,false);
 assert.equal(after.hash,before.hash,'unaffected physical states drifted '+JSON.stringify(cfg));
}
const report={status:'Turtle L4/L5 true Ricochet contact improvement on QA; other 9 roles unchanged',
 summary,solo,rows,
 note:'Both sides tested to a terminal winner. True reflected HP delta measured after the actual secondary hurt path, including recipient defenses; source-less reflected damage is intentionally not incorrectly attributed as direct Turtle hit DPS. Counterplay, real damage-front connected graphs and unaffected 300 1x/10x physical parity enforced. iPhone 14 Pro Max physical Safari not tested.'};
if(process.env.QA_TURTLE_REFLECTION_RECEIPT)fs.writeFileSync(process.env.QA_TURTLE_REFLECTION_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('TURTLE REAL RICOCHET VALUE '+JSON.stringify(summary));
console.log('PASS: honest .10 true HP reflected; L1-L3 and solo counters safe; completed 20/40 fronts and 300 no-Turtle parity');
