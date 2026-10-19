'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('v3/arena-ambience.js','utf8');
const env={window:{matchMedia:()=>({matches:false})}};vm.createContext(env);vm.runInContext(code,env);
function sample(count,w,h){
 const calls=[],c={globalAlpha:1,save(){},restore(){},beginPath(){},clip(){},rect(...p){calls.push(p)},moveTo(...p){calls.push(p)},
 lineTo(...p){calls.push(p)},closePath(){},fill(){calls.push(['fill'])},stroke(){},ellipse(...p){calls.push(p)},quadraticCurveTo(...p){calls.push(p)}};
 env.window.ArenaAmbience.drawSky(c,w,h,{dressing:'academy'},6000,count);return calls;
}
const a=sample(20,430,320),b=sample(300,430,320),small=sample(20,375,220);
assert(a.length>b.length&&a.length<100&&b.length<35,'sky draw call budget/density');
assert(a.filter(x=>x.length===7).length>=9,'animated cloud bank missing');
assert([...a,...b,...small].every(p=>p[0]==='fill'||p.every(Number.isFinite)),'invalid finite geometry');
assert(code.includes('if(w<=0||h<=0||reduced())return;'),'reduce-motion guard lost');
console.log('PASS: sunny layered sky finite 430/375 viewport; 300 population draw throttled; motion gated');
