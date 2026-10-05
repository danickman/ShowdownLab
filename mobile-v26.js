/* v2.6 Turn 1 — Mobile Foundation */
(function(){
  document.documentElement.dataset.mobileBuild='v2.6-t1';
  const badge=document.querySelector('.top h2 small'); if(badge) badge.textContent='v2.6 Mobile Dev · T1';
  document.title='Showdown Lab v2.6 Mobile Dev';
  window.copyDiagnostics=async function(){
    const txt=`Showdown Lab v2.6-dev | checksum ${typeof simChecksum==='function'?simChecksum():'n/a'} | FPS ${window.perf?.fps??'n/a'} | units ${window.units?.length??'n/a'} | projectiles ${window.projectiles?.length??'n/a'} | tick ${window.tick??'n/a'} | seed ${window.seed??'n/a'} | phase ${window.phase??'n/a'} | ${navigator.userAgent}`;
    try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(txt);if(typeof toast==='function')toast('Diagnostics copied');return}}catch(e){}
    try{const ta=document.createElement('textarea');ta.value=txt;ta.readOnly=true;ta.style.cssText='position:fixed;opacity:0;pointer-events:none';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();if(typeof toast==='function')toast('Diagnostics copied');return}catch(e){}
    try{const p=document.querySelector('#panel'),ov=document.querySelector('#overlay');if(p){p.innerHTML='<h3>Diagnostics</h3><textarea readonly style="width:100%;min-height:160px">'+txt.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</textarea><button onclick="showHome()">Return Home</button>';ov?.classList.remove('hidden')}}catch(e){}
  };
  const syncViewport=()=>document.documentElement.style.setProperty('--app-vh',`${window.innerHeight}px`);
  syncViewport(); addEventListener('resize',syncViewport,{passive:true}); addEventListener('orientationchange',syncViewport,{passive:true});
})();