(() => {
  if(typeof sb==='undefined'||typeof renderHome!=='function'||typeof stateByName!=='function')return;
  const css=document.createElement('style');
  css.textContent=`
    .fun-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.fun-panel{border:1px solid var(--line);border-radius:12px;padding:12px;background:#fafbfe}
    .fun-head{display:flex;justify-content:space-between;gap:8px;align-items:center}.fun-line{padding:8px 0;border-bottom:1px solid #e4eaf3;font-size:12px}.fun-line:last-child{border:0}
    .fun-tag{display:inline-block;border-radius:99px;padding:3px 7px;font-size:10px;font-weight:900;background:#dce7fa}
    .fun-awards{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px}.fun-award{background:#f6f8fd;border:1px solid var(--line);border-radius:10px;text-align:center;padding:10px 5px;font-size:11px}.fun-award .emoji{font-size:24px}.fun-award.locked{opacity:.38;filter:grayscale(1)}
    .fun-form{display:grid;gap:7px;margin-top:10px}.fun-form input,.fun-form select,.fun-form textarea{margin:0}.fun-form label{margin:2px 0 0}
    .fun-secret{background:#eef4ff;border:2px dashed #8facda;border-radius:11px;padding:12px;margin:9px 0}.fun-warning{color:#8f3b24}
    @media(max-width:650px){.fun-grid{grid-template-columns:1fr}.fun-awards{grid-template-columns:repeat(2,1fr)}}
  `;
  document.head.appendChild(css);
  const escText=x=>typeof esc==='function'?esc(x):String(x??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const dToday=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
  const monday=()=>{const d=new Date();d.setDate(d.getDate()-(d.getDay()+6)%7);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
  const realName=()=>typeof currentUser!=='undefined'&&currentUser?profileById(currentUser.id)?.name:null;
  const realCoach=()=>typeof currentUser!=='undefined'&&currentUser&&profileById(currentUser.id)?.role==='coach';
  const realAthlete=()=>['Ivan','Espen'].includes(realName())&&currentProfile?.name===realName()&&!document.body.classList.contains('espen-preview-active')&&!isCoach();
  let verdicts=[],penalties=[],missions=[],loading=false,lastPull=0;
  const pull=async(force=false)=>{
    if(loading||(!force&&Date.now()-lastPull<12000))return;
    loading=true;
    try{
      const [v,p,m]=await Promise.all([
        sb.from('coach_verdicts').select('*').order('week_start',{ascending:false}),
        sb.from('fun_penalties').select('*').order('created_at',{ascending:false}),
        sb.from('secret_missions').select('*').order('created_at',{ascending:false})
      ]);
      if(v.error||p.error||m.error)console.error('GainTrain moro:',v.error,p.error,m.error);
      if(!v.error)verdicts=v.data||[];
      if(!p.error)penalties=p.data||[];
      if(!m.error)missions=m.data||[];
      lastPull=Date.now();
    }finally{loading=false}
  };
  const workoutList=name=>{
    const s=stateByName(name)||{};
    return ['w1','w2','w3','w4','w5'].flatMap(k=>(s[k]||[]).map(x=>({...x,_type:k})));
  };
  const weeklyCount=(name,week)=>workoutList(name).filter(x=>x.date>=week&&x.date<=weekEnd(week)).length;
  const weekEnd=start=>{const d=new Date(start+'T12:00:00');d.setDate(d.getDate()+6);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
  const field=(id,label,type='text',placeholder='',value='')=>`<label for="${id}">${label}</label><input id="${id}" type="${type}" placeholder="${placeholder}" value="${value}">`;
  const athleteOptions=`<option>Ivan</option><option>Espen</option>`;
  const verdictHtml=()=>{
    const latest=verdicts.filter(x=>x.week_start<=monday()).slice(0,4);
    const rows=latest.map(v=>`<div class="fun-line"><b>${escText(v.athlete)} • uke fra ${escText(v.week_start)}</b> <span class="fun-tag">${escText(v.verdict)}</span><div>${escText(v.message)}</div></div>`).join('')||'<div class="muted">Ingen dom avsagt ennå. Coach samler bevis. 👨‍⚖️</div>';
    return `<div class="card"><h2>👨‍⚖️ Coach Amunds dom</h2>${rows}${realCoach()?`<details><summary><b>Avsi ukas dom</b></summary><div class="fun-form"><label>Til</label><select id="funVerdictName">${athleteOptions}</select><label>Dom</label><select id="funVerdictType"><option>Godkjent 💪</option><option>Under tvil 😅</option><option>Skuffet, men ikke overrasket 😂</option><option>Hvem er du, og hva har du gjort med ham? 🤯</option></select>${field('funVerdictWeek','Uke fra mandag','date','',monday())}<label>Kommentar</label><textarea id="funVerdictMsg" placeholder="En liten hilsen fra dommeren"></textarea><button class="btn small" onclick="funSaveVerdict()">Publiser dom</button></div></details>`:''}</div>`;
  };
  const penaltyHtml=()=>{
    const rows=penalties.slice(0,12).map(p=>`<div class="fun-line"><div class="fun-head"><b>${escText(p.debtor)} skylder ${escText(p.creditor)}: ${escText(p.description)}</b><span class="fun-tag">${p.settled?'✅ Oppgjort':'💸 Utestående'}</span></div><div class="muted">${escText(p.reason||'Frivillig avtale')}</div>${!p.settled&&(realCoach()||p.created_by===currentUser?.id)?`<button class="btn small secondary" onclick="funSettle(${p.id})">Marker som oppgjort</button>`:''}</div>`).join('')||'<div class="muted">Ingen skylder noen noe. Mistenkelig fredelig. ☕</div>';
    return `<div class="card"><h2>💸 Straffekassa</h2><div class="muted">Bare frivillige, avtalte tullepremier – ikke automatisk straff for å stå over trening.</div>${rows}${(realAthlete()||realCoach())?`<details><summary><b>Legg inn avtale</b></summary><div class="fun-form"><label>Hvem skylder?</label><select id="funDebtDebtor">${athleteOptions}</select><label>Hvem får?</label><select id="funDebtCreditor">${athleteOptions}</select>${field('funDebtWhat','Hva skylder du?','text','En kaffe eller proteinbar')}${field('funDebtWhy','Hvorfor?','text','Tapte challenge (frivillig)')}<button class="btn small" onclick="funSaveDebt()">Legg til i kassa</button></div></details>`:''}</div>`;
  };
  const missionHtml=()=>{
    const n=realName(),visible=realCoach()?missions:missions.filter(x=>x.athlete===n);
    const rows=visible.slice(0,8).map(x=>{
      const revealed=Boolean(x.revealed_at)||realCoach(),done=Boolean(x.completed_at),expired=dToday()>x.deadline;
      return `<div class="fun-secret"><div class="fun-head"><b>🕵️ ${revealed?escText(x.title):'Hemmelig oppdrag'}</b><span class="fun-tag">${done?'✅ Fullført':expired?'⌛ Fristen ute':revealed?'Åpnet':'Forseglet'}</span></div><div class="muted">Til ${escText(x.athlete)} • frist ${escText(x.deadline)}</div>${revealed?`<div class="fun-line">${escText(x.details)}</div>`:''}${done&&x.reward?`<div class="challenge-reward">🎁 Premie: ${escText(x.reward)}</div>`:''}${!revealed&&realAthlete()?`<button class="btn small" onclick="funReveal(${x.id})">✉️ Åpne oppdrag</button>`:''}${realCoach()&&!done?`<button class="btn small secondary" onclick="funComplete(${x.id})">Marker gjennomført</button>`:''}</div>`;
    }).join('')||'<div class="muted">Ingen hemmelige oppdrag ennå. Amund har kanskje gått i dekning.</div>';
    return `<div class="card"><h2>🕵️ Hemmelig oppdrag</h2><div class="muted">Amund bestemmer. Premien avsløres når han godkjenner oppdraget.</div>${rows}${realCoach()?`<details><summary><b>Lag hemmelig oppdrag</b></summary><div class="fun-form"><label>Til</label><select id="funMissionName">${athleteOptions}</select>${field('funMissionTitle','Oppdrag','text','Få med Ivan på en ekstra tur')}<label>Beskrivelse</label><textarea id="funMissionDetails" placeholder="Hva skal gjøres?"></textarea>${field('funMissionDate','Frist','date','',dToday())}${field('funMissionReward','Hemmelig premie','text','Kaffe og evig ære')}<button class="btn small" onclick="funSaveMission()">Send forseglet oppdrag</button></div></details>`:''}</div>`;
  };
  const bestCount=name=>{
    const s=stateByName(name)||{};
    return ['w1','w3','w5'].reduce((sum,k)=>{
      const a=(s[k]||[]).slice().sort((x,y)=>(x.date||'').localeCompare(y.date||''));
      if(a.length<2)return sum;
      let p=0;
      if(k==='w1')p=a.reduce((acc,x,i)=>acc+(i>0&&Number(x?.ex?.Pullups?.r?.[0]||0)>Number(a[i-1]?.ex?.Pullups?.r?.[0]||0)?1:0),0);
      if(k==='w3')p=a.reduce((acc,x,i)=>acc+(i>0&&Number(x?.rounds?.[0]?.ex?.Armheving?.rep||0)>Number(a[i-1]?.rounds?.[0]?.ex?.Armheving?.rep||0)?1:0),0);
      if(k==='w5')p=a.reduce((acc,x,i)=>acc+(i>0&&Number(x?.pushups||0)>Number(a[i-1]?.pushups||0)?1:0),0);
      return sum+p;
    },0);
  };
  const trophyHtml=name=>{
    const s=stateByName(name)||{},total=workoutList(name).length,cardio=(s.w2||[]).length+(s.w4||[]).length;
    const badges=[
      ['🚂','Første tur',total>=1,'Første registrerte økt'],
      ['🔥','På rull',total>=5,'5 registrerte økter'],
      ['💪','Jernvilje',total>=10,'10 registrerte økter'],
      ['🏃','Ut på tur',cardio>=5,'5 kondisjonsøkter'],
      ['🔄','Rundt igjen',(s.w3||[]).length>=5,'5 sirkeløkter'],
      ['🏆','PB-jeger',bestCount(name)>=1,'En forbedring er registrert']
    ];
    return `<div class="card"><h2>🏆 ${escText(name)} sitt pokalskap</h2><div class="muted">Merkene låses opp automatisk når du registrerer økter. ${total} registrerte økter så langt.</div><div class="fun-awards">${badges.map(([icon,title,ok,desc])=>`<div class="fun-award ${ok?'':'locked'}"><div class="emoji">${icon}</div><b>${title}</b><div>${desc}</div>${ok?'<span class="fun-tag">Opplåst</span>':'🔒'}</div>`).join('')}</div></div>`;
  };
  const renderFun=()=>{
    const home=document.getElementById('home');if(!home)return;
    home.querySelector('#gaintrainFun')?.remove();
    const el=document.createElement('div');el.id='gaintrainFun';
    el.innerHTML=verdictHtml()+missionHtml()+penaltyHtml();
    home.appendChild(el);
    ['Ivan','Espen'].forEach(name=>{
      const page=document.getElementById(name.toLowerCase());if(!page)return;
      page.querySelector('.fun-trophy-holder')?.remove();
      const box=document.createElement('div');box.className='fun-trophy-holder';box.innerHTML=trophyHtml(name);
      const first=page.querySelector(':scope > .card');if(first)first.insertAdjacentElement('afterend',box);else page.prepend(box);
    });
  };
  const refresh=async(force=false)=>{await pull(force);renderFun()};
  const fail=err=>{if(err)alert('Kunne ikke lagre: '+err.message);return !!err};
  const get=id=>document.getElementById(id)?.value?.trim()||'';
  window.funSaveVerdict=async()=>{
    if(!realCoach())return;
    const athlete=get('funVerdictName'),week=get('funVerdictWeek'),verdict=get('funVerdictType'),message=get('funVerdictMsg');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(week))return alert('Velg uke.');
    const r=await sb.from('coach_verdicts').upsert({athlete,week_start:week,verdict,message,created_by:currentUser.id},{onConflict:'week_start,athlete'});
    if(!fail(r.error))await refresh(true);
  };
  window.funSaveDebt=async()=>{
    if(!realCoach()&&!realAthlete())return;
    const debtor=get('funDebtDebtor'),creditor=get('funDebtCreditor'),description=get('funDebtWhat'),reason=get('funDebtWhy');
    if(debtor===creditor||!description)return alert('Velg to forskjellige personer og skriv hva som skyldes.');
    const r=await sb.from('fun_penalties').insert({debtor,creditor,description,reason,created_by:currentUser.id});
    if(!fail(r.error))await refresh(true);
  };
  window.funSettle=async id=>{
    const x=penalties.find(p=>p.id===id);
    if(!x||(!realCoach()&&x.created_by!==currentUser?.id))return;
    const r=await sb.from('fun_penalties').update({settled:true,settled_at:new Date().toISOString()}).eq('id',id);
    if(!fail(r.error))await refresh(true);
  };
  window.funSaveMission=async()=>{
    if(!realCoach())return;
    const athlete=get('funMissionName'),title=get('funMissionTitle'),details=get('funMissionDetails'),deadline=get('funMissionDate'),reward=get('funMissionReward');
    if(!title||!deadline)return alert('Fyll ut oppdrag og frist.');
    const r=await sb.from('secret_missions').insert({athlete,title,details,deadline,reward,created_by:currentUser.id});
    if(!fail(r.error))await refresh(true);
  };
  window.funReveal=async id=>{
    const x=missions.find(m=>m.id===id);
    if(!x||!realAthlete()||x.athlete!==realName())return;
    const r=await sb.from('secret_missions').update({revealed_at:new Date().toISOString()}).eq('id',id);
    if(!fail(r.error))await refresh(true);
  };
  window.funComplete=async id=>{
    if(!realCoach())return;
    const r=await sb.from('secret_missions').update({completed_at:new Date().toISOString()}).eq('id',id);
    if(!fail(r.error))await refresh(true);
  };
  const oldRenderHome=renderHome;
  renderHome=function(...args){const out=oldRenderHome(...args);renderFun();return out};
  const oldRenderPerson=renderPerson;
  renderPerson=function(...args){const out=oldRenderPerson(...args);renderFun();return out};
  const oldStart=startSession;
  startSession=async function(...args){const out=await oldStart(...args);await refresh(true);return out};
  const oldSave=save;
  save=async function(...args){const out=await oldSave(...args);renderFun();return out};
  if(typeof currentProfile!=='undefined'&&currentProfile)refresh(true);
})();