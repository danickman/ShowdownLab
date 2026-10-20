'use strict';
// Barbarian topic: genuine 20/40-body Barbarian L5 Breakthrough physical multi-target splash ROI.
// Three source-only arms: exact playable, L5 collision reach and L5 contact-bound Breakthrough.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const orig=read('tools/qa/check-first-ultimate-tier-spike.cjs'),cut='const matched=[];';
assert.equal(orig.split(cut).length,2,'canonical genuine terminal source runner changed');
let h=orig.slice(0,orig.indexOf(cut));
const substitute=(a,b)=>{assert.equal(h.split(a).length,2,'canonical harness anchor: '+a.slice(0,85));h=h.replace(a,b)};
// Only the L5 Barbarian step moves or strikes differently. Every L4/other full RAF must remain identical.
const injected="const oldStep=\"function barbarianStep(u,t,d){const r=u.range/500,ratio=u.hp/u.maxHp;u.rage=ratio<.48;if(d>r){u.action=u.rage?'rage_charge':'march';moveToward(u,t,1,u.rage?1.55:1);return}if(u.cooldown<=0){u.action=u.rage?'rage_swing':'axe_swing';hit(u,t,u.rage?1.45:1.08);u.cooldown=Math.round(u.cd*(u.rage?.68:1))}else u.action=u.rage?'rage':'ready'}\";\nconst reachStep=\"function barbarianStep(u,t,d){const r=ultimate.rank(u)===2?Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)-(bodyRadius(u)+bodyRadius(t))*.22+.002):u.range/500,ratio=u.hp/u.maxHp;u.rage=ratio<.48;if(d>r){u.action=u.rage?'rage_charge':'march';moveToward(u,t,1,u.rage?1.55:1);return}if(u.cooldown<=0){u.action=u.rage?'rage_swing':'axe_swing';hit(u,t,u.rage?1.45:1.08);u.cooldown=Math.round(u.cd*(u.rage?.68:1))}else u.action=u.rage?'rage':'ready'}\";\nconst breakthroughStep=\"function barbarianStep(u,t,d){const r=ultimate.rank(u)===2?Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)-(bodyRadius(u)+bodyRadius(t))*.22+.002):u.range/500,ratio=u.hp/u.maxHp;u.rage=ratio<.48;if(d>r){u.action=u.rage?'rage_charge':'march';moveToward(u,t,1,ultimate.rank(u)===2?(u.rage?2.20:1.90):(u.rage?1.55:1));return}if(u.cooldown<=0){u.action=u.rage?'rage_swing':'axe_swing';if(ultimate.rank(u)===2&&!u.breakthroughStrike){u.breakthroughStrike=1;hit(u,t,u.rage?2.05:1.72);if(t.hp>0)t.stun=Math.max(t.stun,11)}else hit(u,t,u.rage?1.45:1.08);u.cooldown=Math.round(u.cd*(u.rage?.68:1))}else u.action=u.rage?'rage':'ready'}\";\nconst patch=(s,f)=>{assert.equal(s.split(oldStep).length,2,'original real Barbarian physics changed');return s.replace(oldStep,f)};\nconst candidates={current:{core:live,ult},reach:{core:patch(live,reachStep),ult},breakthrough:{core:patch(live,breakthroughStep),ult}};";
substitute("const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];",injected+"\nconst choices=['hold','firstUnlock','matchedUnlock','foeDouble','foeArmyDouble','recruit2','alternativeEvolution'];");
substitute("const seeds=[1337,2017];","const seeds=[60277,72817,101101,136279];");
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
const variants=['current','reach','breakthrough'],seeds=[60277,72817,101101,136279],heldout=new Set(seeds.slice(2));
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
 const f={role:'barbarian',level:4,count,seed:101101,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',true,true).digest,simulate(f,'firstUnlock',false,true).digest,'exact observer/raw RAF');observerPairs++;
}
for(const count of [20,40])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const f={role:'barbarian',level:3,count,seed,side};
 const raw=simulate({...f,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['reach','breakthrough']){assert.equal(simulate({...f,arm},'firstUnlock',false,true).digest,raw,'L4 physics unchanged');unchangedL4++}
 const other={...f,role:'beetank',level:4},base=simulate({...other,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['reach','breakthrough']){assert.equal(simulate({...other,arm},'firstUnlock',false,true).digest,base,'unrelated fighter physics unchanged');offTarget++}
}
for(const arm of variants){
 const f={role:'barbarian',level:4,count:20,seed:136279,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',false,true).digest,simulate(f,'firstUnlock',false,true).digest);repeatPairs++;
}
assert.equal(observerPairs,6);assert.equal(unchangedL4,16);assert.equal(offTarget,16);assert.equal(repeatPairs,3);
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
 status:'BARBARIAN TOPIC physical real contact/reach and entry Breakthrough source-only study; live game untouched.',
 hypothesis:'Underperformance is caused by physical-contact access in crowded formations, not inadequate five-target cleave damage. Compare L5-only contact radius at actual existing collision boundary vs L5-only contact+1.9x physical approach speed and first real axe hit 1.72x (rage 2.05x) plus 11 tick primary-only stagger. Original L4, existing premium cleave, all other roles exact. Cal and novel holdout; actual full terminal winners; persistent independent real HP fronts; peer and literal whole army 2x numeric counters.',
  hashes:Object.fromEntries(['v3/legacy-sim-core.js','v3/ultimate-abilities.js','v3/evolution-rules.js'].map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')])),
 seeds:{calibration:seeds.slice(0,2),heldout:seeds.slice(2)},counts,report,severeWins,
 nodeWallMs:round(Number(process.hrtime.bigint()-start)/1e6),fixtures,extreme
};
if(process.env.QA_BARBARIAN_TOPIC_RECEIPT)fs.writeFileSync(process.env.QA_BARBARIAN_TOPIC_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
const compact={};for(const phase of ['calibration','heldout']){
 const a=report[phase].scenarios;compact[phase]={};
 for(const choice of choices)compact[phase][choice]=Object.fromEntries(variants.map(arm=>[arm,a[choice][arm].win]));
 for(const metric of ['selectedRealHp','selectedAxeHp','selectedAxeHits','genuinePersistentFronts','realSeparateHpWindows'])
  compact[phase][metric]=Object.fromEntries(variants.map(arm=>[arm,a.firstUnlock[arm][metric]]));
}
console.log('BARBARIAN_TOPIC BARBARIAN IRON TIDE REAL ROI '+JSON.stringify({compact,severeWins,counts,nodeWallMs:receipt.nodeWallMs}));
console.log('PASS: 336 real terminal mixed full battles + 12 severe counters, 6 observer/raw RAF SHA pairs, 16 unchanged L4 and 16 unrelated full RAF SHA, 3 raw repeats');
