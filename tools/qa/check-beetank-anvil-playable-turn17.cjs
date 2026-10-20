'use strict';
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.resolve(__dirname,'../..',p),'utf8');
const before=read("tools/qa/fixtures/beetank-preanvil-ultimate-turn17.js"),actual=read('v3/ultimate-abilities.js');
const oldIncoming="if(t.siegeFractureUntil>tick&&['beetank','turtle','dragon'].includes(t.type))damage*=1.65;",oldHit="if(a.type==='beetank'&&r===2&&['horn','ram'].includes(a.action)&&dealt>0&&t.hp>0&&['beetank','turtle','dragon'].includes(t.type)){t.siegeFractureUntil=Math.max(t.siegeFractureUntil||0,tick+96);cue(a,'siege',tick,t)}",newIncoming="if(t.siegeFractureUntil>tick&&['beetank','turtle','dragon'].includes(t.type)){damage*=1.65;if(t.siegeAnvilCharges>0){damage*=1.35;t.siegeAnvilCharges--}}",newHit="if(a.type==='beetank'&&r===2&&['horn','ram'].includes(a.action)&&dealt>0&&t.hp>0&&['beetank','turtle','dragon'].includes(t.type)){t.siegeFractureUntil=Math.max(t.siegeFractureUntil||0,tick+96);cue(a,'siege',tick,t)}\n if(a.type==='beetank'&&r===2&&['horn','ram'].includes(a.action)&&dealt>0&&t.hp>0&&['beetank','turtle','dragon'].includes(t.type)&&tick-(a.siegeAnvilTick??-1000)>=100){a.siegeAnvilTick=tick;t.siegeAnvilCharges=Math.min(2,(t.siegeAnvilCharges||0)+2)}";
const oldDescription="l5:'Siege Fracture: L5 horns and rams fracture actual heavy Beetank, Turtle or Dragon contact for 96 ticks, exposing the victim to 65% more ordinary allied damage. Every second horn retains 55% Seismic splash.'",newDescription="l5:'Hammer & Anvil: real L5 horns or rams fracture Beetank, Turtle or Dragon for 96 ticks, adding 65% subsequent natural damage. Once per 100 ticks, two real follow-up hits gain another 35% damage; Seismic splash stays bounded.'";
assert.equal(before.split(oldIncoming).length,2);assert.equal(before.split(oldHit).length,2);assert.equal(before.split(oldDescription).length,2);
const expected=before.replace(oldIncoming,newIncoming).replace(oldHit,newHit).replace(oldDescription,newDescription);
// Preserve the exact frozen Beetank Anvil provenance while allowing the separately
// source-proven Turtle L5 Shell Rebound overlay. Strip ONLY its named, anchored
// source/Guide/cue delta; any unrelated or Beetank drift still fails byte-for-byte.
const actualMark='\n // L5 SHELL REBOUND:';
const pulseAnchor="if(!r||!['sniper','dragon','beetank','mole','barbarian'].includes(a.type))return hits;";
const start=actual.indexOf(actualMark),end=actual.indexOf(pulseAnchor,start);
assert(start>=0&&end>start,'one independently accepted Turtle-only physical Shell Rebound overlay required');
assert.equal(actual.split(actualMark).length,2,'one Turtle L5 reprisal guard required');
const originalCue="function cue(u,kind,tick,target){if(tick-(u.ultimateTick??-1000)<12)return;";
const reboundCue="function cue(u,kind,tick,target){if(tick-(u.ultimateTick??-1000)<12&&!(kind==='reprisal'&&['reflect','shelter'].includes(u.ultimateKind)))return;";
const originalTurtle="l5:'Reflect 45% in close contact; nearby allies below 60% HP take 28% less damage within 0.14 arena units (strongest guard only).'";
const reboundTurtle="l5:'Reflect 45% close-contact damage; guard wounded allies for 28% mitigation within 0.14. SHELL REBOUND: when struck in close combat, the Turtle (or a wounded ally it guards) triggers a 145% counterhit plus two 65% splash hits and brief stagger, once every 54 ticks.'";
let withoutTurtle=actual.slice(0,start)+actual.slice(end);
assert.equal(withoutTurtle.split(reboundCue).length,2,'Turtle cue priority single site');
assert.equal(withoutTurtle.split(reboundTurtle).length,2,'Turtle Guide single site');
withoutTurtle=withoutTurtle.replace(reboundCue,originalCue).replace(reboundTurtle,originalTurtle);
const originalBarbarian="l5:'A giant sweeping strike splashes 100% attack damage onto up to five foes across a wider arc, staggering them for 12 ticks.'";
const measuredBarbarian="l5:'Blood Cleave still hits up to five foes for full axe damage. MEASURED CHARGE: approach 70% faster (95% in rage); your first physically landed axe strike hits harder and staggers its target for 8 ticks.'";
assert.equal(withoutTurtle.split(measuredBarbarian).length,2,'Barbarian Measured Charge Guide single accepted site');
withoutTurtle=withoutTurtle.replace(measuredBarbarian,originalBarbarian);
assert.equal(withoutTurtle,expected,'After only separately accepted Turtle Rebound and Barbarian Measured Charge Guide overlays are removed, Beetank Anvil and ALL other ultimate source must stay byte-for-byte frozen');
assert.equal(actual.split('siegeAnvilCharges').length,5,'exactly two consumer mentions and two setter mentions; no duplicate charge paths');
assert(actual.includes('100 ticks')&&actual.includes('two real follow-up hits'));
console.log('PASS: Beetank Hammer & Anvil actual source matches accepted physics overlay and Guide exactly; no L1-L4 / unrelated fighter changes');
