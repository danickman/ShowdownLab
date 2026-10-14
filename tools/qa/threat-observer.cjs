// Read-only QA policy research. Not imported by the game or service worker.
'use strict';
const ATTACKERS=new Set(['sniper','assassin','beetank','goblin']);
const HEAVIES=new Set(['knight','beetank','turtle','dragon','barbarian']);
const CLOSE_ATTACK=new Set(['knight','beetank','turtle','barbarian','goblin','goose','mole','assassin']);
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const finite=(v,def=0)=>Number.isFinite(v)?v:def;
const distance=(a,b)=>Math.hypot(finite(a.x)-finite(b.x),finite(a.y)-finite(b.y));
const threat=(enemy,friends)=>{
 // Short-horizon, approximate *potential* harm, not actual future damage.
 const attack=finite(enemy.dmg,0)*30/Math.max(12,finite(enemy.cd,40));
 const close=friends.filter(a=>distance(a,enemy)<Math.max(.12,finite(enemy.range,30)/500+.045)).length;
 const aoe=enemy.type==='dragon'?1+.38*Math.min(3,close):
   ['barbarian','beetank','goose'].includes(enemy.type)?1+.18*Math.min(3,close):1;
 const capable=(enemy.stun||0)>0?.65:1;
 return attack*aoe*capable;
};
function observe(state,previous=null){
 const units=Array.isArray(state)?state:(state.units||[]),tick=Array.isArray(state)?0:finite(state.tick);
 const prevUnits=Array.isArray(previous)?previous:(previous?.units||[]);
 const prevById=new Map(prevUnits.map(u=>[u.id,u]));
 const dt=Math.max(1,tick-finite(previous?.tick,tick-12));
 const alive=units.filter(u=>u.hp>0&&Number.isFinite(u.x)&&Number.isFinite(u.y));
 const byTeam={blue:[],red:[]};
 for(const u of alive)if(byTeam[u.team])byTeam[u.team].push(u);
 const decisions=[],scans={candidates:0,packComparisons:0,threatComparisons:0};
 for(const u of alive){
  if(!ATTACKERS.has(u.type))continue;
  const foes=byTeam[u.team==='blue'?'red':'blue'];
  const friends=byTeam[u.team]||[];
  if(!foes.length)continue;
  const maxReach=u.type==='sniper'?Math.max(.10,finite(u.range,195)/500):
   u.type==='assassin'?((u.special||0)<=0?.70:.43):
   u.type==='beetank'?.31:.18;
  const candidates=foes.map(v=>({v,d:distance(u,v)})).filter(q=>q.d<=maxReach&&!(q.v.burrow>0));
  if(!candidates.length)continue;
  candidates.sort((a,b)=>a.d-b.d||a.v.id-b.v.id);
  // Capped candidate set; distant high-value targets cannot monopolize tactical thought.
  const short=candidates.slice(0,8);
  const ranked=short.map(({v,d})=>{
   scans.candidates++;
   let danger=threat(v,friends);
   let score=danger*.38-d*5;
   const note={danger:+danger.toFixed(3)};
   if(u.type==='assassin'){
    const back=v.type==='sniper'||v.type==='dragon';
    const vulnerable=v.hp/v.maxHp<.6;
    score+=back?2.7:0;
    score+=vulnerable?1.2:0;
    score-=d*2.2;
    note.backline=back;
   }
   if(u.type==='beetank'){
    score+=HEAVIES.has(v.type)?1.7:0;
    score+=v.type==='dragon'?.65:0;
    // Protect escort if its backline is facing imminent melee.
    if(CLOSE_ATTACK.has(v.type)&&friends.some(a=>a.type==='sniper'&&distance(a,v)<.12))score+=4;
    note.heavy=HEAVIES.has(v.type);
   }
   if(u.type==='goblin'){
    const pack=friends.filter(a=>a.type==='goblin'&&distance(a,u)<=.11);
    const arriving=pack.filter(a=>distance(a,v)<.19).length;
    const guards=foes.filter(e=>e.id!==v.id&&distance(e,v)<.10).length;
    scans.packComparisons+=friends.length+foes.length;
    const isolated=guards===0;
    score+=HEAVIES.has(v.type)&&arriving>=3&&isolated?3.5:0;
    score+=v.type==='goblin'&&friends.some(a=>a.type==='sniper'&&distance(v,a)<.14)?5:0;
    score-=v.type==='dragon'&&arriving>=3?2:0; // Recognize AoE exposure, not immunity.
    note.pack=arriving;note.isolated=isolated;
   }
   scans.threatComparisons+=friends.length;
   return{targetId:v.id,targetType:v.type,score,distance:d,note};
  });
  ranked.sort((a,b)=>b.score-a.score||a.distance-b.distance||a.targetId-b.targetId);
  let choice=ranked[0],urgent=false,reason='feasible-threat-role';
  if(u.type==='sniper'){
    const danger=short.filter(q=>CLOSE_ATTACK.has(q.v.type)).map(({v,d})=>{
      const old=prevById.get(v.id),previousDistance=old?distance(u,old):d;
      const closing=(previousDistance-d)/dt;
      const activeCharge=['charge','ram','rage_charge','rush'].includes(v.action);
      const estimatedClosing=Math.max(0,closing,activeCharge?finite(v.spd,1)*1.3/1200:0);
      const eta=estimatedClosing>0?Math.max(0,d-.055)/estimatedClosing:Infinity;
      const response=Math.max(12,finite(u.aimTicks,27)-(u.aim||0))+
        Math.max(0,finite(u.cooldown,0))+22;
      const groupThreat=friends.some(a=>a!==u&&distance(a,u)<.12&&distance(a,v)<.19);
      return{v,d,eta,response,groupThreat,closing};
    }).filter(q=>q.d<.19&&q.closing>0&&q.eta<=q.response*1.35)
      .sort((a,b)=>a.eta-b.eta||a.v.id-b.v.id);
    if(danger.length){
      const q=danger[0];
      const selection=ranked.find(x=>x.targetId===q.v.id);
      if(selection){choice=selection;urgent=true;reason=q.groupThreat?'protect-ranged-group':'imminent-self-threat'}
    }
  }else if(u.type==='goblin'){
    if(choice.note?.pack>=3&&HEAVIES.has(choice.targetType)&&choice.note.isolated)
      reason='coordinated-pack-opportunity';
    else if(choice.targetType==='goblin'&&friends.some(a=>a.type==='sniper'&&distance(a,foes.find(v=>v.id===choice.targetId))<.14))
      reason='counter-hostile-swarm';
  }else if(u.type==='beetank'&&HEAVIES.has(choice.targetType))reason='heavy-disruption-opportunity';
  else if(u.type==='assassin'&&choice.note.backline)reason='backline-execution-opportunity';
  decisions.push({actorId:u.id,actorType:u.type,team:u.team,currentTarget:u.target??null,
   suggestedTarget:choice.targetId,targetType:choice.targetType,reason,urgent,
   score:+choice.score.toFixed(3),distance:+choice.distance.toFixed(3),options:ranked.length});
 }
 decisions.sort((a,b)=>a.actorId-b.actorId);
 return{tick,decisions,scans};
}
module.exports={observe,distance,threat};
