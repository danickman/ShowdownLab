const fs=require('fs'),vm=require('vm'),assert=require('assert');const {createCanvas,Image}=require('@napi-rs/canvas');
class AssetImage extends Image{set src(src){this.assetUrl=src;try{super.src=fs.readFileSync(src.split('?')[0].replace(/^\//,''))}catch{this.onerror?.()}}get naturalWidth(){return this.width}get naturalHeight(){return this.height}}
const read=file=>fs.readFileSync(file,'utf8');
async function env(){
 const e={console,Image:AssetImage,CustomEvent:class{},performance:{now:()=>5000},scars:[],spellMarks:[],dispatchEvent(){},spectacleTier:()=> 'full',document:{createElement:()=>createCanvas(1,1)},devicePixelRatio:2};e.window=e;vm.createContext(e);
 for(const f of ['evolved-knight','evolved-beetank','evolved-goose','evolved-sniper','evolved-dragon','evolution-rules','base-dragon','asset-renderer','camera','arena-floor-art','arena-art','arena-ambience','battle-theatre','arena-stage','combat-staging'])vm.runInContext(read('v3/'+f+'.js'),e);
 await new Promise(r=>setTimeout(r,1400));const src=read('v3/v3.js');
 vm.runInContext(src.slice(src.indexOf('function spritePoint('),src.indexOf('function effectScale(')),e);
 vm.runInContext(src.slice(src.indexOf('const ARENAS='),src.indexOf(';const arenaFor='))+';window.themes=ARENAS',e);
 e.arenaFor=()=>e.themes[(e.state.round-1)%4];e.teamRatio=team=>{const us=e.state.units.filter(u=>u.team===team);return us.reduce((sum,u)=>sum+u.hp,0)/us.reduce((sum,u)=>sum+u.maxHp,0)};
 e.renderFighter=(...args)=>e.FighterAssets.draw(...args);vm.runInContext(src.slice(src.indexOf('function arena('),src.indexOf('function drawDefeated(')),e);return e
}



(async()=>{const e=await env();const check=createCanvas(390,550);assert(e.ArenaFloorArt.draw(check.getContext('2d'),390,550,'academy'));const src=fs.readFileSync('v3/v3.js','utf8');vm.runInContext(src.slice(src.indexOf('function effectScale('),src.indexOf('function draw(time)')),e);
const out=createCanvas(390*4,844),oc=out.getContext('2d');
for(let scene=0;scene<4;scene++){
 e.ArenaFloorArt.draw(check.getContext('2d'),390,550,e.themes[scene].dressing);
 await new Promise(r=>setTimeout(r,1400));
 const cv=createCanvas(390,844);Object.assign(e,{ctx:cv.getContext('2d'),prev:new Map(),fx:[],defeated:new Map(),comicGate:new Map(),scars:[],spellMarks:[],storyGate:new Set(),shake:0,flash:0,lastImpact:0,cap:t=>t,impactPunch:null,view:{w:390,h:844},staging:e.CombatStaging.create()});
 const units=Array.from({length:8},(_,i)=>({id:i+1,type:i<2?'dragon':i<4?'knight':i<6?'sniper':'beetank',team:i<4?'blue':'red',x:i<4?.37+(i%2)*.035:.60+(i%2)*.035,y:.31+(i%4)*.14,hp:100,maxHp:100,action:'idle',target:i<4?i+5:i-3,ward:0,level:1}));
 e.FighterAssets.resetPoseMemory();
 e.state={round:scene+1,speed:1,tick:1,units};e.cam=e.ShowdownCamera.create(390,844);for(let i=0;i<100;i++){e.cam.focus(units);e.staging?.prepare(units,e.cam,i*16)}e.spawnFX(e.state);
 e.state={round:scene+1,speed:1,tick:2,units:units.map((u,i)=>({...u,hp:i===4?55:100,action:i===0?'fire':i===1?'guard_close':i===4?'attack':i===5?'aim':'idle'}))};e.spawnFX(e.state);
 const shot=e.fx.find(f=>f.kind==='fire'),firing=e.state.units[0],expected=e.fighterCue(firing,'weapon',1);assert(shot);assert(Math.abs(shot.x-expected.x)<.01&&Math.abs(shot.y-expected.y)<.01,'emitted breath matches registered mouth');
 e.arena(5050);for(const u of [...e.state.units].sort((a,b)=>e.spritePoint(a).y-e.spritePoint(b).y))e.drawUnit(u,units.length,5050);e.drawFX(5050);
 assert.equal(e.ctx.globalAlpha,1);oc.drawImage(cv,scene*390,0);
}
// Exercise active evolved rendering in ordinary and extreme crowds on every arena.
for(const count of [24,180])for(const round of [1,2,3,4]){
 const cv=createCanvas(390,844);Object.assign(e,{ctx:cv.getContext('2d'),prev:new Map(),fx:[],defeated:new Map(),comicGate:new Map(),scars:[],spellMarks:[],storyGate:new Set(),shake:0,flash:0,lastImpact:0,cap:t=>t,impactPunch:null,view:{w:390,h:844},staging:e.CombatStaging.create()});
 const units=Array.from({length:count},(_,i)=>({id:i+1,type:i%3===0?'dragon':i%3===1?'knight':'goose',level:1,team:i%2?'red':'blue',x:.1+(i%8)*.1,y:.12+(Math.floor(i/8)%10)*.08,hp:100,maxHp:100,action:'idle',target:(i+1)%count+1}));
 e.FighterAssets.resetPoseMemory();e.state={round,speed:1,tick:1,units};e.cam=e.ShowdownCamera.create(390,844);for(let n=0;n<90;n++){e.cam.focus(units);e.staging.prepare(units,e.cam,n*16)}e.spawnFX(e.state);
 e.state={...e.state,tick:2,units:units.map(u=>({...u,action:u.type==='dragon'?'fire':'idle'}))};e.spawnFX(e.state);e.arena(5050);for(const u of e.state.units)e.drawUnit(u,count,5050);e.drawFX(5050);
 assert.equal(e.ctx.globalAlpha,1);assert(e.fx.length<=94);assert.equal(e.FighterAssets.diagnostics().errors,0);assert.equal(e.FighterAssets.diagnostics().ready,e.FighterAssets.diagnostics().total,'every portrait/pose must finish decoding');
}
console.log('PASS: active L1 Base packs in eight ordinary/dense arena renders; bounded effects and Canvas state');
fs.writeFileSync(process.argv[2]||'../dragon-base-arena-native.png',out.toBuffer('image/png'));console.log('PASS: four native daylight arenas with refreshed Base Dragon breath/brace with Sniper and Knight; aligned FX and balanced Canvas');})();
