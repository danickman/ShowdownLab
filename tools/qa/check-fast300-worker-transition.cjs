'use strict';
// Exercise the REAL playable bridge and prove previous inline terminal snapshots cannot
// reach a newly configured >=160 fighter Worker match when inline.setRunning(false) fires.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const bridge=fs.readFileSync(path.resolve(__dirname,'../../v3/fast300-worker-bridge.js'),'utf8');
const received=[];let onState=()=>{},previous={units:[{id:1},{id:2}],winner:'blue',running:false},workers=[];
const inline={configure(x){if(x.onState)onState=x.onState},deploy(a,b){previous={units:[...a,...b],winner:null,running:false};onState(previous)},setRunning(v){onState({...previous,running:!!v})},pause(){onState({...previous,running:false});return false},setSpeed(){},castSpell(){return{ok:true}},getState(){return previous}};
const win={LegacySimCore:inline},frames=new Map();let nextFrame=0;
class FakeWorker{constructor(url){this.url=url;this.messages=[];this.dead=false;workers.push(this)}postMessage(m){this.messages.push(m)}terminate(){this.dead=true}}
new Function('window','Worker','requestAnimationFrame','cancelAnimationFrame','CustomEvent',bridge)(win,FakeWorker,fn=>{const id=++nextFrame;frames.set(id,fn);return id},id=>frames.delete(id),function FakeEvent(){});
const api=win.LegacySimCore,prior=[];
api.configure({onState:x=>prior.push(x)});api.deploy([{id:1}],[{id:2}]);api.setRunning(false);
const fresh=[];api.configure({onState:x=>fresh.push(x)});
api.deploy(Array.from({length:90},(_,i)=>({id:i+3})),Array.from({length:90},(_,i)=>({id:i+93})));api.setRunning(true);
assert.equal(fresh.length,0,'stale 2-unit terminal state leaked into new 180-worker adapter');
assert.equal(workers.length,1,'new 180 Worker never started');
const original180={tick:0,units:Array.from({length:180},(_,i)=>({id:i+3})),winner:null,running:true};
workers[0].onmessage({data:{type:'state',epoch:1,snapshot:original180,physicalStats:{targetBuilds:1,collisionPasses:4}}});
assert.equal(fresh.length,1,'fresh Worker initial 180-fighter snapshot missing');
assert.equal(fresh[0].units.length,180);assert.equal(fresh[0].winner,null);
const smaller=[];api.configure({onState:x=>smaller.push(x)});api.deploy([{id:1}],[{id:2}]);
assert.equal(smaller.length,1,'returning from Worker to inline suppressed fresh small match');
assert.equal(smaller[0].units.length,2);assert(workers[0].dead,'old Worker not terminated on small match');
console.log('PASS stale inline terminal suppressed before >=160 deployment, fresh Worker 180 state delivered, return inline alive');
