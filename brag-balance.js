(() => {
  if (typeof renderHome !== 'function' || typeof stateByName !== 'function') return;

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
    a1.forEach(({x})=>ex1.forEach(e=>{const v=w1Value(x,e);if(!v)return;const prev=best1[e.name];if(prev!=null&&v.score>prev)events.push({name,date:x.date||'',label:e.name,value:v.display});best1[e.name]=Math.max(prev??-Infinity,v.score)}));
    const a3=sorted(s.w3||[]),checks=[['Sandbag to shoulder','sb','high'],['Ground to air','gta','high'],['Armheving','push','high'],['Total tid','total','low']],best3={};
    a3.forEach(({x})=>checks.forEach(([label,key,dir])=>{const v=w3Value(x,key);if(!v)return;const prev=best3[key];if(prev!=null&&((dir==='low'&&v.score<prev)||(dir==='high'&&v.score>prev)))events.push({name,date:x.date||'',label,value:v.display});best3[key]=prev==null?v.score:(dir==='low'?Math.min(prev,v.score):Math.max(prev,v.score))}));
    const a5=sorted(s.w5||[]),tests=[['Løpetest 12 km/t','runTime'],['Knebøy','squats'],['Armhevinger','pushups'],['Box jump','boxJumps'],['Pullups','pullups']],best5={};
    a5.forEach(({x})=>tests.forEach(([label,key])=>{const v=testValue(x,key);if(!v)return;const prev=best5[key];if(prev!=null&&v.score>prev)events.push({name,date:x.date||'',label,value:v.display});best5[key]=Math.max(prev??-Infinity,v.score)}));
    return events.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
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

  const rebalance=()=>{
    const card=document.getElementById('bragCard'); if(!card)return;
    const picks=['Ivan','Espen'].map(name=>pbEventsFor(name)[0]).filter(Boolean);
    const head=card.querySelector('.brag-head')?.outerHTML||'<div class="brag-head"><h2>Skryteluka 🥳</h2><span class="badge">PB</span></div>';
    card.innerHTML=head+(picks.length?picks.map(e=>`<div class="brag-item"><div class="brag-text">${esc(bragText(e))}</div><div class="brag-date">${esc(e.date)} • ${esc(e.value)}</div></div>`).join(''):'<div class="muted">Ingen ferske PB-er å skryte av akkurat nå. Det kommer 😎</div>');
  };

  const baseRenderHome=renderHome;
  renderHome=function(...args){const out=baseRenderHome(...args);setTimeout(rebalance,0);return out};
  if(typeof currentProfile!=='undefined'&&currentProfile)setTimeout(rebalance,100);
})();
