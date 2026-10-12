// Contact-aware staging checks; no runtime assets or simulation objects are modified.
const fs=require('fs'),vm=require('vm'),cp=require('child_process'),assert=require('assert');
const baseline='00cbdc2c69a7c15ccd668dd8a4fe485c5ef246ef';
function environment(old=false){const e={window:null,Image:class{},console};e.window=e;vm.createContext(e);for(const f of ['evolved-knight','evolved-beetank','evolved-goose','evolved-sniper','asset-renderer','camera','combat-staging'])vm.runInContext(old&&f==='combat-staging'?cp.execFileSync('git',['show',baseline+':v3/'+f+'.js'],{encoding:'utf8'}):fs.readFileSync('v3/'+f+'.js','utf8'),e);return e}
const kind=t=>t==='dragon'?'large':['beetank','turtle'].includes(t)?'heavy':['goose','goblin'].includes(t)?'small':'normal';
function settled(e,units,w,h){const camera=e.ShowdownCamera.create(w,h),stage=e.CombatStaging.create();for(let i=0;i<100;i++){camera.focus(units);stage.prepare(units,camera,i*16)}return{camera,stage}}
function overlap(e,units,w,h){const {camera,stage}=settled(e,units,w,h),boxes=units.map(u=>{const p=stage.point(u,camera),size=camera.unitSize(kind(u.type),units.length),height=size*e.FighterAssets.authored[u.type].scale;return{x0:p.x-size*.29,x1:p.x+size*.29,y0:p.y-height*.80,y1:p.y-height*.10}});let area=0;for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){const a=boxes[i],b=boxes[j];area+=Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0))*Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0))}return area}
const fixture=Array.from({length:8},(_,i)=>Object.freeze({id:i+1,type:i<4?'sniper':i<6?'beetank':'knight',team:i<4?'blue':'red',x:i<4?.37+(i%2)*.035:.60+(i%2)*.035,y:.31+(i%4)*.14,hp:100,level:5}));
const old=environment(true),now=environment(),before=JSON.stringify(fixture);
for(const [w,h]of [[320,568],[390,844],[430,932],[844,390]]){const a=overlap(old,fixture,w,h),b=overlap(now,fixture,w,h);assert(b<=a+1,'comparison torso overlap must not regress');console.log(`${w}x${h}: approximate torso overlap ${a.toFixed(1)} -> ${b.toFixed(1)} CSS px²`)}
assert.equal(JSON.stringify(fixture),before);
// Exact coincidence must preserve the two contact fronts and source-order invariance.
const units=Array.from({length:8},(_,i)=>Object.freeze({id:i+1,type:'knight',team:i<4?'blue':'red',hp:100,x:.5,y:.5,level:5}));
const {camera,stage}=settled(now,units,390,844),reverse=settled(now,[...units].reverse(),390,844).stage;
for(const u of units){const o=stage.offset(u.id);assert.deepEqual(o,reverse.offset(u.id));assert(u.team==='blue'?o.dx<0:o.dx>0)}
// Small opponent-centroid noise must not reverse a settled contact side.
for(let i=0;i<20;i++){stage.prepare(units.map(u=>({...u,x:u.team==='blue'?.5:.5+(i%2?.0001:-.0001)})),camera,1600+i*16);assert(stage.offset(1).dx<0)}
const cap=now.CombatStaging.limits(60,camera.arena),crowd=Array.from({length:61},(_,i)=>({id:i+1,type:'knight',team:i%2?'blue':'red',hp:100,x:.5,y:.5,level:5}));
for(let frame=0;frame<240;frame++){camera.focus(crowd);stage.prepare(crowd,camera,2000+frame*16)}
for(const u of crowd){const o=stage.offset(u.id);assert(Math.abs(o.dx)<.01&&Math.abs(o.dy)<.01,'dense transition relaxes spread')}
assert.equal(cap.x,56);assert.equal(cap.y,36);stage.reset();assert.equal(stage.offset(1).dx,0);
console.log('PASS: contact fronts, ordered allied separation, jitter hysteresis, caps, dense transition and immutable input');
