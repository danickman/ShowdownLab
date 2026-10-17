'use strict';
// Live-ecosystem Assassin L4->L5 actual draft choice ROI; source-only; no game/PWA changes.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const baseline=fs.readFileSync(path.join(__dirname,'check-draft-evolution-choice-value.cjs'),'utf8');
const stop='const fixtures=[];';
assert.equal(baseline.split(stop).length,2,'original real-HP draft-choice observer source moved');
const one=(s,a,b)=>{
 assert.equal(s.split(a).length,2,'unique live Assassin ROI anchor drift: '+a.slice(0,85));
 return s.replace(a,b);
};
let pre=baseline.slice(0,baseline.indexOf(stop));
pre=one(pre,"ability=read('tools/qa/fixtures/goose-before-impact-ultimate.js')","ability=read('v3/ultimate-abilities.js')");
pre=one(pre,"const g=read('tools/qa/check-role-fronts-baseline.cjs')",
 "const watchedExecutionAbility=replace(watchedAbility,\"cue(a,'execution',tick,t);return damage\",\"window.__qaExec({attacker:a.id,target:t.id,tick,rank:r});cue(a,'execution',tick,t);return damage\");\nconst g=read('tools/qa/check-role-fronts-baseline.cjs')");
pre=one(pre,'errors=[],hits=[],reflect=[],guards=[],pending=null;','errors=[],hits=[],reflect=[],guards=[],execution=[],pending=null;');
pre=one(pre,'env.__qaHit=x=>hits.push(x);','env.__qaHit=x=>hits.push(x);\n env.__qaExec=x=>execution.push(x);');
pre=one(pre,'vm.runInContext(observed?watchedAbility:ability,env);','vm.runInContext(observed?watchedExecutionAbility:ability,env);');
pre=one(pre,'nominatedCount:chosen.size,beetankCount:bee.size,',
 'nominatedCount:chosen.size,beetankCount:bee.size,\n   executionTriggers:execution.filter(e=>chosen.has(e.attacker)).length,');
new Function('require','__dirname','console','process',pre+'\nreturn true;');
const {simulate,choices}=vm.runInNewContext(pre+'\n;({simulate,choices})',
 {require,__dirname,console,process},{filename:'live-assassin-draft-roi-source.cjs'});
assert.equal(choices.join(','),'hold,evolve,recruit2,evolveBeetank');
const ability=fs.readFileSync(path.join(__dirname,'../../v3/ultimate-abilities.js'),'utf8');
assert(ability.includes('t.hp/t.maxHp<(r===2?.75:.4)'),'current Assassin L5 75% HP Execution gate moved');
assert(ability.includes('r===2?.205:.135'),'current premium Barbarian not loaded');
assert(ability.includes('r===2?.83:.60'),'current Goose Impact not loaded');
const seeds=[1337,2017,33071,40151],holdout=new Set(seeds.slice(2));
const fixtures=[];
for(const mode of ['swarm','backline','armored'])
 for(const count of [20,40])
  for(const seed of seeds)
   for(const side of ['blue','red'])
    fixtures.push({role:'assassin',level:4,mode,count,seed,side});
assert.equal(fixtures.length,48,'3 roles of opposition x2 populations x4 seeds x2 side mirrors');
let parity=0;
for(const f of fixtures.filter((_,i)=>i%12===0))for(const choice of choices){
 const c={...f,choice};
 const raw=simulate(c,false,true),observed=simulate(c,true,true);
 assert.equal(observed.digest,raw.digest,'read-only entire RAF physics parity broken '+JSON.stringify(c));
 parity++;
}
assert.equal(parity,16,'sixteen full-RAF exact physical parity comparisons');
const cases=[];
for(const f of fixtures){
 const variant={};
 for(const choice of choices){
  const z=simulate({...f,choice});
  assert.equal(typeof z.win,'number','expected terminal side win');
  assert(z.nominatedDirectHp>=0&&Number.isFinite(z.nominatedDirectHp),'no fake attack damage');
  assert(z.realPersistentFronts>=0&&z.realSeparatedDamageWindows>=0);
  assert.equal(z.nominatedCount,f.count/2/10*3+(choice==='recruit2'?2:0));
  assert(z.enemyHpRemoved>=z.nominatedDirectHp-1e-5,'physical attacker damage exceeds side damage');
  variant[choice]=z;
 }
 cases.push({fixture:f,variant});
}
assert.equal(cases.length*choices.length,192,'192 genuine terminal matched live-source choices');
const metrics=['win','nominatedDirectHp','executionTriggers','beetankDirectHp','enemyHpRemoved',
 'allyHpLost','realPersistentFronts','realSeparatedDamageWindows'];
function summarize(rows){
 const out={fixtures:rows.length};
 for(const choice of choices){
  const list=rows.map(c=>c.variant[choice]),total=k=>+list.reduce((s,z)=>s+z[k],0).toFixed(2);
  out[choice]=Object.fromEntries(metrics.map(k=>[k,total(k)]));
  out[choice].gainsVsHold=rows.filter(c=>c.variant[choice].win>c.variant.hold.win).length;
  out[choice].lossesVsHold=rows.filter(c=>c.variant[choice].win<c.variant.hold.win).length;
 }
 out.roiVsRecruits=out.evolve.win-out.recruit2.win;
 out.roiVsBeetank=out.evolve.win-out.evolveBeetank.win;
 return out;
}
const summary={};
for(const cohort of ['historicalSeedsLive','newHeldOutLive']){
 const rows=cases.filter(x=>holdout.has(x.fixture.seed)===(cohort==='newHeldOutLive'));
 summary[cohort+'-all']=summarize(rows);
 for(const mode of ['swarm','backline','armored'])
  summary[cohort+'-'+mode]=summarize(rows.filter(x=>x.fixture.mode===mode));
 for(const count of [20,40])
  summary[cohort+'-'+count]=summarize(rows.filter(x=>x.fixture.count===count));
}
const report={
 status:'Live-current Assassin L4->L5 controlled draft ROI RESEARCH ONLY. Gameplay, PWA, main, production unchanged.',
 method:'3 enemy types swarm/backline/armored x20/40 bodies x4 seeds x2 mirrored sides =48 matched fixtures; four actual choices hold/evolve entire 3 or 6 Assassin family to L5/recruit two additional L4 Assassins/evolve existing 1 or 2 Beetanks to L5 =192 completed live source terminal matches. 16 exact instrumentation/raw per-RAF state SHA controls. Earlier known seeds 1337/2017 are diagnostic, untouched distinct 33071/40151 held out. Physical positive-HP hit and Execution activation by nominated actual physical ID, independent geographically separated HP damage, terminal winner, team losses. Current LIVE Goose Impact and premium Barbarian Cleave loaded (never old frozen original). One drafted choice is not universally offered as the same quantity.',
 seeds,parity,summary,cases
};
if(process.env.QA_ASSASSIN_L5_ROI_RECEIPT)fs.writeFileSync(process.env.QA_ASSASSIN_L5_ROI_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('ASSASSIN L5 LIVE ROI '+JSON.stringify(summary));
console.log('PASS: 192 live-ecosystem complete terminal Assassin L5 ROI choices; 16 exact whole-RAF physical parity pairs');
