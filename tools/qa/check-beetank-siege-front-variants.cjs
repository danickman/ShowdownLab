'use strict';
// One source-real 32-complete-match quality diagnostic. PRODUCTION quality gates are untouched.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const original=fs.readFileSync(path.join(__dirname,'check-completed-match-quality.cjs'),'utf8');
const shipped="function beetankStep(u,t,d){const r=ultimate.rank(u)===2?Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)+.002):u.range/500;",options={
 baseline:"function beetankStep(u,t,d){const r=u.range/500;",
 partial:"function beetankStep(u,t,d){const r=ultimate.rank(u)===2?Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)-(bodyRadius(u)+bodyRadius(t))*.22+.002):u.range/500;",
 full:"function beetankStep(u,t,d){const r=ultimate.rank(u)===2?Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)+.002):u.range/500;",
 heavyOnly:"function beetankStep(u,t,d){const r=ultimate.rank(u)===2&&['beetank','turtle','dragon'].includes(t.type)?Math.max(u.range/500,visualSpacingRadius(u)+visualSpacingRadius(t)+.002):u.range/500;"
};
const anchor="const core=read('v3/legacy-sim-core.js');";
const first=" assert(summary[count].realSeparatedWindows>=(count===20?16:140),'independent damage fronts severely regressed at '+count);";
const second=" assert(summary[count].persistentIndependentWindows>=(count===20?1:40),'persistent genuine fronts regressed at '+count);";
assert.equal(original.split(anchor).length,2);
assert.equal(original.split(first).length,2);
assert.equal(original.split(second).length,2);
const out={};
for(const [name,variant] of Object.entries(options)){
 const load="const current=read('v3/legacy-sim-core.js');"+
  "assert(current.includes("+JSON.stringify(shipped)+"),'shipped source drift');"+
  "const core=current.replace("+JSON.stringify(shipped)+","+JSON.stringify(variant)+");";
 let code=original.replace(anchor,load);
 code=code.replace(first,"console.log('BEETANK_FRONT '+JSON.stringify({count,separated:summary[count].realSeparatedWindows,persistent:summary[count].persistentIndependentWindows,local:summary[count].localMeleeSeparatedWindows,positiveHp:summary[count].totalAttributedDamage}));");
 code=code.replace(second,"// Diagnosing only: original completed-match quality floors remain unchanged in CI.");
 const observations=[];
 const logger={...console,log:(...args)=>{const line=args.map(String).join(' ');if(line.startsWith('BEETANK_FRONT '))observations.push(JSON.parse(line.slice(14)));}};
 vm.runInNewContext(code,{require,__dirname,console:logger,process},{filename:'source-siege-'+name+'.cjs'});
 assert.equal(observations.length,2,'both 20/40 quality cases must finish');
 out[name]=observations;
}
if(process.env.QA_SIEGE_FRONT_RECEIPT)fs.writeFileSync(process.env.QA_SIEGE_FRONT_RECEIPT,JSON.stringify(out,null,2)+'\n');
console.log('BEETANK L5 FRONT DIAGNOSTIC '+JSON.stringify(out));
console.log('PASS: genuine 20/40 full-terminal source-comparison diagnostic; strict main quality tests unchanged');
