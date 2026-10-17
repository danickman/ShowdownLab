'use strict';
// Beetank L5: source-only Seismic Ram power-spike versus peer-tier and overwhelming counters.
// Never loaded by browser; preserve the current L4 behavior bit-for-bit.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const baseline=fs.readFileSync(path.join(__dirname,'check-first-ultimate-tier-spike.cjs'),'utf8');
const cutoff='const matched=[];';
assert.equal(baseline.split(cutoff).length,2,'canonical full-terminal source harness moved');
const one=(s,a,b)=>{assert.equal(s.split(a).length,2,'unique source anchor changed: '+a.slice(0,100));return s.replace(a,b)};
let pre=baseline.slice(0,baseline.indexOf(cutoff));
const start="if(a.type==='beetank'&&['ram','horn'].includes(a.action)){";
const stop="if(a.type==='barbarian'&&['axe_swing','rage_swing'].includes(a.action)){";
function seismic(radius,damage,stun,cap){
 return [
 start,
 "  a.ultimateHits=(a.ultimateHits||0)+1;",
 "  if(r===2){",
 "   const victims=enemies.filter(v=>near(v,t,"+radius+"))",
 "    .sort((x,y)=>Math.hypot(x.x-t.x,x.y-t.y)-Math.hypot(y.x-t.x,y.y-t.y)||x.id-y.id)",
 "    .slice(0,"+cap+");",
 "   for(const v of victims){v.stun=Math.max(v.stun,"+stun+");",
 "    hits.push({target:v,source:a,damage:a.dmg*"+damage+"})}",
 "   if(victims.length)cue(a,'seismic',tick,t);",
 "  }else if(a.action==='ram'||a.ultimateHits%3===0){",
 "   for(const v of enemies.filter(v=>near(v,t,.11))){v.stun=Math.max(v.stun,12);",
 "    hits.push({target:v,source:a,damage:a.dmg*.35})}",
 "   cue(a,'seismic',tick,t)",
 "  }",
 " }"
 ].join('\n');
}
const inject=[
 "const beeStart=ult.indexOf("+JSON.stringify(start)+");",
 "const beeStop=ult.indexOf("+JSON.stringify(stop)+",beeStart);",
 "assert(beeStart>0&&beeStop>beeStart,'existing Beetank section boundary drift');",
 "const changed=s=>ult.slice(0,beeStart)+s+'\\n'+ult.slice(beeStop);",
 "const candidates={shock:changed("+JSON.stringify(seismic('.17','.82','18','4'))+"),quake:changed("+JSON.stringify(seismic('.19','1.00','14','5'))+")};"
].join('\n');
pre=one(pre,"const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];",inject+"\nconst choices=['hold','firstUnlock','matchedUnlock','foeDouble'];");
pre=one(pre,"vm.createContext(env);vm.runInContext(evo,env);vm.runInContext(ult,env);",
 "vm.createContext(env);vm.runInContext(evo,env);vm.runInContext(candidates[c.arm]||ult,env);");
pre=one(pre,"damage:dealt,x:t.x,y:t.y","damage:dealt,secondary:!!secondary,x:t.x,y:t.y");
pre=one(pre,"selectedPositiveHits:hits.filter(x=>selected.has(x.attacker)).length,",
 "selectedPositiveHits:hits.filter(x=>selected.has(x.attacker)).length,"+
 "selectedSecondaryHp:hp(x=>selected.has(x.attacker)&&x.secondary),"+
 "selectedSecondaryHits:hits.filter(x=>selected.has(x.attacker)&&x.secondary).length,");
pre=one(pre," return army;\n}\nfunction simulate(",
 " if(!us&&choice==='foeArmyDouble')army.push(...army.map(u=>({...u,squad:u.squad+200})));\n return army;\n}\nfunction simulate(");
new Function('require','__dirname','console','process',pre+';return true;');
const {simulate,roles}=vm.runInNewContext(pre+'\n;({simulate,roles})',
 {require,__dirname,console,process},{filename:'beetank-seismic-source-harness.cjs'});
