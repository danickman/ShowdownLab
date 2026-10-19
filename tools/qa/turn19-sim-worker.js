/* Turn19 SOURCE-ONLY classic-worker simulation; NEVER promoted without QA. */
'use strict';
self.window=self;
self.requestAnimationFrame=(cb)=>self.setTimeout(()=>cb(performance.now()),16);
self.cancelAnimationFrame=id=>self.clearTimeout(id);
importScripts('/v3/evolution-rules.js?v=draft-cap6','/v3/ultimate-abilities.js?v=beetank-hammer-anvil4','/v3/legacy-sim-core.js?v=doubleko1');
let currentEpoch=0, awaitingAck=false,lastSnapshotSent=-Infinity,delivered=0;
self.onmessage=e=>{
 const m=e.data||{};
 try{
  if(m.type==='init'){
   currentEpoch=m.epoch;
   awaitingAck=false;lastSnapshotSent=-Infinity;delivered=0;
   LegacySimCore.configure({seed:m.seed,speed:m.speed,onState:s=>{
    const now=performance.now(),terminal=!!s.winner||s.running===false;
    if(awaitingAck&&!terminal)return;
    if(!terminal&&now-lastSnapshotSent<180)return;
    awaitingAck=true;lastSnapshotSent=now;delivered++;
    self.postMessage({type:'state',epoch:currentEpoch,snapshot:s,delivery:delivered});
   }});
  }else if(m.epoch!==currentEpoch)return;
  else if(m.type==='ack')awaitingAck=false;
  else if(m.type==='deploy')LegacySimCore.deploy(m.blue,m.red);
  else if(m.type==='running')LegacySimCore.setRunning(m.value);
  else if(m.type==='pause')LegacySimCore.pause();
  else if(m.type==='speed')LegacySimCore.setSpeed(m.value);
  else if(m.type==='spell')self.postMessage({type:'spell',epoch:currentEpoch,spell:m.spell,power:m.power,result:LegacySimCore.castSpell(m.spell,m.team,m.power)});
 }catch(err){self.postMessage({type:'fatal',epoch:currentEpoch,message:String(err?.stack||err)})}
};
