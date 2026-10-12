// One current decoded ground illustration; composited only on floor-cache rebuild.
(()=>{'use strict';
 const urls={academy:'/v3/assets/arenas/sunlit-lab/floor.webp?v=1',garden:'/v3/assets/arenas/verdant-ruins/floor.webp?v=1'};
 let current=null,revision=0;
 function select(dressing){
  if(!urls[dressing])return null;
  if(current?.dressing===dressing)return current;
  const rec={dressing,image:new Image(),ready:false};current=rec;
  rec.image.onload=()=>{if(current!==rec)return;rec.ready=rec.image.naturalWidth>0&&rec.image.naturalHeight>0;revision++};
  rec.image.onerror=()=>{if(current!==rec)return;rec.ready=false;revision++};
  rec.image.src=urls[dressing];return rec;
 }
 function draw(ctx,w,h,dressing){
  if(w<=0||h<=0)return false;
  const rec=select(dressing);if(!rec?.ready)return false;
  const image=rec.image;
  // Preserve stone proportions; landscape shows a centred middle floor band.
  const scale=Math.max(w/image.naturalWidth,h/image.naturalHeight),dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;
  ctx.save();ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();ctx.drawImage(image,(w-dw)*.5,(h-dh)*.5,dw,dh);ctx.restore();return true;
 }
 select('academy');
 window.ArenaFloorArt={draw,get revision(){return revision}};
})();
