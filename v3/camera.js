(()=>{'use strict';
function create(viewW,viewH,o={}){
  // The camera composes the active fight on the floor; the sky is scenery.
  const top=o.top??Math.max(116,viewH*(viewH>=viewW?.35:.29)),bottom=o.bottom??96,pad=o.pad??14;
  const a={x:pad,y:top+pad,w:Math.max(1,viewW-pad*2),h:Math.max(1,viewH-top-bottom-pad*2)};
  let frame={x:.5,y:.5,zoom:.92},density=0,initialized=false;
  const maxScale={normal:1.36,heavy:1.36,large:1.36,small:1.36,boss:1.36};
  for(const [type,spec]of Object.entries(window.FighterAssets?.authored||{})){const k=type==='dragon'?'large':['beetank','turtle'].includes(type)?'heavy':['goose','goblin'].includes(type)?'small':'normal';maxScale[k]=Math.max(maxScale[k],(spec.scale||1.36)*(spec.inkBoost||1))}
  const maxSpriteHeight=Math.max(1,Math.min(a.h*.70-12,a.w*.65-16));
  const project=(x,y)=>{const d=Math.max(0,Math.min(1,y)),p=.78+d*.28;return{x:.5+(x-.5)*p,y:.16+d*.76}};
  const kindFor=type=>type==='dragon'?'large':type==='beetank'||type==='turtle'?'heavy':type==='goblin'||type==='goose'?'small':'normal';
  function sizeFor(kind,count,zoom){let n=kind==='boss'?132:kind==='large'?112:kind==='heavy'?96:kind==='small'?72:84;if(count>20)n*=.92;if(count>35)n*=.84;if(count>55)n*=.76;n*=Math.min(1.12,Math.sqrt(zoom));const crowdScale=Math.max(.58,1-Math.max(0,count-60)*.0035);return Math.max(1,Math.min(Math.round(Math.max(kind==='large'?68:kind==='heavy'?58:kind==='small'?42:48,n)*crowdScale),maxSpriteHeight/(maxScale[kind]||1.36)))}
  function unitSize(kind='normal',count=density||8){return sizeFor(kind,count,frame.zoom)}
  function focus(units=[]){
    const live=units.filter(u=>u.hp>0);if(!live.length)return;density=live.length;
    let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,edge=0,head=0,foot=0;
    for(const u of live){
      const p=project(u.x,u.y);minX=Math.min(minX,p.x);maxX=Math.max(maxX,p.x);minY=Math.min(minY,p.y);maxY=Math.max(maxY,p.y);
      const kind=kindFor(u.type),spec=window.FighterAssets?.authored?.[u.type],scale=spec?.scale??1.36,anchor=spec?.anchor?.[1]??.948,ink=spec?.inkBoost??1;
      // Reserve the maximum supported zoom size, so zoom smoothing cannot clip equipment.
      const size=sizeFor(kind,density,1.28),h=size*scale*ink,stagePad=density<=44&&window.CombatStaging?14:0;
      edge=Math.max(edge,h*.5+8+stagePad);head=Math.max(head,h*anchor+10+stagePad*.5);foot=Math.max(foot,h*(1-anchor)+8+stagePad*.5,size*.14+4);
    }
    edge=Math.min(edge,a.w*.38);head=Math.min(head,a.h*.72);foot=Math.min(foot,a.h*.12);
    const spanX=Math.max(.12,maxX-minX),spanY=Math.max(.12,maxY-minY);
    const fit=Math.min((1-edge*2/a.w)/spanX,(1-(head+foot)/a.h)/spanY);
    const crowd=density>55?.80:density>35?.86:density>20?.92:1,target=Math.min(1.28,Math.max(.25,fit)*crowd);
    const cx=(minX+maxX)*.5,cy=(minY+maxY)*.5-(head-foot)/(2*a.h*target);
    if(!initialized){frame={x:cx,y:cy,zoom:target};initialized=true}
    else{frame.x+=(cx-frame.x)*.075;frame.y+=(cy-frame.y)*.065;frame.zoom+=(target-frame.zoom)*(target<frame.zoom?.22:.055)}
    // Widen immediately when necessary; smooth inward only. The whole army stays in view.
    frame.zoom=Math.min(frame.zoom,fit);
    const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
    frame.x=clamp(frame.x,maxX-(.5-edge/a.w)/frame.zoom,minX+(.5-edge/a.w)/frame.zoom);
    frame.y=clamp(frame.y,maxY-(.5-foot/a.h)/frame.zoom,minY+(.5-head/a.h)/frame.zoom);
  }
  return{arena:a,focus,project,get zoom(){return frame.zoom},get density(){return density},worldToScreen(x,y){const p=project(x,y);return{x:a.x+((p.x-frame.x)*frame.zoom+.5)*a.w,y:a.y+((p.y-frame.y)*frame.zoom+.5)*a.h}},unitSize};
}
window.ShowdownCamera={create};
})();
