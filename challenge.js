(() => {
  if (typeof sb === 'undefined') return;

  const style=document.createElement('style');
  style.textContent=`
    .challenge-card{border:2px solid var(--b);border-radius:13px;padding:12px;background:#f7faff}
    .challenge-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.challenge-title{font-size:17px;font-weight:900}
    .challenge-msg{font-size:12px;color:#5e687b;margin:5px 0 9px}.challenge-reward{margin-top:9px;padding:8px 9px;border-radius:9px;background:#fff2cc;font-size:12px}
    .challenge-person{margin-top:10px}.challenge-person-head{display:flex;justify-content:space-between;gap:8px;font-size:12px;font-weight:800}
    .challenge-bar{height:9px;background:#e4e9f2;border-radius:999px;overflow:hidden;margin-top:5px}.challenge-bar span{display:block;height:100%;background:var(--b);border-radius:999px}
    .challenge-done{margin-top:9px;padding:8px;border-radius:9px;background:#e9f6e9;font-weight:900;text-align:center;font-size:12px}
    .challenge-form{margin-top:10px;border-top:1px solid #dfe6f1;padding-top:10px}.challenge-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
    .coach-help{background:#eef4ff;border:1px solid #cad8ef;border-radius:9px;padding:9px;font-size:12px;line-height:1.45;margin-bottom:10px}
    .challenge-manual{display:flex;gap:6px;align-items:end;margin-top:8px}.challenge-manual>div{flex:1}.challenge-manual .btn{flex:0 0 auto}
    .challenge-old summary{cursor:pointer;font-size:12px;padding:7px 0}.challenge-old-item{padding:7px 0;border-bottom:1px solid #e7ebf2;font-size:12px}
    @media(max-width:650px){.challenge-form-grid{grid-template-columns:1fr}.challenge-manual{align-items:stretch;flex-direction:column}}
  `;
  document.head.appendChild(style);

  let challenges=[];
  let challengeProgress=[];
  let challengesLoaded=false;
  let challengeLoading=false;

  const ymd=d=>{const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`};
  const weekBounds=()=>{const now=new Date(),day=(now.getDay()+6)%7,start=new Date(now.getFullYear(),now.getMonth(),now.getDate()-day),end=new Date(start.getFullYear(),start.getMonth(),start.getDate()+6);return{start:ymd(start),end:ymd(end)}};
  const inRange=(x,start,end)=>{const dt=x?.date||'';return dt>=start&&dt<=end};
  const cardioList=s=>[...(s.w2||[]),...(s.w4||[])];

  const metricInfo={
    strength1_sessions:{label:'Styrke 1-økter',unit:'økt'},
    strength2_sessions:{label:'Styrke 2-økter',unit:'økt'},
    cardio_sessions:{label:'Kondisjonsøkter',unit:'økt'},
    all_sessions:{label:'Alle treningsøkter',unit:'økt'},
    cardio_minutes:{label:'Kondisjonsminutter',unit:'min'},
    cardio_km:{label:'Kondisjonsdistanse',unit:'km'},
    manual:{label:'Manuell registrering',unit:'stk'}
  };

  const loadChallenges=async()=>{
    if(challengeLoading)return;
    challengeLoading=true;
    try{
      const [c,p]=await Promise.all([
        sb.from('coach_challenges').select('*').order('created_at',{ascending:false}),
        sb.from('challenge_progress_entries').select('*').order('created_at',{ascending:true})
      ]);
      if(c.error) console.error('Kunne ikke laste challenges',c.error); else challenges=c.data||[];
      if(p.error) console.error('Kunne ikke laste challenge-fremgang',p.error); else challengeProgress=p.data||[];
      challengesLoaded=true;
    } finally { challengeLoading=false; }
  };

  const autoProgress=(ch,name)=>{
    const s=stateByName(name),start=ch.start_date,end=ch.end_date;
    if(ch.metric==='strength1_sessions')return (s.w1||[]).filter(x=>inRange(x,start,end)).length;
    if(ch.metric==='strength2_sessions')return (s.w3||[]).filter(x=>inRange(x,start,end)).length;
    if(ch.metric==='cardio_sessions')return cardioList(s).filter(x=>inRange(x,start,end)).length;
    if(ch.metric==='all_sessions')return ['w1','w2','w3','w4'].reduce((n,k)=>n+(s[k]||[]).filter(x=>inRange(x,start,end)).length,0);
    if(ch.metric==='cardio_minutes')return cardioList(s).filter(x=>inRange(x,start,end)).reduce((n,x)=>n+(Number(x.time)||0),0);
    if(ch.metric==='cardio_km')return cardioList(s).filter(x=>inRange(x,start,end)).reduce((n,x)=>n+(Number(x.dist)||0),0);
    const p=profileByName(name);
    return challengeProgress.filter(x=>x.challenge_id===ch.id&&x.user_id===p?.id&&x.entry_date>=start&&x.entry_date<=end).reduce((n,x)=>n+(Number(x.amount)||0),0);
  };

  const fmt=(v,unit)=>{const n=Number(v)||0;return (unit==='km'?n.toFixed(1).replace('.',','):Math.round(n).toLocaleString('no-NO'))+' '+unit};
  const peopleFor=ch=>ch.assignee==='Begge'?['Ivan','Espen']:[ch.assignee];
  const progressRow=(ch,name)=>{const v=autoProgress(ch,name),target=Number(ch.target),pct=Math.min(100,Math.round(v/target*100)),done=v>=target;return `<div class="challenge-person"><div class="challenge-person-head"><span>${name}${done?' ✓':''}</span><span>${fmt(v,ch.unit)} / ${fmt(target,ch.unit)}</span></div><div class="challenge-bar"><span style="width:${pct}%"></span></div>${ch.metric==='manual'&&currentProfile?.name===name&&!isCoach()?manualEntry(ch):''}</div>`};
  const manualEntry=ch=>`<div class="challenge-manual"><div><label>Registrer fremgang</label><input id="challengeAmount_${ch.id}" type="number" min="0" step="0.1" placeholder="Antall ${esc(ch.unit)}"></div><button class="btn small" onclick="addChallengeProgress(${ch.id})">Legg til</button></div>`;

  const challengeView=()=>{
    if(!challengesLoaded)return `<div class="card"><h2>Coach Amunds challenge</h2><div class="muted">Laster challenge...</div></div>`;
    const active=challenges.find(x=>x.active);
    const old=challenges.filter(x=>!x.active).slice(0,6);
    let main='';
    if(active){
      const persons=peopleFor(active);
      let rows=''; let complete=false;
      if(active.assignee==='Begge'&&active.team_mode==='team'){
        const total=persons.reduce((n,name)=>n+autoProgress(active,name),0),target=Number(active.target),pct=Math.min(100,Math.round(total/target*100));complete=total>=target;
        rows=`<div class="challenge-person"><div class="challenge-person-head"><span>Ivan + Espen sammen${complete?' ✓':''}</span><span>${fmt(total,active.unit)} / ${fmt(target,active.unit)}</span></div><div class="challenge-bar"><span style="width:${pct}%"></span></div>${active.metric==='manual'&&!isCoach()?manualEntry(active):''}</div>`;
      }else{
        rows=persons.map(name=>progressRow(active,name)).join('');
        complete=persons.every(name=>autoProgress(active,name)>=Number(active.target));
      }
      main=`<div class="challenge-card"><div class="challenge-head"><div><div class="challenge-title">${esc(active.title)}</div><div class="muted">${metricInfo[active.metric]?.label||'Challenge'} • ${esc(active.start_date)} – ${esc(active.end_date)}</div></div><span class="badge">${active.assignee==='Begge'?(active.team_mode==='team'?'Sammen':'Begge'):active.assignee}</span></div>${active.message?`<div class="challenge-msg">«${esc(active.message)}»</div>`:''}${rows}${active.reward?`<div class="challenge-reward">🎁 <b>Premie:</b> ${esc(active.reward)}</div>`:''}${complete?`<div class="challenge-done">🏆 CHALLENGE COMPLETED!${active.reward?' Premien er låst opp 🔓':''}</div>`:''}${isCoach()?`<div class="actions"><button class="btn small secondary" onclick="finishChallenge(${active.id})">Avslutt challenge</button></div>`:''}</div>`;
    }else main='<div class="muted">Ingen aktiv challenge akkurat nå.</div>';
    const coachForm=isCoach()?coachChallengeForm():'';
    const history=old.length?`<details class="challenge-old" style="margin-top:10px"><summary><b>Tidligere challenges</b></summary>${old.map(x=>`<div class="challenge-old-item"><b>${esc(x.title)}</b><div class="muted">${esc(x.start_date)} – ${esc(x.end_date)}${x.reward?' • Premie: '+esc(x.reward):''}</div></div>`).join('')}</details>`:'';
    return `<div class="card"><h2>Coach Amunds challenge 💪</h2>${main}${coachForm}${history}</div>`;
  };

  const coachChallengeForm=()=>{const b=weekBounds();return `<div class="challenge-form"><div class="coach-help"><b>Kort forklart, Amund:</b> Velg hvem som skal utfordres, hva som skal måles, mål og frist – og legg gjerne inn en premie. GainTrain teller treningsøkter, kondisjonsminutter og kilometer automatisk. For ting appen ikke kjenner, som skritt eller burpees, velger du <b>Manuell registrering</b>, så legger Ivan/Espen inn fremgangen selv. Når målet nås, markeres challengen automatisk som fullført.</div><h3>Ny challenge</h3><label>Navn på utfordringen</label><input id="chTitle" placeholder="f.eks. 80 000 skritt denne uka"><div class="challenge-form-grid"><div><label>Til</label><select id="chAssignee" onchange="toggleTeamMode()"><option>Begge</option><option>Ivan</option><option>Espen</option></select></div><div id="chTeamWrap"><label>Når begge er valgt</label><select id="chTeamMode"><option value="individual">Hver for seg</option><option value="team">Sammenlagt</option></select></div><div><label>Hva skal måles?</label><select id="chMetric" onchange="challengeMetricChanged()">${Object.entries(metricInfo).map(([k,v])=>`<option value="${k}">${v.label}</option>`).join('')}</select></div><div><label>Mål</label><input id="chTarget" type="number" min="0.1" step="0.1" value="2"></div><div><label>Enhet</label><input id="chUnit" value="økt"></div><div><label>Fra dato</label><input id="chStart" type="date" value="${b.start}"></div><div><label>Frist</label><input id="chEnd" type="date" value="${b.end}"></div></div><label>Premie</label><input id="chReward" placeholder="f.eks. badstuedate, proteinbar eller fotballkamp"><label>Melding (valgfritt)</label><textarea id="chMessage" placeholder="f.eks. Denne klarer dere aldri 😎"></textarea><button class="btn" style="margin-top:9px" onclick="createChallenge()">Publiser challenge</button></div>`};

  window.toggleTeamMode=()=>{const a=q('#chAssignee'),w=q('#chTeamWrap');if(w)w.style.display=a?.value==='Begge'?'block':'none'};
  window.challengeMetricChanged=()=>{const m=q('#chMetric')?.value,u=q('#chUnit');if(u&&metricInfo[m])u.value=metricInfo[m].unit};
  window.createChallenge=async()=>{if(!isCoach())return;const title=q('#chTitle')?.value.trim(),target=Number(q('#chTarget')?.value),assignee=q('#chAssignee')?.value,metric=q('#chMetric')?.value,unit=q('#chUnit')?.value.trim()||metricInfo[metric]?.unit||'stk',start=q('#chStart')?.value,end=q('#chEnd')?.value;if(!title||!target||!start||!end){alert('Fyll inn navn, mål og datoer.');return}await sb.from('coach_challenges').update({active:false}).eq('active',true);const r=await sb.from('coach_challenges').insert({title,metric,target,unit,assignee,team_mode:assignee==='Begge'?(q('#chTeamMode')?.value||'individual'):'individual',start_date:start,end_date:end,reward:q('#chReward')?.value.trim()||null,message:q('#chMessage')?.value.trim()||null,created_by:currentUser.id,active:true});if(r.error){alert('Kunne ikke opprette challenge: '+r.error.message);return}await loadChallenges();renderHome();showToast('Challenge publisert 💪')};
  window.finishChallenge=async id=>{if(!isCoach())return;const r=await sb.from('coach_challenges').update({active:false}).eq('id',id);if(r.error){alert(r.error.message);return}await loadChallenges();renderHome();showToast('Challenge avsluttet')};
  window.addChallengeProgress=async id=>{const ch=challenges.find(x=>x.id===id),el=q('#challengeAmount_'+id),amount=Number(el?.value);if(!ch||!amount||amount<=0)return;const r=await sb.from('challenge_progress_entries').insert({challenge_id:id,user_id:currentUser.id,amount,entry_date:ymd(new Date())});if(r.error){alert('Kunne ikke lagre fremgang: '+r.error.message);return}await loadChallenges();renderHome();showToast('Fremgang registrert')};

  const testCardHome=name=>{const a=stateByName(name).w5||[],x=a.slice().sort((p,q)=>(q.date||'').localeCompare(p.date||''))[0];if(!x)return`<div class="home-test-card"><div class="home-test-name">${name}</div><div class="muted">Ingen test registrert ennå.</div></div>`;return`<div class="home-test-card"><div class="home-test-head"><div><div class="home-test-name">${name}</div><div class="home-test-date">${esc(x.date||'-')}</div></div><span class="badge">Test</span></div><div class="home-test-row"><span>Løp 12 km/t</span><b>${esc(x.runTime||'-')}${x.avgPulse?` (${esc(x.avgPulse)} bpm)`:''}</b></div><div class="home-test-row"><span>Knebøy</span><b>${x.squats?esc(x.squats)+' stk':'-'}</b></div><div class="home-test-row"><span>Armhevinger</span><b>${x.pushups?esc(x.pushups)+' stk':'-'}</b></div><div class="home-test-row"><span>Box jump</span><b>${x.boxJumps?esc(x.boxJumps)+' stk':'-'}</b></div><div class="home-test-row"><span>Pullups</span><b>${x.pullups?esc(x.pullups)+' stk':'-'}</b></div></div>`};
  const weekStatus=name=>{const s=stateByName(name),b=weekBounds(),s1=(s.w1||[]).filter(x=>inRange(x,b.start,b.end)).length,s2=(s.w3||[]).filter(x=>inRange(x,b.start,b.end)).length,c=cardioList(s).filter(x=>inRange(x,b.start,b.end)).length,done=(s1?1:0)+(s2?1:0)+Math.min(c,2),pct=Math.round(done/4*100);return`<div class="week-card"><div class="week-head"><div class="week-name">${name}</div><span class="badge">${done}/4</span></div><div class="week-row"><span>Styrke 1</span><span class="${s1?'week-ok':'week-wait'}">${s1?'✓ Gjennomført':'○ Ikke gjort'}</span></div><div class="week-row"><span>Styrke 2</span><span class="${s2?'week-ok':'week-wait'}">${s2?'✓ Gjennomført':'○ Ikke gjort'}</span></div><div class="week-row"><span>Kondisjon</span><span class="${c>=2?'week-ok':'week-wait'}">${c>=2?'✓ ': '○ '}${c}/2</span></div><div class="week-progress"><span style="width:${pct}%"></span></div>${done===4?'<div class="week-complete">Ukemålet er nådd 💪</div>':''}</div>`};
  recentActivity=function(){let arr=[];['Ivan','Espen'].forEach(name=>{const s=stateByName(name);['w1','w2','w3','w4','w5'].forEach(k=>(s[k]||[]).forEach(x=>arr.push({name,k,date:x.date||'',x,ref:workoutRef(k,x)})))});arr.sort((a,b)=>b.date.localeCompare(a.date));return arr.slice(0,5).map(a=>`<div class="plan clickable" onclick="openRecent('${a.name}','${a.k}','${a.ref}')"><span class="badge">${a.name}</span><div><b>${labelWorkout(a.k)}</b><div class="muted">${shortSummary(a.k,a.x)}</div></div><span>${a.date}</span></div>`).join('')||'<div class="muted">Ingen registreringer ennå.</div>'};
  renderHome=function(){const b=weekBounds();q('#home').innerHTML=`<div class="card"><h2>Ukesstatus</h2><div class="week-range">Mål denne uka (${b.start} – ${b.end}): 1 × Styrke 1, 1 × Styrke 2 og 2 × Kondisjon.</div><div class="week-grid">${weekStatus('Ivan')}${weekStatus('Espen')}</div></div>${challengeView()}<div class="card"><h2>Testresultater</h2><div class="home-test-grid">${testCardHome('Ivan')}${testCardHome('Espen')}</div></div><div class="card"><h2>Siste aktivitet</h2><div class="muted" style="margin-bottom:6px">De fem siste registrerte aktivitetene.</div>${recentActivity()}</div>`};

  const baseStartSession=startSession;
  startSession=async function(user){await baseStartSession(user);await loadChallenges();renderHome()};
  const baseSave=save;
  save=async function(msg){await baseSave(msg);await loadChallenges();renderHome()};

  const ensureChallengeData=async()=>{if(typeof currentProfile==='undefined'||!currentProfile)return;await loadChallenges();renderHome()};
  if(typeof currentProfile!=='undefined'&&currentProfile) ensureChallengeData();
  else {
    let tries=0;
    const timer=setInterval(()=>{tries++;if(typeof currentProfile!=='undefined'&&currentProfile){clearInterval(timer);ensureChallengeData()}else if(tries>40)clearInterval(timer)},250);
  }
})();
