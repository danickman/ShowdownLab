'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('v3/ultimate-effects.js','utf8'),renderer=fs.readFileSync('v3/v3.js','utf8');
const env={window:{matchMedia:()=>({matches:false})}};vm.createContext(env);vm.runInContext(code,env);
assert(renderer.includes('window.UltimateEffects?.life(tier,f.ability)'));
const U=env.window.UltimateEffects;
assert(U.life('full','fissure')===760&&U.life('full','seismic')===360);
assert(U.life('minimal','fissure')===300);
function render(team='blue',tier='full',age=.38){
 const calls=[],c={globalAlpha:1,save(){calls.push(['save'])},restore(){calls.push(['restore'])},
 beginPath(){calls.push(['begin'])},moveTo(x,y){calls.push(['move',x,y])},
 lineTo(x,y){calls.push(['line',x,y])},stroke(){calls.push(['stroke'])},
 fill(){calls.push(['fill'])},closePath(){calls.push(['close'])},
 ellipse(x,y,rx,ry){calls.push(['ellipse',x,y,rx,ry])}};
 U.draw(c,{ability:'fissure',team,level:5,x:120,y:240,end:{x:140,y:250},size:45},age,tier);
 return{calls,lines:calls.filter(x=>x[0]==='line'),fills:calls.filter(x=>x[0]==='fill').length};
}
const blue=render(),red=render('red'),minimal=render('blue','minimal');
assert(blue.lines.length>=28,'full fissure must have many high-contrast branches');
assert(blue.fills>=7,'ground stones and dust absent');
assert(blue.calls.some(v=>v[0]==='ellipse'),'earth shock ring absent');
assert(Math.max(...blue.lines.map(v=>v[1]))>280,'forward blue rift too short');
assert(Math.min(...red.lines.map(v=>v[1]))<0,'red rift direction not reversed');
assert(minimal.lines.length<blue.lines.length*.5,'minimal mode must skip the branches');
assert(minimal.fills===0,'minimal mode must skip debris');
assert(U.life('full','fissure')>U.life('full','cleave'));
assert(renderer.includes("type:'mole-rift'")&&renderer.includes('UltimateEffects?.drawScar?.'),'event-based persistent scar not wired');
const pts=[],c={globalAlpha:1,save(){},restore(){},beginPath(){},moveTo(...p){pts.push(p)},lineTo(...p){pts.push(p)},stroke(){}};
U.drawScar(c,{x:120,y:240,team:'blue',size:40},.3,'full');
assert(pts.length>=10&&pts.flat().every(Number.isFinite),'scar geometry missing/nonfinite');
const before=pts.length;U.drawScar(c,{x:120,y:240,team:'blue',size:40},.3,'minimal');
assert(before===pts.length,'minimal density must suppress scars');
console.log('PASS: Mole L5 high-contrast forward rupture, branching trenches, rock debris, dust crown, ring, 760ms life and density guards');
