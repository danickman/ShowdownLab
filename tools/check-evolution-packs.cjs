const fs=require('fs'),vm=require('vm'),assert=require('assert');
const env={console,Image:class{},window:null};env.window=env;vm.createContext(env);
for(const f of ['evolved-knight','evolved-beetank','asset-renderer','camera','combat-staging'])vm.runInContext(fs.readFileSync(`v3/${f}.js`,'utf8'),env);
const art=env.FighterAssets;
for(const level of [1,4,5,9,10]){assert.equal(art.visualForm('knight',level),level>=5?'evolved':'base');assert.equal(art.visualForm('beetank',level),level>=5?'evolved':'base');assert.equal(art.visualForm('goose',level),'base')}
for(const type of ['knight','beetank']){
const e=type==='knight'?env.KnightEvolvedArt:env.BeetankEvolvedArt,k=e.scale/e.referenceHeight,envelope=art.visualEnvelope(type,5);
for(const p of Object.values(e.poses)){assert(p.anchor.every(Number.isFinite));assert(p.width*p.anchor[0]*k<=envelope.left);assert(p.width*(1-p.anchor[0])*k<=envelope.right);assert(p.height*p.anchor[1]*k<=envelope.above);assert(p.height*(1-p.anchor[1])*k<=envelope.below)}
let checks=0;
for(const [w,h]of [[320,568],[390,844],[430,932],[844,390],[1024,768]])for(const count of [2,8,24,60,180])for(const layout of ['cluster','corners','spread']){
 const units=Array.from({length:count},(_,i)=>({id:i+1,type,level:5,hp:100,team:i%2?'blue':'red',x:layout==='cluster'?.5:layout==='corners'?(i%2?.98:.02):.05+(i%7)/7*.9,y:layout==='cluster'?.5:layout==='corners'?(i%3?.98:.02):.05+(i%11)/11*.9})),before=JSON.stringify(units),camera=env.ShowdownCamera.create(w,h),stage=env.CombatStaging.create();
 for(let t=0;t<80;t++){camera.focus(units);stage.prepare(units,camera,t*16)}
 const a=camera.arena;
 for(const u of units){const p=stage.point(u,camera),size=camera.unitSize(type==='beetank'?'heavy':'normal',count);assert(p.x-size*envelope.left>=a.x-.01,`${w} left`);assert(p.x+size*envelope.right<=a.x+a.w+.01,`${w} right`);assert(p.y-size*envelope.above>=a.y-.01,`${h} top`);assert(p.y+size*envelope.below<=a.y+a.h+.01,`${h} bottom`);checks++}
 assert.equal(JSON.stringify(units),before)
}
console.log(`PASS: form boundaries, seven registered equipment envelopes, ${checks} ${type} Evolved camera/staging bounds; simulation units unchanged`);
}
// Exercise renderer sizing, facing and a failed optional pose fallback.
let failAttack=false;const drawEnv={window:null,CustomEvent:class{},dispatchEvent(){}};drawEnv.window=drawEnv;
class ReadyImage{set src(url){this.url=url;const match=url.match(/authored\/(knight|beetank)\/evolved\/(\w+)\.webp/);if(match){const pack=match[1]==='knight'?drawEnv.KnightEvolvedArt:drawEnv.BeetankEvolvedArt;const pose=Object.values(pack.poses).find(p=>p.file===match[2]);this.naturalWidth=pose?.width||512;this.naturalHeight=pose?.height||512;if(failAttack&&match[2]==='attack'){this.onerror?.();return}}else this.naturalWidth=this.naturalHeight=96;this.onload?.()}}
drawEnv.Image=ReadyImage;vm.createContext(drawEnv);for(const f of ['evolved-knight','evolved-beetank','asset-renderer'])vm.runInContext(fs.readFileSync(`v3/${f}.js`,'utf8'),drawEnv);
const images=[],scales=[],ctx={canvas:{width:390,height:844},save(){},restore(){},beginPath(){},ellipse(){},fill(){},stroke(){},translate(){},rotate(){},scale(...xy){scales.push(xy)},drawImage(...args){images.push(args)}};
for(const [type,actions]of [['knight',['idle','move','attack','guard','charge','hit','defeat']],['beetank',['idle','bulldoze','horn','brace','ram','hit','defeat']]])for(const action of actions){images.length=0;scales.length=0;const size=80;drawEnv.FighterAssets.draw(ctx,type,150,400,size,'blue',{level:5,action,time:5000,flip:false});const [img,x,y,w,h]=images.at(-1),pack=type==='knight'?drawEnv.KnightEvolvedArt:drawEnv.BeetankEvolvedArt;assert(img.url.includes('/evolved/'));assert(Math.abs(h/img.naturalHeight-size*pack.scale/pack.referenceHeight)<.03,'all poses share source-pixel scale');assert.equal(scales.at(-1)[0]<0,type==='beetank','native left facing is normalized')}
// New renderer instance clears preloaded ready records, so failure is observed.
failAttack=true;vm.runInContext(fs.readFileSync('v3/asset-renderer.js','utf8'),drawEnv);images.length=0;drawEnv.FighterAssets.draw(ctx,'beetank',150,400,80,'blue',{level:5,action:'horn',time:5000});assert(images.at(-1)[0].url.includes('/beetank/attack.webp'),'failed Evolved attack falls back to same Base pose');
console.log('PASS: actual pose rendering uses common source scale, normalizes native facing and falls back to corresponding Base asset');
