const fs=require('fs'),vm=require('vm'),assert=require('assert');
const env={console,Image:class{},window:null};env.window=env;vm.createContext(env);
for(const f of ['evolved-knight','evolved-beetank','evolved-goose','evolved-sniper','evolved-dragon','evolved-assassin','evolved-mole','evolved-turtle','evolution-rules','asset-renderer','camera','combat-staging'])vm.runInContext(fs.readFileSync(`v3/${f}.js`,'utf8'),env);
const packNames={knight:'KnightEvolvedArt',beetank:'BeetankEvolvedArt',goose:'GooseEvolvedArt',sniper:'SniperEvolvedArt',dragon:'DragonEvolvedArt',assassin:'AssassinEvolvedArt',mole:'MoleEvolvedArt',turtle:'TurtleEvolvedArt'};
const art=env.FighterAssets;
for(const level of [1,2,3,4,5,10]){for(const type of Object.keys(packNames))assert.equal(art.visualForm(type,level),level>=2?'evolved':'base');assert.equal(art.visualForm('goblin',level),'base')}
for(const type of Object.keys(packNames)){
const e=env[packNames[type]],k=e.scale/e.referenceHeight,envelope=art.visualEnvelope(type,5);
for(const p of Object.values(e.poses)){assert(p.anchor.every(Number.isFinite));assert(p.width*p.anchor[0]*k<=envelope.left);assert(p.width*(1-p.anchor[0])*k<=envelope.right);assert(p.height*p.anchor[1]*k<=envelope.above);assert(p.height*(1-p.anchor[1])*k<=envelope.below)}
let checks=0;
for(const [w,h]of [[320,568],[390,844],[430,932],[844,390],[1024,768]])for(const count of [2,8,24,60,180])for(const layout of ['cluster','corners','spread']){
 const units=Array.from({length:count},(_,i)=>({id:i+1,type,level:5,hp:100,team:i%2?'blue':'red',x:layout==='cluster'?.5:layout==='corners'?(i%2?.98:.02):.05+(i%7)/7*.9,y:layout==='cluster'?.5:layout==='corners'?(i%3?.98:.02):.05+(i%11)/11*.9})),before=JSON.stringify(units),camera=env.ShowdownCamera.create(w,h),stage=env.CombatStaging.create();
 for(let t=0;t<80;t++){camera.focus(units);stage.prepare(units,camera,t*16)}
 const a=camera.arena;
 for(const u of units){const p=stage.point(u,camera),size=camera.unitSize(type==='dragon'?'large':['beetank','turtle'].includes(type)?'heavy':type==='goose'?'small':'normal',count);assert(p.x-size*envelope.left>=a.x-.01,`${w} left`);assert(p.x+size*envelope.right<=a.x+a.w+.01,`${w} right`);assert(p.y-size*envelope.above>=a.y-.01,`${h} top`);assert(p.y+size*envelope.below<=a.y+a.h+.01,`${h} bottom`);checks++}
 assert.equal(JSON.stringify(units),before)
}
console.log(`PASS: form boundaries, seven registered equipment envelopes, ${checks} ${type} Evolved camera/staging bounds; simulation units unchanged`);
}
// Exercise renderer sizing, facing and a failed optional pose fallback.
let failAttack=false;const drawEnv={window:null,CustomEvent:class{},dispatchEvent(){}};drawEnv.window=drawEnv;
class ReadyImage{set src(url){this.url=url;const match=url.match(/authored\/(knight|beetank|goose|sniper|dragon|assassin|mole|turtle)\/evolved\/(\w+)\.webp/);if(match){const pack=drawEnv[packNames[match[1]]];const pose=Object.values(pack.poses).find(p=>p.file===match[2]);this.naturalWidth=pose?.width||512;this.naturalHeight=pose?.height||512;if(failAttack&&match[2]==='attack'){this.onerror?.();return}}else this.naturalWidth=this.naturalHeight=96;this.onload?.()}}
drawEnv.Image=ReadyImage;vm.createContext(drawEnv);for(const f of ['evolved-knight','evolved-beetank','evolved-goose','evolved-sniper','evolved-dragon','evolved-assassin','evolved-mole','evolved-turtle','evolution-rules','asset-renderer'])vm.runInContext(fs.readFileSync(`v3/${f}.js`,'utf8'),drawEnv);
const images=[],scales=[],ctx={canvas:{width:390,height:844},save(){},restore(){},beginPath(){},moveTo(){},lineTo(){},ellipse(){},fill(){},stroke(){},translate(){},rotate(){},scale(...xy){scales.push(xy)},drawImage(...args){images.push(args)}};
for(const [type,actions]of [['knight',['idle','move','attack','guard','charge','hit','defeat']],['beetank',['idle','bulldoze','horn','brace','ram','hit','defeat']],['goose',['idle','waddle','peck','guard','honk','hit','defeat']],['sniper',['idle','move','attack','guard_close','aim','hit','defeat']],['dragon',['idle','stalk','attack','guard_close','fire','hit','defeat']],['assassin',['idle','stalk','backstab','guard','vanish','hit','defeat']],['mole',['idle','scuttle','claw','scrap','erupt','hit','defeat']],['turtle',['idle','trudge','snap','brace','shell_slam','hit','defeat']]])for(const action of actions){images.length=0;scales.length=0;const size=80;drawEnv.FighterAssets.draw(ctx,type,150,400,size,'blue',{level:5,action,time:5000,flip:false});const [img,x,y,w,h]=images.at(-1),pack=drawEnv[packNames[type]];assert(img.url.includes('/evolved/'));if(type==='assassin'){const pose={stalk:'move',backstab:'attack',vanish:'signature'}[action]||action;assert(img.url.includes('/'+pose+'.webp'),'all seven Assassin actions use distinct registered poses')}assert(Math.abs(h/img.naturalHeight-size*pack.scale/pack.referenceHeight)<.03,'all poses share source-pixel scale');assert.equal(scales.at(-1)[0]<0,type==='beetank','native left facing is normalized')}
// New renderer instance clears preloaded ready records, so failure is observed.
failAttack=true;vm.runInContext(fs.readFileSync('v3/asset-renderer.js','utf8'),drawEnv);images.length=0;drawEnv.FighterAssets.draw(ctx,'beetank',150,400,80,'blue',{level:5,action:'horn',time:5000});assert(images.at(-1)[0].url.includes('/beetank/attack.webp'),'failed Evolved attack falls back to same Base pose');
images.length=0;drawEnv.FighterAssets.draw(ctx,'sniper',150,400,80,'blue',{level:5,action:'attack',time:5000});assert(images.at(-1)[0].url.includes('/sniper/attack.webp'));
images.length=0;drawEnv.FighterAssets.draw(ctx,'sniper',150,400,80,'blue',{level:1,action:'move',time:5000});assert(images.at(-1)[0].url.includes('/sniper/idle.webp'),'Base Sniper action mapping is preserved');
console.log('PASS: actual pose rendering uses common source scale, normalizes native facing and falls back to corresponding Base asset');

