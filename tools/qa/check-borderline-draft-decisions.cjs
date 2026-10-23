'use strict';
// Source-only: call the established fully terminal, physical-HP choice observer.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const original=fs.readFileSync(path.join(__dirname,'check-draft-evolution-choice-value.cjs'),'utf8');
function once(s,a,b){assert.equal(s.split(a).length,2,'observer anchor drift: '+a.slice(0,85));return s.replace(a,b)}
const cutoff='const fixtures=[];';
assert.equal(original.split(cutoff).length,2,'fixture boundary drift');
let source=original.slice(0,original.indexOf(cutoff));
source=once(source,"const g=read('tools/qa/check-role-fronts-baseline.cjs')",
 "const killObservedCore=replace(witnessedCore,'t.hp=Math.max(0,t.hp-dmg);',"+
 "'t.hp=Math.max(0,t.hp-dmg);if(wasAlive&&t.hp<=0&&a)window.__qaKill({attacker:a.id,role:a.type,target:t.id,targetRole:t.type,tick});');\n"+
 "const g=read('tools/qa/check-role-fronts-baseline.cjs')");
source=once(source,'hits=[],reflect=[],guards=[],pending=null','hits=[],reflect=[],guards=[],kills=[],pending=null');
source=once(source,'env.__qaHit=x=>hits.push(x);','env.__qaHit=x=>hits.push(x);\n env.__qaKill=x=>kills.push(x);');
source=once(source,'vm.runInContext(observed?witnessedCore:live,env);','vm.runInContext(observed?killObservedCore:live,env);');
source=once(source,'realSeparatedDamageWindows:front.windowsWithTwoGeographicallySeparatedDamageComponents};',
 'realSeparatedDamageWindows:front.windowsWithTwoGeographicallySeparatedDamageComponents,killingBlows:kills};');
const {simulate,modes,choices}=vm.runInNewContext(source+'\n;({simulate,modes,choices})',
 {require,__dirname,console,process},{filename:'accepted-choice-observer-subset.cjs'});
assert.equal(choices.join(','),'hold,evolve,recruit2,evolveBeetank');
const friendly=['TARGET','knight','TARGET','goblin','barbarian','beetank','goose','TARGET','sniper','mole'];
const easy=['goblin','goblin','goose','goblin','barbarian','knight','goblin','beetank','turtle','mole'];
const hard={
 ranged:['sniper','sniper','dragon','dragon','sniper','knight','beetank','turtle','mole','barbarian'],
 armored:['beetank','beetank','dragon','turtle','knight','barbarian','beetank','sniper','mole','assassin']
};
const patterns=[],order=[0,2,1,3,4,6];
for(const track of ['ranged','armored'])for(let step=1;step<=6;step++){
 const foe=easy.slice();for(const i of order.slice(0,step))foe[i]=hard[track][i];
 const mode=track+'-'+step;
 modes[mode]={ours:friendly.slice(),foe};
 patterns.push({mode,track,step,ours:friendly.slice(),foe:foe.slice()});
}
assert.equal(patterns.length,12);
function battle(fixture){
 const variants={};
 for(const choice of choices){
  const z=simulate({...fixture,choice});
  assert(z.win===0||z.win===1,'genuine terminal winner');
  assert(z.nominatedDirectHp>=0&&z.nominatedReflectedHp>=0&&z.nominatedRealAllyHpSaved>=0);
  assert(z.realPersistentFronts>=0&&z.realSeparatedDamageWindows>=0);
  assert(Array.isArray(z.killingBlows),'actual lethal hit receipt');
  variants[choice]=z;
 }
 return{fixture,variants};
}
const discovery=[];
for(const role of ['assassin','turtle'])for(const count of [20,40])
 for(const {mode} of patterns)for(const seed of [1337,2017])for(const side of ['blue','red'])
  discovery.push(battle({role,level:3,count,mode,seed,side}));
