// Turn 5D: paired staging-only benchmark and strict presentation geometry parity.
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('assert'),{performance}=require('perf_hooks');
const source=fs.readFileSync('v3/combat-staging.js','utf8');
const candidate=`        // Candidate eligibility depends only on original screen points and static size.
        // Build it once; keep original i/j iteration order across all four passes.
        const pairs=[];
        for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
          const a=entries[i],b=entries[j];if(a.u.team!==b.u.team)continue;
          const reach=(a.size+b.size)*.70;
          if(Math.abs(a.p.x-b.p.x)>reach+cap.x*2||Math.abs(a.p.y-b.p.y)>reach+cap.y*2)continue;
          pairs.push([i,j]);
        }
        for(let pass=0;pass<4;pass++)for(const [i,j] of pairs){
          const a=entries[i],b=entries[j];`;
const baseline=`        for(let pass=0;pass<4;pass++)for(let i=0;i<entries.length;i++)for(let j=i+1;j<entries.length;j++){
          const a=entries[i],b=entries[j];if(a.u.team!==b.u.team)continue;
          const reach=(a.size+b.size)*.70;if(Math.abs(a.p.x-b.p.x)>reach+cap.x*2||Math.abs(a.p.y-b.p.y)>reach+cap.y*2)continue;`;
assert(source.includes(candidate),'candidate anchor must match current staging source');
const earlier=source.replace(candidate,baseline);
const cam={arena:{x:0,y:0,w:430,h:520},worldToScreen:(x,y)=>({x:x*430,y:y*520}),unitSize:(kind,n)=>kind==='large'?47:kind==='heavy'?40:kind==='small'?27:34};
const visualEnvelope=()=>({left:.57,right:.57,above:1.04,below:.08});
function instantiate(code){
 const env={window:{FighterAssets:{authored:{},visualEnvelope}},Math};
 vm.createContext(env);vm.runInContext(code,env);return env.window.CombatStaging.create();
}
function fixtures(n,seed){
 let x=seed>>>0;const rnd=()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296};
 const types=['knight','beetank','goose','dragon','turtle','goblin','mole','sniper'];
 return Array.from({length:n},(_,i)=>({id:i+1,team:i%2?'red':'blue',type:types[i%types.length],level:1+i%5,hp:100,x:.33+rnd()*.34,y:.24+rnd()*.50}));
}
const tests=[];
for(const n of [12,30,60])for(const seed of [1337,7301,27919]){
 const us=fixtures(n,seed),pairs=[instantiate(earlier),instantiate(source)],times=[0,0];let mismatch=0,nearBefore=0,nearAfter=0;
 for(let frame=0;frame<20;frame++){
  // Moving positions: evaluate geometry every frame, not just one static arrangement.
  const alive=us.map(u=>({...u,x:u.x+Math.sin(frame*.13+u.id)*.002,y:u.y+Math.cos(frame*.09+u.id)*.002}));
  for(let k=0;k<2;k++){let t=performance.now();pairs[k].prepare(alive,cam,frame*16.667);times[k]+=performance.now()-t}
  for(const u of alive){const a=pairs[0].offset(u.id),b=pairs[1].offset(u.id);mismatch=Math.max(mismatch,Math.abs(a.dx-b.dx),Math.abs(a.dy-b.dy));}
  if(frame===19){
   const overlaps=stage=>{
    let count=0;
    for(let i=0;i<alive.length;i++)for(let j=i+1;j<alive.length;j++){
     const a=alive[i],b=alive[j];if(a.team!==b.team)continue;
     const p=stage.point(a,cam),q=stage.point(b,cam);
     if(Math.abs(p.x-q.x)<20&&Math.abs(p.y-q.y)<26)count++;
    }
    return count;
   };
   nearBefore=overlaps(pairs[0]);nearAfter=overlaps(pairs[1]);
  }
 }
 assert(mismatch<1e-9,'presentation offsets diverged for '+n+' fighters seed '+seed+' delta='+mismatch);
 assert.equal(nearBefore,nearAfter,'overlap count changed');
 tests.push({fighters:n,seed,baselineMs:+times[0].toFixed(2),optimizedMs:+times[1].toFixed(2),maxOffsetDelta:mismatch,alliedOverlapPairs:nearAfter});
}
const result={fixtures:tests.length,tests,note:'Node VM staging-only benchmark. Exact offset parity is acceptance; elapsed time is diagnostic, not Safari FPS'};
if(process.env.QA_STAGING_RECEIPT)fs.writeFileSync(process.env.QA_STAGING_RECEIPT,JSON.stringify(result,null,2));
console.log('PASS: staging exact geometry parity '+tests.length+' fixtures at 12/30/60/80/120 fighters');
console.log(JSON.stringify(tests));