for(const action of ['attack','aim']){
 const a=art.cueOffset('sniper',5,action,'weapon',80,1),b=art.cueOffset('sniper',5,action,'weapon',80,-1);
 assert(a.x>60&&a.y<0);assert.equal(a.x,-b.x);assert.equal(a.y,b.y);
 assert(a.x<=art.visualEnvelope('sniper',5).right*80);assert(-a.y<=art.visualEnvelope('sniper',5).above*80);
}
assert(art.cueOffset('sniper',5,'attack','weapon',80).y<art.cueOffset('sniper',5,'aim','weapon',80).y,'kneeling muzzle is lower');
assert.equal(art.cueOffset('sniper',1,'attack','weapon',80),null,'Base cues unchanged');
assert.equal(art.cueOffset('knight',5,'attack','weapon',80),null,'other pilots retain their cue contract');
console.log('PASS: registered standing/kneeling muzzle cues, facing symmetry and Base/other-pilot preservation');

images.length=0;drawEnv.FighterAssets.draw(ctx,'dragon',150,400,80,'blue',{level:5,action:'attack',time:5000});assert(images.at(-1)[0].url.includes('/dragon/attack.webp'),'failed Evolved Dragon attack falls back to Base');
for(const action of ['fire','fire_windup','claw_swipe']){
 const a=art.cueOffset('dragon',5,action,'weapon',80,1),b=art.cueOffset('dragon',5,action,'weapon',80,-1);assert(a&&a.y<0);assert.equal(a.x,-b.x);assert.equal(a.y,b.y);
 assert(a.x<art.visualEnvelope('dragon',5).right*80);assert(-a.y<art.visualEnvelope('dragon',5).above*80);
}
assert.equal(art.cueOffset('dragon',1,'fire','weapon',80),null);
console.log('PASS: Dragon mouth/claw origins mirror inside the complete wing/horn envelope; Base cues retained');

