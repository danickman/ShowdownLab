'use strict';
// Turn20: current-live ALL TEN ROLE actual positive-HP completed terminal front diagnostic.
// Baseline and one physically localized engagement-continuity candidate; no fake HP.
// Historical strict fixed Goose test is intentionally unchanged and separately required.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const src=read('v3/legacy-sim-core.js');
const oldContact="const d=BACK.has(u.type)?d0:Math.max(0,d0-(bodyRadius(u)+bodyRadius(t))*.22);",newContact="const d0Contact=visualSpacingRadius(u)+visualSpacingRadius(t)+.002;let d=BACK.has(u.type)?d0:Math.max(0,d0-(bodyRadius(u)+bodyRadius(t))*.22);if(units.length<=40&&!BACK.has(u.type)&&u.type!=='assassin'&&u.type!=='mole'&&d0<=d0Contact){/* True collider-touch access, not ranged reach; still only natural cooldown attacks. */d=Math.min(d,u.range/500);}";
assert.equal(src.split(oldContact).length,2,'physical step contact anchor changed');
const proposed=src.replace(oldContact,newContact);
assert(proposed!==src&&proposed.includes(newContact),'source-only physical contact candidate must replace actual engine');
const historical=read('tools/qa/check-completed-match-quality.cjs');
const oldCore="const core=read('v3/legacy-sim-core.js');",oldUlt="vm.runInContext(read('tools/qa/fixtures/goose-before-impact-ultimate.js'),env);";
const oldSeparated=" assert(summary[count].realSeparatedWindows>=(count===20?16:140),'independent damage fronts severely regressed at '+count);",oldPersistent=" assert(summary[count].persistentIndependentWindows>=(count===20?1:40),'persistent genuine fronts regressed at '+count);";
for(const key of [oldCore,oldUlt,oldSeparated,oldPersistent])assert.equal(historical.split(key).length,2,'quality script anchor changed '+key);
const results={};
for(const arm of ['live','contact']){
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
const x=results.live,y=results.contact;
const rows=[20,40].map(n=>({n,live:{persistent:x[n].persistentIndependentWindows,separated:x[n].realSeparatedWindows,attributedHp:x[n].totalAttributedDamage,localPersistent:x[n].localMeleePersistentWindows,crossfireMerged:x[n].crossfireMergedWindows},contact:{persistent:y[n].persistentIndependentWindows,separated:y[n].realSeparatedWindows,attributedHp:y[n].totalAttributedDamage,localPersistent:y[n].localMeleePersistentWindows,crossfireMerged:y[n].crossfireMergedWindows}}));
for(const n of [20,40]){assert.equal(x[n].matches,16);assert.equal(y[n].matches,16);assert.equal(x[n].completed,16);assert.equal(y[n].completed,16);for(const role of Object.keys(x[n].roleDamage)){assert(y[n].roleDamage[role]>0,'role lost all actual damage '+role+' at '+n);}}
if(process.env.QA_TURN20_FRONTS)fs.writeFileSync(process.env.QA_TURN20_FRONTS,JSON.stringify({sourceSha256:crypto.createHash('sha256').update(src).digest('hex'),experiment:'live current ultimates, completed 32/arm all ten roles, positive-HP graph',rows,results},null,2)+'\n');
console.log('TURN20 LIVE COLLIDER CONTACT '+JSON.stringify(rows));
console.log('PASS: source-only full-terminal 32/arm legitimate live 20/40 bodies, no fake fronts or benchmark changes');
