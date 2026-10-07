(()=>{'use strict';
const manifest={
  knight:{scale:1,anchor:[.5,.82],states:{idle:{frames:['/v3/assets/knight/idle.webp'],fps:4},move:{frames:['/v3/assets/knight/move-1.webp','/v3/assets/knight/move-2.webp'],fps:8},attack:{frames:['/v3/assets/knight/attack-1.webp','/v3/assets/knight/attack-2.webp','/v3/assets/knight/attack-3.webp'],fps:12},skill:{frames:['/v3/assets/knight/skill-1.webp','/v3/assets/knight/skill-2.webp'],fps:10},hit:{frames:['/v3/assets/knight/hit.webp'],fps:8},defeat:{frames:['/v3/assets/knight/defeat.webp'],fps:4}}},
  dragon:{scale:1.28,anchor:[.5,.82],states:{idle:{frames:['/v3/assets/dragon/idle.webp'],fps:4},move:{frames:['/v3/assets/dragon/move-1.webp','/v3/assets/dragon/move-2.webp'],fps:7},attack:{frames:['/v3/assets/dragon/attack-1.webp','/v3/assets/dragon/attack-2.webp'],fps:10},skill:{frames:['/v3/assets/dragon/fire-1.webp','/v3/assets/dragon/fire-2.webp','/v3/assets/dragon/fire-3.webp'],fps:12},hit:{frames:['/v3/assets/dragon/hit.webp'],fps:8},defeat:{frames:['/v3/assets/dragon/defeat.webp'],fps:4}}}
};
const V='base-pack2';
const authored={
  knight:{scale:1.30,anchor:[.5,.918],states:{idle:'idle',move:'move',attack:'attack',guard:'guard',signature:'charge',hit:'hit',defeat:'defeat'}},
  sniper:{scale:1.32,anchor:[.5,.948]},
  goose:{scale:1.20,anchor:[.5,.948]},
  dragon:{scale:1.16,anchor:[.5,.948]},
  assassin:{scale:1.28,anchor:[.5,.948]},
  beetank:{scale:1.16,anchor:[.5,.948]},
  mole:{scale:1.20,anchor:[.5,.948]},
  turtle:{scale:1.12,anchor:[.5,.948]},
  goblin:{scale:1.16,anchor:[.5,.948]},
  barbarian:{scale:1.16,anchor:[.5,.948]}
};
for(const [type,spec] of Object.entries(authored)){
  if(!spec.states)spec.states={idle:'idle',move:'move',attack:'attack',guard:'guard',signature:'signature',hit:'hit',defeat:'defeat'};
  spec.urls={};
  for(const [state,file] of Object.entries(spec.states))spec.urls[state]=`/v3/assets/authored/${type}/${file}.webp?v=${V}`;
}
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
function load(src){if(cache.has(src))return cache.get(src);const img=new Image(),rec={img,ready:false,error:false};cache.set(src,rec);img.onload=()=>{rec.ready=true;rec.error=false;missing.delete(src)};img.onerror=()=>{rec.ready=false;rec.error=true;missing.add(src)};img.src=src;return rec}
function allAuthoredUrls(){return Object.values(authored).flatMap(f=>Object.values(f.urls))}
function preload(){Object.values(manifest).forEach(f=>Object.values(f.states).forEach(s=>s.frames.forEach(load)));allAuthoredUrls().forEach(load)}
function drawTeamRing(c,x,y,size,team){c.save();c.strokeStyle=team==='red'?'#ff655f':'#48baff';c.globalAlpha=.58;c.lineWidth=Math.max(1.5,size*.018);c.beginPath();c.ellipse(x,y+size*.37,size*.34,size*.105,0,0,Math.PI*2);c.stroke();c.restore()}
function drawProcedural(c,type,x,y,size,team,o){if(!window.FighterArt)return false;window.FighterArt.draw(c,type,x,y,size,team,o);drawTeamRing(c,x,y,size,team);return true}
function motion(type,state,o,size){
  if(state==='defeat'||state==='hit')return{dy:0,rot:0,sx:1,sy:1};
  const id=Number.isFinite(o.id)?o.id:0,t=(Number(o.time)||0)/1000+id*.731;
  const heavy=type==='turtle'||type==='beetank'||type==='dragon'||type==='barbarian';
  let dy=0,rot=0,sx=1,sy=1;
  if(state==='move'){
    const q=Math.sin(t*(heavy?6.2:8.4));
    dy=q*size*(heavy?.018:.026);rot=q*(heavy?.010:.018);
    sx=1+Math.abs(q)*.008;sy=1-Math.abs(q)*.008;
  }else if(state==='guard'){
    const q=Math.sin(t*(type==='turtle'?3.6:2.8));
    dy=q*size*(type==='turtle'?.020:.010);rot=q*(type==='turtle'?.007:.004);
    sx=1+q*.006;sy=1-q*.006;
  }else if(state==='signature'){
    const q=Math.sin(t*5.0);
    dy=q*size*.010;sx=1+q*.010;sy=1-q*.010;
  }else{
    const q=Math.sin(t*(type==='turtle'?3.2:2.5));
    dy=q*size*(type==='turtle'?.018:heavy?.010:.013);rot=q*(type==='goose'?.006:.003);
    sx=1+q*.004;sy=1-q*.004;
  }
  return{dy,rot,sx,sy};
}
function drawAuthored(c,type,x,y,size,team,o){
  const fighter=authored[type];if(!fighter)return false;
  const state=authoredState(type,o.action),src=fighter.urls[state]||fighter.urls.idle,rec=load(src);
  if(!rec.ready||missing.has(src))return false;
  const img=rec.img;if(!img.naturalWidth||!img.naturalHeight)return false;
  const scale=size*fighter.scale,ratio=img.naturalWidth/img.naturalHeight,h=scale,w=h*ratio,ax=fighter.anchor[0],ay=fighter.anchor[1],m=motion(type,state,o,size);
  c.save();c.translate(x,y+m.dy);c.rotate(m.rot);c.scale(o.flip?-m.sx:m.sx,m.sy);c.drawImage(img,-w*ax,-h*ay,w,h);c.restore();drawTeamRing(c,x,y,size,team);return true
}
function draw(c,type,x,y,size,team='blue',o={}){
  if(authored[type]){
    try{if(drawAuthored(c,type,x,y,size,team,o))return true}
    catch(err){const key=type+':'+(o.action||'idle');if(!reported.has(key)){reported.add(key);console.error('[Showdown authored art] draw error',key,err)}}
    return drawProcedural(c,type,x,y,size,team,o)
  }
  if(window.FighterArt)return drawProcedural(c,type,x,y,size,team,o);
  const fighter=manifest[type],state=stateName(o.action),spec=resolve(type,state);
  if(fighter&&spec){const frame=Math.floor(((o.time||0)/1000)*(spec.fps||8))%spec.frames.length,rec=load(spec.frames[frame]);if(rec.ready){const img=rec.img,scale=size*fighter.scale,ratio=img.naturalWidth/Math.max(1,img.naturalHeight),h=scale,w=h*ratio,ax=fighter.anchor?.[0]??.5,ay=fighter.anchor?.[1]??.82;c.save();c.translate(x,y);if(o.flip)c.scale(-1,1);c.drawImage(img,-w*ax,-h*ay,w,h);c.restore();drawTeamRing(c,x,y,size,team);return true}}
  return false
}
function diagnostics(){const byFighter={};for(const [type,f] of Object.entries(authored)){const states={};for(const [state,url] of Object.entries(f.urls)){const r=cache.get(url);states[state]=r?.error?'error':r?.ready?'ready':'loading'}byFighter[type]=states}const urls=allAuthoredUrls(),errors=urls.filter(u=>cache.get(u)?.error),ready=urls.filter(u=>cache.get(u)?.ready);return{mode:'authored',total:urls.length,ready:ready.length,errors:errors.length,missing:[...missing],byFighter}}
preload();
window.FighterAssets={manifest,authored,draw,preload,missing,authoredState,diagnostics,ACTION_STATES}
})();