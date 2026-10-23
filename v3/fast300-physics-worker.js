/* QA-integrated optimized extreme-density physical combat Worker. */
'use strict';
self.window=self;
// Unlike independent worker timers, the REAL main-thread RAF drives the
// worker's next original-core callback, with at most one in flight.
// The engine still executes its original unmodified frame(now)/step() code.
let scheduled=null,frameId=0,scheduledId=0;
self.requestAnimationFrame=cb=>{scheduled=cb;scheduledId=++frameId;return scheduledId};
self.cancelAnimationFrame=id=>{if(id===scheduledId)scheduled=null};
importScripts('/v3/evolution-rules.js?v=draft-cap6','/v3/ultimate-abilities.js?v=goblin-earned-rabble1','/v3/legacy-sim-core.js?v=fast300-exact1');
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
    self.postMessage({type:'state',epoch:currentEpoch,snapshot:s,delivery:delivered,physicalStats:self.__fast300PhysicalStats||null});
   }});
  }else if(m.epoch!==currentEpoch)return;
  else if(m.type==='frame'){
    const fn=scheduled;scheduled=null;
    if(fn)fn(performance.now());
    self.postMessage({type:'ready',epoch:currentEpoch});
  }
  else if(m.type==='ack')awaitingAck=false;
  else if(m.type==='deploy')LegacySimCore.deploy(m.blue,m.red);
  else if(m.type==='running')LegacySimCore.setRunning(m.value);
  else if(m.type==='pause')LegacySimCore.pause();
  else if(m.type==='speed')LegacySimCore.setSpeed(m.value);
  else if(m.type==='spell')self.postMessage({type:'spell',epoch:currentEpoch,spell:m.spell,power:m.power,result:LegacySimCore.castSpell(m.spell,m.team,m.power)});
  if(m.type==='init'||m.type==='running')self.postMessage({type:'ready',epoch:currentEpoch});
 }catch(err){self.postMessage({type:'fatal',epoch:currentEpoch,message:String(err?.stack||err)})}
};
