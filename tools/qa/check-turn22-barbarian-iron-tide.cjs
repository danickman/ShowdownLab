'use strict';
// Turn22: genuine 20/40-body Barbarian L5 Iron Tide physical multi-target splash ROI.
// Two source-only arms: exact playable and one final bounded five-victim Iron Tide.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const orig=read('tools/qa/check-first-ultimate-tier-spike.cjs'),cut='const matched=[];';
assert.equal(orig.split(cut).length,2,'canonical genuine terminal source runner changed');
let h=orig.slice(0,orig.indexOf(cut));
const substitute=(a,b)=>{assert.equal(h.split(a).length,2,'canonical harness anchor: '+a.slice(0,85));h=h.replace(a,b)};
// L5-only existing physical five-target cleave; damage 1.65 and stun 18 ticks, no new hit/reach/FX.
// L5 ONLY: source-real incoming natural axe cleave is stronger and staggers
// the same 5 geographically eligible secondary victims. No new attacks.
const oldSplash="damage:a.dmg*(r===2?1.00:.58)",newSplash="damage:a.dmg*(r===2?1.65:.58)";
const oldStagger="v.stun=Math.max(v.stun,r===2?12:8)",newStagger="v.stun=Math.max(v.stun,r===2?18:8)";
const injected=[
 'const oldSplash='+JSON.stringify(oldSplash)+';',
 'const newSplash='+JSON.stringify(newSplash)+';',
 'const oldStagger='+JSON.stringify(oldStagger)+';',
 'const newStagger='+JSON.stringify(newStagger)+';',
 "const single=(s,a,b)=>{assert.equal(s.split(a).length,2,'candidate anchor '+a);return s.replace(a,b)};",
 'const tideUltimate=single(single(ult,oldSplash,newSplash),oldStagger,newStagger);',
 'const candidates={current:{core:live,ult},tide:{core:live,ult:tideUltimate}};'
].join('\n');
substitute("const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];",
 injected+"\nconst choices=['hold','firstUnlock','matchedUnlock','foeDouble','foeArmyDouble','recruit2','alternativeEvolution'];");
substitute("const seeds=[1337,2017];","const seeds=[51437,63977,90611,114871];");
substitute("const evolved=target&&((us&&choice!=='hold')||(!us&&choice==='matchedUnlock'));",
 "const alt=c.role==='beetank'?'knight':'beetank';"+
 "const evolved=target&&((us&&!['hold','recruit2','alternativeEvolution'].includes(choice))||(!us&&choice==='matchedUnlock'));"+
 "const allyEvolved=us&&choice==='alternativeEvolution'&&type===alt;");
substitute("return{type,level:evolved?advanced:prior,squad:Math.floor(i/5)};",
 "return{type,level:evolved||allyEvolved?advanced:prior,squad:Math.floor(i/5)};");
substitute("return army;\n}",
 "if(us&&choice==='recruit2')for(let i=0;i<2;i++)army.push({type:c.role,level:prior,squad:100});"+
 "\n if(!us&&choice==='foeArmyDouble')army.push(...army.map(u=>({...u,squad:u.squad+200})));"+
 "\n return army;\n}");
substitute("const wanted=choice==='overwhelmed'?3:c.count/2/10*3;",
 "const wanted=choice==='overwhelmed'?3:c.count/2/10*3+(choice==='recruit2'?2:0);");
substitute("u.level===(choice==='hold'?c.level:c.level+1)",
 "u.level===(['hold','recruit2','alternativeEvolution'].includes(choice)?c.level:c.level+1)");
substitute("const witnessed=live.replace(anchor,anchor+",
 "const observedFor=core=>core.replace(anchor,anchor+");
substitute("vm.runInContext(evo,env);vm.runInContext(ult,env);",
 "vm.runInContext(evo,env);vm.runInContext(candidates[c.arm||'current'].ult,env);");
substitute("vm.runInContext(observed?witnessed:live,env);",
 "const core=candidates[c.arm||'current'].core;vm.runInContext(observed?observedFor(core):core,env);");
substitute("role:a.type,damage:dealt,x:t.x,y:t.y",
 "role:a.type,action:a.action,damage:dealt,x:t.x,y:t.y");
substitute("selectedPositiveHits:hits.filter(x=>selected.has(x.attacker)).length,",
 "selectedPositiveHits:hits.filter(x=>selected.has(x.attacker)).length,"+
 "selectedAxeHp:hp(x=>selected.has(x.attacker)&&['axe_swing','rage_swing'].includes(x.action)),"+
 "selectedAxeHits:hits.filter(x=>selected.has(x.attacker)&&['axe_swing','rage_swing'].includes(x.action)).length,");
