'use strict';
// True Mole eruption telemetry: sampled comic effects must reflect executed
// burrow eruptions, not a guessed special reset or fictional hit/target.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const source=read('v3/legacy-sim-core.js'),renderer=read('v3/v3.js');
const oldAttack="u.action='erupt';hit(u,mt,1.7);",newAttack="u.action='erupt';u.eruptTick=tick;hit(u,mt,1.7);";
assert.equal(source.split(newAttack).length,2,'real Mole eruption statement changed; re-evaluate cue source');
const prior=source.replace(newAttack,oldAttack);
const observed=source.replace(newAttack,"u.action='erupt';u.eruptTick=tick;window.__qaErupt({tick,id:u.id});hit(u,mt,1.7);");
const begin=renderer.indexOf('function moleEruptionOccurred('),end=renderer.indexOf('function spawnFX(next){',begin);
assert(begin>0&&end>begin,'Mole eruption renderer helper missing');
const detected=vm.runInNewContext(renderer.slice(begin,end)+';moleEruptionOccurred',{Number});
assert(detected({eruptTick:3},{type:'mole',eruptTick:5}));
assert(!detected({eruptTick:5},{type:'mole',eruptTick:5}));
assert(!detected({eruptTick:3},{type:'knight',eruptTick:5}));
assert(!detected(null,{type:'mole',eruptTick:undefined}));
assert(!detected({eruptTick:1},{type:'mole',eruptTick:NaN}));
const cueStart=renderer.indexOf('if(u.hp>0&&moleEruptionOccurred(old,u)'),cueEnd=renderer.indexOf('if(u.hp>0&&turtleSlamOccurred(old,u)',cueStart);
assert(cueStart>0&&cueEnd>cueStart,'Mole actual-event recovery placement moved');
const cue=renderer.slice(cueStart,cueEnd);
for(const need of ["!(u.action==='erupt'&&old.action!==u.action)","density<=48","kind:'erupt'","kind:'dustkick'","density<28","density<18","'KRAK!'","prefers-reduced-motion","f.kind==='erupt'&&now-f.t<280"])assert(cue.includes(need),'required true-event/density guard missing: '+need);
for(const forbidden of ["u.hp=","mt.hp=","hit(","kind:'shot'","kind:'koBurst'","kind:'earthImpact'","shake=","flash="])assert(!cue.includes(forbidden),'no invented damage, hit or camera jolt '+forbidden);
assert(renderer.includes('shellSlamTick:u.shellSlamTick,eruptTick:u.eruptTick'),'renderer previous event state must persist');
const A=['mole','mole','knight','mole','dragon','goblin','mole','turtle','mole','goose'];
const B=['knight','beetank','goblin','sniper','turtle','dragon','knight','goose','barbarian','mole'];
function run(script,{count,speed,mirror,seed},audit=false){
 let window={},now=0,next=0,q=new Map(),calls=[],prev=null,stats={actual:0,action:0,stamp:0,miss:0,falsePos:0,windows:0};
 const digest=crypto.createHash('sha256'),raf=fn=>{const k=++next;q.set(k,fn);return k};
 window.__qaErupt=x=>calls.push(x);
 for(const js of ['v3/evolution-rules.js','v3/ultimate-abilities.js',script]){
  const code=js.endsWith('.js')?read(js):js;
  new Function('window','performance','requestAnimationFrame','cancelAnimationFrame',code)(window,{now:()=>now},raf,i=>q.delete(i));
 }
 const roster=side=>Array.from({length:count/2},(_,i)=>({type:(mirror?(side==='blue'?B:A):(side==='blue'?A:B))[i%10],level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
 const sim=window.LegacySimCore;
 sim.configure({seed,speed,onState:s=>{
  const without={...s,units:s.units.map(u=>{const copy={...u};delete copy.eruptTick;return copy;})};
  digest.update(JSON.stringify(without)+'\n');
  if(prev&&audit){
   const earlier=new Map(prev.units.map(u=>[u.id,u])),events=new Set(calls.filter(h=>h.tick>prev.tick&&h.tick<=s.tick).map(h=>h.id));
   const visible=new Set(),stamped=new Set();
   for(const u of s.units){const old=earlier.get(u.id);if(!old||u.hp<=0||u.type!=='mole')continue;
    if(u.action==='erupt'&&u.action!==old.action)visible.add(u.id);
    if(detected(old,u))stamped.add(u.id);
   }
   stats.actual+=events.size;stats.action+=[...events].filter(id=>visible.has(id)).length;
   stats.stamp+=[...events].filter(id=>stamped.has(id)).length;
   stats.miss+=[...events].filter(id=>!stamped.has(id)).length;
   stats.falsePos+=[...stamped].filter(id=>!events.has(id)).length;stats.windows++;
  }
  prev=s;
 }});
 sim.deploy(roster('blue'),roster('red'));sim.setRunning(true);
 for(let i=0;i<(count===80?160:220);i++){
  now+=16.667;const work=[...q.values()];q.clear();for(const fn of work)fn(now);
  if(sim.getState().winner)break;
 }
 return{...stats,digest:digest.digest('hex'),tick:sim.getState().tick};
}
const smoke={count:40,speed:10,mirror:true,seed:1337};
assert.equal(run(prior,smoke).digest,run(source,smoke).digest,'new Mole telemetry changed physical combat');
assert.equal(run(source,smoke).digest,run(observed,smoke,true).digest,'observation hook changed physical combat');
const rows=[];
for(const count of [20,40,80])for(const speed of [1,4,10])for(const mirror of [false,true]){
 const cfg={count,speed,mirror,seed:1337},a=run(prior,cfg),z=run(observed,cfg,true);
 assert.equal(a.digest,z.digest,'Mole telemetry altered actual battle '+JSON.stringify(cfg));
 assert.equal(z.falsePos,0,'Mole erupted on visual cue without actual event '+JSON.stringify(cfg));
 rows.push({...cfg,actual:z.actual,action:z.action,stamped:z.stamp,missed:z.miss,falsePos:z.falsePos});
 console.log('MOLE ERUPTION CASE '+JSON.stringify(rows[rows.length-1]));
}
const fold=arr=>arr.reduce((o,r)=>{for(const k of ['actual','action','stamped','missed','falsePos'])o[k]=(o[k]||0)+r[k];return o},{});
const total=fold(rows),rapid=fold(rows.filter(r=>r.speed===10));
assert(total.actual>=500,'Mole study has insufficient genuine eruption events');
assert(total.stamped>total.action*6,'Mole stamp not enough better than transient action');
assert(total.stamped>=total.actual*.90,'Mole event stamp recovery rate below .90');
const report={status:'QA Mole true eruption VFX, no physical combat change',total,rapid,rows,physicalCombatParity:true,
 caveats:'Detected real attempted eruptions, not guaranteed damage or a strike against a particular target. Events may be lost if shooter dies between snapshots. No new hit, target, knockback or damage visual inferred. 48-unit VFX cap and existing FX max protect high density.'};
if(process.env.QA_MOLE_RECEIPT)fs.writeFileSync(process.env.QA_MOLE_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('MOLE ERUPTION CUE SUMMARY '+JSON.stringify({total,rapid,physicalCombatParity:true}));
console.log('PASS: exact true Mole eruptions, no phantom FX and identical battle-state traces');
