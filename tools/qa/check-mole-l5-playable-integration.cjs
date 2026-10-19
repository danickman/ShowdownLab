'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const frozen=read('tools/qa/fixtures/mole-before-twin-ultimate.js'),live=read('v3/ultimate-abilities.js'),study=read('tools/qa/check-mole-l5-low-collateral-ab.cjs');
const i=study.indexOf('function fissure('),j=study.indexOf('const inject=[',i);
assert(i>0&&j>i);const make=new Function(study.slice(i,j)+';return fissure')();
const oldSpec="mole:{name:'Nuclear Carapace',l4:'Ignore 35% of incoming damage, ranged or melee.',l5:'Ignore 50% of incoming damage.'},",newSpec="mole:{name:'Nuclear Carapace',l4:'Ignore 35% of incoming damage, ranged or melee.',l5:'Ignore 50% of incoming damage; after burrow eruptions, Twin Rift cracks forward to damage up to two additional foes for 62% attack damage with a brief stagger.'},";
const body=make('.20','.060','2','.62','3').replace("cue(a,'carapace',tick,t)","cue(a,'fissure',tick,t)");
const expected=frozen.replace("['sniper','dragon','beetank','barbarian']","['sniper','dragon','beetank','mole','barbarian']")
 .replace("if(a.type==='barbarian'&&['axe_swing','rage_swing'].includes(a.action)){",body+'\n'+"if(a.type==='barbarian'&&['axe_swing','rage_swing'].includes(a.action)){").replace(oldSpec,newSpec);
// Normalize only the independent post-Twin Beetank changes, preserving strict Mole mechanics.
const historicalBee="l5:'Every second horn strike splashes 55% damage; wider radius and 0.67-second stun.'";
const fractureBee="l5:'Siege Fracture: L5 horns and rams fracture actual heavy Beetank, Turtle or Dragon contact for 96 ticks, exposing the victim to 65% more ordinary allied damage. Every second horn retains 55% Seismic splash.'";
const fractureIncoming="if(t.siegeFractureUntil>tick&&['beetank','turtle','dragon'].includes(t.type))damage*=1.65;";
const fractureAfter="if(a.type==='beetank'&&r===2&&['horn','ram'].includes(a.action)&&dealt>0&&t.hp>0&&['beetank','turtle','dragon'].includes(t.type)){t.siegeFractureUntil=Math.max(t.siegeFractureUntil||0,tick+96);cue(a,'siege',tick,t)}";
assert(live.includes(fractureBee)&&live.includes('\n '+fractureIncoming)&&live.includes('\n '+fractureAfter)&&live.includes("cue(a,r===2?'siege':'seismic',tick,t)}"),'vetted Beetank fracture not found');
const moleExact=live.replace(fractureBee,historicalBee)
 .replace('\n '+fractureIncoming,'').replace('\n '+fractureAfter,'')
 .replace("cue(a,r===2?'siege':'seismic',tick,t)}","cue(a,'seismic',tick,t)}");
assert.strictEqual(moleExact,expected,'QA Mole Twin full-source mechanics changed outside the independently integrated Beetank L5 scope');
const fx=read('v3/ultimate-effects.js'),renderer=read('v3/v3.js');
assert(fx.includes("f.ability==='fissure'")&&fx.includes("f.team==='red'?-1:1"));
assert(renderer.includes('Twin Rift cracks forward')&&renderer.includes('ability:u.ultimateKind,team:u.team,level:u.level'));
console.log('PASS: source-exact Twin L5 in QA runtime, directional local ground cue and accurate Fighter Guide');
