const fs=require('fs'),vm=require('vm'),assert=require('assert');
const e={window:null,console,Image:class{},CustomEvent:class{},dispatchEvent(){}};e.window=e;vm.createContext(e);
for(const f of ['evolution-rules','base-dragon','evolved-dragon','asset-renderer','camera','combat-staging'])vm.runInContext(fs.readFileSync('v3/'+f+'.js','utf8'),e);
const art=e.FighterAssets,pack=e.DragonBaseArt,k=pack.scale/pack.referenceHeight,envelope=art.visualEnvelope('dragon',1);
assert.equal(art.visualForm('dragon',1),'base');assert.equal(art.visualForm('dragon',2),'evolved');
for(const pose of Object.values(pack.poses)){assert(pose.width*pose.anchor[0]*k<=envelope.left);assert(pose.width*(1-pose.anchor[0])*k<=envelope.right);assert(pose.height*pose.anchor[1]*k<=envelope.above);assert(pose.height*(1-pose.anchor[1])*k<=envelope.below)}
let cases=0;
for(const [w,h]of [[320,568],[390,844],[430,932],[844,390],[1024,768]])for(const count of [2,8,24,60,180])for(const layout of ['cluster','corners','spread']){
 const us=Array.from({length:count},(_,i)=>({id:i+1,type:'dragon',level:1,team:i%2?'red':'blue',hp:100,x:layout==='cluster'?.5:layout==='corners'?(i%2?.98:.02):.05+(i%7)/7*.9,y:layout==='cluster'?.5:layout==='corners'?(i%3?.98:.02):.05+(i%11)/11*.9})),before=JSON.stringify(us),cam=e.ShowdownCamera.create(w,h),stage=e.CombatStaging.create();
 for(let n=0;n<80;n++){cam.focus(us);stage.prepare(us,cam,n*16)}
 const a=cam.arena,size=cam.unitSize('large',count);
 for(const u of us){const p=stage.point(u,cam);assert(p.x-size*envelope.left>=a.x-.01);assert(p.x+size*envelope.right<=a.x+a.w+.01);assert(p.y-size*envelope.above>=a.y-.01);assert(p.y+size*envelope.below<=a.y+a.h+.01);cases++}
 assert.equal(JSON.stringify(us),before);
}
for(const action of ['fire','fire_windup','claw_swipe']){const a=art.cueOffset('dragon',1,action,'weapon',80,1),b=art.cueOffset('dragon',1,action,'weapon',80,-1);assert(a&&a.y<0);assert.equal(a.x,-b.x);assert.equal(a.y,b.y);assert(a.x<=envelope.right*80);assert(-a.y<=envelope.above*80)}
assert.equal(art.cueOffset('sniper',1,'attack','weapon',80),null);
console.log('PASS: registered refreshed Base Dragon envelopes, '+cases+' camera/staging cases and mirrored mouth cues; other Base cue contracts retained');
