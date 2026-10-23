// Read-only combat distribution profiler: deployment vs pursuit. No runtime modification.
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'../..'),read=n=>fs.readFileSync(path.join(root,'v3',n+'.js'),'utf8');
const types=['knight','goose','assassin','sniper','dragon','beetank','mole','turtle','goblin','barbarian'];
function profile(n,seed){
 let now=0,next=0,queue=new Map();const env={Math,window:null,performance:{now:()=>now},requestAnimationFrame:cb=>{const id=++next;queue.set(id,cb);return id},cancelAnimationFrame:id=>queue.delete(id),console,CustomEvent:class{},dispatchEvent(){}};
 env.window=env;vm.createContext(env);for(const m of ['evolution-rules','ultimate-abilities','legacy-sim-core'])vm.runInContext(read(m),env);
 const core=env.LegacySimCore;core.configure({seed,speed:1,onState:()=>{}});
 const roster=team=>Array.from({length:n/2},(_,i)=>({type:types[(i*3+(team==='red'?5:0))%10],level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
 core.deploy(roster('blue'),roster('red'));const initial=core.getState();core.setRunning(true);
 function measure(label){
  const state=core.getState(),units=state.units.filter(u=>u.hp>0),perTeam={},pairs={allied:0,enemy:0},contact=[];
  for(const team of ['blue','red']){
   const arr=units.filter(u=>u.team===team);
   const xs=arr.map(u=>u.x),ys=arr.map(u=>u.y);
   const min=values=>values.length?Math.min(...values):0,max=values=>values.length?Math.max(...values):0;
   const spreadY=max(ys)-min(ys),spreadX=max(xs)-min(xs),bins=new Set(arr.map(u=>Math.floor(u.y/.045)));
   const front=arr.filter(u=>!['sniper','dragon'].includes(u.type));
   perTeam[team]={count:arr.length,spanX:+spreadX.toFixed(3),spanY:+spreadY.toFixed(3),distinctYBands:bins.size,frontCount:front.length};
  }
  for(let i=0;i<units.length;i++)for(let j=i+1;j<units.length;j++){
   const a=units[i],b=units[j],dx=Math.abs(a.x-b.x),dy=Math.abs(a.y-b.y);
   if(dx<.055&&dy<.07){if(a.team===b.team)pairs.allied++;else pairs.enemy++;}
  }
  return{label,tick:state.tick,alive:units.length,perTeam,pairs};
 }
 const samples=[measure('deployment')];for(let f=0;f<360;f++){
  now+=16.667;const callbacks=[...queue.values()];queue.clear();for(const callback of callbacks)callback(now);
  if([59,179,359].includes(f))samples.push(measure(f===59?'early':f===179?'contact-window':'midfight'));
 }
 return{n,seed,samples};
}
const rows=[];for(const n of [20,40,60,80,120])for(const seed of [1337,7301,27919])rows.push(profile(n,seed));
assert.equal(rows.length,15);assert(rows.every(x=>x.samples.length===4&&x.samples.every(s=>Number.isFinite(s.pairs.allied))));
const output={method:'actual unmodified LegacySimCore at 1x; deployment and frames 60/180/360; center-nearness proxy only',rows};
if(process.env.QA_FORMATION_RECEIPT)fs.writeFileSync(process.env.QA_FORMATION_RECEIPT,JSON.stringify(output,null,2));
for(const n of [20,40,60,80,120]){const subset=rows.filter(r=>r.n===n),avg=(stage,key)=>subset.reduce((s,r)=>s+r.samples[stage].pairs[key],0)/3;
 console.log(n+' fighters allied close pairs deployment/early/contact/midfight '+[0,1,2,3].map(i=>avg(i,'allied').toFixed(1)).join('/'));}
console.log('PASS: 15 real-core deployment/pursuit distribution scenarios');
