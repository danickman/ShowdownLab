'use strict';
// Permanent source-level Assassin-vs-Dragon true-hit regression and counterplay.
// Compare shipped RC4 to identical pre-contact behavior, seeded and mirrored.
// The only permitted change is attack reach when the selected target is Dragon.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const shipped=read('v3/legacy-sim-core.js');
const before="function assassinStep(u){const[t,d]=nearest(u,true);if(!t)return;u.target=t.id;const r=u.range/500;";
const after="function assassinStep(u){const[t,d]=nearest(u,true);if(!t)return;u.target=t.id;/* The Dragon's wide standing collider otherwise prevents any close backstab. Keep armored tank counters unchanged. */const r=t.type==='dragon'?Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)+.002):u.range/500;";
assert.equal(shipped.split(after).length,2,'review any changes to Dragon-only Assassin contact correction');
const original=shipped.replace(after,before);
assert.equal(original.split(before).length,2);
const hit='const dealt=Math.min(t.hp,dmg);';
const observe=src=>{assert.equal(src.split(hit).length,2);return src.replace(hit,hit+"if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,attacker:a.id,target:t.id,role:a.type,targetType:t.type,damage:dealt,x:t.x,y:t.y,team:a.team});")};
const graph=read('tools/qa/check-role-fronts-baseline.cjs'),start=graph.indexOf('const cell='),end=graph.indexOf('// Synthetic truth fixtures',start);
assert(start>=0&&end>start,'true-front source moved');
const damageFronts=vm.runInNewContext(graph.slice(start,end)+';damageFronts',{Math});
const all=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const formations={
 mixed:[all,all.slice().reverse()],
 heavy:[['assassin','assassin','knight','barbarian','turtle','beetank','goose','mole','sniper','dragon'],['dragon','beetank','dragon','turtle','sniper','knight','goblin','goose','mole','barbarian']],
 ranged:[['assassin','assassin','assassin','knight','goblin','mole','sniper','dragon','beetank','goose'],['sniper','dragon','sniper','turtle','knight','beetank','goose','goblin','barbarian','mole']],
 noDragon:[['assassin','knight','beetank','goblin','goose','sniper','mole','turtle','barbarian','assassin'],['beetank','turtle','sniper','knight','goblin','goose','barbarian','mole','assassin','sniper']]
};
function test(src,c,observer=true){
 let now=0,seq=0,q=new Map(),hits=[],errors=[],last=null;
 const digest=crypto.createHash('sha256');
 const env={Math,window:null,performance:{now:()=>now},console:{error:(...a)=>errors.push(a.join(' '))},
  requestAnimationFrame(fn){const k=++seq;q.set(k,fn);return k},cancelAnimationFrame(i){q.delete(i)}};
 env.window=env;env.__qaHit=h=>hits.push(h);
 vm.createContext(env);
 for(const dep of ['evolution-rules','ultimate-abilities'])vm.runInContext(read('v3/'+dep+'.js'),env,{filename:dep+'.js'});
 vm.runInContext(observer?observe(src):src,env,{filename:'assassin-dragon-contact-vm.js'});
 const sim=env.LegacySimCore;
 const roster=side=>{
  if(c.duel){const type=side==='blue'?(c.mirror?c.duel[1]:c.duel[0]):(c.mirror?c.duel[0]:c.duel[1]);return[{type,level:c.level,squad:0}]}
  const f=formations[c.mode],pat=side==='blue'?(c.mirror?f[1]:f[0]):(c.mirror?f[0]:f[1]);
  return Array.from({length:c.count/2},(_,i)=>({type:pat[i%pat.length],level:c.level||[1,2,4,5][i%4],squad:Math.floor(i/5)}))
 };
 sim.configure({seed:c.seed||1337,speed:c.speed||10,onState:()=>{}});sim.deploy(roster('blue'),roster('red'));sim.setRunning(true);
 for(let frame=0;frame<c.frames;frame++){now+=16.667;const current=[...q.values()];q.clear();for(const task of current)task(now);
  last=sim.getState();digest.update(JSON.stringify(last)+'\n');if(last.winner)break}
 assert.deepEqual(errors,[],'RC4 exceptions');
 assert(last&&last.units.length===c.count||last&&c.duel&&last.units.length===2,'unexpected population');
 for(const u of last.units)assert(Number.isFinite(u.x)&&Number.isFinite(u.y)&&Number.isFinite(u.hp),'non-finite 300-body or ordinary combat state');
 const ah=hits.filter(h=>h.role==='assassin'),f=observer?damageFronts(hits,last.tick):null;
 return {hash:digest.digest('hex'),winner:last.winner,lastTick:last.tick,assassinHits:ah.length,
  dragonHits:ah.filter(h=>h.targetType==='dragon').length,tankHits:ah.filter(h=>['beetank','turtle'].includes(h.targetType)).length,
  assassinDamage:+ah.reduce((n,h)=>n+h.damage,0).toFixed(2),
  separated:f?f.windowsWithTwoGeographicallySeparatedDamageComponents:0,
  persistent:f?f.consecutivePersistentMultiFrontWindows:0};
}
for(const cfg of [{mode:'mixed',count:20,seed:1337,mirror:false,frames:50},
 {mode:'mixed',count:80,seed:9917,mirror:true,frames:18}]){
 assert.equal(test(shipped,cfg,true).hash,test(shipped,cfg,false).hash,'read-only hit observation changed shipped physical state');
 assert.equal(test(original,cfg,true).hash,test(original,cfg,false).hash,'read-only hit observation changed control physical state');
}
const duels=[];
for(const opponent of ['dragon','beetank','turtle','sniper','goose','knight','goblin'])for(const level of [1,4,5])for(const mirror of [false,true]){
 const cfg={duel:['assassin',opponent],level,mirror,seed:1337,frames:145};
 const base=test(original,cfg),trial=test(shipped,cfg);
 if(opponent==='dragon'){
  assert.equal(base.dragonHits,0,'control must show the Dragon contact bug');
  assert(trial.dragonHits>0,'Dragon should receive real Assassin hits at L1/L4/L5 from both sides');
  assert.equal(trial.winner,base.winner,'Dragon solo counter must still win');
 }else{
  assert.equal(trial.hash,base.hash,'non-Dragon physical trace changed: '+JSON.stringify(cfg));
 }
 duels.push({opponent,level,mirror,controlHits:base.assassinHits,trialHits:trial.assassinHits,controlWinner:base.winner,trialWinner:trial.winner});
}
const groups=[],summaries={};
for(const count of [20,40,80])for(const mode of ['mixed','heavy','ranged'])for(const seed of [1337,9917])for(const mirror of [false,true]){
 const cfg={count,mode,seed,mirror,frames:count===20?115:count===40?78:37},base=test(original,cfg),trial=test(shipped,cfg);
 groups.push({cfg,control:base,trial});
}
for(const count of [20,40,80]){
 const a=groups.filter(r=>r.cfg.count===count),sum=(part,key)=>+a.reduce((n,r)=>n+r[part][key],0).toFixed(2);
 summaries[count]={cases:a.length,baseDragonHits:sum('control','dragonHits'),trialDragonHits:sum('trial','dragonHits'),
  baseAssassinDamage:sum('control','assassinDamage'),trialAssassinDamage:sum('trial','assassinDamage'),
  baselineSeparated:sum('control','separated'),trialSeparated:sum('trial','separated'),
  baselinePersistent:sum('control','persistent'),trialPersistent:sum('trial','persistent'),
  winnerDifferences:a.filter(r=>r.control.winner!==r.trial.winner).length};
 assert(summaries[count].trialDragonHits>summaries[count].baseDragonHits,'no real mixed-team Assassin/Dragon improvement');
 assert(summaries[count].trialAssassinDamage>summaries[count].baseAssassinDamage,'no Assassin damage opportunity improvement');
}
for(const count of [80,120,300])for(const speed of [1,10]){
 const cfg={mode:'noDragon',count,speed,seed:1337,mirror:true,frames:count===300?12:20};
 assert.equal(test(original,cfg).hash,test(shipped,cfg).hash,'no-Dragon high-density state must remain identical '+JSON.stringify(cfg));
}
const report={status:'QA Dragon-only Assassin geometric contact fix, combat-changing variant',
 caveats:'Mirrored seed-controlled source A/B; 20/40/80 snapshots censored. No global win rate, no Safari frame time. Dragon remains winner in six solo L1/L4/L5 fixtures; Beetank/Turtle/light controls bitwise identical.',
 duels,summaries,groups};
if(process.env.QA_ASSASSIN_DRAGON_RECEIPT)fs.writeFileSync(process.env.QA_ASSASSIN_DRAGON_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('ASSASSIN DRAGON CONTACT '+JSON.stringify(summaries));
console.log('PASS: real backstabs against Dragon, preserved counters, 80/120/300 no-Dragon complete state parity and original observer conservation');
