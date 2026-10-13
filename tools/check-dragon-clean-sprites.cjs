// Dragon artwork must remain a single unfiltered source image in every form.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
let offscreen=0;
class Image{set src(value){this.assetUrl=value;this.naturalWidth=400;this.naturalHeight=400;this.onload?.()}}
const e={console,Image,CustomEvent:class{},dispatchEvent(){},document:{createElement(){offscreen++;return null}}};e.window=e;vm.createContext(e);
for(const f of ['evolution-rules','base-dragon','evolved-dragon','ultimate-dragon','asset-renderer'])vm.runInContext(fs.readFileSync('v3/'+f+'.js','utf8'),e);
const calls=[],filters=[],probe={canvas:{width:430,height:500},globalAlpha:1,save(){},restore(){},beginPath(){},ellipse(){},fill(){},stroke(){},moveTo(){},lineTo(){},translate(){},rotate(){},scale(){},drawImage(img){calls.push(img)},set filter(v){filters.push(v)}};
let cases=0;
for(const level of [1,2,3,4,5])for(const action of ['idle','move','attack','guard','fire','hit','defeat'])for(const flip of [false,true])for(const density of [2,60]){
 calls.length=0;filters.length=0;assert(e.FighterAssets.draw(probe,'dragon',180,400,100,'blue',{level,action,flip,density}));
 assert.equal(calls.length,1,'extra silhouette image pass');assert.equal(filters.length,0,'sprite color filter');assert.equal(offscreen,0,'procedural bitmap overlay');
 const form=level>=4?'ultimate/':level>=2?'evolved/':'';assert(calls[0].assetUrl.includes('/dragon/'+form));cases++;
}
for(const level of [1,2,3,4,5]){calls.length=0;assert(e.FighterAssets.draw(probe,'dragon',180,400,100,'blue',{level,presentation:true}));assert.equal(calls.length,1);assert(calls[0].assetUrl.includes('presentation.webp'));assert.equal(offscreen,0,'canonical must use unprocessed source');cases++}
console.log(`PASS: ${cases} Dragon render cases, all five levels/seven poses/both facings/density fallbacks and canonical portraits use one clean image without silhouette or contrast passes`);
