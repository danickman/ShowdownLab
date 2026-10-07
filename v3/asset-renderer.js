(()=>{'use strict';
const manifest={
  knight:{scale:1,anchor:[.5,.82],states:{idle:{frames:['/v3/assets/knight/idle.webp'],fps:4},move:{frames:['/v3/assets/knight/move-1.webp','/v3/assets/knight/move-2.webp'],fps:8},attack:{frames:['/v3/assets/knight/attack-1.webp','/v3/assets/knight/attack-2.webp','/v3/assets/knight/attack-3.webp'],fps:12},skill:{frames:['/v3/assets/knight/skill-1.webp','/v3/assets/knight/skill-2.webp'],fps:10},hit:{frames:['/v3/assets/knight/hit.webp'],fps:8},defeat:{frames:['/v3/assets/knight/defeat.webp'],fps:4}}},
  dragon:{scale:1.28,anchor:[.5,.82],states:{idle:{frames:['/v3/assets/dragon/idle.webp'],fps:4},move:{frames:['/v3/assets/dragon/move-1.webp','/v3/assets/dragon/move-2.webp'],fps:7},attack:{frames:['/v3/assets/dragon/attack-1.webp','/v3/assets/dragon/attack-2.webp'],fps:10},skill:{frames:['/v3/assets/dragon/fire-1.webp','/v3/assets/dragon/fire-2.webp','/v3/assets/dragon/fire-3.webp'],fps:12},hit:{frames:['/v3/assets/dragon/hit.webp'],fps:8},defeat:{frames:['/v3/assets/dragon/defeat.webp'],fps:4}}}
};
const V='base-pack1';
const authored={
  knight:{scale:1.38,anchor:[.5,.918],states:{idle:'idle',move:'move',attack:'attack',guard:'guard',signature:'charge',hit:'hit',defeat:'defeat'}},
  sniper:{scale:1.42,anchor:[.5,.948]},
  goose:{scale:1.26,anchor:[.5,.948]},
  dragon:{scale:1.50,anchor:[.5,.948]},
  assassin:{scale:1.40,anchor:[.5,.948]},
  beetank:{scale:1.50,anchor:[.5,.948]},
  mole:{scale:1.28,anchor:[.5,.948]},
  turtle:{scale:1.46,anchor:[.5,.948]},
  goblin:{scale:1.18,anchor:[.5,.948]},
  barbarian:{scale:1.46,anchor:[.5,.948]}
};
for(const [type,spec] of Object.entries(authored)){
  if(!spec.states)spec.states={idle:'idle',move:'move',attack:'attack',guard:'guard',signature:'signature',hit:'hit',defeat:'defeat'};
  spec.urls={};
  for(const [state,file] of Object.entries(spec.states))spec.urls[state]=`/v3/assets/authored/${type}/${file}.webp?v=${V}`;
}
const ART_KEY='showdownlab.art.base';
const cache=new Map(),missing=new Set(),reported=new Set();
const ACTION_STATES={
  knight:{move:'move',march:'move',charge:'signature',attack:'attack',kill:'attack',guard:'guard',brace:'guard',ready:'idle'},
  sniper:{move:'move',retreat:'move',aim:'signature',attack:'attack',kill:'attack',buttstroke:'attack',guard_close:'guard',reload:'guard'},
  goose:{waddle:'move',scamper:'move',dash:'move',circle:'move',honk:'signature',peck:'attack'},
  dragon:{stalk:'move',loom:'move',fire_windup:'signature',fire:'signature',attack:'attack',claw_swipe:'attack',guard_close:'guard'},
  assassin:{stalk:'move',disengage:'move',vanish:'signature',backstab:'attack'},
  beetank:{bulldoze:'move',ram:'signature',horn:'attack',brace:'guard'},
  mole:{scuttle:'move',dig:'signature',burrow:'signature',erupt:'signature',claw:'attack',claw_swipe:'attack',scrap:'guard'},
  turtle:{trudge:'move',shell:'guard',shell_roll:'signature',shell_slam:'signature',snap:'attack',brace:'guard'},
  goblin:{zigzag:'move',skitter:'move',rush:'signature',stab:'attack'},
  barbarian:{march:'move',rage_charge:'signature',rage_swing:'signature',rage:'signature',axe_swing:'attack',ready:'idle'}
};
function authoredState(type,action){
  if(action==='defeat'||action==='dead')return'defeat';
  if(action==='hit'||action==='stun')return'hit';
  if(action==='heal')return'idle';
  if(action==='reengage')return'move';
  return ACTION_STATES[type]?.[action]||((action==='attack'||action==='kill')?'attack':action==='move'?'move':'idle');
}
function stateName(action){return action==='kill'?'attack':action==='move'?'move':action==='attack'?'attack':action==='hit'?'hit':action==='skill'?'skill':action==='defeat'?'defeat':'idle'}
function resolve(type,state){const f=manifest[type];if(!f)return null;return f.states[state]||f.states.attack||f.states.idle}
function load(src){if(cache.has(src))return cache.get(src);const img=new Image(),rec={img,ready:false,error:false};cache.set(src,rec);img.onload=()=>{rec.ready=true;rec.error=false;missing.delete(src);updateToggle()};img.onerror=()=>{rec.ready=false;rec.error=true;missing.add(src);updateToggle()};img.src=src;return rec}
function allAuthoredUrls(){return Object.values(authored).flatMap(f=>Object.values(f.urls))}
function preload(){Object.values(manifest).forEach(f=>Object.values(f.states).forEach(s=>s.frames.forEach(load)));allAuthoredUrls().forEach(load)}
function drawTeamRing(c,x,y,size,team){c.save();c.strokeStyle=team==='red'?'#ff655f':'#48baff';c.globalAlpha=.58;c.lineWidth=Math.max(1.5,size*.018);c.beginPath();c.ellipse(x,y+size*.37,size*.34,size*.105,0,0,Math.PI*2);c.stroke();c.restore()}
function artMode(){try{return localStorage.getItem(ART_KEY)||'authored'}catch{return'authored'}}
function setArtMode(mode){const next=mode==='procedural'?'procedural':'authored';try{localStorage.setItem(ART_KEY,next)}catch{}updateToggle();return next}
function drawProcedural(c,type,x,y,size,team,o){if(!window.FighterArt)return false;window.FighterArt.draw(c,type,x,y,size,team,o);drawTeamRing(c,x,y,size,team);return true}
function drawAuthored(c,type,x,y,size,team,o){
  const fighter=authored[type];if(!fighter)return false;
  const state=authoredState(type,o.action),src=fighter.urls[state]||fighter.urls.idle,rec=load(src);
  if(!rec.ready||missing.has(src))return false;
  const img=rec.img;if(!img.naturalWidth||!img.naturalHeight)return false;
  const scale=size*fighter.scale,ratio=img.naturalWidth/img.naturalHeight,h=scale,w=h*ratio,ax=fighter.anchor[0],ay=fighter.anchor[1];
  c.save();c.translate(x,y);if(o.flip)c.scale(-1,1);c.drawImage(img,-w*ax,-h*ay,w,h);c.restore();drawTeamRing(c,x,y,size,team);return true
}
function draw(c,type,x,y,size,team='blue',o={}){
  if(authored[type]&&artMode()==='authored'){
    try{if(drawAuthored(c,type,x,y,size,team,o))return true}
    catch(err){const key=type+':'+(o.action||'idle');if(!reported.has(key)){reported.add(key);console.error('[Showdown authored art] draw error',key,err)}}
    return drawProcedural(c,type,x,y,size,team,o)
  }
  if(window.FighterArt)return drawProcedural(c,type,x,y,size,team,o);
  const fighter=manifest[type],state=stateName(o.action),spec=resolve(type,state);
  if(fighter&&spec){const frame=Math.floor(((o.time||0)/1000)*(spec.fps||8))%spec.frames.length,rec=load(spec.frames[frame]);if(rec.ready){const img=rec.img,scale=size*fighter.scale,ratio=img.naturalWidth/Math.max(1,img.naturalHeight),h=scale,w=h*ratio,ax=fighter.anchor?.[0]??.5,ay=fighter.anchor?.[1]??.82;c.save();c.translate(x,y);if(o.flip)c.scale(-1,1);c.drawImage(img,-w*ax,-h*ay,w,h);c.restore();drawTeamRing(c,x,y,size,team);return true}}
  return false
}
function diagnostics(){const byFighter={};for(const [type,f] of Object.entries(authored)){const states={};for(const [state,url] of Object.entries(f.urls)){const r=cache.get(url);states[state]=r?.error?'error':r?.ready?'ready':'loading'}byFighter[type]=states}const urls=allAuthoredUrls(),errors=urls.filter(u=>cache.get(u)?.error),ready=urls.filter(u=>cache.get(u)?.ready);return{mode:artMode(),total:urls.length,ready:ready.length,errors:errors.length,missing:[...missing],byFighter}}
function updateToggle(){const b=document.getElementById('baseArtToggle');if(!b)return;const d=diagnostics();if(d.mode!=='authored'){b.textContent='BASE ART · PROCEDURAL';b.dataset.mode='procedural';return}b.textContent=d.errors?`BASE ART · ${d.errors} ASSET ERROR${d.errors===1?'':'S'}`:d.ready===d.total?'BASE ART · AUTHORED READY':`BASE ART · LOADING ${d.ready}/${d.total}`;b.dataset.mode=d.errors?'error':d.ready===d.total?'authored':'loading';b.title=d.errors?d.missing.join('\n'):`Authored assets ready: ${d.ready}/${d.total}`}
function mountToggle(){
  const old=document.getElementById('knightArtToggle');if(old)old.remove();
  if(document.getElementById('baseArtToggle'))return;
  const b=document.createElement('button');b.id='baseArtToggle';b.type='button';b.setAttribute('aria-label','Toggle authored Base fighter art');
  b.style.cssText='position:fixed;right:8px;top:calc(env(safe-area-inset-top,0px) + 58px);z-index:9999;border:1px solid #17313966;border-radius:999px;padding:7px 10px;background:#fff9e5e8;color:#173139;font:900 9px/1 system-ui;letter-spacing:.06em;box-shadow:0 4px 14px #23363d33;backdrop-filter:blur(5px);touch-action:manipulation';
  b.onclick=()=>setArtMode(artMode()==='authored'?'procedural':'authored');document.body.appendChild(b);updateToggle()
}
preload();if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mountToggle,{once:true});else mountToggle();
window.FighterAssets={manifest,authored,draw,preload,missing,artMode,setArtMode,authoredState,diagnostics,ACTION_STATES,knightArtMode:artMode,setKnightArtMode:setArtMode}
})();