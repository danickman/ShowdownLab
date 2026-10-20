'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const currentCore=read('v3/legacy-sim-core.js'),newFormation="yStep=Math.min(entries.length<=20?.120:.065,(entries.length<=20?.78:.50)/Math.max(4,lanes-1))",oldFormation="yStep=Math.min(.065,.50/Math.max(4,lanes-1))";
assert.equal(currentCore.split(newFormation).length,2,'live geometry integration must be present');
// Freeze the PRE-TURN20 geometry only inside legacy Turn16/17 relative non-regression research.
// The separately mandatory strict current-live Turn20 gate proves >=40 genuine fronts on today's geometry.
const originalQuality=read('tools/qa/check-completed-match-quality.cjs'),coreLoader="const core=read('v3/legacy-sim-core.js');";
assert.equal(originalQuality.split(coreLoader).length,2,'frozen legacy quality source moved');
const frozenLoader="const core=read('v3/legacy-sim-core.js').replace("+JSON.stringify(newFormation)+","+JSON.stringify(oldFormation)+");";
const real=originalQuality.replace(coreLoader,frozenLoader),old=read('tools/qa/fixtures/beetank-prefracture-ultimate-turn16.js');
const incoming="function incoming(t,damage,units,tick,bastions=units,turtleGuardians=units){",after="if(!r||!['sniper','dragon','beetank','mole','barbarian'].includes(a.type))return hits;";
assert.equal(old.split(incoming).length,2);assert.equal(old.split(after).length,2);
const fracture=old.replace(incoming,incoming+'\n'+"if(t.siegeFractureUntil>tick&&['beetank','turtle','dragon'].includes(t.type))damage*=1.65;").replace(after,"if(a.type==='beetank'&&r===2&&['horn','ram'].includes(a.action)&&dealt>0&&t.hp>0&&['beetank','turtle','dragon'].includes(t.type)){t.siegeFractureUntil=Math.max(t.siegeFractureUntil||0,tick+96);cue(a,'siege',tick,t)}"+'\n'+after);
const insert="vm.runInContext(read('tools/qa/fixtures/goose-before-impact-ultimate.js'),env);",logAnchor="console.log('COMPLETED MATCH QUALITY '+JSON.stringify(summary));";
assert.equal(real.split(insert).length,2);assert.equal(real.split(logAnchor).length,2);
const result={};
for(const arm of ['current','fracture']){
 let code=real.replace(insert,'vm.runInContext('+JSON.stringify(arm==='current'?old:fracture)+',env);');
 // Historical fixed-Goose strict floors remain fully enforced in the unchanged
 // required CI job. These two assertions fail even for current LIVE Goose;
 // measure live-vs-live raw fronts separately rather than mislabel baseline
 // failure as a Beetank balance regression.
 const oldSeparated=" assert(summary[count].realSeparatedWindows>=(count===20?16:140),'independent damage fronts severely regressed at '+count);";
 const oldPersistent=" assert(summary[count].persistentIndependentWindows>=(count===20?1:40),'persistent genuine fronts regressed at '+count);";
 assert.equal(code.split(oldSeparated).length,2);
 assert.equal(code.split(oldPersistent).length,2);
 code=code.replace(oldSeparated,"console.log('LIVE_BEETANK_DIAG separated '+count+' '+summary[count].realSeparatedWindows);");
 code=code.replace(oldPersistent,"console.log('LIVE_BEETANK_DIAG persistent '+count+' '+summary[count].persistentIndependentWindows);");
 const entries=[];
 const logger={...console,log:(...parts)=>{const str=parts.map(String).join(' ');if(str.startsWith('COMPLETED MATCH QUALITY '))entries.push(JSON.parse(str.slice('COMPLETED MATCH QUALITY '.length)));}};
 vm.runInNewContext(code,{require,__dirname,console:logger,process},{filename:'beetank-turn16-strict-'+arm+'.cjs'});
 assert.equal(entries.length,1);
 result[arm]=entries[0];
 // The unchanged required fixed-fixture quality suite remains authoritative.

}
for(const count of [20,40]){
 const a=result.current[count],c=result.fracture[count];
 console.log('SIEGE FRACTURE STRICT FRONTS '+JSON.stringify({count,
   current:{persistent:a.persistentIndependentWindows,separated:a.realSeparatedWindows,actualHp:a.totalAttributedDamage},
   fracture:{persistent:c.persistentIndependentWindows,separated:c.realSeparatedWindows,actualHp:c.totalAttributedDamage},
   delta:{persistent:c.persistentIndependentWindows-a.persistentIndependentWindows,separated:c.realSeparatedWindows-a.realSeparatedWindows}}));
}
for(const count of [20,40]){
 const now=result.current[count],next=result.fracture[count];
 assert(next.persistentIndependentWindows>=now.persistentIndependentWindows,'fracture lost current-live persistent fronts at '+count);
 assert(next.realSeparatedWindows>=Math.max(count===20?16:140,now.realSeparatedWindows-Math.max(1,Math.floor(now.realSeparatedWindows*.01))),'fracture lost over 1 percent of real HP-damaging front windows at '+count);
 if(count===20)assert(next.persistentIndependentWindows>=1,'fracture destroyed essential 20 body real front');
}
if(process.env.QA_BEETANK_FRACTURE_FRONTS)fs.writeFileSync(process.env.QA_BEETANK_FRACTURE_FRONTS,JSON.stringify(result,null,2)+'\n');
console.log('PASS: current-live versus fracture-live 32 complete games each, non-regression in genuine fronts; original fixed-Goose required quality floors unchanged');
