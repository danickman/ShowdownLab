// Run with node tools/check-presentation.cjs. No browser or npm dependencies.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');
class ReadyImage{set src(value){this.url=value;if(value.includes('__missing__')){this.onerror?.();return}this.naturalWidth=this.naturalHeight=96;this.onload?.()}}
const runtime={Image:ReadyImage,CustomEvent:class{},dispatchEvent(){},console};runtime.window=runtime;vm.createContext(runtime);
for(const file of ['asset-renderer.js','camera.js'])vm.runInContext(fs.readFileSync(path.join(root,'v3',file),'utf8'),runtime);
const assets=runtime.FighterAssets,types=Object.keys(assets.authored);
const kindFor=t=>t==='dragon'?'large':['beetank','turtle'].includes(t)?'heavy':['goblin','goose'].includes(t)?'small':'normal';
let checked=0;
for(const [width,height]of [[320,568],[375,667],[390,700],[390,844],[768,1024]]){
  for(const count of [2,8,24,60,180])for(const layout of ['cluster','corners','spread']){
    const units=Array.from({length:count},(_,i)=>({id:i,type:types[i%10],team:i%2?'red':'blue',hp:100,
      x:layout==='cluster'?.42+(i%4)*.04:layout==='corners'?(i%2?.94:.06):.08+(i*37%89)/100,
      y:layout==='cluster'?.36+(Math.floor(i/4)%3)*.04:layout==='corners'?(i%3?.92:.08):.06+(i*29%89)/100}));
    const original=JSON.stringify(units),camera=runtime.ShowdownCamera.create(width,height);
    for(const frames of [1,120]){
      for(let i=0;i<frames;i++)camera.focus(units);
      for(const unit of units){
        const p=camera.worldToScreen(unit.x,unit.y),spec=assets.authored[unit.type];
        const size=camera.unitSize(kindFor(unit.type),count),spriteHeight=size*spec.scale*(spec.inkBoost||1),a=camera.arena;
        assert(p.x-spriteHeight/2>=a.x-1,'left equipment bounds');
        assert(p.x+spriteHeight/2<=a.x+a.w+1,'right equipment bounds');
        assert(p.y-spriteHeight*spec.anchor[1]>=a.y-1,'head bounds');
        assert(p.y+spriteHeight*(1-spec.anchor[1])<=a.y+a.h+1,'feet bounds');
        checked++;
      }
    }
    assert.equal(JSON.stringify(units),original,'camera must not mutate combat state');
  }
}
// Exercise the real renderer dispatch, with a minimal Canvas interface.
const calls=[],context={canvas:{width:200,height:200},save(){},restore(){},beginPath(){},fill(){},stroke(){},translate(){},rotate(){},scale(){},
  ellipse(...args){calls.push({kind:'ring',y:args[1]})},drawImage(image){calls.push({kind:'art',url:image.url})}};
assets.draw(context,'sniper',100,160,70,'blue',{action:'idle'});
assert(calls.filter(x=>x.kind==='ring').every(x=>x.y===160),'ring must use the foot anchor');
assert.equal(calls.at(-1).kind,'art','ring belongs behind the fighter');
assert(calls.at(-1).url.includes('/sniper/idle.webp'));
let fallback;runtime.FighterArt={draw(...args){fallback=args}};assets.authored.sniper.urls.idle='/__missing__.webp';assets.draw(context,'sniper',100,160,70,'blue',{action:'idle'});assert.equal(fallback[3],160-70*.43,'procedural shadow must share the ground point');
console.log(`PASS: ${checked} full-sprite camera bounds, state immutability, foot-grounded ring and render order`);
