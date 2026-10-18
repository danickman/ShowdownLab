(()=>{'use strict';
const colors={bastion:'#ebd28f',pierce:'#ffe7ac',inferno:'#ed9444',execution:'#ad8dbc',seismic:'#b18b58',siege:'#edb465',carapace:'#cfab65',reflect:'#9fb56e',shelter:'#91c6a4',pack:'#b7b875',cleave:'#cf9361',thunder:'#e6dec4',fissure:'#ad8255'};

function drawFissure(c,f,age,reduced,size,x,y){
 const px=f.end?.x??x,py=f.end?.y??y,dir=f.team==='red'?-1:1;
 const phase=Math.min(1,age*3.5),reach=size*(reduced?1.8:4.15)*phase;
 const wide=size*(reduced?.18:.34)*(1-age*.35);
 const vertices=[[0,0],[.13,-.06],[.26,.10],[.4,-.09],[.55,.12],[.7,-.075],[.84,.08],[1,0]];
 const point=q=>[px+dir*reach*q[0],py+size*q[1]*phase];
 const trench=()=>{c.beginPath();let [a,b]=point(vertices[0]);c.moveTo(a,b);
  for(let i=1;i<vertices.length;i++){[a,b]=point(vertices[i]);c.lineTo(a,b)}};
 c.save();c.lineJoin='round';c.lineCap='round';
 c.strokeStyle='#4b3024';c.lineWidth=Math.max(2.5,wide*1.55);trench();c.stroke();
 c.strokeStyle='#be7850';c.lineWidth=Math.max(1.6,wide*.84);trench();c.stroke();
 c.strokeStyle='#ffe3a1';c.lineWidth=Math.max(1.1,wide*.36);trench();c.stroke();
 c.save();c.globalAlpha*=Math.max(0,.85-age*.8);c.strokeStyle='#f1c78a';
 c.lineWidth=Math.max(1.5,size*.06*(1-age));
 const ring=size*(.38+(reduced?.54:1.60)*Math.min(1,age*2.1));
 c.beginPath();c.ellipse(px,py,ring,ring*.25,0,0,Math.PI*2);c.stroke();c.restore();
 if(!reduced){
  c.strokeStyle='#654637';c.lineWidth=Math.max(1.7,size*.09*(1-age*.65));
  for(const [at,side,long] of [[.26,-1,.30],[.41,1,.29],[.64,-1,.43],[.83,1,.32]]){
   const [bx,by]=point([at,0]),span=size*long*phase;
   c.beginPath();c.moveTo(bx,by);c.lineTo(bx+dir*span*.3,by+side*span*.55);
   c.lineTo(bx+dir*span*.45,by+side*span);c.stroke();
  }
  for(let i=0;i<7;i++){
   const along=(.1+i*.12)*reach,side=i%2?1:-1;
   const lift=size*(.14+.05*(i%3))*Math.sin(Math.PI*Math.min(1,age*1.4));
   const xx=px+dir*along+side*size*.045,yy=py+side*size*(.13+.04*(i%3))-lift;
   const rr=Math.max(1.4,size*(.075+.015*(i%3))*(1-age*.55));
   c.fillStyle=i%3===0?'#f5d9a5':i%3===1?'#b88756':'#6c5141';
   c.beginPath();c.moveTo(xx-rr,yy+rr*.55);c.lineTo(xx+dir*rr*.45,yy-rr);
   c.lineTo(xx+rr,yy+rr*.55);c.closePath();c.fill();
  }
  for(let i=0;i<3;i++){
   const xx=px+dir*reach*(.16+i*.30),yy=py-size*(.04+i*.03);
   const rr=size*(.18+.06*i)*(1+age*.45);
   c.save();c.globalAlpha*=Math.max(0,.48-age*.5);c.fillStyle='#bba181';
   c.beginPath();c.ellipse(xx,yy,rr,rr*.38,0,0,Math.PI*2);c.fill();c.restore();
  }
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
 else if(['bastion','carapace','reflect','shelter'].includes(f.ability)){
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
window.UltimateEffects=Object.freeze({draw,life:(tier,ability)=>ability==='fissure'?(tier==='reduced'||tier==='minimal'?300:620):(tier==='reduced'||tier==='minimal'?220:360)});
})();
