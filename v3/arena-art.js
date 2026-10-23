// One cached composed skyline per arena/viewport; moving ambience remains separate.
(()=>{'use strict';
const images=new Map();let cached=null;
const skyline='/v3/assets/arenas/sunlit-lab/skyline.webp?v=1';
const variants={'CRYSTAL TERRACE':{source:'SUNLIT LAB',filter:'hue-rotate(12deg) saturate(.72) brightness(1.12)'},'SOLAR COLOSSEUM':{source:'FRONTIER KEEP',filter:'sepia(.28) saturate(1.13) brightness(1.06)'}};
const scenes={'SUNLIT LAB':skyline,'VERDANT RUINS':'/v3/assets/arenas/verdant/skyline.webp?v=1','FRONTIER KEEP':'/v3/assets/arenas/frontier/skyline.webp?v=1','SIEGE RUINS':'/v3/assets/arenas/siege/skyline.webp?v=1'};
function load(name){
 const url=scenes[variants[name]?.source||name];if(!url)return null;
 if(images.has(url))return images.get(url);
 const e={image:new Image(),ready:false};images.set(url,e);
 e.image.onload=()=>{e.ready=e.image.naturalWidth>0&&e.image.naturalHeight>0;cached=null};
 e.image.onerror=()=>{e.ready=false;cached=null};e.image.src=url;return e;
}
function paintSky(ctx,name,w,h,image){
 const dw=w,dh=image.naturalHeight*w/image.naturalWidth;
 ctx.save();ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();
 const extra=Math.max(0,h-dh),skyColour=name==='SIEGE RUINS'?'#337bda':name==='FRONTIER KEEP'?'#478ae5':name==='VERDANT RUINS'?'#579fe9':'#589ee8';
 if(extra){ctx.fillStyle=skyColour;ctx.fillRect(0,0,w,extra+1)}
 ctx.filter=variants[name]?.filter||'none';ctx.drawImage(image,0,h-dh,dw,dh);ctx.filter='none';
 if(extra){const fade=ctx.createLinearGradient(0,extra,0,extra+Math.min(24,dh*.14));fade.addColorStop(0,skyColour);fade.addColorStop(1,skyColour+'00');ctx.fillStyle=fade;ctx.fillRect(0,extra,w,Math.min(24,dh*.14))}
 ctx.restore();
}
function drawSky(ctx,name,w,h){
 const e=load(name);if(!e?.ready||w<=0||h<=0)return false;
 if(w*h>1600000){paintSky(ctx,name,w,h,e.image);return true}
 const dpr=Math.max(1,Math.min(window.devicePixelRatio||1,2.5,Math.sqrt(1000000/(w*h))));
 const key=name+':'+w+':'+h+':'+dpr;
 if(cached?.key!==key){
  try{const cv=typeof OffscreenCanvas==='function'?new OffscreenCanvas(1,1):window.document?.createElement('canvas');
   if(!cv)throw Error('canvas unavailable');cv.width=Math.ceil(w*dpr);cv.height=Math.ceil(h*dpr);
   const c=cv.getContext('2d');if(!c)throw Error('2d unavailable');
   c.setTransform(cv.width/w,0,0,cv.height/h,0,0);paintSky(c,name,w,h,e.image);
   cached={key,canvas:cv};
  }catch{cached=null;paintSky(ctx,name,w,h,e.image);return true}
 }
 ctx.drawImage(cached.canvas,0,0,w,h);return true;
}
window.ArenaArt={drawSky};Object.keys(scenes).forEach(load);
})();
