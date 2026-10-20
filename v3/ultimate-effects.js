(()=>{'use strict';
const colors={bastion:'#ebd28f',pierce:'#ffe7ac',inferno:'#ed9444',execution:'#ad8dbc',seismic:'#b18b58',siege:'#edb465',carapace:'#cfab65',reflect:'#9fb56e',shelter:'#91c6a4',reprisal:'#b8efc3',pack:'#b7b875',cleave:'#cf9361',thunder:'#e6dec4',fissure:'#ad8255'};

function drawFissure(c,f,age,reduced,size,x,y){
  const px=f.end?.x??x,py=f.end?.y??y,dir=f.team==='red'?-1:1;
  const phase=Math.min(1,age*4),fade=Math.max(0,1-age),reach=size*(reduced?1.8:5.2)*phase;
  const width=size*(reduced?.13:.39)*phase*(1-age*.24);
  const path=[[0,0],[.12,-.08],[.25,.12],[.39,-.11],[.54,.13],[.68,-.09],[.82,.095],[.94,-.035],[1,0]];
  const point=(v,side=0)=>[px+dir*reach*v[0],py+size*v[1]*phase+side*width];
  function center(){c.beginPath();path.forEach((v,i)=>{const p=point(v);if(i)c.lineTo(...p);else c.moveTo(...p)})}
  c.save();c.lineJoin='round';c.lineCap='round';
  if(!reduced){
    // Layer one: a jagged filled trench, not merely a faint narrow line.
    c.fillStyle='#30221a';c.beginPath();
    path.forEach((v,i)=>{const p=point(v,-(i%2?.69:.89));if(i)c.lineTo(...p);else c.moveTo(...p)});
    for(let i=path.length-1;i>=0;i--)c.lineTo(...point(path[i],i%2?.86:.72));
    c.closePath();c.fill();
  }
  c.strokeStyle='#33231d';c.lineWidth=Math.max(2.6,width*1.55);center();c.stroke();
  c.strokeStyle='#a45a32';c.lineWidth=Math.max(1.5,width*.78);center();c.stroke();
  c.strokeStyle='#ffe1a0';c.lineWidth=Math.max(1.0,width*.20);center();c.stroke();
  if(!reduced){
    c.strokeStyle='#62412d';c.lineWidth=Math.max(1.4,size*.075*fade);
    for(let i=0;i<7;i++){
      const q=.16+i*.115,side=i%2?1:-1,p=point([q,(i%3-1)*.05]),leg=size*(.36+(i%3)*.14)*phase;
      c.beginPath();c.moveTo(...p);c.lineTo(p[0]+dir*leg*.24,p[1]+side*leg*.55);
      c.lineTo(p[0]+dir*leg*.55,p[1]+side*leg);c.stroke();
      if(i%2===0){c.beginPath();c.moveTo(p[0]+dir*leg*.24,p[1]+side*leg*.55);
        c.lineTo(p[0]-dir*leg*.12,p[1]+side*leg*.89);c.stroke()}
    }
    c.strokeStyle='#fff0bf';c.lineWidth=Math.max(1,size*.035*fade);
    for(const side of [-1,1]){c.beginPath();path.forEach((v,i)=>{const p=point(v,side*(i%2?.73:.63));if(i)c.lineTo(...p);else c.moveTo(...p)});c.stroke()}
  }
  const ring=size*(.4+(reduced?.55:1.85)*Math.min(1,age*2.25));
  c.save();c.globalAlpha*=.68*fade;c.strokeStyle='#fce0a5';c.lineWidth=Math.max(1.3,size*.065*fade);
  c.beginPath();c.ellipse(px,py,ring,ring*.25,0,0,Math.PI*2);c.stroke();c.restore();
  if(!reduced){
    const rise=Math.sin(Math.PI*Math.min(1,age*1.1));
    for(let i=0;i<12;i++){
      const p=point([.075+i*.075,(i%3-1)*.05]),r=Math.max(1.3,size*(.07+.015*(i%4))*fade),lift=size*(.20+.08*(i%3))*rise;
      c.fillStyle=i%3===0?'#f8dba4':i%3===1?'#bb885a':'#594032';
      c.beginPath();c.moveTo(p[0]-r,p[1]+r*.6-lift);c.lineTo(p[0]+dir*r*.35,p[1]-r*1.6-lift);
      c.lineTo(p[0]+r,p[1]+r*.6-lift);c.closePath();c.fill();
    }
    for(let i=0;i<4;i++){
      const p=point([.16+i*.23,0]),r=size*(.18+i*.055)*(1+age*.4);
      c.save();c.globalAlpha*=Math.max(0,.52-age*.46);c.fillStyle='#d2b998';
      c.beginPath();c.ellipse(p[0],p[1]-size*.23*rise,r,r*.37,0,0,Math.PI*2);c.fill();c.restore();
    }
  }
  c.restore();
}
function drawScar(c,m,age,tier='full'){
  if(age<0||age>=1||tier==='minimal')return;
  const fade=(1-age)*(1-age),x=m.x,y=m.y,size=Math.max(8,Math.min(60,m.size||30));
  const dir=m.team==='red'?-1:1,len=size*(tier==='reduced'?2:3.6);
  c.save();c.globalAlpha*=.50*fade;c.lineCap='round';c.lineJoin='round';
  c.strokeStyle='#3d3026';c.lineWidth=Math.max(1.2,size*.16*fade);
  c.beginPath();c.moveTo(x,y);c.lineTo(x+dir*len*.26,y-size*.1);
  c.lineTo(x+dir*len*.53,y+size*.13);c.lineTo(x+dir*len*.78,y-size*.06);c.lineTo(x+dir*len,y);c.stroke();
  if(tier!=='reduced'){
    c.lineWidth=Math.max(1,size*.067*fade);
    for(let i=1;i<=3;i++){const q=i*.24,side=i%2?1:-1;c.beginPath();
      c.moveTo(x+dir*len*q,y);c.lineTo(x+dir*len*(q+.08),y+side*size*.43);c.stroke()}
  }
  c.restore();
}

function draw(c,f,age,tier='full'){
 if(age<0||age>=1)return;
 const reduced=tier==='minimal'||tier==='reduced'||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const size=Math.max(8,Math.min(60,f.size||30)),spread=reduced?.25:age,rank=f.level>=5?2:1,x=f.x,y=f.y;
 c.save();c.globalAlpha*=1-age;c.strokeStyle=colors[f.ability]||'#d6bd86';c.lineWidth=Math.max(1.8,size*.075*(1-age));
 // Local ink punctuation earns an Ultimate hit without a full-screen flash.
 if(!reduced&&f.ability!=='fissure'){for(let i=0;i<(rank===2?7:5);i++){
  const a=-Math.PI+i*Math.PI*2/(rank===2?7:5),r=size*(.48+age*.32),d=size*(.12+rank*.035);
  c.beginPath();c.moveTo(x+Math.cos(a)*r,y-size*.38+Math.sin(a)*r*.65);c.lineTo(x+Math.cos(a)*(r+d),y-size*.38+Math.sin(a)*(r+d)*.65);c.stroke();
 }}
 if(f.ability==='fissure'){drawFissure(c,f,age,reduced,size,x,y)}else if(f.ability==='pierce'&&f.end){c.beginPath();c.moveTo(x+(f.cueX||0),y+(f.cueY||0));c.lineTo(f.end.x,f.end.y-size*.45);c.stroke()}
 else if(f.ability==='reprisal'){
  // Emerald shell impact: two local elliptical outward ripples and angular shrapnel,
  // no fullscreen flash. Minimal motion draws one simple visible ring.
  const rad=size*(.40+age*(reduced?.3:1.35));
  c.beginPath();c.ellipse(x,y-size*.12,rad,rad*.35,0,0,Math.PI*2);c.stroke();
  if(!reduced){
   c.beginPath();c.ellipse(x,y-size*.12,rad*.72,rad*.25,0,0,Math.PI*2);c.stroke();
   for(let i=0;i<5;i++){const ang=Math.PI*(.06+i*.22),dx=Math.cos(ang),dy=Math.sin(ang);
    c.beginPath();c.moveTo(x+dx*rad*.68,y-size*.12+dy*rad*.15);
    c.lineTo(x+dx*rad*1.22,y-size*.12+dy*rad*.32);c.stroke()}
  }
 }else if(['bastion','carapace','reflect','shelter'].includes(f.ability)){
  c.beginPath();c.moveTo(x-size*.35,y);c.quadraticCurveTo(x-size*.52,y-size*.85,x,y-size*1.05);c.quadraticCurveTo(x+size*.52,y-size*.85,x+size*.35,y);c.stroke();
  if(rank===2&&!reduced){c.beginPath();c.ellipse(x,y,size*.45,size*.09,0,0,Math.PI*2);c.stroke()}
 }else if(['seismic','siege','thunder','pack'].includes(f.ability)){
  const r=size*(.45+spread*(f.ability==='thunder'?1.3:.8));c.beginPath();c.ellipse(x,y,r,r*.22,0,0,Math.PI*2);c.stroke();
  if(rank===2&&!reduced){c.beginPath();c.ellipse(x,y,r*.7,r*.15,0,0,Math.PI*2);c.stroke()}
  // Siege Breaker: readable local plate-split and earth shards, never full-screen.
  if(f.ability==='siege'&&!reduced){
   const dir=f.team==='red'?-1:1,burst=Math.min(1,age*3),reach=size*(.28+burst*.88);
   c.save();c.strokeStyle='#5e382c';c.lineWidth=Math.max(2,size*.075*(1-age*.55));
   for(let j=-1;j<=1;j++){
    c.beginPath();c.moveTo(x,y+size*.07*j);
    c.lineTo(x+dir*reach*.42,y+size*(.12*j-.04));
    c.lineTo(x+dir*reach,y+size*(.20*j+.035));c.stroke();
   }
   c.strokeStyle='#ffdba0';c.lineWidth=Math.max(1,size*.024);
   c.beginPath();c.ellipse(x,y+size*.05,reach*.82,reach*.19,0,0,Math.PI*2);c.stroke();
   for(let i=0;i<5;i++){
    const px=x+dir*reach*(.22+.15*i),py=y+size*((i%2?1:-1)*(.12+.025*i)),
       rock=size*(.04+.012*(i%3))*(1-age*.7);
    c.fillStyle=i%2?'#b98655':'#78513b';
    c.beginPath();c.moveTo(px-rock,py);c.lineTo(px,py-rock*1.8);c.lineTo(px+rock,py+rock*.2);c.closePath();c.fill();
   }
   c.restore();
  }
  // An authored-looking second ground-level shock ring depicts the bounded
  // one-hop Goose echo without covering fighters or flashing the whole view.
  if(f.ability==='thunder'&&!reduced&&age>.14){
   const a=(age-.14)/.86,echoR=size*(.28+a*(rank===2?1.5:1.2));
   c.save();c.globalAlpha*=1-a*.7;c.lineWidth=Math.max(1.2,size*.036*(1-age));c.strokeStyle='#fff1c1';
   c.beginPath();c.ellipse(x,y+size*.025,echoR,echoR*.21,0,0,Math.PI*2);c.stroke();c.restore();
  }
 }else if(f.ability==='inferno'){
  for(let i=0;i<(reduced?2:rank+2);i++){const xx=x+(i-1)*size*.18;c.beginPath();c.moveTo(xx,y-size*.1);c.quadraticCurveTo(xx-size*.1,y-size*.4,xx+size*.08,y-size*(.5+spread*.4));c.stroke()}
 }else if(f.ability==='cleave'||f.ability==='execution'){
  const radius=size*(f.ability==='cleave'?(rank===2?1.01:.82):.52)*(1+spread*.35);
  c.lineWidth=Math.max(2,size*.11*(1-age));c.beginPath();c.arc(x,y-size*.45,radius,-1.35,.95);c.stroke();
  if(!reduced){c.strokeStyle='#fff3cf';c.lineWidth=Math.max(1,size*.025);c.beginPath();c.arc(x,y-size*.45,radius*.88,-1.35,.95);c.stroke()}
  if(f.ability==='cleave'&&rank===2&&!reduced){
   c.save();c.globalAlpha*=.62;c.strokeStyle='#ffe5ae';c.lineWidth=Math.max(1.2,size*.032*(1-age));
   c.beginPath();c.arc(x+size*.08,y-size*.44,radius*1.12,-1.18,1.06);c.stroke();c.restore();
  }
  if(f.ability==='execution'){c.beginPath();c.moveTo(x-radius*.6,y-size*.85);c.lineTo(x+radius*.6,y-size*.12);c.stroke()}
 }else{
  c.beginPath();c.arc(x,y-size*.45,size*(.3+spread*.25),-.8,2);c.stroke();
  if(rank===2&&!reduced){c.beginPath();c.arc(x,y-size*.45,size*(.2+spread*.2),2.2,4.4);c.stroke()}
 }
 c.restore();
}
window.UltimateEffects=Object.freeze({draw,drawScar,life:(tier,ability)=>ability==='fissure'?(tier==='reduced'||tier==='minimal'?300:760):(tier==='reduced'||tier==='minimal'?220:360)});
})();
