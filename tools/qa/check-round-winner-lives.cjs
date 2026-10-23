'use strict';
// Contract test for the adapter's round winner, losing-life accounting and match result.
// This uses scripted terminal core snapshots to cover BOTH colors without depending
// on damage RNG. Real 300-duel and Ultimate combat suites run separately.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../../v3/simulation-adapter.js'),'utf8');
const events=[];
let onState=null;
const core={
  configure(cfg){onState=cfg.onState},
  setSpeed(){},
  setRunning(){},
  deploy(){},
  finish(winner){
    assert(['blue','red'].includes(winner));
    assert.equal(typeof onState,'function','battle callback configured');
    onState({winner,running:false,units:[
      {id:1,team:'blue',type:'knight',x:.4,y:.5,hp:winner==='blue'?10:0,maxHp:10},
      {id:2,team:'red',type:'goose',x:.6,y:.5,hp:winner==='red'?10:0,maxHp:10}
    ]});
  }
};
const env={window:null,LegacySimCore:core,ShowdownEvolution:{normalize:n=>Math.min(5,Math.max(1,+n||1))},
  CustomEvent:class{constructor(name,args){this.name=name;this.detail=args?.detail}},dispatchEvent:e=>events.push(e)};
env.window=env;vm.createContext(env);vm.runInContext(source,env,{filename:'simulation-adapter.js'});
const A=env.ShowdownAdapter;
function scriptedMatch(winners){
  A.resetMatch();
  A.startMatch({blue:{knight:1},red:{goose:1},blueLives:2,redLives:2,seed:31415});
  let blue=2,red=2;
  winners.forEach((winner,i)=>{
    assert.equal(A.getState().phase,'battle','round '+(i+1)+' must start');
    core.finish(winner);
    if(winner==='blue')red--;else blue--;
    const s=A.getState(),ended=blue===0||red===0;
    assert.equal(s.blueLives,blue,'blue losing-life count at round '+(i+1));
    assert.equal(s.redLives,red,'red losing-life count at round '+(i+1));
    assert.equal(s.roundWinner,winner,'visible round winner at round '+(i+1));
    assert.equal(s.winner,ended?winner:null,'match winner at round '+(i+1));
    assert.equal(s.phase,ended?'match_over':'round_over');
    assert.equal(s.playing,false);
    if(!ended)assert(A.nextRound(31415+i),'next round must be legal');
  });
  assert.equal(A.getState().phase,'match_over');
  return{winners,blueLives:blue,redLives:red,winner:A.getState().winner};
}
// Mirrored outcomes must lose the OPPOSITE color's life. Include a comeback.
const reports=[scriptedMatch(['blue','red','blue']),scriptedMatch(['red','blue','red'])];
for(const winner of ['blue','red']){
  A.resetMatch();A.startMatch({blue:{knight:1},red:{goose:1},blueLives:1,redLives:1});
  core.finish(winner);
  const s=A.getState();
  assert.equal(s.winner,winner);
  assert.equal(s.blueLives,winner==='red'?0:1);
  assert.equal(s.redLives,winner==='blue'?0:1);
}
// Terminal callback for an exited match must not deduct additional lives.
A.stopBattle();const stopped=A.getState();core.finish('red');
assert.equal(A.getState().blueLives,stopped.blueLives);
assert.equal(A.getState().redLives,stopped.redLives);
assert(events.length>0,'adapter publishes state transitions');
console.log('ROUND WINNER AND LIVES '+JSON.stringify(reports));
console.log('PASS: mirrored win/loss, comeback, match terminal state, stale callback suppression');