assert.equal(discovery.length,192);
const shortlist=[];
for(const role of ['assassin','turtle'])for(const count of [20,40]){
 const ranked=patterns.map(p=>{
  const rows=discovery.filter(r=>r.fixture.role===role&&r.fixture.count===count&&r.fixture.mode===p.mode);
  const holdWins=rows.reduce((s,r)=>s+r.variants.hold.win,0);
  const evolveWins=rows.reduce((s,r)=>s+r.variants.evolve.win,0);
  const flips=rows.reduce((s,r)=>s+choices.slice(1).filter(c=>r.variants[c].win!==r.variants.hold.win).length,0);
  return{role,count,mode:p.mode,holdWins,evolveWins,flips,score:10*flips+(holdWins>0&&holdWins<4?4:0)};
 });
 ranked.sort((a,b)=>b.score-a.score||a.mode.localeCompare(b.mode));
 shortlist.push(...ranked.slice(0,2));
}
assert.equal(shortlist.length,8);
const unseen=[];
for(const s of shortlist)for(const seed of [4049,9091])for(const side of ['blue','red'])
 unseen.push(battle({role:s.role,level:3,count:s.count,mode:s.mode,seed,side}));
assert.equal(unseen.length,32);
let parityChecks=0;
for(const role of ['assassin','turtle'])for(const count of [20,40]){
 const mode=shortlist.find(s=>s.role===role&&s.count===count).mode;
 for(const choice of choices){
  const c={role,level:3,count,mode,seed:4049,side:'red',choice};
  assert.equal(simulate(c,true,true).digest,simulate(c,false,true).digest,
   'read-only observer altered physical RAF state: '+JSON.stringify(c));
  parityChecks++;
 }
}
function summary(rows){
 const out={matchedGroups:rows.length,completedTerminalMatches:rows.length*choices.length};
 for(const choice of choices){
  const zs=rows.map(r=>r.variants[choice]),total=k=>+zs.reduce((n,z)=>n+z[k],0).toFixed(2);
  out[choice]={
   wins:total('win'),flipsVsHold:rows.filter(r=>r.variants[choice].winner!==r.variants.hold.winner).length,
   directPhysicalHp:total('nominatedDirectHp'),reflectedPhysicalHp:total('nominatedReflectedHp'),
   guardianHpSavedBeyondKnight:total('nominatedRealAllyHpSaved'),beetankDirectHp:total('beetankDirectHp'),
   enemyHpRemoved:total('enemyHpRemoved'),truePersistentFronts:total('realPersistentFronts'),
   separatedPositiveHpWindows:total('realSeparatedDamageWindows'),
   lethalDirectHits:zs.reduce((n,z)=>n+z.killingBlows.length,0),
   lethalBacklineDirectHits:zs.reduce((n,z)=>n+z.killingBlows.filter(k=>k.targetRole==='sniper'||k.targetRole==='dragon').length,0),
   lethalHitsBySelectedFamily:zs.reduce((n,z)=>n+z.killingBlows.filter(k=>k.role===rows[0].fixture.role).length,0)
  };
 }
 return out;
}
const summaries={};
for(const stage of ['discovery','unseen'])for(const role of ['assassin','turtle'])for(const count of [20,40]){
 const rows=(stage==='discovery'?discovery:unseen).filter(r=>r.fixture.role===role&&r.fixture.count===count);
 summaries[stage+'-'+role+'-'+count]=summary(rows);
}
const receipt={
 status:'QA source-only; no game mechanic, Guide, PWA, main or prod changes',
 sourceSha256:crypto.createHash('sha256').update(original).digest('hex'),
 method:'Fixed nominated L3 Assassin/Turtle + L3 Beetank same-team 20/40 body; 12 ranged/armored mixed enemy patterns, seeds 1337/2017 and both side mirrors discovery, select 2 patterns per role/pop on winner-choice flips and non-saturation; unseen seeds 4049/9091 with both side mirrors. Same four actual draft choice alternatives. Preserve real HP, actual source-null reflection, Guardian beyond Knight and damage-connected separate fronts. Lethal direct-hit attribution by physical IDs excludes reflection fatalities; it does not prove a shot was denied. Selection-biased discovery is not validation; Node is not Safari.',
 choices:Array.from(choices),patterns,shortlist,parityChecks,summaries,discovery,unseen
};
if(process.env.QA_BORDERLINE_RECEIPT)fs.writeFileSync(process.env.QA_BORDERLINE_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('BORDERLINE SHORTLIST '+JSON.stringify(shortlist));
console.log('BORDERLINE UNSEEN '+JSON.stringify(Object.fromEntries(Object.entries(summaries).filter(([k])=>k.startsWith('unseen-')))));
console.log('PASS: 896 genuinely terminal source match variants; 16 observed/raw RAF parity pairs');
