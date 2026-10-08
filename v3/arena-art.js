// Three daylight locations; decoded once per URL, live combat layers stay separate.
(()=>{'use strict';
  const images=new Map();
  const skyline='/v3/assets/arenas/sunlit-lab/skyline.webp?v=1';
  const scenes={'SUNLIT LAB':skyline,'VERDANT RUINS':skyline,'FRONTIER KEEP':'/v3/assets/arenas/frontier/skyline.webp?v=1','SIEGE RUINS':'/v3/assets/arenas/siege/skyline.webp?v=1'};
  function load(name){
    const url=scenes[name];if(!url)return null;
    if(images.has(url))return images.get(url);
    const entry={image:new Image(),ready:false};images.set(url,entry);
    entry.image.onload=()=>{entry.ready=entry.image.naturalWidth>0&&entry.image.naturalHeight>0};
    entry.image.onerror=()=>{entry.ready=false};entry.image.src=url;return entry;
  }
  function drawSky(ctx,name,width,height){
    const entry=load(name);if(!entry?.ready||width<=0||height<=0)return false;
    const image=entry.image,scale=Math.max(width/image.naturalWidth,height/image.naturalHeight);
    const dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;
    // Bottom anchor preserves the courtyard wall; crop sky rather than stretch architecture.
    ctx.save();ctx.beginPath();ctx.rect(0,0,width,height);ctx.clip();
    ctx.drawImage(image,(width-dw)/2,height-dh,dw,dh);ctx.restore();return true;
  }
  window.ArenaArt={drawSky};Object.keys(scenes).forEach(load);
})();
