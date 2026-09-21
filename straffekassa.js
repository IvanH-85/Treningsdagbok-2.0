(() => {
  if(typeof sb==='undefined'||typeof renderHome!=='function')return;
  const style=document.createElement('style');
  style.textContent=`
    .wager-box{padding:11px;border:1px solid var(--line);border-radius:11px;margin-top:9px;background:#f7faff;font-size:12px}
    .wager-head{display:flex;align-items:flex-start;justify-content:space-between;gap:8px}
    .wager-head b{font-size:13px}.wager-tag{background:#dce7fa;border-radius:20px;padding:4px 7px;white-space:nowrap;font-size:10px;font-weight:900}
    .wager-form{display:grid;gap:8px;padding:10px 0}.wager-form select,.wager-form input{margin:0}
    .wager-form label{margin:2px 0 0}.wager-mini{color:#66738a;font-size:11px;margin-top:5px}
    .wager-debt{border-bottom:1px solid #e4eaf3;padding:9px 0;font-size:12px}
    .wager-debt:last-child{border:0}.wager-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}
  `;document.head.appendChild(style);
  const safe=v=>typeof esc==='function'?esc(v):String(v??'').replace(/[&<>"]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[x]));
  const today=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return [d.getFullYear(),p(d.getMonth()+1),p(d.getDate())].join('-')};
  const actor=()=>typeof currentUser!=='undefined'&&currentUser?profileById(currentUser.id)?.name:null;
  const coach=()=>actor()==='Amund'&&profileById(currentUser.id)?.role==='coach';
  const canWrite=()=>!!currentUser&&(coach()||(['Ivan','Espen'].includes(actor())&&currentProfile?.name===actor()&&!document.body.classList.contains('espen-preview-active')&&!isCoach()));
  const progress=(ch,name,entries)=>{
    const s=stateByName(name)||{},within=x=>(x?.date||'')>=ch.start_date&&(x?.date||'')<=ch.end_date;
    const cardio=[...(s.w2||[]),...(s.w4||[])].filter(within);
    if(ch.metric==='strength1_sessions')return (s.w1||[]).filter(within).length;
    if(ch.metric==='strength2_sessions')return (s.w3||[]).filter(within).length;
    if(ch.metric==='cardio_sessions')return cardio.length;
    if(ch.metric==='all_sessions')return ['w1','w2','w3','w4'].reduce((n,k)=>n+(s[k]||[]).filter(within).length,0);
    if(ch.metric==='cardio_minutes')return cardio.reduce((n,x)=>n+(Number(x.time)||0),0);
    if(ch.metric==='cardio_km')return cardio.reduce((n,x)=>n+(Number(x.dist)||0),0);
    const p=profileByName(name);
    return entries.filter(e=>Number(e.challenge_id)===Number(ch.id)&&e.user_id===p?.id&&e.entry_date>=ch.start_date&&e.entry_date<=ch.end_date).reduce((n,e)=>n+(Number(e.amount)||0),0);
  };
  let wagers=[],accepts=[],debts=[],challenges=[],entries=[],pulling=false;
  const load=async()=>{
    if(pulling)return;
    pulling=true;
    try{
      const r=await Promise.all([
        sb.from('fun_wagers').select('*').order('created_at',{ascending:false}),
        sb.from('fun_wager_acceptances').select('*'),
        sb.from('fun_penalties').select('*').order('created_at',{ascending:false}),
        sb.from('coach_challenges').select('*').order('created_at',{ascending:false}),
        sb.from('challenge_progress_entries').select('*')
      ]);
      for(const v of r)if(v.error)console.error('Straffekassa:',v.error);
      if(!r[0].error)wagers=r[0].data||[];
      if(!r[1].error)accepts=r[1].data||[];
      if(!r[2].error)debts=r[2].data||[];
      if(!r[3].error)challenges=r[3].data||[];
      if(!r[4].error)entries=r[4].data||[];
    }finally{pulling=false}
  };
  const agreed=w=>w.debtor_names.every(n=>accepts.some(a=>Number(a.wager_id)===Number(w.id)&&a.athlete===n));
  const ended=ch=>!ch.active||ch.end_date<today();
  const reconcile=async()=>{
    if(!canWrite())return;
    const additions=[];
    for(const w of wagers){
      if(w.cancelled_at||!agreed(w))continue;
      const ch=challenges.find(c=>Number(c.id)===Number(w.challenge_id));
      if(!ch||!ended(ch))continue;
      for(const name of w.debtor_names){
        if(progress(ch,name,entries)>=Number(ch.target))continue;
        if(debts.some(d=>Number(d.wager_id)===Number(w.id)&&d.debtor===name))continue;
        additions.push({wager_id:w.id,debtor:name,creditor:w.creditor,description:w.stake,reason:'Tapte veddemål: '+ch.title,created_by:currentUser.id});
      }
    }
    for(const item of additions){
      const r=await sb.from('fun_penalties').insert(item);
      if(r.error&&r.error.code!=='23505')console.error('Kunne ikke opprette avtalt gjeld',r.error);
    }
    if(additions.length){
      const d=await sb.from('fun_penalties').select('*').order('created_at',{ascending:false});
      if(!d.error)debts=d.data||[];
    }
  };
  const opts=names=>names.map(n=>`<option value="${n}">${n==='Amund'?'Coach Amund':n}</option>`).join('');
  const formActions=()=>canWrite()?`
    <details><summary><b>🤝 Opprett veddemål før challenge</b></summary><div class="wager-form">
    <div class="wager-mini">Veddemålet gjelder først når alle som kan bli skyldige, har godtatt det. Kun en avtalt, mislykket challenge gir automatisk gjeld.</div>
    <label>Velg aktiv challenge</label><select id="wagerChallenge">${challenges.filter(ch=>ch.active&&ch.end_date>=today()).map(ch=>`<option value="${ch.id}">${safe(ch.title)} (${ch.end_date})</option>`).join('')}</select>
    <label>Hvem kan bli skyldig?</label><select id="wagerDebtors" onchange="window.wagerChooseDebtors()"><option value="Begge">Ivan og Espen</option><option value="Ivan">Ivan</option><option value="Espen">Espen</option></select>
    <label>Hvem får?</label><select id="wagerCreditor">${opts(['Amund','Ivan','Espen'])}</select>
    <label>Hva står på spill?</label><input id="wagerStake" placeholder="En kaffe / proteinbar">
    <button class="btn small" onclick="window.wagerCreate()">Opprett veddemål</button></div></details>
    <details><summary><b>🧾 Registrer avtalt gjeld manuelt</b></summary><div class="wager-form">
    <label>Hvem skylder?</label><select id="wagerManualDebtor">${opts(coach()?['Ivan','Espen','Amund']:[actor(),'Amund'])}</select>
    <label>Hvem får?</label><select id="wagerManualCreditor">${opts(['Ivan','Espen','Amund'])}</select>
    <label>Hva skyldes?</label><input id="wagerManualWhat" placeholder="Kaffe, proteinbar eller annen tullepremie">
    <label>Hvorfor?</label><input id="wagerManualWhy" placeholder="Frivillig avtale">
    <button class="btn small" onclick="window.wagerManual()">Legg til i kassa</button></div></details>`:'';
  const wagerStatus=w=>{
    if(w.cancelled_at)return 'Avlyst';
    const ch=challenges.find(c=>Number(c.id)===Number(w.challenge_id));
    if(!agreed(w))return 'Venter på samtykke';
    if(!ch)return 'Ukjent challenge';
    return ended(ch)?'Avsluttet':'Pågår';
  };
  const html=()=>{
    const outstanding=debts.filter(x=>!x.settled),settled=debts.filter(x=>x.settled);
    const debtRow=p=>`<div class="wager-debt"><div><b>${safe(p.debtor)} skylder ${safe(p.creditor)}: ${safe(p.description)}</b> <span class="wager-tag">${p.settled?'✅ Oppgjort':'💸 Utestående'}</span></div><div class="wager-mini">${safe(p.reason||'Frivillig avtale')}</div>${!p.settled&&canWrite()&&(coach()||p.created_by===currentUser.id||p.debtor===actor())?`<button class="btn small secondary" onclick="window.wagerSettle(${p.id})">Marker som oppgjort</button>`:''}</div>`;
    const wagerRow=w=>{
      const ch=challenges.find(c=>Number(c.id)===Number(w.challenge_id));
      const missing=w.debtor_names.filter(n=>!accepts.some(a=>Number(a.wager_id)===Number(w.id)&&a.athlete===n));
      const me=actor();
      return `<div class="wager-box"><div class="wager-head"><div><b>🤝 ${safe(ch?.title||'Challenge')}</b><div class="wager-mini">${safe(w.debtor_names.join(' og '))} → ${safe(w.creditor)} • ${safe(w.stake)}</div></div><span class="wager-tag">${wagerStatus(w)}</span></div>
      <div class="wager-mini">Samtykke: ${w.debtor_names.map(n=>safe(n)+(missing.includes(n)?' ⏳':' ✅')).join(' · ')}</div>
      ${canWrite()&&missing.includes(me)&&ch?.active&&ch.end_date>=today()&&!w.cancelled_at?`<div class="wager-actions"><button class="btn small" onclick="window.wagerAccept(${w.id})">Jeg godtar veddemålet</button></div>`:''}
      ${canWrite()&&!w.cancelled_at&&!agreed(w)&&(coach()||w.created_by===currentUser.id)?`<div class="wager-actions"><button class="btn small secondary" onclick="window.wagerCancel(${w.id})">Avlys</button></div>`:''}
      </div>`;
    };
    return `<h2>💸 Straffekassa</h2><div class="muted">Frivillige veddemål knyttet til challenges og manuelle avtaler. Ingen automatisk gjeld uten samtykke.</div>
    <h3 style="margin-top:12px">Utestående (${outstanding.length})</h3>${outstanding.map(debtRow).join('')||'<div class="muted">Ingen skylder noen noe. Mistenkelig fredelig ☕</div>'}
    <h3 style="margin-top:13px">Veddemål</h3>${wagers.slice(0,15).map(wagerRow).join('')||'<div class="muted">Ingen veddemål ennå.</div>'}
    ${formActions()}
    <details style="margin-top:12px"><summary><b>✅ Oppgjort (${settled.length})</b></summary>${settled.map(debtRow).join('')||'<div class="muted">Ingen oppgjorte avtaler ennå.</div>'}</details>`;
  };
  const show=()=>{
    const home=document.getElementById('home');if(!home)return;
    const target=[...home.querySelectorAll('#gaintrainFun > .card')].find(el=>el.querySelector('h2')?.textContent.includes('Straffekassa'));
    if(target)target.innerHTML=html();
  };
  const refresh=async()=>{await load();await reconcile();show()};
  const get=id=>document.getElementById(id)?.value?.trim()||'';
  const problem=r=>{if(r.error){alert('Kunne ikke lagre: '+r.error.message);return true}return false};
  window.wagerChooseDebtors=()=>{
    const creditor=document.getElementById('wagerCreditor'),v=get('wagerDebtors');
    if(!creditor)return;
    creditor.innerHTML=opts(v==='Begge'?['Amund']:['Ivan','Espen','Amund'].filter(x=>x!==v));
  };
  window.wagerCreate=async()=>{
    if(!canWrite())return;
    const ch=challenges.find(x=>String(x.id)===get('wagerChallenge')),v=get('wagerDebtors'),names=v==='Begge'?['Ivan','Espen']:[v],creditor=get('wagerCreditor'),stake=get('wagerStake');
    if(!ch||!ch.active||ch.end_date<today()||!stake||names.includes(creditor))return alert('Velg en aktiv challenge, mottaker og en innsats som gir mening.');
    if(wagers.some(w=>Number(w.challenge_id)===Number(ch.id)&&!w.cancelled_at))return alert('Det finnes allerede et aktivt veddemål på denne challengen.');
    const r=await sb.from('fun_wagers').insert({challenge_id:ch.id,debtor_names:names,creditor,stake,created_by:currentUser.id});
    if(!problem(r))await refresh();
  };
  window.wagerAccept=async id=>{
    const w=wagers.find(x=>Number(x.id)===Number(id)),me=actor(),ch=challenges.find(x=>Number(x.id)===Number(w?.challenge_id));
    if(!canWrite()||!w||!w.debtor_names.includes(me)||w.cancelled_at||!ch?.active||ch.end_date<today())return;
    if(!confirm('Godtar du at du skylder '+w.creditor+' '+w.stake+' dersom du ikke klarer '+ch.title+'?'))return;
    const r=await sb.from('fun_wager_acceptances').insert({wager_id:id,athlete:me,accepted_by:currentUser.id});
    if(!problem(r))await refresh();
  };
  window.wagerCancel=async id=>{
    const w=wagers.find(x=>Number(x.id)===Number(id));
    if(!canWrite()||!w||agreed(w)||!(coach()||w.created_by===currentUser.id))return;
    const r=await sb.from('fun_wagers').update({cancelled_at:new Date().toISOString()}).eq('id',id);
    if(!problem(r))await refresh();
  };
  window.wagerManual=async()=>{
    if(!canWrite())return;
    const debtor=get('wagerManualDebtor'),creditor=get('wagerManualCreditor'),description=get('wagerManualWhat'),reason=get('wagerManualWhy');
    if(!description||debtor===creditor||(!coach()&&debtor!==actor()&&!(debtor==='Amund'&&creditor===actor())))return alert('Velg to ulike personer og skriv hva som skyldes. Som utøver kan du registrere egen gjeld eller en avtalt premie fra Amund til deg.');
    const r=await sb.from('fun_penalties').insert({debtor,creditor,description,reason,created_by:currentUser.id});
    if(!problem(r))await refresh();
  };
  window.wagerSettle=async id=>{
    const p=debts.find(x=>Number(x.id)===Number(id));
    if(!canWrite()||!p||!(coach()||p.created_by===currentUser.id||p.debtor===actor()))return;
    const r=await sb.from('fun_penalties').update({settled:true,settled_at:new Date().toISOString()}).eq('id',id);
    if(!problem(r))await refresh();
  };
  const baseRender=renderHome;
  renderHome=function(...args){const out=baseRender(...args);setTimeout(refresh,120);return out};
  const baseStart=startSession;
  startSession=async function(...args){const out=await baseStart(...args);await refresh();return out};
  const baseSave=save;
  save=async function(...args){const out=await baseSave(...args);setTimeout(refresh,120);return out};
  if(typeof currentProfile!=='undefined'&&currentProfile)setTimeout(refresh,240);
})();