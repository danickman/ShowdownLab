'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('v3/arena-art.js','utf8'),floor=fs.readFileSync('v3/arena-stage.js','utf8');
let creates=0,paints=0,filters=0,composites=0;
const G=()=>({addColorStop(){}});
const off={filter:'none',save(){},restore(){},beginPath(){},rect(){},clip(){},fillRect(){},setTransform(){},
 createLinearGradient:G,drawImage(img,...a){paints++;if(this.filter!=='none')filters++;assert(a.every(Number.isFinite))}};
const e={window:null,devicePixelRatio:3,Image:class{set src(x){this.naturalWidth=1774;this.naturalHeight=887;this.onload?.()}},
 document:{createElement(){creates++;return{width:0,height:0,getContext:()=>off}}}};e.window=e;vm.createContext(e);vm.runInContext(src,e);
const main={drawImage(img,...a){composites++;assert(a.every(Number.isFinite))},...off};
main.drawImage=(img,...a)=>{composites++;assert(a.every(Number.isFinite))};
const draw=(name,w=430,h=320)=>assert(e.ArenaArt.drawSky(main,name,w,h));
draw('SUNLIT LAB');assert.equal(creates,1);assert.equal(paints,1);
for(let i=0;i<200;i++)draw('SUNLIT LAB');
assert.equal(creates,1,'cold canvas rebuilt on same scene');assert.equal(paints,1,'static source repainted every frame');
assert.equal(composites,201,'one cached composition per frame');
draw('CRYSTAL TERRACE');assert.equal(creates,2);assert.equal(filters,1);
for(let i=0;i<30;i++)draw('CRYSTAL TERRACE');assert.equal(creates,2);
draw('SOLAR COLOSSEUM');assert.equal(filters,2);
draw('SIEGE RUINS',375,220);draw('SIEGE RUINS',390,280);assert.equal(creates,5);
assert.equal(e.ArenaArt.drawSky(main,'UNKNOWN',390,280),false);
assert.equal(src.includes('Math.sqrt(1000000/(w*h))'),true,'bounded DPR cap missing');
const c={save(){},restore(){},beginPath(){},closePath(){},clip(){},fill(){},stroke(){},rect(){},
 fillRect(){},strokeRect(){},drawImage(){},setTransform(){},moveTo(){},lineTo(){},
 ellipse(){},arc(){},quadraticCurveTo(){},translate(){},rotate(){},scale(){},
 createLinearGradient:G};
e.document.createElement=()=>({width:0,height:0,getContext:()=>c});
vm.runInContext(floor,e);
for(const theme of [{dressing:'crystal',floor:['#eee','#ddd','#ccc'],stone:'#aaa',joint:'#888'},{dressing:'solar',floor:['#eee','#ddd','#ccc'],stone:'#aaa',joint:'#888'}]){
 assert(e.ArenaStage.drawFloor(c,430,932,300,theme));
}
console.log('PASS: cached source/filter once across 231 warmed sky draws; bounded rebuild 375/390/430 and distinct Crystal/Solar geometry');
