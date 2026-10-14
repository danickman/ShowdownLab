(()=>{'use strict';
const manifest={
  knight:{scale:1,anchor:[.5,.82],states:{idle:{frames:['/v3/assets/knight/idle.webp'],fps:4},move:{frames:['/v3/assets/knight/move-1.webp','/v3/assets/knight/move-2.webp'],fps:8},attack:{frames:['/v3/assets/knight/attack-1.webp','/v3/assets/knight/attack-2.webp','/v3/assets/knight/attack-3.webp'],fps:12},skill:{frames:['/v3/assets/knight/skill-1.webp','/v3/assets/knight/skill-2.webp'],fps:10},hit:{frames:['/v3/assets/knight/hit.webp'],fps:8},defeat:{frames:['/v3/assets/knight/defeat.webp'],fps:4}}},
  dragon:{scale:1.28,anchor:[.5,.82],states:{idle:{frames:['/v3/assets/dragon/idle.webp'],fps:4},move:{frames:['/v3/assets/dragon/move-1.webp','/v3/assets/dragon/move-2.webp'],fps:7},attack:{frames:['/v3/assets/dragon/attack-1.webp','/v3/assets/dragon/attack-2.webp'],fps:10},skill:{frames:['/v3/assets/dragon/fire-1.webp','/v3/assets/dragon/fire-2.webp','/v3/assets/dragon/fire-3.webp'],fps:12},hit:{frames:['/v3/assets/dragon/hit.webp'],fps:8},defeat:{frames:['/v3/assets/dragon/defeat.webp'],fps:4}}}
};
const V='ultimate-roster10';
const evolution=window.ShowdownEvolution,reduceMotionQuery=window.matchMedia?.('(prefers-reduced-motion: reduce)');
const authored={
  knight:{presentation:'presentation',scale:1.30,anchor:[.5,.918],states:{idle:'idle',move:'move',attack:'attack',guard:'guard',signature:'charge',hit:'hit',defeat:'defeat'}},
  sniper:{scale:1.26,anchor:[.5,.948],presentation:'presentation'},
  goose:{presentation:'presentation',scale:1.20,anchor:[.5,.948]},
  // Dragon has authored ink already; keep every form free of silhouette/contrast processing.
  dragon:{presentation:'presentation',scale:1.36,anchor:[.5,.948],cleanSprite:true},
  assassin:{presentation:'presentation',scale:1.28,anchor:[.5,.948]},
  beetank:{facing:-1,presentation:'presentation',scale:1.16,anchor:[.5,.948]},
  mole:{presentation:'presentation',scale:1.20,anchor:[.5,.948]},
  turtle:{scale:1.12,anchor:[.5,.948],presentation:'presentation'},
  goblin:{presentation:'presentation',scale:1.16,anchor:[.5,.948]},
  barbarian:{presentation:'presentation',scale:1.16,anchor:[.5,.948]}
};
for(const [type,spec] of Object.entries(authored)){
  if(!spec.states)spec.states={idle:'idle',move:'move',attack:'attack',guard:'guard',signature:'signature',hit:'hit',defeat:'defeat'};
  spec.urls={};
  for(const [state,file] of Object.entries(spec.states))spec.urls[state]=`/v3/assets/authored/${type}/${file}.webp?v=${type==='knight'?'knight-base256b':V}`;
  if(spec.presentation)spec.presentationUrl=`/v3/assets/authored/${type}/${spec.presentation}.webp?v=${V}`;
}
const evolutions={knight:window.KnightEvolvedArt,beetank:window.BeetankEvolvedArt,goose:window.GooseEvolvedArt,sniper:window.SniperEvolvedArt,dragon:window.DragonEvolvedArt,assassin:window.AssassinEvolvedArt,mole:window.MoleEvolvedArt,turtle:window.TurtleEvolvedArt,goblin:window.GoblinEvolvedArt,barbarian:window.BarbarianEvolvedArt};
const bases={dragon:window.DragonBaseArt};
const ultimates=Object.fromEntries(Object.keys(authored).map(type=>[type,window[type[0].toUpperCase()+type.slice(1)+'UltimateArt']]));
for(const [form,packs]of [['base',bases],['evolved',evolutions],['ultimate',ultimates]])for(const [type,e]of Object.entries(packs))if(e){e.urls={};for(const [state,p]of Object.entries(e.poses))e.urls[state]=`/v3/assets/authored/${type}/${form==='base'?'':form+'/'}${p.file}.webp?v=${V}`;e.presentationUrl=`/v3/assets/authored/${type}/${form==='base'?'':form+'/'}presentation.webp?v=${V}`}
function visualForm(type,level=1){return evolution.tier(level)==='ultimate'&&ultimates[type]?'ultimate':evolution.normalize(level)>=2&&evolutions[type]?'evolved':'base'}
function selectedArt(type,level){const form=visualForm(type,level);return form==='ultimate'?ultimates[type]:form==='evolved'?evolutions[type]:(bases[type]||null)}
function cueOffset(type,level,action,role,size,facing=1){
  const e=selectedArt(type,level);if(!e)return null;
  const state=e.actions?.[action]||authoredState(type,action),cue=e.poses[state]?.cues?.[role];
  if(!cue)return null;
  const k=size*e.scale/e.referenceHeight;return{x:cue[0]*k*facing,y:cue[1]*k};
}
const envelopeCache=new Map();
function visualEnvelope(type,level=1){
  const key=type+':'+visualForm(type,level);if(envelopeCache.has(key))return envelopeCache.get(key);
  const f=authored[type],h=(f?.scale||1.36)*(f?.inkBoost||1),a=f?.anchor||[.5,.948];
  if(!selectedArt(type,level)){const box={left:h*.5,right:h*.5,above:h*a[1],below:h*(1-a[1])};envelopeCache.set(key,box);return box}
  const evolved=selectedArt(type,level),e={left:0,right:0,above:0,below:0},k=evolved.scale/evolved.referenceHeight;
  for(const p of Object.values(evolved.poses)){e.left=Math.max(e.left,p.width*p.anchor[0]*k);e.right=Math.max(e.right,p.width*(1-p.anchor[0])*k);e.above=Math.max(e.above,p.height*p.anchor[1]*k);e.below=Math.max(e.below,p.height*(1-p.anchor[1])*k)}
  // Equipment and recoil reserve, symmetric for either team facing.
  const side=Math.max(e.left,e.right)+.12,box={left:side,right:side,above:e.above+.08,below:Math.max(.14,e.below+.05)};envelopeCache.set(key,box);return box;
}
const cache=new Map(),missing=new Set(),reported=new Set(),poseMemory=new Map(),hitReactions=new Map();
const presentationInkCache=new WeakMap();
function presentationInk(img){
  if(presentationInkCache.has(img))return presentationInkCache.get(img);
  let result=img;
  try{
    const make=()=>{const cv=window.document?.createElement('canvas');if(!cv)return null;cv.width=img.naturalWidth;cv.height=img.naturalHeight;return cv};
    const mask=make(),out=make();if(mask&&out){const m=mask.getContext('2d'),c=out.getContext('2d');
      m.drawImage(img,0,0);m.globalCompositeOperation='source-in';m.fillStyle='#152026';m.fillRect(0,0,mask.width,mask.height);
      c.globalAlpha=.75;for(const [x,y]of [[-.3,0],[.3,0],[0,-.3],[0,.3]])c.drawImage(mask,x,y);
      c.globalAlpha=1;c.filter='contrast(1.16)';c.drawImage(img,0,0);c.filter='none';result=out;
    }
  }catch{}
  // One small processed bitmap per canonical image, never per unit or frame.
  presentationInkCache.set(img,result);return result;
}
const ACTION_STATES={
  knight:{move:'move',march:'move',charge:'signature',attack:'attack',kill:'attack',guard:'guard',brace:'guard',ready:'idle'},
  sniper:{move:'idle',retreat:'idle',aim:'signature',attack:'attack',kill:'attack',buttstroke:'attack',guard_close:'idle',reload:'idle'},
  goose:{guard:'guard',brace:'guard',waddle:'move',scamper:'move',dash:'move',circle:'move',honk:'signature',peck:'attack'},
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
function allAuthoredUrls(){return [...new Set(Object.values(authored).flatMap(f=>[...Object.values(f.urls),...(f.presentationUrl?[f.presentationUrl]:[])]).concat([...Object.values(bases),...Object.values(evolutions),...Object.values(ultimates)].filter(Boolean).flatMap(e=>[...Object.values(e.urls),e.presentationUrl])))]}
// Turn 4: load only images relevant to the current screen / selected battle.
function preload(){allAuthoredUrls().forEach(load)} // Explicit full-pack QA/offline operation; never called at startup.
function preloadHome(){for(const type of ['knight','dragon'])load((bases[type]||authored[type])?.presentationUrl||authored[type].urls.idle)}
function preloadRoster(){for(const [type,f] of Object.entries(authored))load((bases[type]||f).presentationUrl||f.urls.idle)}
function preloadSpecies(type,level=1){
 if(!authored[type])return;
 const f=authored[type],art=selectedArt(type,level);
 // Preload idle and fallback first; chosen combat pack follows.
 load(f.urls.idle);
 if(art){load(art.urls.idle);Object.values(art.urls).forEach(load)}
 else Object.values(f.urls).forEach(load);
}
function preloadBattle(blue={},red={},blueLevels={},redLevels={}){
 for(const [army,levels] of [[blue,blueLevels],[red,redLevels]])for(const [type,count] of Object.entries(army||{}))if(count>0)preloadSpecies(type,levels?.[type]||1)
}
function assetStatus(){const urls=allAuthoredUrls();return{requested:urls.filter(u=>cache.has(u)).length,ready:urls.filter(u=>cache.get(u)?.ready).length,errors:urls.filter(u=>cache.get(u)?.error).length,total:urls.length}}

function drawTeamRing(c,x,y,size,team,ground=y,density=0){
  const col=team==='red'?'#dc5146':'#228fba';
  c.save();
  c.globalAlpha=.23;c.fillStyle=col;c.beginPath();c.ellipse(x,ground,size*.39,size*.14,0,0,Math.PI*2);c.fill();
  c.globalAlpha=.95;c.strokeStyle=col;c.lineWidth=Math.max(2.5,size*.032);c.beginPath();c.ellipse(x,ground,size*.35,size*.108,0,0,Math.PI*2);c.stroke();
  if(density<36){
  c.globalAlpha=.28;c.lineWidth=Math.max(1,size*.010);c.beginPath();c.ellipse(x,ground,size*.27,size*.078,0,0,Math.PI*2);c.stroke();
  }
  c.restore()
}
// Logical CSS-pixel bounds: independent of DPR and of the combat camera.
function presentationFrame(bounds,ratio=1,anchor=[.5,.948],scale=1){
  const {x=0,y=0,width,height}=bounds,padX=width*.06,padY=height*.04,ringReserve=height*.14;
  const h=Math.min(height-padY*2-ringReserve,(width-padX*2)/Math.max(.001,ratio))*Math.max(.1,Math.min(1,scale));
  const w=h*ratio,left=x+(width-w)*.5,top=y+padY+(height-padY*2-ringReserve-h)*.5;
  const ringSize=Math.min(width*.9,ringReserve/.32);
  return{x:left+w*anchor[0],y:top+h*anchor[1],w,h,ringX:x+width*.5,ringY:top+h*anchor[1]+ringSize*.02,ringSize};
}
function drawProcedural(c,type,x,y,size,team,o){
  if(!window.FighterArt)return false;
  if(o.presentation){const b=o.presentationBounds||{width:c.canvas.width,height:c.canvas.height},f=presentationFrame(b);window.FighterArt.draw(c,type,f.x,f.y-f.h*.35,f.h*.68,team,{...o,action:'idle'});drawTeamRing(c,f.ringX,0,f.ringSize,team,f.ringY)}
  else{drawTeamRing(c,x,y,size,team,y,o.density||0);window.FighterArt.draw(c,type,x,y-size*.43,size,team,o)}
  return true
}
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
  const now=Number(o.time),key=String(o.id)+':'+type+':'+visualForm(type,o.level),prev=poseMemory.get(key)||{raw:null,state:'idle',entered:now,holdUntil:0,lastSeen:now};
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
  const reaction=hitReactions.get(String(o.id));
  if(reaction&&!o.presentation){const elapsed=(Number(o.time)||0)-reaction.time;if(elapsed>240)hitReactions.delete(String(o.id));else if(elapsed>=0&&state!=='hit'){const b=easePulse(elapsed,240,.20)*reaction.strength/Math.sqrt(w);dx-=size*.04*b;rot+=.024*b;sy+=.012*b}}
  if(o.flip)dx=-dx;
  return{dx,dy,rot:o.flip?-rot:rot,sx,sy};
}
const accentInkCache=new WeakMap();
function accentInk(img,color){
  let colors=accentInkCache.get(img);if(colors?.has(color))return colors.get(color);
  let ink=img;
  try{const mask=window.document?.createElement('canvas'),out=window.document?.createElement('canvas');if(mask&&out){
    mask.width=out.width=img.naturalWidth;mask.height=out.height=img.naturalHeight;
    const m=mask.getContext('2d'),c=out.getContext('2d');m.drawImage(img,0,0);m.globalCompositeOperation='source-in';m.fillStyle=color;m.fillRect(0,0,mask.width,mask.height);
    for(const [x,y]of [[-1.5,0],[1.5,0],[0,-1.5],[0,1.5]])c.drawImage(mask,x,y);ink=out;
  }}catch{}
  if(!colors){colors=new Map();accentInkCache.set(img,colors)}colors.set(color,ink);return ink;
}
function drawLevelAccent(c,img,w,h,ax,ay,size,o,type){
  if(!evolution.accent(o.level))return;
  const level=evolution.normalize(o.level),reduced=reduceMotionQuery?.matches,
    tier=o.effectTier||'full',dense=(o.density||0)>=24;
  const roleColor={knight:'#f0c778',dragon:'#ff9a45',barbarian:'#ed8b69',goblin:'#b2c66d',beetank:'#65c9b5',turtle:'#a2cd7c',mole:'#d8ad66',sniper:'#aadbe6',assassin:'#bb9cdc',goose:'#f5d276'}[type]||'#edcf80';
  // A role-colored ink bitmap is prepared once per pose. No per-fighter shadow blur.
  if(!authored[type]?.cleanSprite&&!dense&&tier!=='minimal'){
    c.save();c.globalAlpha*=level===5?.64:.44;c.drawImage(accentInk(img,roleColor),-w*ax,-h*ay,w,h);c.restore();
  }
  // Readable comic power seal: no particle queues, bounded geometry and density fallback.
  if(!o.presentation&&!dense&&tier!=='minimal'){
    const ascend=level===5,pulse=reduced||tier==='reduced'?1:1+.035*Math.sin((Number(o.time)||0)*.005+(o.id||0));
    c.save();c.globalAlpha*=ascend?.82:.62;c.strokeStyle=roleColor;c.lineWidth=Math.max(1.6,size*(ascend?.027:.021));
    c.beginPath();c.ellipse(0,size*.025,size*.48*pulse,size*.13,0,0,Math.PI*2);c.stroke();
    if(ascend){c.strokeStyle='#fff5d7';c.lineWidth=Math.max(1,size*.013);c.beginPath();c.ellipse(0,size*.025,size*.36,size*.09,0,0,Math.PI*2);c.stroke()}
    for(const side of [-1,1]){const x=side*size*.41;c.beginPath();c.moveTo(x-size*.045,size*.025);c.lineTo(x,-size*.025);c.lineTo(x+size*.045,size*.025);c.lineTo(x,size*.075);c.lineTo(x-size*.045,size*.025);c.stroke()}
    c.restore();
  }
  // Static gold foot chevrons survive dense/reduced modes without blur or animation.
  if(!o.presentation){c.save();c.strokeStyle=level===5?'#c7862f':'#e3c575';c.globalAlpha*=.8;c.lineWidth=Math.max(1,size*.018);
    for(let i=0;i<(level===5?2:1);i++){const yy=size*(.035+i*.035);c.beginPath();c.moveTo(-size*.12,yy);c.lineTo(0,yy+size*.025);c.lineTo(size*.12,yy);c.stroke()}c.restore()}
}
function drawAuthored(c,type,x,y,size,team,o){
  const fighter=authored[type];if(!fighter)return false;
  const evolved=selectedArt(type,o.level);
  const requested=o.presentation?'idle':(evolved?.actions?.[o.action]||authoredState(type,o.action)),pose=displayedPose(type,o,requested),state=pose.state;
  let registration=selectedArt(type,o.level);
  let src=registration?(o.presentation?registration.presentationUrl:(registration.urls[state]||registration.urls.idle)):o.presentation&&fighter.presentationUrl?fighter.presentationUrl:(fighter.urls[state]||fighter.urls.idle),rec=load(src);
  for(let attempt=0;registration&&rec.error&&attempt<3;attempt++){
    registration=registration===ultimates[type]?(evolutions[type]||bases[type]||null):registration===evolutions[type]?(bases[type]||null):null;
    src=registration?(o.presentation?registration.presentationUrl:(registration.urls[state]||registration.urls.idle)):o.presentation?fighter.presentationUrl:(fighter.urls[state]||fighter.urls.idle);rec=load(src)
  }
  // A failed optional high-resolution portrait still has a valid authored idle.
  if(o.presentation&&rec.error&&src===fighter.presentationUrl){src=fighter.urls.idle;rec=load(src)}
  if(rec.error||missing.has(src))return false;
  if(!rec.ready){if(o.presentation){const f=presentationFrame(o.presentationBounds||{width:c.canvas.width,height:c.canvas.height});drawTeamRing(c,f.ringX,0,f.ringSize,team,f.ringY)}else drawTeamRing(c,x,y,size,team,y,o.density||0);return 'loading'}
  const img=rec.img;if(!img.naturalWidth||!img.naturalHeight)return false;
  const anchor=registration&&!o.presentation?(registration.poses[state]||registration.poses.idle).anchor:fighter.anchor;
  const ratio=img.naturalWidth/img.naturalHeight,ax=anchor[0],ay=anchor[1],m=o.presentation?{dx:0,dy:0,rot:0,sx:1,sy:1}:motion(type,state,o,size,pose.age,pose.hold);
  let h=o.presentation?size:registration?img.naturalHeight*size*registration.scale/registration.referenceHeight:size*fighter.scale,drawX=x,drawY=y;
  let frame=null;
  if(o.presentation){
    frame=presentationFrame(o.presentationBounds||{width:c.canvas?.width||size,height:c.canvas?.height||size},ratio,fighter.anchor,o.presentationScale??1);
    h=frame.h;drawX=frame.x;drawY=frame.y;
  }
  const w=h*ratio;
  if(frame)drawTeamRing(c,frame.ringX,0,frame.ringSize,team,frame.ringY);else drawTeamRing(c,x,y,size,team,y,o.density||0);
  c.save();c.translate(drawX+m.dx,drawY+m.dy);c.rotate(m.rot);const flip=!o.presentation&&(registration?.facing??fighter.facing)===-1?!o.flip:o.flip;c.scale(flip?-m.sx:m.sx,m.sy);
  if(fighter.inkBoost&&!o.presentation&&registration!==bases[type]){
    c.save();c.filter='brightness(0)';c.globalAlpha=.92;
    const bw=w*fighter.inkBoost,bh=h*fighter.inkBoost;
    c.drawImage(img,-bw*ax,-bh*ay,bw,bh);c.restore()
  }
  drawLevelAccent(c,img,w,h,ax,ay,size,o,type);
  c.drawImage(o.presentation&&!fighter.cleanSprite?presentationInk(img):img,-w*ax,-h*ay,w,h);c.restore();return true
}
function draw(c,type,x,y,size,team='blue',o={}){
  if(authored[type]){
    try{const drawn=drawAuthored(c,type,x,y,size,team,o);if(drawn===true||drawn==='loading')return true}
    catch(err){const key=type+':'+(o.action||'idle');if(!reported.has(key)){reported.add(key);console.error('[Showdown authored art] draw error',key,err)}}
    return drawProcedural(c,type,x,y,size,team,o)
  }
  if(window.FighterArt)return drawProcedural(c,type,x,y,size,team,o);
  const fighter=manifest[type],state=stateName(o.action),spec=resolve(type,state);
  if(fighter&&spec){const frame=Math.floor(((o.time||0)/1000)*(spec.fps||8))%spec.frames.length,rec=load(spec.frames[frame]);if(rec.ready){const img=rec.img,scale=size*fighter.scale,ratio=img.naturalWidth/Math.max(1,img.naturalHeight),h=scale,w=h*ratio,ax=fighter.anchor?.[0]??.5,ay=fighter.anchor?.[1]??.82;c.save();c.translate(x,y);if(o.flip)c.scale(-1,1);c.drawImage(img,-w*ax,-h*ay,w,h);c.restore();drawTeamRing(c,x,y,size,team,y,o.density||0);return true}}
  return false
}
function notifyHit(id,time,strength=1){if(id==null)return;hitReactions.set(String(id),{time,strength:Math.max(.3,Math.min(1,strength))});if(hitReactions.size>192)hitReactions.delete(hitReactions.keys().next().value)}
function resetPoseMemory(){poseMemory.clear();hitReactions.clear()}
function diagnostics(){const byFighter={};for(const [type,f] of Object.entries(authored)){const states={};for(const [state,url] of Object.entries(f.urls)){const r=cache.get(url);states[state]=r?.error?'error':r?.ready?'ready':'loading'}for(const [form,packs]of [['base',bases],['evolved',evolutions],['ultimate',ultimates]])if(packs[type]){states[form]={};for(const [state,url]of Object.entries(packs[type].urls)){const r=cache.get(url);states[form][state]=r?.error?'error':r?.ready?'ready':'loading'}}byFighter[type]=states}const urls=allAuthoredUrls(),errors=urls.filter(u=>cache.get(u)?.error),ready=urls.filter(u=>cache.get(u)?.ready);return{mode:'authored',total:urls.length,ready:ready.length,errors:errors.length,loading:urls.filter(u=>!cache.get(u)?.ready&&!cache.get(u)?.error),missing:[...missing],byFighter}}
preloadHome();
window.FighterAssets={manifest,authored,visualForm,visualEnvelope,cueOffset,draw,preload,preloadHome,preloadRoster,preloadSpecies,preloadBattle,assetStatus,missing,authoredState,diagnostics,ACTION_STATES,resetPoseMemory,presentationFrame,notifyHit}
})();
