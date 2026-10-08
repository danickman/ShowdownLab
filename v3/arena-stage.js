// Static floor only. Fighters, damage, debris and pennants are always live layers.
(()=>{'use strict';
  let cached=null;
  function paint(ctx,w,h,theme){
    const gradient=ctx.createLinearGradient(0,0,0,h);theme.floor.forEach((col,i)=>gradient.addColorStop([0,.65,1][i],col));ctx.fillStyle=gradient;ctx.fillRect(0,0,w,h);
    const rail=Math.max(8,w*.024),project=(t,q)=>w*.5+(t-.5)*(w-rail*2)*(.52+q*.48);
    // Broad staggered flagstones: increasing row depth gives a grounded perspective.
    const rows=[0,.065,.16,.30,.49,.73,1];
    for(let row=0;row<rows.length-1;row++){
      const near=rows[row+1],far=rows[row],offset=row%2?.125:0;
      for(let tile=-1;tile<5;tile++){
        const left=tile*.25+offset,right=left+.25;
        ctx.save();ctx.beginPath();ctx.rect(rail,0,w-rail*2,h);ctx.clip();
        ctx.beginPath();ctx.moveTo(project(left,far),far*h);ctx.lineTo(project(right,far),far*h);ctx.lineTo(project(right,near),near*h);ctx.lineTo(project(left,near),near*h);ctx.closePath();
        ctx.globalAlpha=(row+tile)%3===0?.055:.025;ctx.fillStyle=(row+tile)%2?'#fff9df':'#8e805d';ctx.fill();
        ctx.globalAlpha=.18;ctx.lineWidth=1;ctx.strokeStyle=theme.joint;ctx.stroke();
        ctx.globalAlpha=.28;ctx.strokeStyle='#fff8de';ctx.beginPath();ctx.moveTo(project(left,near),near*h-1);ctx.lineTo(project(right,near),near*h-1);ctx.stroke();ctx.restore();
      }
    }
    // Dressed perimeter stones connect the floor to the distant courtyard wall.
    ctx.fillStyle=theme.stone;ctx.fillRect(0,0,rail,h);ctx.fillRect(w-rail,0,rail,h);
    ctx.fillStyle='#fff8de';ctx.globalAlpha=.65;ctx.fillRect(rail,0,2,h);ctx.fillRect(w-rail-2,0,2,h);
    ctx.globalAlpha=.18;ctx.fillStyle='#796c4c';ctx.fillRect(rail+2,0,5,h);ctx.fillRect(w-rail-7,0,5,h);
    const wallShadow=ctx.createLinearGradient(0,0,0,Math.min(38,h*.08));wallShadow.addColorStop(0,'#746d4c38');wallShadow.addColorStop(1,'#746d4c00');ctx.globalAlpha=1;ctx.fillStyle=wallShadow;ctx.fillRect(rail,0,w-rail*2,Math.min(38,h*.08));
    // Team side accents are quiet edge treatments, leaving the centre readable.
    for(const [side,col]of [[0,'#3b9dc5'],[1,'#d85d50']]){const wash=ctx.createLinearGradient(side?w:0,0,side?w-w*.12:w*.12,0);wash.addColorStop(0,col+'18');wash.addColorStop(1,col+'00');ctx.fillStyle=wash;ctx.fillRect(side?w*.88:0,0,w*.12,h)}
    const foreground=ctx.createLinearGradient(0,h*.86,0,h);foreground.addColorStop(0,'#71694e00');foreground.addColorStop(1,'#71694e18');ctx.fillStyle=foreground;ctx.fillRect(0,h*.86,w,h*.14);
  }
  function drawFloor(ctx,w,h,horizon,theme){
    const height=h-horizon-4;if(w<=0||height<=0)return false;
    const dpr=Math.min(window.devicePixelRatio||1,2,Math.sqrt(1200000/(w*height)));
    const key=JSON.stringify([w,height,dpr,theme.floor,theme.stone,theme.joint]);
    if(cached?.key!==key){
      let canvas;
      try{canvas=typeof OffscreenCanvas==='function'?new OffscreenCanvas(1,1):window.document?.createElement('canvas');if(!canvas)return false;
        canvas.width=Math.ceil(w*dpr);canvas.height=Math.ceil(height*dpr);const c=canvas.getContext('2d');if(!c)return false;c.setTransform(canvas.width/w,0,0,canvas.height/height,0,0);paint(c,w,height,theme);
      }catch{return false}
      // A single current-floor cache, capped near 4.8 MiB; never retain one per round.
      cached={key,canvas};
    }
    ctx.save();ctx.globalAlpha=1;ctx.drawImage(cached.canvas,0,horizon+4,w,height);ctx.restore();return true;
  }
  window.ArenaStage={drawFloor};
})();
