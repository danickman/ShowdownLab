'use strict';
// Live-ecosystem Assassin L4->L5 actual draft choice ROI; source-only; no game/PWA changes.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const baseline=fs.readFileSync(path.join(__dirname,'check-draft-evolution-choice-value.cjs'),'utf8');
const stop='const fixtures=[];';
assert.equal(baseline.split(stop).length,2,'original real-HP draft-choice observer source moved');
const one=(s,a,b)=>{
 assert.equal(s.split(a).length,2,'unique live Assassin ROI anchor drift: '+a.slice(0,85));
 return s.replace(a,b);
};
let pre=baseline.slice(0,baseline.indexOf(stop));
pre=one(pre,"ability=read('tools/qa/fixtures/goose-before-impact-ultimate.js')","ability=read('v3/ultimate-abilities.js')");
pre=one(pre,"const g=read('tools/qa/check-role-fronts-baseline.cjs')",
 "const watchedExecutionAbility=replace(watchedAbility,\"cue(a,'execution',tick,t);return damage\",\"window.__qaExec({attacker:a.id,target:t.id,tick,rank:r});cue(a,'execution',tick,t);return damage\");\nconst g=read('tools/qa/check-role-fronts-baseline.cjs')");
pre=one(pre,'errors=[],hits=[],reflect=[],guards=[],pending=null;','errors=[],hits=[],reflect=[],guards=[],execution=[],pending=null;');
pre=one(pre,'env.__qaHit=x=>hits.push(x);','env.__qaHit=x=>hits.push(x);\n env.__qaExec=x=>execution.push(x);');
pre=one(pre,'vm.runInContext(observed?watchedAbility:ability,env);','vm.runInContext(observed?watchedExecutionAbility:ability,env);');
pre=one(pre,'nominatedCount:chosen.size,beetankCount:bee.size,',
 'nominatedCount:chosen.size,beetankCount:bee.size,\n   executionTriggers:execution.filter(e=>chosen.has(e.attacker)).length,');
new Function('require','__dirname','console','process',pre+'\nreturn true;');
const {simulate,choices,modes}=vm.runInNewContext(pre+'\n;({simulate,choices,modes})',
 {require,__dirname,console,process},{filename:'live-assassin-draft-roi-source.cjs'});
assert.equal(choices.join(','),'hold,evolve,recruit2,evolveBeetank');
const ability=fs.readFileSync(path.join(__dirname,'../../v3/ultimate-abilities.js'),'utf8');
assert(ability.includes('t.hp/t.maxHp<(r===2?.75:.4)'),'current Assassin L5 75% HP Execution gate moved');
assert(ability.includes('r===2?.205:.135'),'current premium Barbarian not loaded');
assert(ability.includes('r===2?.83:.60'),'current Goose Impact not loaded');

const ours=modes.backline.ours.slice(),easy=modes.swarm.foe.slice();
const kindDefs={ranged:modes.backline.foe.slice(),armored:modes.armored.foe.slice()};
const ordering=[0,2,1,3,4],patterns=[];
for(const [kind,challenger] of Object.entries(kindDefs))for(const density of [1,3,5]){
 const foe=easy.slice();
 for(const i of ordering.slice(0,density))foe[i]=challenger[i];
 const label=kind+'-'+density;
 modes[label]={ours:ours.slice(),foe};
 patterns.push({label,kind,density,foe:foe.slice()});
}
assert.equal(patterns.length,6,'six graduated opponent compositions');
assert.equal(ours.filter(x=>x==='TARGET').length,3,'actual 3 nominated Assassins at 20 total');
const seeds=[23801,28019,37339],holdoutSeed=37339;
const fixtures=[];
for(const pattern of patterns)for(const count of [20,40])
 for(const seed of seeds)for(const side of ['blue','red'])
  fixtures.push({role:'assassin',level:4,mode:pattern.label,count,seed,side});
assert.equal(fixtures.length,72,'6 graduated enemy styles x20/40 x3 seeds x2 mirrors');
let parity=0;
for(const count of [20,40])for(const mode of ['ranged-1','ranged-5','armored-1','armored-5'])
 for(const choice of ['hold','evolve']){
  const c={role:'assassin',level:4,mode,count,seed:holdoutSeed,side:'red',choice};
  assert.equal(simulate(c,true,true).digest,simulate(c,false,true).digest,
   'read-only observer must not alter entire physical RAF trace '+JSON.stringify(c));
  parity++;
 }
