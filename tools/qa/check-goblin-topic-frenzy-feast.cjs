'use strict';
// Goblin refined topic: genuine 20/40-body Goblin L5 Breakthrough physical multi-target splash ROI.
// Three source-only arms: exact playable, L5 collision reach and L5 contact-bound Breakthrough.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const orig=read('tools/qa/check-first-ultimate-tier-spike.cjs'),cut='const matched=[];';
assert.equal(orig.split(cut).length,2,'canonical genuine terminal source runner changed');
let h=orig.slice(0,orig.indexOf(cut));
const substitute=(a,b)=>{assert.equal(h.split(a).length,2,'canonical harness anchor: '+a.slice(0,85));h=h.replace(a,b)};
// Only the L5 Goblin step moves or strikes differently. Every L4/other full RAF must remain identical.
const injected="const oldStep=\"function goblinStep(u,t,d){const gap=visualSpacingRadius(u)+visualSpacingRadius(t)-(bodyRadius(u)+bodyRadius(t))*.22,r=gap>u.range/500?gap+.002:u.range/500;u.chaos--;if(d>r){u.action=u.chaos<=0?'zigzag':'rush';if(u.chaos<=0){u.chaos=9+Math.floor(rnd()*15);u.y=clamp(u.y+(rnd()-.5)*.07)}moveToward(u,t,1,u.action==='zigzag'?1.55:1.22);return}if(u.cooldown<=0){u.action='stab';hit(u,t,rnd()<.16?1.55:1);u.cooldown=u.cd}else{u.action='skitter';u.y=clamp(u.y+(rnd()-.5)*.018)}}\";\nconst frenzyStep=\"function goblinStep(u,t,d){const gap=visualSpacingRadius(u)+visualSpacingRadius(t)-(bodyRadius(u)+bodyRadius(t))*.22,r=gap>u.range/500?gap+.002:u.range/500;u.chaos--;if(d>r){u.action=u.chaos<=0?'zigzag':'rush';if(u.chaos<=0){u.chaos=9+Math.floor(rnd()*15);u.y=clamp(u.y+(rnd()-.5)*.07)}moveToward(u,t,1,u.action==='zigzag'?1.55:1.22);return}if(u.cooldown<=0){u.action='stab';hit(u,t,rnd()<.16?1.55:1);u.cooldown=ultimate.rank(u)===2?Math.max(7,Math.round(u.cd*.58)):u.cd}else{u.action='skitter';u.y=clamp(u.y+(rnd()-.5)*.018)}}\";\nconst afterAnchor=\"if(!r||!['sniper','dragon','beetank','mole','goblin'].includes(a.type))return hits;\";\nconst feastCode=\"\\n // Only L5 actual primary stab HP removed: bounded surviving pack blood-share.\\n if(a.type==='goblin'&&r===2&&a.action==='stab'&&a.hp>0&&dealt>0){\\n  a.hp=Math.min(a.maxHp,a.hp+dealt*.45);\\n  const ally=units.filter(v=>v!==a&&v.team===a.team&&v.type==='goblin'&&v.hp>0&&v.hp<v.maxHp&&near(v,a,.14))\\n   .sort((x,y)=>x.hp/x.maxHp-y.hp/y.maxHp||x.id-y.id)[0];\\n  if(ally)ally.hp=Math.min(ally.maxHp,ally.hp+dealt*.30);\\n }\\n\";\nconst patch=(s,a,b)=>{assert.equal(s.split(a).length,2,'live physical Goblin source moved');return s.replace(a,b)};\nconst candidates={current:{core:live,ult},frenzy:{core:patch(live,oldStep,frenzyStep),ult},feast:{core:live,ult:patch(ult,afterAnchor,feastCode+afterAnchor)}};";
substitute("const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];",injected+"\nconst choices=['hold','firstUnlock','matchedUnlock','foeDouble','foeArmyDouble','recruit2','alternativeEvolution'];");
substitute("const seeds=[1337,2017];","const seeds=[64381,79231,111907,151297];");
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
 "selectedStabHp:hp(x=>selected.has(x.attacker)&&x.action==='stab'),"+
 "selectedStabHits:hits.filter(x=>selected.has(x.attacker)&&x.action==='stab').length,");
