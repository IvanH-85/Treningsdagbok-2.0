(() => {
  if (typeof renderTabs !== 'function' || typeof renderPages !== 'function') return;

  let previewEspen = false;
  let savedProfile = null;
  let savedData = null;

  const isRealIvan = () => typeof currentUser !== 'undefined' && currentUser && profileById(currentUser.id)?.name === 'Ivan';
  const clone = obj => {
    try { return structuredClone(obj); } catch (_) { return JSON.parse(JSON.stringify(obj)); }
  };

  const style=document.createElement('style');
  style.textContent=`
    .espen-preview-btn{white-space:nowrap}
    .espen-preview-banner{margin:10px auto 0;max-width:1100px;padding:9px 12px;border:1px solid #8fb0df;border-radius:10px;background:#eef4ff;font-size:12px;display:flex;justify-content:space-between;align-items:center;gap:10px}
    .espen-preview-banner b{font-weight:900}.espen-preview-banner .muted{font-size:11px}
    body.espen-preview-active #appView button:not(.tab),body.espen-preview-active #appView input,body.espen-preview-active #appView select,body.espen-preview-active #appView textarea{pointer-events:none;opacity:.62}
    @media(max-width:650px){.espen-preview-btn{font-size:9px!important;padding:6px 7px!important}.espen-preview-banner{margin:7px 8px 0;align-items:flex-start;flex-direction:column}}
  `;
  document.head.appendChild(style);

  const updateWho=()=>{
    const who=document.getElementById('who');
    if(!who)return;
    if(previewEspen) who.textContent='Forhåndsvisning: Espen • innlogget som Ivan';
    else if(currentProfile) who.textContent=`Innlogget: ${currentProfile.name} • skylagring aktiv`;
  };

  const ensureControls=()=>{
    const headrow=document.querySelector('header .headrow');
    if(!headrow || (!isRealIvan() && !previewEspen))return;

    let btn=document.getElementById('espenPreviewBtn');
    if(!btn){
      btn=document.createElement('button');
      btn.id='espenPreviewBtn';
      btn.className='btn small secondary espen-preview-btn';
      btn.onclick=()=>window.toggleEspenPreview();
      headrow.appendChild(btn);
    }
    btn.textContent=previewEspen?'Tilbake til Ivan':'Vis som Espen';

    const coachBtn=document.getElementById('coachPreviewBtn');
    if(coachBtn)coachBtn.style.display=previewEspen?'none':'';

    let banner=document.getElementById('espenPreviewBanner');
    if(previewEspen){
      if(!banner){
        banner=document.createElement('div');
        banner.id='espenPreviewBanner';
        banner.className='espen-preview-banner';
        const tabs=document.getElementById('tabs');
        if(tabs?.parentNode)tabs.parentNode.insertBefore(banner,tabs.nextSibling);
      }
      banner.innerHTML=`<div><b>👀 Forhåndsvisning: Espen</b><div class="muted">Du er fortsatt innlogget som Ivan. Dette viser Espen-oppsettet i skrivebeskyttet modus.</div></div><button class="btn small secondary" onclick="toggleEspenPreview()">Tilbake til Ivan</button>`;
    }else if(banner)banner.remove();
    updateWho();
  };

  window.toggleEspenPreview=()=>{
    if(!previewEspen){
      if(!isRealIvan())return;
      try{
        if(localStorage.getItem('gaintrain_coach_preview')==='1' && typeof toggleCoachPreview==='function')toggleCoachPreview();
      }catch(_){}
      const ep=profileByName('Espen');
      if(!ep){alert('Fant ikke Espen-profilen.');return}
      savedProfile=currentProfile;
      savedData=d;
      currentProfile=ep;
      d=clone(stateByName('Espen'));
      previewEspen=true;
      document.body.classList.add('espen-preview-active');
    }else{
      currentProfile=savedProfile||profileByName('Ivan');
      d=savedData||clone(stateByName('Ivan'));
      savedProfile=null;savedData=null;
      previewEspen=false;
      document.body.classList.remove('espen-preview-active');
    }
    renderTabs();
    renderPages();
    showPage('home');
    ensureControls();
  };

  const baseRenderTabs=renderTabs;
  renderTabs=function(...args){const out=baseRenderTabs(...args);setTimeout(ensureControls,0);return out};
  const baseRenderPages=renderPages;
  renderPages=function(...args){const out=baseRenderPages(...args);setTimeout(ensureControls,0);return out};

  ensureControls();
})();
