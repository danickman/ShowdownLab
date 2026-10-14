// Turn 5G: density-only foreground priority without changing combat order.
'use strict';
const assert=require('assert'),fs=require('fs');
const js=fs.readFileSync('v3/v3.js','utf8');
assert(js.includes('if(live.length<=60)return a.p.y-b.p.y||a.p.x-b.p.x'),'small battles must keep exact prior depth ordering');
assert(js.includes('const laneA=Math.floor(a.p.y/12),laneB=Math.floor(b.p.y/12)'),'stable dense depth lanes missing');
assert(js.includes('prominence(a.u.type)-prominence(b.u.type)'),'large foreground priority missing');
function order(list,density){
 const prominence=t=>t==='dragon'?3:t==='beetank'||t==='turtle'?2:t==='knight'||t==='barbarian'?1:0;
 return list.slice().sort((a,b)=>{
  if(density<=60)return a.p.y-b.p.y||a.p.x-b.p.x;
  const laneA=Math.floor(a.p.y/12),laneB=Math.floor(b.p.y/12);
  if(laneA!==laneB)return laneA-laneB;
  return prominence(a.u.type)-prominence(b.u.type)||a.p.y-b.p.y||a.p.x-b.p.x||a.u.id-b.u.id;
 });
}
const fighters=[
 {u:{id:3,type:'dragon'},p:{x:160,y:302}},
 {u:{id:4,type:'goblin'},p:{x:160,y:305}},
 {u:{id:5,type:'turtle'},p:{x:160,y:304}},
 {u:{id:2,type:'goose'},p:{x:160,y:303}},
 {u:{id:6,type:'knight'},p:{x:160,y:306}}
];
assert.deepEqual(order(fighters,60).map(v=>v.u.id),[3,2,5,4,6]);
assert.deepEqual(order(fighters,120).map(v=>v.u.id),[2,4,6,5,3]);
for(let seed=0;seed<20;seed++){
 const shuffled=fighters.slice().sort((a,b)=>((a.u.id*17+seed*31)%11)-((b.u.id*17+seed*31)%11));
 assert.deepEqual(order(shuffled,120).map(v=>v.u.id),[2,4,6,5,3],'input array order must not affect dense layers');
}
console.log('PASS: small-battle original depth, 120-body large fighter top layering, permutation stability');
