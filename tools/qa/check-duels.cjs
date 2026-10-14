// Turn 1: deterministic ordered full-roster duel baseline. Run: node tools/qa/check-duels.cjs
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const root=require('path').resolve(__dirname,'../..');
const read=f=>fs.readFileSync(root+'/v3/'+f+'.js','utf8');
let now=0,id=0,queue=new Map(),errors=[];
const ctx={window:null,Math,performance:{now:()=>now},requestAnimationFrame:f=>{const k=++id;queue.set(k,f);return k},cancelAnimationFrame:k=>queue.delete(k),CustomEvent:class{},dispatchEvent(){},console:{error:(...x)=>errors.push(x.join(' '))}};
ctx.window=ctx;vm.createContext(ctx);
for(const f of ['evolution-rules','ultimate-abilities','legacy-sim-core','simulation-adapter'])vm.runInContext(read(f),ctx,{filename:f+'.js'});
const A=ctx.ShowdownAdapter,types=Object.keys(A.BASE_COUNTS),results=[];
assert.equal(types.length,10,'ten fighter freeze');
for(const level of [1,4,5])for(const blue of types)for(const red of types){
  A.resetMatch(); // Preserve the core's scheduled RAF; it owns callback lifecycle.
  A.startMatch({blue:{[blue]:1},red:{[red]:1},blueLevels:{[blue]:level},redLevels:{[red]:level},blueLives:1,redLives:1,seed:1337});
  A.setSpeed(10);
  let frames=0;
  while(A.getState().phase!=='match_over'&&frames<1200){
    now+=16.667;const callbacks=[...queue.values()];queue.clear();
    for(const callback of callbacks)callback(now);
    frames++;
  }
  const s=A.getState(),pass=s.phase==='match_over'&&!!s.winner;
  results.push({blue,red,level,seed:1337,frames,phase:s.phase,winner:s.winner||null,pass,
    remaining:s.units.filter(u=>u.hp>0).map(u=>({team:u.team,type:u.type,hp:u.hp,x:u.x,action:u.action}))});
}
const failures=results.filter(x=>!x.pass);
const receipt={baseSha:process.env.QA_SHA||'0cb1a7db330017193d69d3ab63525ed9cdaca12e',rulesVersion:'v3',seed:1337,speed:10,frameMs:16.667,maxFrames:1200,matchups:results.length,passed:results.length-failures.length,failed:failures.length,failures,errors};
if(process.env.QA_RECEIPT)fs.writeFileSync(process.env.QA_RECEIPT,JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify(receipt,null,2));
if(failures.length||errors.length)process.exitCode=1;
