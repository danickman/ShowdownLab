'use strict';
// Turn 5E: bounded large-army visual fanning and presentation-only contract.
const fs=require('fs'),vm=require('vm'),assert=require('assert'),{performance}=require('perf_hooks');
const source=fs.readFileSync('v3/combat-staging.js','utf8');
const marker=/function limits\(count,arena\)\{[\s\S]*?\n  \}/;
assert(marker.test(source),'dense staging limits contract changed');
const baseline=source.replace(marker,"function limits(count,arena){const active=count>1&&count<=60;return{x:active?Math.min(56,arena.w*.16):0,y:active?Math.min(36,arena.h*.11):0}}");
const camera={arena:{x:0,y:0,w:430,h:520},worldToScreen:(x,y)=>({x:x*430,y:y*520}),unitSize:(kind,n)=>kind==='large'?47:kind==='heavy'?40:kind==='small'?27:34};
const visualEnvelope=()=>({left:.57,right:.57,above:1.04,below:.08});
function make(code){const env={window:{FighterAssets:{authored:{},visualEnvelope}},Math};vm.createContext(env);vm.runInContext(code,env);return env.window.CombatStaging}
function fixture(n,seed){let x=seed>>>0;const rnd=()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296};const types=['knight','beetank','goose','dragon','turtle','goblin','mole','sniper'];
 return Array.from({length:n},(_,i)=>({id:i+1,team:i%2?'red':'blue',type:types[i%types.length],level:1+i%5,hp:100,x:.33+rnd()*.34,y:.24+rnd()*.50}));}
function countOverlap(units,stage){let overlaps=0,occlusion=0;
 for(let i=0;i<units.length;i++)for(let j=i+1;j<units.length;j++){const a=units[i],b=units[j];if(a.team!==b.team)continue;const p=stage.point(a,camera),q=stage.point(b,camera),dx=Math.abs(p.x-q.x),dy=Math.abs(p.y-q.y);
 if(dx<20&&dy<26)overlaps++;
 if(dx<27&&dy<37)occlusion++;
 }return{overlaps,occlusion};}
const rows=[];for(const n of [61,80,100,120,160])for(const seed of [1337,7301,27919]){
 const units=fixture(n,seed),original=make(baseline).create(),current=make(source).create(),copies=[original,current],cap=make(source).limits(n,camera.arena),time=[0,0];let maxOffset=0,offscreen=0;
 for(let f=0;f<28;f++){
  const moved=units.map(u=>({...u,x:u.x+Math.sin(f*.13+u.id)*.002,y:u.y+Math.cos(f*.09+u.id)*.002}));
  for(let k=0;k<2;k++){const t=performance.now();copies[k].prepare(moved,camera,f*16.667);time[k]+=performance.now()-t;}
  for(const u of moved){const o=current.offset(u.id),lim=cap;maxOffset=Math.max(maxOffset,Math.abs(o.dx),Math.abs(o.dy));assert(Math.abs(o.dx)<=lim.x+1e-6&&Math.abs(o.dy)<=lim.y+1e-6,'offset exceeded dense staging budget');const p=current.point(u,camera);if(p.x<-1||p.x>431||p.y<-1||p.y>521)offscreen++;}
  if(f===27){const b=countOverlap(moved,original),a=countOverlap(moved,current);rows.push({n,seed,oldOverlap:b.overlaps,newOverlap:a.overlaps,oldOcclusion:b.occlusion,newOcclusion:a.occlusion,baselineMs:+time[0].toFixed(2),denseMs:+time[1].toFixed(2),maxOffset:+maxOffset.toFixed(2),offscreen});}
 }
}
const total=key=>rows.reduce((s,r)=>s+r[key],0);
const reduced=total('newOverlap')/Math.max(1,total('oldOverlap'));
const reducedOcclusion=total('newOcclusion')/Math.max(1,total('oldOcclusion'));
assert(total('offscreen')===0,'presentation foot anchors exceeded arena');
assert(total('maxOffset')>0,'dense staging did not move any sprites');
assert(reduced<=1,'large-army close overlap worsened overall: '+reduced.toFixed(3));
assert(reducedOcclusion<=1,'large-army broad occlusion worsened overall: '+reducedOcclusion.toFixed(3));
console.log('PASS: 15 large-army visual scenarios, bounded offsets, reduced overlap and no out-of-bounds anchors');
console.log(JSON.stringify({ratioClose:reduced,ratioBroad:reducedOcclusion,rows}));
if(process.env.QA_DENSE_RECEIPT)fs.writeFileSync(process.env.QA_DENSE_RECEIPT,JSON.stringify({ratioClose:reduced,ratioBroad:reducedOcclusion,rows},null,2));
