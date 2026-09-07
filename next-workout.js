(() => {
  if (typeof renderPerson !== 'function' || typeof stateByName !== 'function') return;

  const style=document.createElement('style');
  style.textContent=`
    .next-workout-card{border:2px solid #c7d7f0;background:#f7faff}.next-workout-kicker{font-size:11px;font-weight:900;color:#5d6d87;text-transform:uppercase;letter-spacing:.05em}.next-workout-title{font-size:22px;font-weight:900;margin-top:4px}.next-workout-sub{font-size:12px;color:#677287;margin-top:4px}.next-workout-seq{display:flex;gap:5px;flex-wrap:wrap;margin-top:10px}.next-workout-step{font-size:10px;font-weight:800;padding:5px 7px;border-radius:999px;background:#eef2f7;color:#697489}.next-workout-step.active{background:#2f5fa8;color:#fff}.next-workout-arrow{font-size:10px;color:#8a94a5;align-self:center}
  `;
  document.head.appendChild(style);

  const trainingHistory=s=>{
    const out=[];
    const push=(k,kind)=>(s[k]||[]).forEach((x,i)=>out.push({k,kind,date:x.date||'',i}));
    push('w1','strength');push('w2','cardio');push('w4','cardio');push('w3','circle');
    out.sort((a,b)=>a.date.localeCompare(b.date)||a.i-b.i);
    return out;
  };

  const nextKind=s=>{
    const h=trainingHistory(s);
    if(!h.length)return 'strength';
    const last=h[h.length-1];
    if(last.kind==='strength'||last.kind==='circle')return 'cardio';
    for(let i=h.length-2;i>=0;i--){
      if(h[i].kind==='strength')return 'circle';
      if(h[i].kind==='circle')return 'strength';
    }
    return 'strength';
  };

  const info={
    strength:{label:'Styrke økt',icon:'💪🏼'},
    cardio:{label:'Kondisjonsøkt',icon:'🏃🏻‍♂️'},
    circle:{label:'Sirkeløkt',icon:'🔄'}
  };

  const reminderHtml=()=>{
    if(currentProfile?.name!=='Espen'||currentProfile?.role==='coach')return'';
    const n=nextKind(stateByName('Espen'));
    const seq=['strength','cardio','circle','cardio'];
    return `<div id="nextWorkoutCard" class="card next-workout-card"><div class="next-workout-kicker">Neste økt</div><div class="next-workout-title">${info[n].icon} ${info[n].label}</div><div class="next-workout-sub">Basert på øktene du har registrert, er dette neste steg i planen.</div><div class="next-workout-seq">${seq.map((x,i)=>`${i?'<span class="next-workout-arrow">→</span>':''}<span class="next-workout-step ${x===n?'active':''}">${info[x].label}</span>`).join('')}</div></div>`;
  };

  const baseRenderPerson=renderPerson;
  renderPerson=function(name){
    const out=baseRenderPerson(name);
    if(name!=='Espen'||currentProfile?.name!=='Espen'||currentProfile?.role==='coach')return out;
    const page=document.getElementById('espen');
    if(!page)return out;
    page.querySelector('#nextWorkoutCard')?.remove();
    const first=page.querySelector(':scope > .card');
    if(first){const wrap=document.createElement('div');wrap.innerHTML=reminderHtml();if(wrap.firstElementChild)first.insertAdjacentElement('afterend',wrap.firstElementChild)}
    return out;
  };

  if(typeof currentProfile!=='undefined'&&currentProfile?.name==='Espen')renderPerson('Espen');
})();