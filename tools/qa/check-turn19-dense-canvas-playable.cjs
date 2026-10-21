'use strict';
const fs=require('fs'),crypto=require('crypto'),assert=require('node:assert/strict'),path=require('path');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('v3/v3.js'),html=read('index.html'),sw=read('sw.js');
const marker="function draw(time){if(current!=='battle'||!cam)return;",replacement="function draw(time){if(current!=='battle'||!cam)return;\n// Only exceptional full-arena stress density uses lower raster backing; positions, fighters, FX, and combat remain unchanged.\nconst __denseScale=state.units.length>=160?((state.speed||1)>=10?.85:1):Math.min(devicePixelRatio||1,2),__bw=Math.round(view.w*__denseScale),__bh=Math.round(view.h*__denseScale);\nif(canvas.width!==__bw||canvas.height!==__bh){canvas.width=__bw;canvas.height=__bh;ctx.setTransform(__denseScale,0,0,__denseScale,0,0);}";
assert.equal(src.split(replacement).length,2,'one exact density-aware theatre draw rule required');
// Strip ONLY documented live tactical tips, preserving the entire original physics,
// renderer and density gate byte-for-byte. Any unrelated runtime change still fails.
let historic=src.replace(replacement,marker);
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
assert.equal(crypto.createHash('sha256').update(historic).digest('hex'),"74346d4692d4d001dd4df2351b2583c835ae728bbb34984dafaee01d649fbbfe",'only density-aware art draw rule may differ from frozen original');
assert(html.includes('/v3/v3.js?v=theatre-spell-readability1')&&sw.includes('/v3/v3.js?v=theatre-spell-readability1'),'pinned root and SW must include current Guide-truth runtime version');
const releaseCache=sw.match(/const CACHE='([^']+)'/);assert(releaseCache&&/^showdown-lab-release-[a-z0-9-]+$/.test(releaseCache[1])&&releaseCache[1]!=='showdown-lab-release-turn23-dragon-charge1','new Turtle runtime requires distinct, valid offline cache identity rather than silently reusing old release');
const scale=(units,speed,dpr)=>units>=160?(speed>=10?.85:1):Math.min(dpr,2);
for(const n of [20,40,80,120,159])for(const speed of [1,10])assert.equal(scale(n,speed,3),2,'normal density retained 2x');
assert.equal(scale(160,1,3),1);assert.equal(scale(300,1,3),1);assert.equal(scale(300,10,3),.85);assert.equal(scale(300,10,1),.85);
console.log('PASS Turn19 playable density-aware canvas contract, preserved art source, 300 dual-speed and 80/120 full-resolution');
