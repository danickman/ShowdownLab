'use strict';
// Mole L5 SOURCE-ONLY: genuine eruption triggers a bounded forward fissure; no gameplay changes.
// Never loaded by browser; preserve the current L4 behavior bit-for-bit.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const baseline=fs.readFileSync(path.join(__dirname,'check-first-ultimate-tier-spike.cjs'),'utf8');
const cutoff='const matched=[];';
assert.equal(baseline.split(cutoff).length,2,'canonical full-terminal source harness moved');
const one=(s,a,b)=>{assert.equal(s.split(a).length,2,'unique source anchor changed: '+a.slice(0,100));return s.replace(a,b)};
let pre=baseline.slice(0,baseline.indexOf(cutoff));
const start="if(a.type==='beetank'&&['ram','horn'].includes(a.action)){";
const stop="if(a.type==='barbarian'&&['axe_swing','rage_swing'].includes(a.action)){";
function fissure(length,width,cap,damage,stagger){
 return [
 "if(a.type==='mole'&&r===2&&a.action==='erupt'){",
 " const dir=a.team==='blue'?1:-1;",
 " const lined=enemies.map(v=>({v,forward:(v.x-t.x)*dir,side:Math.abs(v.y-t.y)}))",
 "  .filter(p=>p.forward>=-.025&&p.forward<="+length+"&&p.side<="+width+")",
 "  .sort((p,q)=>p.forward-q.forward||p.side-q.side||p.v.id-q.v.id)",
 "  .slice(0,"+cap+");",
 " for(const p of lined){p.v.stun=Math.max(p.v.stun,"+stagger+");hits.push({target:p.v,source:a,damage:a.dmg*"+damage+"})}",
 " if(lined.length)cue(a,'carapace',tick,t);",
 "}"
 ].join("\n");
}
const inject=[
 "const gate="+JSON.stringify("['sniper','dragon','beetank','barbarian']")+";",
 "const newGate="+JSON.stringify("['sniper','dragon','beetank','mole','barbarian']")+";",
 "const mark="+JSON.stringify("if(a.type==='barbarian'&&['axe_swing','rage_swing'].includes(a.action)){")+";",
 "assert(ult.includes(gate)&&ult.includes(mark),'Mole ultimate source anchor changed');",
 "const changed=body=>ult.replace(gate,newGate).replace(mark,body+"+JSON.stringify('\n')+"+mark);",
 "const candidates={rift:changed("+JSON.stringify(fissure('.25','.075','4','1.25','6'))+"),fault:changed("+JSON.stringify(fissure('.33','.095','5','1.75','8'))+")};"
].join("\n");
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
const sources=['current','rift','fault'],choices=['firstUnlock','matchedUnlock','foeDouble','foeArmyDouble'];
const seeds=[12721,17167,23819,29837],unseen=new Set(seeds.slice(2)),cases=[];
for(const level of [4])for(const count of [20,40])for(const seed of seeds)for(const side of ['blue','red']){
 const fixture={role:'mole',level,count,seed,side},scenarios={};
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
 const fixture={role:'mole',level,count:20,seed,side},options={};
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
 const fixture={role:'mole',level,count,seed:19121,side:'red',arm};
 assert.equal(simulate(fixture,'firstUnlock',true,true).digest,
  simulate(fixture,'firstUnlock',false,true).digest,
  'no instrumented-vs-raw frame-state changes '+JSON.stringify(fixture));
 parity++;
}
assert.equal(parity,12);
let strictL4=0;
for(const count of [20,40])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const fixture={role:'mole',level:3,count,seed,side};
 const original=simulate({...fixture,arm:'current'},'firstUnlock',false,true).digest;
 for(const arm of ['rift','fault']){
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
 status:'QA SOURCE RESEARCH ONLY: current Mole Nuclear Carapace vs bounded L5 eruption Rift and Fault; NOTHING shipped',
 design:'When a L5 Mole actually erupts from burrow and resolves its primary hit, launch a deterministic forward ground fissure from the struck defender: Rift .25 length .075 halfwidth at most 4 extra targets 1.25 attack physical secondary damage six ticks stagger; Fault .33 length .095 halfwidth at most 5 targets 1.75 attack physical secondary damage eight ticks stagger. Primary hit, L1-L4 and all unrelated abilities remain identical. Stable forward position, lateral distance and physical-ID order; no chain or global crowd stun.',
 method:'L4->L5 Mole, 20/40 total start fighters, seeds 12721/17167 calibration and unseen 23819/29837, each blue/red side. 16 matched conditions x four true counter choices (first unlock, same-tier peer, doubled opponent Mole family, doubled ENTIRE opposing army) x3 physical sources =192 fully terminal; four severe 3 Mole vs 15 mixed enemies x3 sources =12, total 204. Twelve original/raw witness entire RAF state SHA pairs and 16 exact-L4 source SHA pairs, post-armor/cap real secondary HP, genuine separated physical damaging fronts and actual winners. Source-only Node simulation, not native Safari.',
 seeds,parity,strictL4,summary,severeWins,cases,exceptional};
if(process.env.QA_MOLE_RIFT_RECEIPT)fs.writeFileSync(process.env.QA_MOLE_RIFT_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('MOLE L5 RIFT FIRST-UNLOCK A/B '+JSON.stringify({summary,severeWins}));
console.log('PASS: 204 real terminal Mole source cases, 12 original-observer full RAF parity pairs, 16 L4 exact-state pairs');
