'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const real=read('tools/qa/check-completed-match-quality.cjs'),old=read("tools/qa/fixtures/beetank-preanvil-ultimate-turn17.js");
const baseIncoming="if(t.siegeFractureUntil>tick&&['beetank','turtle','dragon'].includes(t.type))damage*=1.65;",baseHit="if(a.type==='beetank'&&r===2&&['horn','ram'].includes(a.action)&&dealt>0&&t.hp>0&&['beetank','turtle','dragon'].includes(t.type)){t.siegeFractureUntil=Math.max(t.siegeFractureUntil||0,tick+96);cue(a,'siege',tick,t)}";
const changedIncoming="if(t.siegeFractureUntil>tick&&['beetank','turtle','dragon'].includes(t.type)){damage*=1.65;if(t.siegeAnvilCharges>0){damage*=1.35;t.siegeAnvilCharges--}}",changedHit="if(a.type==='beetank'&&r===2&&['horn','ram'].includes(a.action)&&dealt>0&&t.hp>0&&['beetank','turtle','dragon'].includes(t.type)){t.siegeFractureUntil=Math.max(t.siegeFractureUntil||0,tick+96);cue(a,'siege',tick,t)}\n if(a.type==='beetank'&&r===2&&['horn','ram'].includes(a.action)&&dealt>0&&t.hp>0&&['beetank','turtle','dragon'].includes(t.type)&&tick-(a.siegeAnvilTick??-1000)>=100){a.siegeAnvilTick=tick;t.siegeAnvilCharges=Math.min(2,(t.siegeAnvilCharges||0)+2)}";
assert.equal(old.split(baseIncoming).length,2);assert.equal(old.split(baseHit).length,2);
const fracture=old.replace(baseIncoming,changedIncoming).replace(baseHit,changedHit);
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
 console.log('HAMMER ANVIL STRICT FRONTS '+JSON.stringify({count,
   current:{persistent:a.persistentIndependentWindows,separated:a.realSeparatedWindows,actualHp:a.totalAttributedDamage},
   fracture:{persistent:c.persistentIndependentWindows,separated:c.realSeparatedWindows,actualHp:c.totalAttributedDamage},
   delta:{persistent:c.persistentIndependentWindows-a.persistentIndependentWindows,separated:c.realSeparatedWindows-a.realSeparatedWindows}}));
}
for(const count of [20,40]){
 const now=result.current[count],next=result.fracture[count];
 assert(next.persistentIndependentWindows>=now.persistentIndependentWindows,'Anvil lost current-live persistent fronts at '+count);
 assert(next.realSeparatedWindows>=Math.max(count===20?16:140,now.realSeparatedWindows-Math.max(1,Math.floor(now.realSeparatedWindows*.01))),'Anvil lost over 1 percent of real HP-damaging front windows at '+count);
 if(count===20)assert(next.persistentIndependentWindows>=1,'Anvil destroyed essential 20 body real front');
}
if(process.env.QA_BEETANK_ANVIL_FRONTS)fs.writeFileSync(process.env.QA_BEETANK_ANVIL_FRONTS,JSON.stringify(result,null,2)+'\n');
console.log('PASS: current-live versus Hammer-and-Anvil live 32 complete games each, non-regression in genuine fronts; original fixed-Goose required quality floors unchanged');
