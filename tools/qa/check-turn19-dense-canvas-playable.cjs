'use strict';
const fs=require('fs'),crypto=require('crypto'),assert=require('node:assert/strict'),path=require('path'),vm=require('node:vm');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('v3/v3.js'),html=read('index.html'),sw=read('sw.js');
const marker="function draw(time){if(current!=='battle'||!cam)return;",replacement="function draw(time){if(current!=='battle'||!cam)return;\n// Only exceptional full-arena stress density uses lower raster backing; positions, fighters, FX, and combat remain unchanged.\nconst __denseScale=state.units.length>=160?((state.speed||1)>=10?.85:1):Math.min(devicePixelRatio||1,2),__bw=Math.round(view.w*__denseScale),__bh=Math.round(view.h*__denseScale);\nif(canvas.width!==__bw||canvas.height!==__bh){canvas.width=__bw;canvas.height=__bh;ctx.setTransform(__denseScale,0,0,__denseScale,0,0);}";
assert.equal(src.split(replacement).length,2,'one exact density-aware theatre draw rule required');
// Strip ONLY documented live tactical tips, preserving the entire original physics,
// renderer and density gate byte-for-byte. Any unrelated runtime change still fails.
let historic=src.replace(replacement,marker);
// Exact accepted presentation overlay only; original engine SHA remains strict.
const legacyFX="const fxCap=tier==='minimal'?34:tier==='reduced'?50:tier==='balanced'?70:94;if(fx.length>fxCap)fx.splice(0,fx.length-fxCap);",liveFX="const fxCap=tier==='minimal'?34:tier==='reduced'?50:tier==='balanced'?70:94;if(fx.length>fxCap){const spill=fx.length-fxCap;if(!fx.some(f=>/Spell$/.test(f.kind)))fx.splice(0,spill);else{let drop=spill;fx=fx.filter(f=>{if(drop>0&&!/Spell$/.test(f.kind)){drop--;return false}return true}).slice(-fxCap)}}";
assert.equal(historic.split(liveFX).length,2,'only one bounded active-spell FX priority overlay');
historic=historic.replace(liveFX,legacyFX);
for(const [tier,cap] of [['minimal',34],['reduced',50],['balanced',70],['full',94]]){
 const hits=Array.from({length:cap+17},(_,i)=>({id:i,kind:'hit'}));
 function evaluateFX(items){const c={tier,fx:items.map(x=>({...x}))};vm.runInNewContext(liveFX,c);return c.fx}
 const noSpell=evaluateFX(hits);assert.equal(noSpell.length,cap);
 assert.deepEqual(noSpell.map(x=>x.id),hits.slice(-cap).map(x=>x.id),'byte-equivalent no-spell ordering');
 const real=evaluateFX([{id:1e5,kind:'bloomSpell'},{id:1e5+1,kind:'arcSpell'},{id:1e5+2,kind:'aegisSpell'},...hits]);
 assert.equal(real.length,cap,'no extra FX at any tier');
 assert(real.some(x=>x.kind==='bloomSpell')&&real.some(x=>x.kind==='arcSpell')&&real.some(x=>x.kind==='aegisSpell'),'real spells survive hit FX churn');
}

const resultCurrentStart="if(mvp&&art){art.style.visibility='visible';const mvpBadge=document.querySelector('.mvp-badge');if(mvpBadge)mvpBadge.style.visibility='visible';art.dataset.art=mvp.type;",resultLegacyStart="if(mvp&&art){art.dataset.art=mvp.type;";
const resultCurrentEmpty="}else{if(art){art.style.visibility='hidden';art.getContext('2d').clearRect(0,0,art.width,art.height);staticCanvasKeys.delete(art);delete art.dataset.art;delete art.dataset.team;delete art.dataset.level}const mvpBadge=document.querySelector('.mvp-badge');if(mvpBadge)mvpBadge.style.visibility='hidden';document.querySelector('#resultMvp').textContent='BATTLE COMPLETE';",resultLegacyEmpty="}else{document.querySelector('#resultMvp').textContent='BATTLE COMPLETE';";
for(const [current,legacy] of [[resultCurrentStart,resultLegacyStart],[resultCurrentEmpty,resultLegacyEmpty]]){
 assert.equal(historic.split(current).length,2,'one exact accepted no-MVP presentation safety overlay');
 historic=historic.replace(current,legacy);
}
for(const [current,legacy] of [["turtle:'Anchor the front beside wounded allies. Shell Rebound punishes real close-range hits on the Turtle or an ally it guards; distant ranged enemies can escape the retaliation.'","turtle:'Turtle is best against close attackers. Ricochet Shell reflects damage actually taken; distant ranged attacks avoid reflection.'"],["goblin:'Keep Goblins together for Pack Ambush, but watch enemy splash. At L5, the first landed damaging stab calls temporary L3 Rabble into the real fight; these fighters do not become permanent recruits.'","goblin:'Keep Goblins close enough to fight as a pack. Nearby allies boost damage, but clustering invites enemy splash attacks.'"],["barbarian:'L5 Measured Charge gets the Barbarian into actual contact faster and staggers its first axe victim. Line up clustered enemies for the existing Blood Cleave; a doubled opposing army is still dangerous.'","barbarian:'Send the Barbarian into crowds. Blood Cleave rewards axe swings that catch several enemies near the main target.'"]]){
 assert.equal(historic.split(current).length,2,'accepted L5 Guide delta must occur exactly once');
 historic=historic.replace(current,legacy);
}

