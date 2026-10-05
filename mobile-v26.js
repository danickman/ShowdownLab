/* v2.6 Turn 2 — Battle Camera & Scale */
(function(){
  document.documentElement.dataset.mobileBuild='v2.6-t2';
  const badge=document.querySelector('.top h2 small'); if(badge) badge.textContent='v2.6 Mobile Dev · T2';
  document.title='Showdown Lab v2.6 Mobile Dev';
  window.copyDiagnostics=async function(){
    const txt=`Showdown Lab v2.6-dev T2 | checksum ${typeof simChecksum==='function'?simChecksum():'n/a'} | FPS ${window.perf?.fps??'n/a'} | units ${window.units?.length??'n/a'} | projectiles ${window.projectiles?.length??'n/a'} | tick ${window.tick??'n/a'} | seed ${window.seed??'n/a'} | phase ${window.phase??'n/a'} | ${navigator.userAgent}`;
    try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(txt);if(typeof toast==='function')toast('Diagnostics copied');return}}catch(e){}
    try{const ta=document.createElement('textarea');ta.value=txt;ta.readOnly=true;ta.style.cssText='position:fixed;opacity:0;pointer-events:none';document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();if(typeof toast==='function')toast('Diagnostics copied');return}catch(e){}
    try{const p=document.querySelector('#panel'),ov=document.querySelector('#overlay');if(p){p.innerHTML='<h3>Diagnostics</h3><textarea readonly style="width:100%;min-height:160px">'+txt.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</textarea><button onclick="showHome()">Return Home</button>';ov?.classList.remove('hidden')}}catch(e){}
  };
  const root=document.documentElement, canvas=document.querySelector('#c'), overlay=document.querySelector('#overlay');
  const syncViewport=()=>root.style.setProperty('--app-vh',`${window.innerHeight}px`);
  function syncBattleFocus(){
    let active=false;
    try{active=!!canvas && overlay?.classList.contains('hidden') && typeof phase!=='undefined' && phase==='battle'}catch(e){}
    root.dataset.battleFocus=active?'1':'0';
  }
  function fitArena(){
    if(!canvas)return;
    const battle=root.dataset.battleFocus==='1';
    const top=document.querySelector('#app>.top:nth-of-type(2)');
    const spells=document.querySelector('#spellBar');
    const reserved=(top?.offsetHeight||38)+(battle?(spells?.offsetHeight||0):130)+18;
    const avail=Math.max(300,window.innerHeight-reserved);
    /* Keep the simulation's 900x600 coordinate system intact. CSS performs the camera fit. */
    canvas.style.maxHeight=battle?`${avail}px`:'';
  }
  function sync(){syncViewport();syncBattleFocus();fitArena()}
  sync(); addEventListener('resize',sync,{passive:true}); addEventListener('orientationchange',()=>setTimeout(sync,80),{passive:true});
  if(overlay)new MutationObserver(sync).observe(overlay,{attributes:true,attributeFilter:['class']});
  /* Game state is not event-driven, so cheaply sample phase changes without touching the simulation loop. */
  let lastPhase=''; setInterval(()=>{let p='';try{p=String(phase)}catch(e){}if(p!==lastPhase){lastPhase=p;sync()}},250);
  /* Double-tap the arena to toggle a distraction-free battle camera. */
  let lastTap=0; canvas?.addEventListener('pointerup',()=>{const now=Date.now();if(now-lastTap<330){const forced=root.dataset.battleFocus==='1';root.dataset.battleFocus=forced?'0':'1';fitArena();lastTap=0}else lastTap=now},{passive:true});
})();