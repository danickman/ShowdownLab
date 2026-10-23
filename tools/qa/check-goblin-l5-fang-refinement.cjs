'use strict';
// Goblin L5 source-only follow-up: stronger Double Fang versus brief Pin; live gameplay untouched.
// Never loaded by browser; preserve the current L4 behavior bit-for-bit.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const baseline=fs.readFileSync(path.join(__dirname,'check-first-ultimate-tier-spike.cjs'),'utf8');
const cutoff='const matched=[];';
assert.equal(baseline.split(cutoff).length,2,'canonical full-terminal source harness moved');
const one=(s,a,b)=>{assert.equal(s.split(a).length,2,'unique source anchor changed: '+a.slice(0,100));return s.replace(a,b)};
let pre=baseline.slice(0,baseline.indexOf(cutoff));
// Load current live ability source including accepted Mole Twin; this is NOT the frozen historical Mole test.


const inject=[
 "const gate="+JSON.stringify("['sniper','dragon','beetank','mole','barbarian']")+";",
 "const newGate="+JSON.stringify("['sniper','dragon','beetank','mole','goblin','barbarian']")+";",
 "const mark="+JSON.stringify("if(a.type==='barbarian'&&['axe_swing','rage_swing'].includes(a.action)){")+";",
 "assert(ult.split(gate).length===2&&ult.split(mark).length===2,'Goblin L5 source A/B anchor moved');",
 "const changed=body=>ult.replace(gate,newGate).replace(mark,body+'\\n'+mark);",
 "const candidates={surge:changed("+JSON.stringify("if(a.type==='goblin'&&r===2&&a.action==='stab'&&t.hp>0){\n const friends=units.filter(u=>u!==a&&u.team===a.team&&u.type==='goblin'&&u.hp>0&&near(u,t,.16)).length;\n if(friends>=1){\n  hits.push({target:t,source:a,damage:a.dmg*1.2});cue(a,'pack',tick,t)\n }\n}")+"),pin:changed("+JSON.stringify("if(a.type==='goblin'&&r===2&&a.action==='stab'&&t.hp>0){\n const friends=units.filter(u=>u!==a&&u.team===a.team&&u.type==='goblin'&&u.hp>0&&near(u,t,.16)).length;\n if(friends>=1){\n  t.stun=Math.max(t.stun,4);\n  hits.push({target:t,source:a,damage:a.dmg*1.05});cue(a,'pack',tick,t)\n }\n}")+")};"
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
 {require,__dirname,console,process},{filename:'goblin-pack-first-L5-source-harness.cjs'});
assert.equal(roles.length,10);
const sources=['current','surge','pin'],choices=['firstUnlock','matchedUnlock','foeDouble','foeArmyDouble'];
const seeds=[11717,23771,50821,62951],unseen=new Set(seeds.slice(2)),cases=[];
for(const level of [4])for(const count of [20,40])for(const seed of seeds)for(const side of ['blue','red']){
 const fixture={role:'goblin',level,count,seed,side},scenarios={};
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
assert.equal(cases.length,16);
const exceptional=[];
for(const level of [4])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const fixture={role:'goblin',level,count:20,seed,side},options={};
 for(const arm of sources){
  const z=simulate({...fixture,arm},'overwhelmed');
  assert.equal(z.units,18);
  options[arm]={win:z.win,winner:z.winner,physicalSecondaryHp:z.selectedSecondaryHp};
 }
 exceptional.push({fixture,options});
}
assert.equal(exceptional.length,4);
let parity=0;
for(const level of [3,4])for(const count of [20,40])for(const arm of sources){
 const fixture={role:'goblin',level,count,seed:23771,side:'red',arm};
 assert.equal(simulate(fixture,'firstUnlock',true,true).digest,
  simulate(fixture,'firstUnlock',false,true).digest,
  'no instrumented-vs-raw frame-state changes '+JSON.stringify(fixture));
 parity++;
}
assert.equal(parity,12);
let strictL4=0;
for(const count of [20,40])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const fixture={role:'goblin',level:3,count,seed,side};
 const original=simulate({...fixture,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['surge','pin']){
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
 for(const level of [4])summary[phase+'-L'+(level+1)]=summarize(subset.filter(x=>x.fixture.level===level));
}
const severeWins=Object.fromEntries(sources.map(x=>[x,exceptional.reduce((n,v)=>n+v.options[x].win,0)]));
const receipt={


 status:'QA SOURCE-ONLY Goblin L5 improved same-target follow-up power A/B, playable runtime unchanged',
 design:'From first 204-terminal study on current source: heldout first-L5 current 4/8, Pack Hunt 5/8, Double Fang 6/8, entire enemy army x2 and 3-v-15 0 wins, but lower-tier enemy Goblin family double still lost only 1/8 under Fang. Next arms preserve exact current live source, and compare one secondary same-target extra hit triggered by true L5 stab when at least one live allied Goblin within .16 arena units of the still-living physical defender: Surge 1.20x attack with no stun, Pin 1.05x attack plus 4-tick maximum stun. Deterministic, no AoE/chain/teleport. All L4 and other roles must be exact physical RAF parity.',
 method:'Four 20/40 size × both-side mirrors × training seeds 11717/23771 × NEW untouched heldout seeds 50821/62951 =16 fixture groups; first L5, matched peer L5, enemy Goblin family doubled, and entire enemy army doubled, three sources current/Surge/Pin =192 real terminal games; four severe 3 evolved Goblins versus 15 mixed L4 on new heldout ×3 sources =12, total 204 authentic. 12 strict read-only raw/observed whole-RAF SHA pairs and 16 strictly unchanged L4 controls, post-cap Goblin direct/secondary positive HP and genuine persistent geographically separate HP-damaging fronts/windows. Reject designs that wipe whole-army x2 or 3-v-15, suppress independent battles, or only shine in reused training seeds.',
 seeds,parity,strictL4,summary,severeWins,cases,exceptional};
if(process.env.QA_GOBLIN_FANG_REFINEMENT_RECEIPT)fs.writeFileSync(process.env.QA_GOBLIN_FANG_REFINEMENT_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('GOBLIN L5 DOUBLE FANG REFINEMENT A/B '+JSON.stringify({summary,severeWins}));
console.log('PASS: 204 real terminal Goblin Fang refinement cases, 12 exact observer/raw RAF parity, 16 unchanged-L4 source RAF pairs');
