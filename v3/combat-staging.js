// Bounded presentation offsets only; never write to simulation units.
(()=>{'use strict';
  const kind=t=>t==='dragon'?'large':['beetank','turtle'].includes(t)?'heavy':['goose','goblin'].includes(t)?'small':'normal';
  function limits(count,arena){
    // Full allied collision staging is limited to 60 fighters for CPU safety.
    // Above that, retain bounded grid-based visual fanning without pair resolution.
    if(count<=1)return{x:0,y:0};
    if(count<=60)return{x:Math.min(56,arena.w*.16),y:Math.min(36,arena.h*.11)};
    return{x:Math.min(34,arena.w*.10),y:Math.min(23,arena.h*.07)};
  }
  function create(){
    const offsets=new Map();let previousTime=null;
    function reset(){offsets.clear();previousTime=null}
    function offset(id){const p=offsets.get(id);return {dx:p?.dx||0,dy:p?.dy||0}}
    function point(unit,camera){const p=camera.worldToScreen(unit.x,unit.y),o=offset(unit.id);return{x:p.x+o.dx,y:p.y+o.dy}}
    function prepare(units,camera,time){
      const alive=units.filter(u=>u.hp>0),cap=limits(alive.length,camera.arena),active=cap.x>0,fullResolve=alive.length<=60;
      const dt=previousTime==null?16:Math.max(0,Math.min(50,time-previousTime));previousTime=time;
      const blend=1-Math.exp(-dt/130),grid=new Map(),cellW=100,cellH=80;
      // Unit scale depends on kind, camera and density; authored envelopes on type/level.
      // Reuse lookups for this frame, never across a camera resize or form change.
      const sizeByKind=new Map(),envelopeByForm=new Map();
      const entries=alive.map(u=>{
        const p=camera.worldToScreen(u.x,u.y),k=kind(u.type);
        if(!sizeByKind.has(k))sizeByKind.set(k,camera.unitSize(k,alive.length));
        const size=sizeByKind.get(k),spec=window.FighterAssets?.authored?.[u.type];
        const height=size*(spec?.scale||1.3)*(spec?.inkBoost||1),anchor=spec?.anchor?.[1]||.948;
        const key=u.type+':'+(u.level||1);
        if(!envelopeByForm.has(key))envelopeByForm.set(key,window.FighterAssets?.visualEnvelope?.(u.type,u.level)||{left:height/size*.5,right:height/size*.5,above:height/size*anchor,below:height/size*(1-anchor)});
        const envelope=envelopeByForm.get(key);
        return {u,p,size,height,anchor,envelope};
      });
      // Sorting IDs keeps rank independent of the simulator's array order.
      if(active){entries.sort((a,b)=>a.u.id-b.u.id);for(const e of entries){const key=Math.floor(e.p.x/cellW)+':'+Math.floor(e.p.y/cellH);if(!grid.has(key))grid.set(key,[]);grid.get(key).push(e)}}
      for(const e of entries){
        let dx=0,dy=0;
        if(active){let lower=0,higher=0,enemies=0,enemyX=0;const gx=Math.floor(e.p.x/cellW),gy=Math.floor(e.p.y/cellH);
          for(let y=gy-1;y<=gy+1;y++)for(let x=gx-1;x<=gx+1;x++){
            const neighbours=grid.get(x+':'+y)||[];
            for(const other of neighbours){if(other===e)continue;const reach=(e.size+other.size)*.36;
              if(Math.abs(e.p.x-other.p.x)>reach||Math.abs(e.p.y-other.p.y)>reach*.80)continue;
              if(other.u.team!==e.u.team){enemies++;enemyX+=other.p.x;}else if(other.u.id<e.u.id)lower++;else higher++;
            }
          }
          if(lower+higher+enemies){
            // Fan crowded same-team ranks across a wider local envelope;
            // stagger feet so rear silhouettes are not on one vertical spine.
            const peers=lower+higher,rank=peers?lower/peers:.5;
            if(enemies){const gap=e.p.x-enemyX/enemies,lastSide=offsets.get(e.u.id)?.contactSide;const direction=Math.abs(gap)<4?(lastSide||(e.u.team==='blue'?-1:1)):Math.sign(gap);e.contactSide=direction;dx=direction*cap.x*(.16+.84*(direction<0?1-rank:rank));}
            else dx=(rank-.5)*cap.x*1.7;
            dy=peers?((e.u.id%3)-1)*cap.y*.78:0;
          }
        }
        e.dx=dx;e.dy=dy;
      }
      if(active&&fullResolve){
        // Resolve allied torso overlap inside the existing staging budget.
        // Four bounded passes; opponents retain their original contact relationship.
        const clampGoal=e=>{const lo=e.contactSide===1?cap.x*.16:-cap.x,hi=e.contactSide===-1?-cap.x*.16:cap.x;e.dx=Math.max(lo,Math.min(hi,e.dx));e.dy=Math.max(-cap.y,Math.min(cap.y,e.dy))};
        // Candidate eligibility depends only on original screen points and static size.
        // Build it once; keep original i/j iteration order across all four passes.
        const pairs=[];
        for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
          const a=entries[i],b=entries[j];if(a.u.team!==b.u.team)continue;
          const reach=(a.size+b.size)*.70;
          if(Math.abs(a.p.x-b.p.x)>reach+cap.x*2||Math.abs(a.p.y-b.p.y)>reach+cap.y*2)continue;
          pairs.push([i,j]);
        }
        for(let pass=0;pass<4;pass++)for(const [i,j] of pairs){
          const a=entries[i],b=entries[j];
          const x=b.p.x+b.dx-a.p.x-a.dx,y=(b.p.y+b.dy-b.height*.45)-(a.p.y+a.dy-a.height*.45);
          const overlapX=(a.size+b.size)*.29-Math.abs(x),overlapY=(a.height+b.height)*.35-Math.abs(y);
          if(overlapX<=0||overlapY<=0)continue;
          const sx=x===0?(b.u.id>a.u.id?1:-1):Math.sign(x),sy=y===0?(b.u.id>a.u.id?1:-1):Math.sign(y);
          const freeX=(cap.x-sx*b.dx)+(cap.x+sx*a.dx),freeY=(cap.y-sy*b.dy)+(cap.y+sy*a.dy);
          if(overlapX<overlapY&&freeX>overlapX||freeY<overlapY&&freeX>0){const push=Math.min(overlapX*.52,freeX*.5);a.dx-=sx*push;b.dx+=sx*push}
          else{const push=Math.min(overlapY*.52,freeY*.5);a.dy-=sy*push;b.dy+=sy*push}
          clampGoal(a);clampGoal(b);
        }
      }
      const max=alive.length<2?limits(2,camera.arena):cap;
      for(const e of entries){
        const dx=e.dx,dy=e.dy;
        const old=offsets.get(e.u.id)||{dx:0,dy:0},step=dt*.18;
        const approach=(from,to)=>from+Math.max(-step,Math.min(step,(to-from)*blend));
        let nextX=approach(old.dx,dx),nextY=approach(old.dy,dy);
        // Clamp the complete authored box, rather than only the foot point.
        const a=camera.arena,left=a.x+e.size*e.envelope.left,right=a.x+a.w-e.size*e.envelope.right,top=a.y+e.size*e.envelope.above,bottom=a.y+a.h-e.size*e.envelope.below;
        const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
        nextX=clamp(e.p.x+nextX,left,right)-e.p.x;nextY=clamp(e.p.y+nextY,top,bottom)-e.p.y;
        // Returning to dense/isolated state is smooth, without leaving an
        // unbounded residual. Dense offsets settle to zero after ~1 second.
        if(!active&&Math.abs(nextX)<.01)nextX=0;if(!active&&Math.abs(nextY)<.01)nextY=0;
        offsets.set(e.u.id,{dx:clamp(nextX,-max.x,max.x),dy:clamp(nextY,-max.y,max.y),contactSide:e.contactSide,seen:time});
      }
      // Preserve a fallen fighter's last offset through its 900ms defeat fade.
      for(const [id,o]of offsets)if(time-o.seen>1000)offsets.delete(id);
      while(offsets.size>240)offsets.delete(offsets.keys().next().value);
    }
    return{prepare,point,offset,reset};
  }
  window.CombatStaging={create,limits};
})();
