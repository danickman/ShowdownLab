'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict'),path=require('path');
const read=p=>fs.readFileSync(path.join(__dirname,'../..',p),'utf8');
const v=read('v3/v3.js'),art=read('v3/asset-renderer.js'),sw=read('sw.js');
assert.equal(v.split("ShowdownAdapter.subscribe(s=>{if(current==='battle'&&cam){if(s.phase==='battle'&&(s.round!==state.round||s.battleId!==state.battleId)){fx=[];scars=[];spellMarks=[];defeated.clear();prev.clear();shake=flash=0;impactPunch=null;storyBeat=null;comicGate.clear();storyGate.clear();}if(s.phase==='battle'&&battleOutro)battleOutro=null;spawnFX(s);").length,2,'clear all old FX at every round boundary');
assert(v.includes('scars=[];spellMarks=[];defeated.clear();prev.clear();'));
const limits=art.match(/const combatSizeLimits=Object.freeze\((\{[^\n]*\})\);/);assert(limits);
const ctx={};vm.runInNewContext('const combatSizeLimits='+limits[1]+';'+art.slice(art.indexOf('function combatBodyScale('),art.indexOf('const envelopeCache='))+'this.scale=combatBodyScale;this.limits=combatSizeLimits;',ctx);
assert.equal(Object.keys(ctx.limits).length,10);
for(const [name,[mw,mh]] of Object.entries(ctx.limits))for(const [w,h]of [[1,1],[1.8,1.9],[.9,1.1]]){const scale=ctx.scale(name,w,h);assert(scale>0&&scale<=1);assert(w*scale<=mw+1e-9&&h*scale<=mh+1e-9)}
assert(ctx.scale('goblin',1.85,1.65)<ctx.scale('beetank',1.85,1.65));
assert(art.includes('if(!o.presentation){const rawH=h/size,rawW=rawH*ratio;h*=combatBodyScale(type,rawW,rawH)}'));
assert(art.includes('k*combatBodyScale(type,p.width*k,p.height*k)'));
assert(art.includes('size*e.scale/e.referenceHeight*combatBodyScale'));
console.log('PASS cross-round Quake cleanup and 10-species authored combat silhouette caps, matching cues/envelopes');
