'use strict';
// Goblin L5 source-only fixed 1.05 secondary damage, compare 0/2/4 stagger ticks.
// Never loaded by browser; preserve the current L4 behavior bit-for-bit.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const baseline=fs.readFileSync(path.join(__dirname,'check-first-ultimate-tier-spike.cjs'),'utf8');
const cutoff='const matched=[];';
assert.equal(baseline.split(cutoff).length,2,'canonical full-terminal source harness moved');
const one=(s,a,b)=>{assert.equal(s.split(a).length,2,'unique source anchor changed: '+a.slice(0,100));return s.replace(a,b)};
let pre=baseline.slice(0,baseline.indexOf(cutoff));
// Load current live ability source including accepted Mole Twin; this is NOT the frozen historical Mole test.


const inject="const gate=\"['sniper','dragon','beetank','mole','barbarian']\";\nconst newGate=\"['sniper','dragon','beetank','mole','goblin','barbarian']\";\nconst mark=\"if(a.type==='barbarian'&&['axe_swing','rage_swing'].includes(a.action)){\";\nassert(ult.split(gate).length===2&&ult.split(mark).length===2,'Goblin source anchor drift');\nconst changed=body=>ult.replace(gate,newGate).replace(mark,body+'\\n'+mark);\nconst candidates={dry:changed(\"if(a.type==='goblin'&&r===2&&a.action==='stab'&&t.hp>0){\\n const friends=units.filter(u=>u!==a&&u.team===a.team&&u.type==='goblin'&&u.hp>0&&near(u,t,.16)).length;\\n if(friends>=1){\\n  hits.push({target:t,source:a,damage:a.dmg*1.05});cue(a,'pack',tick,t)\\n }\\n}\"),pin2:changed(\"if(a.type==='goblin'&&r===2&&a.action==='stab'&&t.hp>0){\\n const friends=units.filter(u=>u!==a&&u.team===a.team&&u.type==='goblin'&&u.hp>0&&near(u,t,.16)).length;\\n if(friends>=1){\\n  t.stun=Math.max(t.stun,2);\\n  hits.push({target:t,source:a,damage:a.dmg*1.05});cue(a,'pack',tick,t)\\n }\\n}\"),pin4:changed(\"if(a.type==='goblin'&&r===2&&a.action==='stab'&&t.hp>0){\\n const friends=units.filter(u=>u!==a&&u.team===a.team&&u.type==='goblin'&&u.hp>0&&near(u,t,.16)).length;\\n if(friends>=1){\\n  t.stun=Math.max(t.stun,4);\\n  hits.push({target:t,source:a,damage:a.dmg*1.05});cue(a,'pack',tick,t)\\n }\\n}\")};";
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
const sources=['current','dry','pin2','pin4'],choices=['firstUnlock','matchedUnlock','foeDouble','foeArmyDouble'];
const seeds=[11717,23771,71569,87071],unseen=new Set(seeds.slice(2)),cases=[];
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
assert.equal(parity,16);
let strictL4=0;
for(const count of [20,40])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const fixture={role:'goblin',level:3,count,seed,side};
 const original=simulate({...fixture,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['dry','pin2','pin4']){
  assert.equal(simulate({...fixture,arm},'firstUnlock',false,true).digest,original,
   'L4 and every other role must be EXACTLY unchanged by L5-only source hypothesis');
  strictL4++;
 }
}
assert.equal(strictL4,24);
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


 status:'SOURCE ONLY Goblin L5 1.05 follow-up physical hit with 0/2/4 ticks stagger, no playable edit',
 design:'One extra recursive-hit-safe 1.05x attack hit to surviving genuine L5 stab defender ONLY if a live friendly Goblin within .16; Dry0, Pin2, Pin4 differ only by stun tick ceiling, unchanged target, actual positive HP, no multi-target area damage. Prior heldout Pin4 first L5 7/8 but real HP windows baseline 81 to Pin4 63.',
 method:'Four seeds calibration 11717/23771 new heldout 71569/87071, 20/40 fighters, both mirrors; first L5, peer L5, doubled foe Goblin FAMILY and doubled WHOLE foe army, four sources =256 true terminal; four 3v15 severe x4 arms=16 extra, 272 terminal. 16 original/observer entire RAF SHA and 24 unchanged-L4 candidate/current exact RAF SHA. Count actual independent damaging fronts and windows, post-cap Goblin HP and numerical counterplay.',
 seeds,parity,strictL4,summary,severeWins,cases,exceptional};
if(process.env.QA_GOBLIN_STAGGER_RECEIPT)fs.writeFileSync(process.env.QA_GOBLIN_STAGGER_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('GOBLIN L5 STAGGER ISOLATION A/B '+JSON.stringify({summary,severeWins}));
console.log('PASS: 272 real terminal Goblin fixed-damage stagger cases, 16 observer/raw exact RAF pairs, 24 unchanged L4 exact RAF pairs');
