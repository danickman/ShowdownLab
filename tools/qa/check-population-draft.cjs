'use strict';
// QA: cap offer eligibility, preserve sandbox extremes, expire sabotage after ONE battle.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const read=n=>fs.readFileSync(path.join(__dirname,'../../v3',n+'.js'),'utf8');
let now=0,next=0,queue=new Map(),errors=[];
const env={window:null,Math,performance:{now:()=>now},requestAnimationFrame(fn){const id=++next;queue.set(id,fn);return id},cancelAnimationFrame(id){queue.delete(id)},console:{error:(...a)=>errors.push(a.join(' '))},CustomEvent:class{},dispatchEvent(){}};
env.window=env;vm.createContext(env);
for(const name of ['evolution-rules','ultimate-abilities','legacy-sim-core','simulation-adapter'])vm.runInContext(read(name),env);
const E=env.ShowdownEvolution,A=env.ShowdownAdapter;
const sample=(blue,red,round=2,blueLives=3,redLives=4,levels={blue:{},red:{}})=>({round,blueLives,redLives,armies:{blue,red},levels});
for(const total of [100,119,120,180,300]){
 const blue={goblin:20},red={knight:total-20};
 const s=sample(blue,red,2,3,4,{blue:{goblin:1},red:{knight:4}});
 const offered=E.draftChoices(s,A.BASE_COUNTS);
 assert.equal(offered.length,3);
 assert(offered.every(o=>o.kind!=='mult'),'must not offer ×2 at projected population '+total);
 assert(offered.some(o=>o.kind==='disrupt'||o.kind==='up'));
}
const can=sample({goblin:10},{knight:40},2,3,4,{blue:{goblin:1},red:{knight:2}});
assert(E.canMultiply(can,'blue','goblin',2));
assert(!E.canMultiply(sample({goblin:80},{knight:40}),'blue','goblin',2));
assert(!E.canMultiply(sample({goblin:12},{knight:100}),'blue','goblin',2));
assert(E.draftChoices(can,A.BASE_COUNTS).some(o=>o.kind==='mult'));
function progressToRoundOver(){
 for(let i=0;i<12000&&A.getState().phase==='battle';i++){
  now+=16.667;const jobs=[...queue.values()];queue.clear();for(const fn of jobs)fn(now);
 }
 assert.equal(A.getState().phase,'round_over','test match must finish');
}
function testDisruption(input,levels,expected){
 A.resetMatch();
 A.startMatch({blue:{knight:8,sniper:3},red:input,blueLevels:{knight:4,sniper:4},redLevels:levels,seed:1337,blueLives:4,redLives:4});
 A.setSpeed(10);progressToRoundOver();
 const before=A.getState(),offer=E.disruptionOffer(before,'blue');
 assert(offer&&offer.kind==='disrupt');assert.equal(offer.effect,expected);
 assert.equal(A.applyDraft('blue',{...offer,amount:offer.amount+1}),false,'cannot forge sabotage magnitude');
 assert(A.applyDraft('blue',offer));
 let s=A.getState();
 assert.equal(s.nextDisruption.red.type,offer.type);
 assert.deepEqual(s.armies.red,before.armies.red,'persistent opponent roster must not change on pick');
 assert.deepEqual(s.levels.red,before.levels.red,'permanent enemy evolutions must not change on pick');
 assert(A.nextRound(2525));s=A.getState();
 assert.equal(s.phase,'battle');assert.equal(s.nextDisruption.red,null);
 assert.equal(s.activeDisruption.red.effect,expected);
 const effected=s.units.filter(u=>u.team==='red'&&u.type===offer.type);
 const permanentCount=s.armies.red[offer.type],permanentLevel=s.levels.red[offer.type];
 assert.equal(effected.length,expected==='thin'?permanentCount-offer.amount:permanentCount);
 for(const u of effected)assert.equal(u.level,expected==='jam'?Math.max(1,permanentLevel-1):permanentLevel);
 assert.equal(s.levels.red[offer.type],permanentLevel,'enemy retains permanent evolution');
 assert.equal(s.armies.red[offer.type],permanentCount,'enemy retains permanent roster');
 progressToRoundOver();s=A.getState();assert.equal(s.activeDisruption.red,null,'effect expires when fight ends');
 assert(A.nextRound(3636));s=A.getState();
 assert.equal(s.nextDisruption.red,null);
 assert.equal(s.activeDisruption.red,null);
 assert.equal(s.units.filter(u=>u.team==='red'&&u.type===offer.type).length,permanentCount);
 assert(s.units.filter(u=>u.team==='red'&&u.type===offer.type).every(u=>u.level===permanentLevel));
 return{offer,permanentCount,permanentLevel};
}
const jam=testDisruption({dragon:3,knight:6},{dragon:4,knight:2},'jam');
const thin=testDisruption({goblin:18,barbarian:4},{goblin:1,barbarian:1},'thin');
assert.deepEqual(errors,[]);
console.log('DRAFT POPULATION POLICY '+JSON.stringify({limit:E.MULTIPLY_POPULATION_LIMIT,jam,thin}));
console.log('PASS: 120 total projected ×2 filter, valid sabotage, one-round expiry, permanent army/evolution restoration');
