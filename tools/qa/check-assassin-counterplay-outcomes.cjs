'use strict';
// Isolated B3 counterplay test, unchanged shipped RC4 vs sign-only rear vanish.
// This is design research and NEVER changes production or QA runtime behavior.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=x=>fs.readFileSync(path.join(root,'v3',x+'.js'),'utf8'),base=read('legacy-sim-core');
const before="u.x=clamp(t.x+(u.team==='blue'?-.075:.075));u.y=clamp(t.y+(rnd()-.5)*.10);";
const after="u.x=clamp(t.x+(u.team==='blue'?.075:-.075));u.y=clamp(t.y+(rnd()-.5)*.10);";
assert.equal(base.split(before).length,2,'Assassin source anchor changed, review game implementation');
const rear=base.replace(before,after),hit='const dealt=Math.min(t.hp,dmg);',step='}separate(false)}function winner(){';
const observe=code=>{
 assert.equal(code.split(hit).length,2,'damage attribution anchor changed');
 assert.equal(code.split(step).length,2,'tick measurement anchor changed');
 return code.replace(hit,hit+"if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,source:a.id,team:a.team,role:a.type,target:t.id,damage:dealt,kill:dealt>=t.hp});")
 .replace(step,'}window.__qaTick(tick,units);separate(false)}function winner(){');
};
const all=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const scenarios={
 mixed:{blue:all,red:all.slice().reverse()},
 heavyGuard:{blue:['assassin','assassin','assassin','goose','goblin','sniper','dragon','knight','beetank','mole'],
  red:['knight','knight','beetank','turtle','goose','dragon','sniper','barbarian','turtle','mole']},
 backline:{blue:['assassin','assassin','assassin','assassin','knight','goblin','mole','sniper','dragon','goose'],
  red:['sniper','sniper','dragon','dragon','goose','sniper','goblin','goose','sniper','mole']},
 swarm:{blue:['assassin','assassin','goose','goblin','goblin','goblin','knight','sniper','mole','barbarian'],
  red:['goblin','goose','goblin','goblin','turtle','beetank','sniper','dragon','knight','mole']}
};
const makeRoster=(test,side)=>Array.from({length:test.count/2},(_,i)=>{
 const actual=test.mirror?(side==='blue'?'red':'blue'):side;
 return{type:scenarios[test.mode][actual][i%10],level:[1,4,5,2,3][i%5],squad:Math.floor(i/6)};
});
function duel(code,test,observer=true){
 let now=0,req=0,queue=new Map(),errors=[],hitEvents=[],vanish={total:0,behind:0,nominalReach:0},actions={stalk:0,backstab:0,disengage:0},lastTick=0,final=null;
 const trace=crypto.createHash('sha256');
 const env={window:null,Math,performance:{now:()=>now},requestAnimationFrame(fn){const id=++req;queue.set(id,fn);return id},
  cancelAnimationFrame(i){queue.delete(i)},console:{error:(...args)=>errors.push(args.join(' '))}};
 env.window=env;env.__qaHit=h=>hitEvents.push(h);env.__qaTick=(tick,units)=>{
  const index=new Map(units.map(u=>[u.id,u]));
  for(const u of units){if(u.hp<=0||u.type!=='assassin')continue;
   if(Object.hasOwn(actions,u.action))actions[u.action]++;
   if(u.action==='vanish'){
    vanish.total++;const t=index.get(u.target);if(t&&t.hp>0){
     if((u.x-t.x)*(u.team==='blue'?1:-1)>0)vanish.behind++;
     if(Math.hypot(u.x-t.x,u.y-t.y)<=u.range/500)vanish.nominalReach++;
    }
   }
  }
 };
 vm.createContext(env);
 for(const dep of ['evolution-rules','ultimate-abilities'])vm.runInContext(read(dep),env,{filename:dep+'.js'});
 vm.runInContext(observer?observe(code):code,env,{filename:'assassin-fairness-vm.js'});
 const sim=env.LegacySimCore;
 sim.configure({seed:test.seed,speed:10,onState:()=>{}});
 sim.deploy(makeRoster(test,'blue'),makeRoster(test,'red'));sim.setRunning(true);
 let frames=0;
 for(let i=0;i<test.frames;i++){
  now+=16.667;frames++;const batch=[...queue.values()];queue.clear();
  for(const fn of batch)fn(now);
  final=sim.getState();lastTick=final.tick;trace.update(JSON.stringify(final)+'\n');if(final.winner)break;
 }
 assert.deepEqual(errors,[],'game threw exception in '+JSON.stringify(test));
 const hash=trace.digest('hex');
 if(!observer)return{hash,frames,lastTick,winner:final.winner||null};
 const byRole={},byTeam={blue:0,red:0};
 for(const h of hitEvents){byRole[h.role]=(byRole[h.role]||0)+h.damage;byTeam[h.team]+=h.damage;}
 const assassinEvents=hitEvents.filter(h=>h.role==='assassin');
 const teams=Object.fromEntries(['blue','red'].map(team=>{
  const units=final.units.filter(u=>u.team===team);
  return[team,{alive:units.filter(u=>u.hp>0).length,hp:+units.reduce((n,u)=>n+u.hp,0).toFixed(2),
   assassinAlive:units.filter(u=>u.hp>0&&u.type==='assassin').length,
   sniperAlive:units.filter(u=>u.hp>0&&u.type==='sniper').length,
   dragonAlive:units.filter(u=>u.hp>0&&u.type==='dragon').length}];
 }));
 const ownTeam=test.mirror?'red':'blue';
 return{hash,frames,lastTick,winner:final.winner||null,censored:!final.winner,
  totalFighterDamage:+hitEvents.reduce((n,h)=>n+h.damage,0).toFixed(1),
  assassinDamage:+assassinEvents.reduce((n,h)=>n+h.damage,0).toFixed(1),assassinHits:assassinEvents.length,assassinKills:assassinEvents.filter(h=>h.kill).length,
  assassinShare:+(assassinEvents.reduce((n,h)=>n+h.damage,0)/Math.max(1,hitEvents.reduce((n,h)=>n+h.damage,0))).toFixed(4),
  byRole:Object.fromEntries(Object.entries(byRole).map(([k,v])=>[k,+v.toFixed(1)])),
  teamFighterDamage:Object.fromEntries(Object.entries(byTeam).map(([k,v])=>[k,+v.toFixed(1)])),
  assassinStartingSide:ownTeam,teams,vanish,actions};
}
// Baseline read-only instrumentation must never alter game state.
// Variants are intentionally gameplay-altering; identical traces are NOT expected between them.
for(const cfg of [{count:20,mode:'mixed',seed:1337,mirror:false,frames:70},
 {count:40,mode:'heavyGuard',seed:9917,mirror:true,frames:20}]){
 const a=duel(base,cfg,false),b=duel(base,cfg,true);assert.equal(a.hash,b.hash,'baseline observer changed actual RC4 simulator');
}
const counts=(process.env.QA_ASSASSIN_FAIR_COUNTS||'20,40,80').split(',').map(Number);
assert(counts.length>0&&counts.every(n=>[20,40,80].includes(n)));
const tests=[];
for(const count of counts){
 const modes=count===80?['mixed','heavyGuard','backline']:Object.keys(scenarios);
 for(const mode of modes)for(const seed of [1337,9917])for(const mirror of [false,true])
  tests.push({count,mode,seed,mirror,frames:count===80?38:count===40?95:150});
}
const rows=[];
for(const cfg of tests){
 const control=duel(base,cfg),candidate=duel(rear,cfg);
 const {hash:controlHash,...o}=control,{hash:candidateHash,...v}=candidate;
 rows.push({...cfg,original:o,rearSignOnly:v});
 console.log('ASSASSIN COUNTERPLAY '+JSON.stringify({count:cfg.count,mode:cfg.mode,mirror:cfg.mirror,seed:cfg.seed,
  controlDamage:o.assassinDamage,candidateDamage:v.assassinDamage,controlWinner:o.winner,candidateWinner:v.winner,
  baselineFront:o.vanish.behind,changedRear:v.vanish.behind,assassinKills:v.assassinKills}));
}
const summary={};
for(const key of ['original','rearSignOnly']){
 const rowsAt=rows.map(x=>x[key]);summary[key]={
  cases:rowsAt.length,assassinDamage:+rowsAt.reduce((n,x)=>n+x.assassinDamage,0).toFixed(1),
  assassinHits:rowsAt.reduce((n,x)=>n+x.assassinHits,0),assassinKills:rowsAt.reduce((n,x)=>n+x.assassinKills,0),
  vanishActivations:rowsAt.reduce((n,x)=>n+x.vanish.total,0),rearLandings:rowsAt.reduce((n,x)=>n+x.vanish.behind,0),
  totalFighterDamage:+rowsAt.reduce((n,x)=>n+x.totalFighterDamage,0).toFixed(1),
  casesWithWinners:rowsAt.filter(x=>x.winner).length,
  blueWins:rowsAt.filter(x=>x.winner==='blue').length,redWins:rowsAt.filter(x=>x.winner==='red').length,
  casesWhereAssassinDidDamage:rowsAt.filter(x=>x.assassinHits).length,
  meanAssassinShare:+(rowsAt.reduce((n,x)=>n+x.assassinShare,0)/Math.max(1,rowsAt.length)).toFixed(4)
 };
}
const report={status:'QA-only gameplay counterplay A/B, no runtime changes',
 caveats:'Mixed levels and short time horizons; 20 fighters up to 1500 ticks, 40 up to 950, 80 up to 380. Terminal winners are censored for unfinished battles and cannot be treated as win rates. Any variant changes future RNG and entire combat; compare appropriate matchup and role cost instead of assuming parity.',
 comparisons:rows,summary,baselineObserverParity:true};
if(process.env.QA_ASSASSIN_FAIR_RECEIPT)fs.writeFileSync(process.env.QA_ASSASSIN_FAIR_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('ASSASSIN COUNTERPLAY SUMMARY '+JSON.stringify(summary));
console.log('PASS: counterplay study tracked rear access, real hits, kills, both team survivors and winners; shipped RC4 unchanged');
