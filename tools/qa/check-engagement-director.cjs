// QA-only experimental engagement director. No game runtime changes.
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,'v3',p+'.js'),'utf8');
const source=read('legacy-sim-core'),roles=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const hook='const dealt=Math.min(t.hp,dmg);',nearest='function nearest(u,preferBack=false){',score='s=d+Math.max(0,pressure-2)*.035';
function instrument(src){
 assert.equal(src.split(hook).length,2,'hurt hook must occur exactly once');
 return src.replace(hook,hook+"if(dealt>0&&a)window.__qaDamage.push({type:a.type,team:a.team,damage:dealt,x:t.x,y:t.y,tick});");
}
function directed(src){
 assert(src.includes(nearest)&&src.includes(score),'protected nearest anchors moved');
 const intentCode=`
 // Prototype only. Rebuild a *small set* of observed opposing-contact centers
 // every 12 logical ticks, not fixed preselected lanes or squads.
 let qaIntentEpoch=-1,qaIntentCenters=[],qaIntentAssignments=new Map();
 const qaDirectable=new Set(['knight','barbarian','beetank','turtle']);
 function qaRefreshIntent(){
   const epoch=Math.floor(tick/12);
   if(epoch===qaIntentEpoch)return;
   qaIntentEpoch=epoch;qaIntentCenters=[];qaIntentAssignments.clear();
   const blue=units.filter(u=>u.hp>0&&u.team==='blue'&&u.burrow<=0);
   const red=units.filter(u=>u.hp>0&&u.team==='red'&&u.burrow<=0);
   // Opposed pairs are observable local threats; no hand-assigned battle zones.
   const observations=[];
   for(const a of blue)for(const b of red){
     const dx=a.x-b.x,dy=a.y-b.y;
     if(dx*dx+dy*dy>.28*.28)continue;
     observations.push({x:(a.x+b.x)*.5,y:(a.y+b.y)*.5});
   }
   // Spatial binning groups repeated contact-pair reports into soft local objectives.
   const buckets=new Map();
   for(const p of observations){const key=Math.floor(p.x/.13)+':'+Math.floor(p.y/.13);
     const v=buckets.get(key)||{x:0,y:0,n:0};v.x+=p.x;v.y+=p.y;v.n++;buckets.set(key,v)}
   qaIntentCenters=[...buckets.values()].filter(v=>v.n>=2).map(v=>({x:v.x/v.n,y:v.y/v.n,n:v.n}));
   for(const u of units){if(u.hp<=0||!qaDirectable.has(u.type))continue;
     let best=null,dist=.24;
     for(const p of qaIntentCenters){const d=Math.hypot(u.x-p.x,u.y-p.y);if(d<dist){dist=d;best=p}}
     if(best)qaIntentAssignments.set(u.id,best);
   }
 }
 `;
 let out=src.replace(nearest,intentCode+nearest+'qaRefreshIntent();');
 // Bounded opportunity cost; never punish a unit far from its local center.
 const replacement="s=d+Math.max(0,pressure-2)*.035+((!preferBack&&qaIntentAssignments.has(u.id))?Math.min(.027,Math.max(0,Math.hypot(v.x-qaIntentAssignments.get(u.id).x,v.y-qaIntentAssignments.get(u.id).y)-.13)*.13):0)";
 assert(out.includes(score),'score anchor missing after director injection');
 out=out.replace(score,replacement);
 return out;
}
const variants=[['control',instrument(source)],['soft-engagement',instrument(directed(source))]];
const counts=(process.env.QA_ENGAGEMENT_COUNTS||'40,80').split(',').map(Number);
const seeds=(process.env.QA_ENGAGEMENT_SEEDS||'1337').split(',').map(Number);
assert(counts.every(n=>Number.isInteger(n)&&n>=10&&n<=180&&n%2===0));
assert(seeds.length>0&&seeds.every(Number.isSafeInteger));
function simulate(code,count,seed,mirror){
 let now=0,next=0,callbacks=new Map(),errors=[];
 const env={window:null,Math,performance:{now:()=>now},
  requestAnimationFrame(fn){const id=++next;callbacks.set(id,fn);return id},
  cancelAnimationFrame(id){callbacks.delete(id)},
  console:{error:(...a)=>errors.push(a.join(' '))},CustomEvent:class{},dispatchEvent(){}};
 env.window=env;env.__qaDamage=[];vm.createContext(env);
 for(const n of ['evolution-rules','ultimate-abilities'])vm.runInContext(read(n),env);
 vm.runInContext(code,env);
 const core=env.LegacySimCore;
 const roster=side=>Array.from({length:count/2},(_,i)=>({
  type:roles[(i*3+((mirror?side==='blue':side==='red')?5:0))%roles.length],
  level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
 core.configure({seed,speed:10});core.deploy(roster('blue'),roster('red'));
 const initial=core.getState().units.map(u=>({id:u.id,type:u.type,team:u.team}));
 const switches={count:0,last:new Map()};let sampled=0,frames=0,peak=0,firstDamageAt=null;
 core.setRunning(true);
 const start=process.hrtime.bigint();
 for(let f=0;f<600;f++){
  frames=f+1;now+=16.667;
  const jobs=[...callbacks.values()];callbacks.clear();for(const cb of jobs)cb(now);
  const state=core.getState(),alive=state.units.filter(u=>u.hp>0);
  peak=Math.max(peak,alive.length);
  if(firstDamageAt===null&&env.__qaDamage.length)firstDamageAt=f+1;
  if(f%5===4){sampled++;
   for(const u of alive){const k=u.id,v=switches.last.get(k);
    if(v!=null&&u.target!=null&&v!==u.target)switches.count++;switches.last.set(k,u.target)}
  }
  if(state.winner)break;
 }
 const elapsedMs=Number(process.hrtime.bigint()-start)/1e6,state=core.getState();
 assert.deepEqual(errors,[],errors.join('; '));
 assert(state.winner,'battle must terminate');
 const byRole=Object.fromEntries(roles.map(r=>[r,{deployed:0,alive:0,hits:0,damage:0}]));
 for(const u of initial)byRole[u.type].deployed++;
 for(const u of state.units)if(u.hp>0)byRole[u.type].alive++;
 const hitCells=new Set();
 for(const h of env.__qaDamage){byRole[h.type].hits++;byRole[h.type].damage+=h.damage;
  hitCells.add(Math.floor(h.x*6)+':'+Math.floor(h.y*6))}
 return{winner:state.winner,frames,simTicks:state.tick,elapsedMs:Math.round(elapsedMs),
  firstDamageAt,sampled,targetSwitches:switches.count,hits:env.__qaDamage.length,
  occupiedHitCells:hitCells.size,byRole};
}
const rows=[];
for(const count of counts)for(const seed of seeds)for(const mirror of [false,true]){
 const pair={count,seed,mirror,versions:{}};
 for(const [key,code]of variants)pair.versions[key]=simulate(code,count,seed,mirror);
 rows.push(pair);
}
for(const key of variants.map(v=>v[0])){
 const cases=rows.map(r=>r.versions[key]),sum=(fn)=>cases.reduce((n,v)=>n+fn(v),0);
 const rolesSummary=Object.fromEntries(roles.map(t=>[t,{
  hits:sum(v=>v.byRole[t].hits),damage:Math.round(sum(v=>v.byRole[t].damage)),
  survivors:sum(v=>v.byRole[t].alive),deployed:sum(v=>v.byRole[t].deployed)
 }]));
 console.log('ENGAGEMENT SPIKE '+key+' '+JSON.stringify({
  cases:cases.length,terminated:cases.filter(v=>v.winner).length,
  meanFrames:sum(v=>v.frames)/cases.length,meanHitCells:sum(v=>v.occupiedHitCells)/cases.length,
  totalHits:sum(v=>v.hits),meanSwitches:sum(v=>v.targetSwitches)/cases.length,
  wallMs:sum(v=>v.elapsedMs),roles:rolesSummary
 }));
}
console.log('ENGAGEMENT SPIKE PAIRS '+JSON.stringify(rows.map(r=>({count:r.count,seed:r.seed,mirror:r.mirror,
 control:r.versions.control.winner,candidate:r.versions['soft-engagement'].winner,
 frameDelta:r.versions['soft-engagement'].frames-r.versions.control.frames}))));
if(process.env.QA_ENGAGEMENT_RECEIPT)fs.writeFileSync(process.env.QA_ENGAGEMENT_RECEIPT,JSON.stringify({rows},null,2));
console.log('PASS: soft engagement spike tested against unchanged live-core geometry; QA only');
