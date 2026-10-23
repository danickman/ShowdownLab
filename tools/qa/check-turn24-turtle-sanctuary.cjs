'use strict';
// Turn24: genuine 20/40-body Turtle L5 Last Stand Sanctuary physical multi-target splash ROI.
// Two source-only arms: exact playable Turtle and L5-only wounded-ally Guardian strengthening.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const orig=read('tools/qa/check-first-ultimate-tier-spike.cjs'),cut='const matched=[];';
assert.equal(orig.split(cut).length,2,'canonical genuine terminal source runner changed');
let h=orig.slice(0,orig.indexOf(cut));
const substitute=(a,b)=>{assert.equal(h.split(a).length,2,'canonical harness anchor: '+a.slice(0,85));h=h.replace(a,b)};
// Turtle L5 Guardian coverage only, no new hits or attacks.
// L5 ONLY: source-real incoming natural axe cleave is stronger and staggers
// the same 5 geographically eligible secondary victims. No new attacks.
const oldRadius="near(u,t,rank(u)===2?.14:.12)",newRadius="near(u,t,rank(u)===2?.18:.12)";
const oldCover="const amount=rank(u)===2?.28:.18",newCover="const amount=rank(u)===2?.38:.18";
const injected=[
 'const oldRadius='+JSON.stringify(oldRadius)+';',
 'const newRadius='+JSON.stringify(newRadius)+';',
 'const oldCover='+JSON.stringify(oldCover)+';',
 'const newCover='+JSON.stringify(newCover)+';',
 "const single=(s,a,b)=>{assert.equal(s.split(a).length,2,'physical Guardian source anchor '+a);return s.replace(a,b)};",
 'const sanctuaryUltimate=single(single(ult,oldRadius,newRadius),oldCover,newCover);',
 'const candidates={current:{core:live,ult},sanctuary:{core:live,ult:sanctuaryUltimate}};'
].join('\n');
substitute("const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];",
 injected+"\nconst choices=['hold','firstUnlock','matchedUnlock','foeDouble','foeArmyDouble','recruit2','alternativeEvolution'];");
substitute("const seeds=[1337,2017];","const seeds=[52333,64709,91387,118061];");
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
new Function('require','__dirname','console','process',h+';return true;');
const {simulate,roles,choices}=vm.runInNewContext(h+';({simulate,roles,choices})',{require,__dirname,console,process});
assert.equal(roles.length,10);assert.equal(choices.length,7);
const variants=['current','sanctuary'],seeds=[52333,64709,91387,118061],heldout=new Set(seeds.slice(2));
const fixtures=[],extreme=[],start=process.hrtime.bigint(),round=x=>+x.toFixed(2);
for(const count of [20,40])for(const seed of seeds)for(const side of ['blue','red']){
 const f={role:'turtle',level:4,count,seed,side},options={};
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
 const f={role:'turtle',level:4,count:20,seed,side},options={};
 for(const arm of variants){const z=simulate({...f,arm},'overwhelmed');assert.equal(z.units,18);options[arm]=z}
 extreme.push({f,options});
}
assert.equal(extreme.length,4);
let observerPairs=0,unchangedL4=0,offTarget=0,repeatPairs=0;
for(const count of [20,40])for(const arm of variants){
 const f={role:'turtle',level:4,count,seed:91387,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',true,true).digest,simulate(f,'firstUnlock',false,true).digest,'exact observer/raw RAF');observerPairs++;
}
for(const count of [20,40])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const f={role:'turtle',level:3,count,seed,side};
 const raw=simulate({...f,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['sanctuary']){assert.equal(simulate({...f,arm},'firstUnlock',false,true).digest,raw,'L4 physics unchanged');unchangedL4++}
 const other={...f,role:'assassin',level:4},base=simulate({...other,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['sanctuary']){assert.equal(simulate({...other,arm},'firstUnlock',false,true).digest,base,'unrelated fighter physics unchanged');offTarget++}
}
for(const arm of variants){
 const f={role:'turtle',level:4,count:20,seed:118061,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',false,true).digest,simulate(f,'firstUnlock',false,true).digest);repeatPairs++;
}
assert.equal(observerPairs,4);assert.equal(unchangedL4,8);assert.equal(offTarget,8);assert.equal(repeatPairs,2);
const metrics=['win','selectedRealHp','allyRealHp','genuinePersistentFronts','realSeparateHpWindows'];
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
 status:'Turn24 source-only wounded-ally Turtle L5 Last Stand Sanctuary ROI, not playable; no actual current core/ultimate mutation.',
 hypothesis:'Only L5 Turtle guardian reduces a wounded nearby ally’s damage by 38% (was 28%) within .18 physical arena distance (was .14). Nonstacking protection applies only below 60% current defender HP; no self-guard, L4, reflected HP, melee damage, cooldown, targeting, formation, or L5 Beetank change. Evaluate actual full-terminal wins and geographically separated attacker-attributed positive HP fronts; no nominal absorbed-damage claims.',
 hashes:Object.fromEntries(['v3/legacy-sim-core.js','v3/ultimate-abilities.js','v3/evolution-rules.js'].map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')])),
 seeds:{calibration:seeds.slice(0,2),heldout:seeds.slice(2)},counts,report,severeWins,
 nodeWallMs:round(Number(process.hrtime.bigint()-start)/1e6),fixtures,extreme
};
if(process.env.QA_TURN24_RECEIPT)fs.writeFileSync(process.env.QA_TURN24_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
const compact={};for(const phase of ['calibration','heldout']){
 const a=report[phase].scenarios;compact[phase]={};
 for(const choice of choices)compact[phase][choice]=Object.fromEntries(variants.map(arm=>[arm,a[choice][arm].win]));
 for(const metric of ['selectedRealHp','allyRealHp','genuinePersistentFronts','realSeparateHpWindows'])
  compact[phase][metric]=Object.fromEntries(variants.map(arm=>[arm,a.firstUnlock[arm][metric]]));
}
console.log('TURN24 TURTLE LAST STAND SANCTUARY REAL ROI '+JSON.stringify({compact,severeWins,counts,nodeWallMs:receipt.nodeWallMs}));
console.log('PASS: 224 real terminal mixed full battles + 8 severe counters, 4 observer/raw RAF SHA pairs, 8 unchanged L4 and 8 unrelated full RAF SHA, 2 raw repeats');
