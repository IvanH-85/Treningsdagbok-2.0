(() => {
  const KEY='gaintrain_theme';
  const actions=['YEAH BABY!! 🔥','LIGHT WEIGHT, BABY!! 💪','AIN’T NOTHING BUT A PEANUT!! 🥜','LET’S GOOOO!! 🚂','JERN FLYTTA!! ⛓️','NO PAIN. NO GAINTRAIN. 🔥','IRON MOVED TODAY!! 💥','TRAIN HARD. BRAG HARDER. 🏆'];
  let last=-1;
  const style=document.createElement('style');
  style.id='gaintrainActionStyles';
  style.textContent=`
    /* Independent visual layer: all existing workouts, forms and syncing remain unchanged. */
    body.gt-action {
      --b:#f58b24;--lb:#394758;--y:#674622;--gr:#303947;--line:#465366;
      --bg:#11151b;--ok:#1e493d;--reply:#252f3b;
      background:radial-gradient(ellipse at 90% -10%,#522818 0,transparent 38%),linear-gradient(145deg,#151c25,#11151b 58%,#1b2029);
      color:#edf3fc;color-scheme:dark;
    }
    body.gt-action header{background:linear-gradient(112deg,#10151c 0%,#202936 62%,#442719 100%)!important;border-bottom:2px solid #ed8426;box-shadow:0 5px 20px #0007}
    body.gt-action header .gaintrain-name{color:#ff9b32;text-shadow:0 0 14px #ff8c2740;letter-spacing:.04em}
    body.gt-action header .gaintrain-subtitle{color:#ffd5a9}
    body.gt-action .card{background:#202833;border:1px solid #465264;box-shadow:0 4px 18px #0005;color:#edf3fc}
    body.gt-action .card h2,body.gt-action .card h3{color:#f7f9fe}
    body.gt-action .muted,body.gt-action .lastdate,body.gt-action .home-test-date,body.gt-action .unit,
    body.gt-action .coach-challenge-meta,body.gt-action .wager-mini,body.gt-action .next-workout-sub{color:#bdc9d9}
    body.gt-action .tab{background:#293444;color:#e9f1fb;border:1px solid #485568}
    body.gt-action .tab.active{background:linear-gradient(130deg,#f59a30,#d9572b);color:#17181b;border-color:#ffa74a;box-shadow:0 3px 0 #8d3b1f;font-weight:900}
    body.gt-action .btn{background:linear-gradient(130deg,#f59a30,#d96a2e);color:#15191f;border:1px solid #ffb452;box-shadow:0 2px 0 #8b431e;font-weight:900}
    body.gt-action .btn.secondary{background:#334155;color:#f0f5fc;border-color:#566579;box-shadow:none}
    body.gt-action .btn.danger{background:#5e2525;color:#fff2ec;border-color:#a74a40}
    body.gt-action .badge,body.gt-action .fun-tag,body.gt-action .wager-tag{background:#394a61;color:#f6f8fe}
    body.gt-action input,body.gt-action textarea,body.gt-action select{background:#141b24;color:#f5f8fe;border-color:#69778a}
    body.gt-action input::placeholder,body.gt-action textarea::placeholder{color:#a2aec0}
    body.gt-action input:focus-visible,body.gt-action textarea:focus-visible,body.gt-action select:focus-visible,body.gt-action button:focus-visible{outline:2px solid #ffa43b;outline-offset:2px}
    body.gt-action .person button{background:#293444;color:#f5f7fc;border-color:#b77a40}
    body.gt-action .person button.active{background:#d66b29;color:#161b21}
    body.gt-action .stat,body.gt-action .personcard,body.gt-action .workout,body.gt-action .round,
    body.gt-action .old-workout,body.gt-action .profile-history-old,body.gt-action .home-test-card,
    body.gt-action .test-block,body.gt-action .fun-panel,body.gt-action .fun-award,
    body.gt-action .wager-box,body.gt-action .gt-challenge-result,body.gt-action .gt-coach-history-item,
    body.gt-action .coach-challenge-history-item{background:#293442;color:#ecf2fa;border-color:#4f6074}
    body.gt-action .hist>div{background:#293442;color:#eef3fa}
    body.gt-action .hist .h,body.gt-action th{background:#3b4b60;color:#fff}
    body.gt-action td{background:#263240;color:#f3f7ff}
    body.gt-action .kv{background:#39404a;color:#eaf0f8}
    body.gt-action .edit{background:#5c4727;color:#fff1cd}
    body.gt-action .warmup,body.gt-action .test-intro,body.gt-action .coach-help,
    body.gt-action .comment-notice,body.gt-action .next-workout-card,
    body.gt-action .fun-secret,body.gt-action .espen-preview-banner,
    body.gt-action .coach-preview-banner{background:#253549;color:#f4f7fc;border-color:#687c94}
    body.gt-action .comment{background:#1e463b;color:#f0fff4}
    body.gt-action .comment.reply{background:#273749;color:#e6f1ff}
    body.gt-action .challenge-card,body.gt-action .coach-challenge-active{background:#273140;border-color:#ed8934;color:#f2f6ff}
    body.gt-action .challenge-reward{background:#543c24;color:#fff1d9}
    body.gt-action .challenge-done{background:#1d5136;color:#f0ffe8}
    body.gt-action .challenge-msg,body.gt-action .challenge-reward,
    body.gt-action .gt-challenge-statusline{color:#f1d7b4}
    body.gt-action .challenge-bar,body.gt-action .week-progress{background:#425166}
    body.gt-action .challenge-bar span,body.gt-action .week-progress span{background:linear-gradient(90deg,#e65c2b,#ffa63d)}
    body.gt-action .week-card,body.gt-action .home-test-card{background:#293442;border-color:#53647a;color:#eef4fd}
    body.gt-action .week-row,body.gt-action .home-test-row,body.gt-action .lastrow,
    body.gt-action .fun-line,body.gt-action .wager-debt{border-color:#45556a}
    body.gt-action .week-name,body.gt-action .home-test-name{color:#fff}
    body.gt-action .week-ok{color:#7ee1a1}.gt-action .week-wait{color:#ffcb7c}
    body.gt-action .brag-item{border-color:#48586e}
    body.gt-action .brag-text{color:#ffc078}
    body.gt-action .brag-date{color:#bfcbd9}
    body.gt-action .pb{background:#70471c;color:#ffe8bd}
    body.gt-action .celebratebox,body.gt-action .espen-greet-box{background:linear-gradient(140deg,#303a48,#171e28)!important;border:2px solid #f58c2b;box-shadow:0 16px 70px #000a;color:#f5f8fc}
    body.gt-action .celebratetext,body.gt-action .espen-greet-text{color:#ffa33e!important;text-shadow:0 1px 10px #df6c2540}
    body.gt-action .hearthint,body.gt-action .espen-greet-sub{color:#c5d0e0}
    body.gt-action .espen-greet-kicker{color:#ffad51}
    body.gt-action .heartbtn,body.gt-action .espen-greet-heart{color:#ff6a43}
    body.gt-action .toast{background:#f38b2a;color:#15181f}
    body.gt-action details>summary{color:#f4f7fb}
    body.gt-action .plan.clickable:hover{background:#344252}
    body.gt-action .fun-award.locked{opacity:.48}
    body.gt-action .gt-challenge-stamp{background:#202833cd;text-shadow:0 2px 3px #0008}
    body.gt-action .gt-stamp-failed{color:#ff6957}
    body.gt-action .gt-stamp-partial{color:#ffbb58}
    body.gt-action .gt-stamp-completed{color:#7fe3a2}
    /* Calendar day text must remain readable even if a calendar module hardcodes light backgrounds. */
    body.gt-action .cal-day,body.gt-action .calendar-day,body.gt-action .calendar-cell{color:#1b2533}
    body.gt-action .calendar-modal,body.gt-action .cal-modal{color:#192333}
    #gaintrainThemeRow{display:flex;justify-content:center;gap:8px;align-items:center;flex-wrap:wrap;padding:8px 10px;margin:-1px auto 8px;max-width:900px}
    #gaintrainThemeRow .gt-theme-label{font-size:11px;font-weight:900;letter-spacing:.1em}
    #gaintrainThemeRow .gt-theme-buttons{display:flex;gap:4px;padding:4px;border-radius:12px;border:1px solid #c7d3e5;background:#eef2f8}
    #gaintrainThemeRow .gt-theme-btn{border:0;border-radius:9px;background:transparent;color:#31415c;padding:9px 13px;font-size:12px;font-weight:900;min-height:38px;cursor:pointer}
    #gaintrainThemeRow .gt-theme-btn[aria-pressed="true"]{background:#2f5597;color:white;box-shadow:0 2px 6px #0002}
    body.gt-action #gaintrainThemeRow .gt-theme-label{color:#ffac53}
    body.gt-action #gaintrainThemeRow .gt-theme-buttons{background:#28323f;border-color:#5b687a}
    body.gt-action #gaintrainThemeRow .gt-theme-btn{color:#e4ebf5}
    body.gt-action #gaintrainThemeRow .gt-theme-btn[aria-pressed="true"]{background:#e8792c;color:#17191c}
    #gaintrainActionMotto{text-align:center;font-weight:900;font-size:11px;letter-spacing:.12em;color:#ffa846;padding:2px 10px 10px;display:none}
    body.gt-action #gaintrainActionMotto{display:block}
    @media(max-width:650px){#gaintrainThemeRow{padding:7px 8px;margin-bottom:7px}#gaintrainThemeRow .gt-theme-btn{font-size:11px;padding:8px 10px}}
    @media(prefers-reduced-motion:reduce){body.gt-action *,body.gt-action *::before,body.gt-action *::after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
  `;
  document.head.appendChild(style);
  let mode='classic';
  try{mode=localStorage.getItem(KEY)==='action'?'action':'classic'}catch(_){}
  const ensure=()=>{
    const header=document.querySelector('header');
    if(!header)return;
    let row=document.getElementById('gaintrainThemeRow');
    if(!row){
      row=document.createElement('div');
      row.id='gaintrainThemeRow';
      row.innerHTML='<span class="gt-theme-label">VELG DRAKT</span><div class="gt-theme-buttons" role="group" aria-label="Velg GainTrain-tema"><button type="button" class="gt-theme-btn" data-theme="classic">CLASSIC</button><button type="button" class="gt-theme-btn" data-theme="action">🔥 ACTION</button></div>';
      row.querySelectorAll('button').forEach(btn=>btn.addEventListener('click',()=>apply(btn.dataset.theme)));
    }
    if(row.parentNode!==header.parentNode||row.previousElementSibling!==header)header.insertAdjacentElement('afterend',row);
    let motto=document.getElementById('gaintrainActionMotto');
    if(!motto){motto=document.createElement('div');motto.id='gaintrainActionMotto';motto.textContent='⛓️ NO PAIN. NO GAINTRAIN. 🔥';row.insertAdjacentElement('afterend',motto)}
    row.querySelectorAll('button').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.theme===mode)));
  };
  const apply=next=>{
    mode=next==='action'?'action':'classic';
    document.body.classList.toggle('gt-action',mode==='action');
    document.documentElement.style.colorScheme=mode==='action'?'dark':'light';
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.content=mode==='action'?'#151b24':'#2f5597';
    try{localStorage.setItem(KEY,mode)}catch(_){}
    ensure();
  };
  window.setGainTrainTheme=apply;
  apply(mode);
  if(typeof showCongrats==='function'){
    const base=showCongrats;
    showCongrats=function(...args){
      const out=base(...args);
      if(mode==='action'){
        let idx;do{idx=Math.floor(Math.random()*actions.length)}while(actions.length>1&&idx===last);
        last=idx;
        const el=document.getElementById('celebrateText');
        if(el)el.textContent=actions[idx];
      }
      return out;
    };
  }
  const observer=new MutationObserver(()=>{
    if(!document.getElementById('gaintrainThemeRow'))ensure();
  });
  observer.observe(document.body,{childList:true});
})();