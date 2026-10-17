'use strict';
// Design-contract research: FIRST L4/L5 unlock is a round-changing spike.
// Does not patch live rules. Opposite team begins one tier below, NOT already L4.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const live=read('v3/legacy-sim-core.js'),ult=read('v3/ultimate-abilities.js'),evo=read('v3/evolution-rules.js');
const roles=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const graphSource=read('tools/qa/check-role-fronts-baseline.cjs');
const first=graphSource.indexOf('const cell='),last=graphSource.indexOf('// Synthetic truth fixtures',first);
assert(first>=0&&last>first,'authentic physical HP damage-front graph moved');
const damageFronts=vm.runInNewContext(graphSource.slice(first,last)+';damageFronts',{Math});
const anchor='const dealt=Math.min(t.hp,dmg);';
assert.equal(live.split(anchor).length,2,'physical HP observer anchor drift');
const witnessed=live.replace(anchor,anchor+
 'if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,attacker:a.id,team:a.team,target:t.id,role:a.type,damage:dealt,x:t.x,y:t.y});');
const choices=['hold','firstUnlock','matchedUnlock','foeDouble'];
const seeds=[1337,2017];
function prototype(role){
 const supports=roles.filter(x=>x!==role);
 return [role,supports[0],supports[1],role,supports[2],supports[3],supports[4],role,supports[5],supports[6]];
}
function build(c,team,choice){
 const us=team===c.side,raw=prototype(c.role),prior=c.level,advanced=c.level+1;
 if(choice==='overwhelmed'){
  if(us)return Array.from({length:3},(_,i)=>({type:c.role,level:advanced,squad:i}));
  return Array.from({length:15},(_,i)=>({type:raw[(i+2)%10],level:prior,squad:Math.floor(i/5)}));
 }
 const size=c.count/2;
 const army=Array.from({length:size},(_,i)=>{
  const type=raw[i%10],target=type===c.role;
  const evolved=target&&((us&&choice!=='hold')||(!us&&choice==='matchedUnlock'));
  return{type,level:evolved?advanced:prior,squad:Math.floor(i/5)};
 });
 if(!us&&choice==='foeDouble')for(let i=0;i<size/10*3;i++)
  army.push({type:c.role,level:prior,squad:100});
 return army;
}
function simulate(c,choice,observed=true,trace=false){
 let time=0,next=0,queue=new Map(),state=null,errors=[],hits=[];
 const hash=trace?crypto.createHash('sha256'):null;
 const env={window:null,Math,performance:{now:()=>time},
  requestAnimationFrame(cb){const id=++next;queue.set(id,cb);return id},
  cancelAnimationFrame(id){queue.delete(id)},
  console:{error:(...a)=>errors.push(a.join(' '))}};
 env.window=env;env.__qaHit=x=>hits.push(x);
 vm.createContext(env);vm.runInContext(evo,env);vm.runInContext(ult,env);
 vm.runInContext(observed?witnessed:live,env);
 const blue=build(c,'blue',choice),red=build(c,'red',choice),sim=env.LegacySimCore;
 sim.configure({seed:c.seed,speed:10,onState:()=>{}});
 sim.deploy(blue,red);
 const selected=new Set(sim.getState().units.filter(u=>u.team===c.side&&u.type===c.role).map(u=>u.id));
 const wanted=choice==='overwhelmed'?3:c.count/2/10*3;
 assert.equal(selected.size,wanted,'physical chosen-role count must be correct');
 assert(sim.getState().units.filter(u=>selected.has(u.id)).every(u=>u.level===(choice==='hold'?c.level:c.level+1)),
 'entire selected family must upgrade, no hidden un-evolved same-family copies');
 const expected=blue.length+red.length;
 assert.equal(sim.getState().units.length,expected,'exact counter population');
 sim.setRunning(true);
 for(let frame=0;frame<1000;frame++){
  time+=16.667;const pending=[...queue.values()];queue.clear();for(const cb of pending)cb(time);
  state=sim.getState();if(hash)hash.update(JSON.stringify(state)+'\n');
  if(state.winner)break;
 }
 assert.deepEqual(errors,[],'source core error');
 assert(state?.winner,'genuine full-terminal result required '+JSON.stringify({c,choice}));
 const digest=hash?.digest('hex');
 if(!observed)return{digest,winner:state.winner};
 const front=damageFronts(hits,state.tick,30);
 const hp=filter=>+hits.filter(filter).reduce((n,h)=>n+h.damage,0).toFixed(2);
 return{digest,winner:state.winner,win:+(state.winner===c.side),units:expected,ticks:state.tick,
  selectedRealHp:hp(x=>selected.has(x.attacker)),
  allyRealHp:hp(x=>x.team===c.side),
  enemyRealHp:hp(x=>x.team!==c.side),
  selectedPositiveHits:hits.filter(x=>selected.has(x.attacker)).length,
  genuinePersistentFronts:front.consecutivePersistentMultiFrontWindows,
  realSeparateHpWindows:front.windowsWithTwoGeographicallySeparatedDamageComponents};
}
const matched=[];
for(const role of roles)for(const level of [3,4])
 for(const count of [20,40])for(const seed of seeds)
 for(const side of ['blue','red']){
  const fixture={role,level,count,seed,side},variants={};
  for(const choice of choices)variants[choice]=simulate(fixture,choice);
  matched.push({fixture,variants});
 }
