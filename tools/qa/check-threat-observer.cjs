// Regression for *read-only* role opportunity observer; does not alter battle simulation.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {observe}=require('./threat-observer.cjs');
const read=n=>fs.readFileSync(path.join(__dirname,'../../v3/',n+'.js'),'utf8');
const freeze=o=>{if(o&&typeof o==='object'){Object.freeze(o);for(const x of Object.values(o))freeze(x)}return o};
const unit=(id,type,team,x,y,extra={})=>({id,type,team,x,y,hp:100,maxHp:100,
 dmg:type==='dragon'?43:type==='knight'?18:type==='goblin'?10:31,
 cd:type==='dragon'?48:type==='knight'?30:type==='goblin'?18:78,
 range:type==='sniper'?195:type==='dragon'?128:25,spd:1,aimTicks:27,aim:0,cooldown:0,
 action:'move',target:null,...extra});
const choose=(out,id)=>{const decision=out.decisions.find(d=>d.actorId===id);assert(decision,'missing role decision '+id);return decision};
function fixtures(){
 // Targets both reachable by a Sniper; Dragon poses greater harm when Knight is not advancing.
 const shooter=unit(1,'sniper','blue',.20,.50),escort=unit(2,'knight','blue',.27,.52);
 const dragon=unit(3,'dragon','red',.51,.51),knight=unit(4,'knight','red',.48,.47,{spd:.72});
 const early=freeze({tick:20,units:[shooter,escort,dragon,knight]});
 const target=choose(observe(early),1);
 assert.equal(target.suggestedTarget,3,'Sniper must prefer dangerous reachable Dragon');
 assert(!target.urgent);
 // Now Knight approaches: warn early, rather than retargeting only at melee contact.
 const nearKnight=unit(4,'knight','red',.32,.49,{spd:.72,action:'charge'});
 const approached=freeze({tick:44,units:[shooter,escort,dragon,nearKnight]});
 const previous=freeze({tick:32,units:[shooter,escort,dragon,unit(4,'knight','red',.40,.49,{spd:.72,action:'charge'})]});
 const reaction=choose(observe(approached,previous),1);
 assert.equal(reaction.suggestedTarget,4,'Sniper must intercept an approaching Knight');
 assert(reaction.urgent,'Knight must trigger an emergency response');
 // No defensive switch for a retreating Knight.
 const receding=freeze({tick:44,units:[shooter,escort,dragon,unit(4,'knight','red',.36,.49,{spd:.72,action:'march'})]});
 const prevNear=freeze({tick:32,units:[shooter,escort,dragon,unit(4,'knight','red',.32,.49,{spd:.72,action:'march'})]});
 assert.equal(choose(observe(receding,prevNear),1).suggestedTarget,3,'Retreating Knight should not preempt Dragon');
 // Three Goblins overwhelm an otherwise isolated heavy while staying local.
 const goblins=[unit(10,'goblin','blue',.20,.49),unit(11,'goblin','blue',.22,.52),unit(12,'goblin','blue',.24,.48)];
 const heavy=unit(13,'knight','red',.34,.50);
 const stranger=unit(14,'goblin','red',.34,.67);
 const pack=freeze({tick:1,units:[...goblins,heavy,stranger]});
 const packOut=choose(observe(pack),10);
 assert.equal(packOut.suggestedTarget,13,'Goblins should coordinate on reachable isolated heavy');
 assert.equal(packOut.reason,'coordinated-pack-opportunity');
 // A hostile Goblin threatening our Sniper must be eligible for protective counter-swarm.
 const sn=unit(20,'sniper','blue',.23,.56);
 const intruder=unit(21,'goblin','red',.29,.56);
 const heavyFar=unit(22,'knight','red',.34,.49);
 const protect=freeze({tick:1,units:[...goblins,sn,intruder,heavyFar]});
 const defensive=choose(observe(protect),10);
 assert.equal(defensive.suggestedTarget,21,'Local hostile swarm should be intercepted');
 assert.equal(defensive.reason,'counter-hostile-swarm');
 // Beetank should prefer comparable dangerous heavy over a weaker nearby light target.
 const be=unit(30,'beetank','blue',.20,.50,{range:30});
 const heavyTarget=unit(31,'dragon','red',.45,.52);
 const small=unit(32,'goblin','red',.43,.49);
 assert.equal(choose(observe(freeze({tick:1,units:[be,heavyTarget,small]})),30).suggestedTarget,31);
 // No proposal should be returned if all feasible threats are too far away.
 assert.equal(observe({tick:1,units:[shooter,unit(99,'dragon','red',.90,.90)]}).decisions.length,0);
 console.log('PASS: deterministic threat, arriving Knight, retreat, swarm, heavy and range fixtures');
}
function simulate(n,seed,mirror,withObserver){
 let now=0,id=0,q=new Map(),lastSnap=null,observerNs=0n,observerCalls=0,decisionCounts={};
 const env={window:null,Math,performance:{now:()=>now},CustomEvent:class{},
  dispatchEvent(){},console:{error(...a){throw Error(a.join(' '))}},
  requestAnimationFrame(cb){let k=++id;q.set(k,cb);return k},
  cancelAnimationFrame(k){q.delete(k)}};
 env.window=env;vm.createContext(env);
 for(const n of ['evolution-rules','ultimate-abilities','legacy-sim-core'])vm.runInContext(read(n),env);
 const core=env.LegacySimCore;
 const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
 const roster=side=>Array.from({length:n/2},(_,i)=>({type:types[(i*3+((mirror?side==='blue':side==='red')?5:0))%10],level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
 core.configure({seed,speed:10});core.deploy(roster('blue'),roster('red'));core.setRunning(true);
 const fingerprints=[];let lastEpoch=-1;
 const start=process.hrtime.bigint();
 for(let frame=0;frame<90;frame++){
  now+=16.667;const jobs=[...q.values()];q.clear();for(const cb of jobs)cb(now);
  const state=core.getState();
  if(withObserver&&Math.floor(state.tick/12)>lastEpoch){
   lastEpoch=Math.floor(state.tick/12);const before=process.hrtime.bigint();
   const decision=observe(state,lastSnap);observerNs+=process.hrtime.bigint()-before;observerCalls++;
   for(const d of decision.decisions)decisionCounts[d.reason]=(decisionCounts[d.reason]||0)+1;
   lastSnap=state;
  }
  if(frame%15===14)fingerprints.push(JSON.stringify(state));
  if(state.winner)break;
 }
 const elapsedMs=Number(process.hrtime.bigint()-start)/1e6;
 return{final:JSON.stringify(core.getState()),fingerprints,observerCalls,observerMs:Number(observerNs)/1e6,elapsedMs,decisionCounts};
}
fixtures();
const sizes=(process.env.QA_THREAT_SIZES||'40,80,120').split(',').map(Number),seeds=(process.env.QA_THREAT_SEEDS||'1337').split(',').map(Number);
assert(sizes.length&&sizes.every(n=>[20,40,80,120,180].includes(n)));
assert(seeds.length&&seeds.every(Number.isSafeInteger));
const receipts=[];
for(const count of sizes)for(const seed of seeds)for(const mirror of [false,true]){
 const base=simulate(count,seed,mirror,false),observed=simulate(count,seed,mirror,true);
 assert.equal(observed.final,base.final,'Observer mutated outcome/state '+count+':'+seed+':'+mirror);
 assert.deepEqual(observed.fingerprints,base.fingerprints,'Observer changed deterministic trace');
 assert(observed.observerCalls>0,'Expected at least one sampling epoch');
 receipts.push({count,seed,mirror,observerCalls:observed.observerCalls,
  observerMs:+observed.observerMs.toFixed(2),controlWallMs:+base.elapsedMs.toFixed(2),
  observedWallMs:+observed.elapsedMs.toFixed(2),reasons:observed.decisionCounts});
}
const byCount={};for(const n of sizes){const a=receipts.filter(x=>x.count===n);byCount[n]={traces:a.length,
 meanObserverMs:+(a.reduce((s,x)=>s+x.observerMs,0)/a.length).toFixed(2),
 meanCalls:a.reduce((s,x)=>s+x.observerCalls,0)/a.length,
 meanControlWallMs:+(a.reduce((s,x)=>s+x.controlWallMs,0)/a.length).toFixed(2),
 meanObservedWallMs:+(a.reduce((s,x)=>s+x.observedWallMs,0)/a.length).toFixed(2)}}
console.log('THREAT OBSERVER PARITY '+JSON.stringify(byCount));
if(process.env.QA_THREAT_RECEIPT)fs.writeFileSync(process.env.QA_THREAT_RECEIPT,JSON.stringify({receipts,byCount},null,2));
console.log('PASS: read-only threat observer preserves exact battle state and 15-frame trace checkpoints');
