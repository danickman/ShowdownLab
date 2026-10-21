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

// QUAKE-specific real registered Canvas geometry, not an invented spell model.
const battleSrc=fs.readFileSync('v3/battle-theatre.js','utf8'),world={window:{}};
vm.createContext(world);vm.runInContext(battleSrc,world);
function crack(type,tier='full',age=.32){
 let depth=0;const strokes=[],fills=[],points=[],m={type,x:.31,y:.58,t:501,tech:4,seed:17,heavy:true};
 const unchanged=JSON.stringify(m),c={globalAlpha:1,lineWidth:1,strokeStyle:'',fillStyle:'',
  save(){depth++},restore(){depth--;assert(depth>=0)},
  translate(...v){assert(v.every(Number.isFinite))},scale(...v){assert(v.every(Number.isFinite))},
  beginPath(){},closePath(){},moveTo(...v){assert(v.every(Number.isFinite));points.push(v)},
  lineTo(...v){assert(v.every(Number.isFinite));points.push(v)},
  ellipse(...v){assert(v.every(Number.isFinite))},
  stroke(){strokes.push([this.strokeStyle,this.lineWidth])},
  fill(){fills.push(this.fillStyle)}};
 world.window.BattleTheatre.drawDamage(c,{x:190,y:560},m,age,tier);
 assert.equal(depth,0);assert.equal(JSON.stringify(m),unchanged);
 return{strokes,fills,points};
}
const fault=crack('quake'),ordinary=crack('impact'),minimal=crack('quake','minimal');
assert.deepStrictEqual(fault,crack('quake'),'QUAKE cached fracture geometry must be stable');
assert.equal(crack('quake','full',1).strokes.length,0,'nine-second expiry intact');
assert(fault.strokes.some(([color,width])=>color==='#241a15'&&width>=6),'dark bold fault missing');
assert(fault.strokes.some(([color])=>color==='#ffdf9d'),'sunlit fault rim missing');
assert(fault.fills.includes('#d6b080'),'raised earth shards missing');
const furthest=q=>Math.max(...q.points.map(([x,y])=>Math.hypot(x,y)),0);
assert(furthest(fault)>furthest(ordinary)*2.1,'QUAKE must rupture beyond ordinary small hit scars');
const west=Math.min(...fault.points.map(v=>v[0]));
assert(west< -100&&west> -250,'cached midfield fault must traverse clear ground but stay bounded');
assert(minimal.strokes.length<fault.strokes.length*.45,'300-body minimal tier must drop strokes');
assert(fault.strokes.length<40&&minimal.strokes.length<10,'bounded draw path count');

// Genuine current physics: an unattached spell must never enter the
// attacker-only afterHit path. These were actual browser QUAKE/ARC failures.
const combat={window:null,Math,performance:{now:()=>0},
 requestAnimationFrame(){return 1},cancelAnimationFrame(){},console};
combat.window=combat;vm.createContext(combat);
for(const file of ['v3/evolution-rules.js','v3/ultimate-abilities.js','v3/legacy-sim-core.js'])
 vm.runInContext(fs.readFileSync(file,'utf8'),combat,{filename:file});
const sim=combat.LegacySimCore;
sim.configure({seed:42026,speed:1,onState:()=>{}});
sim.deploy(Array.from({length:20},()=>({type:'knight',level:1})),
           Array.from({length:20},()=>({type:'knight',level:1})));
sim.setRunning(true);
const prior=sim.getState(),initialRed=prior.units.filter(u=>u.team==='red').reduce((s,u)=>s+u.hp,0);
const arc=sim.castSpell('zap','blue',1),quake=sim.castSpell('quake','blue',1);
assert.equal(arc?.ok,true,'real ARC should cast with null attacker');
assert.equal(quake?.ok,true,'real QUAKE should cast with null attacker');
assert.equal(quake.targets,20,'entire true opposing army receives physics QUAKE');
const after=sim.getState(),redHP=after.units.filter(u=>u.team==='red').reduce((s,u)=>s+u.hp,0);
assert(redHP<initialRed,'genuine source spell HP damage occurred');
assert.equal(after.units.length,40,'no phantom bodies from null attacker');
assert.equal(after.units.filter(u=>u.team==='blue'&&u.hp>0).length,20,'spell never harms own side');
console.log('PASS: live 40-fighter ARC+QUAKE real core casts no null-attacker crash, deterministic damage and unchanged roster');
console.log('PASS: QUAKE physically wider bold fracturing, angular rocks, deterministic marks, expiry and 300 budget');
console.log('PASS: clean authored sky without ovals, finite 430/375 geometry, moving birds/light and 300 budget, reduced-motion gated');
