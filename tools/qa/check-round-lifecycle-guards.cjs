'use strict';
// Turn 8: exact running adapter against deterministic scripted terminal core.
// Checks real adapter module, phase-gated atomic one-choice draft, stale callbacks.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..');
const read=n=>fs.readFileSync(path.join(root,'v3',n+'.js'),'utf8');
const callbacks=[],deploys=[],errors=[],events=[];
const core={
 configure(config){assert.equal(typeof config.onState,'function');callbacks.push(config.onState)},
 setRunning(){},setSpeed(){},deploy(blue,red){deploys.push({blue,red})},pause(){return false},
};
const env={window:null,LegacySimCore:core,console:{error:(...a)=>errors.push(a.join(' '))},
 CustomEvent:class{constructor(type,params){this.type=type;this.detail=params?.detail}},
 dispatchEvent:e=>events.push(e)};
env.window=env;vm.createContext(env);
for(const f of ['evolution-rules','simulation-adapter'])vm.runInContext(read(f),env,{filename:f+'.js'});
const A=env.ShowdownAdapter,E=env.ShowdownEvolution;
function terminal(winner,index=callbacks.length-1){
 assert(['blue','red'].includes(winner));
 callbacks[index]({winner,running:false,units:[
 {id:1,team:'blue',type:'knight',x:.28,y:.5,hp:winner==='blue'?12:0,maxHp:50},
 {id:2,team:'red',type:'goose',x:.72,y:.5,hp:winner==='red'?12:0,maxHp:50}
 ]});
}
const state=()=>A.getState(),freeze=()=>JSON.stringify(state());
function deniedOutside(label){
 const before=freeze();
 for(const kind of ['add','up','mult','disrupt']){
  const value=kind==='add'?{kind,type:'goblin',amount:6}:
   kind==='up'?{kind,type:'knight'}:kind==='mult'?{kind,type:'knight',mult:2}:
    {kind,type:'goose',effect:'thin',amount:1};
  for(const side of ['blue','red'])
   assert.equal(A.applyDraft(side,value),false,label+': '+side+'/'+kind+' must be forbidden');
 }
 assert.equal(freeze(),before,label+' phase cannot mutate stored levels, armies or queued disruptions');
}
deniedOutside('idle');
A.startMatch({blue:{knight:6},red:{goose:8},blueLevels:{knight:4},redLevels:{goose:4},
 blueLives:3,redLives:3,seed:91});
assert.equal(state().phase,'battle');assert.equal(state().round,1);
assert.equal(callbacks.length,1);const firstId=state().battleId;
deniedOutside('active combat');
terminal('blue',0);
let s=state();
assert.equal(s.phase,'round_over');assert.equal(s.blueLives,3);assert.equal(s.redLives,2);
const finished=freeze();terminal('blue',0);terminal('red',0);
assert.equal(freeze(),finished,'duplicate/opposite terminal reports cannot leak lives twice');
assert.equal(A.applyDraft('blue',{kind:'add',type:'goblin',amount:6}),true);
assert.equal(state().armies.blue.goblin,6);
const afterBlue=freeze();
for(const kind of ['add','up','mult','disrupt'])
 assert.equal(A.applyDraft('blue',{kind,type:'knight',amount:9,mult:2,effect:'jam'}),false,'exactly one blue pick per round');
