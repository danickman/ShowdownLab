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
assert.strictEqual(live,expected,'QA runtime diverged from source-exact validated Twin A/B mechanics');
const fx=read('v3/ultimate-effects.js'),renderer=read('v3/v3.js');
assert(fx.includes("f.ability==='fissure'")&&fx.includes("f.team==='red'?-1:1"));
assert(renderer.includes('Twin Rift cracks forward')&&renderer.includes('ability:u.ultimateKind,team:u.team,level:u.level'));
console.log('PASS: source-exact Twin L5 in QA runtime, directional local ground cue and accurate Fighter Guide');
