'use strict';
// Exactly conserved target pressure: user-visible battle behavior must not change.
// 32 completed 20/40 battles, mirrored 80/120/300 stress, 1x and 10x.
// Source reconstruction is strictly scoped to this opt-in optimization.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const live=read('v3/legacy-sim-core.js');
const priorCore = (function (live){
 let base=live;
 const replace=(a,b)=>{if(base.split(a).length!==2)throw Error('pressure source reconstruction anchor moved: '+a.slice(0,90));base=base.replace(a,b)};
 replace("let pressureCache=null,pressureTick=-1;\n// Lazily rebuild once per combat tick; keep counts exact as targets switch or die.\nfunction refreshPressureCache(){const blue=new Map(),red=new Map();for(const a of units){if(a.hp<=0)continue;const map=a.team==='blue'?blue:red;map.set(a.target,(map.get(a.target)||0)+1)}pressureCache={blue,red};pressureTick=tick}\nfunction trackTarget(u,id){if(pressureCache&&pressureTick===tick&&u.hp>0&&u.target!==id){const map=pressureCache[u.team];map.set(u.target,(map.get(u.target)||0)-1);map.set(id,(map.get(id)||0)+1)}u.target=id}\nfunction nearest(u,preferBack=false){if(pressureTick!==tick)refreshPressureCache();","function nearest(u,preferBack=false){");
 replace("const pressureByTarget=pressureCache[u.team];","const pressureByTarget=new Map();for(const a of units)if(a.team===u.team&&a.hp>0)pressureByTarget.set(a.target,(pressureByTarget.get(a.target)||0)+1);");
 replace("const wasAlive=t.hp>0;t.hp=Math.max(0,t.hp-dmg);if(pressureCache&&pressureTick===tick&&wasAlive&&t.hp<=0){const map=pressureCache[t.team];map.set(t.target,(map.get(t.target)||0)-1)}lastDamageTick=tick;","t.hp=Math.max(0,t.hp-dmg);lastDamageTick=tick;");
 replace("function deploy(blue=['knight','sniper'],red=['goose','dragon']){pressureCache=null;pressureTick=-1;running=false;","function deploy(blue=['knight','sniper'],red=['goose','dragon']){running=false;");
 for(const [after,before] of [["trackTarget(u,t.id)","u.target=t.id"],["trackTarget(u,mt.id)","u.target=mt.id"],["trackTarget(u,null)","u.target=null"],["trackTarget(u,nearest(u)[0]?.id??null)","u.target=nearest(u)[0]?.id??null"]]){
  if(!base.includes(after))throw Error('target tracking source drift '+after);
  base=base.split(after).join(before);
 }
 return base;
});
const previous=priorCore(live);
assert.notEqual(previous,live,'cache not present');
assert(live.includes('function refreshPressureCache()')&&live.includes('function trackTarget(u,id)'),'missing source tracking');
assert(live.includes('}separate(false)}function winner(){'),'graph truth instrumentation boundary must remain');
const modes={
 mixed:[['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'],['goose','barbarian','goblin','turtle','mole','beetank','assassin','dragon','sniper','knight']],
 swarm:[['goblin','goose','assassin','goblin','knight','barbarian','mole','sniper','goblin','goose'],['goblin','goblin','turtle','beetank','dragon','goose','knight','barbarian','mole','sniper']],
 heavy:[['beetank','turtle','knight','dragon','barbarian','beetank','turtle','sniper','mole','assassin'],['dragon','beetank','barbarian','turtle','knight','sniper','assassin','goblin','goose','mole']],
 ranged:[['sniper','sniper','dragon','dragon','sniper','knight','beetank','turtle','mole','barbarian'],['goblin','goblin','goose','assassin','knight','barbarian','mole','beetank','turtle','sniper']]
};
function trial(src,c){
 let clock=0,seq=0,q=new Map(),state=null,errors=[],frames=0;
 const digest=crypto.createHash('sha256');
 const env={window:null,Math,performance:{now:()=>clock},
 requestAnimationFrame(fn){const id=++seq;q.set(id,fn);return id},
 cancelAnimationFrame(id){q.delete(id)},console:{error:(...a)=>errors.push(a.join(' '))}};env.window=env;
 vm.createContext(env);vm.runInContext(read('v3/evolution-rules.js'),env);vm.runInContext(read('v3/ultimate-abilities.js'),env);
 vm.runInContext(src,env,{filename:'pressure-cache-ab.js'});
 const game=env.LegacySimCore;
 const make=side=>{
  const f=modes[c.mode][side==='blue'?(c.mirror?1:0):(c.mirror?0:1)];
  return Array.from({length:c.count/2},(_,i)=>({type:f[i%f.length],level:[1,2,4,5][i%4],squad:Math.floor(i/5)}));
 };
 game.configure({seed:c.seed,speed:c.speed,onState:()=>{}});
 game.deploy(make('blue'),make('red'));game.setRunning(true);
 for(;frames<c.frames;frames++){
  clock+=16.667;const actions=[...q.values()];q.clear();for(const action of actions)action(clock);
  state=game.getState();digest.update(JSON.stringify(state)+'\n');if(state.winner)break;
 }
 assert.deepEqual(errors,[],'source simulation exception '+JSON.stringify(c));
 assert(state&&state.units.length===c.count,'uncapped population '+JSON.stringify(c));
 assert(state.units.every(u=>Number.isFinite(u.hp)&&Number.isFinite(u.x)&&Number.isFinite(u.y)),'non-finite physical state');
 return{hash:digest.digest('hex'),tick:state.tick,winner:state.winner,frames:frames+1};
}
const cases=[];
for(const count of [20,40])for(const mode of Object.keys(modes))for(const seed of [1337,9917])for(const mirror of [false,true])
 cases.push({count,mode,seed,mirror,speed:10,frames:460,terminal:true});
for(const count of [80,120,300])for(const speed of [1,10])for(const mirror of [false,true])
 cases.push({count,mode:'heavy',seed:1337,mirror,speed,
 frames:count===300?(speed===10?5:35):count===120?(speed===10?15:40):(speed===10?40:65),terminal:false});
let terminal=0;
const rows=[];
for(const c of cases){
 const baseline=trial(previous,c),candidate=trial(live,c);
 assert.equal(candidate.hash,baseline.hash,'physical timeline changed '+JSON.stringify(c));
 assert.equal(candidate.winner,baseline.winner,'winner changed '+JSON.stringify(c));
 assert.equal(candidate.tick,baseline.tick,'tick changed '+JSON.stringify(c));
 if(c.terminal){assert(baseline.winner,'true terminal required '+JSON.stringify(c));terminal++}
 rows.push({...c,tick:candidate.tick,winner:candidate.winner,exact:true});
}
assert.equal(terminal,32);
assert.equal(rows.length,44);
const report={status:'QA pressure-count caching shipped; exact physical-state source parity',
 population:'20/40 full terminal and 80/120/300 at 1x+10x',frames:rows.length,terminal,rows,
 caveat:'Node/VM source parity, not a physical iPhone 14 Pro Max Safari FPS measurement. Performance improvement estimates belong to the separate ABBA research study and should not be represented as device FPS.'};
if(process.env.QA_PRESSURE_LIVE_RECEIPT)fs.writeFileSync(process.env.QA_PRESSURE_LIVE_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('PASS: target pressure kept exact on 32 complete matches + 12 high-density cases; 44/44 full state digests identical');
