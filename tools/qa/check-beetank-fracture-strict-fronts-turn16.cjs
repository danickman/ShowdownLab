'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const real=read('tools/qa/check-completed-match-quality.cjs'),old=read('v3/ultimate-abilities.js');
const incoming="function incoming(t,damage,units,tick,bastions=units,turtleGuardians=units){",after="if(!r||!['sniper','dragon','beetank','mole','barbarian'].includes(a.type))return hits;";
assert.equal(old.split(incoming).length,2);assert.equal(old.split(after).length,2);
const fracture=old.replace(incoming,incoming+'\n'+"if(t.siegeFractureUntil>tick&&['beetank','turtle','dragon'].includes(t.type))damage*=1.65;").replace(after,"if(a.type==='beetank'&&r===2&&['horn','ram'].includes(a.action)&&dealt>0&&t.hp>0&&['beetank','turtle','dragon'].includes(t.type)){t.siegeFractureUntil=Math.max(t.siegeFractureUntil||0,tick+96);cue(a,'siege',tick,t)}"+'\n'+after);
const insert="vm.runInContext(read('tools/qa/fixtures/goose-before-impact-ultimate.js'),env);",logAnchor="console.log('COMPLETED MATCH QUALITY '+JSON.stringify(summary));";
assert.equal(real.split(insert).length,2);assert.equal(real.split(logAnchor).length,2);
const result={};
for(const arm of ['current','fracture']){
 let code=real.replace(insert,'vm.runInContext('+JSON.stringify(arm==='current'?old:fracture)+',env);');
 code=code.replace(logAnchor,logAnchor);
 const entries=[];
 const logger={...console,log:(...parts)=>{const str=parts.map(String).join(' ');if(str.startsWith('COMPLETED MATCH QUALITY '))entries.push(JSON.parse(str.slice('COMPLETED MATCH QUALITY '.length)));}};
 vm.runInNewContext(code,{require,__dirname,console:logger,process},{filename:'beetank-turn16-strict-'+arm+'.cjs'});
 assert.equal(entries.length,1);
 result[arm]=entries[0];
 for(const count of [20,40]){
  const x=result[arm][count];
  assert(x.realSeparatedWindows>=(count===20?16:140),'true independent HP-damaging window floor failed '+arm+' '+count);
  assert(x.persistentIndependentWindows>=(count===20?1:40),'true persistent front floor failed '+arm+' '+count);
 }
}
for(const count of [20,40]){
 const a=result.current[count],c=result.fracture[count];
 console.log('SIEGE FRACTURE STRICT FRONTS '+JSON.stringify({count,
   current:{persistent:a.persistentIndependentWindows,separated:a.realSeparatedWindows,actualHp:a.totalAttributedDamage},
   fracture:{persistent:c.persistentIndependentWindows,separated:c.realSeparatedWindows,actualHp:c.totalAttributedDamage},
   delta:{persistent:c.persistentIndependentWindows-a.persistentIndependentWindows,separated:c.realSeparatedWindows-a.realSeparatedWindows}}));
}
if(process.env.QA_BEETANK_FRACTURE_FRONTS)fs.writeFileSync(process.env.QA_BEETANK_FRACTURE_FRONTS,JSON.stringify(result,null,2)+'\n');
console.log('PASS: same live ultimate baseline versus fracture source, 32 full-terminal each, unchanged strict quality floors and all ten fighter roles');
