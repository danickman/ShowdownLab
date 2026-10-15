'use strict';
// Test actual attacker-sourced HP damage, Turtle reflection, and deterministic counterplay.
// The pre-change comparator is the last fully green Dragon-only QA release.
// No copy of copyrighted Draft Showdown sources or art.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const shipped=read('v3/legacy-sim-core.js');
const prefix="function assassinStep(u){const[t,d]=nearest(u,true);if(!t)return;u.target=t.id;";
const previous=prefix+"/* The Dragon's wide standing collider otherwise prevents any close backstab. Keep armored tank counters unchanged. */const r=t.type==='dragon'?Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)+.002):u.range/500;";
const current=prefix+"/* Match attack reach to the untraversable standing collider, not an artificial melee DPS boost. Dragon retains its verified +.002 access margin; armored defenders retain their armor and shell counters. */const r=t.type==='dragon'?Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)+.002):(t.type==='beetank'||t.type==='turtle')?Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)):u.range/500;";
assert.equal(shipped.split(current).length,2,'only audited Assassin contact rule permitted');
const control=shipped.replace(current,previous);
const hitAnchor='const dealt=Math.min(t.hp,dmg);';
assert.equal(shipped.split(hitAnchor).length,2);
const observed=src=>src.replace(hitAnchor,hitAnchor+"if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,attacker:a.id,target:t.id,role:a.type,targetType:t.type,damage:dealt,team:a.team,x:t.x,y:t.y});if(dealt>0&&!a&&t.type==='assassin')window.__qaReflect({tick,damage:dealt});");
const graph=read('tools/qa/check-role-fronts-baseline.cjs');
const graphStart=graph.indexOf('const cell='),graphEnd=graph.indexOf('// Synthetic truth fixtures',graphStart);
assert(graphEnd>graphStart,'damage-graph test extraction moved');
const fronts=vm.runInNewContext(graph.slice(graphStart,graphEnd)+';damageFronts',{Math});
const roster={
 noWide:[['assassin','knight','goblin','sniper','goose','barbarian','mole','sniper','assassin','goblin'],['sniper','goblin','goose','barbarian','knight','mole','assassin','sniper','goblin','goose']],
 tankVsAssassin:[Array(10).fill('assassin'),['beetank','turtle','beetank','turtle','knight','beetank','turtle','beetank','turtle','knight']],
 mixedHeavy:[['assassin','assassin','goblin','barbarian','mole','goose','knight','turtle','beetank','assassin'],['beetank','turtle','beetank','turtle','knight','beetank','turtle','knight','goblin','goose']],
 allRoles:[['assassin','beetank','turtle','knight','barbarian','goose','goblin','mole','sniper','dragon'],['turtle','beetank','knight','assassin','barbarian','goose','goblin','mole','sniper','dragon']]
};
function simulate(src,c,instrument=true){
 let now=0,n=0,queue=new Map(),hits=[],reflections=[],errors=[],end;
 const dig=crypto.createHash('sha256');
 const env={window:null,Math,performance:{now:()=>now},console:{error:(...e)=>errors.push(e.join(' '))},
  requestAnimationFrame(fn){const id=++n;queue.set(id,fn);return id},cancelAnimationFrame(i){queue.delete(i)}};
 env.window=env;env.__qaHit=e=>hits.push(e);env.__qaReflect=e=>reflections.push(e);
 vm.createContext(env);
 for(const dep of ['evolution-rules','ultimate-abilities'])vm.runInContext(read('v3/'+dep+'.js'),env,{filename:dep+'.js'});
 vm.runInContext(instrument?observed(src):src,env,{filename:'assassin-heavy-contact-core.js'});
 const core=env.LegacySimCore;
 const mk=side=>{
  if(c.duel){const type=side==='blue'?(c.mirror?c.duel[1]:c.duel[0]):(c.mirror?c.duel[0]:c.duel[1]);return[{type,level:c.level,squad:0}]}
  const lineup=roster[c.mode],pat=side==='blue'?(c.mirror?lineup[1]:lineup[0]):(c.mirror?lineup[0]:lineup[1]);
  return Array.from({length:c.count/2},(_,i)=>({type:pat[i%pat.length],level:c.level||[1,2,4,5][i%4],squad:Math.floor(i/5)}));
 };
 core.configure({seed:c.seed||1337,speed:c.speed||10,onState:()=>{}});core.deploy(mk('blue'),mk('red'));core.setRunning(true);
 for(let i=0;i<c.frames;i++){now+=16.667;const frames=[...queue.values()];queue.clear();for(const fn of frames)fn(now);
  end=core.getState();dig.update(JSON.stringify(end)+'\n');if(end.winner)break}
 assert.deepEqual(errors,[],'no simulator exceptions');
 assert.equal(end.units.length,c.duel?2:c.count,'never cap deployed fighters');
 assert(end.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.x)&&Number.isFinite(u.y)),'all fighters finite');
 const ass=hits.filter(x=>x.role==='assassin'),f=instrument?fronts(hits,end.tick):null;
 return{sha:dig.digest('hex'),winner:end.winner,tick:end.tick,
  heavyHits:ass.filter(h=>['beetank','turtle'].includes(h.targetType)).length,
  turtleHits:ass.filter(h=>h.targetType==='turtle').length,
  beetankHits:ass.filter(h=>h.targetType==='beetank').length,
  dragonHits:ass.filter(h=>h.targetType==='dragon').length,
  damage:+ass.reduce((n,h)=>n+h.damage,0).toFixed(2),
  reflectionDamage:+reflections.reduce((n,h)=>n+h.damage,0).toFixed(2),
  separated:f?f.windowsWithTwoGeographicallySeparatedDamageComponents:0,
  persistent:f?f.consecutivePersistentMultiFrontWindows:0}
}
// Read-only hooks must not change the complete serialized simulation.
for(const cfg of [{mode:'tankVsAssassin',count:20,seed:1337,mirror:false,frames:35},
 {mode:'mixedHeavy',count:40,seed:9917,mirror:true,frames:25},
 {mode:'noWide',count:80,seed:1337,mirror:true,frames:16}]){
 assert.equal(simulate(shipped,cfg).sha,simulate(shipped,cfg,false).sha,'observer changes physical simulator state');
}
const duels=[];
for(const enemy of ['beetank','turtle','dragon','sniper','knight','goblin','goose'])for(const level of [1,4,5])for(const mirror of [false,true]){
 const c={duel:['assassin',enemy],level,mirror,frames:150},before=simulate(control,c),after=simulate(shipped,c);
 if(enemy==='beetank'||enemy==='turtle'){
  assert.equal(before.heavyHits,0,'pre-fix armored contact should have zero Assassin hits');
  assert(after.heavyHits>0,'armored standing-contact must now produce actual HP damage');
  assert.equal(before.winner,after.winner,'armored opponent must retain solo winner');
  assert.equal(after.winner,mirror?'blue':'red','armored defender retains solo role-counter');
  if(enemy==='turtle'&&level>=4)assert(after.reflectionDamage>0,'Ricochet Shell should actually reflect on Assassin');
  if(enemy==='beetank')assert.equal(after.reflectionDamage,0,'Beetank is not Turtle');
 }else assert.equal(after.sha,before.sha,'Dragon or light opponent combat mutated: '+JSON.stringify(c));
 duels.push({enemy,level,mirror,before,after});
}
const samples=[],summary={};
for(const count of [20,40,80])for(const mode of ['tankVsAssassin','mixedHeavy','allRoles','noWide'])
 for(const level of [1,4,5])for(const seed of [1337,9917])for(const mirror of [false,true]){
  const c={count,mode,level,seed,mirror,frames:count===20?100:count===40?65:34};
  const before=simulate(control,c),after=simulate(shipped,c);
  if(mode==='noWide'||mode==='allRoles')assert.equal(after.sha,before.sha,'without a selected armored victim, combat must remain identical '+JSON.stringify(c));
  samples.push({c,before,after});
 }
