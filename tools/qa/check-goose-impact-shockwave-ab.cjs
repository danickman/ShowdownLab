'use strict';
// SOURCE ONLY: Goose echo damage with minimal secondary stun, validated on fresh seeds.
// Extends the earlier accepted first-tier/whole-army-x2 exact physical harness.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(path.join(__dirname,'check-goose-echo-falloff-ab.cjs'),'utf8');
const marker="const sources=['baseline','broad','trim'],seeds=";
assert.equal(src.split(marker).length,2,'accepted prior source-audit fixture section drift');
const once=(s,a,b)=>{assert.equal(s.split(a).length,2,'accepted impact observer splice drift');return s.replace(a,b)};
const honkImpact=[
'function honk(u,units,tick){',
' const r=rank(u);if(!r)return [];',
' const enemies=units.filter(v=>v.team!==u.team&&v.hp>0&&v.burrow<=0)',
'  .sort((x,y)=>Math.hypot(x.x-u.x,x.y-u.y)-Math.hypot(y.x-u.x,y.y-u.y)||x.id-y.id);',
' const first=enemies.filter(v=>near(v,u,r===2?.255:.23)).slice(0,r===2?6:5);',
' const echo=enemies.filter(v=>!first.includes(v)&&first.some(t=>near(t,v,r===2?.16:.11)))',
'  .slice(0,r===2?4:3);',
' const hits=[];',
' for(const v of first){v.stun=Math.max(v.stun,r===2?64:44);',
'  hits.push({target:v,source:u,damage:u.dmg*(r===2?1.10:.75)})}',
' for(const v of echo){v.stun=Math.max(v.stun,4);',
'  hits.push({target:v,source:u,damage:u.dmg*(r===2?.83:.60)})}',
" if(hits.length)cue(u,'thunder',tick,hits[0].target);return hits;",
'}'
].join('\n');
const insert="pre=once(pre,"+JSON.stringify("const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];")+","+
 JSON.stringify("powerSources.impact=patchHonk("+JSON.stringify(honkImpact)+");\nconst choices=['hold','firstUnlock','matchedUnlock','foeDouble'];")+
 ");\n";
const injectable="new Function('require','__dirname','console','process',pre+';return 1;');";
let pre=src.slice(0,src.indexOf(marker));
pre=once(pre,injectable,insert+injectable);
new Function('require','__dirname','console','process',pre+';return 1;');
const {simulate,roles}=vm.runInNewContext(pre+'\n;({simulate,roles})',{require,__dirname,console,process},
 {filename:'goose-short-stun-impact-physical-source.cjs'});
