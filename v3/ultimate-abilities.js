(()=>{'use strict';
const rank=u=>!u||window.ShowdownEvolution.normalize(u.level)<4?0:window.ShowdownEvolution.normalize(u.level)===5?2:1;
const specs={
 knight:{name:'Bastion',l4:'Nearby allies take 20% less damage within a short radius.',l5:'Protection rises to 30% with a wider radius.'},
 sniper:{name:'Piercing Verdict',l4:'Rifle shots ignore 60% of armor and pierce one enemy behind the target for 55% damage.',l5:'Shots ignore all armor; the piercing hit deals 80% damage.'},
 dragon:{name:'Inferno',l4:'Breath ignites targets for another 45% attack damage over 3 seconds.',l5:'Burn damage rises to 75% of attack damage.'},
 assassin:{name:'Execution',l4:'Backstabs deal 80% extra damage to enemies below 40% health.',l5:'120% extra damage to enemies below 75% health.'},
 beetank:{name:'Seismic Ram',l4:'Rams and every third horn strike splash 35% damage and stun nearby enemies for 0.4 seconds.',l5:'Hammer & Anvil: real L5 horns or rams fracture Beetank, Turtle or Dragon for 96 ticks, adding 65% subsequent natural damage. Once per 100 ticks, two real follow-up hits gain another 35% damage; Seismic splash stays bounded.'},
 mole:{name:'Nuclear Carapace',l4:'Ignore 35% of incoming damage, ranged or melee.',l5:'Ignore 50% of incoming damage; after burrow eruptions, Twin Rift cracks forward to damage up to two additional foes for 62% attack damage with a brief stagger.'},
 turtle:{name:'Ricochet Shell',l4:'Reflect 30% of actual close-contact damage; nearby allies below 60% HP take 18% less damage within 0.12 arena units (no stacking).',l5:'Reflect 45% close-contact damage; guard wounded allies for 28% mitigation within 0.14. SHELL REBOUND: when struck in close combat, the Turtle (or a wounded ally it guards) triggers a 145% counterhit plus two 65% splash hits and brief stagger, once every 54 ticks.'},
 goblin:{name:'Pack Ambush',l4:'Gain 20% damage per nearby allied Goblin, up to three allies.',l5:'Pack Ambush grants 30% bonus damage per nearby Goblin (up to four). EARNED RABBLE: your first true landed stab calls up to two temporary L3 Goblins with 72% HP; at most four extra Goblins per team, never permanent.'},
 barbarian:{name:'Blood Cleave',l4:'Sweeping axe strikes splash 58% attack damage onto up to three nearby foes and stagger them for 8 ticks.',l5:'Blood Cleave still hits up to five foes for full axe damage. MEASURED CHARGE: approach 70% faster (95% in rage); your first physically landed axe strike hits harder and staggers its target for 8 ticks.'},
 goose:{name:'Impact Shockwave',l4:'Thunder Honk blasts up to five nearby foes, then sends a damaging echo into up to three more with only a brief stagger.',l5:'An ascended sonic crash hits up to six nearby foes and echoes into up to four more with powerful damage, without a long secondary stun.'}
};
const near=(a,b,r)=>Math.hypot(a.x-b.x,a.y-b.y)<=r;
function cue(u,kind,tick,target){if(tick-(u.ultimateTick??-1000)<12&&!(kind==='reprisal'&&['reflect','shelter'].includes(u.ultimateKind)))return;u.ultimateTick=tick;u.ultimateKind=kind;u.ultimateTarget=target?.id??null}
function armor(t,a){return (t.armor||0)*(rank(a)&&a.type==='sniper'&&a.action==='attack'?(rank(a)===2?0:.4):1)}
function outgoing(a,t,damage,units,tick){
 const r=rank(a);if(!r)return damage;
 if(a.type==='assassin'&&a.action==='backstab'&&t.hp/t.maxHp<(r===2?.75:.4)){cue(a,'execution',tick,t);return damage*(r===2?2.2:1.8)}
 if(a.type==='goblin'){const count=Math.min(r===2?4:3,units.filter(u=>u!==a&&u.team===a.team&&u.type==='goblin'&&u.hp>0&&near(u,a,.10)).length);if(count){cue(a,'pack',tick,t);return damage*(1+count*(r===2?.3:.2))}}
 return damage;
}
function incoming(t,damage,units,tick,bastions=units,turtleGuardians=units){
 if(t.siegeFractureUntil>tick&&['beetank','turtle','dragon'].includes(t.type)){damage*=1.65;if(t.siegeAnvilCharges>0){damage*=1.35;t.siegeAnvilCharges--}}
 if(rank(t)&&t.type==='mole'){damage*=rank(t)===2?.5:.65;cue(t,'carapace',tick)}
 let protection=0,protector=null;
 for(const u of bastions)if(u.team===t.team&&u.hp>0&&u.type==='knight'&&rank(u)&&near(u,t,rank(u)===2?.12:.09)){
  const strength=rank(u)===2?.3:.2;if(strength>protection){protection=strength;protector=u}
 }
 let shelter=0,guardian=null;
 for(const u of turtleGuardians)if(u!==t&&u.team===t.team&&u.hp>0&&u.type==='turtle'&&rank(u)&&near(u,t,rank(u)===2?.14:.12)){
  const amount=rank(u)===2?.28:.18;if(amount>shelter){shelter=amount;guardian=u}
 }
 if(t.hp/t.maxHp<.6&&shelter>protection){damage*=1-shelter;cue(guardian,'shelter',tick,t)}
 else if(protection){damage*=1-protection;cue(protector,'bastion',tick,t)}
 return damage;
}
function afterHit(a,t,dealt,units,tick){
 const hits=[],r=rank(a);
 if(rank(t)&&t.type==='turtle'&&a&&a.hp>0&&near(a,t,.10)&&dealt>0){hits.push({target:a,source:null,damage:dealt*(rank(t)===2?.45:.3)});cue(t,'reflect',tick,a)}
 if(a.type==='beetank'&&r===2&&['horn','ram'].includes(a.action)&&dealt>0&&t.hp>0&&['beetank','turtle','dragon'].includes(t.type)){t.siegeFractureUntil=Math.max(t.siegeFractureUntil||0,tick+96);cue(a,'siege',tick,t)}
 if(a.type==='beetank'&&r===2&&['horn','ram'].includes(a.action)&&dealt>0&&t.hp>0&&['beetank','turtle','dragon'].includes(t.type)&&tick-(a.siegeAnvilTick??-1000)>=100){a.siegeAnvilTick=tick;t.siegeAnvilCharges=Math.min(2,(t.siegeAnvilCharges||0)+2)}
 
 // L5 SHELL REBOUND: an actual close-range enemy hit on this Turtle or an
 // already-wounded warded ally provokes a bounded counterattack, not free DPS.
 if(a&&a.team!==t.team&&a.hp>0&&dealt>0&&t.hp>0){
  let guardian=t.type==='turtle'&&rank(t)===2?t:null;
  if(!guardian&&t.hp/t.maxHp<.6){let best=Infinity;
   for(const u of units)if(u!==t&&u.team===t.team&&u.hp>0&&u.type==='turtle'&&rank(u)===2&&near(u,t,.14)){
    const d=Math.hypot(u.x-t.x,u.y-t.y);
    if(d<best){best=d;guardian=u}
   }
  }
  if(guardian&&near(guardian,a,.23)&&tick-(guardian.shellReprisalTick??-1000)>=54){
   guardian.shellReprisalTick=tick;
   hits.push({target:a,source:guardian,damage:guardian.dmg*1.45});
   const ripple=units.filter(v=>v!==a&&v.team!==guardian.team&&v.hp>0&&v.burrow<=0&&near(v,a,.105))
    .sort((x,y)=>Math.hypot(x.x-a.x,x.y-a.y)-Math.hypot(y.x-a.x,y.y-a.y)||x.id-y.id).slice(0,2);
   for(const v of ripple){v.stun=Math.max(v.stun,8);hits.push({target:v,source:guardian,damage:guardian.dmg*.65})}
   cue(guardian,'reprisal',tick,a);
  }
 }
if(!r||!['sniper','dragon','beetank','mole','barbarian'].includes(a.type))return hits;
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
  if(a.action==='ram'||a.ultimateHits%(r===2?2:3)===0){for(const v of enemies.filter(v=>near(v,t,r===2?.14:.11))){v.stun=Math.max(v.stun,r===2?20:12);hits.push({target:v,source:a,damage:a.dmg*(r===2?.55:.35)})}cue(a,r===2?'siege':'seismic',tick,t)}
 }
 if(a.type==='mole'&&r===2&&a.action==='erupt'){
 const dir=a.team==='blue'?1:-1;
 const lined=enemies.map(v=>({v,forward:(v.x-t.x)*dir,side:Math.abs(v.y-t.y)}))
  .filter(p=>p.forward>=-.025&&p.forward<=.20&&p.side<=.060)
  .sort((p,q)=>p.forward-q.forward||p.side-q.side||p.v.id-q.v.id)
  .slice(0,2);
 for(const p of lined){p.v.stun=Math.max(p.v.stun,3);hits.push({target:p.v,source:a,damage:a.dmg*.62})}
 if(lined.length)cue(a,'fissure',tick,t);
}
if(a.type==='barbarian'&&['axe_swing','rage_swing'].includes(a.action)){
  const targets=enemies.filter(v=>near(v,t,r===2?.205:.135))
   .sort((x,y)=>Math.hypot(x.x-t.x,x.y-t.y)-Math.hypot(y.x-t.x,y.y-t.y)||x.id-y.id)
   .slice(0,r===2?5:3);
  for(const v of targets){v.stun=Math.max(v.stun,r===2?12:8);
   hits.push({target:v,source:a,damage:a.dmg*(r===2?1.00:.58)})}
  if(targets.length)cue(a,'cleave',tick,t);
}
return hits;
}
function honk(u,units,tick){
 const r=rank(u);if(!r)return [];
 const enemies=units.filter(v=>v.team!==u.team&&v.hp>0&&v.burrow<=0)
  .sort((x,y)=>Math.hypot(x.x-u.x,x.y-u.y)-Math.hypot(y.x-u.x,y.y-u.y)||x.id-y.id);
 const first=enemies.filter(v=>near(v,u,r===2?.255:.23)).slice(0,r===2?6:5);
 const echo=enemies.filter(v=>!first.includes(v)&&first.some(t=>near(t,v,r===2?.16:.11)))
  .slice(0,r===2?4:3);
 const hits=[];
 for(const v of first){v.stun=Math.max(v.stun,r===2?64:44);
  hits.push({target:v,source:u,damage:u.dmg*(r===2?1.10:.75)})}
 for(const v of echo){v.stun=Math.max(v.stun,4);
  hits.push({target:v,source:u,damage:u.dmg*(r===2?.83:.60)})}
 if(hits.length)cue(u,'thunder',tick,hits[0].target);return hits;
}
function burn(u){if(!(u.burnTicks>0)||u.hp<=0)return 0;u.burnTicks--;return u.burrow>0?0:u.burnTicks%15===0?u.burnPower:0}
window.ShowdownUltimates=Object.freeze({rank,specs,armor,outgoing,incoming,afterHit,honk,burn});
})();
