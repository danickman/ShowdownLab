'use strict';
// Source-only first-L4/L5 power-spike A/B; candidate abilities are not in playable game.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const established=fs.readFileSync(path.join(__dirname,'check-first-ultimate-tier-spike.cjs'),'utf8');
const fixtureAnchor='const matched=[];';
assert.equal(established.split(fixtureAnchor).length,2,'accepted first-unlock harness boundary moved');
function once(s,a,b){assert.equal(s.split(a).length,2,'source drift: '+a.slice(0,100));return s.replace(a,b)}
let pre=established.slice(0,established.indexOf(fixtureAnchor));
const echoHonk=[
'function honk(u,units,tick){',
' const r=rank(u);if(!r)return [];',
' const enemies=units.filter(v=>v.team!==u.team&&v.hp>0&&v.burrow<=0)',
'  .sort((x,y)=>Math.hypot(x.x-u.x,x.y-u.y)-Math.hypot(y.x-u.x,y.y-u.y)||x.id-y.id);',
' const first=enemies.filter(v=>near(v,u,r===2?.27:.23)).slice(0,r===2?7:5);',
' const echo=enemies.filter(v=>!first.includes(v)&&first.some(t=>near(t,v,r===2?.17:.115)))',
'  .slice(0,r===2?5:3);',
' const hits=first.concat(echo).map((v,i)=>{v.stun=Math.max(v.stun,r===2?82:52);',
'  return{target:v,source:u,damage:u.dmg*(i>=first.length?(r===2?.75:.52):(r===2?.95:.68))}});',
" if(hits.length)cue(u,'thunder',tick,hits[0].target);return hits;",
'}'
].join('\n');
const originalUltimateSection="if(a.type==='barbarian'&&['axe_swing','rage_swing'].includes(a.action)){";
const amplifiedBarbarian=[
 originalUltimateSection,
'  const targets=enemies.filter(v=>near(v,t,r===2?.18:.135))',
'   .sort((x,y)=>Math.hypot(x.x-t.x,x.y-t.y)-Math.hypot(y.x-t.x,y.y-t.y)||x.id-y.id)',
'   .slice(0,r===2?5:3);',
'  for(const v of targets){v.stun=Math.max(v.stun,r===2?14:8);',
'   hits.push({target:v,source:a,damage:a.dmg*(r===2?.85:.58)})}',
"  if(targets.length)cue(a,'cleave',tick,t);",
'}'
].join('\n');
let inject=[
"const baseUltimate=ult;",
"const oldHonkStart=ult.indexOf('function honk(u,units,tick){');",
"const oldHonkEnd=ult.indexOf('function burn(u)',oldHonkStart);",
"assert(oldHonkStart>0&&oldHonkEnd>oldHonkStart,'Thunder Honk author source moved');",
"const loudHonk=ult.slice(0,oldHonkStart)+"+JSON.stringify(echoHonk)+"+'\\n'+ult.slice(oldHonkEnd);",
"const barbStart=ult.indexOf("+JSON.stringify(originalUltimateSection)+");",
"const barbEnd=ult.indexOf('return hits;',barbStart);",
"assert(barbStart>0&&barbEnd>barbStart,'Barbarian cleave author source moved');",
"const candidateBarbarian=ult.slice(0,barbStart)+"+JSON.stringify(amplifiedBarbarian)+"+'\\n'+ult.slice(barbEnd);",
"const powers={goose:loudHonk,barbarian:candidateBarbarian};"
].join('\n');
pre=once(pre,"const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];",inject+"\nconst choices=['hold','firstUnlock','matchedUnlock','foeDouble'];");
pre=once(pre,'vm.createContext(env);vm.runInContext(evo,env);vm.runInContext(ult,env);',
 "vm.createContext(env);vm.runInContext(evo,env);vm.runInContext(c.arm==='prototype'?powers[c.role]:ult,env);");
const {simulate,roles,prototype,build}=vm.runInNewContext(pre+'\n;({simulate,roles,prototype,build})',
 {require,__dirname,console,process},{filename:'source-only-first-unlock-special-ability-a-b.cjs'});
assert.equal(roles.length,10);
const scenarios=['hold','firstUnlock','matchedUnlock','foeDouble','overwhelmed'];
const samples=[],trainingSeeds=[1337,2017],unseenSeeds=[4051,6067];
for(const role of ['goose','barbarian'])for(const level of [3,4])
 for(const count of [20,40])for(const seed of trainingSeeds.concat(unseenSeeds))
 for(const side of ['blue','red']){
  const fixture={role,level,count,seed,side},scenariosToRun=seed===4051||seed===6067?scenarios.slice(1,4):scenarios.slice(0,4);
  const variants={};
  for(const situation of scenariosToRun){
   const f={...fixture},arms={};
   for(const arm of ['baseline','prototype']){
    const z=simulate({...f,arm},situation);
    assert(z.win===0||z.win===1,'genuinely finished full game');
    assert(z.selectedRealHp>=0&&z.genuinePersistentFronts>=0&&z.realSeparateHpWindows>=0);
    arms[arm]={winner:z.winner,win:z.win,selectedHp:z.selectedRealHp,allyHp:z.allyRealHp,
     independentFronts:z.genuinePersistentFronts,windows:z.realSeparateHpWindows};
   }
   variants[situation]=arms;
  }
  samples.push({fixture,variants});
 }
