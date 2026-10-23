/* RAF-clock classic worker bridge, research-only. No playable PWA mutation. */
(()=>{'use strict';
if(typeof Worker!=='function'||!window.LegacySimCore)return;
const inline=window.LegacySimCore;
const WORKER_PATH='/v3/fast300-physics-worker.js?v=fast300-thread1',THRESHOLD=159;
let worker=null,epoch=0,queuedFrame=0,callback=()=>{},settings={seed:1337,speed:1},running=false,last=null,rosters=null,hardError=null;
const stats={mode:'inline',messages:0,workerSnapshots:0,workerTicks:0,workerDamage:0,errors:[],rollbacks:0};
window.__showdownThreadStats=stats;
function retire(){if(queuedFrame){cancelAnimationFrame(queuedFrame);queuedFrame=0}if(worker){worker.terminate();worker=null}running=false;last=null;stats.mode='inline'}
function send(type,data={}){if(worker)worker.postMessage({type,epoch,...data})}
function invokeFallback(message){
 stats.errors.push(message);hardError=message;
 if(!worker)return;
 const data=rosters,wasRunning=running;
 retire();stats.rollbacks++;
 if(!data)return;
 inline.configure({...settings,onState:callback});
 inline.deploy(data.blue,data.red);
 inline.setSpeed(settings.speed);
 inline.setRunning(wasRunning);
}
function startWorker(blue,red){
 const w=new Worker(WORKER_PATH);
 epoch++;worker=w;hardError=null;running=false;
 stats.mode='worker';stats.workerSnapshots=0;stats.workerTicks=0;stats.workerDamage=0;
 w.onmessage=e=>{
  const m=e.data;if(!worker||w!==worker||m.epoch!==epoch)return;stats.messages++;
  if(m.type==='ready'){
   if(!queuedFrame)queuedFrame=requestAnimationFrame(()=>{
     queuedFrame=0;if(worker===w)send('frame');
   });
   return;
  }
  if(m.type==='fatal'){invokeFallback(m.message);return}
  if(m.type==='spell'){
   if(m.result?.ok)window.dispatchEvent(new CustomEvent('showdown:spell',{detail:{spell:m.spell,power:m.power,...m.result}}));
   return;
  }
  if(m.type!=='state')return;
  last=m.snapshot;stats.physicalStats=m.physicalStats;stats.workerSnapshots++;stats.workerTicks=last.tick;
  stats.workerDamage=last.units.reduce((s,u)=>s+Math.max(0,u.maxHp-u.hp),0);
  try{callback(last)}catch(err){console.error('[worker bridge] state subscriber',err)}
  // Acknowledge only after all adapter listeners and state clone operations finish.
  send('ack');
 };
 w.onerror=e=>{invokeFallback('worker runtime error: '+e.message)};
 send('init',{seed:settings.seed,speed:settings.speed});
 send('deploy',{blue,red});
}
window.LegacySimCore={
 configure(o={}){
  settings={...settings,...Object.fromEntries(Object.entries(o).filter(([key])=>key!=='onState'))};
  if(typeof o.onState==='function')callback=o.onState;
  inline.configure({...o,onState:callback});
  if(worker){send('speed',{value:settings.speed})}
 },
 deploy(blue,red){
  const count=blue.length+red.length;rosters={blue,red};
  if(count>THRESHOLD){
   inline.setRunning(false);retire();
   try{startWorker(blue,red)}catch(err){stats.errors.push('spawn: '+String(err));retire();inline.deploy(blue,red)}
  }else{retire();inline.deploy(blue,red)}
 },
 setRunning(value){
  running=!!value;
  if(worker)send('running',{value:running});else inline.setRunning(running);
 },
 pause(){
  if(worker){running=!running;send('pause');return running}
  running=inline.pause();return running;
 },
 setSpeed(value){
  settings.speed=[1,2,4,10].includes(+value)?+value:1;
  if(worker)send('speed',{value:settings.speed});else inline.setSpeed(value);
 },
 castSpell(spell,team='blue',power=1){
  if(worker){if(!running||!last?.units?.some(u=>u.hp>0))return{ok:false};send('spell',{spell,team,power});return{ok:true,pending:true}}
  return inline.castSpell(spell,team,power);
 },
 getState(){
  if(worker)return last?{...last,units:last.units.map(u=>({...u}))}:{tick:0,units:[],winner:null,running,speed:settings.speed};
  return inline.getState();
 }
};
})();
