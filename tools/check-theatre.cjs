// node tools/check-theatre.cjs — finite geometry, lifecycle and crowd budgets, no browser dependencies.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),runtime={window:null};runtime.window=runtime;vm.createContext(runtime);
vm.runInContext(fs.readFileSync(path.join(root,'v3/battle-theatre.js'),'utf8'),runtime);
let draws=0,depth=0;const calls=[];
const context={save(){depth++},restore(){depth--;assert(depth>=0)},
  beginPath(){},closePath(){},fill(){draws++},stroke(){draws++}};
for(const method of ['translate','scale','moveTo','lineTo','ellipse'])context[method]=(...args)=>{assert(args.every(Number.isFinite),method+' finite geometry');calls.push([method,...args])};
let checks=0;
for(const tier of ['full','balanced','reduced','minimal'])for(const type of ['impact','arc','quake','fire'])for(const age of [0,.012,.05,.2,.7,.95,1]){
  const mark={type,x:.4,y:.5,t:1234,tech:5,heavy:true},before=JSON.stringify(mark);draws=0;
  runtime.BattleTheatre.drawDamage(context,{x:155,y:410},mark,age,tier);
  runtime.BattleTheatre.drawImpact(context,{x:155,y:410,heavy:true,seed:7},age,tier);
  assert.equal(depth,0,'Canvas save/restore balanced');assert.equal(JSON.stringify(mark),before,'must not mutate marks');
  if(age===1)assert.equal(draws,0,'expired marks/effects must disappear');
  if(tier==='minimal')assert(draws<=32,'minimal detail draw budget');checks++;
}
// Identical geometry on repeated frames, with world-position projection supplied by the caller.
const mark={type:'quake',x:.3,y:.4,t:1000,tech:2};calls.length=0;runtime.BattleTheatre.drawDamage(context,{x:120,y:400},mark,.3);const first=JSON.stringify(calls);calls.length=0;runtime.BattleTheatre.drawDamage(context,{x:120,y:400},mark,.3);assert.equal(JSON.stringify(calls),first);
const src=fs.readFileSync(path.join(root,'v3/v3.js'),'utf8');
const units=Array.from({length:180},(_,i)=>({id:i+1,x:.1+(i%10)*.08,y:.2+Math.floor(i/10)*.025,team:i%2?'blue':'red',hp:100}));
Object.assign(runtime,{state:{units,speed:1},view:{w:390,h:844},cam:{worldToScreen:(x,y)=>({x:x*300+30,y:y*500+200})},fx:[],spellMarks:[],shake:0,flash:0});
vm.runInContext(src.slice(src.indexOf('function trimFX('),src.indexOf("document.addEventListener('click'")),runtime);
vm.runInContext(src.slice(src.indexOf('function spectacleTier('),src.indexOf('const SIGNATURE_WORDS=')),runtime);
const original=JSON.stringify(units);
for(let i=0;i<40;i++)for(const kind of ['zap','heal','quake','aegis'])runtime.spellVisual(kind,{target:2},1000+i*100,1.75);
assert(runtime.fx.length<=58,'rapid casts bounded FX');assert(runtime.spellMarks.length<=28,'rapid casts bounded ground marks');
const quake=runtime.fx.find(f=>f.kind==='quakeSpell');assert(quake.points.length<=3,'180-unit quake sampling');
assert.equal(JSON.stringify(units),original,'presentation must not alter combat state');
// Lethal ARC must still have a visible impact at its defeated target.
runtime.state.units[1].hp=0;runtime.fx=[];runtime.spellVisual('zap',{target:2},6000,1);
assert(runtime.fx.some(f=>f.kind==='arcSpell'),'lethal strike presentation');
const rootHtml=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.equal(rootHtml,fs.readFileSync(path.join(root,'v3/index.html'),'utf8'),'entry point parity');
assert(rootHtml.includes('presentation.css?v=theatre-ui1'));assert(rootHtml.indexOf('battle-theatre.js')<rootHtml.indexOf('/v3/v3.js?v='),'theatre loads before game');
console.log(`PASS: ${checks} geometry/lifecycle cases, stable cracks, crowd/cast bounds, state immutability, lethal ARC and HTML parity`);