assert.equal(roles.length,10);
const sources=['current','shock','quake'],choices=['firstUnlock','matchedUnlock','foeDouble','foeArmyDouble'];
const seeds=[9821,11071,14341,19121],unseen=new Set(seeds.slice(2)),cases=[];
for(const level of [3,4])for(const count of [20,40])for(const seed of seeds)for(const side of ['blue','red']){
 const fixture={role:'beetank',level,count,seed,side},scenarios={};
 for(const choice of choices){
  const options={};
  for(const arm of sources){
   const z=simulate({...fixture,arm},choice);
   assert([0,1].includes(z.win),'must have real terminal winner');
   assert(z.selectedRealHp>=0&&z.genuinePersistentFronts>=0&&z.realSeparateHpWindows>=0);
   const bodies=count+(choice==='foeDouble'?3*count/20:choice==='foeArmyDouble'?count/2:0);
   assert.equal(z.units,bodies,'real family doubling differs from whole opposing team');
   options[arm]={win:z.win,winner:z.winner,selectedActualHp:z.selectedRealHp,
    secondaryRealHp:z.selectedSecondaryHp,secondaryPositiveHits:z.selectedSecondaryHits,
    persistentFronts:z.genuinePersistentFronts,separatedWindows:z.realSeparateHpWindows,
    units:z.units,ticks:z.ticks};
  }
  scenarios[choice]=options;
 }
 cases.push({fixture,scenarios});
}
assert.equal(cases.length,32);
const exceptional=[];
for(const level of [3,4])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const fixture={role:'beetank',level,count:20,seed,side},options={};
 for(const arm of sources){
  const z=simulate({...fixture,arm},'overwhelmed');
  assert.equal(z.units,18);
  options[arm]={win:z.win,winner:z.winner,physicalSecondaryHp:z.selectedSecondaryHp};
 }
 exceptional.push({fixture,options});
}
assert.equal(exceptional.length,8);
let parity=0;
for(const level of [3,4])for(const count of [20,40])for(const arm of sources){
 const fixture={role:'beetank',level,count,seed:19121,side:'red',arm};
 assert.equal(simulate(fixture,'firstUnlock',true,true).digest,
  simulate(fixture,'firstUnlock',false,true).digest,
  'no instrumented-vs-raw frame-state changes '+JSON.stringify(fixture));
 parity++;
}
assert.equal(parity,12);
let strictL4=0;
for(const count of [20,40])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const fixture={role:'beetank',level:3,count,seed,side};
 const original=simulate({...fixture,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['shock','quake']){
  assert.equal(simulate({...fixture,arm},'firstUnlock',false,true).digest,original,
   'L4 and every other role must be EXACTLY unchanged by L5-only source hypothesis');
  strictL4++;
 }
}
assert.equal(strictL4,16);
function summarize(rows){
 const report={fixtures:rows.length};
 for(const choice of choices){
  report[choice]={};
  for(const arm of sources){
   const v=rows.map(x=>x.scenarios[choice][arm]),total=k=>+v.reduce((n,x)=>n+x[k],0).toFixed(2);
   report[choice][arm]={wins:total('win'),actualSelectedHp:total('selectedActualHp'),
    actualSecondaryHp:total('secondaryRealHp'),realSecondaryHits:total('secondaryPositiveHits'),
    authenticPersistentFronts:total('persistentFronts'),
    separatedPhysicalHpWindows:total('separatedWindows')};
  }
 }
 return report;
}
const summary={};
for(const phase of ['training','unseen']){
 const subset=cases.filter(x=>unseen.has(x.fixture.seed)===(phase==='unseen'));
 summary[phase+'-all']=summarize(subset);
 for(const level of [3,4])summary[phase+'-L'+(level+1)]=summarize(subset.filter(x=>x.fixture.level===level));
}
const severeWins=Object.fromEntries(sources.map(x=>[x,exceptional.reduce((n,v)=>n+v.options[x].win,0)]));
const receipt={
 status:'QA SOURCE RESEARCH ONLY: original Beetank L5 vs bounded all-horn Seismic Overdrive alternatives; NOTHING shipped',
 design:'First L4 and L5 should swing a fair round unless matched evolution, entire-army x2, disproportionate composition or huge numbers. L4 is held exactly unchanged. At L5 each horn strike/ram sends one bounded seismic pulse around struck defender: Shock radius .17, cap4, 82% attack, 18tick stagger; Quake radius .19, cap5, 100% attack, 14tick stagger. Keep initial direct hit, no recursive pulse, stable nearest-distance and physical-ID order.',
 method:'20/40 total starting bodies, 2 tiers L3->L4 and L4->L5, training seeds 9821/11071 and unseen 14341/19121, both side mirrors, four choices first unlock vs prior tier, matched peer upgrade, doubled opponent Beetank family, doubled ENTIRE opposing army. 32 fixtures x4 counter cases x3 source arms =384 actual complete terminal matches plus 8 severe 3-evolved-vs-15 fixtures x3 arms=24 =408. Twelve original/observed entire-RAF SHA pairs, plus 16 L4 baseline-vs-both-L5-candidate source exact-RAF SHA controls. Record post-mitigation actual secondary-HP damage, full terminal winners and genuine positive-HP geographically separated damaging fronts. Node/source-only; no real Safari FPS claim.',
 seeds,parity,strictL4,summary,severeWins,cases,exceptional};
if(process.env.QA_BEETANK_SEISMIC_RECEIPT)fs.writeFileSync(process.env.QA_BEETANK_SEISMIC_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('BEETANK SEISMIC FIRST-UNLOCK A/B '+JSON.stringify({summary,severeWins}));
console.log('PASS: 408 real terminal Beetank source cases, 12 raw-observed full RAF parity pairs, 16 unchanged-L4 raw RAF pairs');
