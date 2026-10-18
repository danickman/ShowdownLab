'use strict';
// Turn 3: current-source Beetank L5 physical contact comparison. QA-only.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const baseline=read('tools/qa/check-first-ultimate-tier-spike.cjs'),cut='const matched=[];';
assert.equal(baseline.split(cut).length,2,'canonical full-match runner changed');
let h=baseline.slice(0,baseline.indexOf(cut));
const shipped="function beetankStep(u,t,d){const r=ultimate.rank(u)===2&&['beetank','turtle','dragon'].includes(t.type)?Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)+.002):u.range/500;",previous="function beetankStep(u,t,d){const r=u.range/500;";
const coreRead="const live=read('v3/legacy-sim-core.js')";
if(h.includes(coreRead+';')){
 h=h.replace(coreRead+';',coreRead+'.replace('+JSON.stringify(shipped)+','+JSON.stringify(previous)+');');
}
const swap=(a,b)=>{assert.equal(h.split(a).length,2,'harness source anchor moved '+a.slice(0,80));h=h.replace(a,b)};
const declarations=[
 "const beetankOld="+JSON.stringify("function beetankStep(u,t,d){const r=u.range/500;")+";",
 "assert.equal(live.split(beetankOld).length,2,'current Beetank core changed');",
 "const next=r=>\"function beetankStep(u,t,d){const r=ultimate.rank(u)===2?Math.max(u.range/500,\"+r+\"):u.range/500;\";",
 "const cores={current:live,partial:live.replace(beetankOld,next(\"visualSpacingRadius(u)+visualSpacingRadius(t)-(bodyRadius(u)+bodyRadius(t))*.22+.002\")),full:live.replace(beetankOld,next(\"visualSpacingRadius(u)+visualSpacingRadius(t)+.002\")),heavyOnly:live.replace(beetankOld,\"function beetankStep(u,t,d){const r=ultimate.rank(u)===2&&['beetank','turtle','dragon'].includes(t.type)?Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)+.002):u.range/500;\")};"
].join('\n');
swap("const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];",
 declarations+"\nconst choices=['hold','firstUnlock','matchedUnlock','foeDouble','foeArmyDouble','recruit2','alternativeEvolution'];");
swap("const seeds=[1337,2017];","const seeds=[26017,32417,73813,86417];");
swap("const evolved=target&&((us&&choice!=='hold')||(!us&&choice==='matchedUnlock'));",
 "const alt=c.role==='beetank'?'knight':'beetank';"+
 "const evolved=target&&((us&&!['hold','recruit2','alternativeEvolution'].includes(choice))||(!us&&choice==='matchedUnlock'));"+
 "const allyEvolved=us&&choice==='alternativeEvolution'&&type===alt;");
swap("return{type,level:evolved?advanced:prior,squad:Math.floor(i/5)};",
 "return{type,level:evolved||allyEvolved?advanced:prior,squad:Math.floor(i/5)};");
swap("return army;\n}",
 "if(us&&choice==='recruit2')for(let i=0;i<2;i++)army.push({type:c.role,level:prior,squad:100});"+
 "\n if(!us&&choice==='foeArmyDouble')army.push(...army.map(u=>({...u,squad:u.squad+200})));"+
 "\n return army;\n}");
swap("const wanted=choice==='overwhelmed'?3:c.count/2/10*3;",
 "const wanted=choice==='overwhelmed'?3:c.count/2/10*3+(choice==='recruit2'?2:0);");
swap("u.level===(choice==='hold'?c.level:c.level+1)",
 "u.level===(['hold','recruit2','alternativeEvolution'].includes(choice)?c.level:c.level+1)");
swap("const witnessed=live.replace(anchor,anchor+",
 "const witnessedFor=code=>code.replace(anchor,anchor+");
swap("vm.runInContext(observed?witnessed:live,env);",
 "const core=cores[c.arm||'current'];assert(core,'unrecognized variant');vm.runInContext(observed?witnessedFor(core):core,env);");
swap("role:a.type,damage:dealt,x:t.x,y:t.y",
 "role:a.type,action:a.action,damage:dealt,x:t.x,y:t.y");
swap("selectedPositiveHits:hits.filter(x=>selected.has(x.attacker)).length,",
 "selectedPositiveHits:hits.filter(x=>selected.has(x.attacker)).length,"+
 "selectedHornHp:hp(x=>selected.has(x.attacker)&&x.action==='horn'),"+
 "selectedHornHits:hits.filter(x=>selected.has(x.attacker)&&x.action==='horn').length,");
