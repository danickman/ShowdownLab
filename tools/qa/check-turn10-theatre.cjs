'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('v3/arena-ambience.js','utf8');
const env={window:{matchMedia:()=>({matches:false})}};vm.createContext(env);vm.runInContext(code,env);
function sample(count,w,h,time=6000){
 const calls=[],c={globalAlpha:1,save(){},restore(){},beginPath(){},clip(){},rect(...p){calls.push(p)},moveTo(...p){calls.push(p)},
 lineTo(...p){calls.push(p)},closePath(){},fill(){calls.push(['fill'])},stroke(){calls.push(['stroke'])},ellipse(...p){calls.push(p)},quadraticCurveTo(...p){calls.push(p)}};
 env.window.ArenaAmbience.drawSky(c,w,h,{dressing:'academy'},time,count);return calls;
}
const a=sample(20,430,320),b=sample(300,430,320),small=sample(20,375,220);
assert(a.length>b.length&&a.length<100&&b.length<35,'sky draw call budget/density');
assert([...a,...b,...small].every(x=>x.length!==7),'no artificial ellipse clouds over authored panorama');
assert.equal(a.filter(x=>x[0]==='stroke').length,3,'retain 3 moving birds at 20');
assert.equal(b.filter(x=>x[0]==='stroke').length,1,'300 density limits to 1 bird');
assert.equal(a.filter(x=>x[0]==='fill').length,3,'retain three restrained sunbeams');
assert.equal(b.filter(x=>x[0]==='fill').length,0,'no beams at high density');
assert.notDeepEqual(a,sample(20,430,320,9000),'ambient movement persists without cloud banks');
assert([...a,...b,...small].every(p=>(p[0]==='fill'||p[0]==='stroke')||p.every(Number.isFinite)),'invalid finite geometry');
assert(code.includes('if(w<=0||h<=0||reduced())return;'),'reduce-motion guard lost');
console.log('PASS: clean authored sky without ovals, finite 430/375 geometry, moving birds/light and 300 budget, reduced-motion gated');
