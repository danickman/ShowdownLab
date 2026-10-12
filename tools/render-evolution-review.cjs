// Native render QA; run from repo root. Requires @napi-rs/canvas.
const fs=require('fs'),vm=require('vm'),assert=require('assert');const {createCanvas,Image}=require('@napi-rs/canvas');
class AssetImage extends Image{set src(s){try{super.src=fs.readFileSync(s.split('?')[0].replace(/^\//,''))}catch{this.onerror?.()}}get naturalWidth(){return this.width}get naturalHeight(){return this.height}}
(async()=>{
 const e={Image:AssetImage,console,dispatchEvent(){},CustomEvent:class{},document:{createElement:()=>createCanvas(1,1)}};e.window=e;vm.createContext(e);
 for(const f of ['evolved-knight','evolved-beetank','evolved-goose','evolved-sniper','evolved-dragon','asset-renderer'])vm.runInContext(fs.readFileSync(`v3/${f}.js`,'utf8'),e);
 await new Promise(r=>setTimeout(r,300));
 const cv=createCanvas(1820,620),c=cv.getContext('2d');c.fillStyle='#ede5c8';c.fillRect(0,0,1820,620);
 const type=process.argv[2]||'beetank',actions=type==='dragon'?['idle','stalk','attack','guard_close','fire','hit','defeat']:type==='sniper'?['idle','move','attack','guard_close','aim','hit','defeat']:type==='goose'?['idle','waddle','peck','guard','honk','hit','defeat']:['idle','bulldoze','horn','brace','ram','hit','defeat'];
 for(let row=0;row<2;row++)for(let i=0;i<7;i++){
  c.fillStyle='#24353a';c.font='18px sans-serif';c.fillText(`${row?'Evolved L5':'Base L1'} · ${actions[i]}`,i*260+10,row*310+30);
  c.strokeStyle='#b9b092';c.beginPath();c.moveTo(i*260,row*310+250);c.lineTo(i*260+260,row*310+250);c.stroke();
  e.FighterAssets.draw(c,type,i*260+130,row*310+250,85,'blue',{level:row?5:1,action:actions[i],time:5000});
 }
 assert.equal(e.FighterAssets.diagnostics().errors,0);assert.equal(e.FighterAssets.diagnostics().ready,e.FighterAssets.diagnostics().total,'every portrait/pose must finish decoding');
 fs.writeFileSync('../'+type+'-evolution-registration.png',cv.toBuffer('image/png'));console.log('PASS: Base/Evolved native seven-pose review; all assets decoded');
})();
