'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const read=p=>fs.readFileSync(path.resolve(__dirname,'../../',p),'utf8');
// Goose-source comparison must hold *all other roles* at CURRENT levels.
 // Reconstruct only the historic honk function; premium Barbarian remains
 // identical in both arms. Comparing to the entire pre-Goose Ultimate source
 // would incorrectly flag the independently shipped premium Barbarian.
const live=read('v3/ultimate-abilities.js');
const historical=read('tools/qa/fixtures/goose-before-impact-ultimate.js');
const oldStart=historical.indexOf('function honk(u,units,tick){'),oldEnd=historical.indexOf('function burn(u)',oldStart);
const liveStart=live.indexOf('function honk(u,units,tick){'),liveEnd=live.indexOf('function burn(u)',liveStart);
assert(oldStart>0&&oldEnd>oldStart&&liveStart>0&&liveEnd>liveStart,'Goose source boundaries must remain explicit');
assert(historical.includes('Thunder Honk')&&live.includes('Impact Shockwave'),'both old/current source revision identities required');
const ult={before:live.slice(0,liveStart)+historical.slice(oldStart,oldEnd)+live.slice(liveEnd),after:live};
assert(ult.before!==ult.after,'old-Goose-only controlled comparison must actually change source');
const core=read('v3/legacy-sim-core.js'),evo=read('v3/evolution-rules.js');
const types={noGoose:['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian'],preL4:['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose']};
function trial(version,n,seed,speed,mode){
 let now=0,idx=0,q=new Map(),sha=crypto.createHash('sha256');
 const env={window:null,Math,performance:{now:()=>now},requestAnimationFrame(cb){const id=++idx;q.set(id,cb);return id},
 cancelAnimationFrame(id){q.delete(id)},console:{error:(...a)=>{throw Error('sim error '+a.join(' '))}}};env.window=env;vm.createContext(env);
 vm.runInContext(evo,env);vm.runInContext(ult[version],env);vm.runInContext(core,env);
 const sim=env.LegacySimCore,rs=types[mode],roster=()=>Array.from({length:n/2},(_,i)=>({type:rs[i%rs.length],level:mode==='preL4'?3:4,squad:Math.floor(i/5)}));
 sim.configure({seed,speed,onState:()=>{}});sim.deploy(roster(),roster());sim.setRunning(true);
 assert.equal(sim.getState().units.length,n);for(let i=0;i<(n===300?12:30);i++){
 now+=16.667;const cb=[...q.values()];q.clear();for(const f of cb)f(now);const state=sim.getState();
 assert(state.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.x)&&Number.isFinite(u.y)));
 sha.update(JSON.stringify(state)+'\n');if(state.winner)break;
 }return sha.digest('hex');
}
let n=0;for(const mode of ['noGoose','preL4'])for(const count of [20,40,80,120,300])for(const speed of [1,10]){
 const seed=4003+count*13+speed;assert.equal(trial('before',count,seed,speed,mode),trial('after',count,seed,speed,mode),
 'unrelated gameplay physically drifted '+JSON.stringify({mode,count,speed}));n++;
}assert.equal(n,20);console.log('PASS: 20 full-RAF SHA pairs isolating Goose Impact with the SAME premium Barbarian and other current-role rules (20–300 fighters, 1x/10x)');
