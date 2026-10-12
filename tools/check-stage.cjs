// node tools/check-stage.cjs — floor cache lifecycle and immutable target indexing.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..');let builds=0,blits=0,depth=0;
const context={save(){depth++},restore(){depth--;assert(depth>=0)},setTransform(){},beginPath(){},closePath(){},clip(){},fill(){},stroke(){},
  createLinearGradient(){return{addColorStop(){}}}};
for(const method of ['rect','fillRect','strokeRect','moveTo','lineTo','translate','arc','ellipse'])context[method]=(...args)=>assert(args.every(Number.isFinite),'finite floor geometry');
context.drawImage=()=>blits++;
const canvases=[],runtime={staging:null,devicePixelRatio:3,document:{createElement(){builds++;const cv={width:0,height:0,getContext:()=>context};canvases.push(cv);return cv}},window:null};runtime.window=runtime;vm.createContext(runtime);
vm.runInContext(fs.readFileSync(path.join(root,'v3/arena-stage.js'),'utf8'),runtime);
const theme={floor:['#eee3c2','#ddd1b1','#c4b89c'],stone:'#b8b99e',joint:'#7f785d'},original=JSON.stringify(theme);
for(let i=0;i<90;i++)assert(runtime.ArenaStage.drawFloor(context,390,844,198,theme));
assert.equal(builds,1,'warm frames reuse the floor');assert.equal(blits,90);
runtime.ArenaStage.drawFloor(context,320,568,133,theme);assert.equal(builds,2,'resize rebuild');
runtime.ArenaStage.drawFloor(context,320,568,133,{...theme,stone:'#aabbcc'});assert.equal(builds,3,'arena change rebuild');
runtime.devicePixelRatio=1;runtime.ArenaStage.drawFloor(context,320,568,133,theme);assert.equal(builds,4,'DPR change rebuild');
runtime.devicePixelRatio=3;runtime.ArenaStage.drawFloor(context,768,1024,240,theme);
assert(canvases.every(c=>c.width*c.height<=1210000),'bounded backing-store pixel budget');assert.equal(depth,0);assert.equal(JSON.stringify(theme),original);
for(const dressing of ['academy','garden','frontier','siege'])assert(runtime.ArenaStage.drawFloor(context,390,844,198,{...theme,dressing}));assert.equal(depth,0,'all dressing paths balance Canvas state');
const fallback={window:null};fallback.window=fallback;vm.createContext(fallback);vm.runInContext(fs.readFileSync(path.join(root,'v3/arena-stage.js'),'utf8'),fallback);
assert.equal(fallback.ArenaStage.drawFloor(context,390,844,198,theme),false,'no-canvas fallback');
assert.equal(fallback.ArenaStage.drawFloor(context,390,198,198,theme),false,'empty stage fallback');
const src=fs.readFileSync(path.join(root,'v3/v3.js'),'utf8'),units=Array.from({length:180},(_,i)=>({id:i,hp:i%3?100:0,x:i/200,y:.5}));let projections=0;
Object.assign(runtime,{state:{units},cam:{worldToScreen:(x,y)=>{projections++;return{x,y}}}});
vm.runInContext(src.slice(src.indexOf('let indexedState='),src.indexOf('function drawUnit(')),runtime);
const snapshot=runtime.renderSnapshot();for(let i=0;i<180;i++){const p=runtime.unitPos(i);assert.equal(!!p,units[i].hp>0)}
assert.equal(runtime.renderSnapshot(),snapshot,'same snapshot reuses index');assert.equal(snapshot.live.length,120);assert.equal(projections,120);
runtime.state={units:[{id:1000,hp:100,x:.7,y:.8}]};assert(runtime.renderSnapshot()!==snapshot);assert.equal(runtime.unitPos(10),null);assert.equal(runtime.unitPos(1000).x,.7);
runtime.state={units:Array.from({length:180},(_,i)=>({id:i,team:i%2?'red':'blue',hp:1+i%10,maxHp:100,x:.5,y:.5}))};
assert.equal(runtime.renderSnapshot().critical.size,2,'extreme crowds show at most one critical bar per team');
vm.runInContext(fs.readFileSync(path.join(root,'v3/camera.js'),'utf8'),runtime);
const camera=runtime.ShowdownCamera.create(390,844);
for(const kind of ['normal','small','heavy','large']){assert.equal(camera.unitSize(kind,60),camera.unitSize(kind,61),'density transition should be gradual');assert(camera.unitSize(kind,180)<camera.unitSize(kind,60),'extreme crowd presentation gets smaller');assert(camera.unitSize(kind,180)>=24,'mobile silhouette lower bound');}
console.log('PASS: cache reuse/invalidation, 1.21M pixel bound, fallback, target-index refresh, critical-bar caps and gradual crowd scale');
