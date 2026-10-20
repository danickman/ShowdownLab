'use strict';
// Turtle topic: physically-real source study of two reactive L5 reprisal abilities, not defense-number inflation.
// Three arms: exact playable original; bounded Rebound shell pulse; stronger Citadel pulse.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const orig=read('tools/qa/check-first-ultimate-tier-spike.cjs'),cut='const matched=[];';
assert.equal(orig.split(cut).length,2,'canonical genuine terminal source runner changed');
let h=orig.slice(0,orig.indexOf(cut));
const substitute=(a,b)=>{assert.equal(h.split(a).length,2,'canonical harness anchor: '+a.slice(0,85));h=h.replace(a,b)};
// Defense coverage remains unchanged; counterattack triggers only on an actual enemy primary hit in close combat.
const injected="const pulseAnchor=\"if(!r||!['sniper','dragon','beetank','mole','barbarian'].includes(a.type))return hits;\";\nconst reboundPulse=\"\\n if(a&&a.team!==t.team&&a.hp>0&&dealt>0&&t.hp>0){\\n  let guardian=t.type==='turtle'&&rank(t)===2?t:null;\\n  if(!guardian&&t.hp/t.maxHp<.6){let best=Infinity;\\n   for(const u of units)if(u!==t&&u.team===t.team&&u.hp>0&&u.type==='turtle'&&rank(u)===2&&near(u,t,.14)){\\n    const d=Math.hypot(u.x-t.x,u.y-t.y);\\n    if(d<best){best=d;guardian=u}\\n   }\\n  }\\n  if(guardian&&near(guardian,a,.23)&&tick-(guardian.shellReprisalTick??-1000)>=54){\\n   guardian.shellReprisalTick=tick;\\n   hits.push({target:a,source:guardian,damage:guardian.dmg*1.45});\\n   const ripple=units.filter(v=>v!==a&&v.team!==guardian.team&&v.hp>0&&v.burrow<=0&&near(v,a,0.105))\\n    .sort((x,y)=>Math.hypot(x.x-a.x,x.y-a.y)-Math.hypot(y.x-a.x,y.y-a.y)||x.id-y.id).slice(0,2);\\n   for(const v of ripple){v.stun=Math.max(v.stun,8);hits.push({target:v,source:guardian,damage:guardian.dmg*0.65})}\\n   cue(guardian,'reprisal',tick,a);\\n  }\\n }\\n\";\nconst citadelPulse=\"\\n if(a&&a.team!==t.team&&a.hp>0&&dealt>0&&t.hp>0){\\n  let guardian=t.type==='turtle'&&rank(t)===2?t:null;\\n  if(!guardian&&t.hp/t.maxHp<.6){let best=Infinity;\\n   for(const u of units)if(u!==t&&u.team===t.team&&u.hp>0&&u.type==='turtle'&&rank(u)===2&&near(u,t,.14)){\\n    const d=Math.hypot(u.x-t.x,u.y-t.y);\\n    if(d<best){best=d;guardian=u}\\n   }\\n  }\\n  if(guardian&&near(guardian,a,.23)&&tick-(guardian.shellReprisalTick??-1000)>=46){\\n   guardian.shellReprisalTick=tick;\\n   hits.push({target:a,source:guardian,damage:guardian.dmg*1.95});\\n   const ripple=units.filter(v=>v!==a&&v.team!==guardian.team&&v.hp>0&&v.burrow<=0&&near(v,a,0.115))\\n    .sort((x,y)=>Math.hypot(x.x-a.x,x.y-a.y)-Math.hypot(y.x-a.x,y.y-a.y)||x.id-y.id).slice(0,2);\\n   for(const v of ripple){v.stun=Math.max(v.stun,12);hits.push({target:v,source:guardian,damage:guardian.dmg*1.05})}\\n   cue(guardian,'reprisal',tick,a);\\n  }\\n }\\n\";\nconst single=(s,a,b)=>{assert.equal(s.split(a).length,2,'physical Turtle afterHit source anchor moved');return s.replace(a,b)};\nconst reboundUlt=single(ult,pulseAnchor,reboundPulse+pulseAnchor);\nconst citadelUlt=single(ult,pulseAnchor,citadelPulse+pulseAnchor);\nconst candidates={current:{core:live,ult},rebound:{core:live,ult:reboundUlt},citadel:{core:live,ult:citadelUlt}};";
substitute("const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];",injected+"\nconst choices=['hold','firstUnlock','matchedUnlock','foeDouble','foeArmyDouble','recruit2','alternativeEvolution'];");
substitute("const seeds=[1337,2017];","const seeds=[53831,66083,92681,120907];");
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
const variants=['current','rebound','citadel'],seeds=[53831,66083,92681,120907],heldout=new Set(seeds.slice(2));
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
 const f={role:'turtle',level:4,count,seed:92681,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',true,true).digest,simulate(f,'firstUnlock',false,true).digest,'exact observer/raw RAF');observerPairs++;
}
for(const count of [20,40])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const f={role:'turtle',level:3,count,seed,side};
 const raw=simulate({...f,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['rebound','citadel']){assert.equal(simulate({...f,arm},'firstUnlock',false,true).digest,raw,'L4 physics unchanged');unchangedL4++}
 const other={...f,role:'assassin',level:4},base=simulate({...other,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['rebound','citadel']){assert.equal(simulate({...other,arm},'firstUnlock',false,true).digest,base,'unrelated fighter physics unchanged');offTarget++}
}
for(const arm of variants){
 const f={role:'turtle',level:4,count:20,seed:120907,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',false,true).digest,simulate(f,'firstUnlock',false,true).digest);repeatPairs++;
}
assert.equal(observerPairs,6);assert.equal(unchangedL4,16);assert.equal(offTarget,16);assert.equal(repeatPairs,3);
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
 status:'Turtle Shell Reprisal — source-only topic study, not yet playable.',
 hypothesis:'L5 Turtle becomes a defensive retaliation anchor against close assault to itself or a wounded ally it guards. Rebound 1.45x Turtle attack on attacker and up to 2 clustered foes 0.65x, stagger 8 ticks, cooldown 54; Citadel 1.95x and 2x 1.05, stagger 12, cooldown 46. Protected ally remains below 60% HP and within base .14; no L4, standard reflect, or Beetank mutation. Real attacker-credited HP/ROI and heldout 2x+severe counters decide.',
  hashes:Object.fromEntries(['v3/legacy-sim-core.js','v3/ultimate-abilities.js','v3/evolution-rules.js'].map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')])),
 seeds:{calibration:seeds.slice(0,2),heldout:seeds.slice(2)},counts,report,severeWins,
 nodeWallMs:round(Number(process.hrtime.bigint()-start)/1e6),fixtures,extreme
};
if(process.env.QA_TURTLE_TOPIC_RECEIPT)fs.writeFileSync(process.env.QA_TURTLE_TOPIC_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
const compact={};for(const phase of ['calibration','heldout']){
 const a=report[phase].scenarios;compact[phase]={};
 for(const choice of choices)compact[phase][choice]=Object.fromEntries(variants.map(arm=>[arm,a[choice][arm].win]));
 for(const metric of ['selectedRealHp','allyRealHp','genuinePersistentFronts','realSeparateHpWindows'])
  compact[phase][metric]=Object.fromEntries(variants.map(arm=>[arm,a.firstUnlock[arm][metric]]));
}
console.log('TURTLE_TOPIC TURTLE LAST STAND SHELL REPRISAL REAL ROI '+JSON.stringify({compact,severeWins,counts,nodeWallMs:receipt.nodeWallMs}));
console.log('PASS: 224 real terminal mixed full battles + 8 severe counters, 4 observer/raw RAF SHA pairs, 8 unchanged L4 and 8 unrelated full RAF SHA, 2 raw repeats');
