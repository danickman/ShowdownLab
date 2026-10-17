'use strict';
// SOURCE ONLY: Barbarian L4/L5 wide and premium Blood Cleave versus live abilities.
// All physical winners/fronts derive from the authoritative current core, no game changes.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const base=fs.readFileSync(path.join(__dirname,'check-first-ultimate-tier-spike.cjs'),'utf8');
const boundary='const matched=[];';
assert.equal(base.split(boundary).length,2,'first-tier benchmark preamble changed');
const one=(s,a,b)=>{assert.equal(s.split(a).length,2,'source anchor drift: '+a.slice(0,95));return s.replace(a,b)};
let pre=base.slice(0,base.indexOf(boundary));
const section="if(a.type==='barbarian'&&['axe_swing','rage_swing'].includes(a.action)){";
const barb=(r5,d5,stun5)=>[
 section,
 "  const targets=enemies.filter(v=>near(v,t,r===2?"+r5+":.135))",
 "   .sort((x,y)=>Math.hypot(x.x-t.x,x.y-t.y)-Math.hypot(y.x-t.x,y.y-t.y)||x.id-y.id)",
 "   .slice(0,r===2?5:3);",
 "  for(const v of targets){v.stun=Math.max(v.stun,r===2?"+stun5+":8);",
 "   hits.push({target:v,source:a,damage:a.dmg*(r===2?"+d5+":.58)})}",
 "  if(targets.length)cue(a,'cleave',tick,t);",
 "}"
].join('\n');
const prelude=[
 "const barbStart=ult.indexOf("+JSON.stringify(section)+");",
 "const barbStop=ult.indexOf('return hits;',barbStart);",
 "assert(barbStart>0&&barbStop>barbStart,'live Barbarian section moved');",
 "const makeBarb=s=>ult.slice(0,barbStart)+s+'\\n'+ult.slice(barbStop);",
 "const sources={wide:makeBarb("+JSON.stringify(barb(".18",".85","14"))+"),premium:makeBarb("+JSON.stringify(barb(".205","1.00","12"))+")};"
].join('\n');
pre=one(pre,"const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];",prelude+"\nconst choices=['hold','firstUnlock','matchedUnlock','foeDouble'];");
pre=one(pre,"vm.createContext(env);vm.runInContext(evo,env);vm.runInContext(ult,env);",
 "vm.createContext(env);vm.runInContext(evo,env);vm.runInContext(sources[c.arm]||ult,env);");
pre=one(pre,"damage:dealt,x:t.x,y:t.y","damage:dealt,secondary:!!secondary,x:t.x,y:t.y");
pre=one(pre,"selectedPositiveHits:hits.filter(x=>selected.has(x.attacker)).length,",
 "selectedPositiveHits:hits.filter(x=>selected.has(x.attacker)).length,"+
 "\n  selectedSecondaryHp:hp(x=>selected.has(x.attacker)&&x.secondary),"+
 "\n  selectedSecondaryHits:hits.filter(x=>selected.has(x.attacker)&&x.secondary).length,");
pre=one(pre," return army;\n}\nfunction simulate(",
 " if(!us&&choice==='foeArmyDouble')army.push(...army.map(u=>({...u,squad:u.squad+200})));\n return army;\n}\nfunction simulate(");
new Function('require','__dirname','console','process',pre+';return true;');
const {simulate,roles}=vm.runInNewContext(pre+'\n;({simulate,roles})',{require,__dirname,console,process},{filename:'barbarian-source-only-harness.cjs'});
assert.equal(roles.length,10);
const sourcesToRun=['current','wide','premium'],choicesToRun=['firstUnlock','matchedUnlock','foeDouble','foeArmyDouble'];
const seeds=[8111,10103,13007,16001],holdout=new Set(seeds.slice(2)),cases=[];
for(const level of [3,4])for(const count of [20,40])
 for(const seed of seeds)for(const side of ['blue','red']){
  const fixture={role:'barbarian',level,count,seed,side},situations={};
  for(const choice of choicesToRun){
   const samples={};
   for(const arm of sourcesToRun){
    const r=simulate({...fixture,arm},choice);
    assert([0,1].includes(r.win)&&r.genuinePersistentFronts>=0&&r.selectedRealHp>=0,
     'true completed source fight and physical attribution required');
    const units=count+(choice==='foeDouble'?3*(count/20):choice==='foeArmyDouble'?count/2:0);
    assert.equal(r.units,units,'real family vs whole-army double physical unit count');
    samples[arm]={win:r.win,winner:r.winner,actualHp:r.selectedRealHp,secondaryHp:r.selectedSecondaryHp,
     secondaryHits:r.selectedSecondaryHits,independentDamageFronts:r.genuinePersistentFronts,
     separatedPositiveHpWindows:r.realSeparateHpWindows,ticks:r.ticks,units:r.units};
   }
   situations[choice]=samples;
  }
  cases.push({fixture,situations});
 }
