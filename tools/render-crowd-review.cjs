const fs=require('fs'),vm=require('vm'),assert=require('assert');const {createCanvas,Image}=require('@napi-rs/canvas');
class AssetImage extends Image{set src(src){try{super.src=fs.readFileSync(src.split('?')[0].replace(/^\//,''))}catch{this.onerror?.()}}get naturalWidth(){return this.width}get naturalHeight(){return this.height}}
let old=false;const cp=require('child_process'),baseline='00cbdc2c69a7c15ccd668dd8a4fe485c5ef246ef';
const read=file=>old&&['v3/combat-staging.js','v3/arena-floor-art.js'].includes(file)?cp.execFileSync('git',['show',baseline+':'+file],{encoding:'utf8'}):fs.readFileSync(file,'utf8');
async function env(){
 const e={console,Image:AssetImage,CustomEvent:class{},performance:{now:()=>5000},scars:[],spellMarks:[],dispatchEvent(){},spectacleTier:()=> 'full',document:{createElement:()=>createCanvas(1,1)},devicePixelRatio:2};e.window=e;vm.createContext(e);
 for(const f of ['evolved-knight','evolved-beetank','evolved-goose','evolved-sniper','evolution-rules','asset-renderer','camera','arena-floor-art','arena-art','arena-ambience','battle-theatre','arena-stage','combat-staging'])vm.runInContext(read('v3/'+f+'.js'),e);
 await new Promise(r=>setTimeout(r,1400));const src=read('v3/v3.js');
 vm.runInContext(src.slice(src.indexOf('function spritePoint('),src.indexOf('function effectScale(')),e);
 vm.runInContext(src.slice(src.indexOf('const ARENAS='),src.indexOf(';const arenaFor='))+';window.themes=ARENAS',e);
 e.arenaFor=()=>e.themes[(e.state.round-1)%4];e.teamRatio=team=>{const us=e.state.units.filter(u=>u.team===team);return us.reduce((sum,u)=>sum+u.hp,0)/us.reduce((sum,u)=>sum+u.maxHp,0)};
 e.renderFighter=(...args)=>e.FighterAssets.draw(...args);vm.runInContext(src.slice(src.indexOf('function arena('),src.indexOf('function drawDefeated(')),e);return e
}
function snapshots(){
 let time=0,next=1,queue=new Map();const c={window:{dispatchEvent(){}},console,CustomEvent:class{},Math,performance:{now:()=>time},requestAnimationFrame:f=>{const id=next++;queue.set(id,f);return id},cancelAnimationFrame:id=>queue.delete(id)};vm.createContext(c);
 for(const f of ['legacy-sim-core','simulation-adapter']){vm.runInContext(fs.readFileSync('v3/'+f+'.js','utf8'),c);Object.assign(c,c.window)}
 const api=c.window.ShowdownAdapter,blue={knight:6,sniper:2},red={beetank:2,goose:4,barbarian:2},levels=a=>Object.fromEntries(Object.keys(a).map(t=>[t,5]));
 api.startMatch({blue,red,blueLevels:levels(blue),redLevels:levels(red),blueLives:1,redLives:1,seed:997});api.setSpeed(1);
 const frames=[];for(let frame=1;frame<=540;frame++){time+=16.667;const q=[...queue.values()];queue.clear();for(const f of q)f(time);if(frame%180===0){const state=api.getState();assert(state.units.some(u=>u.hp>0));frames.push({state,time})}}
 return frames;
}
(async()=>{
 const frames=snapshots(),out=createCanvas(780,844*frames.length),ctx=out.getContext('2d');
 for(let column=0;column<2;column++){
  old=column===0;const e=await env(),src=read('v3/v3.js');vm.runInContext(src.slice(src.indexOf('function effectScale('),src.indexOf('function draw(time)')),e);
  for(let row=0;row<frames.length;row++){
   const {state,time}=frames[row],cv=createCanvas(390,844),units=state.units.filter(u=>u.hp>0),before=JSON.stringify(state);e.ArenaFloorArt.draw(cv.getContext('2d'),390,550,'garden');await new Promise(r=>setTimeout(r,500));
   Object.assign(e,{state:{...state,round:2,units},ctx:cv.getContext('2d'),prev:new Map(),fx:[],defeated:new Map(),comicGate:new Map(),scars:[],spellMarks:[],storyGate:new Set(),shake:0,flash:0,lastImpact:0,cap:t=>t,impactPunch:null,view:{w:390,h:844},staging:e.CombatStaging.create()});
   e.FighterAssets.resetPoseMemory();e.cam=e.ShowdownCamera.create(390,844);for(let n=0;n<100;n++){e.cam.focus(units);e.staging.prepare(units,e.cam,n*16)}
   e.arena(time);for(const u of [...units].sort((a,b)=>e.spritePoint(a).y-e.spritePoint(b).y))e.drawUnit(u,units.length,time);
   e.ctx.fillStyle='#203339';e.ctx.font='bold 16px sans-serif';e.ctx.fillText(`${column?'Current':'Prior'} · seed 997 · ${(time/1000).toFixed(0)}s · ${units.length} alive`,16,30);
   assert.equal(JSON.stringify(state),before);assert.equal(e.ctx.globalAlpha,1);ctx.drawImage(cv,column*390,row*844);
  }
 }
 fs.writeFileSync(process.argv[2]||'../crowd-live-review.png',out.toBuffer('image/png'));console.log('PASS: six native before/after frames from the actual seeded 1× combat core; snapshots unchanged');
})().catch(err=>{console.error(err);process.exitCode=1});
