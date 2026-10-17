'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),{performance}=require('perf_hooks');
const oldSource=fs.readFileSync('tools/qa/staging5e-reference.js.txt','utf8'),newSource=fs.readFileSync('v3/combat-staging.js','utf8');
const camera={arena:{x:14,y:346,w:410,h:492},worldToScreen:(x,y)=>({x:x*430,y:y*930}),unitSize:(kind,n)=>kind==='large'?47:kind==='heavy'?40:kind==='small'?27:34};
function setup(source){
 const calls={sizes:0,envelopes:0};
 const env={window:{FighterAssets:{authored:{},visualEnvelope:(type,level)=>{calls.envelopes++;return{left:.57,right:.57,above:1.04,below:.08}}}},Math};
 const cam={...camera,unitSize:(kind,n)=>{calls.sizes++;return camera.unitSize(kind,n)}};
 vm.createContext(env);vm.runInContext(source,env);
 return{stage:env.window.CombatStaging.create(),calls,cam};
}
function fixture(n,seed){let x=seed>>>0;const rnd=()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296};const types=['knight','beetank','goose','dragon','turtle','goblin','mole','sniper'];
 return Array.from({length:n},(_,i)=>({id:i+1,team:i%2?'red':'blue',type:types[i%types.length],level:1+i%5,hp:100,x:.33+rnd()*.34,y:.24+rnd()*.50}));}
const rows=[];
for(const n of [1,12,30,60,80,120,160])for(const seed of [1337,7301,27919]){
 const units=fixture(n,seed),a=setup(oldSource),b=setup(newSource);let maxDelta=0;
 const timing=[0,0];
 for(let i=0;i<24;i++){
  const moved=units.map(u=>({...u,x:u.x+.002*Math.sin(i*.13+u.id),y:u.y+.002*Math.cos(i*.09+u.id)}));
  for(let j=0;j<2;j++){const x=j?b:a,t=performance.now();x.stage.prepare(moved,x.cam,i*16.667);timing[j]+=performance.now()-t}
  for(const u of moved){const old=a.stage.offset(u.id),newer=b.stage.offset(u.id);maxDelta=Math.max(maxDelta,Math.abs(old.dx-newer.dx),Math.abs(old.dy-newer.dy))}
 }
 assert(maxDelta<1e-9,'staging visual positions changed: '+n+' seed '+seed+' delta '+maxDelta);
 if(n>=80)assert(b.calls.envelopes<=a.calls.envelopes*.6&&b.calls.sizes<a.calls.sizes/3,'dense lookup caching ineffective');
 rows.push({units:n,seed,maxDelta,oldMs:+timing[0].toFixed(2),newMs:+timing[1].toFixed(2),oldEnvelopes:a.calls.envelopes,newEnvelopes:b.calls.envelopes,oldSizes:a.calls.sizes,newSizes:b.calls.sizes});
}
console.log('PASS: 21 exact staging visual position equivalence tests; form/size lookup reductions');
console.log(JSON.stringify(rows));
if(process.env.QA_STAGING5F_RECEIPT)fs.writeFileSync(process.env.QA_STAGING5F_RECEIPT,JSON.stringify({rows},null,2));
