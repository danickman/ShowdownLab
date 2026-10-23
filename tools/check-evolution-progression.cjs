const fs=require('fs'),vm=require('vm'),assert=require('assert');
const read=f=>fs.readFileSync('v3/'+f+'.js','utf8');
let now=0,next=1,queue=new Map(),errors=[];
const e={window:null,performance:{now:()=>now},requestAnimationFrame:f=>{const id=next++;queue.set(id,f);return id},cancelAnimationFrame:id=>queue.delete(id),CustomEvent:class{},dispatchEvent(){},console:{error:(...args)=>errors.push(args.join(' '))},Math};e.window=e;vm.createContext(e);
for(const f of ['evolution-rules','ultimate-abilities','legacy-sim-core','simulation-adapter'])vm.runInContext(read(f),e);
const E=e.ShowdownEvolution,A=e.ShowdownAdapter,types=Object.keys(A.BASE_COUNTS);
assert.equal(E.MAX_LEVEL,5);
assert.deepEqual([1,2,3,4,5].map(E.tier),['base','evolved','evolved','ultimate','ultimate']);
assert.deepEqual([1,2,3,4,5].map(E.accent),[false,false,true,false,true]);
for(const input of [-5,0,1,2,3,4,5,10,Infinity,NaN])assert(E.normalize(input)>=1&&E.normalize(input)<=5);
for(const type of types){
 const stats=[];
 for(let level=1;level<=5;level++){A.startMatch({blue:{[type]:1},red:{knight:1},blueLevels:{[type]:level},seed:99});const u=A.getState().units.find(u=>u.team==='blue');stats.push(u);
  assert.equal(u.level,level);if(level>1){const prev=stats[level-2];assert(Math.abs(u.hp/prev.hp-1.4)<1e-10);assert(Math.abs(u.dmg/prev.dmg-1.4)<1e-10);for(const key of ['spd','cd','range','armor','dodge'])assert.equal(u[key],prev[key])}}
 A.startMatch({blue:{[type]:1},red:{knight:1},blueLevels:{[type]:99},blueMastery:{[type]:5}});let s=A.getState(),u=s.units.find(u=>u.team==='blue');assert.equal(u.level,5);assert(Math.abs(u.hp/stats[4].hp-1.25)<1e-10);
 const before=JSON.stringify(s);assert.equal(A.applyDraft('blue',{kind:'up',type,amount:1}),false);assert.equal(JSON.stringify(A.getState()),before);
 // Upgrades are now legal ONLY between completed rounds; use real core fights,
 // never forge a phase or skip the one-pick-per-side draft invariant.
 A.startMatch({blue:{[type]:1},red:{[type]:1},blueLives:9,redLives:9,seed:99});
 A.setSpeed(10);
 const finishDuel=()=>{
  for(let f=0;f<12000&&A.getState().phase==='battle';f++){
   now+=16.667;const jobs=[...queue.values()];queue.clear();for(const callback of jobs)callback(now);
  }
  assert.equal(A.getState().phase,'round_over','real duel must finish before a draft choice');
 };
 for(let level=2;level<=5;level++){
  assert.equal(A.applyDraft('blue',{kind:'up',type,amount:99}),false,'no combat-time evolution');
  finishDuel();
  assert(A.applyDraft('blue',{kind:'up',type,amount:99}),'blue evolves once after completed round');
  assert(A.applyDraft('red',{kind:'up',type,amount:99}),'red bot independently evolves once');
  assert.equal(A.applyDraft('blue',{kind:'up',type}),false,'one pick per team in intermission');
  assert.equal(A.getState().levels.blue[type],level);assert.equal(A.getState().levels.red[type],level);
  assert.equal(A.getState().round,level-1);
  assert(A.nextRound(99+level),'advance after legal paired upgrades');
 }
 finishDuel();
 assert.equal(A.applyDraft('red',{kind:'up',type}),false,'level 5 red cannot ascend further');
 assert.equal(A.applyDraft('blue',{kind:'up',type}),false,'level 5 blue cannot ascend further');
}
for(let round=1;round<=100;round++){
 const state={round,blueLives:4,redLives:3,armies:{blue:{knight:6,sniper:2}},levels:{blue:{knight:5,sniper:5}}};
 assert(E.draftChoices(state,A.BASE_COUNTS).every(o=>o.kind!=='up'),'no capped evolution offers');
 state.levels.blue.sniper=4;const up=E.draftChoices(state,A.BASE_COUNTS).find(o=>o.kind==='up');assert.equal(up.type,'sniper');assert.equal(up.level,5);
}
// Exercise actual UI offer/bot functions without a browser.
const source=read('round-loop');let applied=[];
const ui={window:null,E,ShowdownUltimates:e.ShowdownUltimates,A:{BASE_COUNTS:A.BASE_COUNTS,applyDraft:(team,o)=>applied.push({team,...o})},N:{knight:'Knight',sniper:'Sniper'}};ui.window=ui;vm.createContext(ui);
vm.runInContext(source.slice(source.indexOf('function eligible'),source.indexOf('function offers'))+source.slice(source.indexOf('function offers'),source.indexOf('function rewardLock'))+source.slice(source.indexOf('function botDraft'),source.indexOf('function armyText')),ui);
vm.runInContext(source.slice(source.indexOf('function rewardMeta'),source.indexOf('function deltaText')),ui);
for(let round=1;round<=12;round++){
 const s={round,blueLives:4,redLives:4,armies:{blue:{knight:6},red:{knight:6}},levels:{blue:{knight:5},red:{knight:5}}};
 assert(ui.offers(s).every(o=>o.kind!=='up'));ui.botDraft(s);assert.notEqual(applied.at(-1).kind,'up');
 for(let level=1;level<5;level++){s.levels.blue.knight=level;const o=ui.offers(s).find(o=>o.kind==='up');assert(o.desc.includes('+40% HP and damage'));assert.equal(ui.rewardMeta(o).tag,['','', 'EVOLVE','TEMPER','ULTIMATE','ASCEND'][level+1])}
}
console.log('PASS: all ten fighters gain 40% HP/damage per level; role stats/Mastery preserved; API/input cap and actual player/bot offers stop at L5');
function run(seed){
 A.resetMatch();A.startMatch({blue:{knight:2,sniper:2,goose:2,assassin:1,dragon:1},red:{barbarian:2,goblin:2,mole:1,turtle:1,beetank:2},blueLevels:{knight:2,sniper:3,goose:4,assassin:5,dragon:1},redLevels:{barbarian:3,goblin:2,mole:5,turtle:4,beetank:1},blueLives:1,redLives:1,seed});A.setSpeed(10);
 let frames=0;while(A.getState().phase!=='match_over'&&frames++<20000){now+=16.667;const q=[...queue.values()];queue.clear();for(const f of q)f(now)}
 const s=A.getState();assert.equal(s.phase,'match_over');assert(s.winner);return{winner:s.winner,units:s.units.map(u=>[u.type,u.team,u.level,u.hp])};
}
for(let i=1;i<=12;i++)assert.deepEqual(run(i*997),run(i*997));
const off=A.subscribe(()=>{if(A.getState().phase==='battle')throw Error('intentional listener fault')});run(31337);off();assert(errors.some(x=>x.includes('intentional listener fault')));assert(queue.size>0);
console.log('PASS: 24 mixed L1–5 seeded matches terminal/deterministic; listener exception and RAF safeguards retained');