// Only these exact ARC/BLOOM presentation constant replacements are allowed.
// Restore every accepted occurrence BEFORE immutable Turn19 physics SHA check.
const approvedSpellVisualDeltas=[["strike=Math.max(.15,1-age*4)","strike=Math.max(.18,1-age*2.4)",1],["ctx.strokeStyle='#76d86b';ctx.shadowColor='#7cec72';ctx.shadowBlur=12+tech*3;ctx.lineWidth=Math.max(1.5,4*(1-age));","ctx.strokeStyle='#34b95a';ctx.shadowColor='#9fffc2';ctx.shadowBlur=tier==='minimal'?0:tier==='reduced'?8:12+tech*3;ctx.lineWidth=Math.max(2.1,5.6*(1-age));",1],["r=10+age*(38+tech*6)+(i%3)*3","r=13+age*(58+tech*6)+(i%3)*3",1],["(5+tech*.35)","(7.5+tech*.35)",3],["ctx.strokeStyle='#d9ffb7';ctx.lineWidth=Math.max(1.2,3.4*(1-age));","ctx.strokeStyle='#e4ffc2';ctx.lineWidth=Math.max(1.6,4.5*(1-age));",1],["ctx.strokeStyle='#4c9f4c';ctx.lineWidth=1.4+tech*.18;","ctx.strokeStyle='#398f4b';ctx.lineWidth=2.1+tech*.18;",1],["rr=10+tech*2+(i%2)*5;","rr=23+tech*3+(i%2)*7;",1]];
for(const [original,current,count] of approvedSpellVisualDeltas){
 assert.equal(historic.split(current).length,count+1,'unapproved ARC/BLOOM runtime text: '+current.slice(0,30));
 historic=historic.split(current).join(original);
}


