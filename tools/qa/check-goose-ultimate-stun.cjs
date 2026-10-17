'use strict';
// Goose L4/L5 Thunder Honk gameplay QA. True simulated stun-time rather than visual proximity.
// Control = exact prior 22/32-tick Ultimate. This is a gameplay change, not visual telemetry.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const live=read('v3/ultimate-abilities.js'),core=read('v3/legacy-sim-core.js');
const old="v.stun=Math.max(v.stun,r===2?32:22);";
const now="v.stun=Math.max(v.stun,r===2?64:44);";
assert.equal(live.split(now).length,2,'Goose actual stun timing changed: review duration/role counterplay');
const former=read('tools/qa/fixtures/goose-before-impact-ultimate.js');
assert.equal(former.split(now).length,2,'former Goose primary stun baseline moved');
// Old Goose-only behavior projected into the CURRENT premium-Barbarian
// source. Merely loading the full historic Ultimate would also remove
// Premium Cleave, falsely failing the no-Goose physics parity contract.
const priorGoose=former.replace(now,old);
const from=priorGoose.indexOf('function honk(u,units,tick){'),to=priorGoose.indexOf('function burn(u)',from);
const lo=live.indexOf('function honk(u,units,tick){'),hi=live.indexOf('function burn(u)',lo);
assert(from>0&&to>from&&lo>0&&hi>lo,'Goose honk source boundaries must remain stable');
const legacy=live.slice(0,lo)+priorGoose.slice(from,to)+live.slice(hi);
assert.equal(legacy.split(old).length,2,'historic Goose duration must be reconstructable');
const mixed=['goose','goose','knight','barbarian','goblin','assassin','mole','sniper','dragon','turtle'];
const modes={
 melee:[['goose','goose','goose','goose','goose','knight','barbarian','goblin','turtle','beetank'],
   ['knight','knight','barbarian','beetank','turtle','goblin','assassin','mole','goose','beetank']],
 ranged:[['goose','goose','goose','goose','goose','knight','barbarian','goblin','assassin','mole'],
   ['sniper','sniper','dragon','dragon','sniper','turtle','beetank','knight','goblin','mole']],
 mixed:[['goose','goose','goose','knight','barbarian','goblin','turtle','assassin','beetank','dragon'],
   ['sniper','dragon','knight','turtle','goose','goose','beetank','goblin','mole','assassin']],
 noGoose:[['assassin','knight','barbarian','goblin','turtle','beetank','dragon','sniper','mole','knight'],
   ['sniper','dragon','beetank','knight','mole','assassin','barbarian','goblin','turtle','sniper']]
};
function trial(src,c,instrument=true){
 let clock=0,seq=0,q=new Map(),errors=[],states=crypto.createHash('sha256');
 const seen={stunned:{blue:0,red:0},honk:0,gooseHits:0,gooseDamage:0};let latest;
 const env={window:null,Math,performance:{now:()=>clock},console:{error:(...args)=>errors.push(args.join(' '))},
   requestAnimationFrame(fn){const id=++seq;q.set(id,fn);return id},cancelAnimationFrame(id){q.delete(id)}};
 env.window=env;
 env.__onStun=team=>{seen.stunned[team]++};
 env.__onHonk=()=>seen.honk++;
 env.__onHit=(role,dealt)=>{if(role==='goose'){seen.gooseHits++;seen.gooseDamage+=dealt}};
 vm.createContext(env);
 vm.runInContext(read('v3/evolution-rules.js'),env);
 const uObserved=instrument?src.replace("if(hits.length)cue(u,'thunder',tick,hits[0].target);",
  "if(hits.length){window.__onHonk();cue(u,'thunder',tick,hits[0].target);}") :src;
 assert(!instrument||uObserved!==src,'cannot instrument real Thunder Honk');
 vm.runInContext(uObserved,env);
 const step=core.replace("if(u.stun>0){u.stun--;","if(u.stun>0){window.__onStun(u.team);u.stun--;")
  .replace("const dealt=Math.min(t.hp,dmg);","const dealt=Math.min(t.hp,dmg);if(dealt>0&&a)window.__onHit(a.type,dealt);");
 vm.runInContext(instrument?step:core,env);
 const sim=env.LegacySimCore;
 const roster=team=>{
  const pat=modes[c.mode][team==='blue'?(c.mirror?1:0):(c.mirror?0:1)];
  return Array.from({length:c.count/2},(_,i)=>({type:pat[i%pat.length],level:c.level,squad:Math.floor(i/5)}));
 };
 sim.configure({seed:c.seed||1337,speed:c.speed||10,onState:()=>{}});sim.deploy(roster('blue'),roster('red'));sim.setRunning(true);
 for(let f=0;f<c.frames;f++){
  clock+=16.667;const tasks=[...q.values()];q.clear();for(const fn of tasks)fn(clock);
  latest=sim.getState();states.update(JSON.stringify(latest)+'\n');if(latest.winner)break;
 }
 assert.deepEqual(errors,[],'simulation error');
 assert.equal(latest.units.length,c.count,'uncapped deployed population');
 assert(latest.units.every(u=>Number.isFinite(u.x)&&Number.isFinite(u.y)&&Number.isFinite(u.hp)),'all unit coordinates/HP finite');
 const gooseTeam=c.mirror?'red':'blue',opponent=gooseTeam==='blue'?'red':'blue';
 return{sha:states.digest('hex'),winner:latest.winner,tick:latest.tick,gooseTeamWins:latest.winner===gooseTeam,
  opponentWins:latest.winner===opponent,stunnedEnemy:seen.stunned[opponent],honk:seen.honk,
  gooseDamage:+seen.gooseDamage.toFixed(2),gooseHits:seen.gooseHits};
}
// Isolated L1-L5 abilities: no ranged control extension before Ultimate; exact delivered duration for L4/5.
const e={window:null,Math};e.window=e;vm.createContext(e);
vm.runInContext(read('v3/evolution-rules.js'),e);vm.runInContext(live,e);
for(const level of [1,2,3,4,5]){
 const goose={id:1,type:'goose',level,team:'blue',x:.5,y:.5,dmg:100},
  foe={id:2,type:'knight',level:1,team:'red',x:.63,y:.5,hp:300,stun:0,burrow:0},
  dealt=e.ShowdownUltimates.honk(goose,[goose,foe],30);
 assert.equal(dealt.length,level>=4?1:0,'Ultimate should only begin at L4');
 assert.equal(foe.stun,level===4?44:level===5?64:0,'44/64 physical stun ticks promised');
 if(level>=4){
 assert(Math.abs(dealt[0].damage-(level===4?75:110))<1e-9,'Impact primary HP damage physical tier contract');
 const victim={id:4,type:'knight',team:'red',level:1,x:level===4?.68:.73,y:.5,hp:300,stun:0,burrow:0};
 const echo={id:3,type:'goblin',team:'red',level:1,x:level===4?.77:.86,y:.5,hp:200,stun:0,burrow:0};
 const hits=e.ShowdownUltimates.honk(goose,[goose,victim,echo],31);
 assert(hits.some(h=>h.target.id===3),'Impact must hit real secondary foe outside primary ring');
 assert.equal(echo.stun,4,'secondary echo must last four ticks only');
 assert(Math.abs(hits.find(h=>h.target.id===3).damage-(level===4?60:83))<1e-9,'secondary HP contribution');
}
}
assert(live.includes('Impact Shockwave')&&live.includes('brief stagger')&&live.includes('without a long secondary stun'),'Ultimate public specs must describe Impact');
const guide=read('v3/v3.js');
assert(guide.includes('Goose Impact Shockwave holds primary enemies for 44 ticks at L4 or 64 ticks at L5; secondary echoes stagger for just 4 ticks'),'Fighter Guide must agree with primary/secondary timing');
for(const c of [{count:20,mode:'melee',level:4,mirror:false,frames:45},
 {count:40,mode:'ranged',level:5,mirror:true,frames:28}]){
 assert.equal(trial(live,c,true).sha,trial(live,c,false).sha,'read-only stun/damage tracking altered physical state');
}
for(const level of [1,2,3])for(const mode of ['melee','ranged'])for(const mirror of [false,true]){
 const c={count:20,mode,level,mirror,frames:72};
 assert.equal(trial(live,c).sha,trial(legacy,c).sha,'L1-L3 Goose balance should not change '+JSON.stringify(c));
}
const rows=[],summary={};
for(const count of [20,40,80])for(const level of [4,5])for(const mode of ['melee','ranged','mixed'])
 for(const seed of [1337,9917])for(const mirror of [false,true]){
  const cfg={count,level,mode,seed,mirror,frames:count===20?165:count===40?115:65},
   before=trial(legacy,cfg),after=trial(live,cfg);
  rows.push({cfg,before,after});
 }
