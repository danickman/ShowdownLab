'use strict';
// Turn 4 source-only Warband: real positive-HP combat, not scripted win outcomes.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('tools/qa/check-first-ultimate-tier-spike.cjs'),cut='const matched=[];';
assert.equal(src.split(cut).length,2);
let h=src.slice(0,src.indexOf(cut));
const patch=(a,b)=>{assert.equal(h.split(a).length,2,'source anchor '+a.slice(0,90));h=h.replace(a,b)};
const existing="if(a.type==='goblin'){const count=Math.min(r===2?4:3,units.filter(u=>u!==a&&u.team===a.team&&u.type==='goblin'&&u.hp>0&&near(u,a,.10)).length);if(count){cue(a,'pack',tick,t);return damage*(1+count*(r===2?.3:.2))}}";
const warband="if(a.type==='goblin'&&a.action==='stab'){const companions=Math.min(2,units.filter(u=>u!==a&&u.team===a.team&&u.type==='goblin'&&u.hp>0&&(near(u,a,.23)||near(u,t,.23))).length);if(companions){a.ward=Math.max(a.ward||0,r===2?17:10);const bonus=r===2?(companions===1?3.20:4.65):(companions===1?1.20:1.90);cue(a,'warband',tick,t);return damage*(1+bonus)}}";
patch("const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];",
 "const goblinOriginal="+JSON.stringify(existing)+";const goblinWarband="+JSON.stringify(warband)+";"+
 "assert.equal(ult.split(goblinOriginal).length,2,'Goblin live source moved');"+
 "const originalNearest="+JSON.stringify("const pressure=pressureByTarget.get(v.id)||0,s=d+Math.max(0,pressure-2)*.035+")+";"+
"const focusedNearest="+JSON.stringify("const pressure=pressureByTarget.get(v.id)||0,focus=u.type==='goblin'&&ultimate.rank(u)>0&&d<.25?Math.min(2,Math.max(0,pressure-1))*(ultimate.rank(u)===2?.085:.05):0,s=d-focus+Math.max(0,pressure-2)*.035+")+";"+
"assert.equal(live.split(originalNearest).length,2,'target source anchor moved');"+
"const variants={current:{ult,core:live},warband:{ult:ult.replace(goblinOriginal,goblinWarband),core:live.replace(originalNearest,focusedNearest)}};"+
 "const choices=['hold','firstUnlock','matchedUnlock','foeDouble','foeArmyDouble','recruit2','alternativeEvolution'];");
patch("const seeds=[1337,2017];","const seeds=[31543,44287,80777,97157];");
patch("const evolved=target&&((us&&choice!=='hold')||(!us&&choice==='matchedUnlock'));",
 "const alt=c.role==='beetank'?'knight':'beetank';"+
 "const evolved=target&&((us&&!['hold','recruit2','alternativeEvolution'].includes(choice))||(!us&&choice==='matchedUnlock'));"+
 "const allyEvolved=us&&choice==='alternativeEvolution'&&type===alt;");
patch("return{type,level:evolved?advanced:prior,squad:Math.floor(i/5)};",
 "return{type,level:evolved||allyEvolved?advanced:prior,squad:Math.floor(i/5)};");
patch("return army;\n}","if(us&&choice==='recruit2')for(let i=0;i<2;i++)army.push({type:c.role,level:prior,squad:100});"+
 "\n if(!us&&choice==='foeArmyDouble')army.push(...army.map(u=>({...u,squad:u.squad+200})));"+
 "\n return army;\n}");
patch("const wanted=choice==='overwhelmed'?3:c.count/2/10*3;",
 "const wanted=choice==='overwhelmed'?3:c.count/2/10*3+(choice==='recruit2'?2:0);");
patch("u.level===(choice==='hold'?c.level:c.level+1)",
 "u.level===(['hold','recruit2','alternativeEvolution'].includes(choice)?c.level:c.level+1)");
patch("vm.runInContext(evo,env);vm.runInContext(ult,env);",
 "vm.runInContext(evo,env);vm.runInContext(variants[c.arm||'current'].ult,env);");
patch("const witnessed=live.replace(anchor,anchor+","const observe=core=>core.replace(anchor,anchor+");
patch("vm.runInContext(observed?witnessed:live,env);","const core=variants[c.arm||'current'].core;vm.runInContext(observed?observe(core):core,env);");
patch("role:a.type,damage:dealt,x:t.x,y:t.y","role:a.type,action:a.action,damage:dealt,x:t.x,y:t.y");
patch("selectedPositiveHits:hits.filter(x=>selected.has(x.attacker)).length,",
 "selectedPositiveHits:hits.filter(x=>selected.has(x.attacker)).length,"+
 "selectedStabHp:hp(x=>selected.has(x.attacker)&&x.action==='stab'),"+
 "selectedStabHits:hits.filter(x=>selected.has(x.attacker)&&x.action==='stab').length,");
