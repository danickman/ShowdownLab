'use strict';
// QA-only B3 research: Assassin vanish coordinates and real backstab conversion.
// Tests a single-variable rearward sign change separately from closer landing.
// NEVER imported into the PWA; DO NOT promote from this script's result alone.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=n=>fs.readFileSync(path.join(root,'v3',n+'.js'),'utf8'),base=read('legacy-sim-core');
const orig="u.x=clamp(t.x+(u.team==='blue'?-.075:.075));u.y=clamp(t.y+(rnd()-.5)*.10);";
assert.equal(base.split(orig).length,2,'vanish anchor changed: review attack direction before experiments');
const variants={
 original:base,
 rearSameDistance:base.replace(orig,"u.x=clamp(t.x+(u.team==='blue'?.075:-.075));u.y=clamp(t.y+(rnd()-.5)*.10);"),
 rearMiddle:base.replace(orig,"u.x=clamp(t.x+(u.team==='blue'?.055:-.055));u.y=clamp(t.y+(rnd()-.5)*.08);"),
 rearClose:base.replace(orig,"u.x=clamp(t.x+(u.team==='blue'?.035:-.035));u.y=clamp(t.y+(rnd()-.5)*.06);")
};
const hitAnchor='const dealt=Math.min(t.hp,dmg);',stepAnchor='}separate(false)}function winner(){';
function observe(src){
 assert.equal(src.split(hitAnchor).length,2,'hurt() signature changed');
 assert.equal(src.split(stepAnchor).length,2,'end of step changed');
 return src.replace(hitAnchor,hitAnchor+
 "if(dealt>0&&a&&a.team!==t.team)window.__qaHit({tick,id:a.id,role:a.type,team:a.team,level:a.level,damage:dealt,kill:dealt>=t.hp});")
 .replace(stepAnchor,'}window.__qaTick(tick,units);separate(false)}function winner(){');
}
const types=['knight','sniper','dragon','assassin','beetank','mole','turtle','goblin','barbarian','goose'];
const families={
 mixed:{blue:types,red:types.slice().reverse()},
 assassinAccess:{blue:['assassin','assassin','assassin','knight','goblin','mole','sniper','dragon','beetank','goose'],red:['sniper','dragon','sniper','turtle','knight','beetank','goose','goblin','barbarian','mole']},
 ranged:{blue:['sniper','dragon','sniper','knight','turtle','assassin','goose','beetank','goblin','mole'],red:['sniper','dragon','dragon','knight','beetank','assassin','goblin','goose','barbarian','turtle']}
};
const roster=(cfg,side)=>Array.from({length:cfg.count/2},(_,i)=>{
 const actual=cfg.mirror?(side==='blue'?'red':'blue'):side,pattern=families[cfg.mode][actual];
 return{type:pattern[i%10],level:[1,2,3,4,5][i%5],squad:Math.floor(i/6)};
});
function run(code,cfg,observed=true){
 let now=0,next=0,q=new Map(),hits=[],actions={stalk:0,vanish:0,backstab:0,disengage:0},landings={all:0,fieldRear:0,nominalReach:0},aliveTicks=0,errors=[];
 const hash=crypto.createHash('sha256');
 const env={window:null,Math,performance:{now:()=>now},requestAnimationFrame(fn){let id=++next;q.set(id,fn);return id},
  cancelAnimationFrame(id){q.delete(id)},console:{error:(...a)=>errors.push(a.join(' '))}};
 env.window=env;env.__qaHit=h=>hits.push(h);
 env.__qaTick=(tick,units)=>{
  const lookup=new Map(units.map(u=>[u.id,u]));
  for(const u of units){
   if(u.type!=='assassin'||u.hp<=0)continue;
   aliveTicks++;
   if(Object.hasOwn(actions,u.action))actions[u.action]++;
   if(u.action==='vanish'){
    const target=lookup.get(u.target);if(!target||target.hp<=0)continue;
    landings.all++;
    if((u.x-target.x)*(u.team==='blue'?1:-1)>0)landings.fieldRear++;
    if(Math.hypot(u.x-target.x,u.y-target.y)<=u.range/500)landings.nominalReach++;
   }
  }
 };
 vm.createContext(env);
 for(const n of ['evolution-rules','ultimate-abilities'])vm.runInContext(read(n),env,{filename:n+'.js'});
 vm.runInContext(observed?observe(code):code,env,{filename:'assassin-rear-qa.js'});
 const core=env.LegacySimCore;
 core.configure({seed:cfg.seed,speed:cfg.speed,onState:()=>{}});
 core.deploy(roster(cfg,'blue'),roster(cfg,'red'));core.setRunning(true);
 let frameCount=0;
 for(let i=0;i<cfg.frames;i++){
  frameCount++;now+=16.667;const tasks=[...q.values()];q.clear();for(const f of tasks)f(now);
  const state=core.getState();hash.update(JSON.stringify(state)+'\n');if(state.winner)break;
 }
 assert.deepEqual(errors,[],'RC4 emitted error at '+JSON.stringify(cfg));
 const end=core.getState(),assassin=hits.filter(h=>h.role==='assassin'),allDamage=hits.reduce((n,h)=>n+h.damage,0);
 return{digest:hash.digest('hex'),lastTick:end.tick,winner:end.winner||null,frames:frameCount,
  assassinDamage:+assassin.reduce((n,h)=>n+h.damage,0).toFixed(2),assassinHits:assassin.length,
  assassinKills:assassin.filter(h=>h.kill).length,assassinAliveTicks:aliveTicks,
  assassinDamagePer1000AliveTicks:+(assassin.reduce((n,h)=>n+h.damage,0)*1000/Math.max(1,aliveTicks)).toFixed(2),
  assassinShareOfFighterDamage:+(assassin.reduce((n,h)=>n+h.damage,0)/Math.max(1,allDamage)).toFixed(4),
  allFighterDamage:+allDamage.toFixed(2),allFighterHits:hits.length,
  actions,landings,
  alive:{blue:end.units.filter(u=>u.team==='blue'&&u.hp>0).length,red:end.units.filter(u=>u.team==='red'&&u.hp>0).length},
  remainingHp:{blue:+end.units.filter(u=>u.team==='blue').reduce((n,u)=>n+u.hp,0).toFixed(1),red:+end.units.filter(u=>u.team==='red').reduce((n,u)=>n+u.hp,0).toFixed(1)}};
}
const all=[];
for(const count of (process.env.QA_ASSASSIN_COUNTS||'40,80,120').split(',').map(Number)){
 assert([40,80,120].includes(count),'unsupported count');
 const modes=count===120?['mixed','assassinAccess']:Object.keys(families);
 for(const mode of modes)for(const seed of (count===120?[1337]:[1337,9917]))for(const mirror of [false,true]){
  all.push({count,mode,seed,mirror,speed:4,frames:count===120?55:count===80?64:76});
 }
}
const report={status:'purely QA gameplay design A/B: no runtime or live balancing change',
 caveats:'Field-direction rear is not a measured facing vector. Short unfinished battles are censored, not win-rate outcomes. Damage source is fighter-attributed positive hurt(); burn/uncredited spell and non-damage support are excluded. Candidate changes opportunity and entire fight RNG trajectories, so compare opponent counterplay across larger seeds before promotion.',
 variants:['original','rearSameDistance','rearMiddle','rearClose'],
 variantsMeaning:'Original teleports toward attacker side ±0.075. rearSameDistance flips SIGN only, retaining absolute 0.075 and identical y jitter. rearMiddle and rearClose also reduce spacing, are distinct hypotheses.',
 rows:[],summary:{},paritySmoke:true};
