(() => {
  if (typeof sb === 'undefined') return;

  const style=document.createElement('style');
  style.textContent=`
    .coach-activity-overlay{position:fixed;inset:0;z-index:120;background:#10182f99;display:flex;align-items:center;justify-content:center;padding:20px}
    .coach-activity-box{width:min(360px,100%);background:#fff;border-radius:22px;padding:26px 22px 20px;text-align:center;box-shadow:0 18px 55px #0005}
    .coach-activity-kicker{font-size:12px;color:#6b7589;font-weight:800;text-transform:uppercase;letter-spacing:.06em}
    .coach-activity-text{font-size:25px;font-weight:900;line-height:1.18;margin:10px 0 8px;color:#172033}
    .coach-activity-sub{font-size:12px;color:#6b7589;margin-bottom:8px}
    .coach-heart{border:0;background:transparent;color:#e64770;font-size:76px;line-height:1;cursor:pointer;padding:5px 16px 2px;filter:drop-shadow(0 3px 2px #0002);animation:coachHeartBeat 1s infinite}
    .coach-heart:active{transform:scale(.88)}
    .coach-heart-hint{font-size:11px;color:#6b7589;margin-top:2px}
    @keyframes coachHeartBeat{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.16);opacity:.78}}
  `;
  document.head.appendChild(style);

  const messages=[
    'En av dine favorittgutter har vært svett 😏',
    'Coach! Noen har faktisk gjort som de fikk beskjed om 😇',
    'Gains-alarm! En av gutta har vært i aktivitet 💪',
    'Det lukter gjennomført treningsøkt her 😎',
    'En av dine disipler har samlet litt nye gains 🚂💪',
    'Breaking news: En av gutta trente helt frivillig ❤️',
    'Noen har vært flink gutt i GainTrain 😇',
    'Coach Amund, du har fersk trening å inspisere 👀'
  ];

  const realCoach=()=>typeof currentProfile!=='undefined'&&currentProfile?.role==='coach';
  const athleteNamesByIds=ids=>ids.map(id=>profileById(id)?.name).filter(n=>n==='Ivan'||n==='Espen');
  let pendingUpdatedAt=null;

  const hideAlert=()=>document.getElementById('coachActivityOverlay')?.remove();
  const showAlert=(names,latestAt)=>{
    hideAlert();
    pendingUpdatedAt=latestAt;
    const msg=messages[Math.floor(Math.random()*messages.length)];
    const who=names.length===2?'Ivan og Espen har vært i aktivitet':names.length===1?`${names[0]} har registrert trening`:'Det har kommet ny treningsaktivitet';
    const el=document.createElement('div');
    el.id='coachActivityOverlay';
    el.className='coach-activity-overlay';
    el.innerHTML=`<div class="coach-activity-box"><div class="coach-activity-kicker">Ny aktivitet 🚨</div><div class="coach-activity-text">${esc(msg)}</div><div class="coach-activity-sub">${esc(who)} siden sist du var innom.</div><button class="coach-heart" onclick="ackCoachActivity()" aria-label="OK">♥</button><div class="coach-heart-hint">Trykk på hjertet for å fortsette</div></div>`;
    document.body.appendChild(el);
  };

  const initCoachActivityAlert=async()=>{
    if(!realCoach()||!currentUser)return;
    const state=await sb.from('coach_activity_notice_state').select('last_seen_at').eq('user_id',currentUser.id).maybeSingle();
    if(state.error)return;
    if(!state.data){
      const now=new Date().toISOString();
      await sb.from('coach_activity_notice_state').insert({user_id:currentUser.id,last_seen_at:now,updated_at:now});
      return;
    }
    const lastSeen=state.data.last_seen_at;
    const r=await sb.from('user_state').select('user_id,updated_at').gt('updated_at',lastSeen).order('updated_at',{ascending:true});
    if(r.error||!r.data?.length)return;
    const names=athleteNamesByIds([...new Set(r.data.map(x=>x.user_id))]);
    if(!names.length)return;
    const latest=r.data[r.data.length-1].updated_at||new Date().toISOString();
    showAlert(names,latest);
  };

  window.ackCoachActivity=async()=>{
    if(!realCoach()||!currentUser){hideAlert();return}
    const now=new Date().toISOString();
    const seen=pendingUpdatedAt&&new Date(pendingUpdatedAt)>new Date(now)?pendingUpdatedAt:now;
    const r=await sb.from('coach_activity_notice_state').upsert({user_id:currentUser.id,last_seen_at:seen,updated_at:now},{onConflict:'user_id'});
    if(r.error){alert('Kunne ikke markere varselet som lest: '+r.error.message);return}
    hideAlert();
  };

  const baseStartSession=startSession;
  startSession=async function(...args){
    const out=await baseStartSession(...args);
    setTimeout(initCoachActivityAlert,100);
    return out;
  };

  if(typeof currentProfile!=='undefined'&&currentProfile) setTimeout(initCoachActivityAlert,150);
})();
