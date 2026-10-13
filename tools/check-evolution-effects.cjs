const fs=require('fs'),vm=require('vm'),assert=require('assert'),{createCanvas,Image}=require('@napi-rs/canvas');
class AssetImage extends Image{set src(src){try{super.src=fs.readFileSync(src.split('?')[0].replace(/^\//,''))}catch{this.onerror?.()}}get naturalWidth(){return this.width}get naturalHeight(){return this.height}}
(async()=>{
 let reduced=false;const e={window:null,Image:AssetImage,CustomEvent:class{},dispatchEvent(){},console,matchMedia:()=>({get matches(){return reduced}}),document:{createElement:()=>createCanvas(1,1)}};e.window=e;vm.createContext(e);
 for(const f of ['evolution-rules','ultimate-abilities','ultimate-effects','evolved-knight','evolved-beetank','evolved-goose','evolved-sniper','evolved-dragon','evolved-assassin','evolved-mole','evolved-turtle','evolved-goblin','evolved-barbarian','base-dragon','ultimate-knight','ultimate-dragon','ultimate-barbarian','ultimate-goblin','ultimate-beetank','ultimate-turtle','ultimate-mole','ultimate-sniper','ultimate-assassin','ultimate-goose','asset-renderer'])vm.runInContext(fs.readFileSync('v3/'+f+'.js','utf8'),e);
 await new Promise(r=>setTimeout(r,1200));
 const cv=createCanvas(1500,2000),c=cv.getContext('2d'),types=['knight','sniper','dragon','assassin','beetank','goose','mole','turtle','goblin','barbarian'],ability={knight:'bastion',sniper:'pierce',dragon:'inferno',assassin:'execution',beetank:'seismic',goose:'thunder',mole:'carapace',turtle:'reflect',goblin:'pack',barbarian:'cleave'};
 c.fillStyle='#ece3c7';c.fillRect(0,0,cv.width,cv.height);
 for(let row=0;row<types.length;row++)for(let level=1;level<=5;level++){
  const x=(level-1)*300+150,y=row*200+175,type=types[row];c.fillStyle='#27352e';c.font='17px sans-serif';c.fillText(type+' L'+level+' · '+e.ShowdownEvolution.label(level),x-140,row*200+22);
  e.FighterAssets.draw(c,type,x,y,92,'blue',{id:null,level,action:'idle',time:5000,density:6});
  if(level>=4)e.UltimateEffects.draw(c,{x,y,size:45,level,ability:ability[type],end:{x:x+80,y:y-35},cueY:-65},.25,'full');
  assert.equal(c.globalAlpha,1);assert.equal(c.shadowBlur,0);
 }
 assert.equal(e.FighterAssets.diagnostics().ready,e.FighterAssets.diagnostics().total);
 fs.writeFileSync(process.argv[2]||'../evolution-five-tiers.png',cv.toBuffer('image/png'));
 // Every ability cue has a finite short lifetime and balances Canvas state in every tier.
 for(const kind of ['bastion','pierce','inferno','execution','seismic','carapace','reflect','pack','cleave','thunder'])for(const tier of ['full','balanced','reduced','minimal'])for(const level of [4,5])for(const motion of [false,true]){
  reduced=motion;c.save();c.globalAlpha=.7;c.shadowBlur=0;const previousAlpha=c.globalAlpha;
  e.UltimateEffects.draw(c,{x:150,y:150,size:45,level,ability:kind,end:{x:200,y:110},cueY:-45},.3,tier);
  assert.equal(c.globalAlpha,previousAlpha);assert.equal(c.shadowBlur,0);assert(e.UltimateEffects.life(tier)<=360);c.restore();
 }
 // Dense/minimal intermediate accents add no blurred sprite draws; only two static chevrons at most.
 for(const level of [3,5])for(const density of [8,24,180])for(const tier of ['full','reduced','minimal']){c.save();e.FighterAssets.draw(c,'knight',120,170,85,'red',{level,action:'idle',density,effectTier:tier});assert.equal(c.globalAlpha,1);assert.equal(c.shadowBlur,0);c.restore()}
 console.log('PASS: native five-tier review, all authored assets ready; ten finite ultimate effects in full/reduced/minimal modes and bounded L3/L5 accents; balanced Canvas');
})();
