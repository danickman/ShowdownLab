// node tools/check-combat-staging.cjs — presentation bounds, settling and shared anchors.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),r={window:null,Image:class{set src(v){this.naturalWidth=this.naturalHeight=96;this.onload?.()}},CustomEvent:class{},dispatchEvent(){},console};r.window=r;vm.createContext(r);
for(const file of ['asset-renderer','camera','combat-staging','battle-theatre'])vm.runInContext(fs.readFileSync(path.join(root,'v3',file+'.js'),'utf8'),r);
const types=Object.keys(r.FighterAssets.authored),kind=t=>t==='dragon'?'large':['turtle','beetank'].includes(t)?'heavy':['goose','goblin'].includes(t)?'small':'normal';
let boxes=0;
for(const [w,h]of [[320,568],[390,844],[430,932],[844,390],[1024,768]])for(const count of [2,8,24,44,60,180])for(const layout of ['cluster','corners','spread']){
 const units=Array.from({length:count},(_,i)=>Object.freeze({id:i+1,type:types[i%10],team:i%2?'red':'blue',hp:100,x:layout==='cluster'?.5+(i%4)*.003:layout==='corners'?i%2:.05+(i%10)*.1,y:layout==='cluster'?.5+Math.floor(i/4)*.002:layout==='corners'?(i>>1)%2:.05+Math.floor(i/10)/Math.max(1,Math.ceil(count/10))*.9}));
 const before=JSON.stringify(units),camera=r.ShowdownCamera.create(w,h),stage=r.CombatStaging.create();
 for(let frame=0;frame<100;frame++){camera.focus(units);stage.prepare(units,camera,frame*16);if(frame!==0&&frame!==99)continue;
  for(const u of units){const p=stage.point(u,camera),o=stage.offset(u.id),spec=r.FighterAssets.authored[u.type],size=camera.unitSize(kind(u.type),count),height=size*spec.scale*(spec.inkBoost||1),a=camera.arena,anchor=spec.anchor[1];
   assert(Math.abs(o.dx)<=14.00001&&Math.abs(o.dy)<=6.00001,'bounded offset');
   assert(p.x-height*.5>=a.x-.01&&p.x+height*.5<=a.x+a.w+.01,`${w}/${h}/${count}/${layout}/${u.type}: horizontal box`);
   assert(p.y-height*anchor>=a.y-.01&&p.y+height*(1-anchor)<=a.y+a.h+.01,`${w}/${h}/${count}/${layout}/${u.type}: vertical box`);boxes++;
   if(count>44)assert.equal(o.dx,0,'dense fight has no staging spread');
  }
 }
 assert.equal(JSON.stringify(units),before,'simulation objects unchanged');
}
const camera=r.ShowdownCamera.create(390,844),units=[1,2,3,4].map(id=>({id,type:'knight',team:id<3?'blue':'red',hp:100,x:.5,y:.5}));camera.focus(units);
const stage=r.CombatStaging.create(),reverse=r.CombatStaging.create();for(let frame=0;frame<80;frame++){stage.prepare(units,camera,frame*16);reverse.prepare([...units].reverse(),camera,frame*16)}
for(const u of units)assert.deepEqual(stage.offset(u.id),reverse.offset(u.id),'stable across array order');assert(stage.offset(1).dx<stage.offset(2).dx,'same-team silhouettes spread');
const old=stage.offset(1);stage.prepare([units[0]],camera,1296);assert(Math.abs(stage.offset(1).dx)<Math.abs(old.dx),'smooth return when isolated');assert(Math.abs(stage.offset(1).dx-old.dx)<3,'no abrupt settling');
stage.prepare([],camera,1500);assert.notEqual(stage.offset(1).dx,0,'fallen offset retained');stage.prepare([],camera,2400);assert.equal(stage.offset(1).dx,0,'fallen offset expires');stage.reset();assert.equal(stage.offset(2).dx,0,'round reset');
const src=fs.readFileSync(path.join(root,'v3/v3.js'),'utf8');vm.runInContext(src.slice(src.indexOf('function spritePoint('),src.indexOf('function effectScale(')),r);
r.cam=camera;r.staging=reverse;r.state={units};r.renderSnapshot=()=>({live:units,byId:new Map(units.map(u=>[u.id,u]))});
const u=units[0],p=r.spritePoint(u),cue=r.fighterCue(u,'impact',1);assert.equal(cue.x,p.x);assert(cue.y<p.y,'body cue above staged feet');
const mark={x:u.x,y:u.y,stageOffset:reverse.offset(u.id)};assert.deepEqual(r.groundMarkPoint(mark),p,'ground impact shares staged feet');reverse.reset();assert.deepEqual(r.groundMarkPoint(mark),p,'existing ground damage stays where impact landed');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.equal(html,fs.readFileSync(path.join(root,'v3/index.html'),'utf8'),'entry point parity');assert(html.indexOf('combat-staging.js')<html.indexOf('v3.js?'),'module before renderer');
console.log(`PASS: ${boxes} full-sprite bounds; state immutability, stable rank, smooth settling, density bypass, defeat/reset and shared impact anchors`);
