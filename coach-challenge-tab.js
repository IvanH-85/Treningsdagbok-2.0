(() => {
  if (typeof sb==='undefined' || typeof renderTabs!=='function' || typeof renderPages!=='function') return;

  const metricInfo={
    strength1_sessions:{label:'Styrke 1-økter',unit:'økt'},
    strength2_sessions:{label:'Styrke 2-økter',unit:'økt'},
    cardio_sessions:{label:'Kondisjonsøkter',unit:'økt'},
    all_sessions:{label:'Alle treningsøkter',unit:'økt'},
    cardio_minutes:{label:'Kondisjonsminutter',unit:'min'},
    cardio_km:{label:'Kondisjonsdistanse',unit:'km'},
    manual:{label:'Manuell registrering',unit:'stk'}
  };
  const ymd=d=>{const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
  const weekBounds=()=>{const now=new Date(),day=(now.getDay()+6)%7,start=new Date(now.getFullYear(),now.getMonth(),now.getDate()-day),end=new Date(start.getFullYear(),start.getMonth(),start.getDate()+6);return{start:ymd(start),end:ymd(end)}};
  const isPreview=()=>{try{return currentProfile?.name==='Ivan'&&localStorage.getItem('gaintrain_coach_preview')==='1'}catch(_){return false}};
  const coachMode=()=>isCoach();

  const style=document.createElement('style');
  style.textContent=`
    .coach-challenge-history{display:grid;gap:8px}.coach-challenge-history-item{border:1px solid var(--line);border-radius:10px;padding:10px;background:#fafbfe}.coach-challenge-history-head{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.coach-challenge-active{border:2px solid var(--b);background:#f7faff}.coach-challenge-meta{font-size:11px;color:#6b7589;margin-top:3px}.coach-challenge-reward{font-size:12px;margin-top:5px}
  `;
  document.head.appendChild(style);

  const ensureSection=()=>{
    const app=document.getElementById('appView'); if(!app)return null;
    let s=document.getElementById('coachChallenges');
    if(!s){s=document.createElement('section');s.id='coachChallenges';s.className='hidden';app.appendChild(s)}
    return s;
  };

  const formHtml=()=>{const b=weekBounds();return `<div class="card"><h2>Ny challenge</h2><div class="coach-help"><b>Kort forklart, Amund:</b> Velg hvem som skal utfordres, hva som skal måles, mål og frist – og legg gjerne inn en premie. GainTrain teller treningsøkter, kondisjonsminutter og kilometer automatisk. For ting som skritt eller burpees velger du <b>Manuell registrering</b>, så legger Ivan/Espen inn fremgangen selv.</div><label>Navn på utfordringen</label><input id="chTitle" placeholder="f.eks. 80 000 skritt denne uka"><div class="challenge-form-grid"><div><label>Til</label><select id="chAssignee" onchange="toggleTeamMode()"><option>Begge</option><option>Ivan</option><option>Espen</option></select></div><div id="chTeamWrap"><label>Når begge er valgt</label><select id="chTeamMode"><option value="individual">Hver for seg</option><option value="team">Sammenlagt</option></select></div><div><label>Hva skal måles?</label><select id="chMetric" onchange="challengeMetricChanged()">${Object.entries(metricInfo).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}</select></div><div><label>Mål</label><input id="chTarget" type="number" min="0.1" step="0.1" value="2"></div><div><label>Enhet</label><input id="chUnit" value="økt"></div><div><label>Fra dato</label><input id="chStart" type="date" value="${b.start}"></div><div><label>Frist</label><input id="chEnd" type="date" value="${b.end}"></div></div><label>Premie</label><input id="chReward" placeholder="f.eks. badstuedate, proteinbar eller fotballkamp"><label>Melding (valgfritt)</label><textarea id="chMessage" placeholder="f.eks. Denne klarer dere aldri 😎"></textarea><button class="btn" style="margin-top:9px" onclick="createChallenge()">Publiser challenge</button>${isPreview()?'<div class="muted" style="margin-top:7px">Forhåndsvisning: du kan teste skjemaet, men ikke publisere.</div>':''}</div>`};

  const historyHtml=async()=>{
    const r=await sb.from('coach_challenges').select('*').order('created_at',{ascending:false});
    if(r.error)return `<div class="card"><h2>Challenge-historikk</h2><div class="muted">Kunne ikke laste historikken.</div></div>`;
    const arr=r.data||[];
    if(!arr.length)return `<div class="card"><h2>Challenge-historikk</h2><div class="muted">Ingen challenges er opprettet ennå.</div></div>`;
    return `<div class="card"><h2>Challenge-historikk</h2><div class="muted" style="margin-bottom:8px">Alle challenges Coach Amund har opprettet.</div><div class="coach-challenge-history">${arr.map(x=>`<div class="coach-challenge-history-item ${x.active?'coach-challenge-active':''}"><div class="coach-challenge-history-head"><div><b>${esc(x.title)}</b><div class="coach-challenge-meta">${esc(x.start_date)} – ${esc(x.end_date)} • ${esc(x.assignee)}${x.assignee==='Begge'?' • '+(x.team_mode==='team'?'sammenlagt':'hver for seg'):''}</div></div><span class="badge">${x.active?'Aktiv':'Avsluttet'}</span></div><div class="coach-challenge-meta">${esc(metricInfo[x.metric]?.label||x.metric)} • mål ${esc(x.target)} ${esc(x.unit)}</div>${x.reward?`<div class="coach-challenge-reward">🎁 ${esc(x.reward)}</div>`:''}${x.message?`<div class="muted" style="margin-top:4px">«${esc(x.message)}»</div>`:''}${x.active?`<div class="actions"><button class="btn small secondary" onclick="finishChallenge(${x.id})">Avslutt challenge</button></div>`:''}</div>`).join('')}</div></div>`;
  };

  window.renderCoachChallengeTab=async()=>{
    const s=ensureSection(); if(!s)return;
    if(!coachMode()){s.innerHTML='';return}
    s.innerHTML=formHtml()+await historyHtml();
  };

  const cleanCoachHome=()=>{
    if(!coachMode())return;
    const home=document.getElementById('home'); if(!home)return;
    home.querySelectorAll('.challenge-form,.challenge-old').forEach(x=>x.remove());
    [...home.querySelectorAll('.card')].forEach(card=>{const t=card.textContent||'';if(t.includes('Coach-visning')&& !t.includes('Ukesstatus'))card.remove()});
  };

  const baseTabs=renderTabs;
  renderTabs=function(...args){
    const out=baseTabs(...args);
    if(coachMode()){
      const tabs=q('#tabs');
      if(tabs && !tabs.querySelector('[data-p="coachChallenges"]')){
        const b=document.createElement('button');b.className='tab';b.dataset.p='coachChallenges';b.textContent='Challenges';b.onclick=()=>showPage('coachChallenges');tabs.appendChild(b);
      }
    }
    return out;
  };

  const baseShow=showPage;
  showPage=function(p){
    if(p==='coachChallenges'){
      q('#tabs')?.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.p===p));
      ['home','ivan','espen','w1','w2','w3','w4','cardio','w5','coachChallenges'].forEach(id=>q('#'+id)?.classList.toggle('hidden',id!==p));
      renderCoachChallengeTab();scrollTo(0,0);return;
    }
    baseShow(p);q('#coachChallenges')?.classList.add('hidden');
  };

  const basePages=renderPages;
  renderPages=function(...args){const out=basePages(...args);ensureSection();setTimeout(()=>{cleanCoachHome();renderCoachChallengeTab()},0);return out};

  const prevCreate=window.createChallenge;
  if(prevCreate)window.createChallenge=async(...args)=>{const out=await prevCreate(...args);await renderCoachChallengeTab();cleanCoachHome();return out};
  const prevFinish=window.finishChallenge;
  if(prevFinish)window.finishChallenge=async(...args)=>{const out=await prevFinish(...args);await renderCoachChallengeTab();cleanCoachHome();return out};

  ensureSection();
  if(typeof currentProfile!=='undefined'&&currentProfile){renderTabs();renderPages()}
})();
