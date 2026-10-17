'use strict';
// Source-only: evaluate landed, physical L4 Assassin hits during actual ranged windups.
// No denied-shot claims: this runner does not modify original combat.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const accepted=fs.readFileSync(path.join(__dirname,'check-draft-evolution-choice-value.cjs'),'utf8');
function replaceOnce(s,a,b){assert.equal(s.split(a).length,2,'unique anchor drift: '+a.slice(0,90));return s.replace(a,b)}
const boundary='const fixtures=[];';
assert.equal(accepted.split(boundary).length,2);
let source=accepted.slice(0,accepted.indexOf(boundary));
const addition=[
'const telegraphCore=replace(replace(replace(replace(witnessedCore,',
" 'const dealt=Math.min(t.hp,dmg);',",
" 'const dealt=Math.min(t.hp,dmg);if(!secondary&&dealt>0&&a&&a.type===\\'assassin\\'&&a.action===\\'backstab\\'&&a.level===4&&(t.type===\\'sniper\\'||t.type===\\'dragon\\'))window.__qaThreatHit({attacker:a.id,target:t.id,targetRole:t.type,tick,damage:dealt,aim:t.aim||0,windup:t.windup||0,preHp:t.hp,stun:t.stun||0,recover:tick-t.hitTick});',",
" 'u.special--;if(d>r){if(u.special<=0&&d<.42)',",
" 'window.__qaThreatStep({attacker:u.id,level:u.level,target:t.id,targetRole:t.type,tick,dist:d,reach:r,cooldown:u.cooldown,aim:t.aim||0,windup:t.windup||0});u.special--;if(d>r){if(u.special<=0&&d<.42)',",
" \"u.action='attack';hit(u,t);u.aim=0;u.cooldown=u.cd;\",",
" \"u.action='attack';window.__qaThreatShot({role:'sniper',id:u.id,team:u.team,target:t.id,tick});hit(u,t);u.aim=0;u.cooldown=u.cd;\"),",
" \"u.action='fire';dragonBreath(u,t);u.cooldown=u.cd\",",
" \"u.action='fire';window.__qaThreatShot({role:'dragon',id:u.id,team:u.team,target:t.id,tick});dragonBreath(u,t);u.cooldown=u.cd\");"
].join('\n');
source=replaceOnce(source,"const g=read('tools/qa/check-role-fronts-baseline.cjs')",addition+"\nconst g=read('tools/qa/check-role-fronts-baseline.cjs')");
source=replaceOnce(source,'hits=[],reflect=[],guards=[],pending=null','hits=[],reflect=[],guards=[],threatSteps=[],threatHits=[],threatShots=[],pending=null');
source=replaceOnce(source,'env.__qaHit=x=>hits.push(x);',
 'env.__qaHit=x=>hits.push(x);\n env.__qaThreatStep=x=>threatSteps.push(x);\n env.__qaThreatHit=x=>threatHits.push(x);\n env.__qaThreatShot=x=>threatShots.push(x);');
source=replaceOnce(source,'vm.runInContext(observed?witnessedCore:live,env);','vm.runInContext(observed?telegraphCore:live,env);');
source=replaceOnce(source,'realSeparatedDamageWindows:front.windowsWithTwoGeographicallySeparatedDamageComponents};',
 'realSeparatedDamageWindows:front.windowsWithTwoGeographicallySeparatedDamageComponents,threat:{steps:threatSteps.filter(x=>chosen.has(x.attacker)&&x.level===4),hits:threatHits.filter(x=>chosen.has(x.attacker)),shots:threatShots.filter(x=>x.team!==c.side)}};');
const {simulate,modes,choices}=vm.runInNewContext(source+'\n;({simulate,modes,choices})',
 {require,__dirname,console,process},{filename:'source-only-assassin-telegraph.cjs'});
