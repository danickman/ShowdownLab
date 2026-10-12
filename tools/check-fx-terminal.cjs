// Exercise the exact last-fighter/final-KO emission path, including lexical scope.
const fs=require('fs'),vm=require('vm'),cp=require('child_process'),assert=require('assert');
const released='fb9f3c925eb27f15d5e2e37c6d45baa86181f136';
function setup(source){
 const e={window:null,console,performance:{now:()=>5000},state:{speed:1},fx:[],prev:new Map(),cam:{unitSize:()=>84},scars:[],spellMarks:[],defeated:new Map(),storyGate:new Set(),comicGate:new Map(),shake:0,flash:0,lastImpact:0,staging:null,view:{w:390,h:844},spritePoint:u=>({x:100+u.x*100,y:400}),fighterCue:()=>({x:150,y:350}),comicWord(){},signatureWord:()=>null,impactMaterial:()=>({flavor:'sword',armored:true}),burst(){},cap:t=>t[0].toUpperCase()+t.slice(1),matchMedia:()=>({matches:false})};e.window=e;vm.createContext(e);
 vm.runInContext(source.slice(source.indexOf('function effectScale('),source.indexOf('const SIGNATURE_WORDS=')),e);
 vm.runInContext(source.slice(source.indexOf('function spawnFX('),source.indexOf('function drawFX(')),e);
 return e;
}
const unit=(id,team,hp,type='knight')=>({id,team,hp,type,maxHp:100,x:.5,y:.5,level:5,action:hp?'idle':'dead'});
const previous=[unit(1,'blue',100),unit(2,'blue',100),unit(3,'red',100)];
function last(e){e.prev=new Map(previous.map(u=>[u.id,{hp:u.hp,team:u.team,action:u.action}]));e.spawnFX({units:[unit(1,'blue',100),unit(2,'blue',0),unit(3,'red',100)],tick:2,round:1,speed:1})}
const bad=setup(cp.execFileSync('git',['show',released+':v3/v3.js'],{encoding:'utf8'}));assert.throws(()=>last(bad),/Cannot access 'cap' before initialization/,'released source reproduces caption shadowing');
const e=setup(fs.readFileSync('v3/v3.js','utf8'));last(e);assert.equal(e.storyBeat.text,'LAST FIGHTER!');assert(e.storyBeat.sub.startsWith('Knight L5'));assert.equal(e.prev.get(2).hp,0);
e.fx=Array.from({length:150},()=>({kind:'test',t:5000}));e.spawnFX({units:[unit(1,'blue',100),unit(2,'blue',0),unit(3,'red',0)],tick:3,round:1,speed:1});assert.equal(e.storyBeat.text,'FINAL K.O.!');assert(e.storyBeat.sub.startsWith('Knight'));assert(e.fx.length<=94);assert.equal(e.prev.get(3).hp,0);
// Repeated terminal snapshots must continue updating the previous-state map.
e.spawnFX({units:[unit(1,'blue',100),unit(2,'blue',0),unit(3,'red',0)],tick:4,round:1,speed:10});assert(e.fx.length<=50);
e.spawnFX({units:Array.from({length:180},(_,i)=>unit(i+1,i%2?'blue':'red',100)),tick:5,round:2,speed:10});assert(e.fx.length<=34);
console.log('PASS: released TDZ reproduced; last-fighter/final-KO captions, bounded FX and state tracking pass after fix');