for(const mode of ['tankVsAssassin','mixedHeavy','allRoles','noWide']){
 const a=samples.filter(x=>x.c.mode===mode);
 const sum=(part,k)=>+a.reduce((n,x)=>n+x[part][k],0).toFixed(2);
 summary[mode]={cases:a.length,hitsBefore:sum('before','heavyHits'),hitsAfter:sum('after','heavyHits'),
  damageBefore:sum('before','damage'),damageAfter:sum('after','damage'),
  reflectBefore:sum('before','reflectionDamage'),reflectAfter:sum('after','reflectionDamage'),
  frontsBefore:sum('before','separated'),frontsAfter:sum('after','separated'),
  persistedBefore:sum('before','persistent'),persistedAfter:sum('after','persistent'),
  terminalChanges:a.filter(x=>x.before.winner!==x.after.winner).length,
  completedDefenderEarlier:a.filter(x=>!x.before.winner&&x.after.winner===(x.c.mirror?'blue':'red')).length,
  winnerReversals:a.filter(x=>x.before.winner&&x.before.winner!==x.after.winner).length};
 if(mode==='tankVsAssassin'||mode==='mixedHeavy'){
  assert(summary[mode].hitsAfter>summary[mode].hitsBefore,'armored target should be damageable in actual squads');
  assert.equal(summary[mode].winnerReversals,0,'an established terminal victor changed or stopped winning');
  if(mode==='tankVsAssassin'){
   assert(a.every(x=>x.after.winner!==(x.c.mirror?'red':'blue')),'an Assassin-only army unexpectedly defeated its armored guards');
   const changed=a.filter(x=>x.before.winner!==x.after.winner);
   assert(changed.every(x=>!x.before.winner&&x.after.winner===(x.c.mirror?'blue':'red')),
    'new terminal state must only be an earlier heavy-defender victory');
  }else assert.equal(summary[mode].terminalChanges,0,'mixed-heavy terminal response changed unexpectedly');
 }else assert.equal(summary[mode].hitsAfter,summary[mode].hitsBefore,'unaffected matchup changed heavy hit counts');
}
for(const count of [80,120,300])for(const speed of [1,10]){
 const c={count,mode:'noWide',speed,seed:1337,mirror:true,frames:count===300?12:20};
 assert.equal(simulate(shipped,c).sha,simulate(control,c).sha,'large unaffected formations retain exact full states '+JSON.stringify(c));
}
const report={status:'QA-only, genuine Assassin contact against armored Beetank and Turtle with real remaining counterplay',
 caveat:'The heavy-team source A/B reports are frame-censored; no population-wide win-rate estimate. No claim of iPhone Safari FPS. Turtle reflection is actual secondary HP damage. Dragon rule unchanged.',
 summary,duels,samples};
if(process.env.QA_ASSASSIN_HEAVY_RECEIPT)fs.writeFileSync(process.env.QA_ASSASSIN_HEAVY_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('ASSASSIN HEAVY COUNTERPLAY '+JSON.stringify(summary));
console.log('PASS: Assassin Beetank/Turtle actual contacts, Turtle reflected damage, unchanged solo winners, 80/120/300 unaffected parity and true fronts');
