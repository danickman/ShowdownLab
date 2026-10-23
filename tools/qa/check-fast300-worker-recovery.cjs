'use strict';
// Deterministic fault injection on the actual QA-playable Fast300 bridge.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('v3/fast300-worker-bridge.js','utf8');
const nodes=[],body={appendChild(n){nodes.push(n);return n}},document={body,createElement(tag){return{tag,style:{},children:[],setAttribute(){},addEventListener(type,fn){this['on'+type]=fn},appendChild(n){this.children.push(n)},remove(){let i=nodes.indexOf(this);if(i>=0)nodes.splice(i,1)},focus(){}}}};
let onState=()=>{},deployments=0,seed=0,alive=false;
const inline={configure(o){onState=o.onState||onState;seed=o.seed||seed},setRunning(v){alive=!!v;onState({tick:0,units:[{id:1,team:'blue',hp:100},{id:2,team:'red',hp:100}],running:alive,winner:null})},deploy(a,b){deployments++;onState({tick:0,units:[...a,...b].map((u,i)=>({id:i+1,team:i<a.length?'blue':'red',hp:100})),running:false,winner:null})},setSpeed(){},pause(){alive=!alive;return alive},castSpell(){return{ok:true}},getState(){return{tick:0,units:[],running:alive}}};
const workers=[];class FakeWorker{constructor(path){this.path=path;this.posts=[];workers.push(this)}postMessage(m){this.posts.push(m)}terminate(){this.dead=true}}
const win={LegacySimCore:inline,dispatchEvent(){},addEventListener(){}},receipts=[],frames=new Map();let fid=0;
vm.runInNewContext(code,{window:win,Worker:FakeWorker,document,console,requestAnimationFrame:f=>{frames.set(++fid,f);return fid},cancelAnimationFrame:id=>frames.delete(id),CustomEvent:class{}},{filename:'live-fast300-bridge.js'});
const a=win.LegacySimCore;win.ShowdownAdapter={startBattle(x){this.lastRestart=x;a.deploy(Array.from({length:90},()=>({type:'knight'})),Array.from({length:90},()=>({type:'turtle'})))} };
a.configure({seed:42,speed:1,onState:s=>receipts.push({tick:s.tick,count:s.units.length,running:s.running,winner:s.winner})});
const army=Array.from({length:90},()=>({type:'knight'}));a.deploy(army,army);a.setRunning(true);
assert.equal(workers.length,1);let w=workers[0],epoch=w.posts.find(x=>x.type==='init').epoch;
const snapshot={tick:47,units:Array.from({length:180},(_,i)=>({id:i+1,team:i<90?'blue':'red',hp:75,maxHp:100})),winner:null,running:true,speed:1};
w.onmessage({data:{type:'state',epoch,snapshot,physicalStats:{targetBuilds:2,collisionPasses:4}}});
assert.equal(a.getState().tick,47);assert.equal(deployments,0,'inline must not deploy while healthy Worker is running');
w.onerror({message:'fault-injection-after-tick47'});
assert.equal(deployments,0,'must NOT silently replay defeated fighter roster');
assert.equal(a.getState().tick,47,'last real tick must remain visible');
assert.equal(a.getState().running,false);assert.equal(win.__showdownThreadStats.mode,'recovery');
assert.equal(win.__showdownThreadStats.recoveryStops,1);assert.equal(win.__showdownThreadStats.rollbacks,0);
assert.equal(a.castSpell('quake').ok,false);assert.equal(a.pause(),false);
assert.equal(nodes.length,1,'player must receive explicit recovery dialog');
const panel=nodes[0].children[0],button=panel.children.find(x=>x.tag==='button');
assert(button&&button.textContent.includes('Restart round')&&typeof button.onclick==='function');
button.onclick();assert.equal(win.ShowdownAdapter.lastRestart.continueMatch,true);
assert.equal(deployments,1,'player-authorized restart must deploy one fresh inline round');
assert.equal(workers.length,1,'crashing Worker must not restart repeatedly');
assert.equal(nodes.length,0,'recovery UI must close after explicit restart');
assert.equal(win.__showdownThreadStats.mode,'inline');
// Independently verify a Worker crashing BEFORE any physics tick falls back automatically.
const earlyCodeWin={LegacySimCore:inline,dispatchEvent(){},addEventListener(){}};
vm.runInNewContext(code,{window:earlyCodeWin,Worker:FakeWorker,document,console,requestAnimationFrame:f=>{frames.set(++fid,f);return fid},cancelAnimationFrame:id=>frames.delete(id),CustomEvent:class{}},{filename:'early-fast300-bridge.js'});
const early=earlyCodeWin.LegacySimCore;early.configure({seed:12,onState(){}});const before=deployments;early.deploy(army,army);
const child=workers.at(-1);child.onerror({message:'startup-import-failed'});
assert.equal(deployments,before+1,'pre-tick startup fault should transparently fall back inline');
assert.equal(earlyCodeWin.__showdownThreadStats.mode,'inline');
console.log('PASS Fast300 after-progress fail-closed, player-authorized safe restart and pre-tick inline fallback');
