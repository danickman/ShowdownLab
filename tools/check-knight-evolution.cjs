const fs=require('fs'),vm=require('vm'),assert=require('assert');
const env={console,Image:class{},window:null};env.window=env;vm.createContext(env);
for(const f of ['evolved-knight','asset-renderer','camera','combat-staging'])vm.runInContext(fs.readFileSync(`v3/${f}.js`,'utf8'),env);
const art=env.FighterAssets;
for(const level of [1,4,5,9,10]){assert.equal(art.visualForm('knight',level),level>=5?'evolved':'base');assert.equal(art.visualForm('beetank',level),'base')}
const e=env.KnightEvolvedArt,k=e.scale/e.referenceHeight,envelope=art.visualEnvelope('knight',5);
for(const p of Object.values(e.poses)){assert(p.anchor.every(Number.isFinite));assert(p.width*p.anchor[0]*k<=envelope.left);assert(p.width*(1-p.anchor[0])*k<=envelope.right);assert(p.height*p.anchor[1]*k<=envelope.above);assert(p.height*(1-p.anchor[1])*k<=envelope.below)}
let checks=0;
for(const [w,h]of [[320,568],[390,844],[430,932],[844,390],[1024,768]])for(const count of [2,8,24,60,180])for(const layout of ['cluster','corners','spread']){
 const units=Array.from({length:count},(_,i)=>({id:i+1,type:'knight',level:5,hp:100,team:i%2?'blue':'red',x:layout==='cluster'?.5:layout==='corners'?(i%2?.98:.02):.05+(i%7)/7*.9,y:layout==='cluster'?.5:layout==='corners'?(i%3?.98:.02):.05+(i%11)/11*.9})),before=JSON.stringify(units),camera=env.ShowdownCamera.create(w,h),stage=env.CombatStaging.create();
 for(let t=0;t<80;t++){camera.focus(units);stage.prepare(units,camera,t*16)}
 const a=camera.arena;
 for(const u of units){const p=stage.point(u,camera),size=camera.unitSize('normal',count);assert(p.x-size*envelope.left>=a.x-.01,`${w} left`);assert(p.x+size*envelope.right<=a.x+a.w+.01,`${w} right`);assert(p.y-size*envelope.above>=a.y-.01,`${h} top`);assert(p.y+size*envelope.below<=a.y+a.h+.01,`${h} bottom`);checks++}
 assert.equal(JSON.stringify(units),before)
}
console.log(`PASS: form boundaries, seven registered equipment envelopes, ${checks} Evolved camera/staging bounds; simulation units unchanged`);
