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
function load(src){if(cache.has(src))return cache.get(src);const img=new Image(),rec={img,ready:false,error:false};cache.set(src,rec);img.onload=()=>{rec.ready=true;rec.error=false;missing.delete(src);try{window.dispatchEvent(new CustomEvent('showdown:artready',{detail:{src}}))}catch{}};img.onerror=()=>{rec.ready=false;rec.error=true;missing.add(src);try{window.dispatchEvent(new CustomEvent('showdown:arterror',{detail:{src}}))}catch{}};img.src=src;return rec}
function allAuthoredUrls(){return Object.values(authored).flatMap(f=>Object.values(f.urls))}
function preload(){Object.values(manifest).forEach(f=>Object.values(f.states).forEach(s=>s.frames.forEach(load)));allAuthoredUrls().forEach(load)}
function drawTeamRing(c,x,y,size,team){c.save();c.strokeStyle=team==='red'?'#ff655f':'#48baff';c.globalAlpha=.58;c.lineWidth=Math.max(1.5,size*.018);c.beginPath();c.ellipse(x,y+size*.37,size*.34,size*.105,0,0,Math.PI*2);c.stroke();c.restore()}
function drawProcedural(c,type,x,y,size,team,o){if(!window.FighterArt)return false;window.FighterArt.draw(c,type,x,y,size,team,o);drawTeamRing(c,x,y,size,team);return true}
const POSE_HOLD={attack:360,signature:520,hit:340,guard:190};
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
      const heavy=type==='turtle'||type==='beetank'||type==='dragon'||type==='barbarian';
      const cycle=heavy?520:390,active=heavy?.58:.64,phase=((now+(Number(o.id)||0)*97)%cycle)/cycle;
      state=phase<active?'move':'idle';
    }
    if(state!==prev.state){prev.state=state;prev.entered=now}
  }
  prev.lastSeen=now;poseMemory.set(key,prev);
  if(poseMemory.size>700)for(const[k,v]of poseMemory){if(now-v.lastSeen>12000)poseMemory.delete(k)}
  return{state:prev.state,age:Math.max(0,now-prev.entered),hold:Math.max(0,prev.holdUntil-prev.entered)};
}
function motion(type,state,o,size,age=999,hold=0){
  if(state==='defeat')return{dx:0,dy:0,rot:0,sx:1,sy:1};
  const id=Number.isFinite(o.id)?o.id:0,t=(Number(o.time)||0)/1000+id*.731;
  const heavy=type==='turtle'||type==='beetank'||type==='dragon'||type==='barbarian';
  let dx=0,dy=0,rot=0,sx=1,sy=1;
  if(state==='move'){
    const q=Math.sin(t*(heavy?4.4:6.2));
    dy=q*size*(heavy?.012:.018);rot=q*(heavy?.006:.012);
    sx=1+Math.abs(q)*.005;sy=1-Math.abs(q)*.005;
  }else if(state==='guard'){
    const q=Math.sin(t*(type==='turtle'?2.8:2.2));
    dy=q*size*(type==='turtle'?.014:.008);rot=q*(type==='turtle'?.005:.003);
    sx=1+q*.004;sy=1-q*.004;
  }else if(state==='attack'){
    const p=hold?Math.min(1,age/hold):1,b=Math.sin(Math.min(1,p/.78)*Math.PI);
    dx=size*.075*b;dy=-size*.008*b;rot=-.025*b;sx=1+.018*b;sy=1-.012*b;
  }else if(state==='signature'){
    const p=hold?Math.min(1,age/hold):1,b=Math.sin(Math.min(1,p/.82)*Math.PI),q=Math.sin(t*4.2);
    dx=size*.045*b;dy=(q*.006-b*.018)*size;rot=-.012*b;sx=1+.024*b;sy=1-.016*b;
  }else if(state==='hit'){
    const p=hold?Math.min(1,age/hold):1,b=Math.sin(Math.min(1,p/.72)*Math.PI);
    dx=-size*.055*b;rot=.035*b;sx=1-.012*b;sy=1+.010*b;
  }else{
    const q=Math.sin(t*(type==='turtle'?2.5:2.1));
    dy=q*size*(type==='turtle'?.012:heavy?.008:.010);rot=q*(type==='goose'?.004:.002);
    sx=1+q*.003;sy=1-q*.003;
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
  const scale=o.presentation?size:size*fighter.scale,ratio=img.naturalWidth/img.naturalHeight,h=scale,w=h*ratio,ax=fighter.anchor[0],ay=fighter.anchor[1],m=motion(type,state,o,size,pose.age,pose.hold);
  c.save();c.translate(x+m.dx,y+m.dy);c.rotate(m.rot);c.scale(o.flip?-m.sx:m.sx,m.sy);
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