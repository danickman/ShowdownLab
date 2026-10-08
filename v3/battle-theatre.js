// Presentation only. Geometry is built once per mark; no combat state is changed.
(()=>{'use strict';
  const geometry=new WeakMap();
  const budget=tier=>tier==='minimal'?3:tier==='reduced'?5:8;
  function shape(mark){
    if(geometry.has(mark))return geometry.get(mark);
    const seed=(mark.seed||0)+(mark.t||0)*.013+(mark.x||0)*71+(mark.y||0)*113;
    const quake=mark.type==='quake',burn=mark.type==='arc'||mark.type==='fire';
    const radius=(quake?35:burn?25:mark.heavy?29:20)+(mark.tech||0)*2;
    const rays=Array.from({length:quake?8:6},(_,i)=>{
      const a=i*Math.PI*2/(quake?8:6)+Math.sin(seed+i)*.24;
      const r=radius*(.68+.32*(.5+.5*Math.sin(seed*1.7+i*3.1)));
      return {points:[[Math.cos(a)*3,Math.sin(a)*1.4],
        [Math.cos(a+.13)*r*.38,Math.sin(a+.13)*r*.18],
        [Math.cos(a-.1)*r*.7,Math.sin(a-.1)*r*.32],
        [Math.cos(a+.08)*r,Math.sin(a+.08)*r*.46]],
        branch:[Math.cos(a+.65)*r*.83,Math.sin(a+.65)*r*.38]};
    });
    const chips=Array.from({length:10},(_,i)=>{const a=i*2.399+seed,r=radius*(.45+(i%4)*.19);return {x:Math.cos(a)*r,y:Math.sin(a)*r*.43,size:1.8+(i%3)*.9,angle:a}});
    const value={radius,rays,chips,burn};geometry.set(mark,value);return value;
  }
  function polygon(ctx,x,y,size,angle){
    ctx.beginPath();for(let k=0;k<4;k++){const a=angle+k*Math.PI/2,r=size*(k%2?.65:1);const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.6;k?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();
  }
  function drawDamage(ctx,p,mark,age,tier='full'){
    if(age<0||age>=1)return;
    const g=shape(mark),grow=Math.min(1,age*42),fade=Math.min(1,(1-age)/.28),limit=budget(tier);
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(grow,grow);
    // Settled dirt/char sits flat on the floor; fractured edges catch the same daylight.
    ctx.globalAlpha=fade*(g.burn?.31:.22);ctx.fillStyle=g.burn?'#493d31':'#98714d';
    ctx.beginPath();ctx.ellipse(0,2,g.radius*.81,g.radius*.30,-.08,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=fade*(g.burn?.48:.62);ctx.lineCap='round';ctx.lineJoin='round';
    for(const ray of g.rays.slice(0,limit)){
      ctx.strokeStyle='#4d3c2b';ctx.lineWidth=mark.type==='quake'?2.5:mark.heavy?2:1.5;
      ctx.beginPath();ray.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
      if(tier!=='minimal'){
        ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(...ray.points[2]);ctx.lineTo(...ray.branch);ctx.stroke();
        ctx.strokeStyle='#fff2ca';ctx.lineWidth=.85;ctx.beginPath();ray.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y-1.3):ctx.moveTo(x,y-1.3));ctx.stroke();
      }
    }
    ctx.globalAlpha=fade*.7;
    for(const chip of g.chips.slice(0,limit+2)){
      ctx.fillStyle='#6e543b';polygon(ctx,chip.x+1,chip.y+1,chip.size,chip.angle);ctx.fill();
      ctx.fillStyle=g.burn?'#85745a':'#c5a879';polygon(ctx,chip.x,chip.y-1,chip.size,chip.angle);ctx.fill();
    }
    ctx.restore();
  }
  function drawImpact(ctx,f,age,tier='full'){
    if(age<0||age>=1)return;
    const n=budget(tier),seed=f.seed||1,power=f.heavy?1.25:1,fade=1-age;
    ctx.save();ctx.translate(f.x,f.y);
    // Low opaque dust lobes give weight without expensive per-unit blur.
    for(let i=0;i<n;i++){
      const a=i*Math.PI*2/n+seed*.37,r=age*(22+i*3)*power;
      const x=Math.cos(a)*r,y=Math.sin(a)*r*.30-age*7;
      ctx.globalAlpha=fade*fade*.26;ctx.fillStyle=i%2?'#b89466':'#d4bc91';
      ctx.beginPath();ctx.ellipse(x,y,(5+age*8)*power,(2+age*4)*power,0,0,Math.PI*2);ctx.fill();
      const lift=Math.sin(age*Math.PI)*(15+i*2)*power,size=(2+i%3)*(.8+fade*.2);
      ctx.globalAlpha=fade*.24;ctx.fillStyle='#5a4932';ctx.beginPath();ctx.ellipse(x,y+3,size*1.1,size*.45,0,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=fade*.9;ctx.fillStyle=i%2?'#7b6041':'#b69564';polygon(ctx,x,y-lift,size,seed+i+age*5);ctx.fill();
    }
    // A brief flattened pressure wave, rather than a glowing circular halo.
    ctx.globalAlpha=Math.max(0,1-age*2.5)*.55;ctx.strokeStyle='#f4d8a4';ctx.lineWidth=2.4*(1-age)+.6;
    ctx.beginPath();ctx.ellipse(0,3,(9+age*62)*power,(3+age*18)*power,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  const weapons={knight:[.25,-.55],sniper:[.24,-.61],goose:[.20,-.40],dragon:[.32,-.55],assassin:[.23,-.54],beetank:[.30,-.35],mole:[.24,-.38],turtle:[.28,-.37],goblin:[.23,-.52],barbarian:[.24,-.62]};
  function anchor(type,role,height,facing=1){const point=role==='weapon'?(weapons[type]||weapons.knight):[0,-.47];return{x:point[0]*height*facing,y:point[1]*height}}
  function effectLife(kind,tier,tech=0){
    if(kind==='comic')return 1050;
    if(/Spell$/.test(kind))return Math.min(1250,820+tech*70);
    if(['shot','muzzle','muzzleShock'].includes(kind))return 180;
    if(['slash','weaponTrail','impactArc'].includes(kind))return tier==='minimal'?170:260;
    if(['hit','clash','puncture'].includes(kind))return 230;
    if(kind==='fire')return 420;
    if(kind==='signatureBurst')return 460;
    return tier==='minimal'?460:tier==='reduced'?560:tier==='balanced'?660:760;
  }
  window.BattleTheatre={drawDamage,drawImpact,anchor,effectLife};
})();