assert.equal(Array.from(choices).join(','),'hold,evolve,recruit2,evolveBeetank');
const our=['TARGET','knight','TARGET','goblin','barbarian','beetank','goose','TARGET','sniper','mole'];
const easy=['goblin','goblin','goose','goblin','barbarian','knight','goblin','beetank','turtle','mole'];
const ranged=['sniper','sniper','dragon','dragon','sniper','knight','beetank','turtle','mole','barbarian'];
const armored=['beetank','beetank','dragon','turtle','knight','barbarian','beetank','sniper','mole','assassin'];
const order=[0,2,1,3,4,6],patterns=[];
for(const [family,foe] of [['ranged',ranged],['armored',armored]])for(const degree of (family==='ranged'?[1,3,6]:[1,3])){
 const enemy=easy.slice();for(const i of order.slice(0,degree))enemy[i]=foe[i];
 const mode=family+'-'+degree;modes[mode]={ours:our.slice(),foe:enemy};patterns.push({mode,foe:enemy.slice()});
}
assert.equal(patterns.length,5);
const candidates=['hold','evolve','evolveBeetank'];
const active=x=>x.aim>0||x.windup>0;
function measurements(t){
 const {steps,hits,shots}=t,sum=(arr,key)=>+arr.reduce((a,x)=>a+x[key],0).toFixed(2),n=arr=>arr.length;
 return{
  enemySniperRifleShots:n(shots.filter(x=>x.role==='sniper')),
  enemyDragonBreaths:n(shots.filter(x=>x.role==='dragon')),
  chosenL4BacklineDecisionTicks:n(steps),
  activeTelegraphApproachTicks:n(steps.filter(active)),
  activeTelegraphStrikeReadyWithinReachTicks:n(steps.filter(x=>active(x)&&x.cooldown<=0&&x.dist<=x.reach)),
  activeTelegraphStrikeReadyOutOfReachTicks:n(steps.filter(x=>active(x)&&x.cooldown<=0&&x.dist>x.reach)),
  positiveHpBacklineBackstabs:n(hits),
  positiveHpBacklineBackstabDamage:sum(hits,'damage'),
  backstabsDuringActiveTelegraph:n(hits.filter(active)),
  hpDuringActiveTelegraph:sum(hits.filter(active),'damage'),
  activeSniperAimHits:n(hits.filter(x=>x.targetRole==='sniper'&&x.aim>0)),
  activeDragonWindupHits:n(hits.filter(x=>x.targetRole==='dragon'&&x.windup>0)),
  telegraphHitPriorUnstunnedRecover:n(hits.filter(x=>active(x)&&x.stun<=0&&x.recover>3))
 };
}
const discovery=[],unseen=[];
for(const count of [20,40])for(const {mode} of patterns)for(const seed of [5003,7027,9173])
 for(const side of ['blue','red']){
  const fixture={role:'assassin',level:3,count,seed,side,mode};
  const variants={};
  for(const choice of candidates){
   const z=simulate({...fixture,choice});
   assert([0,1].includes(z.win),'full terminal match');
   assert(z.nominatedDirectHp>=0&&z.realPersistentFronts>=0);
   assert(z.threat.hits.every(h=>h.damage>0&&h.attacker>0&&h.target>0&&Number.isFinite(h.damage)),'physical positive HP strike');
   if(choice!=='evolve')assert.equal(z.threat.hits.length,0,'L3 selected cannot produce L4 hit');
   variants[choice]={win:z.win,winner:z.winner,
    physicalHp:z.nominatedDirectHp,independentDamageFronts:z.realPersistentFronts,
    separatedHpWindows:z.realSeparatedDamageWindows,counters:measurements(z.threat),
    physicalTelegraphBackstabs:z.threat.hits.filter(active)};
  }
  (seed===9173?unseen:discovery).push({fixture,variants});
 }
assert.equal(discovery.length,40);assert.equal(unseen.length,20);
let parityPairs=0;
for(const count of [20,40])for(const mode of ['ranged-1','ranged-6','armored-3'])
 for(const choice of ['hold','evolve']){
  const c={role:'assassin',level:3,count,mode,seed:9173,side:'blue',choice};
  assert.equal(simulate(c,true,true).digest,simulate(c,false,true).digest,
    'read-only telemetry changed full original simulation RAF SHA '+JSON.stringify(c));
  parityPairs++;
 }
assert.equal(parityPairs,12);
function summarize(rows){
 const out={groups:rows.length};
 for(const choice of candidates){
  const list=rows.map(x=>x.variants[choice]),keys=Object.keys(list[0].counters);
  out[choice]={wins:list.reduce((n,x)=>n+x.win,0),
   nominatedPhysicalHp:+list.reduce((n,x)=>n+x.physicalHp,0).toFixed(2),
   independentDamageFronts:list.reduce((n,x)=>n+x.independentDamageFronts,0),
   realSeparatedWindows:list.reduce((n,x)=>n+x.separatedHpWindows,0),
   observed:Object.fromEntries(keys.map(k=>[k,+list.reduce((n,x)=>n+x.counters[k],0).toFixed(2)]))};
 }
 return out;
}
const report={status:'SOURCE OBSERVER ONLY - no shots blocked or future attack prevented, no ability or runtime patch',
 method:'180 genuine fully terminal choice variants: 2 body counts x 5 prespecified enemy mixtures x 2 discovery seeds 5003/7027 plus 1 independent holdout 9173 x 2 side mirrors x 3 choices hold/Assassin L4/Beetank L4. 12 observed-vs-raw full RAF SHA equality pairs. Physical positive-HP backstab against actual still-aiming Sniper or winding-up Dragon is classified as an overlap, NOT a denied shot. Enemy completed rifle and breath counts are recorded.',
 acceptedSourceSha256:crypto.createHash('sha256').update(accepted).digest('hex'),
 patterns,parityPairs,summary:{discovery:summarize(discovery),unseen:summarize(unseen)},discovery,unseen};
if(process.env.QA_ASSASSIN_THREAT_RECEIPT)fs.writeFileSync(process.env.QA_ASSASSIN_THREAT_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('ASSASSIN BACKLINE TELEGRAPH OPPORTUNITY '+JSON.stringify(report.summary));
console.log('PASS: 180 source-actual terminal matches and 12 full-state RAF parity pairs; no gameplay source changed');
