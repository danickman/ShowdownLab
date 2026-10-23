'use strict';
// Turn 23 physical fairness: Dragon L4 only, genuine charge telegraph (+12/+24 ticks); L5 untouched.
// Source-only. True terminal matches, numerical counterplay, full RAF invariant guards.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const baseline=read('tools/qa/check-first-ultimate-tier-spike.cjs'),cut='const matched=[];';
assert.equal(baseline.split(cut).length,2,'canonical runner shifted');
let h=baseline.slice(0,baseline.indexOf(cut));
const rep=(a,b)=>{assert.equal(h.split(a).length,2,'baseline anchor '+a.slice(0,85));h=h.replace(a,b)};

const windupAnchor="u.windup=u.windupTicks;u.action='fire_windup'";
const windupCandidate=n=>"u.windup=u.windupTicks+(ultimate.rank(u)===1?"+n+":0);u.action='fire_windup'";
const def=[
 'const windupAnchor='+JSON.stringify(windupAnchor)+';',
 "assert.equal(live.split(windupAnchor).length,2,'actual Dragon fire windup anchor changed');",
 'const delta12='+JSON.stringify(windupCandidate(12))+';',
 'const delta24='+JSON.stringify(windupCandidate(24))+';',
 'const variants={current:live,windup12:live.replace(windupAnchor,delta12),windup24:live.replace(windupAnchor,delta24)};'
].join('\n');
rep("const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];",
 def+"\nconst choices=['hold','firstUnlock','matchedUnlock','foeDouble','foeArmyDouble','recruit2','alternativeEvolution'];");
rep("const seeds=[1337,2017];","const seeds=[41443,51799,83117,97429];");
rep("const evolved=target&&((us&&choice!=='hold')||(!us&&choice==='matchedUnlock'));",
 "const alt=c.role==='beetank'?'knight':'beetank';"+
 "const evolved=target&&((us&&!['hold','recruit2','alternativeEvolution'].includes(choice))||(!us&&choice==='matchedUnlock'));"+
 "const allyEvolved=us&&choice==='alternativeEvolution'&&type===alt;");
rep("return{type,level:evolved?advanced:prior,squad:Math.floor(i/5)};",
 "return{type,level:evolved||allyEvolved?advanced:prior,squad:Math.floor(i/5)};");
rep("return army;\n}",
 "if(us&&choice==='recruit2')for(let i=0;i<2;i++)army.push({type:c.role,level:prior,squad:100});"+
 "\n if(!us&&choice==='foeArmyDouble')army.push(...army.map(u=>({...u,squad:u.squad+200})));"+
 "\n return army;\n}");
rep("const wanted=choice==='overwhelmed'?3:c.count/2/10*3;",
 "const wanted=choice==='overwhelmed'?3:c.count/2/10*3+(choice==='recruit2'?2:0);");
rep("u.level===(choice==='hold'?c.level:c.level+1)",
 "u.level===(['hold','recruit2','alternativeEvolution'].includes(choice)?c.level:c.level+1)");
rep("const witnessed=live.replace(anchor,anchor+","const witnessedFor=core=>core.replace(anchor,anchor+");
rep("vm.runInContext(observed?witnessed:live,env);",
 "const core=variants[c.arm||'current'];vm.runInContext(observed?witnessedFor(core):core,env);");
rep("role:a.type,damage:dealt,x:t.x,y:t.y",
 "role:a.type,action:a.action,damage:dealt,x:t.x,y:t.y");
rep("selectedPositiveHits:hits.filter(x=>selected.has(x.attacker)).length,",
 "selectedPositiveHits:hits.filter(x=>selected.has(x.attacker)).length,"+
 "selectedFireHp:hp(x=>selected.has(x.attacker)&&x.action==='fire'),"+
 "selectedFireHits:hits.filter(x=>selected.has(x.attacker)&&x.action==='fire').length,");
