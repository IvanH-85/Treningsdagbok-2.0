(() => {
  if (typeof renderPerson !== 'function' || typeof stateByName !== 'function') return;

  const num=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:0};
  const sec=v=>typeof timeToSeconds==='function'?timeToSeconds(v):null;
  const fmtKg=v=>Number(v).toFixed(1).replace('.',',')+'kg';
  const fmtStk=v=>Number(v)+' stk';
  const sorted=a=>(a||[]).slice().sort((x,y)=>(x.date||'').localeCompare(y.date||''));

  const w1Metric=(x,e)=>{
    const z=x?.ex?.[e.name]; if(!z)return null;
    if(e.kind==='max'){
      const v=Math.max(0,...(z.r||[]).map(num));
      return v?{score:v,display:fmtStk(v)}:null;
    }
    const weights=(z.w||[]).map(v=>String(v).toUpperCase()==='KV'?0:num(v));
    const maxW=Math.max(0,...weights);
    if(maxW>0)return {score:100000+maxW,display:fmtKg(maxW)};
    const reps=Math.max(0,...(z.r||[]).map(num));
    if(reps)return {score:reps,display:'KV x '+reps};
    return null;
  };

  const firstAndBestW1=(a,e)=>{
    const vals=a.map(x=>w1Metric(x,e)).filter(Boolean);
    if(!vals.length)return {first:'-',best:'-'};
    const best=vals.reduce((p,c)=>c.score>p.score?c:p,vals[0]);
    return {first:vals[0].display,best:best.display};
  };

  const w3Metric=(x,key)=>{
    const r=x?.rounds||[];
    if(/^round[1-4]$/.test(key)){
      const ix=Number(key.replace('round',''))-1;
      const display=r[ix]?.time;
      const v=sec(display);
      return v?{score:v,display}:null;
    }
    if(key==='total'){
      const v=sec(x?.total);return v?{score:v,display:x.total}:null;
    }
    if(key==='sb'){
      const v=num(r[0]?.ex?.['Sandbag to shoulder']?.w);return v?{score:v,display:fmtKg(v)}:null;
    }
    if(key==='gta'){
      const v=num(r[0]?.ex?.['Ground to air']?.w);return v?{score:v,display:fmtKg(v)}:null;
    }
    if(key==='push'){
      const v=Math.max(0,...[0,1,2,3].map(i=>num(r[i]?.ex?.['Armheving']?.rep)));return v?{score:v,display:fmtStk(v)}:null;
    }
    return null;
  };

  const firstAndBestW3=(a,key,low=false)=>{
    const vals=a.map(x=>w3Metric(x,key)).filter(Boolean);
    if(!vals.length)return {first:'-',best:'-'};
    const best=vals.reduce((p,c)=>low?(c.score<p.score?c:p):(c.score>p.score?c:p),vals[0]);
    return {first:vals[0].display,best:best.display};
  };

  const row=(label,first,best)=>`<div><b>${label}</b></div><div>${first}</div><div><b>${best}</b></div>`;
  const section=label=>`<div style="grid-column:1/-1;background:#eef3fb;font-weight:900;padding:7px;border-radius:6px;margin-top:3px">${label}</div>`;

  const w1Progress=name=>{
    const a=sorted(stateByName(name)?.w1||[]);
    if(!a.length)return '<div class="muted">Ingen styrkeøkter registrert ennå.</div>';
    return `<div class="hist"><div class="h">Øvelse</div><div class="h">Første</div><div class="h">PB</div>${ex1.map(e=>{const v=firstAndBestW1(a,e);return row(e.name,v.first,v.best)}).join('')}</div>`;
  };

  const w3Progress=name=>{
    const a=sorted(stateByName(name)?.w3||[]);
    if(!a.length)return '<div class="muted">Ingen sirkeløkter registrert ennå.</div>';
    const times=[
      ['Runde 1','round1'],
      ['Runde 2','round2'],
      ['Runde 3','round3'],
      ['Runde 4','round4'],
      ['Total tid inkl. pauser','total']
    ];
    const extras=[
      ['Sandbag to shoulder','sb'],
      ['Ground to air','gta'],
      ['Armheving – beste runde','push']
    ];
    return `<div class="hist"><div class="h">Resultat</div><div class="h">Første</div><div class="h">PB</div>${section('⏱️ Tid – hovedfokus')}${times.map(([label,key])=>{const v=firstAndBestW3(a,key,true);return row(label,v.first,v.best)}).join('')}${section('💪 Belastning og reps')}${extras.map(([label,key])=>{const v=firstAndBestW3(a,key,false);return row(label,v.first,v.best)}).join('')}</div>`;
  };

  const apply=name=>{
    const page=document.getElementById(name.toLowerCase());if(!page)return;
    const cards=[...page.querySelectorAll(':scope > .card')];
    const p1=cards.find(c=>/styrke.*progresjon/i.test(c.querySelector('h2')?.textContent||''));
    const p2=cards.find(c=>/sirkel.*progresjon|styrke 2.*progresjon/i.test(c.querySelector('h2')?.textContent||''));
    if(p1){p1.innerHTML=`<h2>Styrke økt – progresjon</h2><div class="muted" style="margin-bottom:7px">Første registrerte resultat sammenlignes med din beste registrering.</div>${w1Progress(name)}`;}
    if(p2){p2.innerHTML=`<h2>Sirkeløkt – progresjon</h2><div class="muted" style="margin-bottom:7px">Hovedfokus er tiden du bruker per runde. Vekt og armhevinger vises som tilleggsresultater.</div>${w3Progress(name)}`;}
  };

  const baseRenderPerson=renderPerson;
  renderPerson=function(name){const out=baseRenderPerson(name);setTimeout(()=>apply(name),0);return out};

  if(typeof currentProfile!=='undefined'&&currentProfile){setTimeout(()=>{apply('Ivan');apply('Espen')},120)}
})();