assert.equal(freeze(),afterBlue);
assert.equal(A.applyDraft('red',{kind:'up',type:'goose'}),true,'bot may independently use its one pick');
assert.equal(state().levels.red.goose,5);
assert.equal(A.applyDraft('red',{kind:'up',type:'goose'}),false,'bot second pick rejected');
const round1Result=freeze();assert(A.nextRound(92));
s=state();assert.equal(s.round,2);assert.equal(s.phase,'battle');assert(s.battleId>firstId);
assert.equal(s.levels.red.goose,5);assert.equal(s.armies.blue.goblin,6);
callbacks[0]({winner:'red',units:[],running:false});
assert.equal(state().phase,'battle');assert.equal(state().round,2);
assert.equal(state().blueLives,3,'late callback cannot deduct a life');
deniedOutside('round 2 combat');
terminal('red',1);s=state();assert.equal(s.phase,'round_over');assert.equal(s.blueLives,2);
const offer=E.disruptionOffer(s,'blue');assert(offer?.kind==='disrupt');
assert.equal(A.applyDraft('blue',{...offer,amount:offer.amount+1}),false,'invalid sabotage does not consume pick');
assert.equal(A.applyDraft('blue',offer),true);
assert.equal(A.applyDraft('blue',{kind:'add',type:'knight',amount:3}),false,'no second choice after disruption');
assert.equal(state().nextDisruption.red.effect,offer.effect);
const enemyRosterBefore=state().armies.red.goose;
assert.equal(enemyRosterBefore,8,'disruption cannot mutate permanent army before round');
assert(A.nextRound(93));
s=state();assert.equal(s.phase,'battle');assert.equal(s.round,3);
assert.equal(s.nextDisruption.red,null,'queued disruption consumed once');
assert.equal(s.activeDisruption.red.effect,offer.effect);
const thirdDeploy=deploys.at(-1).red.filter(u=>u.type==='goose');
assert.equal(thirdDeploy.length,offer.effect==='thin'?8-offer.amount:8);
if(offer.effect==='jam')assert(thirdDeploy.every(u=>u.level===4));
assert.equal(s.armies.red.goose,8);assert.equal(s.levels.red.goose,5);
terminal('blue',2);s=state();
assert.equal(s.phase,'round_over');assert.equal(s.activeDisruption.red,null,'disruption expires at terminal');
assert(A.nextRound(94));s=state();
assert.equal(s.activeDisruption.red,null);assert.equal(s.nextDisruption.red,null);
assert.equal(deploys.at(-1).red.filter(u=>u.type==='goose').length,8,'later roster restored');
const beforeStop=freeze();A.stopBattle();
assert.equal(state().phase,'idle');deniedOutside('after stop');
callbacks.at(-1)({winner:'red',running:false,units:[]});
assert.equal(state().phase,'idle','old callback ignored after stop');
A.resetMatch();assert.equal(state().round,1);assert.equal(state().phase,'idle');
assert.deepEqual(Object.keys(state().armies.blue),[],'reset clears roster');
const callbacksBefore=callbacks.length,oldCallback=callbacks.at(-1);
A.startMatch({blue:{knight:2},red:{goose:2},blueLives:1,redLives:1,seed:96});
assert.equal(callbacks.length,callbacksBefore+1);
const newId=state().battleId;
assert(newId>firstId,'battle identity remains monotonically increasing across reset');
const justStarted=freeze();oldCallback({winner:'red',running:false,units:[]});
assert.equal(freeze(),justStarted,'old-round response not accepted in a freshly restarted match');
terminal('red');s=state();assert.equal(s.phase,'match_over');assert.equal(s.blueLives,0);
assert.equal(A.applyDraft('blue',{kind:'add',type:'knight',amount:9}),false,'cannot draft after match terminal');
assert.equal(A.nextRound(97),false,'cannot enter round after match terminal');
terminal('blue');assert.equal(state().blueLives,0,'terminal still idempotent');
assert.deepEqual(errors,[]);
assert(events.length>=8,'real lifecycle events published');
console.log('ROUND LIFECYCLE INTEGRITY '+JSON.stringify({
 initialBattleId:firstId,restartedBattleId:newId,roundsCompleted:3,extraStaleCallbacksRejected:true,
 onePickPerTeamPerRound:true,disruptionNextRoundOnly:true,resetAndStopSafe:true,matchTerminalIdempotent:true,
 persistedEnemyCount:enemyRosterBefore,syntheticOnly:'scripted snapshots through real adapter; real 300 core CI separately'}));
console.log('PASS: no midbattle picks, duplicate draft, double life, stale old match, permanent jam/thin, or postterminal state');
