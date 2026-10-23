'use strict';
// Target hardware is iPhone 14 Pro Max, not an adjacent model.
// Chromium 430x932 DPR3 checks geometry only; real Safari acceptance remains open.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const read=p=>fs.readFileSync(path.join(__dirname,'../..',p),'utf8');
const active=['docs/ROLE_VALUE_EVOLUTION_NEXT_TURN.md','docs/ROADMAP.md',
 'docs/QA_IMPLEMENTATION_HANDOFF.md','docs/TEST_MATRIX.md'];
for(const p of active){
 const source=read(p);
 assert(source.includes('iPhone 14 Pro Max'),'missing primary target in '+p);
 assert(!/iPhone\s+(?:Safari\s+)?15\s+Pro\s+Max/i.test(source),'incorrect primary device in '+p);
}
const plan=read(active[0]);
assert(plan.includes('**Primary target device:** **iPhone 14 Pro Max**'));
assert(plan.includes('430 × 932 pixels at DPR 3'),'CSS viewport contract drift');
assert(plan.includes('1290 × 2796 pixels'),'native physical display contract drift');
assert(plan.includes('Dynamic Island')&&plan.includes('home-indicator'),'actual device safe-area test omitted');
assert(plan.includes('Chromium')&&plan.includes('iOS Safari'),'browser emulator was misrepresented as real hardware');
for(const filename of ['tools/qa/check-density-browser.cjs','tools/qa/check-turn4d-browser.cjs',
 'tools/qa/check-lab-enemies-browser.cjs','tools/qa/check-composition5h-browser.cjs']){
 const code=read(filename);
 assert(/setViewport\(\{width:430,height:932,deviceScaleFactor:3,isMobile:true,hasTouch:true\}\)/.test(code),
  'portrait viewport configuration mismatch: '+filename);
}
const turn3=read('tools/qa/check-turn3-browser.cjs');
assert(turn3.includes('[[430,932],[390,844],[375,667]]'),'primary viewport/secondary layout coverage changed');
assert(turn3.includes('deviceScaleFactor:3,isMobile:true,hasTouch:true'),'turn3 DPR/touch proxy changed');
const density=read('tools/qa/check-density-browser.cjs');
assert(density.includes("targetDevice:'iPhone 14 Pro Max (portrait viewport emulation only)'"),'portrait report target mislabeled');
assert(density.includes('NOT physical iPhone/Safari FPS'),'Chromium must not claim physical Safari performance');
console.log('PASS: iPhone 14 Pro Max portrait 430x932 DPR3 QA contract, no device-mislabeling or Safari FPS claims');
