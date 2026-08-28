(() => {
  document.title = 'GainTrain';

  const addMeta = (name, content) => {
    let el = document.querySelector(`meta[name="${name}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };
  const addLink = (rel, href) => {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  };

  addMeta('apple-mobile-web-app-title', 'GainTrain');
  addMeta('apple-mobile-web-app-capable', 'yes');
  addMeta('mobile-web-app-capable', 'yes');
  addLink('manifest', 'site.webmanifest');
  addLink('icon', 'favicon.png');
  addLink('apple-touch-icon', 'apple-touch-icon.png');

  const css = document.createElement('style');
  css.textContent = `
    header{padding:8px 12px!important}.headrow{min-height:68px}.brand{gap:12px!important;align-items:center!important}
    .brandlogo{width:60px!important;height:60px!important;object-fit:contain;flex:0 0 60px!important}.gaintrain-copy{min-width:0}
    .gaintrain-name{font-size:20px;font-weight:900;line-height:1;color:#fff}.gaintrain-title{font-size:13px;font-weight:700;line-height:1.15;margin-top:3px;color:#fff}
    .gaintrain-subtitle{font-size:11px;line-height:1.15;margin-top:2px;color:#dce8fb}.gaintrain-copy .who{font-size:10px!important;margin-top:5px!important;color:#fff}
    .last-workout{border:2px solid var(--b);border-radius:11px;background:#f7faff;padding:11px;margin-top:8px}.last-workout h3{margin:0 0 3px}.last-workout .lastdate{font-size:11px;color:#6b7589;margin-bottom:8px}
    .last-workout .lastrow{padding:4px 0;border-bottom:1px solid #e3e9f2;font-size:12px}.last-workout .lastrow:last-child{border-bottom:0}.last-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
    .old-workout{border:1px solid var(--line);border-radius:9px;margin-top:7px;background:#fafbfe;overflow:hidden}.old-workout summary{cursor:pointer;padding:9px 10px;font-size:12px}.old-detail{padding:9px 10px;border-top:1px solid var(--line);font-size:12px;line-height:1.45}
    .test-intro{background:#eef4ff;border:1px solid #c8d8f2;border-radius:10px;padding:10px;margin:8px 0 12px;font-size:12px;line-height:1.45}.test-block{border:1px solid var(--line);border-radius:10px;padding:11px;margin:10px 0;background:#fafbfe}.test-block h3{margin:0 0 4px}.test-number{display:inline-flex;width:24px;height:24px;border-radius:50%;align-items:center;justify-content:center;background:var(--b);color:#fff;font-weight:800;margin-right:7px}.test-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.test-result{padding:4px 0;border-bottom:1px solid #e3e9f2;font-size:12px}
    @media(max-width:650px){header{padding:7px 9px!important}.brand{gap:9px!important}.brandlogo{width:52px!important;height:52px!important;flex-basis:52px!important}.gaintrain-name{font-size:18px}.gaintrain-title{font-size:12px}.gaintrain-subtitle{font-size:10px}.headrow>.btn{padding:7px 8px!important;font-size:10px!important}.test-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(css);

  const applyHeader = () => {
    const header = document.querySelector('header');
    const brand = header?.querySelector('.brand');
    const who = document.getElementById('who');
    if (!header || !brand || !who) return;
    const currentWho = who.textContent;
    brand.innerHTML = '';
    const logo = document.createElement('img');
    logo.src = 'gaintrain-logo.png'; logo.alt = 'GainTrain'; logo.className = 'brandlogo';
    const copy = document.createElement('div'); copy.className = 'gaintrain-copy';
    copy.innerHTML = `<div class="gaintrain-name">GainTrain</div><div class="gaintrain-title">Espen og Ivans treningsdagbok</div><div class="gaintrain-subtitle">Oppfølging av Coach Amund</div><div id="who" class="who"></div>`;
    copy.querySelector('#who').textContent = currentWho;
    brand.append(logo, copy);
  };

  const testDetail = x => {
    const run = x.runTime || '-';
    const pulse = x.avgPulse ? ` • snittpuls ${esc(x.avgPulse)}` : '';
    return `<div class="test-result"><b>Oppvarming:</b> 10 min rolig jogg</div>
      <div class="test-result"><b>Løpetest 12 km/t:</b> ${esc(run)}${pulse}</div>
      <div class="test-result"><b>Knebøy over benk, 1 min:</b> ${stk(x.squats)}</div>
      <div class="test-result"><b>Armhevinger, 1 min:</b> ${stk(x.pushups)}</div>
      <div class="test-result"><b>Box jump, 1 min:</b> ${stk(x.boxJumps)}</div>
      <div class="test-result"><b>Pullups, 1 min:</b> ${stk(x.pullups)}</div>
      ${x.com ? `<div class="test-result"><b>Kommentar:</b> ${esc(x.com)}</div>` : ''}`;
  };

  const installHistory = () => {
    if (typeof ownHistory !== 'function' || typeof labelWorkout !== 'function') return;

    const detail = (k,x) => {
      if (k === 'w1') {
        return warmupSummary(x) + ex1.map(e => {
          const z=x.ex?.[e.name]; if(!z) return '';
          let v='-';
          if(e.kind==='max') v=z.r.map(stk).join(' / ');
          else if(e.kind==='kvreps') v=z.r.map((r,i)=>kg(z.w[i])+' x '+r).join(' / ');
          else v=z.w.map((w,i)=>kg(w)+' x '+(z.r?.[i]??'-')).join(' / ');
          return `<div class="lastrow"><b>${e.name}:</b> ${v}</div>`;
        }).join('');
      }
      if (k === 'w3') {
        const rs=x.rounds||[];
        return warmupSummary(x)+ex3.map(e=>{
          if(e.kind==='sharedweight'){
            const first=rs[0]?.ex?.[e.name];
            const reps=[0,1,2,3].map(i=>rs[i]?.ex?.[e.name]?.rep||'-').join(' / ');
            return `<div class="lastrow"><b>${e.name}:</b> ${first?kg(first.w):'-'} x ${reps}</div>`;
          }
          if(e.kind==='max') return `<div class="lastrow"><b>${e.name}:</b> ${[0,1,2,3].map(i=>stk(rs[i]?.ex?.[e.name]?.rep)).join(' / ')}</div>`;
          return `<div class="lastrow"><b>${e.name}:</b> KV x ${[0,1,2,3].map(i=>rs[i]?.ex?.[e.name]?.rep||'-').join(' / ')}</div>`;
        }).join('')+`<div class="lastrow"><b>Rundetider:</b> ${[0,1,2,3].map(i=>rs[i]?.time||'-').join(' / ')}</div><div class="lastrow"><b>Total tid inkl. pauser:</b> ${x.total||'-'}</div>`;
      }
      if (k === 'w5') return testDetail(x);
      return `<div class="lastrow"><b>${esc(x.type||'Aktivitet')}</b>${x.time?' – '+esc(x.time)+' min':''}${x.dist?' – '+esc(x.dist)+' km':''}</div>${x.com?`<div class="lastrow">${esc(x.com)}</div>`:''}`;
    };

    ownHistory = function(k){
      const arr=d[k]||[];
      if(!arr.length) return `<div class="card"><h2>Tidligere ${labelWorkout(k)}</h2><div class="muted">Ingen registreringer ennå.</div></div>`;
      const latest=arr[arr.length-1], latestIdx=arr.length-1;
      const old=arr.slice(0,-1).reverse().map((x,ri)=>{
        const idx=arr.length-2-ri;
        return `<details class="old-workout"><summary>${esc(x.date||'-')} – ${shortSummary(k,x)}</summary><div class="old-detail">${detail(k,x)}<div class="last-actions"><button class="btn small secondary" onclick="beginEdit('${k}',${idx})">Rediger</button><button class="btn small danger" onclick="del('${k}',${idx})">Slett</button></div></div></details>`;
      }).join('');
      return `<div class="card"><h2>Siste ${labelWorkout(k)}</h2><div class="muted" style="margin-bottom:6px">Her ser du hva du gjorde sist mens du registrerer ny økt.</div><div class="last-workout"><h3>${shortSummary(k,latest)}</h3><div class="lastdate">${esc(latest.date||'-')}</div>${detail(k,latest)}<div class="last-actions"><button class="btn small secondary" onclick="beginEdit('${k}',${latestIdx})">Rediger</button><button class="btn small danger" onclick="del('${k}',${latestIdx})">Slett</button></div></div>${old?`<div style="margin-top:12px"><b>Eldre økter</b>${old}</div>`:''}</div>`;
    };
  };

  const installTestWorkout = () => {
    const appView = document.getElementById('appView');
    if (!appView || typeof renderPages !== 'function') return;
    if (!document.getElementById('w5')) {
      const s=document.createElement('section'); s.id='w5'; s.className='hidden'; appView.appendChild(s);
    }

    const baseLabelWorkout = labelWorkout;
    labelWorkout = k => k === 'w5' ? 'Testøkt' : baseLabelWorkout(k);

    const baseShortSummary = shortSummary;
    shortSummary = (k,x) => k === 'w5' ? `Test • ${x.runTime || '-'} på 12 km/t` : baseShortSummary(k,x);

    const baseTotalCount = totalCount;
    totalCount = s => baseTotalCount(s) + (s.w5?.length || 0);

    const baseLatestWorkout = latestWorkout;
    latestWorkout = s => {
      const a=baseLatestWorkout(s), t=(s.w5||[]).map(x=>({k:'w5',date:x.date||'',x})).sort((a,b)=>b.date.localeCompare(a.date))[0];
      if(!a) return t; if(!t) return a; return t.date > a.date ? t : a;
    };

    const baseRenderTabs = renderTabs;
    renderTabs = function(){
      baseRenderTabs();
      if(isCoach()) return;
      const tabs=q('#tabs');
      if(tabs && !tabs.querySelector('[data-p="w5"]')){
        const b=document.createElement('button'); b.className='tab'; b.dataset.p='w5'; b.textContent='Test'; b.onclick=()=>showPage('w5'); tabs.appendChild(b);
      }
    };

    showPage = function(p){
      q('#tabs').querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.p===p));
      ['home','ivan','espen','w1','w2','w3','w4','w5'].forEach(x=>q('#'+x)?.classList.toggle('hidden',x!==p));
      scrollTo(0,0);
    };

    const baseRecentActivity = recentActivity;
    recentActivity = function(){
      let arr=[];
      ['Ivan','Espen'].forEach(name=>{let s=stateByName(name);['w1','w2','w3','w4','w5'].forEach(k=>(s[k]||[]).forEach(x=>arr.push({name,k,date:x.date||'',x,ref:workoutRef(k,x)})))});
      arr.sort((a,b)=>b.date.localeCompare(a.date));
      return arr.slice(0,8).map(a=>`<div class="plan clickable" onclick="openRecent('${a.name}','${a.k}','${a.ref}')"><span class="badge">${a.name}</span><div><b>${labelWorkout(a.k)}</b><div class="muted">${shortSummary(a.k,a.x)}</div></div><span>${a.date}</span></div>`).join('')||'<div class="muted">Ingen registreringer ennå.</div>';
    };

    const baseWorkoutCard = workoutCard;
    workoutCard = function(name,p,k,x,index){
      if(k!=='w5') return baseWorkoutCard(name,p,k,x,index);
      let ref=workoutRef(k,x),domId=workoutDomId(name,k,x),cs=comments.filter(c=>c.workout_owner_id===p?.id&&c.workout_ref===ref);
      let edit=isOwnName(name)&&!isCoach()?`<div class="workactions"><button class="btn small secondary" onclick="beginEdit('w5',${index})">Rediger økt</button></div>`:'';
      return `<div id="${domId}" class="workout"><div class="workhead"><div><b>Testøkt – ${name}</b><div class="muted">${x.date||'-'}</div></div><span class="badge">${shortSummary('w5',x)}</span></div><div style="margin-top:8px">${testDetail(x)}</div>${edit}${commentThread(cs,p?.id,ref,k,x.date)}<div class="commentbox"><label>Ny kommentar</label><textarea id="comment_${ref}" placeholder="Skriv kommentar til denne testen"></textarea><button class="btn small" onclick="addComment('${p?.id}','${ref}','${k}','${x.date}')">Legg inn kommentar</button></div></div>`;
    };

    const baseRenderPerson = renderPerson;
    renderPerson = function(name){
      baseRenderPerson(name);
      const s=stateByName(name);
      const target=q('#'+name.toLowerCase());
      if(target) target.insertAdjacentHTML('beforeend', historyForPerson(name,'w5',s.w5||[]));
    };

    window.testForm = function(){
      if(!d.w5) d.w5=[];
      const ed=currentEdit('w5');
      return `${editBanner('w5')}<div class="card ${ed?'editing':''}"><h2>${ed?'Rediger':'Ny'} Testøkt – ${currentProfile.name}</h2>
        <div class="test-intro"><b>Oppvarming:</b> 10 min rolig jogg.<br>Deretter gjennomføres testene under. På løpetesten settes mølla på 12 km/t. Klarer du 2:00, stopper du der og registrerer gjennomsnittspulsen.</div>
        <label>Dato</label><input id="w5date" type="date" value="${ed?.date||today()}">
        <div class="test-block"><h3><span class="test-number">1</span>Løpetest – 12 km/t</h3><div class="muted">Løp så lenge du klarer, maks 2:00.</div><div class="test-grid"><div><label>Tid</label><input id="w5run" value="${esc(ed?.runTime??'')}" placeholder="f.eks. 01:34 eller 02:00"></div><div><label>Gjennomsnittspuls hvis 2:00</label><div class="unitwrap"><input id="w5pulse" type="number" value="${esc(ed?.avgPulse??'')}"><span class="unit">bpm</span></div></div></div></div>
        <div class="test-block"><h3><span class="test-number">2</span>Knebøy over benk</h3><div class="muted">Uten vekt. Tell hvor mange du klarer på 1 min.</div><label>Antall</label><div class="unitwrap"><input id="w5squats" type="number" value="${esc(ed?.squats??'')}"><span class="unit">stk</span></div></div>
        <div class="test-block"><h3><span class="test-number">3</span>Armhevinger</h3><div class="muted">Maks antall på 1 min.</div><label>Antall</label><div class="unitwrap"><input id="w5pushups" type="number" value="${esc(ed?.pushups??'')}"><span class="unit">stk</span></div></div>
        <div class="test-block"><h3><span class="test-number">4</span>Box jump</h3><div class="muted">Tell hvor mange ganger du hopper opp og ned av box/benk på 1 min.</div><label>Antall</label><div class="unitwrap"><input id="w5box" type="number" value="${esc(ed?.boxJumps??'')}"><span class="unit">stk</span></div></div>
        <div class="test-block"><h3><span class="test-number">5</span>Pullups</h3><div class="muted">Maks antall på 1 min.</div><label>Antall</label><div class="unitwrap"><input id="w5pullups" type="number" value="${esc(ed?.pullups??'')}"><span class="unit">stk</span></div></div>
        <label>Kommentar</label><textarea id="w5com" placeholder="Valgfri kommentar">${esc(ed?.com??'')}</textarea>
        <button class="btn" onclick="saveW5()">${ed?'Oppdater test':'Lagre test'}</button></div>`;
    };

    window.saveW5 = async function(){
      if(!d.w5) d.w5=[];
      const ed=currentEdit('w5'),old=ed?workoutRef('w5',ed):null;
      const o={_id:ed?ed._id||old:uid(),date:q('#w5date').value,runTime:q('#w5run').value.trim(),avgPulse:q('#w5pulse').value,squats:q('#w5squats').value,pushups:q('#w5pushups').value,boxJumps:q('#w5box').value,pullups:q('#w5pullups').value,com:q('#w5com').value};
      if(ed){d.w5[editTarget.i]=o;editTarget=null;await save('Testen er oppdatert')}else{d.w5.push(o);await save('Test lagret');showCongrats()}
      showPage('w5');
    };

    const baseRenderPages = renderPages;
    renderPages = function(){
      if(d && !d.w5) d.w5=[];
      baseRenderPages();
      if(!isCoach()) q('#w5').innerHTML=testForm()+ownHistory('w5');
    };

    if(d && !d.w5) d.w5=[];
  };

  applyHeader();
  installHistory();
  installTestWorkout();
  if (typeof currentProfile !== 'undefined' && currentProfile) { renderTabs(); renderPages(); }
})();
