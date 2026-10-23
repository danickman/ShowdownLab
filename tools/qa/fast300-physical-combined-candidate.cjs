'use strict';
// QA SOURCE ONLY: preserve authentic increasing-index target ties and ordered physical collision contacts.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
module.exports=function makeCombined(original){
 const history=fs.readFileSync(path.join(__dirname,'check-turn19-live-target-grid.cjs'),'utf8');
 const marker='const optimized=',from=history.indexOf(marker),to=history.indexOf(';\nconst variants=',from);
 assert(from>=0&&to>from,'historical exact target-grid source unavailable');
 const legacy=JSON.parse(history.slice(from+marker.length,to));
 let grid=legacy.slice(legacy.indexOf('const __gs'),legacy.indexOf('function bodyRadius('));
 assert(grid.startsWith('const __gs=10,')&&grid.includes('function __gridBuild(team){'),'target grid provenance drift');
 grid=grid.replace('function __gridBuild(team){','function __gridBuild(team){window.__fast300PhysicalStats.targetBuilds++;');
 const nearest='function nearest(u,preferBack=false){',ni=original.indexOf(nearest),nj=original.indexOf('function bodyRadius(',ni);
 assert(ni>=0&&nj>ni,'current nearest moved');
 const baseNearest=original.slice(ni,nj);
 grid=grid.replace(nearest,nearest+'if(units.length<160)return __nearestOriginal(u,preferBack);');
 let source=original.slice(0,ni)+baseNearest.replace(nearest,'function __nearestOriginal(u,preferBack=false){')+'window.__fast300PhysicalStats={targetBuilds:0,collisionPasses:0};\n'+grid+original.slice(nj);
 function exact(a,b){assert.equal(source.split(a).length,2,'live core signature moved: '+a.slice(0,80));source=source.replace(a,b)}
 exact('unstick:0})}function formationEntries','unstick:0});__gridInvalidate(team)}function formationEntries');
 exact('function hurt(t,dmg,a,secondary=false){if(!t||','function hurt(t,dmg,a,secondary=false){if(t)__gridInvalidate(t.team);if(!t||');
 exact("u.chaos=12;for(const v of units)if(v.team!==u.team","u.chaos=12;__gridInvalidate(u.team==='blue'?'red':'blue');for(const v of units)if(v.team!==u.team");
 exact('for(const u of units){if(u.hp<=0)continue;const burn=ultimate.burn(u);','for(const u of units){if(u.hp<=0)continue;__gridInvalidate(u.team);const burn=ultimate.burn(u);');
 const ia=source.indexOf('function separate(initial=false){'),ib=source.indexOf('function slotPoint(',ia);
 assert(ia>=0&&ib>ia,'original collision source changed');
 const old=source.slice(ia,ib),loop="for(let pass=0;pass<passes;pass++)for(let i=0;i<alive.length;i++)for(let j=i+1;j<alive.length;j++){";
 const at=old.indexOf(loop);assert(at>0&&old.endsWith('}}'),'original collision traversal moved');
 const prefix=old.slice(0,at),body=old.slice(at+loop.length,-2);
 assert(body.includes('const a=alive[i],b=alive[j]')&&body.includes('const overlap=')&&body.endsWith('b.y=clamp(b.y+ny*overlap*(ma/total))'),'contact math moved');
 const template="const n=alive.length,wordCount=(n+31)>>>5,cellWidth=globalBound,side=Math.ceil(1/cellWidth)+2;\nconst cells=Array.from({length:side*side},()=>new Uint32Array(wordCount)),gx=new Int16Array(n),gy=new Int16Array(n);\nfunction put(k,first=false){const x=Math.floor(alive[k].x/cellWidth),y=Math.floor(alive[k].y/cellWidth),wx=k>>>5,bit=1<<(k&31);if(!first&&gx[k]===x&&gy[k]===y)return;if(!first)cells[gy[k]*side+gx[k]][wx]&=~bit;cells[y*side+x][wx]|=bit;gx[k]=x;gy[k]=y}\nfor(let k=0;k<n;k++)put(k,true);\nfor(let pass=0;pass<passes;pass++)for(let i=0;i<n;i++){\n let cursor=i+1;\n while(cursor<n){\n  const x0=Math.max(0,gx[i]-1),x1=Math.min(side-1,gx[i]+1),y0=Math.max(0,gy[i]-1),y1=Math.min(side-1,gy[i]+1);\n  const firstWord=cursor>>>5;let changed=false;\n  for(let wi=firstWord;wi<wordCount;wi++){\n   let bits=0;\n   for(let yy=y0;yy<=y1;yy++)for(let xx=x0;xx<=x1;xx++)bits|=cells[yy*side+xx][wi];\n   if(wi===firstWord)bits&=-1<<(cursor&31);\n   while(bits!==0){\n    const j=wi*32+31-Math.clz32(bits&-bits);bits&=bits-1;\n    if(j>=n)continue;\n    __PHYSICAL_PAIR_BODY__\n    put(i);put(j);cursor=j+1;changed=true;break\n   }\n   if(changed)break\n  }\n  if(!changed)break\n }\n}";
 const gridCollision=template.replace('__PHYSICAL_PAIR_BODY__',body);
 const replacement=prefix+'if(initial||alive.length<160){'+loop+body+'}}else{window.__fast300PhysicalStats.collisionPasses+=passes;'+gridCollision+'}}';
 source=source.slice(0,ia)+replacement+source.slice(ib);
 assert(source!==original&&source.includes('collisionPasses+=passes')&&source.includes('function __nearestOriginal('),'optimization inactive');
 new Function(source);return source;
};
