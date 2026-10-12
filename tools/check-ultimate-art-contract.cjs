const fs=require('fs'),vm=require('vm'),assert=require('assert');
const e={window:null,Image:class{set src(url){this.url=url;this.naturalWidth=this.naturalHeight=128;if(url.includes('/ultimate/attack.'))this.onerror?.();else this.onload?.()}},console,CustomEvent:class{},dispatchEvent(){}};e.window=e;vm.createContext(e);
for(const f of ['evolution-rules','evolved-knight'])vm.runInContext(fs.readFileSync('v3/'+f+'.js','utf8'),e);
// Synthetic metadata verifies the reserved contract; no Ultimate artwork is shipped.
e.KnightUltimateArt={scale:1.3,referenceHeight:128,facing:1,poses:Object.fromEntries(['idle','move','attack','guard','signature','hit','defeat'].map(file=>[file,{file,width:128,height:128,anchor:[.5,.94],cues:{weapon:[20,-80]}}]))};
vm.runInContext(fs.readFileSync('v3/asset-renderer.js','utf8'),e);
for(const level of [1,2,3,4,5])assert.equal(e.FighterAssets.visualForm('knight',level),level===1?'base':level<4?'evolved':'ultimate');
const images=[],ctx={canvas:{width:390,height:844},globalAlpha:1,drawImage:(...args)=>images.push(args)};
for(const method of ['save','restore','beginPath','ellipse','fill','stroke','translate','rotate','scale','moveTo','lineTo'])ctx[method]=()=>{};
e.FighterAssets.draw(ctx,'knight',150,400,80,'blue',{level:4,action:'idle'});assert(images.at(-1)[0].url.includes('/ultimate/idle.webp'));
images.length=0;e.FighterAssets.draw(ctx,'knight',150,400,80,'blue',{level:4,action:'attack'});assert(images.at(-1)[0].url.includes('/evolved/attack.webp'),'failed Ultimate retains best available Evolved pose');
const cue=e.FighterAssets.cueOffset('knight',4,'attack','weapon',80);assert(cue.y<0);assert.equal(e.FighterAssets.diagnostics().byFighter.knight.ultimate.attack,'error');
console.log('PASS: future Ultimate L4/L5 registration, envelopes/cues and failed-pose Evolved fallback; synthetic contract only');
