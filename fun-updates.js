(() => {
  if (typeof sb === 'undefined' || typeof renderHome !== 'function') return;

  const style=document.createElement('style');
  style.textContent=`
    .brag-card{overflow:hidden}.brag-head{display:flex;justify-content:space-between;gap:10px;align-items:center}.brag-item{padding:9px 0;border-bottom:1px solid #e7ebf2}.brag-item:last-child{border-bottom:0}.brag-text{font-size:13px;font-weight:800;line-height:1.35}.brag-date{font-size:10px;color:#6b7589;margin-top:3px}
    .challenge-pop{position:fixed;inset:0;background:#10182faa;display:flex;align-items:center;justify-content:center;padding:20px;z-index:95}.challenge-pop-box{background:#fff;border-radius:22px;padding:25px 22px 20px;text-align:center;max-width:360px;width:100%;box-shadow:0 18px 55px #0005}.challenge-pop-kicker{font-size:12px;font-weight:900;color:#2f5597;text-transform:uppercase;letter-spacing:.05em}.challenge-pop-text{font-size:24px;font-weight:900;line-height:1.15;margin:9px 0 12px}.challenge-pop-title{font-size:16px;font-weight:900;margin-bottom:4px}.challenge-pop-meta{font-size:12px;color:#6b7589;line-height:1.4}.challenge-pop-reward{margin-top:10px;padding:8px 9px;border-radius:9px;background:#fff2cc;font-size:12px}.challenge-heart{border:0;background:transparent;color:#e64770;font-size:72px;line-height:1;cursor:pointer;padding:6px 14px 0;animation:gaintrainHeart 1s ease-in-out infinite;filter:drop-shadow(0 3px 2px #0002)}.challenge-heart:active{transform:scale(.88)}@keyframes gaintrainHeart{0%,100%{transform:scale(1)}50%{transform:scale(1.16)}}
  `;
  document.head.appendChild(style);

  const num=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:0};
  const sec=v=>typeof timeToSeconds==='function'?timeToSeconds(v):null;
  const sorted=(a=[])=>a.map((x,i)=>({x,i})).sort((p,q)=>(p.x.date||'').localeCompare(q.x.date||''));
  const hash=s=>{let h=0;for(let i=0;i<s.length;i++)h=((h<<5)-h+s.charCodeAt(i))|0;return Math.abs(h)};

  const w1Value=(x,e)=>{
    const z=x?.ex?.[e.name]; if(!z)return null;
    if(e.kind==='max')return {score:Math.max(0,...(z.r||[]).map(num)),display:Math.max(0,...(z.r||[]).map(num))+' stk'};
    const weights=(z.w||[]).map(v=>String(v).toUpperCase()==='KV'?0:num(v)),m=Math.max(0,...weights);
    if(m>0)return {score:m,display:m.toFixed(1).replace('.',',')+' kg'};
    const reps=Math.max(0,...(z.r||[]).map(num));return reps?{score:reps/1000,display:reps+' stk'}:null;
  };
  const w3Value=(x,key)=>{const r=x?.rounds||[];if(key==='sb'){const v=num(r[0]?.ex?.['Sandbag to shoulder']?.w);return v?{score:v,display:v.toFixed(1).replace('.',',')+' kg'}:null}if(key==='gta'){const v=num(r[0]?.ex?.['Ground to air']?.w);return v?{score:v,display:v.toFixed(1).replace('.',',')+' kg'}:null}if(key==='push'){const v=Math.max(0,...[0,1,2,3].map(i=>num(r[i]?.ex?.['Armheving']?.rep)));return v?{score:v,display:v+' stk'}:null}if(key==='total'){const v=sec(x?.total);return v?{score:v,display:x.total}:null}return null};
  const testValue=(x,key)=>{if(key==='runTime'){const v=sec(x?.runTime);return v?{score:v,display:x.runTime}:null}const v=num(x?.[key]);return v?{score:v,display:v+' stk'}:null};

  const pbEventsFor=name=>{
    const s=stateByName(name),events=[];
    const a1=sorted(s.w1||[]),best1={};
    a1.forEach(({x})=>ex1.forEach(e=>{const v=w1Value(x,e);if(!v)return;const prev=best1[e.name];if(prev!=null&&v.score>prev)events.push({name,date:x.date||'',label:e.name,value:v.display,dir:'high'});best1[e.name]=Math.max(prev??-Infinity,v.score)}));
    const a3=sorted(s.w3||[]),checks=[['Sandbag to shoulder','sb','high'],['Ground to air','gta','high'],['Armheving','push','high'],['Total tid','total','low']],best3={};
    a3.forEach(({x})=>checks.forEach(([label,key,dir])=>{const v=w3Value(x,key);if(!v)return;const prev=best3[key];if(prev!=null&&((dir==='low'&&v.score<prev)||(dir==='high'&&v.score>prev)))events.push({name,date:x.date||'',label,value:v.display,dir});best3[key]=prev==null?v.score:(dir==='low'?Math.min(prev,v.score):Math.max(prev,v.score))}));
    const a5=sorted(s.w5||[]),tests=[['Løpetest 12 km/t','runTime'],['Knebøy','squats'],['Armhevinger','pushups'],['Box jump','boxJumps'],['Pullups','pullups']],best5={};
    a5.forEach(({x})=>tests.forEach(([label,key])=>{const v=testValue(x,key);if(!v)return;const prev=best5[key];if(prev!=null&&v.score>prev)events.push({name,date:x.date||'',label,value:v.display,dir:'high'});best5[key]=Math.max(prev??-Infinity,v.score)}));
    return events;
  };

  const bragText=e=>{
    const label=e.label.toLowerCase(),key=`${e.name}|${e.date}|${label}|${e.value}`;
    const lines=[
      `${e.name} tok ny PB i ${label} – for en maskin!! 🤖💪`,
      `${e.name} flytta grensa i ${label}. Dette begynner å bli frekt 😎`,
      `Ny PB! ${e.name} leverte ${e.value} i ${label} 🔥`,
      `${e.name} bestemte seg tydeligvis for å bli sterkere i dag 🥳 PB i ${label}!`,
      `Skrytealarm 🚨 ${e.name} satte ny PB i ${label} – ${e.value}!`
    ];
    return lines[hash(key)%lines.length];
  };
  const bragCard=()=>{const events=[...pbEventsFor('Ivan'),...pbEventsFor('Espen')].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,2);return `<div id="bragCard" class="card brag-card"><div class="brag-head"><h2>Skryteluka 🥳</h2><span class="badge">PB</span></div>${events.length?events.map(e=>`<div class="brag-item"><div class="brag-text">${esc(bragText(e))}</div><div class="brag-date">${esc(e.date)} • ${esc(e.value)}</div></div>`).join(''):'<div class="muted">Ingen ferske PB-er å skryte av akkurat nå. Det kommer 😎</div>'}</div>`};

  const placeBragCard=()=>{
    document.getElementById('bragCard')?.remove();
    const home=q('#home');if(!home)return;
    const cards=[...home.querySelectorAll(':scope > .card')];
    const challenge=cards.find(c=>c.querySelector('h2')?.textContent?.startsWith('Coach Amunds challenge'));
    const wrap=document.createElement('div');wrap.innerHTML=bragCard();const card=wrap.firstElementChild;
    if(challenge)challenge.insertAdjacentElement('afterend',card);else if(cards[0])cards[0].insertAdjacentElement('afterend',card);else home.appendChild(card);
  };

  const baseRenderHome=renderHome;
  renderHome=function(...args){const out=baseRenderHome(...args);placeBragCard();return out};

  const inCoachPreview=()=>{try{return currentProfile?.name==='Ivan'&&localStorage.getItem('gaintrain_coach_preview')==='1'}catch(_){return false}};
  const athlete=()=>currentProfile&&currentProfile.role!=='coach'&&!inCoachPreview()&&(currentProfile.name==='Ivan'||currentProfile.name==='Espen');
  const challengeMessages=[
    'Coach Amund har funnet på noe igjen 😈',
    'Nå har Coach kastet ut en ny utfordring 💪',
    'Å nei... Amund har fått en idé igjen 😂',
    'Du trodde kanskje du skulle få fred? Nope 😎',
    'Ny melding fra avdelingen for frivillig lidelse ❤️'
  ];

  const closeChallengePopup=async(ch)=>{
    if(!currentUser||!ch)return;
    const stamp=ch.created_at||new Date().toISOString();
    const r=await sb.from('challenge_read_state').upsert({user_id:currentUser.id,last_seen_challenge_at:stamp,updated_at:new Date().toISOString()},{onConflict:'user_id'});
    if(r.error){console.error('Kunne ikke markere challenge som lest',r.error);return}
    document.getElementById('challengeNewPopup')?.remove();
  };
  window.ackChallengeNotification=()=>{const el=document.getElementById('challengeNewPopup');if(!el)return;const raw=el.dataset.challenge;try{closeChallengePopup(JSON.parse(decodeURIComponent(raw)))}catch(_){el.remove()}};

  const checkChallengeNotification=async()=>{
    if(!athlete()||document.getElementById('challengeNewPopup'))return;
    const [chRes,seenRes]=await Promise.all([
      sb.from('coach_challenges').select('*').or(`assignee.eq.${currentProfile.name},assignee.eq.Begge`).order('created_at',{ascending:false}).limit(1).maybeSingle(),
      sb.from('challenge_read_state').select('last_seen_challenge_at').eq('user_id',currentUser.id).maybeSingle()
    ]);
    if(chRes.error||!chRes.data)return;
    const ch=chRes.data,seen=seenRes.data?.last_seen_challenge_at||'1970-01-01T00:00:00Z';
    if(new Date(ch.created_at)<=new Date(seen))return;
    const msg=challengeMessages[hash(`${currentProfile.name}|${ch.id}|${ch.title}`)%challengeMessages.length];
    const el=document.createElement('div');el.id='challengeNewPopup';el.className='challenge-pop';el.dataset.challenge=encodeURIComponent(JSON.stringify({id:ch.id,created_at:ch.created_at}));
    el.innerHTML=`<div class="challenge-pop-box"><div class="challenge-pop-kicker">Ny challenge</div><div class="challenge-pop-text">${esc(msg)}</div><div class="challenge-pop-title">${esc(ch.title)}</div><div class="challenge-pop-meta">Mål: ${esc(ch.target)} ${esc(ch.unit)} • Frist: ${esc(ch.end_date)}</div>${ch.reward?`<div class="challenge-pop-reward">🎁 <b>Premie:</b> ${esc(ch.reward)}</div>`:''}<div class="muted" style="margin-top:12px">Trykk på hjertet for å godta skjebnen</div><button class="challenge-heart" onclick="ackChallengeNotification()" aria-label="Lukk challengevarsel">♥</button></div>`;
    document.body.appendChild(el);
  };

  const baseStartSession=startSession;
  startSession=async function(...args){const out=await baseStartSession(...args);setTimeout(checkChallengeNotification,250);return out};

  if(typeof currentProfile!=='undefined'&&currentProfile){renderHome();setTimeout(checkChallengeNotification,350)}
})();