for(const level of [4,5]){
 const a=rows.filter(r=>r.cfg.level===level),sum=(part,key)=>+a.reduce((n,r)=>n+(r[part][key]||0),0).toFixed(2);
 summary[level]={samples:a.length,oldEnemyStunnedTicks:sum('before','stunnedEnemy'),
  newEnemyStunnedTicks:sum('after','stunnedEnemy'),oldGooseDamage:sum('before','gooseDamage'),
  newGooseDamage:sum('after','gooseDamage'),gooseWinsBefore:sum('before','gooseTeamWins'),
  gooseWinsAfter:sum('after','gooseTeamWins'),
  opponentWinsBefore:sum('before','opponentWins'),opponentWinsAfter:sum('after','opponentWins'),
  changedTerminalState:a.filter(r=>r.before.winner!==r.after.winner).length};
 assert(summary[level].newEnemyStunnedTicks>summary[level].oldEnemyStunnedTicks*1.2,
  'the real effective stun uptime did not increase meaningfully');
}
const ranged=rows.filter(r=>r.cfg.mode==='ranged');
assert(ranged.some(r=>r.after.opponentWins),'some genuine ranged counter wins must remain');
for(const count of [80,120,300])for(const speed of [1,10]){
 const cfg={count,mode:'noGoose',level:5,seed:1337,mirror:true,speed,frames:count===300?12:25};
 assert.equal(trial(live,cfg).sha,trial(legacy,cfg).sha,'no-Goose 80/120/300 full state parity '+JSON.stringify(cfg));
}
const report={status:'QA-only live Goose Impact CC timing and genuine counterplay; frozen legacy Goose function on current premium-Barbarian source',
 summary,rows,caveats:'Seeded 20/40/80 samples are censored; not an absolute win-rate, no Safari FPS measure. Normal L1-L3 honk, radius, damage and cadence unchanged.'};
if(process.env.QA_GOOSE_ULT_RECEIPT)fs.writeFileSync(process.env.QA_GOOSE_ULT_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('GOOSE ULTIMATE STUN COUNTERPLAY '+JSON.stringify(summary));
console.log('PASS: L4 44-tick/L5 64-tick true CC, measured enemy stunned time, ranged counters, L1-L3 and 300 no-Goose physical parity');
