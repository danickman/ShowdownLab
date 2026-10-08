// node tools/check-living-arenas.cjs — opening visibility and bounded environment motion.
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert'),root=path.resolve(__dirname,'..');
let depth=0,calls=[],motionOff=false,builds=0;
const c={canvas:{width:390,height:844},save(){depth++},restore(){depth--;assert(depth>=0)}};
for(const name of ['beginPath','closePath','clip','fill','stroke','rect','ellipse','moveTo','lineTo','quadraticCurveTo','drawImage','fillRect','translate','rotate','scale'])c[name]=(...args)=>{if(name!=='drawImage')assert(args.every(Number.isFinite),name+' finite');calls.push([name,...args])};
const r={window:null,console,Image:class{set src(src){this.naturalWidth=this.naturalHeight=src.includes('presentation')?512:96;this.onload?.()}},CustomEvent:class{},dispatchEvent(){},matchMedia:()=>({matches:motionOff}),document:{createElement(){builds++;return{width:0,height:0,getContext:()=>({...c})}}}};r.window=r;vm.createContext(r);
vm.runInContext(fs.readFileSync(path.join(root,'v3/arena-ambience.js'),'utf8'),r);
let cases=0;
for(const dressing of ['academy','garden','frontier','siege'])for(const count of [4,24,60,180])for(const time of [0,100,5000,1000000]){
 calls=[];r.ArenaAmbience.drawSky(c,390,198,{dressing},time,count);r.ArenaAmbience.drawPerimeter(c,390,844,198,{dressing},time,count);assert.equal(depth,0);assert(calls.length<=180,'bounded scene work');const dense=calls.length;
 if(count===180){calls=[];r.ArenaAmbience.drawSky(c,390,198,{dressing},time,4);r.ArenaAmbience.drawPerimeter(c,390,844,198,{dressing},time,4);assert(calls.length>dense,'dense fights shed atmosphere work')}cases++;
}
motionOff=true;calls=[];r.ArenaAmbience.drawSky(c,390,198,{dressing:'siege'},10,4);r.ArenaAmbience.drawPerimeter(c,390,844,198,{dressing:'siege'},10,4);assert.equal(calls.length,0,'reduced motion disables ambience');
const src=fs.readFileSync(path.join(root,'v3/v3.js'),'utf8');vm.runInContext(src.slice(src.indexOf('function openingBeat('),src.indexOf('function draw(time)')),r);
for(let elapsed=0;elapsed<=1200;elapsed+=10){const beat=r.openingBeat(elapsed);assert(beat.wash>=0&&beat.wash<=.18);assert(beat.fade>=0&&beat.fade<=1);if(elapsed>=350)assert.equal(beat.wash,0);if(elapsed>=900)assert.equal(beat.fade,0)}
vm.runInContext(fs.readFileSync(path.join(root,'v3/asset-renderer.js'),'utf8'),r);
for(const type of Object.keys(r.FighterAssets.authored)){const before=builds;r.FighterAssets.draw(c,type,100,200,100,'blue',{presentation:true});assert.equal(builds,before+2,'ink bitmap built once');r.FighterAssets.draw(c,type,100,200,100,'blue',{presentation:true});assert.equal(builds,before+2,'repeat menu paint reuses ink bitmap')}
assert.equal(r.FighterAssets.diagnostics().total,80);for(const spec of Object.values(r.FighterAssets.authored))assert(spec.presentationUrl.includes('presentation.webp'),'every menu has a dedicated canonical');assert(r.FighterAssets.authored.turtle.presentationUrl.includes('presentation.webp'));
const css=fs.readFileSync(path.join(root,'v3/v3.css'),'utf8');assert(css.includes('.screen-guide .guide-content{display:block;flex:1 1 0;min-height:0;'),'content-sized scroll layout');assert(!css.includes('min-height:620px!important'),'fixed Guide hardening removed');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.equal(html,fs.readFileSync(path.join(root,'v3/index.html'),'utf8'));assert(html.indexOf('arena-ambience.js')<html.indexOf('v3.js?v='));
console.log(`PASS: ${cases} bounded ambient scenes, reduced motion, opening wash gone at 350ms, cached menu ink, Turtle canonical and Guide structure`);
