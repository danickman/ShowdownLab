'use strict';
// True deterministic mutual Turtle L4 elimination plus full adapter 2-life draw,
// blue/red terminal and stale-callback guards remain in separate CI suites.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../..'),read=x=>fs.readFileSync(path.join(root,'v3',x+'.js'),'utf8');
const receipts=[],errors=[];
function simulate(lives,seed){
 let now=0,next=0,queue=new Map(),terminalEvents=0,states=[];
 const env={window:null,Math,performance:{now:()=>now},
 requestAnimationFrame(fn){const id=++next;queue.set(id,fn);return id},
 cancelAnimationFrame(id){queue.delete(id)},
 CustomEvent:class{constructor(type,args){this.type=type;this.detail=args?.detail}},
 dispatchEvent(){},console:{error:(...args)=>errors.push(args.join(' '))}};
 env.window=env;vm.createContext(env);
 for(const n of ['evolution-rules','ultimate-abilities','legacy-sim-core','simulation-adapter'])vm.runInContext(read(n),env,{filename:n+'.js'});
 const adapter=env.ShowdownAdapter,core=env.LegacySimCore;
 const off=adapter.subscribe(s=>{if(s.phase==='round_over'||s.phase==='match_over'){terminalEvents++;states.push({phase:s.phase,round:s.round,roundWinner:s.roundWinner,winner:s.winner,blueLives:s.blueLives,redLives:s.redLives,battleId:s.battleId})}});
 adapter.startMatch({blue:{turtle:1},red:{turtle:1},blueLevels:{turtle:4},redLevels:{turtle:4},
 blueLives:lives,redLives:lives,seed});adapter.setSpeed(10);
 let frames=0;for(;frames<1500&&adapter.getState().phase==='battle';frames++){
  now+=16.667;const jobs=[...queue.values()];queue.clear();for(const fn of jobs)fn(now);
 }
 const s=adapter.getState(),snapshot=core.getState();
 assert(frames<1500,'real source must not softlock in simultaneous elimination');
 assert(s.units.length===2&&s.units.every(u=>u.hp===0),'actual Turtle source reached dual physical KO');
 assert.equal(s.roundWinner,'draw','draw is not incorrectly credited red or blue');
 assert.equal(s.blueLives,lives-1);assert.equal(s.redLives,lives-1);
 assert.equal(s.phase,lives===1?'match_over':'round_over');
 assert.equal(s.winner,lives===1?'draw':null);
 assert.equal(snapshot.winner,'draw','core reports intentional double terminal');
 assert.equal(snapshot.running,false,'core stops ticking instead of zombie-frame loop');
 assert.equal(terminalEvents,1,'adapter terminal callback exactly once');
 if(lives===1)assert.equal(adapter.nextRound(777),false);
 else{
  assert(adapter.nextRound(777),'draw should allow another round while lives remain');
  const restarted=adapter.getState();assert.equal(restarted.phase,'battle');assert.equal(restarted.round,2);
  assert(restarted.battleId>s.battleId);
  assert.equal(restarted.blueLives,lives-1);assert.equal(restarted.redLives,lives-1);
 }
 off();
 return{lives,seed,frames,tick:s.debug?.tick,terminal:states,stopped:snapshot.running===false};
}
for(const lives of [1,2])receipts.push(simulate(lives,103));
const first=simulate(1,103);assert.equal(first.frames,receipts[0].frames,'true simultaneous KO deterministic across fresh contexts');
assert.deepEqual(errors,[],'simulation errors');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),ui=read('v3'),round=read('round-loop');
assert(ui.includes("'DOUBLE K.O. · DRAW'"),'results screen labels true drawn finals');
assert(ui.includes("winner&&winner!=='draw'"),'draws never grant Parts');
assert(round.includes("win==='draw'?'DOUBLE K.O. · DRAW'"),'round-loop final UI handles draw');
assert(round.includes("s.roundWinner==='draw'"),'intermission labels double KO without declaring losing side');
assert(html.includes('/v3/round-loop.js?v=doubleko1'),'root loads pinned round UI version');
console.log('REAL MUTUAL KO '+JSON.stringify(receipts));
console.log('PASS: true Turtle L4 mutual death terminates once; both lives deducted; final DRAW and round continuation; no dead-unit zombie loop or Parts awarded for draw');
