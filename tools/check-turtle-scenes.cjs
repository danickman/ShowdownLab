const fs=require('fs'),vm=require('vm'),assert=require('assert');const {createCanvas,Image}=require('@napi-rs/canvas');
class AssetImage extends Image{set src(src){this.assetUrl=src;try{super.src=fs.readFileSync(src.split('?')[0].replace(/^\//,''))}catch{this.onerror?.()}}get naturalWidth(){return this.width}get naturalHeight(){return this.height}}
const read=file=>fs.readFileSync(file,'utf8');
async function env(){
 const e={console,Image:AssetImage,CustomEvent:class{},performance:{now:()=>5000},scars:[],spellMarks:[],dispatchEvent(){},spectacleTier:()=> 'full',document:{createElement:()=>createCanvas(1,1)},devicePixelRatio:2};e.window=e;vm.createContext(e);
 for(const f of ['evolved-knight','evolved-beetank','evolved-goose','evolved-sniper','evolved-dragon','evolved-assassin','evolved-mole','evolved-turtle','evolution-rules','ultimate-effects','asset-renderer','camera','arena-floor-art','arena-art','arena-ambience','battle-theatre','arena-stage','combat-staging'])vm.runInContext(read('v3/'+f+'.js'),e);
 await new Promise(r=>setTimeout(r,1400));const src=read('v3/v3.js');
 vm.runInContext(src.slice(src.indexOf('function spritePoint('),src.indexOf('function effectScale(')),e);
 vm.runInContext(src.slice(src.indexOf('const ARENAS='),src.indexOf(';const arenaFor='))+';window.themes=ARENAS',e);
 e.arenaFor=()=>e.themes[(e.state.round-1)%4];e.teamRatio=team=>{const us=e.state.units.filter(u=>u.team===team);return us.reduce((sum,u)=>sum+u.hp,0)/us.reduce((sum,u)=>sum+u.maxHp,0)};
 e.renderFighter=(...args)=>e.FighterAssets.draw(...args);vm.runInContext(src.slice(src.indexOf('function arena('),src.indexOf('function drawDefeated(')),e);return e
}



(async()=>{const e=await env();
const drawn=[],probe={canvas:{width:390,height:844},globalAlpha:1,save(){},restore(){},beginPath(){},ellipse(){},fill(){},stroke(){},translate(){},rotate(){},scale(){},drawImage(...args){drawn.push(args)}};
for(const [action,pose]of [['idle','idle'],['trudge','move'],['snap','attack'],['brace','guard'],['shell_slam','signature'],['hit','hit'],['defeat','defeat']]){drawn.length=0;e.FighterAssets.draw(probe,'turtle',150,400,80,'blue',{level:2,action,time:5000});const [img,x,y,w,h]=drawn.at(-1);assert(img.assetUrl.includes('/turtle/evolved/'+pose+'.webp'));assert(Math.abs(h/img.naturalHeight-80*1.12/168.4)<.001)}
console.log('PASS: seven actual decoded Turtle poses at L2 use their distinct files and one shared anatomy scale');
const check=createCanvas(390,550);assert(e.ArenaFloorArt.draw(check.getContext('2d'),390,550,'academy'));const src=fs.readFileSync('v3/v3.js','utf8');vm.runInContext(src.slice(src.indexOf('function effectScale('),src.indexOf('function draw(time)')),e);
const out=createCanvas(390*4,844*2),oc=out.getContext('2d');
for(let scene=0;scene<8;scene++){
 e.ArenaFloorArt.draw(check.getContext('2d'),390,550,e.themes[scene%4].dressing);
 await new Promise(r=>setTimeout(r,1400));
 const cv=createCanvas(390,844);Object.assign(e,{ctx:cv.getContext('2d'),prev:new Map(),fx:[],defeated:new Map(),comicGate:new Map(),scars:[],spellMarks:[],storyGate:new Set(),shake:0,flash:0,lastImpact:0,cap:t=>t,impactPunch:null,view:{w:390,h:844},staging:e.CombatStaging.create()});
 const units=scene>=4?Array.from({length:2},(_,i)=>({id:i+1,type:i?'sniper':'turtle',team:i?'red':'blue',x:i?.77:.25,y:.60,hp:100,maxHp:100,action:'idle',target:i?1:2,ward:0,level:5})):Array.from({length:8},(_,i)=>({id:i+1,type:i<2?'turtle':i<4?'knight':i<6?'sniper':'beetank',team:i<4?'blue':'red',x:i<4?.37+(i%2)*.035:.60+(i%2)*.035,y:.31+(i%4)*.14,hp:100,maxHp:100,action:'idle',target:i<4?i+5:i-3,ward:0,level:5}));
 e.FighterAssets.resetPoseMemory();
 e.state={round:scene%4+1,speed:1,tick:1,units};e.cam=e.ShowdownCamera.create(390,844);for(let i=0;i<100;i++){e.cam.focus(units);e.staging?.prepare(units,e.cam,i*16)}e.spawnFX(e.state);
 e.state={round:scene%4+1,speed:1,tick:2,units:units.map((u,i)=>({...u,hp:i===4?55:100,ultimateTick:i===0?2:undefined,ultimateKind:i===0?'reflect':undefined,action:i===0?'snap':i===1?(scene>=4?'aim':'shell_slam'):i===4?'attack':i===5?'aim':'idle'}))};e.spawnFX(e.state);
 const shot=e.fx.find(f=>f.kind==='impactArc'),firing=e.state.units[0],expected=e.fighterCue(firing,'weapon',1);assert(shot);const ultimate=e.fx.find(f=>f.kind==='ultimateCue');assert(ultimate&&ultimate.worldX===firing.x&&ultimate.worldY===firing.y,'Ultimate cue captures onset world position');assert.deepEqual(ultimate.stageOffset,e.staging.offset(firing.id));assert(Math.abs(shot.x-expected.x)<.01&&Math.abs(shot.y-expected.y)<.01,'emitted slash matches registered mouth');
 e.arena(5050);for(const u of [...e.state.units].sort((a,b)=>e.spritePoint(a).y-e.spritePoint(b).y))e.drawUnit(u,units.length,5050);e.drawFX(5050);
 assert.equal(e.ctx.globalAlpha,1);oc.drawImage(cv,(scene%4)*390,Math.floor(scene/4)*844);
}
// Exercise active evolved rendering in ordinary and extreme crowds on every arena.
for(const count of [24,180])for(const round of [1,2,3,4]){
 const cv=createCanvas(390,844);Object.assign(e,{ctx:cv.getContext('2d'),prev:new Map(),fx:[],defeated:new Map(),comicGate:new Map(),scars:[],spellMarks:[],storyGate:new Set(),shake:0,flash:0,lastImpact:0,cap:t=>t,impactPunch:null,view:{w:390,h:844},staging:e.CombatStaging.create()});
 const units=Array.from({length:count},(_,i)=>({id:i+1,type:i%3===0?'turtle':i%3===1?'knight':'goose',level:i%2?2:5,team:i%2?'red':'blue',x:.1+(i%8)*.1,y:.12+(Math.floor(i/8)%10)*.08,hp:100,maxHp:100,action:'idle',target:(i+1)%count+1}));
 e.FighterAssets.resetPoseMemory();e.state={round,speed:1,tick:1,units};e.cam=e.ShowdownCamera.create(390,844);for(let n=0;n<90;n++){e.cam.focus(units);e.staging.prepare(units,e.cam,n*16)}e.spawnFX(e.state);
 e.state={...e.state,tick:2,units:units.map(u=>({...u,ultimateTick:2,ultimateKind:u.type==='turtle'?'reflect':u.type==='knight'?'bastion':'thunder',action:u.type==='turtle'?'snap':'idle'}))};e.spawnFX(e.state);assert.equal(e.fx.filter(f=>f.kind==='ultimateCue').length,count===24?6:0,'Ultimate emission cap/dense suppression');e.arena(5050);for(const u of e.state.units)e.drawUnit(u,count,5050);e.drawFX(5050);
 assert.equal(e.ctx.globalAlpha,1);assert(e.fx.length<=94);assert.equal(e.FighterAssets.diagnostics().errors,0);assert.equal(e.FighterAssets.diagnostics().ready,e.FighterAssets.diagnostics().total,'every portrait/pose must finish decoding');
}
console.log('PASS: active L2/L5 packs in eight ordinary/dense arena renders; bounded effects and Canvas state');
fs.writeFileSync(process.argv[2]||'../turtle-arena-native.png',out.toBuffer('image/png'));console.log('PASS: four native daylight arenas in duel and mixed-crowd scenes with Evolved Turtle bite/shell-slam with Sniper and Knight; aligned FX and balanced Canvas');})();
