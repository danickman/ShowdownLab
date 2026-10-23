'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const read=p=>fs.readFileSync(path.join(__dirname,'../..',p),'utf8');
const v=read('v3/v3.js'),art=read('v3/asset-renderer.js'),sw=read('sw.js');
assert.equal(v.split("ShowdownAdapter.subscribe(s=>{if(current==='battle'&&cam){if(s.phase==='battle'&&(s.round!==state.round||s.battleId!==state.battleId)){fx=[];scars=[];spellMarks=[];defeated.clear();prev.clear();shake=flash=0;impactPunch=null;storyBeat=null;comicGate.clear();storyGate.clear();}if(s.phase==='battle'&&battleOutro)battleOutro=null;spawnFX(s);").length,2,'clear all old FX at every round boundary');
assert(v.includes('scars=[];spellMarks=[];defeated.clear();prev.clear();'));

assert(art.includes('const combatIdleHeights=Object.freeze('),'species body height reference missing');
assert(art.includes('function combatBodyScale(type,w,h,registration=null)'),'pose-stable form scale missing');
assert(art.includes('const formFactor=combatBodyScale(type,0,0,evolved)'),'camera envelopes not aligned');
assert(art.includes('size*e.scale/e.referenceHeight*combatBodyScale(type,0,0,e)'),'weapon cue not aligned');
assert(art.includes('if(!o.presentation){const rawH=h/size,rawW=rawH*ratio;h*=combatBodyScale(type,rawW,rawH,registration)}'),'presentation artwork must remain unchanged');
console.log('PASS cross-round Quake cleanup and 10-species form-stable sizing, matching cues/envelopes');
