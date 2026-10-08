const fs=require('fs'),vm=require('vm'),assert=require('assert');
const r={window:null,Image:class{set src(v){this.naturalWidth=1774;this.naturalHeight=887;this.onload?.()}}};r.window=r;vm.createContext(r);
vm.runInContext(fs.readFileSync('v3/arena-art.js','utf8'),r);
let depth=0,images=[];
const c={save(){depth++},restore(){depth--},beginPath(){},rect(){},clip(){},fillRect(){},createLinearGradient(){return{addColorStop(){}}},drawImage(...args){images.push(args)}};
let cases=0;
for(const name of ['SUNLIT LAB','VERDANT RUINS','FRONTIER KEEP','SIEGE RUINS'])for(const [w,h]of [[320,193],[390,287],[430,317],[844,109],[1024,215]]){
 images=[];assert(r.ArenaArt.drawSky(c,name,w,h));assert.equal(depth,0);
 const picture=images.at(-1);assert.equal(picture.length,5,'no source-side crop');
 const [,x,y,dw,dh]=picture;assert.equal(x,0);assert.equal(dw,w);assert.equal(dw/dh,2,'architecture keeps original proportions');assert(Math.abs(y+dh-h)<.001,'wall meets floor');cases++;
}
assert.equal(r.ArenaArt.drawSky(c,'missing',390,200),false);
console.log('PASS:',cases,'full-width panoramas, correct aspect, wall alignment and fallback');
