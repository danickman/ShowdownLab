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
    const image=entry.image,scale=width/image.naturalWidth;
    const dw=width,dh=image.naturalHeight*scale;
    // Preserve BOTH side landmarks. Extend only the upper sky band when a
    // portrait region is taller than the complete width-fitted panorama.
    ctx.save();ctx.beginPath();ctx.rect(0,0,width,height);ctx.clip();
    const extra=Math.max(0,height-dh),skyColour=name==='SIEGE RUINS'?'#337bda':name==='FRONTIER KEEP'?'#478ae5':'#589ee8';
    if(extra){ctx.fillStyle=skyColour;ctx.fillRect(0,0,width,extra+1)}
    ctx.drawImage(image,0,height-dh,dw,dh);
    if(extra){
      // Fade only the top sky edge; architecture and cloud proportions stay intact.
      const fade=ctx.createLinearGradient(0,extra,0,extra+Math.min(24,dh*.14));
      fade.addColorStop(0,skyColour);fade.addColorStop(1,skyColour+'00');
      ctx.fillStyle=fade;ctx.fillRect(0,extra,width,Math.min(24,dh*.14));
    }
    ctx.restore();return true;
  }
  window.ArenaArt={drawSky};Object.keys(scenes).forEach(load);
})();
