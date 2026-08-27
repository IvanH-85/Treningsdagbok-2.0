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
    @media(max-width:650px){header{padding:7px 9px!important}.brand{gap:9px!important}.brandlogo{width:52px!important;height:52px!important;flex-basis:52px!important}.gaintrain-name{font-size:18px}.gaintrain-title{font-size:12px}.gaintrain-subtitle{font-size:10px}.headrow>.btn{padding:7px 8px!important;font-size:10px!important}}
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

    if (typeof currentProfile !== 'undefined' && currentProfile && typeof renderPages === 'function') renderPages();
  };

  applyHeader();
  installHistory();
})();