new Function('require','__dirname','console','process',h+';return true;');
const {simulate,roles,choices}=vm.runInNewContext(h+';({simulate,roles,choices})',{require,__dirname,console,process});
assert.equal(roles.length,10);assert.equal(choices.length,7);
const variants=['current','frenzy','feast'],seeds=[64381,79231,111907,151297],heldout=new Set(seeds.slice(2));
const fixtures=[],extreme=[],start=process.hrtime.bigint(),round=x=>+x.toFixed(2);
for(const count of [20,40])for(const seed of seeds)for(const side of ['blue','red']){
 const f={role:'goblin',level:4,count,seed,side},options={};
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
 const f={role:'goblin',level:4,count:20,seed,side},options={};
 for(const arm of variants){const z=simulate({...f,arm},'overwhelmed');assert.equal(z.units,18);options[arm]=z}
 extreme.push({f,options});
}
assert.equal(extreme.length,4);
let observerPairs=0,unchangedL4=0,offTarget=0,repeatPairs=0;
for(const count of [20,40])for(const arm of variants){
 const f={role:'goblin',level:4,count,seed:111907,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',true,true).digest,simulate(f,'firstUnlock',false,true).digest,'exact observer/raw RAF');observerPairs++;
}
for(const count of [20,40])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const f={role:'goblin',level:3,count,seed,side};
 const raw=simulate({...f,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['frenzy','feast']){assert.equal(simulate({...f,arm},'firstUnlock',false,true).digest,raw,'L4 physics unchanged');unchangedL4++}
 const other={...f,role:'assassin',level:4},base=simulate({...other,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['frenzy','feast']){assert.equal(simulate({...other,arm},'firstUnlock',false,true).digest,base,'unrelated fighter physics unchanged');offTarget++}
}
for(const arm of variants){
 const f={role:'goblin',level:4,count:20,seed:151297,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',false,true).digest,simulate(f,'firstUnlock',false,true).digest);repeatPairs++;
}
assert.equal(observerPairs,6);assert.equal(unchangedL4,16);assert.equal(offTarget,16);assert.equal(repeatPairs,3);
const metrics=['win','selectedRealHp','selectedStabHp','selectedStabHits','genuinePersistentFronts','realSeparateHpWindows'];
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
 status:'Goblin source-only physical natural self Frenzy or blood-share Pack Feast, current playable unaffected.',
 hypothesis:'L5 only, self Frenzy shortens only the natural cooldown after contact to 58% without allied relay or stun. Feast returns 45% of actual positive defender HP to living stabber and up to 30% to one closest wounded allied Goblin within .14, capped by max HP; no global shield/extra damage. L1-L4 and other evolved roles exact RAF parity. Test first L5, peer, whole army 2x, 3v15, true persistent and separated positive-HP fronts.',
  hashes:Object.fromEntries(['v3/legacy-sim-core.js','v3/ultimate-abilities.js','v3/evolution-rules.js'].map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')])),
 seeds:{calibration:seeds.slice(0,2),heldout:seeds.slice(2)},counts,report,severeWins,
 nodeWallMs:round(Number(process.hrtime.bigint()-start)/1e6),fixtures,extreme
};
if(process.env.QA_GOBLIN_REFINED_TOPIC_RECEIPT)fs.writeFileSync(process.env.QA_GOBLIN_REFINED_TOPIC_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
const compact={};for(const phase of ['calibration','heldout']){
 const a=report[phase].scenarios;compact[phase]={};
 for(const choice of choices)compact[phase][choice]=Object.fromEntries(variants.map(arm=>[arm,a[choice][arm].win]));
 for(const metric of ['selectedRealHp','selectedStabHp','selectedStabHits','genuinePersistentFronts','realSeparateHpWindows'])
  compact[phase][metric]=Object.fromEntries(variants.map(arm=>[arm,a.firstUnlock[arm][metric]]));
}
console.log('GOBLIN_REFINED_TOPIC GOBLIN IRON TIDE REAL ROI '+JSON.stringify({compact,severeWins,counts,nodeWallMs:receipt.nodeWallMs}));
console.log('PASS: 336 real terminal mixed full battles + 12 severe counters, 6 observer/raw RAF SHA pairs, 16 unchanged L4 and 16 unrelated full RAF SHA, 3 raw repeats');
