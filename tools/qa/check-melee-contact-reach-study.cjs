'use strict';
// B3 QA-only: check attack reach against actual RC4 visual collision spacing.
// Only Knight reach has been shipped on QA. Other roles remain study-only.
// parity controls and opponent survival/damage. Censored matches are labeled.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=n=>fs.readFileSync(path.join(root,'v3',n+'.js'),'utf8'),source=read('legacy-sim-core');
const previousKnight="function knightStep(u,t,d){u.guard=Math.max(0,u.guard-1);const r=u.range/500;";
const shippedKnight="function knightStep(u,t,d){u.guard=Math.max(0,u.guard-1);const r=Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)-(bodyRadius(u)+bodyRadius(t))*.22+.002);";
assert.equal(source.split(shippedKnight).length,2,'shipped Knight contact reach changed: update study');
const baseline=source.replace(shippedKnight,previousKnight);
const hitAnchor='const dealt=Math.min(t.hp,dmg);';
assert.equal(source.split(hitAnchor).length,2,'positive damage observation anchor moved');
const defs=source.match(/const DEF=(\{[\s\S]*?\});const BACK=/);
assert(defs,'DEF roster code changed');const DEF=Function('return '+defs[1])();
assert(source.includes("function visualSpacingRadius(u){const heavy=HEAVY.has(u.type),wide=u.type==='dragon'||u.type==='beetank'||u.type==='turtle';return bodyRadius(u)*(wide?1.34:heavy?1.26:1.18)}"),'Spacing geometry changed; update reach arithmetic and A/B');
assert(source.includes("function bodyRadius(u){return(.014+(u.r||8)/1300)*(HEAVY.has(u.type)?1.16:1)}"),'Body radius changed; update contact math');
const HEAVY=new Set(['dragon','beetank','turtle']),body=t=>(.014+(DEF[t].r||8)/1300)*(HEAVY.has(t)?1.16:1);
const visual=t=>body(t)*(['dragon','beetank','turtle'].includes(t)?1.34:1.18);
const contactGap=(a,b)=>visual(a)+visual(b)-(body(a)+body(b))*.22;
const roles=['knight','goblin','beetank','mole','assassin','goose','barbarian','turtle'];
const opponents=['knight','goblin','beetank','turtle','dragon'];
const gaps=roles.map(role=>({role,nominalReach:+(DEF[role].range/500).toFixed(5),
 opponents:opponents.map(target=>({target,adjustedCollisionGap:+contactGap(role,target).toFixed(5),
   reachDeficit:+Math.max(0,contactGap(role,target)-DEF[role].range/500).toFixed(5),
   specialTurtleCorrection:role==='turtle'}))}));
assert(contactGap('knight','beetank')>DEF.knight.range/500,'Nominal Knight range shorter than raw standing Beetank collision reach');
assert(contactGap('goblin','beetank')>DEF.goblin.range/500,'Goblin should currently lack settled Beetank contact reach');
const helper="function meleeContactReach(u,t){return Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)-(bodyRadius(u)+bodyRadius(t))*.22+.002)}";
const insertion='function knightStep(';
assert.equal(source.split(insertion).length,2,'combat insertion moved');
const injected=baseline.replace(insertion,helper+insertion);
const changes={
 goblin:["function goblinStep(u,t,d){const r=u.range/500;","function goblinStep(u,t,d){const r=meleeContactReach(u,t);"],
 beetank:["function beetankStep(u,t,d){const r=u.range/500;","function beetankStep(u,t,d){const r=meleeContactReach(u,t);"]
};
// Knight source is the real QA game, not a reconstructed helper-based version.
const variants={baseline,knight:source};
for(const [role,[old,newCode]] of Object.entries(changes)){
 assert.equal(injected.split(old).length,2,'role step changed '+role);
 variants[role]=injected.replace(old,newCode);
}
let combined=source.replace(insertion,helper+insertion);
for(const [role,[old,newCode]] of Object.entries(changes)){assert.equal(combined.split(old).length,2,'combined anchor '+role);combined=combined.replace(old,newCode)}
variants.combined=combined;
const observe=s=>s.replace(hitAnchor,hitAnchor+
 "if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,role:a.type,level:a.level,team:a.team,targetRole:t.type,damage:dealt,attacker:a.id,target:t.id,x:t.x,y:t.y});");
