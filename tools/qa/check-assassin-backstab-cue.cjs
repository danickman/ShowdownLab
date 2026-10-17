'use strict';
// Real Assassin backstab cue source regression. The added backstabTick stamp is
// presentation telemetry ONLY, never a change to rear vanish or attack damage.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const shipped=read('v3/legacy-sim-core.js'),renderer=read('v3/v3.js');
const oldAttack="u.action='backstab';hit(u,t,u.special>65?1.65:1.1);";
const newAttack="u.action='backstab';u.backstabTick=tick;hit(u,t,u.special>65?1.65:1.1);";
assert.equal(shipped.split(newAttack).length,2,'Assassin actual strike changed: re-verify event stamping');
const original=shipped.replace(newAttack,oldAttack);
const observed=shipped.replace(newAttack,"u.action='backstab';u.backstabTick=tick;window.__qaBackstab({tick,id:u.id});hit(u,t,u.special>65?1.65:1.1);");
const start=renderer.indexOf('function assassinBackstabOccurred('),end=renderer.indexOf('function spawnFX(next){',start);
assert(start>0&&end>start&&renderer.indexOf('function assassinBackstabOccurred(',start+1)<0,'Assassin cue helper must occur once');
const detected=vm.runInNewContext(renderer.slice(start,end)+';assassinBackstabOccurred',{Number});
assert(detected({backstabTick:3},{type:'assassin',backstabTick:5}));
assert(!detected({backstabTick:5},{type:'assassin',backstabTick:5}));
assert(!detected({backstabTick:3},{type:'knight',backstabTick:5}));
assert(!detected(null,{type:'assassin',backstabTick:undefined}));
assert(!detected({backstabTick:4},{type:'assassin',backstabTick:NaN}));
const marker=renderer.indexOf('if(u.hp>0&&assassinBackstabOccurred(old,u)'),after=renderer.indexOf('if(u.hp>0&&moleEruptionOccurred(old,u)',marker);
assert(marker>0&&after>marker,'true backstab renderer recovery not in spawnFX');
const visual=renderer.slice(marker,after);
for(const need of ["!(u.action==='backstab'&&old.action!==u.action)","density<=48","f.type==='assassin'","kind:'signatureBurst'","kind:'impactArc'","type:'assassin'","action:'backstab'","prefers-reduced-motion","density<30","density<14","!rapid","'STAB!'"])
 assert(visual.includes(need),'missing actual backstab cue limit '+need);
for(const forbidden of ["hit(","kind:'shot'","kind:'koBurst'","kind:'earthImpact'","u.hp=","shake=","flash=","t.hp="])
 assert(!visual.includes(forbidden),'do not fabricate successful backstab damage or other visual consequences '+forbidden);
