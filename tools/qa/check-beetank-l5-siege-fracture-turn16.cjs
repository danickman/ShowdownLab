'use strict';
// Turn 16 source-only Siege Fracture: physically landed L5 heavy hit enables actual allied follow-through.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('tools/qa/check-first-ultimate-tier-spike.cjs'),cut='const matched=[];';
assert.equal(src.split(cut).length,2);
let h=src.slice(0,src.indexOf(cut));
const patch=(a,b)=>{assert.equal(h.split(a).length,2,'source anchor '+a.slice(0,90));h=h.replace(a,b)};
patch("const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];", "const incomingAnchor=\"function incoming(t,damage,units,tick,bastions=units,turtleGuardians=units){\";\nconst hitAnchor=\"if(!r||!['sniper','dragon','beetank','mole','barbarian'].includes(a.type))return hits;\";\nconst bonus=\"if(t.siegeFractureUntil>tick&&['beetank','turtle','dragon'].includes(t.type))damage*=1.65;\";\nconst trigger=\"if(a.type==='beetank'&&r===2&&['horn','ram'].includes(a.action)&&dealt>0&&t.hp>0&&['beetank','turtle','dragon'].includes(t.type)){t.siegeFractureUntil=Math.max(t.siegeFractureUntil||0,tick+96);cue(a,'siege',tick,t)}\";\nassert.equal(ult.split(incomingAnchor).length,2,'incoming moved');\nassert.equal(ult.split(hitAnchor).length,2,'afterHit moved');\nconst fracture=ult.replace(incomingAnchor,incomingAnchor+'\\n'+bonus).replace(hitAnchor,trigger+'\\n'+hitAnchor);\nconst variants={current:ult,fracture};\nconst choices=['hold','firstUnlock','matchedUnlock','foeDouble','foeArmyDouble','recruit2','alternativeEvolution'];");
patch("const seeds=[1337,2017];","const seeds=[27643,32653,75973,89399];");
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
 "vm.runInContext(evo,env);vm.runInContext(variants[c.arm||'current'],env);");
patch("role:a.type,damage:dealt,x:t.x,y:t.y","role:a.type,action:a.action,damage:dealt,x:t.x,y:t.y");
patch("selectedPositiveHits:hits.filter(x=>selected.has(x.attacker)).length,",
 "selectedPositiveHits:hits.filter(x=>selected.has(x.attacker)).length,"+
 "selectedHornHp:hp(x=>selected.has(x.attacker)&&x.action==='horn'),"+
 "selectedHornHits:hits.filter(x=>selected.has(x.attacker)&&x.action==='horn').length,");
