'use strict';
// B3: Goblin contact reach vs heavy defenders, swarms and light opponent controls.
// Research ONLY; current Knight contact and Assassin rear runtime stay unchanged.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=n=>fs.readFileSync(path.join(root,'v3',n+'.js'),'utf8');
const shipped=read('legacy-sim-core'),old="function goblinStep(u,t,d){const r=u.range/500;";
const correction="function goblinStep(u,t,d){const gap=visualSpacingRadius(u)+visualSpacingRadius(t)-(bodyRadius(u)+bodyRadius(t))*.22,r=gap>u.range/500?gap+.002:u.range/500;";
assert.equal(shipped.split(old).length,2,'Goblin source moved, re-evaluate melee reach');
const candidate=shipped.replace(old,correction);
const damageAnchor='const dealt=Math.min(t.hp,dmg);',tickAnchor='}separate(false)}function winner(){';
const instrument=code=>{
 assert.equal(code.split(damageAnchor).length,2,'damage anchor moved');
 assert.equal(code.split(tickAnchor).length,2,'tick anchor moved');
 return code.replace(damageAnchor,damageAnchor+"if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,role:a.type,team:a.team,attacker:a.id,target:t.id,targetRole:t.type,damage:dealt,x:t.x,y:t.y});")
 .replace(tickAnchor,'}window.__qaTick(tick,units);separate(false)}function winner(){');
};
const FULL=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const patterns={
 heavy:['beetank','turtle','dragon','beetank','knight','turtle','dragon','barbarian','beetank','turtle'],
 balanced:FULL,
 light:['goblin','knight','goose','assassin','barbarian','mole','goblin','goose','knight','barbarian'],
 counter:['beetank','turtle','knight','goose','sniper','dragon','beetank','knight','turtle','barbarian']
};
const roster=(cfg,side)=>{
 const sideActual=cfg.mirror?(side==='blue'?'red':'blue'):side;
 if(cfg.mode==='duel')return [{type:sideActual==='blue'?'goblin':cfg.target,level:cfg.level,squad:0}];
 if(cfg.mode==='swarm')return Array.from({length:cfg.count/2},(_,i)=>({
  type:sideActual==='blue'?'goblin':cfg.target,level:cfg.level,squad:Math.floor(i/6)}));
 if(cfg.mode==='counter')return Array.from({length:cfg.count/2},(_,i)=>({
  type:sideActual==='blue'?['goblin','goblin','goblin','goblin','goose','knight','mole','goblin','sniper','barbarian'][i%10]:
  patterns.counter[i%10],level:[1,4,5,2,3][i%5],squad:Math.floor(i/6)}));
 const team=sideActual==='blue'?patterns.balanced:patterns[cfg.mode];
 return Array.from({length:cfg.count/2},(_,i)=>({type:team[i%team.length],level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
};
function trial(code,cfg,audit=true){
 let t=0,next=0,q=new Map(),errors=[],hits=[],aliveTicks={goblin:0,beetank:0,turtle:0,dragon:0};
 const hash=crypto.createHash('sha256');
 const env={window:null,Math,performance:{now:()=>t},requestAnimationFrame(fn){const id=++next;q.set(id,fn);return id},cancelAnimationFrame(id){q.delete(id)},console:{error:(...args)=>errors.push(args.join(' '))}};
 env.window=env;env.__qaHit=h=>hits.push(h);env.__qaTick=(tick,units)=>{
  for(const u of units)if(u.hp>0&&u.team===(cfg.mirror?'red':'blue')&&aliveTicks[u.type]!==undefined)aliveTicks[u.type]++;
 };
 vm.createContext(env);
 for(const dep of ['evolution-rules','ultimate-abilities'])vm.runInContext(read(dep),env,{filename:dep+'.js'});
 vm.runInContext(audit?instrument(code):code,env,{filename:'goblin-contact-study.js'});
 const core=env.LegacySimCore;
 core.configure({seed:cfg.seed,speed:cfg.speed,onState:()=>{}});
 core.deploy(roster(cfg,'blue'),roster(cfg,'red'));core.setRunning(true);
 let last=null,frames=0;
 for(let i=0;i<cfg.frames;i++){
  t+=16.667;const tasks=[...q.values()];q.clear();for(const cb of tasks)cb(t);
  last=core.getState();hash.update(JSON.stringify(last)+'\n');frames++;
  if(last.winner)break;
 }
 assert.deepEqual(errors,[],'Goblin study core error '+JSON.stringify(cfg));
 const digest=hash.digest('hex');if(!audit)return{digest};
 const goblin=hits.filter(x=>x.role==='goblin'&&x.team===(cfg.mirror?'red':'blue'));
 const byRole=Object.fromEntries(FULL.map(role=>{
  const item=hits.filter(h=>h.role===role&&h.team===(cfg.mirror?'red':'blue'));return[role,{damage:+item.reduce((n,x)=>n+x.damage,0).toFixed(1),hits:item.length}];
 }));
 const defenders=last.units.filter(u=>u.team===(cfg.mirror?'blue':'red'));
 const attackSide=cfg.mirror?'red':'blue';
 return{digest,tick:last.tick,frames,winner:last.winner||null,censored:!last.winner,
  goblinHits:goblin.length,goblinDamage:+goblin.reduce((n,x)=>n+x.damage,0).toFixed(1),
  goblinHeavyHits:goblin.filter(h=>['beetank','turtle','dragon'].includes(h.targetRole)).length,
  goblinDamagePer1000AliveTicks:+(1000*goblin.reduce((n,x)=>n+x.damage,0)/Math.max(1,aliveTicks.goblin)).toFixed(1),
  totalDamage:+hits.reduce((n,h)=>n+h.damage,0).toFixed(1),
  attackSide,
  defenderHp:+defenders.reduce((n,u)=>n+u.hp,0).toFixed(1),
  defenderAlive:defenders.filter(u=>u.hp>0).length,
  attackerAlive:last.units.filter(u=>u.team===attackSide&&u.hp>0).length,
  byRole,
  totalSurviving:last.units.filter(u=>u.hp>0).length};
}
for(const c of [{mode:'duel',target:'beetank',count:2,level:1,seed:1337,mirror:false,speed:10,frames:65},
 {mode:'counter',target:'beetank',count:40,level:1,seed:9917,mirror:true,speed:4,frames:30}]){
 assert.equal(trial(shipped,c,false).digest,trial(shipped,c,true).digest,'QA hit observer changed original core');
 assert.equal(trial(candidate,c,false).digest,trial(candidate,c,true).digest,'QA hit observer changed candidate core');
}
const scenarios=[];
for(const target of ['knight','goblin','beetank','turtle','dragon'])for(const level of [1,4,5])for(const mirror of [false,true]){
 scenarios.push({mode:'duel',target,count:2,level,seed:1337,mirror,speed:10,frames:95});
}
for(const count of [4,12,24])for(const target of ['knight','beetank','turtle','dragon'])for(const level of [1,4])for(const seed of [1337,9917])for(const mirror of [false,true]){
 scenarios.push({mode:'swarm',count,target,level,seed,mirror,speed:10,frames:count>=24?42:75});
}
for(const count of [40,80,120])for(const mode of ['heavy','light','counter'])for(const seed of [1337,9917])for(const mirror of [false,true]){
 scenarios.push({mode,count,target:null,level:1,seed,mirror,speed:count>=120?1:4,frames:count>=120?35:65});
}
const rows=[];
for(const cfg of scenarios){
 const o=trial(shipped,cfg),c=trial(candidate,cfg);
 const {digest:baselineDigest,...oldResult}=o,{digest:candidateDigest,...newResult}=c;
 if((cfg.mode==='duel'||cfg.mode==='swarm')&&['knight','goblin'].includes(cfg.target)){
  assert.equal(candidateDigest,baselineDigest,'Goblin-vs-small body should remain strictly unchanged '+JSON.stringify(cfg));
 }
 rows.push({cfg,baseline:oldResult,candidate:newResult});
}
const fold=items=>({cases:items.length,
 damageFrom:+items.reduce((n,x)=>n+x.baseline.goblinDamage,0).toFixed(1),
 damageTo:+items.reduce((n,x)=>n+x.candidate.goblinDamage,0).toFixed(1),
 heavyHitsFrom:items.reduce((n,x)=>n+x.baseline.goblinHeavyHits,0),
 heavyHitsTo:items.reduce((n,x)=>n+x.candidate.goblinHeavyHits,0),
 improved:items.filter(x=>x.candidate.goblinDamage>x.baseline.goblinDamage).length,
 worsened:items.filter(x=>x.candidate.goblinDamage<x.baseline.goblinDamage).length,
 defenderAliveFrom:items.reduce((n,x)=>n+x.baseline.defenderAlive,0),
 defenderAliveTo:items.reduce((n,x)=>n+x.candidate.defenderAlive,0),
 defenderHpFrom:+items.reduce((n,x)=>n+x.baseline.defenderHp,0).toFixed(1),
 defenderHpTo:+items.reduce((n,x)=>n+x.candidate.defenderHp,0).toFixed(1),
 terminalCasesFrom:items.filter(x=>x.baseline.winner).length,
 terminalCasesTo:items.filter(x=>x.candidate.winner).length});
const summary={
 duels:fold(rows.filter(r=>r.cfg.mode==='duel')),
 heavyDuels:fold(rows.filter(r=>r.cfg.mode==='duel'&&['beetank','turtle','dragon'].includes(r.cfg.target))),
 smallDuels:fold(rows.filter(r=>r.cfg.mode==='duel'&&['knight','goblin'].includes(r.cfg.target))),
 swarmsVsHeavies:fold(rows.filter(r=>r.cfg.mode==='swarm'&&['beetank','turtle','dragon'].includes(r.cfg.target))),
 swarmsVsLight:fold(rows.filter(r=>r.cfg.mode==='swarm'&&['knight'].includes(r.cfg.target))),
 army40:fold(rows.filter(r=>r.cfg.count===40)),
 army80:fold(rows.filter(r=>r.cfg.count===80)),
 army120:fold(rows.filter(r=>r.cfg.count===120)),
};
const report={status:'QA-only, no Goblin game change',summary,rows,baselineObserverExactParity:true,
 caveats:'Only short source-level synthetic simulations, not full match equilibrium or Safari performance. Goblin vs armored defenders has strong mitigation; per-target and per-alive-tick effects are essential. These results do not establish normalized role fitness or fair 20+ Goblin swarms. Counterplay and persistent fronts need independent evidence before runtime change.'};
if(process.env.QA_GOBLIN_RECEIPT)fs.writeFileSync(process.env.QA_GOBLIN_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('GOBLIN HEAVY COUNTERPLAY '+JSON.stringify(summary));
console.log('PASS: mirrored Goblin contact study with control parity, swarms, large body defenders and balanced armies');
