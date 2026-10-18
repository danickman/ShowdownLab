'use strict';
// Ten-family current-source L4/L5 matched full-battle return-on-investment audit.
// Research only: no runtime, source ability, PWA, or simulated winner changes.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const sources=['v3/legacy-sim-core.js','v3/ultimate-abilities.js','v3/evolution-rules.js'];
const hashes=Object.fromEntries(sources.map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')]));
const original=read('tools/qa/check-first-ultimate-tier-spike.cjs'),cut='const matched=[];';
assert.equal(original.split(cut).length,2,'canonical full-terminal harness changed');
let h=original.slice(0,original.indexOf(cut));
const sub=(a,b)=>{assert.equal(h.split(a).length,2,'canonical harness anchor drift: '+a.slice(0,90));h=h.replace(a,b)};
sub("const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];",
 "const choices=['hold','firstUnlock','matchedUnlock','foeDouble','foeArmyDouble','recruit2','alternativeEvolution'];");
sub("const seeds=[1337,2017];","const seeds=[11717,23771,71569,87071];");
sub("const evolved=target&&((us&&choice!=='hold')||(!us&&choice==='matchedUnlock'));",
 "const alt=c.role==='beetank'?'knight':'beetank';"+
 "const evolved=target&&((us&&!['hold','recruit2','alternativeEvolution'].includes(choice))||(!us&&choice==='matchedUnlock'));"+
 "const allyEvolved=us&&choice==='alternativeEvolution'&&type===alt;");
sub("return{type,level:evolved?advanced:prior,squad:Math.floor(i/5)};",
 "return{type,level:evolved||allyEvolved?advanced:prior,squad:Math.floor(i/5)};");
sub("return army;\n}",
 "if(us&&choice==='recruit2')for(let i=0;i<2;i++)army.push({type:c.role,level:prior,squad:100});"+
 "\n if(!us&&choice==='foeArmyDouble')army.push(...army.map(u=>({...u,squad:u.squad+200})));"+
 "\n if(us&&choice==='alternativeEvolution')assert(army.some(u=>u.type===(c.role==='beetank'?'knight':'beetank')&&u.level===advanced),'alternative must evolve');"+
 "\n return army;\n}");
sub("const wanted=choice==='overwhelmed'?3:c.count/2/10*3;",
 "const wanted=choice==='overwhelmed'?3:c.count/2/10*3+(choice==='recruit2'?2:0);");
sub("u.level===(choice==='hold'?c.level:c.level+1)",
 "u.level===(['hold','recruit2','alternativeEvolution'].includes(choice)?c.level:c.level+1)");
const {simulate,roles,choices}=vm.runInNewContext(h+';({simulate,roles,choices})',
 {require,__dirname,console,process},{filename:'showdown-current-source-ROI.cjs'});
assert.equal(roles.length,10);assert.equal(choices.length,7);
const allSeeds=[11717,23771,71569,87071],unseen=new Set(allSeeds.slice(2)),matches=[],severe=[];
const t0=process.hrtime.bigint(),sum=xs=>xs.reduce((a,b)=>a+b,0),round=n=>+n.toFixed(2);
for(const role of roles)for(const level of [3,4])for(const count of [20,40])
 for(const seed of allSeeds)for(const side of ['blue','red']){
 const fixture={role,level,count,seed,side},out={};
 for(const choice of choices){
  const z=simulate(fixture,choice);
  assert.equal(z.units,count+(choice==='recruit2'?2:choice==='foeDouble'?3*count/20:choice==='foeArmyDouble'?count/2:0),'actual population');
  assert([0,1].includes(z.win)&&z.ticks>0&&z.selectedRealHp>=0&&z.genuinePersistentFronts>=0&&z.realSeparateHpWindows>=0);
  out[choice]=z;
 }
 matches.push({fixture,out});
}
assert.equal(matches.length,320);
for(const role of roles)for(const level of [3,4])for(const seed of allSeeds.slice(2))
 for(const side of ['blue','red']){
 const fixture={role,level,count:20,seed,side},z=simulate(fixture,'overwhelmed');
 assert.equal(z.units,18,'literal three evolved vs fifteen defenders');
 severe.push({fixture,out:z});
}
assert.equal(severe.length,80);
let exactObserverPairs=0,rawRepeatPairs=0;
for(const role of roles)for(const level of [3,4]){
 const fixture={role,level,count:20,seed:87071,side:'red'};
 for(const choice of ['firstUnlock','recruit2']){
  assert.equal(simulate(fixture,choice,true,true).digest,simulate(fixture,choice,false,true).digest,
   'full frame-by-frame observer/raw SHA mismatch '+JSON.stringify({role,level,choice}));
  exactObserverPairs++;
 }
 assert.equal(simulate(fixture,'firstUnlock',false,true).digest,
              simulate(fixture,'firstUnlock',false,true).digest,'raw deterministic SHA mismatch');
 rawRepeatPairs++;
}
assert.equal(exactObserverPairs,40);assert.equal(rawRepeatPairs,20);
const metrics=['selectedRealHp','allyRealHp','enemyRealHp','selectedPositiveHits','genuinePersistentFronts','realSeparateHpWindows'];
function group(rows){
 const o={fixtureCount:rows.length,terminalCount:rows.length*choices.length,choices:{}};
 for(const choice of choices){
  const a=rows.map(r=>r.out[choice]),v={wins:sum(a.map(r=>r.win))};
  for(const metric of metrics)v[metric]=round(sum(a.map(r=>r[metric])));
  v.gainFlips=rows.filter(r=>!r.out.hold.win&&r.out[choice].win).length;
  v.lossFlips=rows.filter(r=>r.out.hold.win&&!r.out[choice].win).length;
  o.choices[choice]=v;
 }
 o.firstVsHold=o.choices.firstUnlock.wins-o.choices.hold.wins;
 o.firstVsRecruits=o.choices.firstUnlock.wins-o.choices.recruit2.wins;
 o.firstVsAlternative=o.choices.firstUnlock.wins-o.choices.alternativeEvolution.wins;
 o.weakFirst=o.firstVsHold<=0;
 o.weakChoice=o.firstVsRecruits<=0&&o.firstVsAlternative<=0;
 return o;
}
const summaries={};
for(const phase of ['calibration','heldout']){
 const rows=matches.filter(x=>unseen.has(x.fixture.seed)===(phase==='heldout'));
 summaries[phase]={overall:group(rows),families:{}};
 for(const role of roles)for(const level of [3,4]){
  const key=role+'-L'+(level+1);
  const s=group(rows.filter(x=>x.fixture.role===role&&x.fixture.level===level));
  if(phase==='heldout')s.severe3v15Wins=sum(severe.filter(x=>x.fixture.role===role&&x.fixture.level===level).map(x=>x.out.win));
  summaries[phase].families[key]=s;
 }
}
const actualTerminal=matches.length*choices.length+severe.length+exactObserverPairs*2+rawRepeatPairs*2;
assert.equal(actualTerminal,2440);
const receipt={
 status:'READ ONLY: current live-core/evolution/abilities sources, not historical pre-Goose fixtures',
 hashes,qaSha:process.env.QA_SHA||null,
 protocol:'10 actual fighter families, L4 and L5 from L3/L4, 20/40 total, 4 seeds split calibrating/heldout and 2 mirrored sides; hold, upgrade nominated entire family, peer equivalent tier, double enemy nominated family, double entire enemy army, recruit 2 extra nominated family bodies, or upgrade existing Beetank family (Knight when nominated Beetank). Independent real positive-HP damage fronts and windows; 3 evolved vs 15 on unseen seeds; full raw/observed RAF parity and exact raw replay. Not a simulation of random in-game draft offer probabilities and Node runtime is NOT physical iPhone performance.',
 seeds:{calibration:allSeeds.slice(0,2),heldout:allSeeds.slice(2)},
 counts:{matchedFixtures:matches.length,choicesPerFixture:choices.length,matchedTerminal:matches.length*choices.length,severeTerminal:severe.length,observerVsRawPairs:exactObserverPairs,rawRepeatPairs,allTerminalIncludingChecks:actualTerminal},
 nodeElapsedMs:round(Number(process.hrtime.bigint()-t0)/1e6),summaries,severe,matches
};
if(process.env.QA_CONSOLIDATED_ROI_RECEIPT)fs.writeFileSync(process.env.QA_CONSOLIDATED_ROI_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('TEN-FAMILY CURRENT-SOURCE L4 L5 ROI '+JSON.stringify({
 hashes,counts:receipt.counts,nodeElapsedMs:receipt.nodeElapsedMs,
 heldout:Object.fromEntries(Object.entries(summaries.heldout.families).map(([k,v])=>[k,{
  hold:v.choices.hold.wins,first:v.choices.firstUnlock.wins,recruit:v.choices.recruit2.wins,
  alternative:v.choices.alternativeEvolution.wins,peer:v.choices.matchedUnlock.wins,
  foeFamilyDouble:v.choices.foeDouble.wins,foeArmyDouble:v.choices.foeArmyDouble.wins,
  severe:v.severe3v15Wins,firstPhysicalHp:v.choices.firstUnlock.selectedRealHp,
  fronts:v.choices.firstUnlock.genuinePersistentFronts,windows:v.choices.firstUnlock.realSeparateHpWindows,
  weakFirst:v.weakFirst,weakOpportunity:v.weakChoice
 }]))}));
console.log('PASS: 2440 genuine current-source full terminal runs; 40 observed-vs-raw complete RAF parity SHA pairs and 20 deterministic raw repeat pairs');
