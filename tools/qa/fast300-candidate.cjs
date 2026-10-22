'use strict';
// Source-only performance candidate: original four collision passes, same
// mutable Gauss-Seidel i<j traversal, conservative x-block envelopes.
// Does NOT remove actual damage, fights, sprites, target ordering or ticks.
// Only eligible at >=160 currently living fighters; every smaller front is
// on the exact original collision path.
module.exports=function makeCandidate(original){
 function exact(s,a,b){if(s.split(a).length!==2)throw Error('Baseline moved: '+a.slice(0,55));return s.replace(a,b)}
 let source=original;
 source=exact(source,"let bastions=[],turtleGuardians=[];","let bastions=[],turtleGuardians=[],targetPools=null,targetPoolCount=0;");
 source=exact(source,"separate(true);emit(true)","separate(true);targetPools={blue:units.filter(v=>v.team==='red'),red:units.filter(v=>v.team==='blue')};targetPoolCount=units.length;emit(true)");
 source=exact(source,"let pool=units.filter(v=>v.team!==u.team&&v.hp>0&&v.burrow<=0&&Number.isFinite(v.x)&&Number.isFinite(v.y));",
 "if(targetPools&&targetPoolCount!==units.length){targetPools={blue:units.filter(v=>v.team==='red'),red:units.filter(v=>v.team==='blue')};targetPoolCount=units.length}let pool=(targetPools&&units.length>=160)?targetPools[u.team]:units.filter(v=>v.team!==u.team&&v.hp>0&&v.burrow<=0&&Number.isFinite(v.x)&&Number.isFinite(v.y));");
 source=exact(source,"const backs=pool.filter(v=>BACK.has(v.type));","const backs=pool.filter(v=>BACK.has(v.type)&&v.hp>0&&v.burrow<=0&&Number.isFinite(v.x)&&Number.isFinite(v.y));");
 source=exact(source,"for(const v of pool){const dx=v.x-u.x","for(const v of pool){if(targetPools&&units.length>=160&&!(v.hp>0&&v.burrow<=0&&Number.isFinite(v.x)&&Number.isFinite(v.y)))continue;const dx=v.x-u.x");
 const a=source.indexOf("function separate(initial=false){"),b=source.indexOf("function slotPoint(",a),old=source.slice(a,b);
 if(old.length!==1016||a<0||b<a)throw Error('Frozen four-pass physical source moved');
 const loop="for(let pass=0;pass<passes;pass++)for(let i=0;i<alive.length;i++)for(let j=i+1;j<alive.length;j++){";
 const k=old.indexOf(loop);if(k<0||!old.endsWith("}}"))throw Error('Exact pair traversal moved');
 const prefix=old.slice(0,k),body=old.slice(k+loop.length,-2);
 const last="b.y=clamp(b.y+ny*overlap*(ma/total))";
 if(body.split(last).length!==2)throw Error('Contact math changed');
 const update=last+";const ib=i>>5,jb=j>>5;"+
 "if(a.x<blockMin[ib])blockMin[ib]=a.x;if(a.x>blockMax[ib])blockMax[ib]=a.x;"+
 "if(b.x<blockMin[jb])blockMin[jb]=b.x;if(b.x>blockMax[jb])blockMax[jb]=b.x";
 const skip=`const bs=32,bc=Math.ceil(alive.length/bs),
 blockMin=new Float64Array(bc),blockMax=new Float64Array(bc);
 for(let pass=0;pass<passes;pass++){
 blockMin.fill(Infinity);blockMax.fill(-Infinity);
 for(let k=0;k<alive.length;k++){const bb=k>>5,x=alive[k].x;if(x<blockMin[bb])blockMin[bb]=x;if(x>blockMax[bb])blockMax[bb]=x}
 for(let i=0;i<alive.length;i++)for(let first=i+1;first<alive.length;){
 const bb=first>>5,stop=Math.min(alive.length,(bb+1)*bs),ax=alive[i].x;
 // Envelopes ONLY expand as fighters move: never discard a reachable pair.
 if(blockMin[bb]-ax>=globalBound||blockMax[bb]-ax<=-globalBound){first=stop;continue}
 for(let j=first;j<stop;j++){${body.replace(last,update)}}
 first=stop
 }}`;
 const next=prefix+"if(alive.length<160){"+loop+body+"}}else{"+skip+"}}";
 source=source.slice(0,a)+next+source.slice(b);
 if(source===original||!source.includes('blockMin.fill(Infinity)'))throw Error('Optimized collision missing');
 new Function('window','performance','requestAnimationFrame','cancelAnimationFrame','console',source);
 return source;
};