new Function('require','__dirname','console','process',h+';return true;');
const {simulate,roles,choices}=vm.runInNewContext(h+';({simulate,roles,choices})',{require,__dirname,console,process});
assert.equal(roles.length,10);assert.equal(choices.length,7);
const variants=['current','fracture'],seeds=[27643,32653,75973,89399],heldout=new Set(seeds.slice(2)),cases=[],severe=[];
const begun=process.hrtime.bigint(),round=x=>+x.toFixed(2);
for(const level of [4])for(const count of [20,40])for(const seed of seeds)for(const side of ['blue','red']){
 const fixture={role:'beetank',level,count,seed,side},scenarios={};
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
assert.equal(cases.length,16);
for(const level of [4])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const f={role:'beetank',level,count:20,seed,side},arm={};
 for(const variant of variants){const z=simulate({...f,arm:variant},'overwhelmed');assert.equal(z.units,18);arm[variant]=z}
 severe.push({fixture:f,arm});
}
assert.equal(severe.length,4);
let observerParity=0,unaffectedParity=0,repeats=0;
for(const level of [4])for(const arm of variants)for(const choice of ['firstUnlock','recruit2']){
 const f={role:'beetank',level,count:20,seed:89399,side:'red',arm};
 assert.equal(simulate(f,choice,true,true).digest,simulate(f,choice,false,true).digest,'raw/observed full-frame SHA');observerParity++;
}
for(const level of [1,2,3])for(const count of [20,40])for(const side of ['blue','red']){
 const f={role:'beetank',level,count,seed:75973,side};
 assert.equal(simulate({...f,arm:'current'},'firstUnlock',false,true).digest,
   simulate({...f,arm:'fracture'},'firstUnlock',false,true).digest,'L1-L3 physical physics unchanged');unaffectedParity++;
}
for(const level of [4])for(const arm of variants){
 const f={role:'beetank',level,count:20,seed:89399,side:'blue',arm};
 assert.equal(simulate(f,'firstUnlock',false,true).digest,simulate(f,'firstUnlock',false,true).digest);repeats++;
}
assert.equal(observerParity,4);assert.equal(unaffectedParity,12);assert.equal(repeats,2);
const fields=['win','selectedRealHp','selectedHornHp','selectedHornHits','allyRealHp','enemyRealHp','genuinePersistentFronts','realSeparateHpWindows'];
const summary={};
for(const phase of ['calibration','heldout'])for(const tier of [5]){
 const rows=cases.filter(x=>heldout.has(x.fixture.seed)===(phase==='heldout')&&x.fixture.level===tier-1),out={fixtures:rows.length,choices:{}};
 for(const choice of choices){out.choices[choice]={};
  for(const arm of variants){const values=rows.map(x=>x.scenarios[choice][arm]),tot={};
   for(const field of fields)tot[field]=round(values.reduce((n,z)=>n+z[field],0));
   out.choices[choice][arm]=tot;
  }
 }
 summary[phase+'-L'+tier]=out;
}
const severeWins={};for(const tier of [5])severeWins['L'+tier]=Object.fromEntries(variants.map(arm=>[arm,severe.filter(x=>x.fixture.level===tier-1).reduce((n,x)=>n+x.arm[arm].win,0)]));
const counts={matchedFixtures:16,matchedTerminal:224,severeTerminal:8,observerRawRafPairs:observerParity,unchangedL1toL4RafPairs:unaffectedParity,rawRepeats:repeats};
const compact={};
for(const tier of [5]){
 const s=summary['heldout-L'+tier];
 compact['L'+tier]=Object.fromEntries(choices.map(c=>[c,Object.fromEntries(variants.map(a=>[a,s.choices[c][a].win]))]));
 for(const field of ['selectedHornHp','selectedHornHits','genuinePersistentFronts','realSeparateHpWindows'])
  compact['L'+tier][field]=Object.fromEntries(variants.map(a=>[a,s.choices.firstUnlock[a][field]]));
 compact['L'+tier].severe=severeWins['L'+tier];
}
const receipt={status:'Source-only Beetank L5 Siege Fracture ROI; no playable game change',
 theory:'A real landed L5 horn/ram fractures only living contact heavy bodies for 96 ticks, with 65 percent more ordinary subsequent true HP damage, no spawned hits, stun or global buff.',
 seeds:{calibration:seeds.slice(0,2),heldout:seeds.slice(2)},counts,summary,severeWins,compact,
 sourceSha256:Object.fromEntries(['v3/legacy-sim-core.js','v3/ultimate-abilities.js','v3/evolution-rules.js'].map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')])),
 nodeWallMs:round(Number(process.hrtime.bigint()-begun)/1e6),cases,severe};
if(process.env.QA_BEETANK_FRACTURE_RECEIPT)fs.writeFileSync(process.env.QA_BEETANK_FRACTURE_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('BEETANK SIEGE FRACTURE HELDOUT SOURCE SUMMARY '+JSON.stringify({compact,counts,severeWins,nodeWallMs:receipt.nodeWallMs}));
console.log('PASS: 224 real terminal L5 draft variants + 8 severe, 4 raw/observer RAF pairs, 12 L1-L4 exact RAF pairs, 2 repeats');
