(() => {
  if (typeof isCoach !== 'function') return;

  const realIsCoach = isCoach;
  let previewCoach = false;

  try {
    previewCoach = localStorage.getItem('gaintrain_coach_preview') === '1';
  } catch (_) {}

  const isIvan = () => typeof currentProfile !== 'undefined' && currentProfile?.name === 'Ivan' && !realIsCoach();
  if (!isIvan()) previewCoach = false;

  isCoach = () => realIsCoach() || (previewCoach && isIvan());

  const style = document.createElement('style');
  style.textContent = `
    .coach-preview-btn{white-space:nowrap}
    .coach-preview-banner{margin:10px auto 0;max-width:1100px;padding:9px 12px;border:1px solid #d7b45a;border-radius:10px;background:#fff7db;font-size:12px;display:flex;justify-content:space-between;align-items:center;gap:10px}
    .coach-preview-banner b{font-weight:900}.coach-preview-banner .muted{font-size:11px}
    @media(max-width:650px){.coach-preview-btn{font-size:9px!important;padding:6px 7px!important}.coach-preview-banner{margin:7px 8px 0;align-items:flex-start;flex-direction:column}}
  `;
  document.head.appendChild(style);

  const savePreview = () => {
    try { localStorage.setItem('gaintrain_coach_preview', previewCoach ? '1' : '0'); } catch (_) {}
  };

  const ensureControls = () => {
    const headrow = document.querySelector('header .headrow');
    if (!headrow || !isIvan()) return;

    let btn = document.getElementById('coachPreviewBtn');
    if (!btn) {
      btn = document.createElement('button');
      btn.id = 'coachPreviewBtn';
      btn.className = 'btn small secondary coach-preview-btn';
      btn.onclick = () => window.toggleCoachPreview();
      headrow.appendChild(btn);
    }
    btn.textContent = previewCoach ? 'Tilbake til Ivan' : 'Vis som Coach Amund';

    let banner = document.getElementById('coachPreviewBanner');
    if (previewCoach) {
      if (!banner) {
        banner = document.createElement('div');
        banner.id = 'coachPreviewBanner';
        banner.className = 'coach-preview-banner';
        const tabs = document.getElementById('tabs');
        if (tabs?.parentNode) tabs.parentNode.insertBefore(banner, tabs.nextSibling);
        else document.body.insertBefore(banner, document.body.firstChild);
      }
      banner.innerHTML = `<div><b>👀 Forhåndsvisning: Coach Amund</b><div class="muted">Du er fortsatt innlogget som Ivan. Dette viser coach-oppsettet uten å bytte konto.</div></div><button class="btn small secondary" onclick="toggleCoachPreview()">Tilbake til Ivan</button>`;
    } else if (banner) {
      banner.remove();
    }
  };

  window.toggleCoachPreview = () => {
    if (!isIvan()) return;
    previewCoach = !previewCoach;
    savePreview();
    if (typeof renderTabs === 'function') renderTabs();
    if (typeof renderPages === 'function') renderPages();
    if (typeof showPage === 'function') showPage('home');
    ensureControls();
  };

  const realCreateChallenge = typeof createChallenge === 'function' ? createChallenge : null;
  if (realCreateChallenge) {
    window.createChallenge = async (...args) => {
      if (previewCoach && isIvan()) {
        alert('Dette er bare forhåndsvisning av Coach Amund. Logg inn som Amund for å publisere en ekte challenge.');
        return;
      }
      return realCreateChallenge(...args);
    };
  }

  const realFinishChallenge = typeof finishChallenge === 'function' ? finishChallenge : null;
  if (realFinishChallenge) {
    window.finishChallenge = async (...args) => {
      if (previewCoach && isIvan()) {
        alert('Dette er bare forhåndsvisning. En ekte challenge kan bare avsluttes fra Amund sin konto.');
        return;
      }
      return realFinishChallenge(...args);
    };
  }

  const baseRenderTabs = renderTabs;
  renderTabs = function(...args) {
    const out = baseRenderTabs(...args);
    setTimeout(ensureControls, 0);
    return out;
  };

  const baseRenderPages = renderPages;
  renderPages = function(...args) {
    const out = baseRenderPages(...args);
    setTimeout(ensureControls, 0);
    return out;
  };

  ensureControls();
  if (typeof currentProfile !== 'undefined' && currentProfile && previewCoach && isIvan()) {
    renderTabs();
    renderPages();
    showPage('home');
  }
})();
