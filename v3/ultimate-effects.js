(()=>{'use strict';
const colors={bastion:'#ebd28f',pierce:'#ffe7ac',inferno:'#ed9444',execution:'#ad8dbc',seismic:'#b18b58',carapace:'#cfab65',reflect:'#9fb56e',pack:'#b7b875',cleave:'#cf9361',thunder:'#e6dec4'};
function draw(c,f,age,tier='full'){
 if(age<0||age>=1)return;
 const reduced=tier==='minimal'||tier==='reduced'||window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 const size=Math.max(8,Math.min(60,f.size||30)),spread=reduced?.25:age,rank=f.level>=5?2:1,x=f.x,y=f.y;
 c.save();c.globalAlpha*=1-age;c.strokeStyle=colors[f.ability]||'#d6bd86';c.lineWidth=Math.max(1,size*.05*(1-age));
 if(f.ability==='pierce'&&f.end){c.beginPath();c.moveTo(x+(f.cueX||0),y+(f.cueY||0));c.lineTo(f.end.x,f.end.y-size*.45);c.stroke()}
 else if(['bastion','carapace','reflect'].includes(f.ability)){
  c.beginPath();c.moveTo(x-size*.35,y);c.quadraticCurveTo(x-size*.52,y-size*.85,x,y-size*1.05);c.quadraticCurveTo(x+size*.52,y-size*.85,x+size*.35,y);c.stroke();
  if(rank===2&&!reduced){c.beginPath();c.ellipse(x,y,size*.45,size*.09,0,0,Math.PI*2);c.stroke()}
 }else if(['seismic','thunder','pack'].includes(f.ability)){
  const r=size*(.45+spread*(f.ability==='thunder'?1.3:.8));c.beginPath();c.ellipse(x,y,r,r*.22,0,0,Math.PI*2);c.stroke();
  if(rank===2&&!reduced){c.beginPath();c.ellipse(x,y,r*.7,r*.15,0,0,Math.PI*2);c.stroke()}
 }else if(f.ability==='inferno'){
  for(let i=0;i<(reduced?2:rank+2);i++){const xx=x+(i-1)*size*.18;c.beginPath();c.moveTo(xx,y-size*.1);c.quadraticCurveTo(xx-size*.1,y-size*.4,xx+size*.08,y-size*(.5+spread*.4));c.stroke()}
 }else{
  c.beginPath();c.arc(x,y-size*.45,size*(.3+spread*.25),-.8,2);c.stroke();
  if(rank===2&&!reduced){c.beginPath();c.arc(x,y-size*.45,size*(.2+spread*.2),2.2,4.4);c.stroke()}
 }
 c.restore();
}
window.UltimateEffects=Object.freeze({draw,life:tier=>tier==='reduced'||tier==='minimal'?220:360});
})();
