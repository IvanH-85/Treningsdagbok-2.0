(() => {
  // Action v2 is an additive, Action-only layer. Classic is deliberately untouched.
  if(typeof window.setGainTrainTheme!=='function')return;
  const style=document.createElement('style');
  style.id='gtActionV2Styles';
  style.textContent=`
    /* Stålgrå kalender: aldri lys tekst på hvite ruter. */
    body.gt-action .gtcal-card{border-color:#dd8233;box-shadow:0 0 0 1px #a25c2a,0 9px 30px #0007}
    body.gt-action .gtcal-dow{color:#e7eef7}
    body.gt-action .gtcal-weekno{background:#354358;color:#fff;border:1px solid #586a81}
    body.gt-action .gtcal-day{background:#4b5b70!important;color:#fff!important;border:1px solid #76869b!important}
    body.gt-action .gtcal-day.out{background:#354254!important;opacity:.60}
    body.gt-action .gtcal-day.today{outline:2px solid #ffae49;outline-offset:1px;box-shadow:inset 0 0 0 1px #ffae49}
    body.gt-action .gtcal-date{color:#fff!important;text-shadow:0 1px 2px #101722}
    body.gt-action .gtcal-event,body.gt-action .gtcal-event.plan{background:#344255!important;color:#f7faff!important;border:1px solid #7d8ca0}
    body.gt-action .gtcal-event.done{background:#254737!important;color:#e9fff2!important;border-color:#4a9773}
    body.gt-action .gtcal-challenge{background:linear-gradient(110deg,#ed8929,#b95524)!important;color:#151b23!important;border:1px solid #ffbb69!important;text-shadow:none;box-shadow:0 2px 8px #0006}
    body.gt-action .gtcal-title{color:#fff}
    body.gt-action .gtcal-empty{color:#d4deeb}
    body.gt-action .gtcal-modalbox{background:#293546!important;color:#f5f8ff!important;border:2px solid #ef963e;box-shadow:0 22px 80px #000b}
    body.gt-action .gtcal-modalbox h2,body.gt-action .gtcal-modalbox h3{color:#fff!important}
    body.gt-action .gtcal-modalbox .muted{color:#c9d5e5!important}
    body.gt-action .gtcal-close{background:#45566e!important;color:#fff!important}
    body.gt-action .gtcal-detail-item{border-color:#586a7e;color:#fff}
    body.gt-action .gtcal-detail-item.workout{background:#36465a!important;color:#fff!important}
    body.gt-action .gtcal-detail-item.workout:active{background:#4b6078!important}
    body.gt-action .gtcal-chinfo{background:#594227!important;color:#ffefd4!important}
    body.gt-action .gtcal-chinfo .muted{color:#f4d6aa!important}
    /* Contrast for other white/hardcoded light subpanels and forms. */
    body.gt-action .last-workout,body.gt-action .editing,body.gt-action .week-card,
    body.gt-action .challenge-old-item,body.gt-action .profile-history-latest,
    body.gt-action .old-detail{background:#303d4f!important;color:#f4f7ff!important;border-color:#65758b}
    body.gt-action .profile-history-old>summary,body.gt-action .old-workout>summary{background:#354459;color:#f5f8fc}
    body.gt-action .gt-history-item,body.gt-action .gt-challenge-result{color:#f6f9ff}
    body.gt-action .gt-history-filter{background:#46566e;color:#fff}
    body.gt-action .gt-history-filter.active{background:#ee8d30;color:#141a21}
    body.gt-action .replylink{color:#ffb65f}
    body.gt-action .round input,body.gt-action .round select{color:#fff}
    body.gt-action .challenge-pop-box,body.gt-action .coach-activity-alert-box,
    body.gt-action .coach-alert-box{background:#263241!important;color:#f5f8ff!important;border:2px solid #f69c38}
    body.gt-action .challenge-pop-text,body.gt-action .challenge-pop-title{color:#ffb150}
    body.gt-action .challenge-pop-meta,body.gt-action .challenge-pop-kicker{color:#e0e9f5}
    body.gt-action .challenge-pop-reward{background:#594124;color:#fff0d5}
    /* Action Hero finish: panel frames + restrained flares. */
    body.gt-action header{background:linear-gradient(125deg,#141a24 0%,#243142 53%,#44251c 100%)!important;box-shadow:0 4px 0 #b95b2a,0 12px 35px #0009}
    body.gt-action header .gaintrain-name{font-weight:1000;letter-spacing:.075em;text-shadow:0 1px 0 #60290f,0 0 16px #ff8b3588}
    body.gt-action header .gaintrain-title{letter-spacing:.018em}
    body.gt-action header .gaintrain-subtitle{color:#fbd4a9!important}
    body.gt-action header .brandlogo{filter:drop-shadow(0 0 7px #f58f3460)}
    body.gt-action #gaintrainActionMotto{font-weight:1000;text-shadow:0 0 12px #ff9d2170;letter-spacing:.10em}
    body.gt-action #home > .card,body.gt-action #bragCard,body.gt-action #gaintrainFun > .card,
    body.gt-action .fun-trophy-holder > .card,body.gt-action #ivan > .card:first-child,
    body.gt-action #espen > .card:first-child{
      position:relative;border:1px solid #985e34;box-shadow:inset 0 1px 0 #dfa04c35,0 0 0 1px #2a3643,0 5px 21px #0008,0 0 16px #f58a2413
    }
    body.gt-action #home > .card::before,body.gt-action #bragCard::before,
    body.gt-action #gaintrainFun > .card::before,body.gt-action .fun-trophy-holder > .card::before{
      content:'';display:block;width:38%;height:3px;margin:-14px 0 11px -14px;
      background:linear-gradient(90deg,#f18a27,#dc592c,transparent);border-radius:4px
    }
    body.gt-action #home h2,body.gt-action #gaintrainFun h2,body.gt-action .fun-trophy-holder h2{
      color:#ffbc6b;letter-spacing:.025em;text-shadow:0 0 13px #ea773226
    }
    body.gt-action #bragCard{border-color:#efa13e;box-shadow:0 0 20px #ff8e2a28,0 7px 22px #0007}
    body.gt-action #gaintrainFun .card:has(.fun-secret){border-color:#ca7630}
    body.gt-action .tab.active{box-shadow:0 3px 0 #6e361e,0 0 12px #ee8c3555}
    body.gt-action .btn:active{transform:translateY(1px)}
    body.gt-action .gt-challenge-stamp{border-width:5px;filter:drop-shadow(0 3px 4px #0008)}
    /* Intro overlay only on explicit Classic -> Action switch. */
    .gt-v2-intro{position:fixed;inset:0;z-index:250;display:grid;place-items:center;
      background:radial-gradient(circle at center,#f5813650 0%,#150e10ed 49%,#090c13f5 100%);pointer-events:none;overflow:hidden}
    .gt-v2-intro-core{text-align:center;padding:22px 16px;position:relative;z-index:2;animation:gtV2Punch 1.12s ease-out both}
    .gt-v2-intro-kicker{color:#fff0d9;letter-spacing:.22em;font-weight:900;font-size:12px}
    .gt-v2-intro-title{font-weight:1000;font-size:clamp(27px,8vw,52px);line-height:1.06;color:#ffad45;
      text-shadow:0 2px 0 #6b270e,0 0 28px #ff7b2399;margin:12px 0 8px}
    .gt-v2-intro-shout{font-size:clamp(20px,6vw,35px);font-weight:1000;color:#fff}
    .gt-v2-intro-ring{position:absolute;top:50%;left:50%;width:100px;height:100px;border:16px solid #ff9b3b;
      border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 35px #f66f29;
      animation:gtV2Ring 1.13s ease-out both}
    .gt-v2-spark{position:absolute;left:50%;top:50%;width:6px;height:25px;border-radius:8px;
      background:linear-gradient(#fff0b4,#ff932a,#d94a25);transform:rotate(var(--a)) translateY(-12px);
      animation:gtV2Spark 1.08s ease-out both;animation-delay:var(--delay)}
    @keyframes gtV2Ring{0%{opacity:1;transform:translate(-50%,-50%) scale(.12)}65%{opacity:.9}100%{opacity:0;transform:translate(-50%,-50%) scale(12)}}
    @keyframes gtV2Spark{0%{opacity:0;transform:rotate(var(--a)) translateY(-12px) scale(.35)}
      18%{opacity:1}100%{opacity:0;transform:rotate(var(--a)) translateY(-52vh) scale(.25)}}
    @keyframes gtV2Punch{0%{opacity:0;transform:scale(.62)}25%{opacity:1;transform:scale(1.09)}
      54%{transform:scale(1)}88%{opacity:1}100%{opacity:0;transform:scale(1.03)}}
    .gt-v2-pb-flare{position:absolute;inset:0;pointer-events:none;border-radius:20px;
      box-shadow:inset 0 0 34px #ff9c2c80,0 0 35px #ee792c55;animation:gtV2Flare 1.3s ease-in-out infinite alternate}
    .gt-v2-pb-tag{display:inline-block;background:#653518;border:1px solid #ffb45a;color:#ffcf8b;
      border-radius:99px;padding:5px 9px;margin-bottom:9px;font-size:12px;font-weight:1000;letter-spacing:.09em}
    @keyframes gtV2Flare{from{opacity:.45}to{opacity:1}}
    @media(prefers-reduced-motion:reduce){.gt-v2-intro-core,.gt-v2-intro-ring,.gt-v2-spark,.gt-v2-pb-flare{animation:none!important}
      .gt-v2-intro-ring,.gt-v2-spark{display:none}}
    @media(max-width:650px){body.gt-action #home > .card::before,
      body.gt-action #bragCard::before,body.gt-action #gaintrainFun > .card::before,
      body.gt-action .fun-trophy-holder > .card::before{margin:-14px 0 11px -14px}}
  `;
  document.head.appendChild(style);
  const messages=['YEAH BABY!!','LIGHT WEIGHT, BABY!!','LET’S GOOOO!!','JERN FLYTTA!!','NO PAIN. NO GAINTRAIN.'];
  const blast=()=>{
    const old=document.getElementById('gtActionV2Intro');if(old)old.remove();
    const el=document.createElement('div');el.id='gtActionV2Intro';el.className='gt-v2-intro';
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const shout=messages[Math.floor(Math.random()*messages.length)];
    el.innerHTML='<div class="gt-v2-intro-ring"></div><div class="gt-v2-intro-core"><div class="gt-v2-intro-kicker">⛓️ NO PAIN. NO GAINTRAIN. 🔥</div><div class="gt-v2-intro-title">💥 ACTION MODE ACTIVATED!</div><div class="gt-v2-intro-shout">'+shout+'</div></div>';
    if(!reduced)for(let n=0;n<18;n++){
      const spark=document.createElement('span');spark.className='gt-v2-spark';
      spark.style.setProperty('--a',(n*20)+'deg');
      spark.style.setProperty('--delay',((n%3)*.035)+'s');el.appendChild(spark);
    }
    document.body.appendChild(el);
    setTimeout(()=>el.remove(),reduced?250:1200);
  };
  const prevSet=window.setGainTrainTheme;
  window.setGainTrainTheme=function(next){
    const change=next==='action'&&!document.body.classList.contains('gt-action');
    const out=prevSet(next);
    if(change)blast();
    return out;
  };
  /* The base app already calls showCongrats only for newly registered workouts, not edits.
     Detect a genuine new PB against all other entries of that workout type, not the first result. */
  const num=x=>{const n=Number(String(x??'').replace(',','.'));return Number.isFinite(n)?n:0};
  const secs=x=>typeof timeToSeconds==='function'?timeToSeconds(x):null;
  const isNewPb=()=>{
    if(!currentProfile||currentProfile.role==='coach'||typeof stateByName!=='function')return false;
    const s=stateByName(currentProfile.name)||{};
    const pools=[['w1',s.w1||[]],['w3',s.w3||[]],['w5',s.w5||[]]];
    const latest=pools.flatMap(([k,arr])=>arr.map((x,i)=>({k,x,i,arr}))).sort((a,b)=>(b.x.date||'').localeCompare(a.x.date||'')||b.i-a.i)[0];
    if(!latest||latest.arr.length<2)return false;
    const {k,x,arr,i}=latest,old=arr.filter((_,ix)=>ix!==i);
    if(k==='w3'&&!window.gaintrainCircleStandardMatch?.(x))return false;
    if(k==='w1')return ex1.some(e=>{
      const z=x.ex?.[e.name];if(!z)return false;
      const metric=y=>{const t=y.ex?.[e.name];if(!t)return 0;
        const weights=(t.w||[]).map(v=>String(v).toUpperCase()==='KV'?0:num(v));
        return e.kind==='max'?Math.max(0,...(t.r||[]).map(num)):Math.max(0,...weights)*1000+Math.max(0,...(t.r||[]).map(num))};
      const v=metric(x);return v>0&&v>Math.max(...old.map(metric));
    });
    if(k==='w3'){
      const metric=(y,key)=>key==='total'?secs(y.total):
        key==='push'?Math.max(0,...(y.rounds||[]).map(r=>num(r.ex?.Armheving?.rep))):
        num(y.rounds?.[0]?.ex?.[key]?.w);
      return ['total'].some(key=>{
        const v=metric(x,key),previous=old.map(y=>metric(y,key)).filter(n=>n!=null&&n>0);
        return v!=null&&v>0&&previous.length&&
          (key==='total'?v<Math.min(...previous):v>Math.max(...previous));
      });
    }
    if(k==='w5')return ['runTime','squats','pushups','boxJumps','pullups'].some(key=>{
      const v=key==='runTime'?secs(x[key]):num(x[key]);
      const previous=old.map(y=>key==='runTime'?secs(y[key]):num(y[key])).filter(n=>n!=null&&n>0);
      return v!=null&&v>0&&previous.length&&v>Math.max(...previous);
    });
    return false;
  };
  const decoratePb=()=>{
    if(!document.body.classList.contains('gt-action')||!isNewPb())return;
    const box=document.querySelector('#celebrate:not(.hidden) .celebratebox');
    if(!box)return;
    box.querySelector('.gt-v2-pb-tag')?.remove();box.querySelector('.gt-v2-pb-flare')?.remove();
    box.insertAdjacentHTML('afterbegin','<span class="gt-v2-pb-tag">🔥 NEW PERSONAL BEST 🔥</span><span class="gt-v2-pb-flare"></span>');
    const title=box.querySelector('#celebrateText');if(title)title.textContent='YEAH BABY!! NEW PB!!';
  };
  if(typeof showCongrats==='function'){
    const prevShow=showCongrats;
    showCongrats=function(...args){const out=prevShow(...args);decoratePb();return out};
  }
})();