'use strict';
// Goblin topic: refined close physical Sabotage mark versus narrow primary interrupt. No playable changes.
// Three source-only arms: live Pack Ambush, close-target dust stagger, close-target ally damage amplification.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const orig=read('tools/qa/check-first-ultimate-tier-spike.cjs'),cut='const matched=[];';
assert.equal(orig.split(cut).length,2,'canonical genuine terminal source runner changed');
let h=orig.slice(0,orig.indexOf(cut));
const substitute=(a,b)=>{assert.equal(h.split(a).length,2,'canonical harness anchor: '+a.slice(0,85));h=h.replace(a,b)};
// Only the L5 Goblin step moves or strikes differently. Every L4/other full RAF must remain identical.
const injected="const trigger=\"if(!secondary)for(const hit of ultimate.afterHit(a,t,dealt,units,tick))hurt(hit.target,hit.damage,hit.source,true)\";\nconst limited=\"\\n // L5 GOBLIN REINFORCEMENT: actual natural close stab ONLY, once per original evolved Goblin.\\n if(!secondary&&a&&a.type==='goblin'&&ultimate.rank(a)===2&&a.action==='stab'&&dealt>0&&a.hp>0&&!a.packCallDone){\\n  a.packCallDone=true;let born=0;\\n  for(let i=0;i<2&&units.filter(v=>v.packEcho===true&&v.team===a.team).length<4;i++){\\n   const dir=a.team==='blue'?-1:1,xx=clamp(a.x+dir*.022),yy=clamp(a.y+(i===0?-.032:.032));\\n   add('goblin',a.team,xx,yy,3,a.squad,0);\\n   const echo=units[units.length-1];echo.packEcho=true;echo.hp*=.72;echo.maxHp*=.72;\\n   echo.cooldown=Math.max(echo.cooldown,16);echo.stun=6;lastAliveCount++;born++;\\n  }\\n  if(born){a.ultimateTick=tick;a.ultimateKind='pack_call';a.ultimateTarget=t.id}\\n }\\n\";\nconst evolved=\"\\n // L5 GOBLIN REINFORCEMENT: actual natural close stab ONLY, once per original evolved Goblin.\\n if(!secondary&&a&&a.type==='goblin'&&ultimate.rank(a)===2&&a.action==='stab'&&dealt>0&&a.hp>0&&!a.packCallDone){\\n  a.packCallDone=true;let born=0;\\n  for(let i=0;i<2&&units.filter(v=>v.packEcho===true&&v.team===a.team).length<6;i++){\\n   const dir=a.team==='blue'?-1:1,xx=clamp(a.x+dir*.022),yy=clamp(a.y+(i===0?-.032:.032));\\n   add('goblin',a.team,xx,yy,4,a.squad,0);\\n   const echo=units[units.length-1];echo.packEcho=true;echo.hp*=.72;echo.maxHp*=.72;\\n   echo.cooldown=Math.max(echo.cooldown,16);echo.stun=6;lastAliveCount++;born++;\\n  }\\n  if(born){a.ultimateTick=tick;a.ultimateKind='pack_call';a.ultimateTarget=t.id}\\n }\\n\";\nconst patch=(s,first,code)=>{assert.equal(s.split(first).length,2,'Goblin hit source moved');return s.replace(first,code+first)};\nconst candidates={current:{core:live,ult},rabble:{core:patch(live,trigger,limited),ult},warpack:{core:patch(live,trigger,evolved),ult}};";
substitute("const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];",injected+"\nconst choices=['hold','firstUnlock','matchedUnlock','foeDouble','foeArmyDouble','recruit2','alternativeEvolution'];");
substitute("const seeds=[1337,2017];","const seeds=[75239,91757,132671,178781];");
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
substitute("units:expected,ticks:state.tick,","units:expected,actualPhysicalBodies:state.units.length,summonedEchoes:state.units.filter(u=>u.packEcho===true).length,ticks:state.tick,");
new Function('require','__dirname','console','process',h+';return true;');
const {simulate,roles,choices}=vm.runInNewContext(h+';({simulate,roles,choices})',{require,__dirname,console,process});
assert.equal(roles.length,10);assert.equal(choices.length,7);
const variants=['current','rabble','warpack'],seeds=[75239,91757,132671,178781],heldout=new Set(seeds.slice(2));
const fixtures=[],extreme=[],start=process.hrtime.bigint(),round=x=>+x.toFixed(2);
for(const count of [20,40])for(const seed of seeds)for(const side of ['blue','red']){
 const f={role:'goblin',level:4,count,seed,side},options={};
 for(const choice of choices){options[choice]={};
  for(const arm of variants){
   const z=simulate({...f,arm},choice);
   assert.equal(z.units,count+(choice==='recruit2'?2:choice==='foeDouble'?3*count/20:choice==='foeArmyDouble'?count/2:0),'must be actual body count');
   assert(z.actualPhysicalBodies>=z.units&&z.actualPhysicalBodies<=z.units+12,'strict physical extra Goblin cap');
   assert(z.summonedEchoes===z.actualPhysicalBodies-z.units,'every added body must be a truthful Goblin echo');
   if(arm==='current')assert.equal(z.summonedEchoes,0,'control must never summon clones');
   assert([0,1].includes(z.win)&&z.ticks>0&&z.selectedRealHp>=0&&z.realSeparateHpWindows>=0);
   options[choice][arm]=z;
  }
 }
 fixtures.push({f,options});
}
assert.equal(fixtures.length,16);
for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const f={role:'goblin',level:4,count:20,seed,side},options={};
 for(const arm of variants){const z=simulate({...f,arm},'overwhelmed');assert.equal(z.units,18);assert(z.actualPhysicalBodies<=30&&z.summonedEchoes===z.actualPhysicalBodies-18);options[arm]=z}
 extreme.push({f,options});
}
assert.equal(extreme.length,4);
let observerPairs=0,unchangedL4=0,offTarget=0,repeatPairs=0;
for(const count of [20,40])for(const arm of variants){
 const f={role:'goblin',level:4,count,seed:132671,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',true,true).digest,simulate(f,'firstUnlock',false,true).digest,'exact observer/raw RAF');observerPairs++;
}
for(const count of [20,40])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const f={role:'goblin',level:3,count,seed,side};
 const raw=simulate({...f,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['rabble','warpack']){assert.equal(simulate({...f,arm},'firstUnlock',false,true).digest,raw,'L4 physics unchanged');unchangedL4++}
 const other={...f,role:'assassin',level:4},base=simulate({...other,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['rabble','warpack']){assert.equal(simulate({...other,arm},'firstUnlock',false,true).digest,base,'unrelated fighter physics unchanged');offTarget++}
}
for(const arm of variants){
 const f={role:'goblin',level:4,count:20,seed:178781,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',false,true).digest,simulate(f,'firstUnlock',false,true).digest);repeatPairs++;
}
assert.equal(observerPairs,6);assert.equal(unchangedL4,16);assert.equal(offTarget,16);assert.equal(repeatPairs,3);
const metrics=['win','selectedRealHp','selectedStabHp','selectedStabHits','genuinePersistentFronts','realSeparateHpWindows','summonedEchoes','actualPhysicalBodies'];
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
 status:'Goblin L5 earned temporary squad reinforcements topic; source-only 20/40 and severe real physical fights.',
 hypothesis:'L5 actual natural landed Goblin stab with positive HP once per Goblin calls up to two physically adjacent temporary evolved fighters, each 72% ordinary L3 (Rabble) or L4 (Warpack) natural HP, normal deterministic motion/damage, 6 ticks visible stagger and cooldown floor16. Cap 4 vs cap6 spawned team-wide, no recursive summons or L1-L4 impact. Opposing peer and literal full opposing army 2x and 3v15 must still counter; measure actual additional bodies, winner ROI and true independent physical damaging fronts. Zero playable changes until source CI and numerical ecology.',
  hashes:Object.fromEntries(['v3/legacy-sim-core.js','v3/ultimate-abilities.js','v3/evolution-rules.js'].map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')])),
 seeds:{calibration:seeds.slice(0,2),heldout:seeds.slice(2)},counts,report,severeWins,
 nodeWallMs:round(Number(process.hrtime.bigint()-start)/1e6),fixtures,extreme
};
if(process.env.QA_GOBLIN_REFINED_TOPIC_RECEIPT)fs.writeFileSync(process.env.QA_GOBLIN_REFINED_TOPIC_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
const compact={};for(const phase of ['calibration','heldout']){
 const a=report[phase].scenarios;compact[phase]={};
 for(const choice of choices)compact[phase][choice]=Object.fromEntries(variants.map(arm=>[arm,a[choice][arm].win]));
 for(const metric of ['selectedRealHp','selectedStabHp','selectedStabHits','genuinePersistentFronts','realSeparateHpWindows','summonedEchoes','actualPhysicalBodies'])
  compact[phase][metric]=Object.fromEntries(variants.map(arm=>[arm,a.firstUnlock[arm][metric]]));
}
console.log('GOBLIN_CALL_TOPIC NATURAL PHYSICAL ROI '+JSON.stringify({compact,severeWins,counts,nodeWallMs:receipt.nodeWallMs}));
console.log('PASS: 336 real terminal mixed full battles + 12 severe counters, 6 observer/raw RAF SHA pairs, 16 unchanged L4 and 16 unrelated full RAF SHA, 3 raw repeats');