assert.equal(parity,16);
const cases=[];
for(const fixture of fixtures){
 const variants={};
 for(const choice of choices){
  const z=simulate({...fixture,choice});
  assert([0,1].includes(z.win),'all candidates must terminate with actual win/loss');
  assert(z.nominatedCount===fixture.count/2/10*3+(choice==='recruit2'?2:0),
   'physical nominated Assassin IDs mismatch');
  assert(z.enemyHpRemoved>=z.nominatedDirectHp-1e-5,'selected physical HP exceeds team damage');
  assert(z.realPersistentFronts>=0&&z.realSeparatedDamageWindows>=0,'invalid genuine HP front');
  variants[choice]={
   win:z.win,physicalAssassinHp:+z.nominatedDirectHp.toFixed(2),
   executionTriggers:z.executionTriggers,
   realPersistentFronts:z.realPersistentFronts,
   realSeparatedHpWindows:z.realSeparatedDamageWindows,
   allyHpLost:+z.allyHpLost.toFixed(2),
   enemyHpRemoved:+z.enemyHpRemoved.toFixed(2),
   lastTick:z.ticks
  };
 }
 cases.push({fixture,variants});
}
assert.equal(cases.length*choices.length,288,'288 complete real matching battles');
function summarize(xs){
 const ret={fixtures:xs.length,discordant:xs.filter(x=>new Set(choices.map(c=>x.variants[c].win)).size>1).length};
 for(const choice of choices){
  ret[choice]={};
  for(const metric of ['win','physicalAssassinHp','executionTriggers','realPersistentFronts','realSeparatedHpWindows','enemyHpRemoved','allyHpLost']){
   ret[choice][metric]=+xs.reduce((s,x)=>s+x.variants[choice][metric],0).toFixed(2);
  }
  if(choice!=='hold'){
   ret[choice].newWinsVsHold=xs.filter(x=>x.variants[choice].win===1&&x.variants.hold.win===0).length;
   ret[choice].lostWinsVsHold=xs.filter(x=>x.variants[choice].win===0&&x.variants.hold.win===1).length;
  }
 }
 return ret;
}
const report={};
for(const cohort of ['calibration','heldout']){
 const a=cases.filter(x=>(x.fixture.seed===holdoutSeed)===(cohort==='heldout'));
 report[cohort+'-all']=summarize(a);
 for(const p of patterns)report[cohort+'-'+p.label]=summarize(a.filter(x=>x.fixture.mode===p.label));
 for(const count of [20,40])report[cohort+'-'+count]=summarize(a.filter(x=>x.fixture.count===count));
}
const informative=cases.filter(x=>new Set(choices.map(c=>x.variants[c].win)).size>1);
const result={
 status:'QA-only live Assassin L5 difficulty-gradient discovery; game mechanics unchanged',
 method:'6 enemy patterns, ranged/armored replacement of 1,3,5 real starting fighter slots on same fixed 10-fighter composition; 20/40 total population, both blue/red mirrors, two calibration seeds 23801/28019 and new untouched holdout 37339. Four real choices no upgrade, all nominated 3/6 Assassins evolve L4->L5, +2 L4 Assassin copies, or one/two Beetanks evolve to L5. 72 genuine seeded sets x4 = 288 real terminal battles, 16 exact read-only physical state RAF SHA controls. Primary payoff is win flips in genuinely borderline opponents. Also report Execution events, post-cap nominated actual HP, true separated physical HP damaging fronts/windows; no fake proximity count.',
 patterns,seeds,parity,summary:report,informative,cases
};
if(process.env.QA_ASSASSIN_GRADIENT_RECEIPT)fs.writeFileSync(process.env.QA_ASSASSIN_GRADIENT_RECEIPT,JSON.stringify(result,null,2)+'\n');
console.log('ASSASSIN L5 GRADIENT '+JSON.stringify(report));
console.log('PASS: 288 real terminal L5 ROI opponent gradient battles and 16 whole-RAF physical parity pairs');
