'use strict';
// B2 QA research ONLY. Preserve original RC4, measure actual damage-edge fronts.
// A soft target lane affinity is strongest in 2-40 body battles and tapers out
// by 60 deployed units (dead units remain in RC4 array, so it never reactivates).
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const current=read('v3/legacy-sim-core.js'),frontQA=read('tools/qa/check-role-fronts-baseline.cjs');
const anchor="s=d+Math.max(0,pressure-2)*.035;";
const targetReplacement="s=d+Math.max(0,pressure-2)*.035+(laneWeight&&!BACK.has(u.type)&&u.type!=='assassin'&&u.type!=='mole'?Math.abs(dy)*laneWeight:0);";
const nearestAnchor="function nearest(u,preferBack=false){";
const shippedOpening="function nearest(u,preferBack=false){const laneWeight=units.length<=40?.12:units.length<60?(60-units.length)*.006:0;";
assert.equal(current.split(shippedOpening).length,2,'shipped local-lane policy changed; revalidate population gates');
assert.equal(current.split(targetReplacement).length,2,'shipped tactical score changed');
const shipped=current.replace(shippedOpening,nearestAnchor).replace(targetReplacement,anchor);
assert.equal(shipped.split(anchor).length,2,'original RC4 targeting could not be reconstructed');
const candidate=current;
assert.notEqual(shipped,candidate,'original and shipped trial must differ');
const graphStart=frontQA.indexOf('const cell='),graphEnd=frontQA.indexOf('// Synthetic truth fixtures',graphStart);
assert(graphStart>=0&&graphEnd>graphStart,'real damage-front measurement source moved');
const damageFronts=vm.runInNewContext(frontQA.slice(graphStart,graphEnd)+';damageFronts',{Math});
const hit='const dealt=Math.min(t.hp,dmg);',tickEnd='}separate(false)}function winner(){';
const makeObserved=src=>{
 assert.equal(src.split(hit).length,2,'positive hit hook changed');
 assert.equal(src.split(tickEnd).length,2,'end step hook changed');
 return src.replace(hit,hit+"if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,attacker:a.id,target:t.id,team:a.team,role:a.type,damage:dealt,x:t.x,y:t.y});")
 .replace(tickEnd,'}window.__qaTick(tick,units);separate(false)}function winner(){');
};
const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const formations={
 mixed:[types,types.slice().reverse()],
 heavy:[['beetank','turtle','knight','dragon','barbarian','beetank','turtle','sniper','mole','assassin'],['dragon','beetank','barbarian','turtle','knight','sniper','assassin','goblin','goose','mole']],
 swarm:[['goblin','goose','assassin','goblin','knight','barbarian','mole','sniper','goblin','goose'],['goblin','goblin','turtle','beetank','dragon','goose','knight','barbarian','mole','sniper']]
};
function test(src,cfg,observed=true){
 let now=0,id=0,queue=new Map(),hits=[],roleTicks={},errors=[],units=null,terminal=null;
 const digest=crypto.createHash('sha256');
 const env={window:null,Math,performance:{now:()=>now},
  requestAnimationFrame(fn){const k=++id;queue.set(k,fn);return k},cancelAnimationFrame(i){queue.delete(i)},
  console:{error:(...a)=>errors.push(a.join(' '))}};
 env.window=env;env.__qaHit=h=>hits.push(h);
 env.__qaTick=(tick,group)=>{
  for(const u of group){
   if(u.hp<=0)continue;
   const row=roleTicks[u.type]||(roleTicks[u.type]={aliveTicks:0,attackTicks:0});
   row.aliveTicks++;
   if(['attack','stab','backstab','peck','horn','snap','axe_swing','rage_swing','fire','fire_windup'].includes(u.action))row.attackTicks++;
  }
 };
 vm.createContext(env);
 for(const dep of ['evolution-rules','ultimate-abilities'])vm.runInContext(read('v3/'+dep+'.js'),env,{filename:dep+'.js'});
 vm.runInContext(observed?makeObserved(src):src,env,{filename:'front-lane-study.js'});
 const core=env.LegacySimCore,p=formations[cfg.mode];
 const roster=side=>Array.from({length:cfg.count/2},(_,i)=>({
  type:cfg.oneVOne?(side==='blue'?cfg.versus[0]:cfg.versus[1]):
    p[cfg.mirror?(side==='blue'?1:0):(side==='blue'?0:1)][i%10],
  level:cfg.oneVOne?cfg.level:[1,2,4,5][i%4],squad:Math.floor(i/6)
 }));
 core.configure({seed:cfg.seed,speed:cfg.speed,onState:()=>{}});
 core.deploy(roster('blue'),roster('red'));core.setRunning(true);
 let frames=0;
 for(let i=0;i<cfg.frames;i++){
  now+=16.667;const task=[...queue.values()];queue.clear();for(const fn of task)fn(now);frames++;
  terminal=core.getState();digest.update(JSON.stringify(terminal)+'\n');if(terminal.winner)break;
 }
 assert.deepEqual(errors,[],'sim threw '+JSON.stringify(cfg));
 const hash=digest.digest('hex');
 if(!observed)return{hash};
 const fronts=damageFronts(hits,terminal.tick,30),byRole={};
 for(const h of hits){const row=byRole[h.role]||(byRole[h.role]={damage:0,hits:0});row.hits++;row.damage+=h.damage;}
 return{hash,frames,lastTick:terminal.tick,winner:terminal.winner||null,
  totalDamage:+hits.reduce((n,h)=>n+h.damage,0).toFixed(2),attackers:new Set(hits.map(h=>h.attacker)).size,
  separated:fronts.windowsWithTwoGeographicallySeparatedDamageComponents,
  persistent:fronts.consecutivePersistentMultiFrontWindows,
  windows:fronts.totalWindows,
  roles:Object.fromEntries(Object.entries(byRole).map(([k,v])=>[k,{hits:v.hits,damage:+v.damage.toFixed(2),aliveTicks:roleTicks[k]?.aliveTicks||0}]))};
}
for(const cfg of [{count:20,mode:'mixed',seed:1337,mirror:false,speed:10,frames:35},
 {count:80,mode:'heavy',seed:9917,mirror:true,speed:10,frames:18}]){
 assert.equal(test(shipped,cfg,true).hash,test(shipped,cfg,false).hash,'instrumented baseline changed game state');
 assert.equal(test(candidate,cfg,true).hash,test(candidate,cfg,false).hash,'instrumented candidate changed game state');
}
const tests=[];
for(const count of [20,40])for(const mode of Object.keys(formations))for(const seed of [1337,9917,7301,27919])for(const mirror of [false,true]){
 tests.push({count,mode,seed,mirror,speed:10,frames:count===20?67:60});
}
for(const count of [60,80,120,300])for(const mode of (count>=120?['mixed']:['mixed','heavy']))for(const seed of (count===300?[1337]:[1337,9917]))for(const mirror of [false,true]){
 tests.push({count,mode,seed,mirror,speed:count>=120?1:10,frames:count===300?15:count===120?30:count===80?28:42});
}
for(const [a,z] of [['knight','goblin'],['assassin','sniper'],['turtle','turtle'],['goblin','beetank']])for(const level of [1,4,5]){
 tests.push({count:2,mode:'mixed',seed:1337,mirror:false,speed:10,frames:65,oneVOne:true,versus:[a,z],level});
}
const rows=[];
for(const cfg of tests){
 const a=test(shipped,cfg,true),v=test(candidate,cfg,true);
 const {hash:baselineHash,...baseline}=a,{hash:candidateHash,...trial}=v;
 if(cfg.count>=60||cfg.count===2)
  assert.equal(candidateHash,baselineHash,'small-battle rule changed >=60 or one-on-one trace: '+JSON.stringify(cfg));
 rows.push({cfg,baseline,trial,exactTraceParity:candidateHash===baselineHash});
 console.log('LOCAL FRONT CASE '+JSON.stringify({count:cfg.count,mode:cfg.mode,seed:cfg.seed,mirror:cfg.mirror,
  baselineFronts:baseline.separated,trialFronts:trial.separated,baselinePersistent:baseline.persistent,trialPersistent:trial.persistent,exactTraceParity:candidateHash===baselineHash}));
}
const summary={};
for(const n of [2,20,40,60,80,120,300]){
 const rowsAt=rows.filter(r=>r.cfg.count===n);
 summary[n]={cases:rowsAt.length,
  baselineSeparated:rowsAt.reduce((a,r)=>a+r.baseline.separated,0),
  trialSeparated:rowsAt.reduce((a,r)=>a+r.trial.separated,0),
  baselinePersistent:rowsAt.reduce((a,r)=>a+r.baseline.persistent,0),
  trialPersistent:rowsAt.reduce((a,r)=>a+r.trial.persistent,0),
  baselineDamage:+rowsAt.reduce((a,r)=>a+r.baseline.totalDamage,0).toFixed(1),
  trialDamage:+rowsAt.reduce((a,r)=>a+r.trial.totalDamage,0).toFixed(1),
  improved:rowsAt.filter(r=>r.trial.separated>r.baseline.separated).length,
  worsened:rowsAt.filter(r=>r.trial.separated<r.baseline.separated).length,
  allExactTraceParity:rowsAt.every(r=>r.exactTraceParity)
 };
}
const receipt={status:'Shipped QA soft-lane policy versus reconstructed original RC4; pending release CI',
 caveats:'Not an Engagement Director or fixed lane; no spawn, speed, target lock or DPS change. Target preference is local, frontliners only, softly faded from 40 to 60 deployed units, off above 60. One-on-one and >=60 must retain exact original state traces. Censored matches not win rates. 300 test deliberately early.',
 summary,rows};
if(process.env.QA_FRONT_LANE_RECEIPT)fs.writeFileSync(process.env.QA_FRONT_LANE_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('LOCAL FRONT LANE SUMMARY '+JSON.stringify(summary));
console.log('PASS: genuine damage fronts, 2/60/80/120/300 combat-state conservation, mirrored small-battle role contribution');
