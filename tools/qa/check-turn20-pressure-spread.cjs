'use strict';
// Turn20: current-live ALL TEN ROLE actual positive-HP completed terminal front diagnostic.
// Baseline and one physically localized engagement-continuity candidate; no fake HP.
// Historical strict fixed Goose test is intentionally unchanged and separately required.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('v3/legacy-sim-core.js');
const oldRank="s=d+Math.max(0,pressure-2)*.035+(laneWeight&&!BACK.has(u.type)&&u.type!=='assassin'&&u.type!=='mole'?Math.abs(dy)*laneWeight:0);",newRank="s=d+Math.max(0,pressure-2)*(.035+laneWeight*.50)+(laneWeight&&!BACK.has(u.type)&&u.type!=='assassin'&&u.type!=='mole'?Math.abs(dy)*laneWeight:0);";
assert.equal(src.split(oldRank).length,2,'ranking formula has drifted');
const proposed=src.replace(oldRank,newRank);
assert(proposed!==src&&proposed.includes(newRank),'true physical on-contact spread candidate required');
// Score only actual physically attainable nearby enemies. Re-engage a living, nearby
// existing primary opponent rather than constantly merge every nearby group. The
// naturally soft local lane preference tapers to zero at >=60; no damage change.
const historical=read('tools/qa/check-completed-match-quality.cjs');
const oldCore="const core=read('v3/legacy-sim-core.js');",oldUlt="vm.runInContext(read('tools/qa/fixtures/goose-before-impact-ultimate.js'),env);";
const oldSeparated=" assert(summary[count].realSeparatedWindows>=(count===20?16:140),'independent damage fronts severely regressed at '+count);",oldPersistent=" assert(summary[count].persistentIndependentWindows>=(count===20?1:40),'persistent genuine fronts regressed at '+count);";
for(const key of [oldCore,oldUlt,oldSeparated,oldPersistent])assert.equal(historical.split(key).length,2,'quality script anchor changed '+key);
const results={};
for(const arm of ['live','spread']){
 const source=arm==='live'?src:proposed;
 let code=historical.replace(oldCore,'const core='+JSON.stringify(source)+';');
 code=code.replace(oldUlt,"vm.runInContext(read('v3/ultimate-abilities.js'),env);");
 // Diagnostic only: do not misrepresent failing current 30<40 as a passed gate.
 // Accepted implementation MUST later add a separate always-on strict CURRENT live test.
 code=code.replace(oldSeparated,"console.log('TURN20 RAW separated '+count+' '+summary[count].realSeparatedWindows);");
 code=code.replace(oldPersistent,"console.log('TURN20 RAW persistent '+count+' '+summary[count].persistentIndependentWindows);");
 const summaries=[];
 const logger={...console,log:(...args)=>{const line=args.map(String).join(' ');if(line.startsWith('COMPLETED MATCH QUALITY '))summaries.push(JSON.parse(line.slice(24)));}};
 vm.runInNewContext(code,{require,__dirname,console:logger,process},{filename:'turn20-'+arm+'.cjs'});
 assert.equal(summaries.length,1,'exactly one full match quality summary per arm');
 results[arm]=summaries[0];
}
const x=results.live,y=results.spread;
const rows=[20,40].map(n=>({n,live:{persistent:x[n].persistentIndependentWindows,separated:x[n].realSeparatedWindows,attributedHp:x[n].totalAttributedDamage,localPersistent:x[n].localMeleePersistentWindows,crossfireMerged:x[n].crossfireMergedWindows},spread:{persistent:y[n].persistentIndependentWindows,separated:y[n].realSeparatedWindows,attributedHp:y[n].totalAttributedDamage,localPersistent:y[n].localMeleePersistentWindows,crossfireMerged:y[n].crossfireMergedWindows}}));
for(const n of [20,40]){assert.equal(x[n].matches,16);assert.equal(y[n].matches,16);assert.equal(x[n].completed,16);assert.equal(y[n].completed,16);for(const role of Object.keys(x[n].roleDamage)){assert(y[n].roleDamage[role]>0,'role lost all actual damage '+role+' at '+n);}}
if(process.env.QA_TURN20_FRONTS)fs.writeFileSync(process.env.QA_TURN20_FRONTS,JSON.stringify({sourceSha256:crypto.createHash('sha256').update(src).digest('hex'),experiment:'live current ultimates, completed 32/arm all ten roles, positive-HP graph',rows,results},null,2)+'\n');
console.log('TURN20 LIVE PRESSURE SPREAD '+JSON.stringify(rows));
console.log('PASS: source-only full-terminal 32/arm legitimate live 20/40 bodies, no fake fronts or benchmark changes');
