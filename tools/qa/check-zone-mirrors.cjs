// Turn 5H: isolated deployment formation variant diagnostic; never patches runtime.
'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'../..'),read=n=>fs.readFileSync(path.join(root,'v3',n+'.js'),'utf8'),source=read('legacy-sim-core');
const anchor='Math.min(9,Math.max(3,Math.ceil(Math.sqrt(group.length)*1.55)))';
assert(source.includes(anchor),'deployment lane anchor changed');
const vertical='Math.min(.065,.50/Math.max(4,lanes-1))',depth='xStep=.035';
assert(source.includes(vertical)&&source.includes(depth));
const lanePlacement='y=.5+(col-(cols-1)/2)*yStep+(rnd()-.5)*.009';
assert(source.includes(lanePlacement));
const spread=(mult)=>source.replace(lanePlacement,`y=.5+((e.squad%3)-1)*${mult}+(col-(cols-1)/2)*yStep*.35+(rnd()-.5)*.009`);
const focus=(weight)=>spread('.32').replace('s=d+Math.max(0,pressure-2)*.035',`s=d+Math.max(0,pressure-2)*.035+(Math.abs(v.y-u.y)>.22?${weight}:0)`);
const variants=[['baseline',source],['local08',focus('.08')]]
const types=['knight','goose','assassin','sniper','dragon','beetank','mole','turtle','goblin','barbarian'];
function run(code,count,seed,mirror){
 let now=0,next=0,queue=new Map(),errors=[],s;const env={window:null,Math,performance:{now:()=>now},requestAnimationFrame:f=>{const id=++next;queue.set(id,f);return id},cancelAnimationFrame:id=>queue.delete(id),console:{error:(...a)=>errors.push(a.join(' '))},CustomEvent:class{},dispatchEvent(){}};
 env.window=env;vm.createContext(env);for(const name of ['evolution-rules','ultimate-abilities'])vm.runInContext(read(name),env);vm.runInContext(code,env);
 const core=env.LegacySimCore,roster=side=>Array.from({length:count/2},(_,i)=>({type:types[(i*3+((mirror?side==='blue':side==='red')?5:0))%10],level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
 core.configure({seed,speed:10,onState:x=>{s=x}});core.deploy(roster('blue'),roster('red'));
 function metric(){const u=core.getState().units.filter(x=>x.hp>0),byTeam={};
  for(const team of ['blue','red']){const a=u.filter(x=>x.team===team),pairs=a.length*(a.length-1)/2;let near=0;
   for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++)if(Math.abs(a[i].x-a[j].x)<.055&&Math.abs(a[i].y-a[j].y)<.07)near++;
   byTeam[team]={alive:a.length,near,pairRatio:pairs?near/pairs:0,spanY:a.length?Math.max(...a.map(x=>x.y))-Math.min(...a.map(x=>x.y)):0};}
  return{alive:u.length,byTeam,nearTotal:byTeam.blue.near+byTeam.red.near,normalized:(byTeam.blue.pairRatio+byTeam.red.pairRatio)/2};}
 const sector=()=>{const us=core.getState().units.filter(u=>u.hp>0),bands=[0,1,2].map(i=>{const members=us.filter(u=>Math.min(2,Math.floor(u.y*3))===i),b=members.filter(u=>u.team==='blue'),r=members.filter(u=>u.team==='red');let contacts=0;for(const x of b)for(const y of r)if(Math.hypot(x.x-y.x,x.y-y.y)<.12)contacts++;return{alive:members.length,blue:b.length,red:r.length,contacts};});return bands};
 const sectors={deploy:sector()};let firstDamageFrame=null,firstContactFrame=null;const hp0=core.getState().units.reduce((a,u)=>a+u.hp,0);
 const deploy=metric();core.setRunning(true);let frames=0,ending=null;
 for(let f=0;f<1600;f++){frames=f+1;now+=16.667;const batch=[...queue.values()];queue.clear();for(const cb of batch)cb(now);if(f%15===14){const ss=sector();if(firstContactFrame===null&&ss.some(z=>z.contacts>0))firstContactFrame=f+1;if(firstDamageFrame===null&&core.getState().units.reduce((a,u)=>a+u.hp,0)<hp0-1)firstDamageFrame=f+1;if(f===89)sectors.early=ss;if(f===179)sectors.contact=ss;if(f===359)sectors.mid=ss}if(core.getState().winner){ending=core.getState().winner;break}}
 const mid=metric(),state=core.getState();assert.deepStrictEqual(errors,[]);
 return{deploy,mid,tick:state.tick,winner:state.winner||ending,frames,remaining:state.units.filter(u=>u.hp>0).length,sectors,firstDamageFrame,firstContactFrame};
}
const rows=[];for(const count of [40,80,120])for(const seed of [1337,7301,27919,45121])for(const mirror of [false,true]){const versions={};for(const [name,src]of variants)versions[name]=run(src,count,seed,mirror);rows.push({count,seed,mirror,versions});}
const receipt={note:'Paired full-duration 10x VM candidate/baseline, bounded at 1600 RAF frames; inspect uncompleted states and winners',rows};
if(process.env.QA_LANES_RECEIPT)fs.writeFileSync(process.env.QA_LANES_RECEIPT,JSON.stringify(receipt,null,2));
for(const name of ['baseline','local08']){let x=rows.map(r=>r.versions[name]);console.log(name+' terminal '+x.filter(t=>t.winner).length+'/'+x.length+' meanFrames '+(x.reduce((s,t)=>s+t.frames,0)/x.length).toFixed(1)+' winners '+JSON.stringify(x.map(t=>t.winner)));}
const flip=rows.filter(r=>r.versions.baseline.winner!==r.versions.local08.winner),nonterminal=rows.filter(r=>!r.versions.baseline.winner||!r.versions.local08.winner);console.log('winner divergence '+flip.length+'/'+rows.length+' nonterminal '+nonterminal.length);console.log('PASS: paired mirrored bounded full-match candidate receipt');