assert.equal(matched.length,160);
const exceptions=[];
for(const role of roles)for(const level of [3,4])
 for(const seed of seeds)for(const side of ['blue','red']){
  const fixture={role,level,count:20,seed,side};
  exceptions.push({fixture,result:simulate(fixture,'overwhelmed')});
 }
assert.equal(exceptions.length,80);
let parity=0;
for(const role of ['knight','assassin','turtle','sniper'])
 for(const level of [3,4])for(const choice of ['hold','firstUnlock','foeDouble']){
  const f={role,level,count:20,seed:2017,side:'red'};
  assert.equal(simulate(f,choice,true,true).digest,simulate(f,choice,false,true).digest,
   'source observer must preserve every original RAF physical state '+JSON.stringify({f,choice}));parity++;
 }
assert.equal(parity,24);
function sum(rows){
 const out={matchedGroups:rows.length};
 for(const choice of choices){
  const a=rows.map(x=>x.variants[choice]),total=key=>+a.reduce((n,x)=>n+x[key],0).toFixed(2);
  out[choice]={wins:total('win'),winRatePercent:+(total('win')*100/a.length).toFixed(1),
   targetPhysicalHp:total('selectedRealHp'),allyPhysicalHp:total('allyRealHp'),
   truePersistentFronts:total('genuinePersistentFronts'),separatedHpWindows:total('realSeparateHpWindows')};
 }
 out.firstUnlockNewWins=rows.filter(x=>!x.variants.hold.win&&x.variants.firstUnlock.win).length;
 out.firstUnlockLostWins=rows.filter(x=>x.variants.hold.win&&!x.variants.firstUnlock.win).length;
 out.firstUnlockStillWinsVsFoeDouble=out.foeDouble.wins;
 return out;
}
const summary={all:sum(matched)};
for(const level of [3,4])summary['first-L'+(level+1)]=sum(matched.filter(x=>x.fixture.level===level));
for(const role of roles)for(const level of [3,4])
 summary[role+'-L'+(level+1)]=sum(matched.filter(x=>x.fixture.role===role&&x.fixture.level===level));
const outnumbered={};
for(const level of [3,4])outnumbered['first-L'+(level+1)]={
 fights:exceptions.filter(x=>x.fixture.level===level).length,
 wins:exceptions.filter(x=>x.fixture.level===level&&x.result.win).length};
const verdict={
 status:'SOURCE-REAL DESIGN AUDIT — DOES NOT SHIP ABILITIES OR REWRITE TEST WINNER FLOORS',
 intent:'L4/L5 should be a round-changing first-to-tier power spike. Distinguish equal-count advantage from peer unlock and ×2 family reinforcement or overwhelming numerical disadvantage. User reference to original Draft Showdown is a qualitative intended experience, not a measured APK binary spec.',
 protocol:'For each of 10 families, L3-to-L4 and L4-to-L5, 20/40 total bodies, 1337/2017 seeds and both side assignments, use symmetrical mirror mixed units with three/six chosen family copies per side. Four complete-match options: hold both at prior tier, firstUnlock chosen family alone to higher tier, matchedUnlock BOTH teams chosen family to higher tier, foeDouble chosen family on lower-tier enemy army doubled to six/twelve while first side evolves. This is 160 matched groups and 640 full terminal battles. An additional 80 true terminal numerical exceptions pit three evolved fighter copies against 15 mixed prior-tier enemies. 24 read-only observed/raw complete-RAF SHA pairs. True physical hit attribution and connected separate positive-HP-damage graph, not distance or Node FPS.',
 caveats:'Mirrored seed/side are correlated; controlled fixtures cannot guarantee a universal win rate. A matched enemy tier or ×2 is a legitimate gameplay counter, not a test failure. Do not mark expected purposeful winner flips as regression errors. Existing cross-level role counters and dense-population safety still matter.',
 parity,summary,outnumbered,matched,exceptions
};
if(process.env.QA_TIER_SPIKE_RECEIPT)
 fs.writeFileSync(process.env.QA_TIER_SPIKE_RECEIPT,JSON.stringify(verdict,null,2)+'\n');
console.log('FIRST-TO-ULTIMATE EVOLUTION SUMMARY '+JSON.stringify({summary,outnumbered}));
console.log('PASS: 720 genuinely complete source-match variants, 24 read-only full-RAF physics parity pairs');
