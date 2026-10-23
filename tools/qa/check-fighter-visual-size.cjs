'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const art=read('v3/asset-renderer.js'),cam=read('v3/camera.js'),names=['knight','sniper','goose','dragon','assassin','beetank','mole','turtle','goblin','barbarian'];
assert(cam.includes('e?(e.above+e.below):0')&&!cam.includes('2*e.left,2*e.right'),'horizontal weapon reach must not cap fighter height');
assert(cam.includes("kind==='large'?maxSpriteHeight*1.30:maxSpriteHeight"),'large Dragon class must keep intentional extra vertical room');
const window={ShowdownEvolution:{tier:n=>n>=4?'ultimate':n>=2?'evolved':'base',normalize:n=>Math.max(1,Math.min(5,n||1)),accent:n=>n===3||n===5},matchMedia:()=>({matches:false}),dispatchEvent(){},document:{createElement:()=>({})}};
class DummyImage{set src(v){this.uri=v}get naturalWidth(){return 0}get naturalHeight(){return 0}}
const ctx={window,Image:DummyImage,CustomEvent:class{},Map,Set,WeakMap,Date,Math,console};
for(const type of names)for(const form of ['evolved','ultimate'])vm.runInNewContext(read('v3/'+form+'-'+type+'.js'),ctx);
vm.runInNewContext(art,ctx);vm.runInNewContext(cam,ctx);
const f=window.FighterAssets,camera=window.ShowdownCamera.create(430,932,{top:300,bottom:95}),measured={};
assert.equal(Object.keys(f.combatIdleHeights).length,10);
assert(cam.includes("kind==='heavy'?83:kind==='small'?80"),'phone-size calibration missing');
const kind=t=>t==='dragon'?'large':['beetank','turtle'].includes(t)?'heavy':['goose','goblin'].includes(t)?'small':'normal';
for(const form of ['evolved','ultimate'])for(const t of names){
 const pack=window[t[0].toUpperCase()+t.slice(1)+(form==='evolved'?'EvolvedArt':'UltimateArt')],k=pack.scale/pack.referenceHeight,p=pack.poses.idle;
 const factor=f.combatBodyScale(t,p.width*k,p.height*k,pack);
 assert(factor>.4&&factor<1.6,'unreasonable body factor '+t+' '+form+' '+factor);
 for(const stance of Object.values(pack.poses))assert(Math.abs(f.combatBodyScale(t,stance.width*k,stance.height*k,pack)-factor)<1e-10,'visible size pops between stances '+t+' '+form);
 const height=p.height*k*factor*camera.unitSize(kind(t),20),goal=f.combatIdleHeights[t]*(form==='ultimate'?(f.intentionalUltimateGrowth[t]||1):1);
 assert(Math.abs(p.height*k*factor-goal)<.20,'wrong canonical form reference '+t+' '+form);
 const envelope=f.visualEnvelope(t,form==='evolved'?2:4);
 assert(envelope.above>0&&envelope.left>0&&envelope.right>0,'missing camera envelope');
 measured[t+':'+form]=+height.toFixed(2);
}
for(const form of ['evolved','ultimate']){
 const H=t=>measured[t+':'+form];
 assert(H('beetank')>H('goose')*1.3,'Beetank physically smaller than Goose');
 assert(H('beetank')>H('goblin')*1.3,'Beetank physically smaller than Goblin');
 assert(H('turtle')>H('goose')*1.2,'Turtle physically smaller than Goose');
 assert(H('dragon')>H('beetank')*.95,'Dragon physically dwarfed');
 // Portrait scale harmony: readable species hierarchy without extreme silhouette gaps.
 assert(H('goose')>H('sniper')*.85,'Goose rendered miniature beside Sniper');
 assert(H('goblin')>H('goose')*.90,'Goblin rendered miniature beside Goose');
 assert(H('beetank')<H('goose')*1.50,'Beetank dwarfs Goose');
 assert(H('turtle')<H('goose')*1.45,'Turtle dwarfs Goose');
}
assert(art.includes('if(!o.presentation){const rawH=h/size,rawW=rawH*ratio;h*=combatBodyScale(type,rawW,rawH,registration)}'),'must not alter static Guide size');
console.log('PASS consistent L2/L4 idle/move/attack scale, horizontal-versus-vertical camera, genuine heavy > small at 430x932 '+JSON.stringify(measured));
