// Turn 5H: deterministic camera-composition A/B diagnostics (no game-state writes).
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function loadCamera(source){
  const sandbox={window:{FighterAssets:{authored:{},visualEnvelope:()=>({left:.7,right:.7,above:1.23,below:.09})},CombatStaging:{limits:(n,a)=>n<=60?{x:Math.min(56,a.w*.16),y:Math.min(36,a.h*.11)}:{x:Math.min(34,a.w*.10),y:Math.min(23,a.h*.07)}}}};
  vm.runInNewContext(source,sandbox,{timeout:1500});
  return sandbox.window.ShowdownCamera;
}
const source=fs.readFileSync('v3/camera.js','utf8');
const BASE=loadCamera(source);
assert(source.includes('density>55?.80'),'camera crowd factor has changed: update A/B harness');
const ALT=loadCamera(source.replace('density>55?.80','density>55?.74')); // diagnostic candidate ONLY; not shipped
const TYPES=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const kinds={dragon:'large',beetank:'heavy',turtle:'heavy',goblin:'small',goose:'small'};
function random(seed){let s=seed>>>0;return()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296}}
function army(n,seed){
 const r=random(seed),u=[];
 for(let i=0;i<n;i++){const team=i%2===0?'blue':'red',side=team==='blue'?-1:1;
   u.push({id:i+1,type:TYPES[i%10],team,level:1+i%5,hp:100,
     x:.5+side*(.012+r()*.155)+(r()-.5)*.12,
     y:.25+r()*.50});}
 return u;
}
const viewport={w:430,h:932},sizes=[20,40,60,80,120],seeds=[1337,2026,44551];
function rect(cam,u,count){
 const p=cam.worldToScreen(u.x,u.y),size=cam.unitSize(kinds[u.type]||'normal',count);
 return {left:p.x-size*.7,right:p.x+size*.7,top:p.y-size*1.23,bottom:p.y+size*.09,
   team:u.team,id:u.id,type:u.type,foot:p.y};
}
function intersection(a,b){return Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top))}
function evaluate(Camera,units){
 const cam=Camera.create(viewport.w,viewport.h);
 // Match camera's steady tracking rather than judging an unrepresentative initial zoom.
 for(let i=0;i<120;i++)cam.focus(units);
 const rects=units.map(u=>rect(cam,u,units.length)),a=cam.arena;
 let pairs=0,enemyPairs=0,intersectArea=0,cropped=0,area=0,visibleApprox=0;
 for(let i=0;i<rects.length;i++){const q=rects[i];area+=(q.right-q.left)*(q.bottom-q.top);
   if(q.left<a.x||q.right>a.x+a.w||q.top<a.y||q.bottom>a.y+a.h)cropped++;
   // Approximate visible rectangle fraction using occupancy sampled on a 7x9 raster.
   let visible=0,total=0;
   for(let y=0;y<9;y++)for(let x=0;x<7;x++){const px=q.left+(x+.5)*(q.right-q.left)/7,py=q.top+(y+.5)*(q.bottom-q.top)/9;total++;
     if(!rects.some((other,j)=>j>i&&px>=other.left&&px<=other.right&&py>=other.top&&py<=other.bottom))visible++;}
   visibleApprox+=visible/total;
   for(let j=i+1;j<rects.length;j++){const hit=intersection(q,rects[j]);if(hit>0){pairs++;intersectArea+=hit;if(q.team!==rects[j].team)enemyPairs++;}}
 }
 const minX=Math.min(...rects.map(r=>r.left)),maxX=Math.max(...rects.map(r=>r.right)),
       minY=Math.min(...rects.map(r=>r.top)),maxY=Math.max(...rects.map(r=>r.bottom));
 return {zoom:+cam.zoom.toFixed(4),pixelHeight:+(Math.sqrt(area/units.length)).toFixed(2),
   overlappingPairs:pairs,mixedTeamPairs:enemyPairs,rectIntersectionArea:Math.round(intersectArea),
   approxVisibleBodies:+visibleApprox.toFixed(2),cropped,
   occupiedFloorBoxRatio:+(((maxX-minX)*(maxY-minY))/(a.w*a.h)).toFixed(3)};
}
const cases=[];
for(const n of sizes)for(const seed of seeds){const units=army(n,seed),baseline=evaluate(BASE,units),candidate=evaluate(ALT,units);
 assert.equal(units.length,n);assert(Number.isFinite(baseline.zoom)&&Number.isFinite(candidate.zoom));
 cases.push({count:n,seed,baseline,candidate});}
const receipt={title:'Turn 5H camera composition diagnostic A/B',viewport,description:'Synthetic seeded world snapshots; 7x9 sampled RECTANGLE visibility, not authored alpha or screenshots. Candidate only changes dense crowd fit multiplier .80 to .74 and is not integrated.',cases};
if(process.env.QA_COMPOSITION_RECEIPT)fs.writeFileSync(process.env.QA_COMPOSITION_RECEIPT,JSON.stringify(receipt,null,2));
for(const n of sizes){const entries=cases.filter(x=>x.count===n);
 const avg=(key,field)=>entries.reduce((s,x)=>s+x[key][field],0)/entries.length;
 console.log(n+' fighters: baseline/candidate overlap '+avg('baseline','overlappingPairs').toFixed(1)+'/'+avg('candidate','overlappingPairs').toFixed(1)+', approximate visible bodies '+avg('baseline','approxVisibleBodies').toFixed(1)+'/'+avg('candidate','approxVisibleBodies').toFixed(1)+', mean sprite metric '+avg('baseline','pixelHeight').toFixed(1)+'/'+avg('candidate','pixelHeight').toFixed(1));}
console.log('PASS: 15 deterministic matched camera-composition diagnostics; no runtime change');
