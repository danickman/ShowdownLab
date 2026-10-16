(()=>{'use strict';
const rank=u=>!u||window.ShowdownEvolution.normalize(u.level)<4?0:window.ShowdownEvolution.normalize(u.level)===5?2:1;
const specs={
 knight:{name:'Bastion',l4:'Nearby allies take 20% less damage within a short radius.',l5:'Protection rises to 30% with a wider radius.'},
 sniper:{name:'Piercing Verdict',l4:'Rifle shots ignore 60% of armor and pierce one enemy behind the target for 55% damage.',l5:'Shots ignore all armor; the piercing hit deals 80% damage.'},
 dragon:{name:'Inferno',l4:'Breath ignites targets for another 45% attack damage over 3 seconds.',l5:'Burn damage rises to 75% of attack damage.'},
 assassin:{name:'Execution',l4:'Backstabs deal 80% extra damage to enemies below 40% health.',l5:'120% extra damage to enemies below 55% health.'},
 beetank:{name:'Seismic Ram',l4:'Rams and every third horn strike splash 35% damage and stun nearby enemies for 0.4 seconds.',l5:'Every second horn strike splashes 55% damage; wider radius and 0.67-second stun.'},
 mole:{name:'Nuclear Carapace',l4:'Ignore 35% of incoming damage, ranged or melee.',l5:'Ignore 50% of incoming damage.'},
 turtle:{name:'Ricochet Shell',l4:'Ricochet Shell reflects 30% of actual damage taken from attackers within 0.10 arena units.',l5:'Reflect 45% of actual damage taken within 0.10 arena units.'},
 goblin:{name:'Pack Ambush',l4:'Gain 20% damage per nearby allied Goblin, up to three allies.',l5:'Gain 30% damage per nearby allied Goblin, up to four allies.'},
 barbarian:{name:'Blood Cleave',l4:'Axe swings splash 40% damage onto up to three nearby enemies.',l5:'Wider cleave splashes 65% damage onto up to five enemies.'},
 goose:{name:'Thunder Honk',l4:'Thunder Honk deals 45% attack damage and stuns enemies for 44 ticks (about 0.73 seconds).',l5:'75% attack damage, wider radius and 64-tick stun (about 1.07 seconds).'}
};
const near=(a,b,r)=>Math.hypot(a.x-b.x,a.y-b.y)<=r;
function cue(u,kind,tick,target){if(tick-(u.ultimateTick??-1000)<12)return;u.ultimateTick=tick;u.ultimateKind=kind;u.ultimateTarget=target?.id??null}
function armor(t,a){return (t.armor||0)*(rank(a)&&a.type==='sniper'&&a.action==='attack'?(rank(a)===2?0:.4):1)}
function outgoing(a,t,damage,units,tick){
 const r=rank(a);if(!r)return damage;
 if(a.type==='assassin'&&a.action==='backstab'&&t.hp/t.maxHp<(r===2?.55:.4)){cue(a,'execution',tick,t);return damage*(r===2?2.2:1.8)}
 if(a.type==='goblin'){const count=Math.min(r===2?4:3,units.filter(u=>u!==a&&u.team===a.team&&u.type==='goblin'&&u.hp>0&&near(u,a,.10)).length);if(count){cue(a,'pack',tick,t);return damage*(1+count*(r===2?.3:.2))}}
 return damage;
}
function incoming(t,damage,units,tick,bastions=units){
 if(rank(t)&&t.type==='mole'){damage*=rank(t)===2?.5:.65;cue(t,'carapace',tick)}
 let protection=0,protector=null;
 for(const u of bastions)if(u.team===t.team&&u.hp>0&&u.type==='knight'&&rank(u)&&near(u,t,rank(u)===2?.12:.09)){
  const strength=rank(u)===2?.3:.2;if(strength>protection){protection=strength;protector=u}
 }
 if(protection){damage*=1-protection;cue(protector,'bastion',tick,t)}
 return damage;
}
function afterHit(a,t,dealt,units,tick){
 const hits=[],r=rank(a);
 if(rank(t)&&t.type==='turtle'&&a&&a.hp>0&&near(a,t,.10)&&dealt>0){hits.push({target:a,source:null,damage:dealt*(rank(t)===2?.45:.3)});cue(t,'reflect',tick,a)}
 if(!r||!['sniper','dragon','beetank','barbarian'].includes(a.type))return hits;
 const enemies=units.filter(v=>v!==t&&v.team!==a.team&&v.hp>0&&v.burrow<=0);
 if(a.type==='sniper'&&a.action==='attack'){
  const dx=t.x-a.x,dy=t.y-a.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
  const victim=enemies.map(v=>({v,forward:(v.x-a.x)*ux+(v.y-a.y)*uy,side:Math.abs((v.x-a.x)*uy-(v.y-a.y)*ux)}))
   .filter(p=>p.forward>len+.005&&p.forward<len+.18&&p.side<.035).sort((x,y)=>x.forward-y.forward||x.v.id-y.v.id)[0]?.v;
  if(victim)hits.push({target:victim,source:a,damage:a.dmg*(r===2?.8:.55)});cue(a,'pierce',tick,victim||t);
 }
 if(a.type==='dragon'&&a.action==='fire'&&t.hp>0){t.burnTicks=90;t.burnPower=a.dmg*(r===2?.125:.075);t.burnTeam=a.team;cue(a,'inferno',tick,t)}
 if(a.type==='beetank'&&['ram','horn'].includes(a.action)){
  a.ultimateHits=(a.ultimateHits||0)+1;
  if(a.action==='ram'||a.ultimateHits%(r===2?2:3)===0){for(const v of enemies.filter(v=>near(v,t,r===2?.14:.11))){v.stun=Math.max(v.stun,r===2?20:12);hits.push({target:v,source:a,damage:a.dmg*(r===2?.55:.35)})}cue(a,'seismic',tick,t)}
 }
 if(a.type==='barbarian'&&['axe_swing','rage_swing'].includes(a.action)){
  const targets=enemies.filter(v=>near(v,t,r===2?.09:.065)).sort((x,y)=>Math.hypot(x.x-t.x,x.y-t.y)-Math.hypot(y.x-t.x,y.y-t.y)||x.id-y.id).slice(0,r===2?5:3);
  for(const v of targets)hits.push({target:v,source:a,damage:a.dmg*(r===2?.65:.4)});if(targets.length)cue(a,'cleave',tick,t);
 }
 return hits;
}
function honk(u,units,tick){
 const r=rank(u);if(!r)return [];
 const hits=units.filter(v=>v.team!==u.team&&v.hp>0&&v.burrow<=0&&near(v,u,r===2?.22:.18)).map(v=>{v.stun=Math.max(v.stun,r===2?64:44);return{target:v,source:u,damage:u.dmg*(r===2?.75:.45)}});
 if(hits.length)cue(u,'thunder',tick,hits[0].target);return hits;
}
function burn(u){if(!(u.burnTicks>0)||u.hp<=0)return 0;u.burnTicks--;return u.burrow>0?0:u.burnTicks%15===0?u.burnPower:0}
window.ShowdownUltimates=Object.freeze({rank,specs,armor,outgoing,incoming,afterHit,honk,burn});
})();
