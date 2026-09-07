(() => {
  if (typeof renderHome !== 'function' || typeof stateByName !== 'function') return;

  const style=document.createElement('style');
  style.textContent=`
    .gtcal-card{overflow:hidden}.gtcal-head{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:10px}.gtcal-nav{display:flex;gap:6px;align-items:center}.gtcal-title{font-size:15px;font-weight:900;min-width:140px;text-align:center}.gtcal-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}.gtcal-dow{font-size:10px;font-weight:800;text-align:center;color:#6b7589;padding:3px 0}.gtcal-day{min-height:78px;border:1px solid var(--line);border-radius:9px;background:#fff;padding:5px;position:relative;overflow:hidden}.gtcal-day.out{opacity:.35}.gtcal-day.today{outline:2px solid var(--b)}.gtcal-date{font-size:11px;font-weight:900;margin-bottom:4px}.gtcal-event{font-size:9px;line-height:1.2;padding:3px 4px;border-radius:6px;margin-top:3px;background:#f1f4f9;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gtcal-event.done{background:#e9f6e9}.gtcal-event.plan{background:#eef4ff}.gtcal-week{grid-column:1/-1;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;position:relative;margin-top:2px}.gtcal-challenge{grid-row:1;background:#fff2cc;border:1px solid #e1c45f;border-radius:7px;padding:4px 6px;font-size:10px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;z-index:2}.gtcal-rowdays{grid-column:1/-1;display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}.gtcal-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.gtcal-form{margin-top:10px;border-top:1px solid #e5e9f0;padding-top:10px}.gtcal-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.gtcal-detail{margin-top:10px;padding:9px;border-radius:9px;background:#f7f9fc}.gtcal-detail h3{margin-top:0}.gtcal-detail-item{font-size:12px;padding:5px 0;border-bottom:1px solid #e7ebf2}.gtcal-detail-item:last-child{border-bottom:0}.gtcal-chinfo{margin-top:8px;padding:8px;border-radius:8px;background:#fff7db;font-size:12px}.gtcal-empty{font-size:11px;color:#6b7589}
    @media(max-width:650px){.gtcal-day{min-height:70px;padding:4px}.gtcal-event{font-size:8px;padding:2px 3px}.gtcal-title{min-width:110px;font-size:13px}.gtcal-form-grid{grid-template-columns:1fr}.gtcal-challenge{font-size:9px}}
  `;
  document.head.appendChild(style);

  let calCursor=new Date(); calCursor=new Date(calCursor.getFullYear(),calCursor.getMonth(),1);
  let challengesCache=[];
  const pad=n=>String(n).padStart(2,'0');
  const ymd=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  const fromYmd=s=>{const [y,m,d]=String(s||'').split('-').map(Number);return new Date(y,m-1,d)};
  const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
  const sameMonth=(d,c)=>d.getMonth()===c.getMonth()&&d.getFullYear()===c.getFullYear();
  const monthName=d=>d.toLocaleDateString('no-NO',{month:'long',year:'numeric'}).replace(/^./,m=>m.toUpperCase());
  const mondayIndex=d=>(d.getDay()+6)%7;

  const allPlans=()=>{
    const out=[];
    ['Ivan','Espen'].forEach(owner=>{
      const s=stateByName(owner)||{};
      (s.plans||[]).forEach((p,i)=>out.push({...p,_owner:owner,_index:i}));
    });
    return out;
  };

  const workoutsForDate=date=>{
    const out=[];
    ['Ivan','Espen'].forEach(name=>{
      const s=stateByName(name)||{};
      ['w1','w2','w3','w4','w5'].forEach(k=>(s[k]||[]).forEach(x=>{if((x.date||'')===date)out.push({name,k,x})}));
    });
    return out;
  };

  const workoutShort=k=>({w1:'Styrke 1',w2:'Kondisjon',w3:'Styrke 2',w4:'Kondisjon',w5:'Test'})[k]||'Økt';
  const planIcon=t=>t==='Styrke 1'||t==='Styrke 2'?'💪':t==='Kondisjon'?'🏃':t==='Test'?'🧪':'📅';

  const fetchChallenges=async()=>{
    if(typeof sb==='undefined')return;
    const r=await sb.from('coach_challenges').select('*').order('start_date',{ascending:true});
    if(!r.error)challengesCache=r.data||[];
  };

  const challengeSegments=(weekStart,weekEnd)=>challengesCache.filter(ch=>ch.start_date<=ymd(weekEnd)&&ch.end_date>=ymd(weekStart)).map(ch=>{
    const s=fromYmd(ch.start_date),e=fromYmd(ch.end_date);
    const start=Math.max(0,Math.round((new Date(Math.max(s,weekStart))-weekStart)/86400000));
    const end=Math.min(6,Math.round((new Date(Math.min(e,weekEnd))-weekStart)/86400000));
    return {ch,start,end};
  });

  const openDay=date=>{
    const box=document.getElementById('gtcalDetail');if(!box)return;
    const ws=workoutsForDate(date),ps=allPlans().filter(p=>p.date===date||p.planned_date===date),chs=challengesCache.filter(ch=>ch.start_date<=date&&ch.end_date>=date);
    let html=`<h3>${fromYmd(date).toLocaleDateString('no-NO',{weekday:'long',day:'numeric',month:'long'})}</h3>`;
    if(!ws.length&&!ps.length&&!chs.length)html+='<div class="gtcal-empty">Ingenting registrert denne dagen.</div>';
    ws.forEach(w=>html+=`<div class="gtcal-detail-item">✅ <b>${esc(w.name)}</b> – ${esc(workoutShort(w.k))}</div>`);
    ps.forEach(p=>html+=`<div class="gtcal-detail-item">📅 <b>${esc(p.assignee||p._owner)}</b> – ${esc(p.type||p.workout_type||'Planlagt økt')}${p.note?`<div class="muted">${esc(p.note)}</div>`:''}${p._owner===currentProfile?.name&&!isCoach()?`<button class="replylink" onclick="deletePlannedWorkout('${p._owner}',${p._index})">Slett plan</button>`:''}</div>`);
    chs.forEach(ch=>html+=`<div class="gtcal-chinfo">🎯 <b>${esc(ch.title)}</b><div class="muted">${esc(ch.start_date)} – ${esc(ch.end_date)}${ch.reward?' • Premie: '+esc(ch.reward):''}</div></div>`);
    box.innerHTML=html;
  };
  window.openCalendarDay=openDay;

  const calendarHtml=()=>{
    const first=new Date(calCursor.getFullYear(),calCursor.getMonth(),1),offset=mondayIndex(first),gridStart=addDays(first,-offset),weeks=[];
    for(let w=0;w<6;w++)weeks.push(addDays(gridStart,w*7));
    let html=`<div id="gtcalCard" class="card gtcal-card"><div class="gtcal-head"><h2 style="margin:0">Treningskalender</h2><div class="gtcal-nav"><button class="btn small secondary" onclick="calendarPrevMonth()">‹</button><div class="gtcal-title">${monthName(calCursor)}</div><button class="btn small secondary" onclick="calendarNextMonth()">›</button></div></div><div class="gtcal-grid">${['Man','Tir','Ons','Tor','Fre','Lør','Søn'].map(x=>`<div class="gtcal-dow">${x}</div>`).join('')}</div>`;
    weeks.forEach(weekStart=>{
      const weekEnd=addDays(weekStart,6),segments=challengeSegments(weekStart,weekEnd);
      html+=`<div class="gtcal-week">${segments.map(({ch,start,end})=>`<div class="gtcal-challenge" style="grid-column:${start+1}/${end+2}" onclick="openCalendarDay('${ymd(addDays(weekStart,start))}')">🎯 Challenge – ${esc(ch.title)}</div>`).join('')}<div class="gtcal-rowdays">`;
      for(let i=0;i<7;i++){
        const d=addDays(weekStart,i),date=ymd(d),outs=!sameMonth(d,calCursor),todayClass=date===ymd(new Date())?' today':'',ws=workoutsForDate(date),ps=allPlans().filter(p=>(p.date||p.planned_date)===date);
        html+=`<div class="gtcal-day${outs?' out':''}${todayClass}" onclick="openCalendarDay('${date}')"><div class="gtcal-date">${d.getDate()}</div>${ws.slice(0,2).map(w=>`<div class="gtcal-event done">✅ ${esc(w.name)} ${esc(workoutShort(w.k))}</div>`).join('')}${ps.slice(0,2).map(p=>`<div class="gtcal-event plan">${planIcon(p.type||p.workout_type)} ${esc(p.assignee||p._owner)} ${esc(p.type||p.workout_type||'Plan')}</div>`).join('')}${ws.length+ps.length>4?`<div class="gtcal-event">+${ws.length+ps.length-4} til</div>`:''}</div>`;
      }
      html+='</div></div>';
    });
    html+=`<div class="gtcal-actions">${!isCoach()?'<button class="btn" onclick="togglePlanForm()">Planlegg økt</button>':''}<button class="btn secondary" onclick="calendarToday()">Denne måneden</button></div>${!isCoach()?`<div id="gtcalForm" class="gtcal-form hidden"><div class="gtcal-form-grid"><div><label>Hvem</label><select id="gtPlanWho"><option>${esc(currentProfile?.name||'Ivan')}</option><option>${currentProfile?.name==='Ivan'?'Espen':'Ivan'}</option><option>Begge</option></select></div><div><label>Dato</label><input id="gtPlanDate" type="date" value="${ymd(new Date())}"></div><div><label>Type økt</label><select id="gtPlanType"><option>Styrke 1</option><option>Styrke 2</option><option>Kondisjon</option><option>Test</option><option>Annet</option></select></div><div><label>Kommentar</label><input id="gtPlanNote" placeholder="f.eks. etter jobb"></div></div><button class="btn" style="margin-top:8px" onclick="savePlannedWorkout()">Lagre plan</button></div>`:''}<div id="gtcalDetail" class="gtcal-detail"><div class="gtcal-empty">Trykk på en dato for detaljer.</div></div></div>`;
    return html;
  };

  const placeCalendar=()=>{
    document.getElementById('gtcalCard')?.remove();
    const home=q('#home');if(!home)return;
    const wrap=document.createElement('div');wrap.innerHTML=calendarHtml();const cal=wrap.firstElementChild;
    const firstCard=home.querySelector(':scope > .card');
    if(firstCard)firstCard.insertAdjacentElement('afterend',cal);else home.prepend(cal);
  };

  window.calendarPrevMonth=()=>{calCursor=new Date(calCursor.getFullYear(),calCursor.getMonth()-1,1);placeCalendar()};
  window.calendarNextMonth=()=>{calCursor=new Date(calCursor.getFullYear(),calCursor.getMonth()+1,1);placeCalendar()};
  window.calendarToday=()=>{const n=new Date();calCursor=new Date(n.getFullYear(),n.getMonth(),1);placeCalendar()};
  window.togglePlanForm=()=>document.getElementById('gtcalForm')?.classList.toggle('hidden');

  window.savePlannedWorkout=async()=>{
    if(isCoach())return;
    const who=q('#gtPlanWho')?.value,date=q('#gtPlanDate')?.value,type=q('#gtPlanType')?.value,note=q('#gtPlanNote')?.value.trim();
    if(!date||!type)return;
    if(!Array.isArray(d.plans))d.plans=[];
    d.plans.push({_id:typeof uid==='function'?uid():'p_'+Date.now(),assignee:who,date,type,note,created_at:new Date().toISOString()});
    await save('Planlagt økt lagret');
    placeCalendar();
    openDay(date);
  };

  window.deletePlannedWorkout=async(owner,index)=>{
    if(isCoach()||owner!==currentProfile?.name)return;
    if(!Array.isArray(d.plans)||!d.plans[index])return;
    d.plans.splice(index,1);await save('Planlagt økt slettet');placeCalendar();
  };

  const baseRenderHome=renderHome;
  renderHome=function(...args){const out=baseRenderHome(...args);placeCalendar();return out};
  const baseSave=save;
  save=async function(...args){const out=await baseSave(...args);placeCalendar();return out};
  const baseStartSession=startSession;
  startSession=async function(...args){const out=await baseStartSession(...args);await fetchChallenges();placeCalendar();return out};

  if(typeof currentProfile!=='undefined'&&currentProfile){fetchChallenges().then(()=>placeCalendar())}
})();
