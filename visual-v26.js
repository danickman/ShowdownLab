/* v2.6 Turn 5 — Graphics Pass A: battlefield atmosphere & readable combat VFX */
(function(){
 const C=document.querySelector('#c'),app=document.querySelector('#app');if(!C||!app)return;
 const fx=document.createElement('div');fx.id='battleFX';fx.innerHTML='<div class="arenaGlow blue"></div><div class="arenaGlow red"></div><div class="midline"></div><div class="vignette"></div>';C.parentNode.insertBefore(fx,C.nextSibling);
 let prev=new Map(),bursts=[],last=0;
 function burst(x,y,team,kind='hit'){const b=document.createElement('i');b.className='combatBurst '+kind+' '+(team?'red':'blue');b.style.left=x+'px';b.style.top=y+'px';fx.appendChild(b);setTimeout(()=>b.remove(),420)}
 function frame(t){requestAnimationFrame(frame);if(t-last<50)return;last=t;let us=[];try{us=units||[]}catch(e){return}const r=C.getBoundingClientRect(),sx=r.width/900,sy=r.height/600;fx.style.cssText=`left:${C.offsetLeft}px;top:${C.offsetTop}px;width:${r.width}px;height:${r.height}px`;
 const now=new Map();for(const u of us){if(u.hp<=0)continue;now.set(u.id,u.hp);const old=prev.get(u.id);if(old!=null&&u.hp<old&&Math.random()<.38)burst(u.x*sx,u.y*sy,u.team,'hit')}
 for(const[id,hp]of prev)if(!now.has(id)){let u=null;try{u=(units||[]).find(x=>x.id===id)}catch(e){}if(u)burst(u.x*sx,u.y*sy,u.team,'ko')}
 prev=now;let battle=false;try{battle=phase==='battle'}catch(e){}fx.classList.toggle('hidden',!battle)}requestAnimationFrame(frame);
})();