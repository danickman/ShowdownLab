(()=>{'use strict';
const manifest={
  knight:{scale:1,anchor:[.5,.82],states:{idle:{frames:['/v3/assets/knight/idle.webp'],fps:4},move:{frames:['/v3/assets/knight/move-1.webp','/v3/assets/knight/move-2.webp'],fps:8},attack:{frames:['/v3/assets/knight/attack-1.webp','/v3/assets/knight/attack-2.webp','/v3/assets/knight/attack-3.webp'],fps:12},skill:{frames:['/v3/assets/knight/skill-1.webp','/v3/assets/knight/skill-2.webp'],fps:10},hit:{frames:['/v3/assets/knight/hit.webp'],fps:8},defeat:{frames:['/v3/assets/knight/defeat.webp'],fps:4}}},
  dragon:{scale:1.28,anchor:[.5,.82],states:{idle:{frames:['/v3/assets/dragon/idle.webp'],fps:4},move:{frames:['/v3/assets/dragon/move-1.webp','/v3/assets/dragon/move-2.webp'],fps:7},attack:{frames:['/v3/assets/dragon/attack-1.webp','/v3/assets/dragon/attack-2.webp'],fps:10},skill:{frames:['/v3/assets/dragon/fire-1.webp','/v3/assets/dragon/fire-2.webp','/v3/assets/dragon/fire-3.webp'],fps:12},hit:{frames:['/v3/assets/dragon/hit.webp'],fps:8},defeat:{frames:['/v3/assets/dragon/defeat.webp'],fps:4}}}
};
const authoredKnight={
  scale:1.38,
  anchor:[.5,.918],
  states:{
    idle:'/v3/assets/authored/knight/idle.webp',
    move:'/v3/assets/authored/knight/move.webp',
    attack:'/v3/assets/authored/knight/attack.webp',
    guard:'/v3/assets/authored/knight/guard.webp',
    charge:'/v3/assets/authored/knight/charge.webp',
    hit:'/v3/assets/authored/knight/hit.webp',
    defeat:'/v3/assets/authored/knight/defeat.webp'
  }
};
const KNIGHT_ART_KEY='showdownlab.art.knight';
const cache=new Map(),missing=new Set();
function stateName(action){return action==='kill'?'attack':action==='move'?'move':action==='attack'?'attack':action==='hit'?'hit':action==='skill'?'skill':action==='defeat'?'defeat':'idle'}
function knightState(action){
  if(action==='defeat')return'defeat';
  if(action==='hit')return'hit';
  if(action==='guard'||action==='brace')return'guard';
  if(action==='charge')return'charge';
  if(action==='move'||action==='march'||action==='ready')return'move';
  if(action==='attack'||action==='kill')return'attack';
  return'idle'
}
function resolve(type,state){const f=manifest[type];if(!f)return null;return f.states[state]||f.states.attack||f.states.idle}
function load(src){if(cache.has(src))return cache.get(src);const img=new Image(),rec={img,ready:false};cache.set(src,rec);img.onload=()=>rec.ready=true;img.onerror=()=>missing.add(src);img.src=src;return rec}
function preload(){Object.values(manifest).forEach(f=>Object.values(f.states).forEach(s=>s.frames.forEach(load)));Object.values(authoredKnight.states).forEach(load)}
function drawTeamRing(c,x,y,size,team){c.save();c.strokeStyle=team==='red'?'#ff655f':'#48baff';c.globalAlpha=.58;c.lineWidth=Math.max(1.5,size*.018);c.beginPath();c.ellipse(x,y+size*.37,size*.34,size*.105,0,0,Math.PI*2);c.stroke();c.restore()}
function knightArtMode(){try{return localStorage.getItem(KNIGHT_ART_KEY)||'authored'}catch{return'authored'}}
function setKnightArtMode(mode){const next=mode==='procedural'?'procedural':'authored';try{localStorage.setItem(KNIGHT_ART_KEY,next)}catch{}updateToggle();return next}
function drawProcedural(c,type,x,y,size,team,o){if(!window.FighterArt)return false;window.FighterArt.draw(c,type,x,y,size,team,o);drawTeamRing(c,x,y,size,team);return true}
function drawAuthoredKnight(c,x,y,size,o){
  const state=knightState(o.action),src=authoredKnight.states[state]||authoredKnight.states.idle,rec=load(src);
  if(!rec.ready||missing.has(src))return false;
  const img=rec.img,scale=size*authoredKnight.scale,ratio=img.naturalWidth/Math.max(1,img.naturalHeight),h=scale,w=h*ratio,ax=authoredKnight.anchor[0],ay=authoredKnight.anchor[1];
  c.save();c.translate(x,y);if(o.flip)c.scale(-1,1);c.drawImage(img,-w*ax,-h*ay,w,h);c.restore();drawTeamRing(c,x,y,size,'blue');return true
}
function draw(c,type,x,y,size,team='blue',o={}){
  if(type==='knight'&&team==='blue'&&knightArtMode()==='authored'){
    if(drawAuthoredKnight(c,x,y,size,o))return true;
    return drawProcedural(c,type,x,y,size,team,o)
  }
  if(window.FighterArt)return drawProcedural(c,type,x,y,size,team,o);
  const fighter=manifest[type],state=stateName(o.action),spec=resolve(type,state);
  if(fighter&&spec){const frame=Math.floor(((o.time||0)/1000)*(spec.fps||8))%spec.frames.length,rec=load(spec.frames[frame]);if(rec.ready){const img=rec.img,scale=size*fighter.scale,ratio=img.naturalWidth/Math.max(1,img.naturalHeight),h=scale,w=h*ratio,ax=fighter.anchor?.[0]??.5,ay=fighter.anchor?.[1]??.82;c.save();c.translate(x,y);if(o.flip)c.scale(-1,1);c.drawImage(img,-w*ax,-h*ay,w,h);c.restore();drawTeamRing(c,x,y,size,team);return true}}
  return false
}
function updateToggle(){const b=document.getElementById('knightArtToggle');if(!b)return;const authored=knightArtMode()==='authored';b.textContent=authored?'KNIGHT ART · AUTHORED':'KNIGHT ART · PROCEDURAL';b.dataset.mode=authored?'authored':'procedural'}
function mountToggle(){
  if(document.getElementById('knightArtToggle'))return;
  const b=document.createElement('button');b.id='knightArtToggle';b.type='button';b.setAttribute('aria-label','Toggle Knight art renderer');
  b.style.cssText='position:fixed;right:8px;top:calc(env(safe-area-inset-top,0px) + 58px);z-index:9999;border:1px solid #17313966;border-radius:999px;padding:7px 10px;background:#fff9e5e8;color:#173139;font:900 9px/1 system-ui;letter-spacing:.06em;box-shadow:0 4px 14px #23363d33;backdrop-filter:blur(5px);touch-action:manipulation';
  b.onclick=()=>setKnightArtMode(knightArtMode()==='authored'?'procedural':'authored');document.body.appendChild(b);updateToggle()
}
preload();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountToggle,{once:true});else mountToggle();
window.FighterAssets={manifest,authoredKnight,draw,preload,missing,knightArtMode,setKnightArtMode}
})();