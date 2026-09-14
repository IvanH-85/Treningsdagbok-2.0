(() => {
  if (typeof sb === 'undefined' || typeof stateByName !== 'function') return;

  const style=document.createElement('style');
  style.textContent=`
    .gt-challenge-stamped{position:relative;overflow:hidden}
    .gt-challenge-stamp{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-16deg);z-index:6;border:5px solid currentColor;border-radius:10px;padding:8px 16px;font-size:30px;font-weight:1000;letter-spacing:.06em;line-height:1;opacity:.82;pointer-events:none;text-transform:uppercase;white-space:nowrap}
    .gt-stamp-failed{color:#b3261e}.gt-stamp-partial{color:#a66700}.gt-stamp-completed{color:#247a3b}
    .gt-challenge-result{border:2px solid var(--line);border-radius:13px;padding:12px;background:#fafbfe;margin-top:9px}
    .gt-challenge-result-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.gt-challenge-result-title{font-size:16px;font-weight:900}
    .gt-challenge-statusline{font-size:11px;font-weight:800;margin-top:4px}.gt-challenge-result-row{margin-top:9px}.gt-challenge-result-rowhead{display:flex;justify-content:space-between;gap:8px;font-size:12px;font-weight:800}
    .gt-challenge-history{margin-top:12px}.gt-challenge-history>summary{cursor:pointer;font-size:13px;padding:8px 0;font-weight:900}
    .gt-history-item{border-top:1px solid #e4e8ef;padding:5px 0}.gt-history-item>summary{cursor:pointer;padding:7px 0;font-size:12px;display:flex;justify-content:space-between;gap:8px;align-items:center}
    .gt-history-body{padding:0 0 10px}.gt-history-filters{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 12px}.gt-history-filter{border:0;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:800;background:#eef2f8;color:#24334d;cursor:pointer}.gt-history-filter.active{background:var(--b);color:#fff}
    .gt-coach-history-item{border:1px solid var(--line);border-radius:11px;padding:10px;background:#fafbfe;margin-bottom:8px;position:relative;overflow:hidden}
    @media(max-width:650px){.gt-challenge-stamp{font-size:25px;border-width:4px;padding:7px 12px}}
  `;
  document.head.appendChild(style);

  let gtChallenges=[],gtProgress=[];
  const today=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`};
  const inRange=(x,s,e)=>{const dt=x?.date||'';return dt>=s&&dt<=e};
  const cardio=s=>[...(s.w2||[]),...(s.w4||[])];
  const people=ch=>ch.assignee==='Begge'?['Ivan','Espen']:[ch.assignee];

  const autoProgress=(ch,name)=>{
    const s=stateByName(name)||{},start=ch.start_date,end=ch.end_date;
    if(ch.metric==='strength1_sessions')return (s.w1||[]).filter(x=>inRange(x,start,end)).length;
    if(ch.metric==='strength2_sessions')return (s.w3||[]).filter(x=>inRange(x,start,end)).length;
    if(ch.metric==='cardio_sessions')return cardio(s).filter(x=>inRange(x,start,end)).length;
    if(ch.metric==='all_sessions')return ['w1','w2','w3','w4'].reduce((n,k)=>n+(s[k]||[]).filter(x=>inRange(x,start,end)).length,0);
    if(ch.metric==='cardio_minutes')return cardio(s).filter(x=>inRange(x,start,end)).reduce((n,x)=>n+(Number(x.time)||0),0);
    if(ch.metric==='cardio_km')return cardio(s).filter(x=>inRange(x,start,end)).reduce((n,x)=>n+(Number(x.dist)||0),0);
    const p=typeof profileByName==='function'?profileByName(name):null;
    return gtProgress.filter(x=>Number(x.challenge_id)===Number(ch.id)&&x.user_id===p?.id&&x.entry_date>=start&&x.entry_date<=end).reduce((n,x)=>n+(Number(x.amount)||0),0);
  };

  const fmt=(v,unit)=>{const n=Number(v)||0;return (unit==='km'?n.toFixed(1).replace('.',','):Math.round(n).toLocaleString('no-NO'))+' '+(unit||'')};
  const statusInfo={
    active:{label:'ACTIVE',line:'Pågår',cls:''},
    completed:{label:'COMPLETED',line:'Fullført',cls:'gt-stamp-completed'},
    partial:{label:'DELVIS',line:'Delvis fullført',cls:'gt-stamp-partial'},
    failed:{label:'FAILED',line:'Ingen fullførte challengen',cls:'gt-stamp-failed'}
  };

  const statusFor=ch=>{
    const target=Number(ch.target)||0,ps=people(ch).map(name=>({name,value:autoProgress(ch,name)}));
    const ended=!ch.active||today()>ch.end_date;
    if(ch.assignee==='Begge'&&ch.team_mode==='team'){
      const done=ps.reduce((n,p)=>n+p.value,0)>=target;
      if(done)return {key:'completed',ps};
      return {key:ended?'failed':'active',ps};
    }
    const done=ps.filter(p=>p.value>=target).length;
    if(done===ps.length&&ps.length)return {key:'completed',ps};
    if(!ended)return {key:'active',ps};
    if(done>0&&ps.length>1)return {key:'partial',ps};
    return {key:'failed',ps};
  };

  const stamp=key=>key==='active'?'':`<div class="gt-challenge-stamp ${statusInfo[key].cls}">${statusInfo[key].label}</div>`;
  const bar=(v,target)=>Math.min(100,Math.round((Number(v)||0)/(Number(target)||1)*100));

  const resultCard=(ch,compact=false)=>{
    const st=statusFor(ch),target=Number(ch.target)||0;
    let rows='';
    if(ch.assignee==='Begge'&&ch.team_mode==='team'){
      const total=st.ps.reduce((n,p)=>n+p.value,0);
      rows=`<div class="gt-challenge-result-row"><div class="gt-challenge-result-rowhead"><span>Ivan + Espen sammen</span><span>${fmt(total,ch.unit)} / ${fmt(target,ch.unit)}</span></div><div class="challenge-bar"><span style="width:${bar(total,target)}%"></span></div></div>`;
    }else rows=st.ps.map(p=>`<div class="gt-challenge-result-row"><div class="gt-challenge-result-rowhead"><span>${esc(p.name)}${p.value>=target?' ✓':''}</span><span>${fmt(p.value,ch.unit)} / ${fmt(target,ch.unit)}</span></div><div class="challenge-bar"><span style="width:${bar(p.value,target)}%"></span></div></div>`).join('');

    return `<div class="gt-challenge-result gt-challenge-stamped" data-challenge-status="${st.key}">
      ${stamp(st.key)}
      <div class="gt-challenge-result-head"><div><div class="gt-challenge-result-title">${esc(ch.title)}</div><div class="muted">${esc(ch.start_date)} – ${esc(ch.end_date)} • ${esc(ch.assignee)}${ch.assignee==='Begge'?' • '+(ch.team_mode==='team'?'sammenlagt':'hver for seg'):''}</div><div class="gt-challenge-statusline">${today()>ch.end_date?'Utløpt • ':''}${statusInfo[st.key].line}</div></div><span class="badge">${statusInfo[st.key].label}</span></div>
      ${!compact&&ch.message?`<div class="challenge-msg">«${esc(ch.message)}»</div>`:''}
      ${rows}
      ${ch.reward?`<div class="challenge-reward">🎁 <b>Premie:</b> ${esc(ch.reward)}</div>`:''}
    </div>`;
  };

  const historyHtml=arr=>{
    if(!arr.length)return '';
    return `<details class="gt-challenge-history challenge-old"><summary>Tidligere challenges (${arr.length})</summary>${arr.map(ch=>{const st=statusFor(ch);return `<details class="gt-history-item"><summary><span><b>${esc(ch.title)}</b><br><span class="muted">${esc(ch.start_date)} – ${esc(ch.end_date)}</span></span><span class="badge">${statusInfo[st.key].label}</span></summary><div class="gt-history-body">${resultCard(ch)}</div></details>`}).join('')}</details>`;
  };

  const load=async()=>{
    const [c,p]=await Promise.all([
      sb.from('coach_challenges').select('*').order('created_at',{ascending:false}),
      sb.from('challenge_progress_entries').select('*').order('created_at',{ascending:true})
    ]);
    if(!c.error)gtChallenges=c.data||[];
    if(!p.error)gtProgress=p.data||[];
    const expired=gtChallenges.filter(x=>x.active&&today()>x.end_date);
    if(expired.length){
      const ids=expired.map(x=>x.id);
      const r=await sb.from('coach_challenges').update({active:false}).in('id',ids);
      if(!r.error)gtChallenges=gtChallenges.map(x=>ids.includes(x.id)?{...x,active:false}:x);
    }
  };

  const decorateStart=()=>{
    const home=document.getElementById('home');if(!home)return;
    const card=[...home.querySelectorAll(':scope > .card')].find(c=>(c.querySelector('h2')?.textContent||'').includes('Coach Amunds challenge'));
    if(!card)return;
    card.querySelectorAll('.gt-challenge-history').forEach(x=>x.remove());
    const existingOld=card.querySelector('.challenge-old'); if(existingOld)existingOld.remove();

    const active=gtChallenges.find(x=>x.active&&today()<=x.end_date);
    const past=gtChallenges.filter(x=>!active||Number(x.id)!==Number(active.id)).filter(x=>!x.active||today()>x.end_date);

    const currentBox=card.querySelector('.challenge-card');
    if(active&&currentBox){
      const st=statusFor(active);
      currentBox.classList.add('gt-challenge-stamped');
      currentBox.querySelector('.gt-challenge-stamp')?.remove();
      if(st.key!=='active')currentBox.insertAdjacentHTML('beforeend',stamp(st.key));
    }else if(!active){
      if(currentBox)currentBox.remove();
      const plain=[...card.children].find(x=>x.classList?.contains('muted')&&/Ingen aktiv/.test(x.textContent||''));
      if(!plain){
        const h=card.querySelector('h2');
        h?.insertAdjacentHTML('afterend','<div class="muted">Ingen aktiv challenge akkurat nå.</div>');
      }
    }
    card.insertAdjacentHTML('beforeend',historyHtml(past));
  };

  window.filterChallengeHistory=status=>{
    document.querySelectorAll('.gt-history-filter').forEach(b=>b.classList.toggle('active',b.dataset.filter===status));
    document.querySelectorAll('#coachChallenges .gt-coach-history-item').forEach(el=>{el.style.display=status==='all'||el.dataset.status===status?'block':'none'});
  };

  const decorateCoachTab=()=>{
    const root=document.getElementById('coachChallenges');if(!root)return;
    const card=[...root.querySelectorAll(':scope > .card')].find(c=>(c.querySelector('h2')?.textContent||'').includes('Challenge-historikk'));
    if(!card)return;
    const arr=gtChallenges;
    card.innerHTML=`<h2>Challenge-historikk</h2><div class="muted">Alle challenges lagres her med sluttstatus og faktisk resultat.</div>
      <div class="gt-history-filters">
        <button class="gt-history-filter active" data-filter="all" onclick="filterChallengeHistory('all')">Alle</button>
        <button class="gt-history-filter" data-filter="completed" onclick="filterChallengeHistory('completed')">Fullført</button>
        <button class="gt-history-filter" data-filter="partial" onclick="filterChallengeHistory('partial')">Delvis</button>
        <button class="gt-history-filter" data-filter="failed" onclick="filterChallengeHistory('failed')">Failed</button>
      </div>
      <div>${arr.map(ch=>{const st=statusFor(ch);return `<div class="gt-coach-history-item ${st.key!=='active'?'gt-challenge-stamped':''}" data-status="${st.key}">${stamp(st.key)}<div class="coach-challenge-history-head"><div><b>${esc(ch.title)}</b><div class="coach-challenge-meta">${esc(ch.start_date)} – ${esc(ch.end_date)} • ${esc(ch.assignee)}</div></div><span class="badge">${statusInfo[st.key].label}</span></div><div class="coach-challenge-meta">Mål ${fmt(ch.target,ch.unit)}</div>${st.ps.map(p=>`<div class="coach-challenge-meta">${esc(p.name)}: <b>${fmt(p.value,ch.unit)}</b></div>`).join('')}${ch.reward?`<div class="coach-challenge-reward">🎁 ${esc(ch.reward)}</div>`:''}${ch.active&&st.key==='active'?`<div class="actions"><button class="btn small secondary" onclick="finishChallenge(${ch.id})">Avslutt challenge</button></div>`:''}</div>`}).join('')}</div>`;
  };

  const refresh=async()=>{await load();decorateStart();decorateCoachTab()};

  if(typeof renderHome==='function'){
    const baseRenderHome=renderHome;
    renderHome=function(...args){const out=baseRenderHome(...args);setTimeout(refresh,80);return out};
  }
  if(typeof renderCoachChallengeTab==='function'){
    const baseCoach=renderCoachChallengeTab;
    window.renderCoachChallengeTab=async function(...args){const out=await baseCoach(...args);await refresh();return out};
  }
  if(typeof startSession==='function'){
    const baseStart=startSession;
    startSession=async function(...args){const out=await baseStart(...args);await refresh();return out};
  }

  if(typeof currentProfile!=='undefined'&&currentProfile)setTimeout(refresh,150);
})();