function simulate(code,{attacker,target,level,seed,mirror,frames=85,count=2,mode='duel'},audit=true){
 let now=0,q=new Map(),id=0,hits=[],errors=[];
 const digest=crypto.createHash('sha256');
 const env={window:null,Math,performance:{now:()=>now},requestAnimationFrame(f){const k=++id;q.set(k,f);return k},
 cancelAnimationFrame(k){q.delete(k)},console:{error:(...a)=>errors.push(a.join(' '))}};
 env.window=env;env.__qaHit=h=>hits.push(h);
 vm.createContext(env);for(const x of ['evolution-rules','ultimate-abilities'])vm.runInContext(read(x),env,{filename:x+'.js'});
 vm.runInContext(audit?observe(code):code,env,{filename:'contact-reach-qa.js'});
 const sim=env.LegacySimCore,side=mirror?'red':'blue';
 let blue,red;
 if(mode==='duel'){blue=[{type:mirror?target:attacker,level,squad:0}];red=[{type:mirror?attacker:target,level,squad:0}]}
 else{
  const t=['knight','goblin','beetank','turtle','dragon','mole','assassin','sniper','barbarian','goose'];
  const heavy=['beetank','turtle','dragon','knight','beetank','turtle','goblin','sniper','mole','barbarian'];
  const mixed=[...t],other=[...t].reverse(),pool=mode==='heavy'?[heavy,mixed]:[mixed,other];
  blue=Array.from({length:count/2},(_,i)=>({type:pool[mirror?1:0][i%10],level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
  red=Array.from({length:count/2},(_,i)=>({type:pool[mirror?0:1][i%10],level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
 }
 const speed=mode==='duel'?10:count>=120?1:4;
 sim.configure({seed,speed,onState:()=>{}});sim.deploy(blue,red);sim.setRunning(true);
 for(let i=0;i<frames;i++){
  now+=16.667;const callbacks=[...q.values()];q.clear();for(const fn of callbacks)fn(now);
  const snap=sim.getState();digest.update(JSON.stringify(snap)+'\n');if(snap.winner)break;
 }
 assert.deepEqual(errors,[],'combat errors during '+mode+' '+attacker+' vs '+target);
 const snap=sim.getState();if(!audit)return{hash:digest.digest('hex'),tick:snap.tick};
 const byRole={};
 for(const h of hits){const row=byRole[h.role]||(byRole[h.role]={damage:0,hits:0});row.damage+=h.damage;row.hits++}
 const actor=hits.filter(h=>h.team===side),opponent=hits.filter(h=>h.team!==side);
 const teams={};for(const side of ['blue','red']){const a=snap.units.filter(x=>x.team===side);teams[side]={alive:a.filter(u=>u.hp>0).length,
  remainingHp:+a.reduce((n,u)=>n+u.hp,0).toFixed(1)}}
 return{hash:digest.digest('hex'),tick:snap.tick,winner:snap.winner||null,censored:!snap.winner,
  actorPositiveHits:actor.length,actorDamage:+actor.reduce((n,h)=>n+h.damage,0).toFixed(1),
  opponentPositiveHits:opponent.length,opponentDamage:+opponent.reduce((n,h)=>n+h.damage,0).toFixed(1),
  byRole:Object.fromEntries(Object.entries(byRole).map(([k,v])=>[k,{hits:v.hits,damage:+v.damage.toFixed(1)}])),
  teams};
}
const smoke={attacker:'knight',target:'goblin',level:1,seed:1337,mirror:false};
assert.equal(simulate(baseline,smoke,false).hash,simulate(baseline,smoke,true).hash,'Damage observer must not alter previous Knight simulator');
assert.equal(simulate(source,smoke,false).hash,simulate(source,smoke,true).hash,'Damage observer must not alter shipped Knight simulator');
const pairs=[['knight','beetank'],['knight','turtle'],['knight','dragon'],
 ['goblin','beetank'],['goblin','turtle'],['goblin','dragon'],
 ['beetank','beetank'],['beetank','turtle'],['beetank','dragon'],
 ['knight','knight'],['goblin','goblin'],['beetank','goblin']];
const duels=[];
for(const [attacker,target] of pairs)for(const level of [1,4,5])for(const seed of [1337,9917])for(const mirror of [false,true]){
 const cfg={attacker,target,level,seed,mirror};
 const control=simulate(baseline,cfg),relevant=['knight','goblin','beetank'].includes(attacker)?attacker:null;
 const variant=relevant?simulate(variants[relevant],cfg):control;
 if((attacker==='knight'&&target==='knight')||(attacker==='goblin'&&target==='goblin')||(attacker==='beetank'&&target==='goblin')){
  assert.equal(variant.hash,control.hash,'unaffected light melee must remain exact state parity '+JSON.stringify(cfg));
 }
 duels.push({attacker,target,level,seed,mirror,baseline:{ticks:control.tick,hits:control.actorPositiveHits,damage:control.actorDamage,
    foeDamage:control.opponentDamage,winner:control.winner,censored:control.censored},
  candidate:{ticks:variant.tick,hits:variant.actorPositiveHits,damage:variant.actorDamage,foeDamage:variant.opponentDamage,
    winner:variant.winner,censored:variant.censored}});
}
const armies=[];
for(const count of [40,80,120])for(const mode of ['mixed','heavy'])for(const seed of [1337,9917])for(const mirror of [false,true]){
 const cfg={attacker:'knight',target:'beetank',level:1,seed,mirror,count,mode,frames:count===120?18:44};
 const a=simulate(baseline,cfg),v=simulate(variants.combined,cfg);
 const trim=x=>({tick:x.tick,winner:x.winner,actorDamage:x.actorDamage,opponentDamage:x.opponentDamage,
  teams:x.teams,byRole:x.byRole,censored:x.censored});
 armies.push({count,mode,mirror,seed,baseline:trim(a),candidate:trim(v)});
}
const summary=Object.fromEntries(['knight','goblin','beetank'].map(role=>{
 const rows=duels.filter(x=>x.attacker===role&&x.target!==role||x.attacker===role&&x.target===role);
 return[role,{duels:rows.length,baselineDamage:+rows.reduce((n,x)=>n+x.baseline.damage,0).toFixed(1),
  candidateDamage:+rows.reduce((n,x)=>n+x.candidate.damage,0).toFixed(1),
  duelsImproved:rows.filter(x=>x.candidate.damage>x.baseline.damage).length,
  duelsWorsened:rows.filter(x=>x.candidate.damage<x.baseline.damage).length}];
}));
const report={status:'Shipped QA Knight contact reach vs reconstructed original; Goblin/Beetank are isolated research only',geometry:gaps,duels,armies,summary,
 caveats:'Collision settle geometry is a reach warning, not proof a fighter cannot strike. Censored duels must not be interpreted as wins. Candidate expands only effective melee reach against large target spacing, never sprite geometry, HP, damage, cooldown or formation. All role changes are proposed and separated; combined mixed-army trial is research only. Workload is synthetic Node VM, not actual iPhone Safari.',
 baselineInstrumentationParity:true};
if(process.env.QA_MELEE_RECEIPT)fs.writeFileSync(process.env.QA_MELEE_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('MELEE CONTACT SUMMARY '+JSON.stringify({summary,armyCases:armies.length,duelCases:duels.length}));
console.log('PASS: source-anchored melee contact mismatches, exact control parity, mirrored L1/L4/L5 duels and mixed armies');