new Function('require','__dirname','console','process',h+';return true;');
const {simulate,roles,choices}=vm.runInNewContext(h+';({simulate,roles,choices})',{require,__dirname,console,process});
assert.equal(roles.length,10);assert.equal(choices.length,7);
const variants=['current','tide'],seeds=[51437,63977,90611,114871],heldout=new Set(seeds.slice(2));
const fixtures=[],extreme=[],start=process.hrtime.bigint(),round=x=>+x.toFixed(2);
for(const count of [20,40])for(const seed of seeds)for(const side of ['blue','red']){
 const f={role:'barbarian',level:4,count,seed,side},options={};
 for(const choice of choices){options[choice]={};
  for(const arm of variants){
   const z=simulate({...f,arm},choice);
   assert.equal(z.units,count+(choice==='recruit2'?2:choice==='foeDouble'?3*count/20:choice==='foeArmyDouble'?count/2:0),'must be actual body count');
   assert([0,1].includes(z.win)&&z.ticks>0&&z.selectedRealHp>=0&&z.realSeparateHpWindows>=0);
   options[choice][arm]=z;
  }
 }
 fixtures.push({f,options});
}
assert.equal(fixtures.length,16);
for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const f={role:'barbarian',level:4,count:20,seed,side},options={};
 for(const arm of variants){const z=simulate({...f,arm},'overwhelmed');assert.equal(z.units,18);options[arm]=z}
 extreme.push({f,options});
}
assert.equal(extreme.length,4);
let observerPairs=0,unchangedL4=0,offTarget=0,repeatPairs=0;
for(const count of [20,40])for(const arm of variants){
 const f={role:'barbarian',level:4,count,seed:90611,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',true,true).digest,simulate(f,'firstUnlock',false,true).digest,'exact observer/raw RAF');observerPairs++;
}
for(const count of [20,40])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const f={role:'barbarian',level:3,count,seed,side};
 const raw=simulate({...f,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['tide']){assert.equal(simulate({...f,arm},'firstUnlock',false,true).digest,raw,'L4 physics unchanged');unchangedL4++}
 const other={...f,role:'beetank',level:4},base=simulate({...other,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['tide']){assert.equal(simulate({...other,arm},'firstUnlock',false,true).digest,base,'unrelated fighter physics unchanged');offTarget++}
}
for(const arm of variants){
 const f={role:'barbarian',level:4,count:20,seed:114871,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',false,true).digest,simulate(f,'firstUnlock',false,true).digest);repeatPairs++;
}
assert.equal(observerPairs,4);assert.equal(unchangedL4,8);assert.equal(offTarget,8);assert.equal(repeatPairs,2);
const metrics=['win','selectedRealHp','selectedAxeHp','selectedAxeHits','genuinePersistentFronts','realSeparateHpWindows'];
function summary(rows){
 const out={fixtures:rows.length,scenarios:{}};
 for(const choice of choices){out.scenarios[choice]={};
  for(const arm of variants){const a=rows.map(x=>x.options[choice][arm]),o={};
   for(const metric of metrics)o[metric]=round(a.reduce((n,z)=>n+z[metric],0));
   out.scenarios[choice][arm]=o;
  }
 }
 return out;
}
const report={calibration:summary(fixtures.filter(x=>!heldout.has(x.f.seed))),heldout:summary(fixtures.filter(x=>heldout.has(x.f.seed)))};
const severeWins=Object.fromEntries(variants.map(arm=>[arm,extreme.reduce((n,e)=>n+e.options[arm].win,0)]));
const counts={matchedFixtures:fixtures.length,matchedTerminal:fixtures.length*choices.length*variants.length,severeTerminal:extreme.length*variants.length,observerRawPairs:observerPairs,unchangedL4Pairs:unchangedL4,unrelatedFullRafPairs:offTarget,rawRepeatPairs:repeatPairs};
const receipt={
 status:'Turn22 source-real Barbarian L5 Iron Tide fixed same five-hit physical secondary cleave trial ONLY, not playable.',
 hypothesis:'Only L5 real landed-axe splash strengthens from 1.00x to 1.65x damage and bounded victim stagger 12 to 18 ticks; existing five-victim within .205, true primary melee impact, no change to HP/range/targeting/core, all L1-L4 and other roles.',
 hashes:Object.fromEntries(['v3/legacy-sim-core.js','v3/ultimate-abilities.js','v3/evolution-rules.js'].map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')])),
 seeds:{calibration:seeds.slice(0,2),heldout:seeds.slice(2)},counts,report,severeWins,
 nodeWallMs:round(Number(process.hrtime.bigint()-start)/1e6),fixtures,extreme
};
if(process.env.QA_TURN22_RECEIPT)fs.writeFileSync(process.env.QA_TURN22_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
const compact={};for(const phase of ['calibration','heldout']){
 const a=report[phase].scenarios;compact[phase]={};
 for(const choice of choices)compact[phase][choice]=Object.fromEntries(variants.map(arm=>[arm,a[choice][arm].win]));
 for(const metric of ['selectedRealHp','selectedAxeHp','selectedAxeHits','genuinePersistentFronts','realSeparateHpWindows'])
  compact[phase][metric]=Object.fromEntries(variants.map(arm=>[arm,a.firstUnlock[arm][metric]]));
}
console.log('TURN22 BARBARIAN IRON TIDE REAL ROI '+JSON.stringify({compact,severeWins,counts,nodeWallMs:receipt.nodeWallMs}));
console.log('PASS: 224 real terminal mixed full battles + 8 severe counters, 4 observer/raw RAF SHA pairs, 8 unchanged L4 and 8 unrelated full RAF SHA, 2 raw repeats');