assert.equal(samples.length,64);
const counterCases=[];
for(const role of ['goose','barbarian'])for(const level of [3,4])
 for(const seed of [4051,6067])for(const side of ['blue','red']){
 const f={role,level,count:20,seed,side},baseline=simulate({...f,arm:'baseline'},'overwhelmed'),prototype=simulate({...f,arm:'prototype'},'overwhelmed');
 counterCases.push({fixture:f,baseline:{winner:baseline.winner,win:baseline.win},prototype:{winner:prototype.winner,win:prototype.win}});
}
assert.equal(counterCases.length,16);
let parity=0;
for(const role of ['goose','barbarian'])for(const level of [3,4])
 for(const arm of ['baseline','prototype']){
 const f={role,level,count:20,seed:4051,side:'blue',arm};
 assert.equal(simulate(f,'firstUnlock',true,true).digest,simulate(f,'firstUnlock',false,true).digest,
 'prototyped/raw observed physical RAF frame hashes must match '+JSON.stringify(f));parity++;
}
assert.equal(parity,8);
for(const role of ['knight','sniper','mole'])for(const level of [3,4]){
 const f={role,level,count:20,seed:4051,side:'blue'};
 const original=simulate({...f,arm:'baseline'},'firstUnlock',false,true).digest;
 const other=simulate({...f,arm:'prototype'},'firstUnlock',false,true).digest;
 // Other roles intentionally run original ultimate source, guarding scope.
 assert.equal(other,original,'non-target role unchanged in source-only prototype');
}
function group(rows){
 const sum={matched:rows.length};
 for(const choice of ['firstUnlock','matchedUnlock','foeDouble']){
  const subset=rows.filter(x=>x.variants[choice]);if(!subset.length)continue;
  const report={};
  for(const arm of ['baseline','prototype']){
   const a=subset.map(x=>x.variants[choice][arm]);const total=k=>+a.reduce((n,x)=>n+x[k],0).toFixed(2);
   report[arm]={wins:total('win'),selectedPhysicalHp:total('selectedHp'),allyPhysicalHp:total('allyHp'),
    genuinePersistentFronts:total('independentFronts'),separatedPositiveHpWindows:total('windows')};
  }
  report.newWins=subset.filter(x=>!x.variants[choice].baseline.win&&x.variants[choice].prototype.win).length;
  report.lostWins=subset.filter(x=>x.variants[choice].baseline.win&&!x.variants[choice].prototype.win).length;
  sum[choice]=report;
 }
 return sum;
}
const cohorts={};
for(const phase of ['training','unseen']){
 const rows=samples.filter(x=>phase==='training'?trainingSeeds.includes(x.fixture.seed):unseenSeeds.includes(x.fixture.seed));
 cohorts[phase+'-all']=group(rows);
 for(const role of ['goose','barbarian'])for(const level of [3,4])
 cohorts[phase+'-'+role+'-L'+(level+1)]=group(rows.filter(x=>x.fixture.role===role&&x.fixture.level===level));
}
const raw={status:'SOURCE-ONLY ROLE ULTIMATE A/B, no shipped ability or PWA edit',
 method:'2 roles Goose and Barbarian x 2 milestones L4/L5 x 20/40 total fighters x 4 seeds (1337,2017 training; 4051,6067 unseen) x both sides. In training compare hold, first-unlock, matched peer-unlock and doubled foe family; in unseen compare first unlock/peer counter/foe doubled. Two source arms original and role-specific broadened signature. Additional 16 genuine 3 evolved vs 15 lower-tier exceptions and 8 original/instrumented complete-RAF SHA pairs. No numeric guaranteed wins. Both designs bound targets by physical role and target count, deterministic distance/ID order.',
 prototypes:{goose:'Bounded single-hop Thunder Honk echo: nearest up to 5/7 within .23/.27 plus up to 3/5 extra foes near a first-ring victim; one-hop only; distinct stun/HP, tier-5 dramatic radius, no spread beyond the fixed total 8/12 victims',
 barbarian:'Bounded Blood Cleave sweep targeting up to three/five physical foes within .135/.18 of hit defender, with short stagger 8/14 ticks on cleaved secondaries, deterministic closest-first; no general global speed or damage change'},
 cohorts,counterCases,parity,samples};
if(process.env.QA_ULTIMATE_PROTOTYPE_RECEIPT)fs.writeFileSync(process.env.QA_ULTIMATE_PROTOTYPE_RECEIPT,JSON.stringify(raw,null,2)+'\n');
console.log('ULTIMATE SIGNATURE CANDIDATE '+JSON.stringify({cohorts,overwhelmed:{fights:counterCases.length,currentWins:counterCases.reduce((n,x)=>n+x.baseline.win,0),prototypeWins:counterCases.reduce((n,x)=>n+x.prototype.win,0)}}));
console.log('PASS: 416 real first-tier/peer/x2 source A/B match variants, 16 severe counter matches, 8 complete RAF observer pairs');
