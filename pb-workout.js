(() => {
  if (typeof renderPerson !== 'function' || typeof workoutDomId !== 'function') return;

  const num=v=>{const n=Number(String(v??'').replace(',','.'));return Number.isFinite(n)?n:0};
  const tag=()=>'<span class="pb">🥳 PB</span>';
  const latestByDate=(arr=[])=>arr.map((x,i)=>({x,i})).sort((a,b)=>(b.x.date||'').localeCompare(a.x.date||''))[0];
  const olderThan=(arr=[],latest)=>arr.filter((_,i)=>i!==latest.i);

  const w1Score=(x,e)=>{
    const z=x?.ex?.[e.name]; if(!z)return 0;
    if(e.kind==='max')return Math.max(0,...(z.r||[]).map(num));
    if(e.kind==='kvreps'){
      const ws=(z.w||[]).map(v=>String(v).toUpperCase()==='KV'?0:num(v));
      const mw=Math.max(0,...ws); return mw>0?mw:Math.max(0,...(z.r||[]).map(num))/1000;
    }
    return Math.max(0,...(z.w||[]).map(num));
  };

  const sec=v=>typeof timeToSeconds==='function'?timeToSeconds(v):null;
  const w3Metric=(x,key)=>{const r=x?.rounds||[];if(key==='sb')return num(r[0]?.ex?.['Sandbag to shoulder']?.w);if(key==='gta')return num(r[0]?.ex?.['Ground to air']?.w);if(key==='push')return Math.max(0,...[0,1,2,3].map(i=>num(r[i]?.ex?.['Armheving']?.rep)));if(key==='total')return sec(x?.total);return 0};

  const addToLine=(root,label)=>{
    if(!root)return;
    const b=[...root.querySelectorAll('b')].find(el=>el.textContent.trim().replace(/:$/,'')===label);
    const line=b?.parentElement;
    if(line && !line.querySelector('.pb')) line.insertAdjacentHTML('beforeend',tag());
  };

  const markW1=(name,s)=>{
    const latest=latestByDate(s.w1||[]); if(!latest)return;
    const old=olderThan(s.w1||[],latest); if(!old.length)return;
    const root=document.getElementById(workoutDomId(name,'w1',latest.x));
    ex1.forEach(e=>{const v=w1Score(latest.x,e),best=Math.max(...old.map(x=>w1Score(x,e)));if(v>best&&v>0)addToLine(root,e.name)});
  };

  const markW3=(name,s)=>{
    const latest=latestByDate(s.w3||[]); if(!latest)return;
    const old=olderThan(s.w3||[],latest); if(!old.length)return;
    const root=document.getElementById(workoutDomId(name,'w3',latest.x));
    const checks=[['Sandbag to shoulder','sb','high'],['Ground to air','gta','high'],['Armheving','push','high'],['Total tid inkl. pauser','total','low']];
    checks.forEach(([label,key,dir])=>{const v=w3Metric(latest.x,key),vals=old.map(x=>w3Metric(x,key)).filter(x=>x!=null&&x>0);if(!vals.length||v==null||v<=0)return;const pb=dir==='low'?v<Math.min(...vals):v>Math.max(...vals);if(pb)addToLine(root,label)});
  };

  const markTest=(name,s)=>{
    const latest=latestByDate(s.w5||[]); if(!latest)return;
    const old=olderThan(s.w5||[],latest); if(!old.length)return;
    const root=document.getElementById(workoutDomId(name,'w5',latest.x)); if(!root)return;
    const metrics=[['Løpetest 12 km/t','runTime',v=>sec(v)],['Knebøy over benk, 1 min','squats',num],['Armhevinger, 1 min','pushups',num],['Box jump, 1 min','boxJumps',num],['Pullups, 1 min','pullups',num]];
    metrics.forEach(([label,key,fn])=>{const v=fn(latest.x?.[key]),best=Math.max(0,...old.map(x=>fn(x?.[key])||0));if(v!=null&&v>best&&v>0)addToLine(root,label)});
  };

  const baseRenderPerson=renderPerson;
  renderPerson=function(name){
    const out=baseRenderPerson(name);
    const page=document.getElementById(name.toLowerCase());
    page?.querySelectorAll('.pb').forEach(x=>x.remove());
    const s=stateByName(name);
    markW1(name,s); markW3(name,s); markTest(name,s);
    return out;
  };

  if(typeof currentProfile!=='undefined'&&currentProfile){renderPerson('Ivan');renderPerson('Espen')}
})();