assert(renderer.includes('eruptTick:u.eruptTick,backstabTick:u.backstabTick'),'prev snapshot must retain event stamp');
const A=['assassin','assassin','knight','assassin','dragon','goblin','assassin','turtle','mole','sniper'];
const B=['knight','beetank','goblin','sniper','turtle','dragon','knight','goose','barbarian','assassin'];
function test(src,{count,speed,mirror,seed},audit=false){
 let env={},now=0,id=0,q=new Map(),events=[],prev=null,stats={actual:0,transient:0,stamped:0,missed:0,falsePos:0,windows:0};
 const hash=crypto.createHash('sha256'),raf=fn=>{const i=++id;q.set(i,fn);return i};
 env.__qaBackstab=x=>events.push(x);
 for(const code of ['v3/evolution-rules.js','v3/ultimate-abilities.js',src]){
  const source=code.endsWith('.js')?read(code):code;
  new Function('window','performance','requestAnimationFrame','cancelAnimationFrame',source)(env,{now:()=>now},raf,i=>q.delete(i));
 }
 const roster=team=>Array.from({length:count/2},(_,i)=>({type:(mirror?(team==='blue'?B:A):(team==='blue'?A:B))[i%10],level:[1,2,4,5][i%4],squad:Math.floor(i/6)}));
 env.LegacySimCore.configure({seed,speed,onState:s=>{
  const clean={...s,units:s.units.map(u=>{const c={...u};delete c.backstabTick;return c})};
  hash.update(JSON.stringify(clean)+'\n');
  if(prev&&audit){
   const prior=new Map(prev.units.map(u=>[u.id,u]));
   const real=new Set(events.filter(x=>x.tick>prev.tick&&x.tick<=s.tick).map(x=>x.id));
   const visible=new Set(),stamps=new Set();
   for(const u of s.units){const p=prior.get(u.id);if(!p||u.hp<=0||u.type!=='assassin')continue;
    if(u.action==='backstab'&&p.action!==u.action)visible.add(u.id);
    if(detected(p,u))stamps.add(u.id);
   }
   stats.actual+=real.size;stats.transient+=[...real].filter(id=>visible.has(id)).length;
   stats.stamped+=[...real].filter(id=>stamps.has(id)).length;
   stats.missed+=[...real].filter(id=>!stamps.has(id)).length;
   stats.falsePos+=[...stamps].filter(id=>!real.has(id)).length;stats.windows++;
  }
  prev=s;
 }});
 env.LegacySimCore.deploy(roster('blue'),roster('red'));env.LegacySimCore.setRunning(true);
 for(let i=0;i<(count===80?165:230);i++){now+=16.667;const funcs=[...q.values()];q.clear();for(const fn of funcs)fn(now);if(env.LegacySimCore.getState().winner)break}
 return{...stats,hash:hash.digest('hex'),tick:env.LegacySimCore.getState().tick};
}
const smoke={count:40,speed:10,mirror:true,seed:1337};
assert.equal(test(original,smoke).hash,test(shipped,smoke).hash,'timestamp alters actual combat');
assert.equal(test(shipped,smoke).hash,test(observed,smoke,true).hash,'read-only observer alters actual combat');
const rows=[];
for(const count of [20,40,80])for(const speed of [1,4,10])for(const mirror of [false,true]){
 const cfg={count,speed,mirror,seed:1337},base=test(original,cfg),current=test(observed,cfg,true);
 assert.equal(current.hash,base.hash,'Assassin telemetry altered full physical RC4 states '+JSON.stringify(cfg));
 assert.equal(current.falsePos,0,'phantom Assassin backstab event '+JSON.stringify(cfg));
 rows.push({...cfg,actual:current.actual,transient:current.transient,stamped:current.stamped,missed:current.missed,falsePos:current.falsePos});
 console.log('ASSASSIN BACKSTAB CASE '+JSON.stringify(rows[rows.length-1]));
}
const aggregate=v=>v.reduce((o,row)=>{for(const key of ['actual','transient','stamped','missed','falsePos'])o[key]=(o[key]||0)+row[key];return o},{});
const total=aggregate(rows),rapid=aggregate(rows.filter(x=>x.speed===10));
assert(total.actual>=40,'sample too weak to validate assassin backstabs');
assert(total.stamped>=total.actual*.80,'backstab timestamp recovery weak');
assert(total.stamped>=total.transient*2,'backstab recovery not better than transient state');
const report={status:'Real Assassin backstab cue on QA branch only',total,rapid,rows,physicalCombatParity:true,
 caveats:'A true attempted strike may be dodged/mitigated. FX uses assassin weapon position and signature only, never invents damage/victim/KO. 48-fighter FX cap and action deduplication; dead attackers can be missed across snapshots.'};
if(process.env.QA_BACKSTAB_RECEIPT)fs.writeFileSync(process.env.QA_BACKSTAB_RECEIPT,JSON.stringify(report,null,2)+'\n');
console.log('ASSASSIN TRUE BACKSTAB SUMMARY '+JSON.stringify({total,rapid,physicalCombatParity:true}));
console.log('PASS: actual Assassin backstab cues without phantom strikes or modified combat');
