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
  dragon:{scale:1.36,anchor:[.5,.948],inkBoost:1.065},
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
const cache=new Map(),missing=new Set(),reported=new Set(),poseMemory=new Map();
const ACTION_STATES={
  knight:{move:'move',march:'move',charge:'signature',attack:'attack',kill:'attack',guard:'guard',brace:'guard',ready:'idle'},
  sniper:{move:'idle',retreat:'idle',aim:'signature',attack:'attack',kill:'attack',buttstroke:'attack',guard_close:'idle',reload:'idle'},
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
function load(src){if(cache.has(src))return cache.get(src);const img=new Image(),rec={img,ready:false,error:false};cache.set(src,rec);img.onload=()=>{rec.ready=true;rec.error=false;missing.delete(src);try{window.dispatchEvent(new CustomEvent('showdown:artready',{detail:{src}}))}catch{}};img.onerror=()=>{rec.ready=false;rec.error=true;missing.add(src);try{window.dispatchEvent(new CustomEvent('showdown:arterror',{detail:{src}}))}catch{}};img.src=src;return rec}
function allAuthoredUrls(){return Object.values(authored).flatMap(f=>Object.values(f.urls))}
function preload(){Object.values(manifest).forEach(f=>Object.values(f.states).forEach(s=>s.frames.forEach(load)));allAuthoredUrls().forEach(load)}
function drawTeamRing(c,x,y,size,team){
  const col=team==='red'?'#ff5d57':'#36bfff';
  c.save();
  c.globalAlpha=.15;c.fillStyle=col;c.beginPath();c.ellipse(x,y+size*.37,size*.39,size*.14,0,0,Math.PI*2);c.fill();
  c.globalAlpha=.84;c.strokeStyle=col;c.lineWidth=Math.max(2,size*.024);c.beginPath();c.ellipse(x,y+size*.37,size*.35,size*.108,0,0,Math.PI*2);c.stroke();
  c.globalAlpha=.28;c.lineWidth=Math.max(1,size*.010);c.beginPath();c.ellipse(x,y+size*.37,size*.27,size*.078,0,0,Math.PI*2);c.stroke();
  c.restore()
}
function drawProcedural(c,type,x,y,size,team,o){if(!window.FighterArt)return false;window.FighterArt.draw(c,type,x,y,size,team,o);drawTeamRing(c,x,y,size,team);return true}
const POSE_HOLD={attack:380,signature:560,hit:340,guard:220};
const MOTION_PROFILE={
  knight:{moveCycle:410,moveActive:.58,attackLunge:.078,signatureLunge:.060,weight:1.00},
  sniper:{moveCycle:430,moveActive:.54,attackLunge:.035,signatureLunge:.015,weight:.88},
  goose:{moveCycle:360,moveActive:.62,attackLunge:.060,signatureLunge:.020,weight:.72},
  dragon:{moveCycle:680,moveActive:.42,attackLunge:.040,signatureLunge:.018,weight:1.34},
  assassin:{moveCycle:380,moveActive:.60,attackLunge:.085,signatureLunge:.050,weight:.82},
  beetank:{moveCycle:720,moveActive:.40,attackLunge:.085,signatureLunge:.105,weight:1.45},
  mole:{moveCycle:470,moveActive:.52,attackLunge:.072,signatureLunge:.055,weight:1.04},
  turtle:{moveCycle:760,moveActive:.38,attackLunge:.060,signatureLunge:.085,weight:1.52},
  goblin:{moveCycle:330,moveActive:.64,attackLunge:.090,signatureLunge:.070,weight:.68},
  barbarian:{moveCycle:620,moveActive:.44,attackLunge:.100,signatureLunge:.095,weight:1.28}
};
const POSE_PRIORITY={idle:0,move:1,guard:2,attack:3,signature:4,hit:5,defeat:6};
function displayedPose(type,o,requested){
  if(o.presentation||!Number.isFinite(o.id)||!Number.isFinite(Number(o.time)))return{state:requested,age:999,hold:0};
  const now=Number(o.time),key=String(o.id),prev=poseMemory.get(key)||{raw:null,state:'idle',entered:now,holdUntil:0,lastSeen:now};
  if(requested==='defeat'){prev.raw=requested;prev.state='defeat';prev.entered=now;prev.holdUntil=now+650;prev.lastSeen=now;poseMemory.set(key,prev);return{state:'defeat',age:0,hold:650}}
  if(prev.state==='defeat'&&requested!=='defeat'){prev.raw=requested;prev.state=requested;prev.entered=now;prev.holdUntil=0;prev.lastSeen=now;poseMemory.set(key,prev);return{state:requested,age:0,hold:0}}
  const changed=requested!==prev.raw;
  if(changed){
    prev.raw=requested;
    const hold=POSE_HOLD[requested]||0;
    const mayInterrupt=requested==='hit'||POSE_PRIORITY[requested]>=POSE_PRIORITY[prev.state]||now>=prev.holdUntil;
    if(hold&&mayInterrupt){prev.state=requested;prev.entered=now;prev.holdUntil=now+hold}
    else if(now>=prev.holdUntil){prev.state=requested;prev.entered=now;prev.holdUntil=now}
  }
  if(now>=prev.holdUntil){
    let state=requested;
    if(requested==='move'){
      const p=MOTION_PROFILE[type]||MOTION_PROFILE.knight,cycle=p.moveCycle||410,active=p.moveActive??.58,phase=((now+(Number(o.id)||0)*97)%cycle)/cycle;
      state=phase<active?'move':'idle';
    }
    if(state!==prev.state){prev.state=state;prev.entered=now}
  }
  prev.lastSeen=now;poseMemory.set(key,prev);
  if(poseMemory.size>700)for(const[k,v]of poseMemory){if(now-v.lastSeen>12000)poseMemory.delete(k)}
  return{state:prev.state,age:Math.max(0,now-prev.entered),hold:Math.max(0,prev.holdUntil-prev.entered)};
}
function easePulse(age,hold,peak=.62){
  if(!hold)return 0;
  const p=Math.max(0,Math.min(1,age/hold));
  if(p<=peak)return Math.sin((p/peak)*Math.PI*.5);
  return Math.cos(((p-peak)/(1-peak))*Math.PI*.5);
}
function motion(type,state,o,size,age=999,hold=0){
  if(state==='defeat')return{dx:0,dy:0,rot:0,sx:1,sy:1};
  const id=Number.isFinite(o.id)?o.id:0,t=(Number(o.time)||0)/1000+id*.731,pf=MOTION_PROFILE[type]||MOTION_PROFILE.knight,w=pf.weight||1;
  let dx=0,dy=0,rot=0,sx=1,sy=1;
  if(state==='move'){
    const freq=(Math.PI*2)/Math.max(.25,(pf.moveCycle||410)/1000),q=Math.sin(t*freq),amp=.020/Math.sqrt(w);
    dy=q*size*amp;rot=q*(.012/Math.sqrt(w));sx=1+Math.abs(q)*(.006/Math.sqrt(w));sy=1-Math.abs(q)*(.006/Math.sqrt(w));
  }else if(state==='guard'){
    const q=Math.sin(t*(type==='turtle'?2.15:type==='beetank'?2.3:2.6)),settle=easePulse(age,hold,.42);
    dy=size*((q*.005/Math.sqrt(w))+.018*settle*w/1.5);rot=q*(.004/Math.sqrt(w));
    sx=1+.010*settle;sy=1-.020*settle;
  }else if(state==='attack'){
    const b=easePulse(age,hold,.48),l=pf.attackLunge||.075;
    dx=size*l*b;dy=-size*.010*b;rot=-.026*b/Math.sqrt(w);sx=1+.020*b;sy=1-.014*b;
  }else if(state==='signature'){
    const b=easePulse(age,hold,.55),l=pf.signatureLunge||.050,q=Math.sin(t*3.4);
    dx=size*l*b;dy=size*((q*.004/Math.sqrt(w))-.018*b);rot=-.016*b/Math.sqrt(w);sx=1+.028*b;sy=1-.020*b;
    if(type==='beetank'||type==='turtle'){dy+=size*.018*b;sx+=.018*b;sy-=.024*b}
    if(type==='dragon'){dx*=.35;dy-=size*.010*b;rot*=.35;sx+=.010*b}
    if(type==='barbarian'){dx*=1.12;rot*=1.25}
  }else if(state==='hit'){
    const b=easePulse(age,hold,.40);
    dx=-size*.055*b/Math.sqrt(w);rot=.036*b/Math.sqrt(w);sx=1-.014*b;sy=1+.012*b;
  }else{
    const q=Math.sin(t*(2.35/Math.sqrt(w))),amp=.011/Math.sqrt(w);
    dy=q*size*amp;rot=q*(type==='goose'?.004:.0025)/Math.sqrt(w);sx=1+q*.003;sy=1-q*.003;
  }
  if(o.flip)dx=-dx;
  return{dx,dy,rot:o.flip?-rot:rot,sx,sy};
}
function drawAuthored(c,type,x,y,size,team,o){
  const fighter=authored[type];if(!fighter)return false;
  const requested=authoredState(type,o.action),pose=displayedPose(type,o,requested),state=pose.state,src=fighter.urls[state]||fighter.urls.idle,rec=load(src);
  if(rec.error||missing.has(src))return false;
  if(!rec.ready){drawTeamRing(c,x,y,size,team);return 'loading'}
  const img=rec.img;if(!img.naturalWidth||!img.naturalHeight)return false;
  const ratio=img.naturalWidth/img.naturalHeight,ax=fighter.anchor[0],ay=fighter.anchor[1],m=motion(type,state,o,size,pose.age,pose.hold);
  let h=o.presentation?size:size*fighter.scale,drawX=x,drawY=y;
  if(o.presentation){
    const cw=c.canvas?.width||size,ch=c.canvas?.height||size;
    const padX=cw*.08,padY=ch*.055,ringReserve=ch*.16,maxW=Math.max(1,cw-padX*2),maxH=Math.max(1,ch-padY*2-ringReserve);
    h=Math.min(h,maxH,maxW/Math.max(.001,ratio));
    drawX=cw*.5;
    drawY=padY+h*ay;
    y=drawY;
  }
  const w=h*ratio;
  c.save();c.translate(drawX+m.dx,drawY+m.dy);c.rotate(m.rot);c.scale(o.flip?-m.sx:m.sx,m.sy);
  if(fighter.inkBoost){
    c.save();c.filter='brightness(0)';c.globalAlpha=.92;
    const bw=w*fighter.inkBoost,bh=h*fighter.inkBoost;
    c.drawImage(img,-bw*ax,-bh*ay,bw,bh);c.restore()
  }
  c.drawImage(img,-w*ax,-h*ay,w,h);c.restore();drawTeamRing(c,x,y,size,team);return true
}
function draw(c,type,x,y,size,team='blue',o={}){
  if(authored[type]){
    try{const drawn=drawAuthored(c,type,x,y,size,team,o);if(drawn===true||drawn==='loading')return true}
    catch(err){const key=type+':'+(o.action||'idle');if(!reported.has(key)){reported.add(key);console.error('[Showdown authored art] draw error',key,err)}}
    return drawProcedural(c,type,x,y,size,team,o)
  }
  if(window.FighterArt)return drawProcedural(c,type,x,y,size,team,o);
  const fighter=manifest[type],state=stateName(o.action),spec=resolve(type,state);
  if(fighter&&spec){const frame=Math.floor(((o.time||0)/1000)*(spec.fps||8))%spec.frames.length,rec=load(spec.frames[frame]);if(rec.ready){const img=rec.img,scale=size*fighter.scale,ratio=img.naturalWidth/Math.max(1,img.naturalHeight),h=scale,w=h*ratio,ax=fighter.anchor?.[0]??.5,ay=fighter.anchor?.[1]??.82;c.save();c.translate(x,y);if(o.flip)c.scale(-1,1);c.drawImage(img,-w*ax,-h*ay,w,h);c.restore();drawTeamRing(c,x,y,size,team);return true}}
  return false
}
function resetPoseMemory(){poseMemory.clear()}
function diagnostics(){const byFighter={};for(const [type,f] of Object.entries(authored)){const states={};for(const [state,url] of Object.entries(f.urls)){const r=cache.get(url);states[state]=r?.error?'error':r?.ready?'ready':'loading'}byFighter[type]=states}const urls=allAuthoredUrls(),errors=urls.filter(u=>cache.get(u)?.error),ready=urls.filter(u=>cache.get(u)?.ready);return{mode:'authored',total:urls.length,ready:ready.length,errors:errors.length,missing:[...missing],byFighter}}
preload();
window.FighterAssets={manifest,authored,draw,preload,missing,authoredState,diagnostics,ACTION_STATES,resetPoseMemory}
})();