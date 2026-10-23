/* QA-integrated extreme-density Worker bridge. Inline fallback below 160 bodies. */
(()=>{'use strict';
if(typeof Worker!=='function'||!window.LegacySimCore)return;
const inline=window.LegacySimCore;
const WORKER_PATH='/v3/fast300-physics-worker.js?v=fast300-thread1',THRESHOLD=159;
let worker=null,epoch=0,queuedFrame=0,callback=()=>{},suppressInline=false,workerDisabled=false,recoveryOverlay=null,settings={seed:1337,speed:1},running=false,last=null,rosters=null,hardError=null;
const stats={mode:'inline',messages:0,workerSnapshots:0,workerTicks:0,workerDamage:0,errors:[],rollbacks:0,recoveryStops:0,recoveryTick:0};
window.__showdownThreadStats=stats;
function retire(){if(queuedFrame){cancelAnimationFrame(queuedFrame);queuedFrame=0}if(worker){worker.terminate();worker=null}running=false;last=null;stats.mode='inline'}
function send(type,data={}){if(worker)worker.postMessage({type,epoch,...data})}
function forwardInline(snapshot){if(!suppressInline&&!worker)callback(snapshot)}
function clearRecovery(){if(recoveryOverlay){recoveryOverlay.remove();recoveryOverlay=null}}
function offerRoundRestart(message){
 if(typeof document==='undefined'||!document.body||recoveryOverlay)return;
 const overlay=document.createElement('section');recoveryOverlay=overlay;
 overlay.id='fast300-recovery';overlay.setAttribute('role','alertdialog');
 overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-labelledby','fast300-recovery-title');
 overlay.style.cssText='position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(16,35,43,.85);';
 const panel=document.createElement('div');panel.style.cssText='width:min(100%,420px);padding:24px;border:3px solid #35454d;border-radius:22px;background:#f8f5e7;color:#173039;text-align:center;box-shadow:0 24px 70px #0007;';
 const title=document.createElement('h2');title.id='fast300-recovery-title';title.textContent='Battle paused to protect progress';
 const copy=document.createElement('p');copy.textContent='The battle engine stopped at confirmed tick '+(last?.tick??0)+'. No winner or reward has been awarded. Restart this round in safe mode to continue playing.';
 const button=document.createElement('button');button.type='button';button.textContent='Restart round in safe mode';
 button.style.cssText='min-height:50px;width:100%;border:2px solid #173039;border-radius:14px;background:#f0c14b;color:#162a30;font-weight:800;font-size:16px;';
 button.addEventListener('click',()=>{const adapter=window.ShowdownAdapter;clearRecovery();if(adapter?.startBattle)adapter.startBattle({continueMatch:true,seed:settings.seed})});
 panel.appendChild(title);panel.appendChild(copy);panel.appendChild(button);overlay.appendChild(panel);document.body.appendChild(overlay);
 if(typeof button.focus==='function')button.focus();
 try{window.dispatchEvent(new CustomEvent('showdown:worker-failed',{detail:{tick:last?.tick??0,message}}))}catch{}
}
if(typeof window.addEventListener==='function')window.addEventListener('showdown:state',e=>{if(recoveryOverlay&&e.detail?.phase!=='battle')clearRecovery()});
function invokeFallback(message){
 if(!worker)return;
 stats.errors.push(message);hardError=message;
 const data=rosters,wasRunning=running,confirmed=last;
 retire();suppressInline=false;workerDisabled=true;
 // A post-progress crash must never silently redeploy armies at full HP.
 // Retain the last honest Worker snapshot and let the player authorize a
 // transparent restart; without checkpointed RNG a mid-round auto-resume
 // would invent outcomes and potentially award an unearned win.
 if(confirmed?.tick>0&&!confirmed.winner){
  last={...confirmed,running:false};running=false;stats.mode='recovery';
  stats.recoveryStops++;stats.recoveryTick=confirmed.tick;
  try{callback(last)}catch(err){console.error('[worker bridge] recovery snapshot',err)}
  offerRoundRestart(message);
  return;
 }
 if(confirmed?.winner){last=confirmed;stats.mode='terminal';return}
 if(!data)return;
 stats.rollbacks++;
 inline.configure({...settings,onState:forwardInline});
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
 w.onerror=e=>{if(worker===w)invokeFallback('worker runtime error: '+e.message)};
 send('init',{seed:settings.seed,speed:settings.speed});
 send('deploy',{blue,red});
}
window.LegacySimCore={
 configure(o={}){
  settings={...settings,...Object.fromEntries(Object.entries(o).filter(([key])=>key!=='onState'))};
  if(typeof o.onState==='function')callback=o.onState;
  inline.configure({...o,onState:forwardInline});
  if(worker){send('speed',{value:settings.speed})}
 },
 deploy(blue,red){
  clearRecovery();const count=blue.length+red.length;rosters={blue,red};
  if(count>THRESHOLD&&!workerDisabled){
   // Do not forward the outgoing inline battle's terminal setRunning(false) snapshot
   // into the NEW battle adapter callback. That could end a fresh Worker battle.
   suppressInline=true;inline.setRunning(false);retire();
   try{startWorker(blue,red)}catch(err){stats.errors.push('spawn: '+String(err));workerDisabled=true;retire();suppressInline=false;inline.deploy(blue,red)}
  }else{retire();suppressInline=false;inline.deploy(blue,red)}
 },
 setRunning(value){
  if(stats.mode==='recovery'||stats.mode==='terminal')return;
  running=!!value;
  if(worker)send('running',{value:running});else inline.setRunning(running);
 },
 pause(){
  if(stats.mode==='recovery'||stats.mode==='terminal')return false;
  if(worker){running=!running;send('pause');return running}
  running=inline.pause();return running;
 },
 setSpeed(value){
  settings.speed=[1,2,4,10].includes(+value)?+value:1;
  if(worker)send('speed',{value:settings.speed});else inline.setSpeed(value);
 },
 castSpell(spell,team='blue',power=1){
  if(stats.mode==='recovery'||stats.mode==='terminal')return{ok:false};
  if(worker){if(!running||!last?.units?.some(u=>u.hp>0))return{ok:false};send('spell',{spell,team,power});return{ok:true,pending:true}}
  return inline.castSpell(spell,team,power);
 },
 getState(){
  if(worker||stats.mode==='recovery'||stats.mode==='terminal')return last?{...last,units:last.units.map(u=>({...u}))}:{tick:0,units:[],winner:null,running,speed:settings.speed};
  return inline.getState();
 }
};
})();
