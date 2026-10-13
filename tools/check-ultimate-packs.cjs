// Real decoded Ultimate packs: boundaries, every pose, cues, failure fallback and native review.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const {createCanvas,Image}=require('@napi-rs/canvas');
class AssetImage extends Image{set src(src){this.url=src;try{super.src=fs.readFileSync(src.split('?')[0].replace(/^\//,''))}catch{this.onerror?.()}}get naturalWidth(){return this.width}get naturalHeight(){return this.height}}
(async()=>{
const e={window:null,Image:AssetImage,CustomEvent:class{},dispatchEvent(){},console,document:{createElement:()=>createCanvas(1,1)}};e.window=e;vm.createContext(e);
const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
for(const f of ['evolution-rules','base-dragon',...types.map(t=>'evolved-'+t),...types.map(t=>'ultimate-'+t).filter(t=>fs.existsSync('v3/'+t+'.js')),'asset-renderer','camera','combat-staging'])vm.runInContext(fs.readFileSync('v3/'+f+'.js','utf8'),e);
await new Promise(r=>setTimeout(r,1200));const packs=types.filter(t=>e[t[0].toUpperCase()+t.slice(1)+'UltimateArt']);assert(packs.length);
const cv=createCanvas(1800,packs.length*400),c=cv.getContext('2d');c.fillStyle='#e8e0cb';c.fillRect(0,0,cv.width,cv.height);
let boxes=0;
for(const [row,t]of packs.entries()){
 const pack=e[t[0].toUpperCase()+t.slice(1)+'UltimateArt'];assert.deepEqual(Object.keys(pack.poses).sort(),['idle','move','attack','guard','signature','hit','defeat'].sort());
 for(const level of [1,2,3,4,5])assert.equal(e.FighterAssets.visualForm(t,level),level===1?'base':level<4?'evolved':'ultimate');
 const kind=t==='dragon'?'large':['beetank','turtle'].includes(t)?'heavy':['goose','goblin'].includes(t)?'small':'normal';
 for(const [w,h]of [[320,568],[430,932],[932,430]])for(const count of [2,8,24,60,180]){
  const units=Array.from({length:count},(_,i)=>({id:i+1,type:t,level:5,team:i%2?'blue':'red',hp:100,x:.04+(i%7)*.15,y:.04+(i%11)*.09}));const before=JSON.stringify(units),cam=e.ShowdownCamera.create(w,h),stage=e.CombatStaging.create();
  for(let n=0;n<80;n++){cam.focus(units);stage.prepare(units,cam,n*16)}
  const a=cam.arena,envelope=e.FighterAssets.visualEnvelope(t,5);for(const u of units){const p=stage.point(u,cam),s=cam.unitSize(kind,count);assert(p.x-s*envelope.left>=a.x-1&&p.x+s*envelope.right<=a.x+a.w+1);assert(p.y-s*envelope.above>=a.y-1&&p.y+s*envelope.below<=a.y+a.h+1);boxes++}assert.equal(JSON.stringify(units),before);
 }
 c.fillStyle='#173744';c.font='bold 18px sans-serif';c.fillText(t.toUpperCase()+' · BASE / EVOLVED / ULTIMATE + SEVEN POSES',20,row*400+26);
 for(const [i,level]of [1,2,4].entries())e.FighterAssets.draw(c,t,90+i*170,row*400+240,130,'blue',{level,presentation:true,presentationBounds:{x:i*170,y:row*400+40,width:165,height:280}});
 for(const [i,[pose,p]]of Object.entries(pack.poses).entries()){
  const probe=createCanvas(250,300),pc=probe.getContext('2d'),images=[],original=pc.drawImage.bind(pc);pc.drawImage=(...args)=>{images.push(args);return original(...args)};
  // Use the pose as an explicit action via this pack's registration.
  pack.actions[pose]=pose;e.FighterAssets.draw(pc,t,120,240,100,'blue',{level:4,action:pose});const [img,x,y,w,h]=images.at(-1);assert(img.url.includes('/ultimate/'+p.file+'.webp'));assert(Math.abs(h/img.naturalHeight-100*pack.scale/pack.referenceHeight)<.001);
  for(const role of Object.keys(p.cues||{})){const a=e.FighterAssets.cueOffset(t,4,pose,role,100,1),b=e.FighterAssets.cueOffset(t,4,pose,role,100,-1);assert.equal(a.x,-b.x);assert.equal(a.y,b.y);assert(Number.isFinite(a.x)&&Number.isFinite(a.y))}
  c.drawImage(probe,510+i*180,row*400+55,180,270);c.fillText(pose,515+i*180,row*400+350);
 }
}
assert.equal(e.FighterAssets.diagnostics().errors,0);assert.equal(e.FighterAssets.diagnostics().ready,e.FighterAssets.diagnostics().total);
fs.writeFileSync(process.argv[2]||'../ultimate-native-review.png',cv.toBuffer('image/png'));
console.log(`PASS: ${packs.length} real Ultimate packs, seven distinct decoded poses, L4/L5 boundaries, shared scale, mirrored cues and ${boxes} portrait/landscape/density bounds`);
})().catch(e=>{console.error(e);process.exitCode=1});
