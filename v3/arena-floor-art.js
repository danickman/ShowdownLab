// One decoded ground illustration. Painted only when the bounded floor cache rebuilds.
(()=>{'use strict';
 const image=new Image();let ready=false,revision=0;
 image.onload=()=>{ready=image.naturalWidth>0&&image.naturalHeight>0;revision++};
 image.onerror=()=>{ready=false;revision++};
 image.src='/v3/assets/arenas/sunlit-lab/floor.webp?v=1';
 function draw(ctx,w,h,dressing){
  if(!ready||dressing!=='academy'||w<=0||h<=0)return false;
  // Preserve stone and medallion proportions; landscape shows a middle floor band.
  const scale=Math.max(w/image.naturalWidth,h/image.naturalHeight),dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;
  ctx.save();ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();ctx.drawImage(image,(w-dw)*.5,(h-dh)*.5,dw,dh);ctx.restore();return true;
 }
 window.ArenaFloorArt={draw,get revision(){return revision}};
})();