assert.equal(cases.length,32);
const severe=[];
for(const level of [3,4])for(const seed of seeds.slice(2))for(const side of ['blue','red']){
 const fixture={role:'barbarian',level,count:20,seed,side},results={};
 for(const arm of sourcesToRun){
  const v=simulate({...fixture,arm},'overwhelmed');
  assert.equal(v.units,18);
  results[arm]={win:v.win,secondaryHp:v.selectedSecondaryHp};
 }
 severe.push({fixture,results});
}
assert.equal(severe.length,8);
let parity=0;
for(const level of [3,4])for(const count of [20,40])for(const arm of sourcesToRun){
 const f={role:'barbarian',level,count,seed:16001,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',true,true).digest,simulate(f,'firstUnlock',false,true).digest,
  'original-vs-instrumented actual physical RAF SHA parity '+JSON.stringify(f));
 parity++;
}
assert.equal(parity,12);
function aggregate(rows){
 const summary={fixtures:rows.length};
 for(const choice of choicesToRun){
  summary[choice]={};
  for(const arm of sourcesToRun){
   const list=rows.map(x=>x.situations[choice][arm]),sum=k=>+list.reduce((n,x)=>n+x[k],0).toFixed(2);
   summary[choice][arm]={wins:sum('win'),physicalHp:sum('actualHp'),
    secondaryPhysicalHp:sum('secondaryHp'),realSecondaryHits:sum('secondaryHits'),
    truePersistentFronts:sum('independentDamageFronts'),
    realSeparatedHpWindows:sum('separatedPositiveHpWindows')};
  }
 }
 return summary;
}
const summary={};
for(const phase of ['calibration','unseen']){
 const rows=cases.filter(x=>holdout.has(x.fixture.seed)===(phase==='unseen'));
 summary[phase+'-all']=aggregate(rows);
 for(const level of [3,4])summary[phase+'-L'+(level+1)]=aggregate(rows.filter(x=>x.fixture.level===level));
}
const severeWins=Object.fromEntries(sourcesToRun.map(arm=>[arm,severe.reduce((n,x)=>n+x.results[arm].win,0)]));
const report={status:'SOURCE-ONLY L4/L5 Barbarian design research; no live Ultimate, Guide, PWA or production changes',
 protocol:'3 same-current-core ability sources: current Blood Cleave, wider .135/.18 0.58/0.85 damage 8/14 tick stagger, and premium L5 .205 radius 1.00 attack damage 12-tick stagger (L4 same as wide). 20/40 original body count, L3->L4 and L4->L5, exploratory 8111/10103, unseen 13007/16001, both side mirrors; first unlock, same-tier mirror, family only doubled enemy, and WHOLE opposing army doubled. 32 fixture groups x4 choices x3 sources=384 actual terminal fights; eight severe 3-evolved vs15 x3 arms=24 additional actual terminal fights =>408 complete; 12 observed-vs-raw full physical-state RAF SHA pairs. Real post-armor, capped positive-HP SECONDARY hits (not potential targets), distinct damaging fronts and winner outcomes.',
 variants:{wide:{l4:{radius:.135,damage:.58,stunTicks:8},l5:{radius:.18,damage:.85,stunTicks:14}},premium:{l4:{radius:.135,damage:.58,stunTicks:8},l5:{radius:.205,damage:1,stunTicks:12}}},
 seeds,parity,summary,severeWins,cases,severe};
if(process.env.QA_BARBARIAN_SPIKE_RECEIPT)
 fs.writeFileSync(process.env.QA_BARBARIAN_SPIKE_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('BARBARIAN CLEAVE FIRST UNLOCK '+JSON.stringify({summary,severeWins}));
console.log('PASS: 408 authentic terminal Barbarian source-match variants, 12 original/instrumented whole-frame physical SHA pairs');
