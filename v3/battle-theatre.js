// Presentation only. Geometry is built once per mark; no combat state is changed.
(()=>{'use strict';
  const geometry=new WeakMap();
  const budget=tier=>tier==='minimal'?3:tier==='reduced'?5:8;
  function shape(mark){
    if(geometry.has(mark))return geometry.get(mark);
    const seed=(mark.seed||0)+(mark.t||0)*.013+(mark.x||0)*71+(mark.y||0)*113;
    const quake=mark.type==='quake',arc=mark.type==='arc',burn=arc||mark.type==='fire';
    // QUAKE marks open a broader chasm than everyday hits. Cache per mark.
    const radius=(quake?62:arc?35:burn?25:mark.heavy?29:20)+(mark.tech||0)*(quake?2.8:2);
    const rays=Array.from({length:quake?8:6},(_,i)=>{
      const a=i*Math.PI*2/(quake?8:6)+Math.sin(seed+i)*.24;
      // A genuine QUAKE must split open *clear* floor toward the blue/red
      // front, not draw every fracture invisibly beneath the target army.
      // Leftward fault branches reach across the midfield, without adding
      // any rays, marks, particles, draw calls or physics changes.
      const midfield=quake?(Math.cos(a)<-.45?2.1:Math.cos(a)<0?1.34:1):1;
      const r=radius*midfield*(.68+.32*(.5+.5*Math.sin(seed*1.7+i*3.1)));
      const points=[[Math.cos(a)*3,Math.sin(a)*1.4],
        [Math.cos(a+.13)*r*.38,Math.sin(a+.13)*r*.18],
        [Math.cos(a-.1)*r*.7,Math.sin(a-.1)*r*.32],
        [Math.cos(a+.08)*r,Math.sin(a+.08)*r*.46]];
      // Precompute TWO irregular walls of the split ground ONCE per world mark.
      // Stage foreshortening keeps them embedded in paving, not floating above.
      const nx=-Math.sin(a),ny=Math.cos(a)*.44;
      const edges=quake?points.map(([x,y],j)=>{
        const half=[2.8,10.5,8.7,3.8][j]*(1+.16*Math.sin(seed+j*2+i));
        return{upper:[x+nx*half,y+ny*half],lower:[x-nx*half,y-ny*half],
          lip:[x+nx*(half+3.2),y+ny*(half+3.2)]};
      }):null;
      return {points,edges,
        branch:[Math.cos(a+.65)*r*.83,Math.sin(a+.65)*r*.38]};
    });
    const chips=Array.from({length:10},(_,i)=>{const a=i*2.399+seed,r=radius*(.45+(i%4)*.19);return {x:Math.cos(a)*r,y:Math.sin(a)*r*.43,size:(quake?3.1:1.8)+(i%3)*(quake?1.45:.9),angle:a}});
    // ONE existing targeted mark per QUAKE cast (seed=0) extends a coherent
    // earth fault over exposed midfield. No additional marks, targets or FX.
    // Its angular trench/lip is cached with the same WeakMap geometry.
    const focus=quake&&mark.seed===0?(()=>{
      const spine=[[0,0],[-28,8],[-63,31],[-99,17],[-142,46],[-184,40]];
      const half=[3,9,15,12,17,4];
      return spine.map(([x,y],i)=>({
        upper:[x,y-half[i]*.50],lower:[x,y+half[i]*.54],
        lip:[x,y-half[i]*.50-3.5]
      }));
    })():null;
    const value={radius,rays,chips,burn,arc,focus};geometry.set(mark,value);return value;
  }
  function polygon(ctx,x,y,size,angle){
    ctx.beginPath();for(let k=0;k<4;k++){const a=angle+k*Math.PI/2,r=size*(k%2?.65:1);const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r*.6;k?ctx.lineTo(px,py):ctx.moveTo(px,py)}ctx.closePath();
  }
  function drawDamage(ctx,p,mark,age,tier='full'){
    if(age<0||age>=1)return;
    const g=shape(mark),grow=Math.min(1,age*42),fade=Math.min(1,(1-age)/.28),limit=budget(tier);
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(grow,grow);
    // Settled dirt/char sits flat on the floor; fractured edges catch the same daylight.
    const quake=mark.type==='quake';
    ctx.globalAlpha=fade*(g.arc?.48:g.burn?.31:quake?.43:.22);ctx.fillStyle=g.arc?'#29323a':g.burn?'#493d31':quake?'#705038':'#98714d';
    ctx.beginPath();ctx.ellipse(0,2,g.radius*.81,g.radius*.30,-.08,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=fade*(g.burn?.48:quake?.90:.62);ctx.lineCap='round';ctx.lineJoin='round';
    if(quake&&tier!=='minimal'&&g.focus){
      // Broad connected earth opening actually crosses the empty battlefield.
      // Draw underneath all fighters, so there is no deceptive damage hitbox.
      ctx.fillStyle='#26180f';ctx.globalAlpha=fade*.93;ctx.beginPath();
      g.focus.forEach((e,i)=>i?ctx.lineTo(...e.upper):ctx.moveTo(...e.upper));
      for(let i=g.focus.length-1;i>=0;i--)ctx.lineTo(...g.focus[i].lower);
      ctx.closePath();ctx.fill();
      // Bright broken-stone lip remains available even under reduced motion:
      // a single fine edge, not flashing overlays or a screen shake increase.
      ctx.strokeStyle='#e8b77e';ctx.lineWidth=tier==='reduced'?2.1:3.1;
      ctx.globalAlpha=fade*.84;ctx.beginPath();
      g.focus.forEach((e,i)=>i?ctx.lineTo(...e.lip):ctx.moveTo(...e.lip));ctx.stroke();
      ctx.globalAlpha=fade*.90;
    }
    for(const ray of g.rays.slice(0,limit)){
      // A *filled* jagged opening, not just a thin stroke. Reuses the eight
      // source-authored ground faults and existing 3/5/8 density caps.
      // Omit the extra fills entirely at 300-fighter minimal spectacle.
      if(quake&&tier!=='minimal'&&ray.edges){
        ctx.fillStyle='#231811';ctx.globalAlpha=fade*.90;
        ctx.beginPath();
        ray.edges.forEach((e,i)=>i?ctx.lineTo(...e.upper):ctx.moveTo(...e.upper));
        for(let i=ray.edges.length-1;i>=0;i--)ctx.lineTo(...ray.edges[i].lower);
        ctx.closePath();ctx.fill();
        if(tier!=='reduced'){
          // A separate light uplifted paving edge explains the silhouette:
          // the stone physically rises beside the exposed dark fault.
          ctx.fillStyle='#e3ba83';ctx.globalAlpha=fade*.70;
          ctx.beginPath();
          ray.edges.forEach((e,i)=>i?ctx.lineTo(...e.lip):ctx.moveTo(...e.lip));
          for(let i=ray.edges.length-1;i>=0;i--)ctx.lineTo(...ray.edges[i].upper);
          ctx.closePath();ctx.fill();
        }
        ctx.globalAlpha=fade*.90;
      }
      // Three narrow layers suggest split, sunlit stone rather than a glowing
      // circle. The crowd-minimal tier only draws the dark primary fracture.
      ctx.strokeStyle=quake?'#241a15':g.arc?'#263747':'#4d3c2b';
      ctx.lineWidth=quake?(tier==='minimal'?3.2:tier==='reduced'?5.4:6.3):g.arc?(tier==='minimal'?1.8:2.6):mark.heavy?2:1.5;
      ctx.beginPath();ray.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();
      if(tier!=='minimal'){
        if(quake){
          ctx.strokeStyle='#875c37';ctx.lineWidth=tier==='reduced'?2.1:2.9;
          ctx.beginPath();ray.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y+1):ctx.moveTo(x,y+1));ctx.stroke();
        }
        ctx.strokeStyle=quake?'#3b2b20':g.arc?'#375c70':'#4d3c2b';ctx.lineWidth=quake?1.7:g.arc?1.4:.9;
        ctx.beginPath();ctx.moveTo(...ray.points[2]);ctx.lineTo(...ray.branch);ctx.stroke();
        ctx.strokeStyle=quake?'#ffdf9d':g.arc?'#83c8d7':'#fff2ca';ctx.lineWidth=quake?1.15:g.arc?1.1:.85;
        ctx.beginPath();ray.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y-(quake?3:1.3)):ctx.moveTo(x,y-(quake?3:1.3)));ctx.stroke();
      }
    }
    ctx.globalAlpha=fade*(quake?.92:.7);
    for(const chip of g.chips.slice(0,limit+2)){
      ctx.fillStyle=quake?'#3f2e23':g.arc?'#283640':'#6e543b';polygon(ctx,chip.x+1,chip.y+1,chip.size,chip.angle);ctx.fill();
      ctx.fillStyle=g.arc?'#8ba5ad':g.burn?'#85745a':quake?'#d6b080':'#c5a879';
      polygon(ctx,chip.x,chip.y-(quake?2:1),chip.size,chip.angle);ctx.fill();
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
  function drawRush(ctx,f,age,tier='full'){
    if(age<0||age>=1||tier==='minimal')return;
    const size=Math.max(24,Math.min(112,f.size||80)),direction=f.facing===-1?-1:1,fade=(1-age)*(1-age),n=tier==='reduced'?3:5;
    ctx.save();ctx.translate(f.x,f.y);ctx.scale(direction,1);ctx.lineCap='round';
    // Short earth streaks and lifted stone crumbs trail the planted foot position.
    // Physical tones and flattened geometry keep the wake beneath the silhouette.
    for(let i=0;i<n;i++){
      const lane=(i-(n-1)*.5)*size*.045,back=size*(.10+age*.58+(i%2)*.09),length=size*(.12+age*.18);
      ctx.globalAlpha=fade*.30;ctx.strokeStyle='#856b48';ctx.lineWidth=f.heavy?2.4:1.6;
      ctx.beginPath();ctx.moveTo(-back,lane);ctx.lineTo(-back-length,lane+size*.012);ctx.stroke();
      ctx.globalAlpha=fade*.52;ctx.fillStyle=i%2?'#d6c39c':'#bba078';
      const lift=Math.sin(age*Math.PI)*(4+i%3*2);polygon(ctx,-back, lane-lift,1.4+i%2,f.seed+i+age*3);ctx.fill();
      ctx.globalAlpha=fade*.10;ctx.fillStyle='#c7b18a';ctx.beginPath();ctx.ellipse(-back-length*.5,lane-2,5+age*7,2+age*2,0,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  function drawHonk(ctx,f,age,tier='full'){
    if(age<0||age>=1)return;
    const fade=(1-age)*(1-age),r=14+age*58;
    ctx.save();ctx.translate(f.x,f.y);
    // Sound pressure sits in the ground plane instead of obscuring the head.
    ctx.globalAlpha=fade*.72;ctx.strokeStyle='#f1d789';ctx.lineWidth=tier==='minimal'?1.4:2.3;
    ctx.beginPath();ctx.ellipse(0,2,r,r*.25,0,0,Math.PI*2);ctx.stroke();
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;
    const count=tier==='minimal'||reduced?0:tier==='reduced'?2:(f.level>=5?5:2);
    for(let i=0;i<count;i++){
      const a=i*2.399+(f.seed||1)*.11,x=Math.cos(a)*(8+age*27),y=Math.sin(a)*(3+age*9)-Math.sin(age*Math.PI)*(10+i*2),angle=a+age*.7;
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.globalAlpha=fade*.78;ctx.fillStyle='#fffcf0';ctx.strokeStyle='#8d998b';ctx.lineWidth=.65;
      ctx.beginPath();ctx.moveTo(0,-4);ctx.quadraticCurveTo(3,0,0,4);ctx.quadraticCurveTo(-2,1,0,-4);ctx.fill();ctx.stroke();ctx.restore();
    }
    ctx.restore();
  }
  const weapons={knight:[.25,-.55],sniper:[.24,-.61],goose:[.20,-.40],dragon:[.32,-.55],assassin:[.23,-.54],beetank:[.30,-.35],mole:[.24,-.38],turtle:[.28,-.37],goblin:[.23,-.52],barbarian:[.24,-.62]};
  function anchor(type,role,height,facing=1){const point=role==='weapon'?(weapons[type]||weapons.knight):[0,-.47];return{x:point[0]*height*facing,y:point[1]*height}}
  function effectLife(kind,tier,tech=0){
    if(kind==='honk')return 420;
    if(kind==='chargeWake')return 420;
    if(kind==='comic')return 1050;
    if(/Spell$/.test(kind))return Math.min(1250,820+tech*70);
    if(['shot','muzzle','muzzleShock'].includes(kind))return 180;
    if(['slash','weaponTrail','impactArc'].includes(kind))return tier==='minimal'?170:260;
    if(['hit','clash','puncture'].includes(kind))return 230;
    if(kind==='fire')return 420;
    if(kind==='signatureBurst')return 460;
    return tier==='minimal'?460:tier==='reduced'?560:tier==='balanced'?660:760;
  }
  window.BattleTheatre={drawDamage,drawImpact,drawRush,drawHonk,anchor,effectLife};
})();
