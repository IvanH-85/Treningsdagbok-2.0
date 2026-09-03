(() => {
  if (typeof sb === 'undefined' || typeof renderPerson !== 'function') return;

  const style=document.createElement('style');
  style.textContent=`
    .pb{display:inline-block;margin-left:5px;padding:2px 6px;border-radius:999px;background:#fff2cc;font-size:10px;font-weight:900;white-space:nowrap}
    .profile-history-latest{margin-top:8px}.profile-history-old{border:1px solid var(--line);border-radius:10px;margin-top:7px;background:#fafbfe;overflow:hidden}.profile-history-old>summary{cursor:pointer;padding:10px;font-size:12px;font-weight:700}.profile-history-old>.workout{margin:0;border:0;border-top:1px solid var(--line);border-radius:0}
    .comment-notice{background:#eef4ff;border:2px solid var(--b);border-radius:12px;padding:10px 12px;margin-bottom:12px;display:flex;justify-content:space-between;gap:10px;align-items:center}.comment-notice-title{font-size:13px;font-weight:900}.comment-notice-text{font-size:11px;color:#5e687b;margin-top:2px}.comment-notice-actions{display:flex;gap:6px;flex:0 0 auto}
    @media(max-width:650px){.comment-notice{align-items:flex-start;flex-direction:column}.comment-notice-actions{width:100%}.comment-notice-actions .btn{flex:1}}
  `;
  document.head.appendChild(style);

  const num=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:0};
  const pbTag=ok=>ok?'<span class="pb">🥳 PB</span>':'';
  const cardioEntriesLocal=s=>[...(s.w2||[]).map((x,i)=>({k:'w2',i,x})),...(s.w4||[]).map((x,i)=>({k:'w4',i,x}))].sort((a,b)=>(b.x.date||'').localeCompare(a.x.date||''));

  const w1Score=(x,e)=>{
    const z=x?.ex?.[e.name]; if(!z)return 0;
    if(e.kind==='max')return (z.r||[]).reduce((n,r)=>n+num(r),0);
    const weights=(z.w||[]).map(num),mw=Math.max(0,...weights);
    return mw>0?mw:(z.r||[]).reduce((n,r)=>n+num(r),0)/1000;
  };
  const latestW1Pb=(s,e)=>{const a=s.w1||[];if(a.length<2)return false;const latest=w1Score(a[a.length-1],e),best=Math.max(...a.slice(0,-1).map(x=>w1Score(x,e)));return latest>best};
  const w1ProgressPb=s=>{const a=s.w1||[],f=a[0],l=a[a.length-1];if(!f||!l)return'<div class="muted">Ingen Styrke 1 registrert ennå.</div>';return ex1.map(e=>{const fmt=z=>{if(!z)return'-';if(e.kind==='max')return z.r.map(stk).join(' / ');if(e.kind==='kvreps')return z.r.map((r,i)=>kg(z.w[i])+' x '+r).join(' / ');return z.w.map(kg).join(' / ')};return `<div class="hist"><div><b>${e.name}</b></div><div>${fmt(f.ex?.[e.name])}</div><div>${fmt(l.ex?.[e.name])}${pbTag(latestW1Pb(s,e))}</div></div>`}).join('')};

  const sec=v=>typeof timeToSeconds==='function'?timeToSeconds(v):null;
  const w3Metric=(x,key)=>{const r=x?.rounds||[];if(key==='sb')return num(r[0]?.ex?.['Sandbag to shoulder']?.w);if(key==='gta')return num(r[0]?.ex?.['Ground to air']?.w);if(key==='push')return [0,1,2,3].reduce((n,i)=>n+num(r[i]?.ex?.['Armheving']?.rep),0);if(key==='total')return sec(x?.total);return 0};
  const w3LatestPb=(a,key)=>{if(a.length<2)return false;const v=w3Metric(a[a.length-1],key),prev=a.slice(0,-1).map(x=>w3Metric(x,key)).filter(x=>x!=null);if(!prev.length||v==null)return false;return key==='total'?v<Math.min(...prev):v>Math.max(...prev)};
  const w3ProgressPb=s=>{const a=s.w3||[];if(!a.length)return'<div class="muted">Ingen Styrke 2 registrert ennå.</div>';return `<div class="scroll"><table><tr><th>Dato</th><th>Sandbag</th><th>Ground to air</th><th>Armheving R1</th><th>R2</th><th>R3</th><th>R4</th><th>Tid R1</th><th>R2</th><th>R3</th><th>R4</th><th>Total</th></tr>${a.map((x,ix)=>{const r=x.rounds||[],last=ix===a.length-1,sb=r[0]?.ex?.['Sandbag to shoulder']?.w,gta=r[0]?.ex?.['Ground to air']?.w,push=[0,1,2,3].map(i=>r[i]?.ex?.['Armheving']?.rep||'-'),times=[0,1,2,3].map(i=>r[i]?.time||'-');return `<tr><td>${x.date||'-'}</td><td>${kg(sb)}${last?pbTag(w3LatestPb(a,'sb')):''}</td><td>${kg(gta)}${last?pbTag(w3LatestPb(a,'gta')):''}</td><td>${push[0]}${last?pbTag(w3LatestPb(a,'push')):''}</td><td>${push[1]}</td><td>${push[2]}</td><td>${push[3]}</td><td>${times[0]}</td><td>${times[1]}</td><td>${times[2]}</td><td>${times[3]}</td><td><b>${x.total||'-'}</b>${last?pbTag(w3LatestPb(a,'total')):''}</td></tr>`}).join('')}</table></div>`};

  const compactHistory=(name,k,arr,title)=>{const p=profileByName(name),items=(arr||[]).map((x,i)=>({x,i})).sort((a,b)=>(b.x.date||'').localeCompare(a.x.date||''));if(!items.length)return `<div class="card"><h2>${title}</h2><div class="muted">Ingen registreringer ennå.</div></div>`;const [latest,...old]=items;return `<div class="card"><h2>${title}</h2><div class="muted">Siste økt vises. Trykk på eldre økter for å åpne dem.</div><div class="profile-history-latest">${workoutCard(name,p,k,latest.x,latest.i)}</div>${old.map(e=>`<details class="profile-history-old"><summary>${esc(e.x.date||'-')} – ${shortSummary(k,e.x)}</summary>${workoutCard(name,p,k,e.x,e.i)}</details>`).join('')}</div>`};
  const compactCardio=(name,s)=>{const p=profileByName(name),items=cardioEntriesLocal(s);if(!items.length)return'<div class="card"><h2>Kondisjon – historikk</h2><div class="muted">Ingen kondisjonsøkter ennå.</div></div>';const [latest,...old]=items;return `<div class="card"><h2>Kondisjon – historikk</h2><div class="muted">Siste økt vises. Trykk på eldre økter for å åpne dem.</div><div class="profile-history-latest">${workoutCard(name,p,latest.k,latest.x,latest.i)}</div>${old.map(e=>`<details class="profile-history-old"><summary>${esc(e.x.date||'-')} – ${shortSummary(e.k,e.x)}</summary>${workoutCard(name,p,e.k,e.x,e.i)}</details>`).join('')}</div>`};

  renderPerson=function(name){const s=stateByName(name),cardio=cardioEntriesLocal(s);let html=`<div class="card"><h2>${name}</h2><div class="stats"><div class="stat"><b>${totalCount(s)}</b><span class="muted">totalt</span></div><div class="stat"><b>${s.w1?.length||0}</b><span class="muted">Styrke 1</span></div><div class="stat"><b>${s.w3?.length||0}</b><span class="muted">Styrke 2</span></div><div class="stat"><b>${cardio.length}</b><span class="muted">Kondisjon</span></div></div></div><div class="card"><h2>Styrke 1 – progresjon</h2><div class="muted" style="margin-bottom:7px">🥳 PB vises når siste resultat er bedre enn dine tidligere resultater.</div><div class="hist"><div class="h">Øvelse</div><div class="h">Første</div><div class="h">Nå</div></div>${w1ProgressPb(s)}</div><div class="card"><h2>Styrke 2 – progresjon</h2><div class="muted" style="margin-bottom:8px">PB markeres på siste registrering når du slår tidligere beste.</div>${w3ProgressPb(s)}</div>`;html+=compactHistory(name,'w1',s.w1||[],'Styrke 1 – historikk');html+=compactHistory(name,'w3',s.w3||[],'Styrke 2 – historikk');html+=compactCardio(name,s);html+=compactHistory(name,'w5',s.w5||[],'Testøkt – historikk');q('#'+name.toLowerCase()).innerHTML=html};

  const baseOpenRecent=openRecent;
  openRecent=function(name,k,ref){showPage(name.toLowerCase());setTimeout(()=>{const id='workout_'+name.toLowerCase()+'_'+String(ref).replace(/[^a-zA-Z0-9_-]/g,'_'),el=document.getElementById(id);if(!el){baseOpenRecent(name,k,ref);return}const details=el.closest('details');if(details)details.open=true;document.querySelectorAll('.workout.focused').forEach(x=>x.classList.remove('focused'));el.classList.add('focused');el.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>el.classList.remove('focused'),1800)},60)};

  let commentLastSeen=null;
  const inCoachPreview=()=>{try{return currentProfile?.name==='Ivan'&&localStorage.getItem('gaintrain_coach_preview')==='1'}catch(_){return false}};
  const unreadComments=()=>{if(!currentUser||!currentProfile||currentProfile.role==='coach'||inCoachPreview()||!commentLastSeen)return[];return comments.filter(c=>c.workout_owner_id===currentUser.id&&c.author_id!==currentUser.id&&new Date(c.created_at)>new Date(commentLastSeen))};
  const initCommentState=async()=>{if(!currentUser||currentProfile?.role==='coach')return;const r=await sb.from('comment_read_state').select('last_seen_at').eq('user_id',currentUser.id).maybeSingle();if(r.error)return;if(!r.data){const now=new Date().toISOString();const ins=await sb.from('comment_read_state').insert({user_id:currentUser.id,last_seen_at:now});if(!ins.error)commentLastSeen=now}else commentLastSeen=r.data.last_seen_at;renderCommentNotice()};
  const markCommentsSeen=async()=>{if(!currentUser)return;const now=new Date().toISOString();const r=await sb.from('comment_read_state').upsert({user_id:currentUser.id,last_seen_at:now,updated_at:now},{onConflict:'user_id'});if(!r.error){commentLastSeen=now;renderCommentNotice()}};
  window.showUnreadComments=async()=>{const u=unreadComments(),latest=u[u.length-1];await markCommentsSeen();if(latest)openRecent(currentProfile.name,latest.workout_type,latest.workout_ref)};
  window.dismissCommentNotice=()=>markCommentsSeen();
  function renderCommentNotice(){document.getElementById('commentNotice')?.remove();const u=unreadComments();if(!u.length)return;const latest=u[u.length-1],author=authorLabel(latest.author_id),el=document.createElement('div');el.id='commentNotice';el.className='comment-notice';el.innerHTML=`<div><div class="comment-notice-title">💬 ${u.length===1?'Ny kommentar':'Nye kommentarer'} til deg</div><div class="comment-notice-text">${u.length===1?`${esc(author)} har kommentert ${esc(labelWorkout(latest.workout_type))}.`:`Du har ${u.length} uleste kommentarer.`}</div></div><div class="comment-notice-actions"><button class="btn small" onclick="showUnreadComments()">Vis</button><button class="btn small secondary" onclick="dismissCommentNotice()">Lest</button></div>`;const tabs=q('#tabs');tabs?.parentNode?.insertBefore(el,tabs)}

  const baseRenderPages=renderPages;
  renderPages=function(...args){const out=baseRenderPages(...args);setTimeout(renderCommentNotice,0);return out};
  const baseStartSession=startSession;
  startSession=async function(...args){const out=await baseStartSession(...args);await initCommentState();return out};

  if(typeof currentProfile!=='undefined'&&currentProfile){initCommentState();renderPages()}
})();
