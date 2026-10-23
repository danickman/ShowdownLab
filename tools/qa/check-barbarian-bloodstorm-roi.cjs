'use strict';
// Turn 5: genuine 20/40-body Barbarian L5 first-unlock ROI.
// Bounded three arms: shipped, contact-only, and one cohesive Bloodstorm proposal.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const orig=read('tools/qa/check-first-ultimate-tier-spike.cjs'),cut='const matched=[];';
assert.equal(orig.split(cut).length,2,'canonical genuine terminal source runner changed');
let h=orig.slice(0,orig.indexOf(cut));
const substitute=(a,b)=>{assert.equal(h.split(a).length,2,'canonical harness anchor: '+a.slice(0,85));h=h.replace(a,b)};
const currentStep="function barbarianStep(u,t,d){const r=u.range/500,ratio=u.hp/u.maxHp;";
const reach="Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)-(bodyRadius(u)+bodyRadius(t))*.22+.002)";
const contactStep="function barbarianStep(u,t,d){const r=ultimate.rank(u)===2?"+reach+":u.range/500,ratio=u.hp/u.maxHp;";
const stormStep="function barbarianStep(u,t,d){const r=ultimate.rank(u)===2?"+reach+":u.range/500,ratio=u.hp/u.maxHp;";
const rageOld="u.rage=ratio<.48;";
const rageNew="u.rage=ratio<.48||(ultimate.rank(u)===2&&(u.bloodstormUntil||0)>tick);";
const oldCleave="if(a.type==='barbarian'&&['axe_swing','rage_swing'].includes(a.action)){";
const stormCleave="if(a.type==='barbarian'&&['axe_swing','rage_swing'].includes(a.action)){if(r===2&&dealt>0){a.bloodstormUntil=tick+75;a.stormHits=(a.stormHits||0)+1;}";
const oldSplash="damage:a.dmg*(r===2?1.00:.58)";
const stormSplash="damage:a.dmg*(r===2?(a.stormHits%3===0?1.7:1.1):.58)";
const oldCue="if(targets.length)cue(a,'cleave',tick,t);";
const newCue="if(targets.length)cue(a,r===2&&a.stormHits%3===0?'bloodstorm':'cleave',tick,t);";
const injected=[
 "const oldStep="+JSON.stringify(currentStep)+";",
 "const contactStep="+JSON.stringify(contactStep)+";",
 "const oldRage="+JSON.stringify(rageOld)+";",
 "const activeRage="+JSON.stringify(rageNew)+";",
 "const cleave="+JSON.stringify(oldCleave)+";",
 "const bloodstorm="+JSON.stringify(stormCleave)+";",
 "const oldSplash="+JSON.stringify(oldSplash)+";",
 "const newSplash="+JSON.stringify(stormSplash)+";",
 "const oldCue="+JSON.stringify(oldCue)+";",
 "const newCue="+JSON.stringify(newCue)+";",
 "const single=(s,a,b)=>{assert.equal(s.split(a).length,2,'candidate source anchor '+a.slice(0,75));return s.replace(a,b)};",
 "const contact=single(live,oldStep,contactStep);",
 "const bloodCore=single(contact,oldRage,activeRage);",
 "const bloodUltimate=single(single(single(ult,cleave,bloodstorm),oldSplash,newSplash),oldCue,newCue);",
 "const candidates={current:{core:live,ult},contact:{core:contact,ult},bloodstorm:{core:bloodCore,ult:bloodUltimate}};"
].join('\n');
substitute("const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];",
 injected+"\nconst choices=['hold','firstUnlock','matchedUnlock','foeDouble','foeArmyDouble','recruit2','alternativeEvolution'];");
substitute("const seeds=[1337,2017];","const seeds=[22483,36991,78511,95261];");
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
const variants=['current','contact','bloodstorm'],seeds=[22483,36991,78511,95261],heldout=new Set(seeds.slice(2));
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
 const f={role:'barbarian',level:4,count,seed:78511,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',true,true).digest,simulate(f,'firstUnlock',false,true).digest,'exact observer/raw RAF');observerPairs++;
}
for(const count of [20,40])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const f={role:'barbarian',level:3,count,seed,side};
 const raw=simulate({...f,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['contact','bloodstorm']){assert.equal(simulate({...f,arm},'firstUnlock',false,true).digest,raw,'L4 physics unchanged');unchangedL4++}
 const other={...f,role:'beetank',level:4},base=simulate({...other,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['contact','bloodstorm']){assert.equal(simulate({...other,arm},'firstUnlock',false,true).digest,base,'unrelated fighter physics unchanged');offTarget++}
}
for(const arm of variants){
 const f={role:'barbarian',level:4,count:20,seed:95261,side:'red',arm};
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
 status:'QA current-source Barbarian L5 source-only A/B. No playable patch.',
 hypothesis:'Contact reach is limited to legitimate physical melee collision, not distant range. Strong Bloodstorm activates for 75 ticks only after an actual L5 primary axe HP hit and uses current rage movement/attack cooldown, and every third REAL successful primary hit inflicts 1.7x instead of 1.1x physical secondary Cleave (5 targets, existing stun cap); never recursive or permanent. L4 unchanged. Two candidates versus live: contact only and contact + capped Bloodstorm momentum.',
 hashes:Object.fromEntries(['v3/legacy-sim-core.js','v3/ultimate-abilities.js','v3/evolution-rules.js'].map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')])),
 seeds:{calibration:seeds.slice(0,2),heldout:seeds.slice(2)},counts,report,severeWins,
 nodeWallMs:round(Number(process.hrtime.bigint()-start)/1e6),fixtures,extreme
};
if(process.env.QA_BLOODSTORM_RECEIPT)fs.writeFileSync(process.env.QA_BLOODSTORM_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
const compact={};for(const phase of ['calibration','heldout']){
 const a=report[phase].scenarios;compact[phase]={};
 for(const choice of choices)compact[phase][choice]=Object.fromEntries(variants.map(arm=>[arm,a[choice][arm].win]));
 for(const metric of ['selectedRealHp','selectedAxeHp','selectedAxeHits','genuinePersistentFronts','realSeparateHpWindows'])
  compact[phase][metric]=Object.fromEntries(variants.map(arm=>[arm,a.firstUnlock[arm][metric]]));
}
console.log('BARBARIAN L5 BLOODSTORM SOURCE ROI '+JSON.stringify({compact,severeWins,counts,nodeWallMs:receipt.nodeWallMs}));
console.log('PASS: 336 real terminal mixed full battles + 12 severe counters, 6 observer/raw RAF SHA pairs, 16 unchanged L4 and 16 unrelated full RAF SHA, 3 raw repeats');
