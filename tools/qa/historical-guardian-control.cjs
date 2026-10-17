'use strict';
// Exact historic pre-Turtle-Guardian combat control used by independent A/B studies.
// Keep the old baseline faithful; runtime tests independently cover current mechanics.
const assert=require('node:assert/strict');
const once=(s,a,b)=>{assert.equal(s.split(a).length,2,'historical Guardian control anchor moved: '+a.slice(0,90));return s.replace(a,b)};
function withoutGuardian(shippedCore,shippedUltimate){
 let core=once(shippedCore,'let bastions=[],turtleGuardians=[];','let bastions=[];');
 core=once(core,"bastions=units.filter(u=>u.type==='knight'&&ultimate.rank(u));turtleGuardians=units.filter(u=>u.type==='turtle'&&ultimate.rank(u));lastAliveCount","bastions=units.filter(u=>u.type==='knight'&&ultimate.rank(u));lastAliveCount");
 core=once(core,'ultimate.incoming(t,dmg,units,tick,bastions,turtleGuardians)','ultimate.incoming(t,dmg,units,tick,bastions)');
 let ability=once(shippedUltimate,'function incoming(t,damage,units,tick,bastions=units,turtleGuardians=units){','function incoming(t,damage,units,tick,bastions=units){');
 ability=once(ability," let shelter=0,guardian=null;\n for(const u of turtleGuardians)if(u!==t&&u.team===t.team&&u.hp>0&&u.type==='turtle'&&rank(u)&&near(u,t,rank(u)===2?.14:.12)){\n  const amount=rank(u)===2?.28:.18;if(amount>shelter){shelter=amount;guardian=u}\n }\n if(t.hp/t.maxHp<.6&&shelter>protection){damage*=1-shelter;cue(guardian,'shelter',tick,t)}\n else if(protection){damage*=1-protection;cue(protector,'bastion',tick,t)}\n return damage;"," if(protection){damage*=1-protection;cue(protector,'bastion',tick,t)}\n return damage;");
 return {core,ability};
}
module.exports={withoutGuardian};
