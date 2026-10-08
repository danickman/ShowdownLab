// node tools/check-combat-cues.cjs — anchors, effect hierarchy, recoil/reset and shared image decode.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert'),root=path.resolve(__dirname,'..');
let decodes=0;class ReadyImage{set src(url){this.url=url;this.naturalWidth=this.naturalHeight=96;decodes++;this.onload?.()}}
const r={Image:ReadyImage,window:null,CustomEvent:class{},dispatchEvent(){},console};r.window=r;vm.createContext(r);
for(const name of ['battle-theatre','asset-renderer','arena-art'])vm.runInContext(fs.readFileSync(path.join(root,'v3',name+'.js'),'utf8'),r);
const transforms=[],ctx={canvas:{width:390,height:844},save(){},restore(){},beginPath(){},ellipse(){},fill(){},stroke(){},rect(){},clip(){},drawImage(){},rotate(){},scale(){},translate(...xy){transforms.push(xy)}};
const count=decodes;for(const arena of ['SUNLIT LAB','VERDANT RUINS','FRONTIER KEEP','SIEGE RUINS'])assert(r.ArenaArt.drawSky(ctx,arena,390,202));assert.equal(decodes,count,'four arenas reuse three preloaded locations');for(const arena of ['SUNLIT LAB','VERDANT RUINS','FRONTIER KEEP','SIEGE RUINS'])r.ArenaArt.drawSky(ctx,arena,390,202);assert.equal(decodes,count,'repeated rounds reuse decoded scenes');assert.equal(r.ArenaArt.drawSky(ctx,'missing',390,202),false);
for(const type of Object.keys(r.FighterAssets.authored)){
 const a=r.BattleTheatre.anchor(type,'weapon',100,1),b=r.BattleTheatre.anchor(type,'weapon',100,-1),body=r.BattleTheatre.anchor(type,'impact',100);
 assert(a.y<0&&a.y>-100,'weapon above feet inside silhouette');assert.equal(a.x,-b.x);assert.equal(a.y,b.y);assert(body.y<0,'body impact above floor');
}
assert(r.BattleTheatre.effectLife('shot','full')<r.BattleTheatre.effectLife('signatureBurst','full'));assert(r.BattleTheatre.effectLife('weaponTrail','minimal')<=r.BattleTheatre.effectLife('weaponTrail','full'));
function render(){transforms.length=0;r.FighterAssets.draw(ctx,'knight',150,300,80,'blue',{time:1048,id:99,action:'idle'});return transforms[0][0]}
const initial=render();r.FighterAssets.notifyHit(99,1000,1);const hit=render();assert(hit<initial,'short recoil away from facing direction');r.FighterAssets.resetPoseMemory();assert.equal(render(),initial,'round reset clears visual recoil');
r.FighterAssets.notifyHit(99,1000,1);for(let id=200;id<400;id++)r.FighterAssets.notifyHit(id,1000,1);assert.equal(render(),initial,'reaction store is bounded');
console.log('PASS: ten weapon/body anchors, facing symmetry, short trail hierarchy, recoil/reset/cap and three cached daylight locations');
