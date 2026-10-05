(()=>{
'use strict';
/* M1 headless bridge: deterministic mechanics extracted from the v2 core contract.
   No v2 DOM, CSS, overlays, HUD or renderer are imported here. */
const DEF={
 knight:{hp:110,dmg:16,range:20,cd:28,spd:.82,r:9},goose:{hp:55,dmg:8,range:17,cd:22,spd:1.15,r:7},
 sniper:{hp:48,dmg:30,range:150,cd:55,spd:.55,r:7,projectile:5},dragon:{hp:245,dmg:34,range:82,cd:45,spd:.62,r:15,projectile:4.2,splash:38}
};
let seed=1337,nextId=1,tick=0,units=[],running=false,acc=0,last=0,onState=()=>{};
const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const scale=(v,l)=>v*(1+(l-1)*.10);
function add(type,team,x,y,l=1){const d=DEF[type]||DEF.knight;units.push({...d,id:nextId++,type,team,level:l,hp:scale(d.hp,l),maxHp:scale(d.hp,l),dmg:scale(d.dmg,l),x,y,cooldown:Math.floor(rnd()*d.cd),action:'idle',target:null})}
function deploy(blue=['knight','sniper'],red=['goose','dragon']){units=[];nextId=1;tick=0;const place=(arr,team)=>arr.forEach((type,i)=>{const n=arr.length,x=team?.76:.24,y=.35+(i+1)*(.3/(n+1));add(type,team?'red':'blue',x,y,1)});place(blue,false);place(red,true);emit()}
function nearest(u){let best=null,bd=Infinity;for(const v of units){if(v.team===u.team||v.hp<=0)continue;const d=Math.hypot(v.x-u.x,v.y-u.y);if(d<bd){bd=d;best=v}}return [best,bd]}
function hit(a,t){if(!t||t.hp<=0)return;t.hp=Math.max(0,t.hp-a.dmg);t.action=t.hp?'hit':'dead';if(!t.hp)a.action='kill'}
function step(){tick++;for(const u of units){if(u.hp<=0)continue;if(u.cooldown>0)u.cooldown--;const [t,d]=nearest(u);if(!t){u.action='idle';continue}u.target=t.id;if(d<=u.range/500){if(u.cooldown<=0){u.action='attack';hit(u,t);u.cooldown=u.cd}}else{u.action='move';const dx=t.x-u.x,dy=t.y-u.y,len=Math.hypot(dx,dy)||1,move=u.spd/1200;u.x+=dx/len*move;u.y+=dy/len*move}}emit()}
function emit(){onState({tick,units:units.map(u=>({...u})),winner:winner()})}
function winner(){const b=units.some(u=>u.team==='blue'&&u.hp>0),r=units.some(u=>u.team==='red'&&u.hp>0);return b&&!r?'blue':r&&!b?'red':null}
function frame(now){if(!last)last=now;const dt=Math.min(80,now-last);last=now;if(running){acc+=dt;while(acc>=1000/60){step();acc-=1000/60}if(winner())running=false}requestAnimationFrame(frame)}
window.LegacySimCore={configure(opts={}){seed=(opts.seed??1337)>>>0;onState=opts.onState||onState},deploy,start(){running=true},pause(){running=!running;return running},setRunning(v){running=!!v},get running(){return running},getState(){return{tick,units:units.map(u=>({...u})),winner:winner()}}};
requestAnimationFrame(frame);
})();