const smoke={count:40,mode:'mixed',seed:1337,mirror:false,speed:4,frames:32};
assert.equal(run(base,smoke,false).digest,run(base,smoke,true).digest,'QA hook changed unmodified source state');
for(const cfg of all){
 const variations={};
 for(const [name,source] of Object.entries(variants)){const row=run(source,cfg);const {digest,...metrics}=row;variations[name]=metrics}
 report.rows.push({...cfg,variations});
 const o=variations.original,r=variations.rearSameDistance;
 console.log('ASSASSIN REAR CASE '+JSON.stringify({count:cfg.count,mode:cfg.mode,seed:cfg.seed,mirror:cfg.mirror,
  originalDamage:o.assassinDamage,rearSameDistanceDamage:r.assassinDamage,originalHits:o.assassinHits,rearHits:r.assassinHits,
  fieldRearOriginal:o.landings.fieldRear,fieldRearCandidate:r.landings.fieldRear}));
}
for(const key of report.variants){
 const rows=report.rows.map(r=>r.variations[key]);report.summary[key]={
  cases:rows.length,assassinDamage:+rows.reduce((n,x)=>n+x.assassinDamage,0).toFixed(1),
  assassinHits:rows.reduce((n,x)=>n+x.assassinHits,0),
  assassinKills:rows.reduce((n,x)=>n+x.assassinKills,0),
  backstabActionTicks:rows.reduce((n,x)=>n+x.actions.backstab,0),
  vanishActivations:rows.reduce((n,x)=>n+x.landings.all,0),
  fieldRearLandings:rows.reduce((n,x)=>n+x.landings.fieldRear,0),
  inNominalMeleeRangeAtLanding:rows.reduce((n,x)=>n+x.landings.nominalReach,0),
  casesWithAssassinDamage:rows.filter(x=>x.assassinDamage>0).length,
  casesWithTerminalWinner:rows.filter(x=>x.winner).length
 };
}
console.log('ASSASSIN REAR SUMMARY '+JSON.stringify(report.summary));
if(process.env.QA_ASSASSIN_RECEIPT)fs.writeFileSync(process.env.QA_ASSASSIN_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('PASS: QA-only controlled rear-vs-front landing and per-role damage/counterplay receipt; baseline hook exact parity');