new Function('require','__dirname','console','process',h+';return true;');
const {simulate,roles,choices}=vm.runInNewContext(h+';({simulate,roles,choices})',{require,__dirname,console,process});
assert.equal(roles.length,10);assert.equal(choices.length,7);
const arms=['current','partial','full','heavyOnly'],seeds=[26017,32417,73813,86417],unseen=new Set(seeds.slice(2)),cases=[],severe=[];
const started=process.hrtime.bigint(),round=n=>+n.toFixed(2);
for(const count of [20,40])for(const seed of seeds)for(const side of ['blue','red']){
 const fixture={role:'beetank',level:4,count,seed,side},scenarios={};
 for(const choice of choices){
  scenarios[choice]={};
  for(const arm of arms){
   const z=simulate({...fixture,arm},choice);
   assert.equal(z.units,count+(choice==='recruit2'?2:choice==='foeDouble'?3*count/20:choice==='foeArmyDouble'?count/2:0),'exact bodies');
   assert(z.win===0||z.win===1);assert(z.selectedRealHp>=0&&z.realSeparateHpWindows>=0);
   scenarios[choice][arm]=z;
  }
 }
 cases.push({fixture,scenarios});
}
assert.equal(cases.length,16);
for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const fixture={role:'beetank',level:4,count:20,seed,side},out={};
 for(const arm of arms){const z=simulate({...fixture,arm},'overwhelmed');assert.equal(z.units,18);out[arm]=z}
 severe.push({fixture,out});
}
assert.equal(severe.length,4);
let observerParity=0,l4Parity=0,offTargetParity=0;
for(const count of [20,40])for(const arm of arms){
 const f={role:'beetank',level:4,count,seed:73813,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',true,true).digest,simulate(f,'firstUnlock',false,true).digest,'full RAF parity '+JSON.stringify(f));observerParity++;
}
for(const count of [20,40])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const f={role:'beetank',level:3,count,seed,side},prior=simulate({...f,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of arms.slice(1)){
  assert.equal(simulate({...f,arm},'firstUnlock',false,true).digest,prior,'L4 unchanged');
  l4Parity++;
 }
 const other={...f,role:'turtle',level:4},base=simulate({...other,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of arms.slice(1)){
  assert.equal(simulate({...other,arm},'firstUnlock',false,true).digest,base,'non-Beetank L5 unchanged');offTargetParity++;
 }
}
assert.equal(observerParity,8);assert.equal(l4Parity,24);assert.equal(offTargetParity,24);
const fields=['win','selectedRealHp','selectedHornHp','selectedHornHits','genuinePersistentFronts','realSeparateHpWindows','ticks'];
function aggregate(rows){
 const summary={fixtures:rows.length,choices:{}};
 for(const choice of choices){
  summary.choices[choice]={};
  for(const arm of arms){
   const values=rows.map(x=>x.scenarios[choice][arm]),s={};
   for(const field of fields)s[field]=round(values.reduce((total,z)=>total+z[field],0));
   summary.choices[choice][arm]=s;
  }
 }
 return summary;
}
const summary={calibration:aggregate(cases.filter(x=>!unseen.has(x.fixture.seed))),heldout:aggregate(cases.filter(x=>unseen.has(x.fixture.seed)))};
const severeWins=Object.fromEntries(arms.map(arm=>[arm,severe.reduce((n,x)=>n+x.out[arm].win,0)]));
const counts={matchedFixtures:cases.length,matchedTerminals:cases.length*choices.length*arms.length,severeTerminals:severe.length*arms.length,observerRawRafPairs:observerParity,unchangedL4RafPairs:l4Parity,unrelatedRoleRafPairs:offTargetParity};
const receipt={status:'Beetank L5 reach candidates SOURCE ONLY; no playable code change',
 sourceCoreSha256:crypto.createHash('sha256').update(read('v3/legacy-sim-core.js')).digest('hex'),
 method:'Current source seven choices: hold, first L5, peer, doubled Beetank family, doubled opposing whole army, +2 real Beetanks, or evolve existing Knight; 20 and 40 fighters, blue/red mirrored, fresh unseen 73813/86417. Current, partial contact-gap and full visual-collision reach variants ONLY L5. Real full-terminal battles, post-cap positive-HP attacker evidence and authentic persistent independent damage fronts/windows, 3v15 severe counter, RAF raw parity, unchanged L4 and off-target L5. No Node FPS inference.',
 seeds,arms,counts,summary,severeWins,nodeElapsedMs:round(Number(process.hrtime.bigint()-started)/1e6),cases,severe};
if(process.env.QA_BEETANK_REACH_RECEIPT)fs.writeFileSync(process.env.QA_BEETANK_REACH_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('BEETANK L5 REACH ROI '+JSON.stringify({summary,severeWins,counts,nodeElapsedMs:receipt.nodeElapsedMs}));
console.log('PASS: Beetank source-real L5 physical reach ROI + strict L4/unrelated full RAF parity');
