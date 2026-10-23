'use strict';
// SOURCE ONLY: bound Goose cascade after accepted broad L5 caused damage-front compression.
// Compares original, accepted broad experiment, and smaller echo/falloff on genuine battles.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),original=fs.readFileSync(path.join(__dirname,'check-first-ultimate-tier-spike.cjs'),'utf8');
const once=(s,a,b)=>{assert.equal(s.split(a).length,2,'unique first-tier source anchor drift: '+a.slice(0,90));return s.replace(a,b)};
const boundary='const matched=[];';
assert.equal(original.split(boundary).length,2,'first-tier benchmark fixture boundary');
let pre=original.slice(0,original.indexOf(boundary));
const honkBroad=[
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
const honkTrim=[
'function honk(u,units,tick){',
' const r=rank(u);if(!r)return [];',
' const enemies=units.filter(v=>v.team!==u.team&&v.hp>0&&v.burrow<=0)',
'  .sort((x,y)=>Math.hypot(x.x-u.x,x.y-u.y)-Math.hypot(y.x-u.x,y.y-u.y)||x.id-y.id);',
' const first=enemies.filter(v=>near(v,u,r===2?.245:.215)).slice(0,r===2?6:5);',
' const echo=enemies.filter(v=>!first.includes(v)&&first.some(t=>near(t,v,r===2?.10:.08)))',
'  .slice(0,r===2?3:2);',
' const hits=[];',
' for(const v of first){v.stun=Math.max(v.stun,r===2?64:45);',
'  hits.push({target:v,source:u,damage:u.dmg*(r===2?.88:.62)})}',
' for(const v of echo){v.stun=Math.max(v.stun,r===2?18:12);',
'  hits.push({target:v,source:u,damage:u.dmg*(r===2?.52:.32)})}',
" if(hits.length)cue(u,'thunder',tick,hits[0].target);return hits;",
'}'
].join('\n');
const powered=[
"const honkStart=ult.indexOf('function honk(u,units,tick){');",
"const honkEnd=ult.indexOf('function burn(u)',honkStart);",
"assert(honkStart>=0&&honkEnd>honkStart,'authored source Goose honk moved');",
"const patchHonk=(fn)=>ult.slice(0,honkStart)+fn+'\\n'+ult.slice(honkEnd);",
"const powerSources={broad:patchHonk("+JSON.stringify(honkBroad)+"),trim:patchHonk("+JSON.stringify(honkTrim)+")};"
].join('\n');
pre=once(pre,"const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];",powered+"\nconst choices=['hold','firstUnlock','matchedUnlock','foeDouble'];");
pre=once(pre,'vm.createContext(env);vm.runInContext(evo,env);vm.runInContext(ult,env);',
 "vm.createContext(env);vm.runInContext(evo,env);vm.runInContext(powerSources[c.arm]||ult,env);");
pre=once(pre,' return army;\n}\nfunction simulate(',
 " if(!us&&choice==='foeArmyDouble')army.push(...army.map(e=>({...e,squad:e.squad+200})));\n return army;\n}\nfunction simulate(");
new Function('require','__dirname','console','process',pre+';return 1;');
const {simulate,roles}=vm.runInNewContext(pre+'\n;({simulate,roles})',{require,__dirname,console,process},{filename:'goose-echo-falloff-real-source-preamble.cjs'});
assert.equal(roles.length,10);
const sources=['baseline','broad','trim'],seeds=[1337,2017,8303,10111],newSeeds=new Set([8303,10111]);
const cases=[],situations=['firstUnlock','matchedUnlock','foeDouble','foeArmyDouble'];
for(const level of [3,4])for(const count of [20,40])
 for(const seed of seeds)for(const side of ['blue','red']){
  const fixture={role:'goose',level,count,seed,side},variants={};
  for(const scenario of situations){
   const arms={};
   for(const arm of sources){
    const z=simulate({...fixture,arm},scenario);
    assert([0,1].includes(z.win),'full-terminal winner only');
    assert(z.selectedRealHp>=0&&z.realSeparateHpWindows>=0&&z.genuinePersistentFronts>=0);
    const expected= count+(scenario==='foeDouble'?count/2/10*3:scenario==='foeArmyDouble'?count/2:0);
    assert.equal(z.units,expected,'full army x2 must be distinct from family doubling');
    arms[arm]={winner:z.winner,win:z.win,selectedRealHp:z.selectedRealHp,
     allyRealHp:z.allyRealHp,enemyRealHp:z.enemyRealHp,physicalFronts:z.genuinePersistentFronts,
     separatePhysicalHpWindows:z.realSeparateHpWindows,ticks:z.ticks,units:z.units};
   }
   variants[scenario]=arms;
  }
  cases.push({fixture,variants});
 }
assert.equal(cases.length,32);
const severe=[];
for(const level of [3,4])for(const seed of [8303,10111])
 for(const side of ['blue','red']){
  const fixture={role:'goose',level,count:20,seed,side},arms={};
  for(const arm of sources){
   const z=simulate({...fixture,arm},'overwhelmed');
   assert.equal(z.units,18,'three actual evolved Goose versus fifteen enemy physical fighters');
   arms[arm]={win:z.win,winner:z.winner,physicalFronts:z.genuinePersistentFronts};
  }
  severe.push({fixture,arms});
 }
assert.equal(severe.length,8);
let parityPairs=0;
for(const level of [3,4])for(const arm of sources)for(const count of [20,40]){
 const f={role:'goose',level,count,seed:10111,side:'blue',arm};
 assert.equal(simulate(f,'firstUnlock',true,true).digest,simulate(f,'firstUnlock',false,true).digest,
  'actual RAF physical-state checksum mismatch: '+JSON.stringify(f));
 parityPairs++;
}
assert.equal(parityPairs,12);
function summarize(rows){
 const s={matchedFixtures:rows.length};
 for(const situation of situations){
  const compare={};
  for(const arm of sources){
   const z=rows.map(x=>x.variants[situation][arm]);
   const total=k=>+z.reduce((n,v)=>n+v[k],0).toFixed(2);
   compare[arm]={wins:total('win'),selectedPhysicalHp:total('selectedRealHp'),
    allyPhysicalHp:total('allyRealHp'),enemyPhysicalHp:total('enemyRealHp'),
    persistentIndependentHpFronts:total('physicalFronts'),
    separateHpDamageWindows:total('separatePhysicalHpWindows'),
    totalTicks:total('ticks')};
  }
  for(const arm of ['broad','trim']){
   compare[arm].winsGained=rows.filter(x=>!x.variants[situation].baseline.win&&x.variants[situation][arm].win).length;
   compare[arm].winsLost=rows.filter(x=>x.variants[situation].baseline.win&&!x.variants[situation][arm].win).length;
  }
  s[situation]=compare;
 }
 return s;
}
const cohorts={};
for(const phase of ['training','heldout']){
 const rows=cases.filter(x=>phase==='heldout'?newSeeds.has(x.fixture.seed):!newSeeds.has(x.fixture.seed));
 cohorts[phase+'-all']=summarize(rows);
 for(const level of [3,4])for(const count of [20,40]){
  cohorts[phase+'-L'+(level+1)+'-'+count]=summarize(rows.filter(x=>x.fixture.level===level&&x.fixture.count===count));
 }
 for(const level of [3,4]){
  cohorts[phase+'-L'+(level+1)]=summarize(rows.filter(x=>x.fixture.level===level));
 }
}
const counterSummary={};
for(const level of [3,4]){
 const group=severe.filter(x=>x.fixture.level===level);
 counterSummary['L'+(level+1)]={groups:group.length,wins:Object.fromEntries(sources.map(arm=>[arm,group.reduce((n,x)=>n+x.arms[arm].win,0)]))};
}
const report={
 status:'SOURCE-ONLY Goose ability hypothesis; no game, PWA, Guide or production change',
 protocol:'One unchanged physical simulation core, three Goose Ultimate sources: currently shipped (baseline), previously tested wide identical-stun one-hop echo (broad), bounded inner-wave and weak quick-stagger echo (trim). 2 next tiers L4/L5 x 20/40 baseline body count x 4 seeds (2 prior and 2 fully new 8303/10111) x both side mirrors =32 matched fixtures. 4 actual draft scenarios: first unlock, peer unlock, 1-family doubled on the lower-tier opponent, FULL OPPOSING ARMY DOUBLED. Three sources each =384 truly completed source battle variants. Additional 8 severe fixture groups (3 evolved Goose versus 15 previous-tier fighters) x3 arms =24 more completed terminal fights, total 408. Twelve exact raw/source-observed per-RAF full physical state SHA parity pairs. All matches require genuine terminal winner and physical HP hit-front metric, no spatial/proximity fake fronts.',
 powers:{broad:{primaryRadius:[.23,.27],primaryCap:[5,7],echoRadius:[.115,.17],echoCap:[3,5],primaryAndEchoStunTicks:[52,82]},
 trim:{primaryRadius:[.215,.245],primaryCap:[5,6],echoRadius:[.08,.10],echoCap:[2,3],
  primaryStunTicks:[45,64],echoStunTicks:[12,18],primaryDamageScale:[.62,.88],echoDamageScale:[.32,.52]}},
 seeds,parityPairs,cohorts,counterSummary,cases,severe
};
if(process.env.QA_GOOSE_ECHO_RECEIPT)fs.writeFileSync(process.env.QA_GOOSE_ECHO_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('GOOSE FALL-OFF FIRST ULTIMATE '+JSON.stringify({cohorts,counterSummary}));
console.log('PASS: 408 real fully terminal Goose source comparisons, 12 raw-vs-observed full physical RAF SHA pairs');
