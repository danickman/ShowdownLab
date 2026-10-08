// Static floor only. Fighters, damage, debris and pennants are always live layers.
(()=>{'use strict';
  let cached=null;
  function dressing(ctx,w,theme){
    if(!theme.dressing)return;
    const size=Math.min(27,w*.065);
    for(const x of [w*.14,w*.86]){
      ctx.save();ctx.translate(x,size*.84);ctx.lineJoin='round';ctx.lineWidth=1;
      ctx.globalAlpha=.16;ctx.fillStyle='#6e6145';ctx.beginPath();ctx.ellipse(3,size*.32,size*.82,size*.24,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
      ctx.fillStyle=theme.stone;ctx.strokeStyle=theme.joint;ctx.fillRect(-size*.52,-size*.22,size*1.04,size*.56);ctx.strokeRect(-size*.52,-size*.22,size*1.04,size*.56);
      ctx.fillStyle='#f7e6bf';ctx.fillRect(-size*.60,-size*.27,size*1.20,size*.13);
      if(theme.dressing==='garden'){
        ctx.fillStyle='#62553a';ctx.fillRect(-size*.45,-size*.25,size*.9,size*.1);
        for(let i=0;i<7;i++){const a=i*.9,px=Math.cos(a)*size*.44,py=-size*.42+Math.sin(a)*size*.15;ctx.fillStyle=i%2?'#60864c':'#8ba35f';ctx.beginPath();ctx.ellipse(px,py,size*.22,size*.10,a,0,Math.PI*2);ctx.fill()}
      }else if(theme.dressing==='frontier'||theme.dressing==='siege'){
        ctx.fillStyle=theme.dressing==='siege'?'#8e7960':'#b8865d';ctx.beginPath();ctx.arc(0,-size*.22,size*.44,Math.PI,Math.PI*2);ctx.lineTo(size*.44,size*.1);ctx.lineTo(-size*.44,size*.1);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.fillStyle='#624b36';ctx.fillRect(-size*.23,-size*.30,size*.46,size*.36);ctx.strokeStyle='#c49d68';for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*size*.12,-size*.30);ctx.lineTo(i*size*.12,size*.06);ctx.stroke()}
      }else{
        ctx.strokeStyle='#b28c43';ctx.lineWidth=1.7;const r=theme.dressing==='observatory'?size*.39:size*.28;
        ctx.beginPath();ctx.arc(0,-size*.52,r,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(-r,-size*.52);ctx.lineTo(r,-size*.52);ctx.moveTo(0,-size*.52-r);ctx.lineTo(0,-size*.52+r);ctx.stroke();
        if(theme.dressing==='observatory'){ctx.beginPath();ctx.ellipse(0,-size*.52,r*.45,r,-.35,0,Math.PI*2);ctx.stroke()}
      }
      ctx.restore();
    }
  }
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
    // Material detail is painted once into the bounded cache, never per fighter.
    // Quiet weathering across the floor; heavier earth/scars in war arenas.
    const war=['frontier','siege'].includes(theme.dressing),siege=theme.dressing==='siege';
    ctx.save();ctx.beginPath();ctx.rect(rail+7,8,w-rail*2-14,h-16);ctx.clip();
    for(let i=0;i<64;i++){
      const q=.08+((i*37)%89)/100,p=((i*53)%97)/100,x=project(p,q),y=q*h;
      const r=(3+i%7)*(.35+q*.9);
      ctx.globalAlpha=war?.11:.06;ctx.fillStyle=war?'#846b48':'#96896a';
      ctx.beginPath();ctx.ellipse(x,y,r*2.6,r*.48,.13*Math.sin(i),0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=.15;ctx.strokeStyle='#fff5d5';ctx.lineWidth=.7;
      ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x+r*.4,y-r*.16);ctx.stroke();
    }
    if(war){
      // Broad earth deposits and wheel wear turn paving into a used battleground.
      for(let i=0;i<(siege?10:6);i++){
        const q=.14+i*.075,x=project(i%2?.83:.17,q),y=q*h,r=w*(.028+q*.025);
        ctx.globalAlpha=siege?.19:.12;ctx.fillStyle='#886c46';ctx.beginPath();
        ctx.ellipse(x,y,r*1.9,r*.65,(i%3-1)*.25,0,Math.PI*2);ctx.fill();
        ctx.globalAlpha=.36;ctx.strokeStyle='#776247';ctx.lineWidth=1.3;
        ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x-r*.2,y+r*.12);ctx.lineTo(x+r*.2,y-r*.30);ctx.lineTo(x+r,y-r*.10);ctx.stroke();
        ctx.globalAlpha=.30;ctx.fillStyle=theme.stone;
        for(let j=0;j<3;j++){const px=x-r+j*r*.7,py=y+r*.27;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px+4+q*3,py-3);ctx.lineTo(px+7,py+2);ctx.closePath();ctx.fill()}
      }
    }else if(theme.dressing==='garden'){
      ctx.globalAlpha=.22;ctx.fillStyle='#6d8750';
      for(let i=0;i<14;i++){const q=.1+i*.06,x=project(i%2?.95:.05,q),y=q*h;ctx.beginPath();ctx.ellipse(x,y,5+q*8,2+q*2,0,0,Math.PI*2);ctx.fill()}
    }
    ctx.restore();
    // Dressed perimeter stones connect the floor to the distant courtyard wall.
    ctx.fillStyle=theme.stone;ctx.fillRect(0,0,rail,h);ctx.fillRect(w-rail,0,rail,h);
    ctx.fillStyle='#fff8de';ctx.globalAlpha=.65;ctx.fillRect(rail,0,2,h);ctx.fillRect(w-rail-2,0,2,h);
    ctx.globalAlpha=.18;ctx.fillStyle='#796c4c';ctx.fillRect(rail+2,0,5,h);ctx.fillRect(w-rail-7,0,5,h);
    const wallShadow=ctx.createLinearGradient(0,0,0,Math.min(38,h*.08));wallShadow.addColorStop(0,'#746d4c38');wallShadow.addColorStop(1,'#746d4c00');ctx.globalAlpha=1;ctx.fillStyle=wallShadow;ctx.fillRect(rail,0,w-rail*2,Math.min(38,h*.08));
    // Team side accents are quiet edge treatments, leaving the centre readable.
    for(const [side,col]of [[0,'#3b9dc5'],[1,'#d85d50']]){const wash=ctx.createLinearGradient(side?w:0,0,side?w-w*.12:w*.12,0);wash.addColorStop(0,col+'18');wash.addColorStop(1,col+'00');ctx.fillStyle=wash;ctx.fillRect(side?w*.88:0,0,w*.12,h)}
    const foreground=ctx.createLinearGradient(0,h*.86,0,h);foreground.addColorStop(0,'#71694e00');foreground.addColorStop(1,'#71694e18');ctx.fillStyle=foreground;ctx.fillRect(0,h*.86,w,h*.14);
    if(['frontier','siege'].includes(theme.dressing)){
      // Cached edge rubble and old wheel scars leave the central battle floor clear.
      const siege=theme.dressing==='siege';ctx.save();ctx.globalAlpha=siege?.17:.08;ctx.strokeStyle=theme.joint;ctx.lineWidth=1;
      for(let i=0;i<(siege?18:8);i++){const side=i%2,q=.10+(i*.173)% .84,x=side?w-rail-9:rail+9,y=q*h;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(side?-1:1)*(9+i%4*3),y+5);ctx.lineTo(x+(side?-1:1)*(4+i%3*3),y+11);ctx.stroke();ctx.fillStyle=theme.joint;ctx.fillRect(x+(side?-5:2),y+8,3+i%3,2)}
      if(siege){ctx.globalAlpha=.05;ctx.strokeStyle='#795f42';for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(w*.5+side*w*.16,h*.18);ctx.lineTo(w*.5+side*w*.27,h*.92);ctx.stroke()}}
      ctx.restore();
    }
    dressing(ctx,w,theme);
  }
  function drawFloor(ctx,w,h,horizon,theme){
    const height=h-horizon-4;if(w<=0||height<=0)return false;
    const dpr=Math.min(window.devicePixelRatio||1,2,Math.sqrt(1200000/(w*height)));
    const key=JSON.stringify([w,height,dpr,theme.floor,theme.stone,theme.joint,theme.dressing]);
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
