const fs=require('fs'),vm=require('vm'),assert=require('assert');
const src=fs.readFileSync('v3/v3.js','utf8'),sizeKind=[];
const e={groundMarkPoint:()=>({x:100,y:200}),cam:{unitSize:(kind)=>{sizeKind.push(kind);return 80}},ctx:{save(){},restore(){},translate(){},rotate(){},scale(){}},renderFighter(){}};vm.createContext(e);vm.runInContext(src.slice(src.indexOf('function drawDefeated('),src.indexOf('function effectScale(')),e);
for(const [type,kind]of Object.entries({knight:'normal',sniper:'normal',dragon:'large',assassin:'normal',beetank:'heavy',mole:'normal',turtle:'heavy',goblin:'small',barbarian:'normal',goose:'small'}))for(const team of ['blue','red'])for(const density of [2,24,180]){sizeKind.length=0;e.drawDefeated({id:1,type,team,level:5,t:5000},5100,density);assert.equal(sizeKind[0],kind)}
console.log('PASS: all ten defeated fighters keep their live camera size in both teams and duel/dense scenes');
