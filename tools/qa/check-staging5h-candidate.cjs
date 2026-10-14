// Turn 5H: compare denser presentation-only staging caps with strict small-fight parity.
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const base=fs.readFileSync('v3/combat-staging.js','utf8');
const match='return{x:Math.min(34,arena.w*.10),y:Math.min(23,arena.h*.07)};';
assert(base.includes(match));
const guarded=base.replace(match,'return{x:Math.min(46,arena.w*.135),y:Math.min(30,arena.h*.085)};')
  .replace('if(lower+higher+enemies){', 'if(lower+higher+enemies){')
  .replace('dx=direction*cap.x*(.16+.84*(direction<0?1-rank:rank));',
    'dx=direction*Math.min(cap.x,34,camera.arena.w*.10)*(.16+.84*(direction<0?1-rank:rank));')
  .replace('dy=peers?((e.u.id%3)-1)*cap.y*.78:0;',
    'dy=peers?((e.u.id%3)-1)*Math.min(cap.y,enemies?23:30,camera.arena.h*(enemies?.07:.085))*.78:0;');
assert.notStrictEqual(guarded,base);
const envelopes=()=>({left:.65,right:.65,above:1.19,below:.10});
function load(code){const w={FighterAssets:{authored:{},visualEnvelope:envelopes}};vm.runInNewContext(code,{window:w,Math},{timeout:2000});return w.CombatStaging}
const A=load(base),B=load(guarded),camera={arena:{x:14,y:345,w:402,h:480},worldToScreen:(x,y)=>({x:14+x*402,y:345+y*480}),unitSize:(k,n)=>k==='large'?44:k==='heavy'?38:k==='small'?25:33};
const rows=[];for(const n of [20,40,60,80,120,160])for(const seed of [1337,7301,27919]){
 let s=seed>>>0;const r=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
 const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
 const units=Array.from({length:n},(_,i)=>({id:i+1,hp:100,team:i%2?'red':'blue',type:types[i%10],level:1+i%5,x:.5+(i%2?.06:-.06)+(r()-.5)*.20,y:.24+r()*.51}));
 const a=A.create(),b=B.create();
 for(let frame=0;frame<32;frame++){a.prepare(units,camera,frame*16.667);b.prepare(units,camera,frame*16.667)}
 let overlapsA=0,overlapsB=0,cropA=0,cropB=0,detachedA=0,detachedB=0,maxSmallDelta=0;
 const points=[a,b].map(stage=>units.map(u=>stage.point(u,camera)));
 for(let i=0;i<n;i++){
  const u=units[i],size=camera.unitSize(u.type==='dragon'?'large':['beetank','turtle'].includes(u.type)?'heavy':['goose','goblin'].includes(u.type)?'small':'normal',n);
  for(let k=0;k<2;k++){const p=points[k][i],box={left:p.x-size*.65,right:p.x+size*.65,top:p.y-size*1.19,bottom:p.y+size*.10};
   if(box.left<camera.arena.x-1||box.right>camera.arena.x+camera.arena.w+1||box.top<camera.arena.y-1||box.bottom>camera.arena.y+camera.arena.h+1){if(k)cropB++;else cropA++;}
  }
  const delta=Math.hypot(points[0][i].x-points[1][i].x,points[0][i].y-points[1][i].y);maxSmallDelta=Math.max(maxSmallDelta,delta);
  for(let j=i+1;j<n;j++){
   for(let k=0;k<2;k++){const p=points[k][i],q=points[k][j],dx=Math.abs(p.x-q.x),dy=Math.abs(p.y-q.y);
    if(dx<28&&dy<37){if(k)overlapsB++;else overlapsA++;}
    if(u.team!==units[j].team){const orig=camera.worldToScreen(u.x,u.y),other=camera.worldToScreen(units[j].x,units[j].y);
     if(Math.abs(orig.x-other.x)<22&&Math.abs(orig.y-other.y)<25&&Math.hypot(p.x-q.x,p.y-q.y)>76){if(k)detachedB++;else detachedA++;}}
   }
  }
 }
 if(n<=60)assert(maxSmallDelta<1e-8,'ordinary battle geometry changed');
 rows.push({n,seed,baselineOverlap:overlapsA,candidateOverlap:overlapsB,baselineCrop:cropA,candidateCrop:cropB,baselineDetached:detachedA,candidateDetached:detachedB,maxOffsetDelta:+maxSmallDelta.toFixed(3)});
}
const sums=(k,filter=()=>true)=>rows.filter(filter).reduce((n,r)=>n+r[k],0);
const dense=r=>r.n>60,ratio=sums('candidateOverlap',dense)/Math.max(1,sums('baselineOverlap',dense));
const accepted=sums('candidateCrop')<=sums('baselineCrop')+20 && sums('candidateDetached',dense)<=sums('baselineDetached',dense)+20 && ratio<1;
const receipt={experiment:'contact-guarded expanded dense caps 34/23 to 46/30',note:'synthetic fixed positions; bounding proxies, not sprite alpha; candidate not integrated',overlapRatio:ratio,accepted,reason:accepted?'passed geometry gates':'candidate rejected by overlap, clipping, or contact-distance gate',rows};
if(process.env.QA_STAGE_CANDIDATE_RECEIPT)fs.writeFileSync(process.env.QA_STAGE_CANDIDATE_RECEIPT,JSON.stringify(receipt,null,2));
console.log((accepted?'ACCEPT':'REJECT')+' staging candidate diagnostics: '+JSON.stringify({overlapRatio:ratio,baselineCrop:sums('baselineCrop'),candidateCrop:sums('candidateCrop'),baselineDetached:sums('baselineDetached',dense),candidateDetached:sums('candidateDetached',dense)}));
console.log('Candidate status '+(accepted?'PASS (requires visual review)':'REJECT (retain original)'));
