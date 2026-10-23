'use strict';
// Source-real playable Measured Charge on current QA, no simulated "winner" shortcuts.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('v3/legacy-sim-core.js'),ult=read('v3/ultimate-abilities.js'),fx=read('v3/ultimate-effects.js');
const from='function barbarianStep(',to='function reengageStep(';
const actual=src.slice(src.indexOf(from),src.indexOf(to));
assert(actual.includes("if(ultimate.rank(u)===2&&!u.breakthroughStrike)"),'L5 only genuine single first primary axe');
assert(actual.includes("moveToward(u,t,1,ultimate.rank(u)===2?(u.rage?1.95:1.70):(u.rage?1.55:1))"),'L5-only moderated entry');
assert(actual.includes("t.stun=Math.max(t.stun,8)"),'first strike stagger primary only');
assert(actual.includes("u.ultimateKind='breakthrough'"),'earned actual first-hit theatre cue');
assert(fx.includes("f.ability==='breakthrough'"),'must render grounded breakthrough');
assert(ult.includes('MEASURED CHARGE: approach 70% faster'),'Guide describes actual new L5 ability');
assert(src.includes("u.windup=u.windupTicks+(ultimate.rank(u)===1?24:0)"),'Dragon L4 fairness preserved');
function duel(level,baseline=false){
 let time=0,n=0,q=new Map(),errors=[],first=-1,last=null,dig=crypto.createHash('sha256'),firstCueChecked=false;
 const env={window:null,Math,performance:{now:()=>time},requestAnimationFrame(cb){const id=++n;q.set(id,cb);return id},cancelAnimationFrame(id){q.delete(id)},console:{error:(...a)=>errors.push(a.join(' '))}};
 env.window=env;vm.createContext(env);
 vm.runInContext(read('v3/evolution-rules.js'),env);
 vm.runInContext(ult,env);
 let source=src;
 if(baseline){const oldStep="function barbarianStep(u,t,d){const r=u.range/500,ratio=u.hp/u.maxHp;u.rage=ratio<.48;if(d>r){u.action=u.rage?'rage_charge':'march';moveToward(u,t,1,u.rage?1.55:1);return}if(u.cooldown<=0){u.action=u.rage?'rage_swing':'axe_swing';hit(u,t,u.rage?1.45:1.08);u.cooldown=Math.round(u.cd*(u.rage?.68:1))}else u.action=u.rage?'rage':'ready'}";
  assert.equal(source.split(actual).length,2);source=source.replace(actual,oldStep);}
 vm.runInContext(source,env);const sim=env.LegacySimCore;
 sim.configure({seed:26081,speed:10,onState:()=>{}});
 sim.deploy([{type:'barbarian',level}],[{type:'turtle',level:3}]);sim.setRunning(true);
 for(let frame=0;frame<160;frame++){
  time+=16.667;const callbacks=[...q.values()];q.clear();for(const cb of callbacks)cb(time);
  const state=sim.getState(),barb=state.units.find(u=>u.type==='barbarian'),turtle=state.units.find(u=>u.type==='turtle');
  dig.update(JSON.stringify(state)+'\n');
  if(turtle.hp<turtle.maxHp&&first<0)first=state.tick;
  if(barb.breakthroughStrike&&!firstCueChecked){assert.equal(level,5);assert.equal(barb.ultimateKind,'breakthrough');assert.equal(barb.ultimateTarget,turtle.id);firstCueChecked=true;}
  last={state,barb,turtle};if(state.winner)break;
 }
 assert.deepEqual(errors,[],'no actual source sim error');
 assert(first>=0,'genuine first primary landed HP');
 return{first,digest:dig.digest('hex'),firstCueChecked,...last};
}
const l4=duel(4),l4Before=duel(4,true);
assert.equal(l4.digest,l4Before.digest,'all L4 states identical full real RAF digest');
assert(!l4.barb.breakthroughStrike,'L4 never arms L5 upgrade');
const live5=duel(5),old5=duel(5,true);
assert(live5.firstCueChecked,'real L5 first strike occurred and correctly emitted cue');
assert(live5.first<=old5.first,'first contact should not be delayed by L5 charge');
assert.notEqual(live5.digest,old5.digest,'L5 physical result changes with approved first hit and advance');
console.log('PASS: Barbarian L5 single genuine first impact and cue, real earlier contact, L4 exact physics RAF SHA, existing Dragon windup, FX and Guide');