for(const action of ['backstab','vanish']){const a=art.cueOffset('assassin',5,action,'weapon',80,1),b=art.cueOffset('assassin',5,action,'weapon',80,-1);assert(a&&a.y<0);assert.equal(a.x,-b.x);assert.equal(a.y,b.y);const envelope=art.visualEnvelope('assassin',5);assert(a.x<=envelope.right*80&&a.x>=-envelope.left*80);assert(-a.y<=envelope.above*80)}
assert.equal(art.cueOffset('assassin',1,'backstab','weapon',80),null);
console.log('PASS: Assassin dagger cues mirror inside full blade/coat envelope; Base retained');

images.length=0;drawEnv.FighterAssets.draw(ctx,'assassin',150,400,80,'blue',{level:5,action:'backstab',time:5000});assert(images.at(-1)[0].url.includes('/assassin/attack.webp'),'failed Evolved Assassin attack falls back to Base');
images.length=0;drawEnv.FighterAssets.draw(ctx,'assassin',150,400,80,'blue',{level:1,action:'guard',time:5000});assert(images.at(-1)[0].url.includes('/assassin/idle.webp'),'Base Assassin guard mapping preserved');

for(const action of ['claw','dig','burrow','erupt']){const a=art.cueOffset('mole',2,action,'weapon',80,1),b=art.cueOffset('mole',2,action,'weapon',80,-1);assert(a&&a.y<0);assert.equal(a.x,-b.x);assert.equal(a.y,b.y);const envelope=art.visualEnvelope('mole',2);assert(a.x<=envelope.right*80&&a.x>=-envelope.left*80);assert(-a.y<=envelope.above*80)}
assert.equal(art.cueOffset('mole',1,'claw','weapon',80),null);
images.length=0;drawEnv.FighterAssets.draw(ctx,'mole',150,400,80,'blue',{level:2,action:'claw',time:5000});assert(images.at(-1)[0].url.includes('/mole/attack.webp'),'failed Evolved Mole attack falls back to Base');
console.log('PASS: Evolved Mole claw/eruption cues mirror inside full claw/foot envelope; Base cues and failed-pose fallback retained');

for(const action of ['snap','shell_roll','shell_slam']){const a=art.cueOffset('turtle',2,action,'weapon',80,1),b=art.cueOffset('turtle',2,action,'weapon',80,-1);assert(a&&a.y<0);assert.equal(a.x,-b.x);assert.equal(a.y,b.y);const envelope=art.visualEnvelope('turtle',2);assert(a.x<=envelope.right*80&&a.x>=-envelope.left*80);assert(-a.y<=envelope.above*80)}
assert.equal(art.cueOffset('turtle',1,'snap','weapon',80),null);
images.length=0;drawEnv.FighterAssets.draw(ctx,'turtle',150,400,80,'blue',{level:2,action:'snap',time:5000});assert(images.at(-1)[0].url.includes('/turtle/attack.webp'),'failed Evolved Turtle attack falls back to Base');
console.log('PASS: Turtle bite/shell cues mirror inside full shell/foot envelope; Base cues and failed-pose fallback retained');