new Function('require','__dirname','console','process',h+';return true;');
const {simulate,roles,choices}=vm.runInNewContext(h+';({simulate,roles,choices})',{require,__dirname,console,process});
assert.equal(roles.length,10);assert.equal(choices.length,7);
const arms=['current','windup12','windup24'],seeds=[41443,51799,83117,97429],heldout=new Set(seeds.slice(2));
const matches=[],severe=[],started=process.hrtime.bigint(),round=x=>+x.toFixed(2);
for(const count of [20,40])for(const seed of seeds)for(const side of ['blue','red']){
 const fixture={role:'dragon',level:3,count,seed,side},options={};
 for(const choice of choices){options[choice]={};
  for(const arm of arms){
   const z=simulate({...fixture,arm},choice);
   assert.equal(z.units,count+(choice==='recruit2'?2:choice==='foeDouble'?3*count/20:choice==='foeArmyDouble'?count/2:0),'literal physical population');
   assert([0,1].includes(z.win)&&z.ticks>0&&z.selectedRealHp>=0&&z.realSeparateHpWindows>=0);
   options[choice][arm]=z;
  }
 }
 matches.push({fixture,options});
}
assert.equal(matches.length,16);
for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const fixture={role:'dragon',level:3,count:20,seed,side},options={};
 for(const arm of arms){
  const z=simulate({...fixture,arm},'overwhelmed');assert.equal(z.units,18,'literal 3v15');
  options[arm]=z;
 }
 severe.push({fixture,options});
}
assert.equal(severe.length,4);
let observerPairs=0,unchangedL5=0,unrelatedPairs=0,belowL4Pairs=0,repeatPairs=0;
for(const arm of arms)for(const count of [20,40]){
 const f={role:'dragon',level:3,count,seed:83117,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',true,true).digest,simulate(f,'firstUnlock',false,true).digest,'raw/observed full RAF identity');observerPairs++;
}
for(const count of [20,40])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const dragonL5={role:'dragon',level:4,count,seed,side},baselineL5=simulate({...dragonL5,arm:'current'},'matchedUnlock',false,true).digest;
 const unrelated={role:'assassin',level:3,count,seed,side},unrelatedBase=simulate({...unrelated,arm:'current'},'firstUnlock',false,true).digest;
 const turtle={role:'turtle',level:3,count,seed,side},turtleBase=simulate({...turtle,arm:'current'},'firstUnlock',false,true).digest;
 const low={role:'dragon',level:2,count,seed,side},lowBase=simulate({...low,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of arms.slice(1)){
  assert.equal(simulate({...dragonL5,arm},'matchedUnlock',false,true).digest,baselineL5,'L5-versus-L5 no-L4 battle states unchanged');unchangedL5++;
  assert.equal(simulate({...unrelated,arm},'firstUnlock',false,true).digest,unrelatedBase,'Assassin exact unchanged');unrelatedPairs++;
  assert.equal(simulate({...turtle,arm},'firstUnlock',false,true).digest,turtleBase,'Turtle exact unchanged');unrelatedPairs++;
  assert.equal(simulate({...low,arm},'firstUnlock',false,true).digest,lowBase,'Dragon L3 and lower unchanged');belowL4Pairs++;
 }
}
for(const arm of arms){
 const f={role:'dragon',level:3,count:20,seed:97429,side:'blue',arm};
 assert.equal(simulate(f,'firstUnlock',false,true).digest,simulate(f,'firstUnlock',false,true).digest,'deterministic frame replay');repeatPairs++;
}
assert.equal(observerPairs,6);assert.equal(unchangedL5,16);assert.equal(unrelatedPairs,32);assert.equal(belowL4Pairs,16);assert.equal(repeatPairs,3);
const metrics=['win','selectedRealHp','selectedFireHp','selectedFireHits','genuinePersistentFronts','realSeparateHpWindows','ticks'];
function summarize(rows){
 const out={fixtureGroups:rows.length,choices:{}};
 for(const choice of choices){out.choices[choice]={};
  for(const arm of arms){const z=rows.map(x=>x.options[choice][arm]),o={};
   for(const metric of metrics)o[metric]=round(z.reduce((n,x)=>n+x[metric],0));
   out.choices[choice][arm]=o;
  }
 }
 return out;
}
const summary={calibration:summarize(matches.filter(x=>!heldout.has(x.fixture.seed))),heldout:summarize(matches.filter(x=>heldout.has(x.fixture.seed)))};
const severeWins=Object.fromEntries(arms.map(arm=>[arm,severe.reduce((n,x)=>n+x.options[arm].win,0)]));
const counts={matchedGroups:matches.length,matchedTerminal:336,severeTerminal:12,observerRawRafPairs:observerPairs,unchangedNoL4L5VersusL5RafPairs:unchangedL5,assassinTurtleExactRafPairs:unrelatedPairs,unchangedBelowL4RafPairs:belowL4Pairs,rawRepeatPairs:repeatPairs};
const compact={};
for(const phase of ['calibration','heldout']){const q=summary[phase].choices;compact[phase]={};
 for(const choice of choices)compact[phase][choice]=Object.fromEntries(arms.map(arm=>[arm,q[choice][arm].win]));
 for(const metric of ['selectedRealHp','selectedFireHp','selectedFireHits','genuinePersistentFronts','realSeparateHpWindows'])
  compact[phase][metric]=Object.fromEntries(arms.map(arm=>[arm,q.firstUnlock[arm][metric]]));
}
const evidence={
 status:'SOURCE ONLY: Turn23 Dragon L4 charge source-real, no playable/prod change',
 method:'Dragon L4 only receives an extra 12/24 genuine physics ticks of pre-breath telegraph, vulnerable while winding up. L5 unchanged; no target or range or incoming-damage or burn change. Genuine 20/40 same-body matched seed/red-blue source terminal, actual direct positive HP, heldout whole-foe-army double and genuine 3v15, immutable L5/L3/off-role RAF parity; independent fronts. These sampled rosters are not universal real-draft odds; Safari not measured.',
 sources:Object.fromEntries(['v3/legacy-sim-core.js','v3/ultimate-abilities.js'].map(p=>[p,crypto.createHash('sha256').update(read(p)).digest('hex')])),
 seeds:{calibration:seeds.slice(0,2),heldout:seeds.slice(2)},counts,summary,severeWins,compact,
 nodeWallMs:round(Number(process.hrtime.bigint()-started)/1e6),matches,severe
};
if(process.env.QA_TURN23_RECEIPT)fs.writeFileSync(process.env.QA_TURN23_RECEIPT,JSON.stringify(evidence,null,2)+'\n');
console.log('TURN23 TURN23 DRAGON L4 CHARGE PHYSICAL ROI '+JSON.stringify({compact,severeWins,counts,nodeWallMs:evidence.nodeWallMs}));
console.log('PASS: 336 full terminal matched +12 severe; six exact raw/observed, 16 unchanged Dragon L5-vs-L5 without L4 opponents, 16 unchanged low-tier Dragon, 32 unchanged Assassin/Turtle and three exact raw repeats');
