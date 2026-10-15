'use strict';
// QA-only measurement of real engagement vs proximity; never loaded by PWA.
// Positive damage from RC4 hurt() is actual evidence. Range/pursuit are proxies.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=n=>fs.readFileSync(path.join(root,'v3',n+'.js'),'utf8');
const sim=read('legacy-sim-core'),HIT='const dealt=Math.min(t.hp,dmg);';
assert.equal(sim.split(HIT).length,2,'source damage anchor must occur exactly once');
const instrumented=sim.replace(HIT,HIT+"if(dealt>0&&a)window.__qaHits.push({tick,attackerId:a.id,targetId:t.id,role:a.type,damage:dealt,x:t.x,y:t.y,secondary:!!secondary});");
const RANGED=new Set(['sniper','dragon']);
const PURSUIT=new Set(['move','stalk','guard','charge','march','rage_charge','rush','zigzag','bulldoze','trudge','scuttle','burrow','dig','reengage','waddle','shell_roll']);
const STRIKE=new Set(['attack','backstab','buttstroke','claw','claw_swipe','snap','stab','peck','axe_swing','rage_swing','shell_slam','horn','erupt','fire']);
const TYPES=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const zero=()=>({alive:0,targets:0,range:0,rangedThreat:0,pursuit:0,closing:0,attackAction:0});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function classify(units,previous=new Map()){
  const alive=units.filter(u=>u.hp>0),byId=new Map(alive.map(u=>[u.id,u])),roles=Object.fromEntries(TYPES.map(t=>[t,zero()]));
  const result={alive:alive.length,physicalPairs:0,physicalActors:0,targeted:0,nominalInRange:0,rangedThreat:0,pursuit:0,closing:0,strikeAction:0,
    threatCells:[],contactCells:[],roles};
  const active=new Set(),contactCells=new Set(),threatCells=new Set();
  const cell=p=>Math.min(3,Math.max(0,Math.floor(p.x*4)))+':'+Math.min(2,Math.max(0,Math.floor(p.y*3)));
  // Pairwise contact here is a QA measurement only; no extra work in the game.
  for(let i=0;i<alive.length;i++)for(let j=i+1;j<alive.length;j++){
    const a=alive[i],b=alive[j];if(a.team===b.team)continue;
    if(distance(a,b)<=.12){result.physicalPairs++;active.add(a.id);active.add(b.id);
      contactCells.add(cell({x:(a.x+b.x)/2,y:(a.y+b.y)/2}));}
  }
  result.physicalActors=active.size;
  for(const u of alive){
    const row=roles[u.type]||(roles[u.type]=zero());row.alive++;
    const t=byId.get(u.target);
    if(!t||t.team===u.team||t.burrow>0)continue;
    const d=distance(u,t),inRange=d<=u.range/500;
    result.targeted++;row.targets++;
    if(inRange){result.nominalInRange++;row.range++;}
    // "Threat" means nominal reach while not stunned; does NOT claim an actual hit,
    // clear cone or a legal ready shot. Aim/reload/cooldowns are separately important.
    if(RANGED.has(u.type)&&inRange&&!(u.stun>0)){
      result.rangedThreat++;row.rangedThreat++;threatCells.add(cell(t));}
    if(PURSUIT.has(u.action)){result.pursuit++;row.pursuit++;
      const prior=previous.get(u.id);
      if(prior&&prior.target===u.target&&d<prior.dist-.001){
        result.closing++;row.closing++;}}
    if(STRIKE.has(u.action)){result.strikeAction++;row.attackAction++;threatCells.add(cell(t));}
  }
  result.contactCells=[...contactCells].sort();result.threatCells=[...threatCells].sort();
  return result;
}
// Synthetic fixtures prevent the exact measurement mistake identified in the design decision.
const sniper={id:1,type:'sniper',team:'blue',hp:44,x:.2,y:.5,range:195,target:2,action:'aim',stun:0};
const dragon={id:2,type:'dragon',team:'red',hp:290,x:.48,y:.5,range:128,target:1,action:'fire_windup',stun:0};
let fixture=classify([sniper,dragon]);
assert.equal(fixture.physicalPairs,0,'long-range reach is not physical contact');
assert.equal(fixture.rangedThreat,2,'two ranged units can mutually threaten outside melee contact');
assert.equal(fixture.strikeAction,0,'aim and windup must not be counted as dealt hits');
const assassin={id:3,type:'assassin',team:'blue',hp:96,x:.08,y:.1,range:24,target:2,action:'stalk',stun:0};
fixture=classify([sniper,dragon,assassin],new Map([[3,{target:2,dist:.8}]]));
assert.equal(fixture.pursuit,1);
assert.equal(fixture.closing,1);
assert.equal(fixture.physicalPairs,0);
function simulate(code,count,seed,mirror){
  let now=0,next=0,queue=new Map(),last=null,errors=[],samples=[],hits=[],observed=[];
  const env={window:null,Math,performance:{now:()=>now},requestAnimationFrame(fn){const id=++next;queue.set(id,fn);return id;},
    cancelAnimationFrame(id){queue.delete(id);},console:{error:(...a)=>errors.push(a.join(' '))}};
  env.window=env;env.__qaHits=hits;vm.createContext(env);
  for(const file of ['evolution-rules','ultimate-abilities'])vm.runInContext(read(file),env,{filename:file+'.js'});
  vm.runInContext(code,env,{filename:'legacy-sim-core.qa.js'});
  const core=env.LegacySimCore,roster=side=>Array.from({length:count/2},(_,i)=>({
    type:TYPES[(i*3+((mirror?side==='blue':side==='red')?5:0))%10],
    level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
  const speed=count>=180?1:4,maxFrames=count===300?24:count===180?48:112;
  core.configure({seed,speed,onState:s=>{last=s}});
  core.deploy(roster('blue'),roster('red'));core.setRunning(true);
  let prev=new Map(),frames=0;
  for(let f=0;f<maxFrames;f++){
    frames++;now+=16.667;
    const pending=[...queue.values()];queue.clear();
    for(const callback of pending)callback(now);
    const s=core.getState();
    if(f%7===0||f===maxFrames-1||s.winner){
      const measure=classify(s.units,prev),tick=s.tick;
      const priorHits=hits.filter(h=>h.tick<=tick&&h.tick>(samples.length?samples.at(-1).tick:-1));
      samples.push({tick,measure,positiveDamageHits:priorHits.length,damage:priorHits.reduce((n,h)=>n+h.damage,0)});
      prev=new Map(s.units.filter(u=>u.hp>0).map(u=>{
        const t=s.units.find(v=>v.id===u.target&&v.hp>0&&v.team!==u.team);
        return[u.id,{target:u.target,dist:t?distance(u,t):Infinity}];}));
      observed.push(JSON.stringify(s));
    }
    if(s.winner)break;
  }
  assert.deepEqual(errors,[],'core did not log errors');
  const state=core.getState(),damageByRole={},hitCells=new Set(),damageCells=new Set();
  for(const h of hits){
    damageByRole[h.role]=(damageByRole[h.role]||0)+h.damage;
    hitCells.add(Math.min(3,Math.max(0,Math.floor(h.x*4)))+':'+Math.min(2,Math.max(0,Math.floor(h.y*3))));
    damageCells.add(h.attackerId+':'+h.targetId);
  }
  return{frames,tick:state.tick,winner:state.winner||null,samples,hits:hits.length,
    damageByRole,hitCells:[...hitCells].sort(),uniqueHitPairs:damageCells.size,observed,
    // Keep comparison parity about the complete final state, not just winner/count.
    final:JSON.stringify(state)};
}
const counts=(process.env.QA_EFFECTIVE_COUNTS||'40,80,120,180,300').split(',').map(Number);
assert(counts.every(n=>[40,80,120,180,300].includes(n)));
const rows=[];
for(const count of counts)for(const mirror of [false,true]){
  const seed=1337;const control=simulate(sim,count,seed,mirror);
  const measured=simulate(instrumented,count,seed,mirror);
  assert.equal(measured.final,control.final,'observer changed final combat state: '+count+' mirror '+mirror);
  assert.deepEqual(measured.observed,control.observed,'observer changed sampled combat trace: '+count+' mirror '+mirror);
  assert(measured.samples.length>0);
  const agg={snapshots:measured.samples.length,alive:0,proximityPairs:0,contactActors:0,
    activeTargets:0,nominalRange:0,rangedThreat:0,pursuit:0,closing:0,strikeActions:0,
    contactCells:new Set(),threatCells:new Set()};
  const byRole=Object.fromEntries(TYPES.map(t=>[t,zero()]));
  for(const s of measured.samples){const m=s.measure;agg.alive+=m.alive;agg.proximityPairs+=m.physicalPairs;agg.contactActors+=m.physicalActors;agg.activeTargets+=m.targeted;
    agg.nominalRange+=m.nominalInRange;agg.rangedThreat+=m.rangedThreat;agg.pursuit+=m.pursuit;agg.closing+=m.closing;agg.strikeActions+=m.strikeAction;
    for(const c of m.contactCells)agg.contactCells.add(c);for(const c of m.threatCells)agg.threatCells.add(c);
    for(const [type,fields] of Object.entries(m.roles))for(const key of Object.keys(fields))byRole[type][key]+=fields[key];
  }
  rows.push({count,mirror,seed,frames:measured.frames,lastTick:measured.tick,winner:measured.winner,
    exposureSamples:agg.snapshots,liveUnitSamples:agg.alive,contactPairSamples:agg.proximityPairs,
    physicalContactActorSamples:agg.contactActors,validTargetSamples:agg.activeTargets,
    nominalTargetRangeSamples:agg.nominalRange,rangedThreatSamples:agg.rangedThreat,
    pursuingSamples:agg.pursuit,closingSamples:agg.closing,strikeActionSamples:agg.strikeActions,
    positiveDamageEvents:measured.hits,damageByRole:measured.damageByRole,
    contactCells:[...agg.contactCells].sort(),threatCells:[...agg.threatCells].sort(),
    actualHitCells:measured.hitCells,uniqueDamagedAttackerTargetPairs:measured.uniqueHitPairs,
    roleExposure:byRole,exactCombatParity:true});
}
const receipt={status:'read-only QA observation; never a director candidate or phone FPS measurement',
  caveats:'Contact radius .12; nominal target reach is NOT validated shot/cone/hit; strike action is NOT proven damage; positive credited hurt() is actual damage. Incomplete battles are censored, not 0 lifetime engagement.',
  sampleCadence:'every 7 synthetic RAF callbacks plus final; 1x for >=180 fighters, 4x otherwise; mixed L1/L2/L4/L5; 2 mirrored setups',
  rows};
console.log('EFFECTIVE ENGAGEMENT '+JSON.stringify(receipt));
if(process.env.QA_EFFECTIVE_RECEIPT)fs.writeFileSync(process.env.QA_EFFECTIVE_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log('PASS: ranged influence/pursuit distinguished from physical proximity; fighter damage attributed; exact final+sampled state parity');
