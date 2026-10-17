'use strict';
// Fast read-only regression distilled from the accepted 896-terminal source study.
// Fixed now-known holdout fixtures are regression witnesses, not new blind evidence.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=__dirname,source=fs.readFileSync(path.join(dir,'check-borderline-draft-decisions.cjs'),'utf8');
const marker='const discovery=[];';
assert.equal(source.split(marker).length,2,'accepted study preamble moved');
const code=source.slice(0,source.indexOf(marker))+'\n;({simulate,modes,choices,patterns})';
const {simulate,modes,choices,patterns}=vm.runInNewContext(code,{require,__dirname:dir,console,process},
 {filename:'borderline-study-preamble.cjs'});
assert.equal(choices.join(','),'hold,evolve,recruit2,evolveBeetank');
assert.equal(patterns.length,12);
const accepted={
 assassin:{20:['ranged-1','armored-1'],40:['armored-1','ranged-1']},
 turtle:{20:['armored-1','ranged-1'],40:['armored-1','ranged-1']}
};
const cases=[];
for(const role of ['assassin','turtle'])for(const count of [20,40])
 for(const mode of accepted[role][count])
 for(const seed of [4049,9091])for(const side of ['blue','red']){
  const fixture={role,level:3,count,mode,seed,side};
  const variants={};
  for(const choice of choices){
   const z=simulate({...fixture,choice});
   assert([0,1].includes(z.win),'actual terminal winner required');
   assert(z.nominatedDirectHp>=0&&z.realPersistentFronts>=0&&z.realSeparatedDamageWindows>=0,
    'positive physical damage and true front accounting');
   assert(z.nominatedReflectedHp>=0&&z.nominatedRealAllyHpSaved>=0,
    'genuine resolved reflect/Guardian accounting');
   assert(Array.isArray(z.killingBlows),'lethal physical attribution');
   variants[choice]=z;
  }
  cases.push({fixture,variants});
 }
assert.equal(cases.length,32,'8 matched groups with two seeds and both sides');
let parity=0;
for(const role of ['assassin','turtle'])for(const count of [20,40])
 for(const choice of ['hold','evolve']){
  const c={role,level:3,count,mode:accepted[role][count][0],seed:4049,side:'red',choice};
  assert.equal(simulate(c,true,true).digest,simulate(c,false,true).digest,
   'observer must preserve every physical RAF state '+JSON.stringify(c));
  parity++;
 }
assert.equal(parity,8);
const metrics={};
for(const role of ['assassin','turtle'])for(const count of [20,40]){
 const rows=cases.filter(r=>r.fixture.role===role&&r.fixture.count===count);
 const out={matched:rows.length};
 for(const choice of choices){
  const zs=rows.map(r=>r.variants[choice]),sum=k=>+zs.reduce((n,z)=>n+z[k],0).toFixed(2);
  out[choice]={wins:sum('win'),directHp:sum('nominatedDirectHp'),
   reflectionHp:sum('nominatedReflectedHp'),
   guardianHpBeyondKnight:sum('nominatedRealAllyHpSaved'),
   realPersistentFronts:sum('realPersistentFronts'),
   separatedDamageWindows:sum('realSeparatedDamageWindows'),
   lethalHitsByFamily:zs.reduce((n,z)=>n+z.killingBlows.filter(k=>k.role===role).length,0)};
 }
 metrics[role+'-'+count]=out;
}
const t20=metrics['turtle-20'],t40=metrics['turtle-40'];
assert(t20.evolve.wins>=6&&t20.evolve.wins-t20.hold.wins>=5,
 'Turtle L4 must turn a meaningful set of previously losing 20-body borderline teams');
assert(t40.evolve.wins>=6&&t40.evolve.wins-t40.hold.wins>=3,
 'Turtle L4 must turn previously losing 40-body borderline teams');
assert(t20.evolve.guardianHpBeyondKnight>0&&t40.evolve.guardianHpBeyondKnight>0,
 'Turtle evolved Guardian must prevent physical allied HP beyond Knight');
assert(t20.evolve.reflectionHp>0&&t40.evolve.reflectionHp>0,
 'Turtle evolved Ricochet must deliver actual capped defender HP');
assert(t20.evolve.realPersistentFronts>=3&&t40.evolve.realPersistentFronts>=48,
 'Protect observed authentic independent damaging front floors in these fixed fixtures');
const output={
 status:'ACCEPTED REGRESSION, NOT UNSEEN RESEARCH OR SHIPPED GAMEPLAY PATCH',
 method:'Previously selected authentic borderline mixed rosters, hold/evolve/+2 recruits/Beetank evolution, two original holdout seeds 4049/9091 both side mirrors; 20/40 total bodies; source-real, full-terminal, actual physical HP and connected damaging-front witnesses. Fixtures are known and unsuitable for further unbiased ability selection.',
 metrics,cases,parity
};
if(process.env.QA_BORDERLINE_SMOKE_RECEIPT)
 fs.writeFileSync(process.env.QA_BORDERLINE_SMOKE_RECEIPT,JSON.stringify(output,null,2)+'\n');
console.log('BORDERLINE REGRESSION '+JSON.stringify(metrics));
console.log('PASS: 128 fully terminal accepted borderline role decisions; 8 raw/observed per-RAF parity pairs');
