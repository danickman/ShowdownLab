// Stateless, bounded environment animation. No unit effects or persistent queues.
(()=>{'use strict';
  const reduced=()=>window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
  function drawSky(ctx,w,h,theme,time,count){
    if(w<=0||h<=0||reduced())return;
    const dense=count>60,t=time*.001,war=['frontier','siege'].includes(theme.dressing);
    ctx.save();ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();
    // High, translucent cloud wisps move independently of the painted architecture.
    if(!dense){ctx.fillStyle='#fffdf3';ctx.globalAlpha=.075;
      for(let i=0;i<2;i++){const x=((t*(3+i)+i*w*.57)%(w*1.5))-w*.25,y=h*(.30+i*.18);ctx.beginPath();ctx.ellipse(x,y,w*.15,h*.028,-.08,0,Math.PI*2);ctx.ellipse(x+w*.07,y-h*.017,w*.09,h*.035,0,0,Math.PI*2);ctx.fill()}
    }
    ctx.strokeStyle=war?'#4e5348':'#5b7277';ctx.lineWidth=1;ctx.globalAlpha=.42;
    for(let i=0;i<(dense?1:3);i++){const x=((t*(5+i)+i*w*.28)%(w*1.25))-w*.12,y=h*(.39+i*.07)+Math.sin(t*.7+i)*h*.02,wing=2+Math.sin(t*4+i)*1.2;ctx.beginPath();ctx.moveTo(x-3,y-wing);ctx.quadraticCurveTo(x-1,y-1,x,y);ctx.quadraticCurveTo(x+1,y-1,x+3,y-wing);ctx.stroke()}
    if(war){const columns=theme.dressing==='siege'?3:1;ctx.fillStyle='#71634f';
      for(let col=0;col<columns;col++)for(let i=0;i<(dense?2:4);i++){const phase=(t*.10+i*.25+col*.13)%1,x=w*(.18+col*.29)+Math.sin(phase*4+col)*w*.012+phase*w*.025,y=h*(.85-phase*.30),r=w*(.012+phase*.020);ctx.globalAlpha=(1-phase)*.065;ctx.beginPath();ctx.ellipse(x,y,r,r*1.3,-.22,0,Math.PI*2);ctx.fill()}
    }
    ctx.restore();
  }
  function drawPerimeter(ctx,w,h,horizon,theme,time,count){
    if(w<=0||h<=horizon||reduced())return;
    const dense=count>60,t=time*.001,war=['frontier','siege'].includes(theme.dressing),garden=theme.dressing==='garden';
    ctx.save();ctx.beginPath();ctx.rect(0,horizon,w,h-horizon);ctx.clip();
    // Fixed edge lanes protect combat silhouettes; leaves/dust drift past the stage.
    for(let i=0;i<(dense?2:8);i++){const phase=(t*(garden?.035:.045)+i*.137)%1,side=i%2,x=(side?w*.96:w*.035)+Math.sin(t*.6+i)*w*.012,y=horizon+25+phase*(h-horizon-70);ctx.globalAlpha=(.5-Math.abs(phase-.5))*(war?.32:.45);ctx.fillStyle=garden?'#698c43':war?'#987954':'#bcaa78';ctx.beginPath();ctx.ellipse(x,y,garden?3:1.6,garden?1.2:.8,t*.9+i,0,Math.PI*2);ctx.fill()}
    if(war&&!dense){ctx.fillStyle='#baa07a';ctx.globalAlpha=.045;for(const side of [0,1]){const x=side?w*.975:w*.025,y=horizon+(h-horizon)*(.32+.08*Math.sin(t*.15+side));ctx.beginPath();ctx.ellipse(x,y,w*.055,(h-horizon)*.09,.1,0,Math.PI*2);ctx.fill()}}
    ctx.restore();
  }
  window.ArenaAmbience={drawSky,drawPerimeter};
})();
