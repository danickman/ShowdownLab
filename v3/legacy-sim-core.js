(()=>{'use strict';
const DEF={
knight:{hp:175,dmg:18,range:.062,cd:30,spd:.00105,r:.024,armor:.28},
goose:{hp:72,dmg:9,range:.052,cd:16,spd:.00165,r:.018,dodge:.20},
sniper:{hp:44,dmg:31,range:.38,cd:78,spd:.00072,r:.018,kite:.19},
dragon:{hp:290,dmg:43,range:.255,cd:48,spd:.00072,r:.034,armor:.14},
assassin:{hp:66,dmg:27,range:.058,cd:32,spd:.00155,r:.018,dodge:.12},
beetank:{hp:255,dmg:18,range:.068,cd:42,spd:.00070,r:.032,armor:.34},
mole:{hp:92,dmg:25,range:.058,cd:34,spd:.00115,r:.021,armor:.08},
turtle:{hp:225,dmg:18,range:.064,cd:38,spd:.00062,r:.030,armor:.18},
goblin:{hp:49,dmg:10,range:.050,cd:18,spd:.00172,r:.016,dodge:.10},
barbarian:{hp:165,dmg:29,range:.068,cd:38,spd:.00108,r:.024}
};
const BACK=new Set(['sniper','dragon']);let seed=1337,nextId=1,tick=0,units=[],running=false,speed=1,last=0,acc=0,raf=0,onState=()=>{},emitAt=0;
const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296},clamp=v=>Math.max(.035,Math.min(.965,v)),scale=(v,l)=>v*(1+(l-1)*.10);
function add(e,team,x,y){const d=DEF[e.type]||DEF.knight,l=e.level||1;units.push({...d,id:nextId++,type:e.type||'knight',team,level:l,squad:e.squad||0,hp:scale(d.hp,l),maxHp:scale(d.hp,l),dmg:scale(d.dmg,l),x,y,cooldown:Math.floor(rnd()*d.cd),action:'idle',target:null,stun:0,special:0})}
function deploySide(input,team){const a=input.map((v,i)=>typeof v==='string'?{type:v,level:1,squad:i}:v),front=a.filter(e=>!BACK.has(e.type)),back=a.filter(e=>BACK.has(e.type)),dir=team==='blue'?1:-1;function row(g,x0){const cols=Math.min(10,Math.max(3,Math.ceil(Math.sqrt(g.length)*1.7)));g.forEach((e,i)=>{const row=Math.floor(i/cols),col=i%cols,n=Math.min(cols,g.length-row*cols);add(e,team,x0-dir*row*.038,.5+(col-(n-1)/2)*Math.min(.066,.54/Math.max(4,cols-1))+(rnd()-.5)*.006)})}row(front,team==='blue'?.23:.77);row(back,team==='blue'?.13:.87)}
function deploy(blue=['knight','sniper'],red=['goose','dragon']){running=false;units=[];nextId=1;tick=0;acc=0;deploySide(blue,'blue');deploySide(red,'red');separate(6);emit(true)}
function alive(team){return units.filter(u=>u.hp>0&&(!team||u.team===team))}
function targetFor(u){const foes=alive(u.team==='blue'?'red':'blue');if(!foes.length)return null;let best=foes[0],score=Infinity;for(const v of foes){let d=Math.hypot(v.x-u.x,v.y-u.y);if(u.type==='assassin'&&BACK.has(v.type))d-=.08;if(d<score){score=d;best=v}}return best}
function hurt(t,dmg,a=null){if(!t||t.hp<=0)return;if(t.armor)dmg*=1-t.armor;if(t.dodge&&rnd()<t.dodge)dmg*=.3;t.hp=Math.max(0,t.hp-dmg);t.action=t.hp?'hit':'dead';if(a&&t.hp){const dx=t.x-a.x,dy=t.y-a.y,l=Math.hypot(dx,dy)||1;t.x=clamp(t.x+dx/l*.006);t.y=clamp(t.y+dy/l*.004)}}
function move(u,t,m=1,away=false){let dx=t.x-u.x,dy=t.y-u.y,l=Math.hypot(dx,dy)||1;if(away){dx=-dx;dy=-dy}u.x=clamp(u.x+dx/l*u.spd*m);u.y=clamp(u.y+dy/l*u.spd*m)}
function attack(u,t,m=1){hurt(t,u.dmg*m,u);u.cooldown=u.cd}
function act(u,t){const d=Math.hypot(t.x-u.x,t.y-u.y),r=u.range;if(u.stun>0){u.stun--;u.action='stun';return}if(u.cooldown>0)u.cooldown--;
if(u.type==='sniper'){if(d<u.kite){u.action='retreat';move(u,t,1.15,true);return}if(d<=r){u.action='aim';if(u.cooldown<=0){u.action='attack';attack(u,t)}return}u.action='move';move(u,t);return}
if(u.type==='dragon'){if(d<=r){u.action='fire';if(u.cooldown<=0){attack(u,t);for(const v of alive(t.team))if(v.id!==t.id&&Math.hypot(v.x-t.x,v.y-t.y)<.10)hurt(v,u.dmg*.38,u)}return}u.action='stalk';move(u,t,.8);return}
if(u.type==='goose'&&tick%95===u.id%95){u.action='honk';for(const v of alive(t.team))if(Math.hypot(v.x-u.x,v.y-u.y)<.13)v.stun=Math.max(v.stun,7);u.y=clamp(u.y+(rnd()-.5)*.07);return}
if(u.type==='mole'&&tick%125===u.id%125&&d>.14){u.action='burrow';u.x=clamp(t.x+(u.team==='blue'?-.07:.07));u.y=clamp(t.y+(rnd()-.5)*.05);return}
if(u.type==='beetank'&&d>.09&&d<.28&&tick%110===u.id%110){u.action='ram';move(u,t,2.4);return}
if(u.type==='turtle'&&u.hp/u.maxHp<.5&&tick%90<18){u.action='shell';return}
const mult=u.type==='barbarian'&&u.hp/u.maxHp<.5?1.45:u.type==='assassin'?1.22:1;
if(d<=r){u.action=u.type==='goblin'?'stab':u.type==='barbarian'?'axe_swing':u.type==='assassin'?'backstab':'attack';if(u.cooldown<=0)attack(u,t,mult)}
else{u.action=u.type==='goblin'?'rush':'move';move(u,t,u.type==='goblin'?1.18:1)}
}
function separate(passes=1){const a=alive();for(let p=0;p<passes;p++)for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){const x=a[i],y=a[j],dx=y.x-x.x,dy=y.y-x.y,d=Math.hypot(dx,dy)||.0001,min=(x.r+y.r)*(x.team===y.team?1.02:.82);if(d>=min)continue;const nx=dx/d,ny=dy/d,push=(min-d)*.32;x.x=clamp(x.x-nx*push);x.y=clamp(x.y-ny*push);y.x=clamp(y.x+nx*push);y.y=clamp(y.y+ny*push)}}
function step(){tick++;for(const u of alive()){const t=targetFor(u);u.target=t?.id??null;if(t)act(u,t);else u.action='idle'}separate(alive().length>35?1:2)}
function winner(){const b=alive('blue').length,r=alive('red').length;return b&&!r?'blue':r&&!b?'red':null}
function emit(force=false){const now=performance.now();if(!force&&now-emitAt<45)return;emitAt=now;onState({tick,units:units.map(u=>({...u})),winner:winner(),running,speed})}
function frame(now){const dt=Math.min(80,now-last);last=now;if(running){acc+=dt*speed;while(acc>=16.666){step();acc-=16.666;if(winner()){running=false;break}}emit()}raf=requestAnimationFrame(frame)}
function loop(){if(!raf){last=performance.now();raf=requestAnimationFrame(frame)}}
function configure(o={}){if(Number.isFinite(o.seed))seed=o.seed>>>0;if(typeof o.onState==='function')onState=o.onState;if([1,2,4].includes(+o.speed))speed=+o.speed;loop()}
function setRunning(v){running=!!v;last=performance.now();emit(true);loop()}
function pause(){running=!running;last=performance.now();emit(true);return running}
function setSpeed(v){speed=[1,2,4].includes(+v)?+v:1;emit(true)}
function castSpell(spell,team='blue'){team=team==='red'?'red':'blue';const friends=alive(team),enemies=alive(team==='blue'?'red':'blue');if(spell==='zap'&&enemies.length){const t=enemies.reduce((a,b)=>a.hp<b.hp?a:b);hurt(t,32);t.stun=20;emit(true);return{ok:true,target:t.id,targetTeam:t.team,amount:32}}if(spell==='heal'&&friends.length){const wounded=friends.filter(u=>u.hp<u.maxHp);if(!wounded.length)return{ok:false};const t=wounded.reduce((a,b)=>a.hp/a.maxHp<b.hp/b.maxHp?a:b),amount=Math.min(46,t.maxHp-t.hp);t.hp+=amount;t.action='heal';emit(true);return{ok:true,target:t.id,targetTeam:t.team,amount}}return{ok:false}}
window.LegacySimCore={configure,deploy,setRunning,pause,setSpeed,castSpell,getState:()=>({tick,units:units.map(u=>({...u})),winner:winner(),running,speed})};loop()})();