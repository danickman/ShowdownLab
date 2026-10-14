// Turn 5H: isolated deployment formation variant diagnostic; never patches runtime.
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'../..'),read=n=>fs.readFileSync(path.join(root,'v3',n+'.js'),'utf8'),source=read('legacy-sim-core');
const anchor='Math.min(9,Math.max(3,Math.ceil(Math.sqrt(group.length)*1.55)))';
assert(source.includes(anchor),'deployment lane anchor changed');
const variants=[['baseline',source],['lanes12',source.replace(anchor,'Math.min(12,Math.max(3,Math.ceil(Math.sqrt(group.length)*1.85)))')],['lanes15',source.replace(anchor,'Math.min(15,Math.max(3,Math.ceil(Math.sqrt(group.length)*2.15)))')]];
const types=['knight','goose','assassin','sniper','dragon','beetank','mole','turtle','goblin','barbarian'];
function run(code,count,seed){
 let now=0,next=0,queue=new Map(),errors=[],s;const env={window:null,Math,performance:{now:()=>now},requestAnimationFrame:f=>{const id=++next;queue.set(id,f);return id},cancelAnimationFrame:id=>queue.delete(id),console:{error:(...a)=>errors.push(a.join(' '))},CustomEvent:class{},dispatchEvent(){}};
 env.window=env;vm.createContext(env);for(const name of ['evolution-rules','ultimate-abilities'])vm.runInContext(read(name),env);vm.runInContext(code,env);
 const core=env.LegacySimCore,roster=side=>Array.from({length:count/2},(_,i)=>({type:types[(i*3+(side==='red'?5:0))%10],level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
 core.configure({seed,speed:1,onState:x=>{s=x}});core.deploy(roster('blue'),roster('red'));
 function metric(){const u=core.getState().units.filter(x=>x.hp>0),byTeam={};
  for(const team of ['blue','red']){const a=u.filter(x=>x.team===team),pairs=a.length*(a.length-1)/2;let near=0;
   for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(Math.abs(a[i].x-a[j].x)<.055&&Math.abs(a[i].y-a[j].y)<.07)near++;
   byTeam[team]={alive:a.length,near,pairRatio:pairs?near/pairs:0,spanY:a.length?Math.max(...a.map(x=>x.y))-Math.min(...a.map(x=>x.y)):0};}
  return{alive:u.length,byTeam,nearTotal:byTeam.blue.near+byTeam.red.near,normalized:(byTeam.blue.pairRatio+byTeam.red.pairRatio)/2};}
 const deploy=metric();core.setRunning(true);
 for(let f=0;f<360;f++){now+=16.667;const batch=[...queue.values()];queue.clear();for(const cb of batch)cb(now)}
 const mid=metric(),state=core.getState();assert.deepStrictEqual(errors,[]);
 return{deploy,mid,tick:state.tick,winner:state.winner};
}
const rows=[];for(const count of [40,80,120])for(const seed of [1337,7301,27919]){const versions={};for(const [name,src]of variants)versions[name]=run(src,count,seed);rows.push({count,seed,versions});}
const avg=(name,field,phase='deploy')=>rows.reduce((sum,r)=>sum+r.versions[name][phase][field],0)/rows.length;
const receipt={note:'Isolated VM variants of deployment lanes; 360 simulation frames, not full terminal matches; geometry-only diagnostic and balance impact is NOT verified',rows};
if(process.env.QA_LANES_RECEIPT)fs.writeFileSync(process.env.QA_LANES_RECEIPT,JSON.stringify(receipt,null,2));
for(const name of variants.map(v=>v[0]))console.log(name+' near deploy '+avg(name,'nearTotal').toFixed(2)+' normalized '+avg(name,'normalized').toFixed(4)+' mid '+avg(name,'nearTotal','mid').toFixed(2));
console.log('PASS 9 matched deployment variant fixtures, baseline + 2 candidates (diagnostics, not gameplay acceptance)');