// Exact source-approved flowering flank; strip once, never loosen historic physics SHA.
const approvedBloomFlank="if(density<160){const bx=Math.max(56,Math.min(76,view.w*.17)),by=Math.max(view.h*.35,Math.min(view.h*.74,f.y-96)),br=36+(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches?0:age*17);if(location.search.includes('qa='))window.__bloomPainter={x:bx,y:by,tier,age,density};ctx.save();ctx.globalAlpha=Math.max(0,(1-age)*.96);ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle='#245d38';ctx.lineWidth=Math.max(2.7,5.2*(1-age*.4));ctx.beginPath();ctx.moveTo(f.x,f.y-10);ctx.bezierCurveTo(f.x-55,f.y-34,bx+br*.62,by+24,bx,by+7);ctx.stroke();ctx.strokeStyle='#91d16c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(f.x-4,f.y-15);ctx.quadraticCurveTo(bx+40,by+25,bx,by+7);ctx.stroke();const petals=tier==='reduced'?6:9;for(let j=0;j<petals;j++){const a=j*Math.PI*2/petals+(f.seed||1)*.04,px=bx+Math.cos(a)*br,py=by+Math.sin(a)*br*.76;ctx.save();ctx.translate(px,py);ctx.rotate(a+Math.PI*.5);ctx.fillStyle=j%3===0?'#dcf49c':j%2?'#54ae55':'#85ca61';ctx.strokeStyle='#27643b';ctx.lineWidth=1.9;ctx.beginPath();ctx.moveTo(0,-18);ctx.quadraticCurveTo(16,-3,0,15);ctx.quadraticCurveTo(-15,3,0,-18);ctx.fill();ctx.stroke();ctx.restore()}ctx.fillStyle='#f5edb2';ctx.strokeStyle='#327c45';ctx.lineWidth=2.6;ctx.beginPath();ctx.ellipse(bx,by,br*.30,br*.22,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore()}";
assert.equal(historic.split(approvedBloomFlank).length,2,'exactly one accepted BLOOM flank visual-only overlay');
historic=historic.replace(approvedBloomFlank,'');
const approvedBloomCanopyRevision=[["ctx.shadowBlur=0;if(tier!=='minimal'&&!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches){const crownY=f.y-72,canopyR=35+age*42,n=tier==='reduced'?3:6;ctx.save();ctx.globalAlpha=Math.max(0,(1-age)*.82);ctx.strokeStyle='#348c56';ctx.lineWidth=Math.max(1.8,3.4*(1-age));ctx.beginPath();ctx.ellipse(f.x,crownY,canopyR,canopyR*.30,0,0,Math.PI*2);ctx.stroke();for(let j=0;j<n;j++){const a=j*2.399+(f.seed||1)*.11,px=f.x+Math.cos(a)*canopyR,py=crownY+Math.sin(a)*canopyR*.30;ctx.save();ctx.translate(px,py);ctx.rotate(a+age*.8);ctx.fillStyle=j%2?'#60c86c':'#c6fa8a';ctx.beginPath();ctx.moveTo(0,-11);ctx.quadraticCurveTo(8,0,0,11);ctx.quadraticCurveTo(-7,0,0,-11);ctx.fill();ctx.restore()}ctx.restore()}","ctx.shadowBlur=0;if(tier!=='minimal'&&!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches){const crownY=Math.max(view.h*.16,f.y-116),canopyR=44+age*52,n=tier==='reduced'?4:7;ctx.save();ctx.globalAlpha=Math.max(0,(1-age)*.92);ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle='#297747';ctx.lineWidth=Math.max(2.4,5*(1-age));for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(f.x+side*3,f.y-12);ctx.quadraticCurveTo(f.x+side*(23+age*9),f.y-72,f.x+side*canopyR*.47,crownY+9);ctx.stroke()}ctx.strokeStyle='#4c9c52';ctx.lineWidth=Math.max(2,3.8*(1-age));ctx.beginPath();ctx.ellipse(f.x,crownY,canopyR,canopyR*.38,0,0,Math.PI*2);ctx.stroke();for(let j=0;j<n;j++){const a=j*2.399+(f.seed||1)*.11,px=f.x+Math.cos(a)*canopyR,py=crownY+Math.sin(a)*canopyR*.38;ctx.save();ctx.translate(px,py);ctx.rotate(a+age*.8);ctx.fillStyle=j%2?'#57b75b':'#c5f27e';ctx.strokeStyle='#277747';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(0,-13);ctx.quadraticCurveTo(11,0,0,13);ctx.quadraticCurveTo(-9,0,0,-13);ctx.fill();ctx.stroke();ctx.restore()}ctx.restore()}",1]];
for(const [before,current,count] of approvedBloomCanopyRevision){
 assert.equal(historic.split(current).length,count+1,'single approved mature BLOOM stalk and leaf canopy required');
 historic=historic.split(current).join(before);
}
// Strip ONLY this exact ARC presentation compositor, preserving immutable physics SHA.
const arcBlendNew="ctx.globalCompositeOperation=tier==='minimal'?'lighter':'source-over';for(let b=0;b<bolts;b++){",arcBlendOld="ctx.globalCompositeOperation='lighter';for(let b=0;b<bolts;b++){";
assert.equal(historic.split(arcBlendNew).length,2,'one accepted dark ARC ink overlay');
historic=historic.replace(arcBlendNew,arcBlendOld);
// Preserve frozen physics SHA: remove only this exact authorized ARC outer-ink pass.
const arcBoldNew="ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);if(tier!=='minimal'){const blueInk=ctx.strokeStyle,blueWidth=ctx.lineWidth,blueBlur=ctx.shadowBlur;ctx.strokeStyle='#10293f';ctx.shadowBlur=0;ctx.lineWidth=Math.max(6.4,blueWidth+3.5);ctx.stroke();ctx.strokeStyle=blueInk;ctx.shadowBlur=blueBlur;ctx.lineWidth=blueWidth}ctx.stroke();if(tier!=='minimal'){ctx.strokeStyle='#f9ffff';ctx.shadowBlur=0;ctx.lineWidth=Math.max(1.9,ctx.lineWidth*.38);ctx.stroke()}";
const arcBoldOld="ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);ctx.stroke();if(tier!=='minimal'){ctx.strokeStyle='#e5fdff';ctx.shadowBlur=0;ctx.lineWidth=Math.max(1.2,ctx.lineWidth*.32);ctx.stroke()}";
assert.equal(historic.split(arcBoldNew).length,2,'exact bold ARC bolt expected');
historic=historic.replace(arcBoldNew,arcBoldOld);
const approvedSpellImpactOverlays=[["ctx.strokeStyle=b?'#82dfff':'#fffef2';ctx.shadowColor='#70d9ff';ctx.shadowBlur=(tier==='minimal'?0:tier==='reduced'?8:16+tech*2)*strike;ctx.lineWidth=(6+tech*.7)*(1-age)*strike*(b?0.62:1);ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);ctx.stroke();","ctx.strokeStyle=b?'#197baa':'#116b9b';ctx.shadowColor='#58d8ff';ctx.shadowBlur=(tier==='minimal'?0:tier==='reduced'?8:16+tech*2)*strike;ctx.lineWidth=(9+tech*.9)*(1-age)*Math.max(.32,strike)*(b?.62:1);ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);ctx.stroke();if(tier!=='minimal'){ctx.strokeStyle='#e5fdff';ctx.shadowBlur=0;ctx.lineWidth=Math.max(1.2,ctx.lineWidth*.32);ctx.stroke()}",1],["ctx.strokeStyle='#a7e9ff';ctx.lineWidth=Math.max(1,2.2*(1-age));","ctx.strokeStyle='#45b4d5';ctx.lineWidth=Math.max(1,2.2*(1-age));",1],["ctx.shadowBlur=0;for(let i=0;i<count;i++){const ang=i*Math.PI*2/count+(f.seed||1)*.13","ctx.shadowBlur=0;if(tier!=='minimal'&&!window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches){const crownY=f.y-72,canopyR=35+age*42,n=tier==='reduced'?3:6;ctx.save();ctx.globalAlpha=Math.max(0,(1-age)*.82);ctx.strokeStyle='#348c56';ctx.lineWidth=Math.max(1.8,3.4*(1-age));ctx.beginPath();ctx.ellipse(f.x,crownY,canopyR,canopyR*.30,0,0,Math.PI*2);ctx.stroke();for(let j=0;j<n;j++){const a=j*2.399+(f.seed||1)*.11,px=f.x+Math.cos(a)*canopyR,py=crownY+Math.sin(a)*canopyR*.30;ctx.save();ctx.translate(px,py);ctx.rotate(a+age*.8);ctx.fillStyle=j%2?'#60c86c':'#c6fa8a';ctx.beginPath();ctx.moveTo(0,-11);ctx.quadraticCurveTo(8,0,0,11);ctx.quadraticCurveTo(-7,0,0,-11);ctx.fill();ctx.restore()}ctx.restore()}for(let i=0;i<count;i++){const ang=i*Math.PI*2/count+(f.seed||1)*.13",1]];
for(const [old,current,count] of approvedSpellImpactOverlays){
 assert.equal(historic.split(current).length,count+1,'only exact ARC double-ink/BLOOM canopy overlay may differ '+current.slice(0,32));
 historic=historic.split(current).join(old);
}
assert.equal(crypto.createHash('sha256').update(historic).digest('hex'),"74346d4692d4d001dd4df2351b2583c835ae728bbb34984dafaee01d649fbbfe",'only density-aware art draw rule may differ from frozen original');
assert(html.includes('/v3/v3.js?v=theatre-arc-ink2')&&sw.includes('/v3/v3.js?v=theatre-arc-ink2'),'pinned root and SW must include current Guide-truth runtime version');
const releaseCache=sw.match(/const CACHE='([^']+)'/);assert(releaseCache&&/^showdown-lab-release-[a-z0-9-]+$/.test(releaseCache[1])&&releaseCache[1]!=='showdown-lab-release-turn23-dragon-charge1','new Turtle runtime requires distinct, valid offline cache identity rather than silently reusing old release');
const scale=(units,speed,dpr)=>units>=160?(speed>=10?.85:1):Math.min(dpr,2);
for(const n of [20,40,80,120,159])for(const speed of [1,10])assert.equal(scale(n,speed,3),2,'normal density retained 2x');
assert.equal(scale(160,1,3),1);assert.equal(scale(300,1,3),1);assert.equal(scale(300,10,3),.85);assert.equal(scale(300,10,1),.85);
console.log('PASS Turn19 historical source SHA and hard 34/50/70/94 spell-priority FX caps, legacy no-spell order unchanged');
