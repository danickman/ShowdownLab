'use strict';
// Always-on current LIVE ultimate front threshold, in addition to untouched historical frozen-Goose quality test.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),raw=fs.readFileSync(path.join(root,'tools/qa/check-completed-match-quality.cjs'),'utf8');
const frozen="vm.runInContext(read('tools/qa/fixtures/goose-before-impact-ultimate.js'),env);";
assert.equal(raw.split(frozen).length,2,'historical physical QA instrument changed');
const live=raw.replace(frozen,"vm.runInContext(read('v3/ultimate-abilities.js'),env);");
assert(live.includes("persistentIndependentWindows>=(count===20?1:40)"),'do not relax real persistent front floor');
assert(live.includes("realSeparatedWindows>=(count===20?16:140)"),'do not relax true separated HP windows');
let report;
const sink={...console,log:(...args)=>{const line=args.map(String).join(' ');if(line.startsWith('COMPLETED MATCH QUALITY '))report=JSON.parse(line.slice('COMPLETED MATCH QUALITY '.length));console.log(...args)}};
vm.runInNewContext(live,{require,__dirname,process,console:sink},{filename:'turn20-current-live-true-hp-gate.cjs'});
assert(report,'actual 20/40 true HP report missing');
for(const n of [20,40])assert.equal(report[n].completed,16,'missing genuine terminals at '+n);
assert(report[40].persistentIndependentWindows>=40&&report[40].realSeparatedWindows>=140,'current live 40 physical fronts failed');
assert(report[20].persistentIndependentWindows>=1&&report[20].realSeparatedWindows>=16,'current live 20 fronts failed');
if(process.env.QA_TURN20_LIVE_RECEIPT)fs.writeFileSync(process.env.QA_TURN20_LIVE_RECEIPT,JSON.stringify({source:'LIVE current all ultimates, 32 real terminals, independent attacker-attributed HP graph',summary:report},null,2)+'\n');
console.log('PASS: current LIVE true positive-HP multi-front floors 20 and 40; historical fixture remains independently mandatory');
