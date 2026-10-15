'use strict';
// Prove Goose's actual simulation honk survives periodic rendering snapshots.
// Source-level cue, not a new simulation action or synthetic spell; no PWA import.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const renderer=read('v3/v3.js'),core=read('v3/legacy-sim-core.js');
const cueStart=renderer.indexOf('function gooseHonkReset('),cueEnd=renderer.indexOf('function spawnFX(next){',cueStart);
assert(cueStart>0&&cueEnd>cueStart&&renderer.indexOf('function gooseHonkReset(',cueStart+1)<0,'one honk recovery helper required');
const cue=vm.runInNewContext(renderer.slice(cueStart,cueEnd)+';gooseHonkReset',{Number});
assert.equal(cue({honk:12},{type:'goose',honk:114}),true,'honk cooldown reset should be recognized');
assert.equal(cue({honk:60},{type:'goose',honk:43}),false,'normal honk countdown is not an ability activation');
assert.equal(cue({honk:60},{type:'turtle',honk:120}),false,'only Goose triggers this cue');
assert.equal(cue(null,{type:'goose',honk:110}),false,'do not invent a cue from an uninitialized prior state');
assert.equal(cue({honk:3},{type:'goose',honk:NaN}),false,'malformed simulation state should not create an effect');
assert(renderer.includes("if(gooseHonkReset(old,u)&&!(u.action==='honk'&&old.action!==u.action)"),
 'deduplicate detected ability against an already-visible action');
assert(renderer.includes('honk:u.honk,team:u.team'),'previous honk counter must be retained across snapshots');
assert(renderer.includes("density<=48||(u.id+next.tick)%Math.max(2,Math.ceil(density/40))===0"),'density cap is mandatory for 300-fighter theatre');
assert(renderer.includes("fx.push({kind:'honk',x:p.x,y:p.y,worldX:u.x,worldY:u.y,stageOffset:staging?.offset(u.id)"),
 'recovered signal must draw the already-authored honk artwork');
const anchor="u.action='honk';u.honk=u.honkCd+Math.floor(rnd()*35);";
assert.equal(core.split(anchor).length,2,'game Goose honk action changed');
const instrumented=core.replace(anchor,"u.action='honk';window.__qaHonk(u.id,tick);u.honk=u.honkCd+Math.floor(rnd()*35);");
const pattern=['goose','goose','goose','knight','turtle','beetank','goblin','assassin','mole','sniper'];
function run(source,{count,speed,mirror,frames}){
 let time=0,id=0,q=new Map(),errors=[],actualHonk=0,observedByAction=0,detectedByCooldown=0,recovered=0,duplicatesAvoided=0,states=0;
 const previous=new Map(),digest=crypto.createHash('sha256');
 const env={window:null,Math,performance:{now:()=>time},requestAnimationFrame(fn){const k=++id;q.set(k,fn);return k},
  cancelAnimationFrame(k){q.delete(k)},console:{error:(...a)=>errors.push(a.join(' '))}};
 env.window=env;env.__qaHonk=()=>actualHonk++;
 vm.createContext(env);
 for(const p of ['evolution-rules','ultimate-abilities'])vm.runInContext(read('v3/'+p+'.js'),env,{filename:p+'.js'});
 vm.runInContext(source,env,{filename:'goose-honk-sampling.js'});
 const sim=env.LegacySimCore;
 const roster=side=>Array.from({length:count/2},(_,i)=>({
  type:pattern[(i+(mirror?(side==='blue'?1:0):(side==='blue'?0:1)))%pattern.length],
  level:[1,2,4,5][i%4],squad:Math.floor(i/6)
 }));
 sim.configure({seed:1337,speed,onState:s=>{
  states++;digest.update(JSON.stringify(s)+'\n');
  for(const u of s.units){if(u.type!=='goose')continue;
   const old=previous.get(u.id);if(old){
    const action=u.action==='honk'&&old.action!=='honk',reset=cue(old,u);
    if(action)observedByAction++;
    if(reset)detectedByCooldown++;
    if(reset&&!action)recovered++;
    if(reset&&action)duplicatesAvoided++;
   }
   previous.set(u.id,{honk:u.honk,action:u.action});
  }
 }});
 sim.deploy(roster('blue'),roster('red'));sim.setRunning(true);
 let framesSeen=0;
 for(let frame=0;frame<frames;frame++){
  time+=16.667;const callbacks=[...q.values()];q.clear();for(const fn of callbacks)fn(time);framesSeen++;
  if(sim.getState().winner)break;
 }
 assert.deepEqual(errors,[],'RC4 exception during honk study');
 return{hash:digest.digest('hex'),count,speed,mirror,framesSeen,tick:sim.getState().tick,states,
  actualHonk,observedByAction,detectedByCooldown,recovered,duplicatesAvoided};
}
const rows=[];
for(const speed of [1,4,10])for(const count of [20,40])for(const mirror of [false,true]){
 const cfg={count,speed,mirror,frames:speed===1?500:speed===4?150:85};
 const original=run(core,cfg),watched=run(instrumented,cfg);
 assert.equal(watched.hash,original.hash,'QA honk hook changed the simulator '+JSON.stringify(cfg));
 assert.equal(watched.tick,original.tick,'QA honk hook altered logical clock '+JSON.stringify(cfg));
 assert.equal(watched.detectedByCooldown,watched.actualHonk,'cooldown reset must recover each emitted Goose honk in fixture '+JSON.stringify(cfg));
 assert.equal(watched.recovered+watched.duplicatesAvoided,watched.actualHonk,'no missing or duplicated cues at '+JSON.stringify(cfg));
 if(speed===10)assert(watched.observedByAction<watched.actualHonk,'10x should demonstrate snapshot action loss');
 const {hash,...row}=watched;rows.push({...row,exactObserverParity:true});
 console.log('GOOSE HONK SAMPLING '+JSON.stringify(row));
}
const summary={cases:rows.length,actual:rows.reduce((n,x)=>n+x.actualHonk,0),
 actionVisible:rows.reduce((n,x)=>n+x.observedByAction,0),
 recovered:rows.reduce((n,x)=>n+x.recovered,0),
 naturallyVisible:rows.reduce((n,x)=>n+x.duplicatesAvoided,0),
 cooldownVisible:rows.reduce((n,x)=>n+x.detectedByCooldown,0),
 at10x:{actual:rows.filter(x=>x.speed===10).reduce((n,x)=>n+x.actualHonk,0),
 actionVisible:rows.filter(x=>x.speed===10).reduce((n,x)=>n+x.observedByAction,0)}};
const report={status:'QA render-source and exact sim observer parity; no combat or stat change',
 explanation:'Actual Goose honk resets cooldown 105+ ticks. Emit snapshots are ~48ms real time; one-tick action often invisible at 4x and 10x. Prior timer >= previous+5 recovers the real ability activation. Renderer already draws kind honk; fallback reuses this effect, prevents duplication, density throttles >48 fighters.',
 caveat:'Density throttling intentionally drops some visual cues in 80-300 crowds. This checks signal correctness, not physical Safari animation quality. Renderer can only show surviving/cached simulation state at snapshot time; not a full event journal.',
 summary,rows};
if(process.env.QA_HONK_RECEIPT)fs.writeFileSync(process.env.QA_HONK_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('GOOSE HONK CUE SUMMARY '+JSON.stringify(summary));
console.log('PASS: genuine Honk captured at 1x/4x/10x, no phantom events, no duplicate FX, no simulation state change');