assert.equal(roles.length,10);
const armList=['baseline','broad','trim','impact'],choiceList=['firstUnlock','matchedUnlock','foeDouble','foeArmyDouble'];
const known=[8303],newSeeds=[15013,19031],seeds=known.concat(newSeeds);
const fixtureRows=[];
for(const level of [3,4])for(const count of [20,40])for(const seed of seeds)
 for(const side of ['blue','red']){
 const f={role:'goose',level,count,seed,side},variants={};
 for(const choice of choiceList){
  const arms={};
  for(const arm of armList){
   const v=simulate({...f,arm},choice);
   assert([0,1].includes(v.win)&&v.selectedRealHp>=0&&v.realSeparateHpWindows>=0,'real completed fight');
   assert.equal(v.units,count+(choice==='foeDouble'?count/2/10*3:choice==='foeArmyDouble'?count/2:0),
    'full whole-army doubling must not be confused with x2 one family');
   arms[arm]={win:v.win,winner:v.winner,selectedHp:v.selectedRealHp,
    enemyHp:v.enemyRealHp,allyHp:v.allyRealHp,
    fronts:v.genuinePersistentFronts,separatedWindows:v.realSeparateHpWindows,
    ticks:v.ticks,units:v.units};
  }
  variants[choice]=arms;
 }
 fixtureRows.push({fixture:f,variants});
}
assert.equal(fixtureRows.length,24);
const severe=[];
for(const level of [3,4])for(const seed of newSeeds)for(const side of ['blue','red']){
 const f={role:'goose',level,count:20,seed,side},variants={};
 for(const arm of armList){
  const v=simulate({...f,arm},'overwhelmed');
  assert.equal(v.units,18);
  variants[arm]={win:v.win,winner:v.winner,fronts:v.genuinePersistentFronts};
 }
 severe.push({fixture:f,variants});
}
assert.equal(severe.length,8);
let parityPairs=0;
for(const level of [3,4])for(const arm of armList)for(const count of [20,40]){
 const f={role:'goose',level,count,seed:19031,side:'red',arm};
 assert.equal(simulate(f,'firstUnlock',true,true).digest,simulate(f,'firstUnlock',false,true).digest,
  'physical full-RAF SHA differs from observer on unchanged source arm '+JSON.stringify(f));
 parityPairs++;
}
assert.equal(parityPairs,16);
function summarize(rows){
 const out={matchedFixtures:rows.length};
 for(const choice of choiceList){
  const item={};
  for(const arm of armList){
   const arr=rows.map(x=>x.variants[choice][arm]);
   const sum=k=>+arr.reduce((a,v)=>a+v[k],0).toFixed(2);
   item[arm]={wins:sum('win'),selectedRealHp:sum('selectedHp'),
    realPersistentFronts:sum('fronts'),separatedPositiveHpWindows:sum('separatedWindows'),
    alliedPhysicalHp:sum('allyHp'),enemyPhysicalHp:sum('enemyHp')};
  }
  for(const arm of armList.slice(1)){
   item[arm].gainsVsOriginal=rows.filter(x=>!x.variants[choice].baseline.win&&x.variants[choice][arm].win).length;
   item[arm].lossesVsOriginal=rows.filter(x=>x.variants[choice].baseline.win&&!x.variants[choice][arm].win).length;
  }
  out[choice]=item;
 }
 return out;
}
const stats={};
for(const cohort of ['calibration','unseen']){
 const rows=fixtureRows.filter(x=>cohort==='calibration'?known.includes(x.fixture.seed):newSeeds.includes(x.fixture.seed));
 for(const level of [3,4])stats[cohort+'-L'+(level+1)]=summarize(rows.filter(x=>x.fixture.level===level));
 stats[cohort+'-all']=summarize(rows);
}
const severeWins=Object.fromEntries(armList.map(arm=>[arm,severe.reduce((n,x)=>n+x.variants[arm].win,0)]));
const report={
 status:'SOURCE-ONLY - do not ship ability before role regression/PWA pins/performance and iPhone 14 Pro Max Safari gates',
 purpose:'Test whether high-damage Goose one-hop shockwave with only 4-tick secondary stagger retains first-L5 wins and physical independent fronts relative to over-broad mass stun.',
 protocol:'Two L4/L5 milestone tiers × 20/40 initial bodies × one previously seen calibration seed 8303 and two fresh holdout seeds 15013/19031 × blue/red side mirrors × four actual counter conditions (first tier, opponent same tier, opponent nominated-family doubled, FULL opposing army doubled) × four source arms (current, broad, trim, impact) =384 genuine terminal source fights. Eight genuine 3-evolved-vs-15 severe fixtures × four source arms =32 further terminal fights, 416 total. 16 per-RAF exact SHA raw versus read-only observed physical state. All fights must terminate and maintain actual positive-HP damaging-front witnesses.',
 impact:{firstRingRadius:{L4:.23,L5:.255},firstRingMax:{L4:5,L5:6},firstRingStunTicks:{L4:44,L5:64},
  firstRingDamageScale:{L4:.75,L5:1.10},echoRadius:{L4:.11,L5:.16},echoMax:{L4:3,L5:4},
  echoStunTicks:4,echoDamageScale:{L4:.60,L5:.83},oneHop:true},
 arms:armList,seeds,newSeeds,parityPairs,cohorts:stats,severeWins,matched:fixtureRows,severe
};
if(process.env.QA_GOOSE_IMPACT_RECEIPT)fs.writeFileSync(process.env.QA_GOOSE_IMPACT_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('GOOSE DAMAGE-LED ECHO '+JSON.stringify({cohorts:stats,severeWins}));
console.log('PASS: 416 real complete source battle variants, 16 exact raw-vs-observed per-RAF state parity pairs');
