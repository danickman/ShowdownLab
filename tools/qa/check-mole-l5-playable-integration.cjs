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
const siegeBee="l5:'Siege Breaker: at L5, horn strikes breach Beetank, Turtle and Dragon opponents at actual heavy-body contact. Each second hit triggers a wider 55% Seismic blast with a brief stagger.'";
assert(live.includes(siegeBee)&&live.includes("cue(a,r===2?'siege':'seismic',tick,t)}"),'expected Siege Breaker not found');
const moleExact=live.replace(siegeBee,historicalBee).replace("cue(a,r===2?'siege':'seismic',tick,t)}","cue(a,'seismic',tick,t)}");
assert.strictEqual(moleExact,expected,'QA Mole Twin full-source mechanics changed outside the independently integrated Beetank L5 scope');
const fx=read('v3/ultimate-effects.js'),renderer=read('v3/v3.js');
assert(fx.includes("f.ability==='fissure'")&&fx.includes("f.team==='red'?-1:1"));
assert(renderer.includes('Twin Rift cracks forward')&&renderer.includes('ability:u.ultimateKind,team:u.team,level:u.level'));
console.log('PASS: source-exact Twin L5 in QA runtime, directional local ground cue and accurate Fighter Guide');
