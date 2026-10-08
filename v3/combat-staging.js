// Bounded presentation offsets only; never write to simulation units.
(()=>{'use strict';
  const kind=t=>t==='dragon'?'large':['beetank','turtle'].includes(t)?'heavy':['goose','goblin'].includes(t)?'small':'normal';
  function create(){
    const offsets=new Map();let previousTime=null;
    function reset(){offsets.clear();previousTime=null}
    function offset(id){const p=offsets.get(id);return {dx:p?.dx||0,dy:p?.dy||0}}
    function point(unit,camera){const p=camera.worldToScreen(unit.x,unit.y),o=offset(unit.id);return{x:p.x+o.dx,y:p.y+o.dy}}
    function prepare(units,camera,time){
      const alive=units.filter(u=>u.hp>0),active=alive.length>1&&alive.length<=44;
      const dt=previousTime==null?16:Math.max(0,Math.min(50,time-previousTime));previousTime=time;
      const blend=1-Math.exp(-dt/90),grid=new Map(),cellW=64,cellH=32;
      const entries=alive.map(u=>{const p=camera.worldToScreen(u.x,u.y),size=camera.unitSize(kind(u.type),alive.length),spec=window.FighterAssets?.authored?.[u.type],height=size*(spec?.scale||1.3)*(spec?.inkBoost||1),anchor=spec?.anchor?.[1]||.948;return {u,p,size,height,anchor}});
      // Sorting IDs keeps rank independent of the simulator's array order.
      if(active){entries.sort((a,b)=>a.u.id-b.u.id);for(const e of entries){const key=Math.floor(e.p.x/cellW)+':'+Math.floor(e.p.y/cellH);if(!grid.has(key))grid.set(key,[]);grid.get(key).push(e)}}
      for(const e of entries){
        let dx=0,dy=0;
        if(active){let lower=0,higher=0,enemies=0;const gx=Math.floor(e.p.x/cellW),gy=Math.floor(e.p.y/cellH);
          for(let y=gy-1;y<=gy+1;y++)for(let x=gx-1;x<=gx+1;x++){
            const neighbours=grid.get(x+':'+y)||[];
            for(const other of neighbours){if(other===e)continue;const reach=(e.size+other.size)*.23;
              if(Math.abs(e.p.x-other.p.x)>reach||Math.abs(e.p.y-other.p.y)>reach*.48)continue;
              if(other.u.team!==e.u.team)enemies++;else if(other.u.id<e.u.id)lower++;else higher++;
            }
          }
          if(lower+higher+enemies){dx=Math.max(-14,Math.min(14,(lower-higher)*5+(enemies?(e.u.team==='blue'?-3:3):0)));dy=(lower+higher)?((e.u.id%3)-1)*3:0}
        }
        const old=offsets.get(e.u.id)||{dx:0,dy:0};let nextX=old.dx+(dx-old.dx)*blend,nextY=old.dy+(dy-old.dy)*blend;
        // Clamp the complete authored box, rather than only the foot point.
        const a=camera.arena,left=a.x+e.height*.5,right=a.x+a.w-e.height*.5,top=a.y+e.height*e.anchor,bottom=a.y+a.h-e.height*(1-e.anchor);
        const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
        nextX=clamp(e.p.x+nextX,left,right)-e.p.x;nextY=clamp(e.p.y+nextY,top,bottom)-e.p.y;
        offsets.set(e.u.id,{dx:clamp(nextX,-14,14),dy:clamp(nextY,-6,6),seen:time});
      }
      // Preserve a fallen fighter's last offset through its 900ms defeat fade.
      for(const [id,o]of offsets)if(time-o.seen>1000)offsets.delete(id);
      while(offsets.size>240)offsets.delete(offsets.keys().next().value);
    }
    return{prepare,point,offset,reset};
  }
  window.CombatStaging={create};
})();