new Function('require','__dirname','console','process',h+';return true;');
const {simulate,roles,choices}=vm.runInNewContext(h+';({simulate,roles,choices})',{require,__dirname,console,process});
assert.equal(roles.length,10);assert.equal(choices.length,7);
const variants=['current','warband'],seeds=[31543,44287,80777,97157],heldout=new Set(seeds.slice(2)),cases=[],severe=[];
const begun=process.hrtime.bigint(),round=x=>+x.toFixed(2);
for(const level of [3,4])for(const count of [20,40])for(const seed of seeds)for(const side of ['blue','red']){
 const fixture={role:'goblin',level,count,seed,side},scenarios={};
 for(const choice of choices){const casesByArm={};
  for(const arm of variants){
   const z=simulate({...fixture,arm},choice);
   assert.equal(z.units,count+(choice==='recruit2'?2:choice==='foeDouble'?3*count/20:choice==='foeArmyDouble'?count/2:0),'physical count');
   assert([0,1].includes(z.win)&&z.ticks>0&&z.selectedRealHp>=0&&z.genuinePersistentFronts>=0&&z.realSeparateHpWindows>=0);
   casesByArm[arm]=z;
  }
  scenarios[choice]=casesByArm;
 }
 cases.push({fixture,scenarios});
}
assert.equal(cases.length,32);
for(const level of [3,4])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const f={role:'goblin',level,count:20,seed,side},arm={};
 for(const variant of variants){const z=simulate({...f,arm:variant},'overwhelmed');assert.equal(z.units,18);arm[variant]=z}
 severe.push({fixture:f,arm});
}
assert.equal(severe.length,8);
let observerParity=0,unaffectedParity=0,repeats=0;
for(const level of [3,4])for(const arm of variants)for(const choice of ['firstUnlock','recruit2']){
 const f={role:'goblin',level,count:20,seed:86519,side:'red',arm};
 assert.equal(simulate(f,choice,true,true).digest,simulate(f,choice,false,true).digest,'raw/observed full-frame SHA');observerParity++;
}
for(const level of [1,2])for(const count of [20,40])for(const side of ['blue','red']){
 const f={role:'goblin',level,count,seed:72311,side};
 assert.equal(simulate({...f,arm:'current'},'firstUnlock',false,true).digest,
   simulate({...f,arm:'warband'},'firstUnlock',false,true).digest,'L1-L3 physical physics unchanged');unaffectedParity++;
}
for(const level of [3,4])for(const arm of variants){
 const f={role:'goblin',level,count:20,seed:86519,side:'blue',arm};
 assert.equal(simulate(f,'firstUnlock',false,true).digest,simulate(f,'firstUnlock',false,true).digest);repeats++;
}
assert.equal(observerParity,8);assert.equal(unaffectedParity,8);assert.equal(repeats,4);
const fields=['win','selectedRealHp','selectedStabHp','selectedStabHits','allyRealHp','enemyRealHp','genuinePersistentFronts','realSeparateHpWindows'];
const summary={};
for(const phase of ['calibration','heldout'])for(const tier of [4,5]){
 const rows=cases.filter(x=>heldout.has(x.fixture.seed)===(phase==='heldout')&&x.fixture.level===tier-1),out={fixtures:rows.length,choices:{}};
 for(const choice of choices){out.choices[choice]={};
  for(const arm of variants){const values=rows.map(x=>x.scenarios[choice][arm]),tot={};
   for(const field of fields)tot[field]=round(values.reduce((n,z)=>n+z[field],0));
   out.choices[choice][arm]=tot;
  }
 }
 summary[phase+'-L'+tier]=out;
}
const severeWins={};for(const tier of [4,5])severeWins['L'+tier]=Object.fromEntries(variants.map(arm=>[arm,severe.filter(x=>x.fixture.level===tier-1).reduce((n,x)=>n+x.arm[arm].win,0)]));
const counts={matchedFixtures:32,matchedTerminal:448,severeTerminal:16,observerRawRafPairs:observerParity,unchangedLowTierRafPairs:unaffectedParity,rawRepeats:repeats};
const compact={};
for(const tier of [4,5]){
 const s=summary['heldout-L'+tier];
 compact['L'+tier]=Object.fromEntries(choices.map(c=>[c,Object.fromEntries(variants.map(a=>[a,s.choices[c][a].win]))]));
 for(const field of ['selectedStabHp','selectedStabHits','genuinePersistentFronts','realSeparateHpWindows'])
  compact['L'+tier][field]=Object.fromEntries(variants.map(a=>[a,s.choices.firstUnlock[a][field]]));
 compact['L'+tier].severe=severeWins['L'+tier];
}
const receipt={status:'source-only real complete terminal Goblin Warband direct stab ROI; game unchanged',
 theory:'Actual coordinated stab with 1/2 live Goblins near attacker or defender in .23: L4 direct 2.2x/2.9x, L5 direct 4.2x/5.65x, only attacking Goblin gains 10/17 ticks of the existing 38%-reduction ward after genuine contact; evolved Goblins prefer locally pressured targets with capped <=.17 locality score bias inside .25. No remote damage, global buff, invulnerability, chain attack or teleport.',
 seeds:{calibration:seeds.slice(0,2),heldout:seeds.slice(2)},counts,summary,severeWins,compact,
 sourceSha256:Object.fromEntries(['v3/legacy-sim-core.js','v3/ultimate-abilities.js','v3/evolution-rules.js'].map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')])),
 nodeWallMs:round(Number(process.hrtime.bigint()-begun)/1e6),cases,severe};
if(process.env.QA_WARBAND_RECEIPT)fs.writeFileSync(process.env.QA_WARBAND_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('WARBAND RALLY HELDOUT SOURCE SUMMARY '+JSON.stringify({compact,counts,severeWins,nodeWallMs:receipt.nodeWallMs}));
console.log('PASS: 448 real terminal matched draft variants + 16 severe, 8 observer/raw exact RAF pairs, 8 unchanged low-tier pairs, 4 deterministic repeated raw RAF pairs');
