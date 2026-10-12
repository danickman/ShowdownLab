const fs=require('fs'),vm=require('vm'),assert=require('assert');
const e={window:null,Image:class{set src(s){this.url=s;e.image=this}},devicePixelRatio:2};e.window=e;vm.createContext(e);
for(const f of ['arena-floor-art','battle-theatre'])vm.runInContext(fs.readFileSync(`v3/${f}.js`,'utf8'),e);
let builds=0,depth=0,draws=0;
const ctx={save(){depth++},restore(){depth--;assert(depth>=0)},createLinearGradient(){return{addColorStop(){}}},beginPath(){},closePath(){},clip(){},fill(){draws++},stroke(){draws++},drawImage(){draws++},setTransform(){}};
for(const m of ['rect','fillRect','strokeRect','translate','scale','moveTo','lineTo','ellipse','arc','rotate','quadraticCurveTo'])ctx[m]=(...a)=>assert(a.every(Number.isFinite),m);
e.document={createElement:()=>{builds++;return{width:0,height:0,getContext:()=>ctx}}};
vm.runInContext(fs.readFileSync('v3/arena-stage.js','utf8'),e);
const theme={dressing:'academy',floor:['#eee','#ddd','#ccc'],stone:'#aaa',joint:'#888'};
assert.equal(e.ArenaFloorArt.draw(ctx,390,550,'academy'),false);
e.ArenaStage.drawFloor(ctx,390,844,290,theme);assert.equal(builds,1);
e.image.naturalWidth=768;e.image.naturalHeight=1152;e.image.onload();assert.equal(e.ArenaFloorArt.revision,1);
for(let i=0;i<60;i++)e.ArenaStage.drawFloor(ctx,390,844,290,theme);
assert.equal(builds,2,'loaded floor invalidates fallback cache once');
for(const [w,h]of [[390,550],[320,300],[844,160],[1024,500]])assert(e.ArenaFloorArt.draw(ctx,w,h,'academy'));
assert.equal(e.ArenaFloorArt.draw(ctx,390,550,'siege'),false);
e.image.onerror();assert.equal(e.ArenaFloorArt.draw(ctx,390,550,'academy'),false);e.ArenaStage.drawFloor(ctx,390,844,290,theme);assert.equal(builds,3,'decode error returns to procedural floor');
const academy=e.image;assert.equal(e.ArenaFloorArt.draw(ctx,390,550,'garden'),false,'new arena starts with procedural fallback');
const garden=e.image;assert.notEqual(garden,academy);garden.naturalWidth=768;garden.naturalHeight=1152;garden.onload();
for(const [w,h]of [[390,550],[320,300],[844,160],[1024,500]])assert(e.ArenaFloorArt.draw(ctx,w,h,'garden'));
assert.equal(e.image,garden,'warm garden reuses one image');
assert.equal(e.ArenaFloorArt.draw(ctx,390,550,'academy'),false,'switch releases prior current image');
const nextAcademy=e.image,revision=e.ArenaFloorArt.revision;garden.onerror();garden.onload();assert.equal(e.ArenaFloorArt.revision,revision,'stale callbacks cannot invalidate new floor');
nextAcademy.naturalWidth=768;nextAcademy.naturalHeight=1152;nextAcademy.onload();assert(e.ArenaFloorArt.draw(ctx,390,550,'academy'));assert.equal(depth,0);

for(const tier of ['full','balanced','reduced','minimal'])for(const age of [-1,0,.2,.8,1])for(const facing of [-1,1]){draws=0;const f={x:120,y:400,size:84,heavy:true,seed:3,facing},before=JSON.stringify(f);e.BattleTheatre.drawRush(ctx,f,age,tier);assert.equal(depth,0);assert.equal(JSON.stringify(f),before);assert(draws<=15);if(tier==='minimal'||age<0||age>=1)assert.equal(draws,0)}
assert.equal(e.BattleTheatre.effectLife('chargeWake','full'),420);
// Exercise actual emission path, rather than relying on a text-only cap assertion.
const src=fs.readFileSync('v3/v3.js','utf8');
Object.assign(e,{performance:{now:()=>5000},state:{speed:1},fx:[],prev:new Map(),cam:{unitSize:()=>84},scars:[],spellMarks:[],defeated:new Map(),storyGate:new Set(),comicGate:new Map(),shake:0,flash:0,lastImpact:0,staging:null,view:{w:390,h:844},spritePoint:u=>({x:100+u.x*150,y:400}),fighterCue:()=>({x:150,y:380}),comicWord(){},signatureWord:()=>null,burst(){},cap:t=>t,matchMedia:()=>({matches:false})});
vm.runInContext(src.slice(src.indexOf('function effectScale('),src.indexOf('const SIGNATURE_WORDS=')),e);
vm.runInContext(src.slice(src.indexOf('function spawnFX('),src.indexOf('function drawFX(')),e);
function emit(count,speed=1,reduced=false){e.fx=[];e.matchMedia=()=>({matches:reduced});const units=Array.from({length:count},(_,i)=>({id:i+1,type:'beetank',x:.5,y:.5,hp:100,maxHp:100,team:i%2?'blue':'red',action:'ram',target:i?1:2}));e.prev=new Map(units.map(u=>[u.id,{hp:100,action:'idle',team:u.team}]));const before=JSON.stringify(units);e.spawnFX({units,speed,tick:1,round:1});assert.equal(JSON.stringify(units),before);return e.fx.filter(f=>f.kind==='chargeWake')}
assert.equal(emit(8).length,3);assert(emit(24).length<=3);assert.equal(emit(29).length,0);assert.equal(emit(8,10).length,0);assert.equal(emit(8,1,true).length,0);
console.log('PASS: illustrated floor ready/error cache transitions, aspect/fallback, bounded mirrored wakes, actual density/speed/reduced-motion emission caps');

for(const tier of ['full','reduced','minimal'])for(const age of [-1,0,.3,.8,1])for(const level of [1,5]){e.matchMedia=()=>({matches:false});draws=0;const f={x:140,y:410,seed:7,level},before=JSON.stringify(f);e.BattleTheatre.drawHonk(ctx,f,age,tier);assert.equal(depth,0);assert.equal(JSON.stringify(f),before);assert(draws<=11);if(age<0||age>=1)assert.equal(draws,0);else if(tier==='minimal')assert.equal(draws,1)}
e.matchMedia=()=>({matches:true});draws=0;e.BattleTheatre.drawHonk(ctx,{x:140,y:410,level:5},.2,'full');assert.equal(draws,1,'reduced motion suppresses feathers');assert.equal(e.BattleTheatre.effectLife('honk','full'),420);
console.log('PASS: grounded honk geometry/expiry, Base/Evolved budgets and reduced-motion feathers');
