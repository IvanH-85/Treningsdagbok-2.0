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
    header{padding:8px 12px!important}
    .headrow{min-height:68px}
    .brand{gap:12px!important;align-items:center!important}
    .brandlogo{
      width:60px!important;
      height:60px!important;
      object-fit:contain;
      flex:0 0 60px!important
    }
    .gaintrain-copy{min-width:0}
    .gaintrain-name{
      font-size:20px;
      font-weight:900;
      line-height:1;
      color:#fff;
      letter-spacing:.1px
    }
    .gaintrain-title{
      font-size:13px;
      font-weight:700;
      line-height:1.15;
      margin-top:3px;
      color:#fff
    }
    .gaintrain-subtitle{
      font-size:11px;
      line-height:1.15;
      margin-top:2px;
      color:#dce8fb
    }
    .gaintrain-copy .who{
      font-size:10px!important;
      margin-top:5px!important;
      color:#fff
    }
    .history-item{border:1px solid var(--line);border-radius:10px;background:#fafbfe;margin:8px 0;overflow:hidden}
    .history-item summary{list-style:none;cursor:pointer;padding:10px;display:grid;grid-template-columns:82px 1fr auto;gap:8px;align-items:center}
    .history-item summary::-webkit-details-marker{display:none}
    .history-item summary:after{content:'▾';font-size:13px;color:#6b7589;transition:transform .15s}
    .history-item[open] summary:after{transform:rotate(180deg)}
    .history-item[open] summary{background:#f3f6fb;border-bottom:1px solid var(--line)}
    .history-detail{padding:10px;font-size:12px;line-height:1.45}
    .history-detail>div{margin:2px 0}
    .history-item .history-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
    .history-latest{font-size:10px;font-weight:800;background:var(--lb);border-radius:6px;padding:3px 5px;color:#22314d}
    @media(max-width:650px){
      header{padding:7px 9px!important}
      .brand{gap:9px!important}
      .brandlogo{
        width:52px!important;
        height:52px!important;
        flex-basis:52px!important
      }
      .gaintrain-name{font-size:18px}
      .gaintrain-title{font-size:12px}
      .gaintrain-subtitle{font-size:10px}
      .headrow>.btn{padding:7px 8px!important;font-size:10px!important}
      .history-item summary{grid-template-columns:78px 1fr auto;padding:9px 8px}
    }
  `;
  document.head.appendChild(css);

  const applyHeader = () => {
    const header = document.querySelector('header');
    const brand = header?.querySelector('.brand');
    const who = document.getElementById('who');
    if (!header || !brand || !who) return;

    const currentWho = who.textContent;
    brand.innerHTML = '';

    const newLogo = document.createElement('img');
    newLogo.src = 'gaintrain-logo.png';
    newLogo.alt = 'GainTrain';
    newLogo.className = 'brandlogo';

    const copy = document.createElement('div');
    copy.className = 'gaintrain-copy';
    copy.innerHTML = `
      <div class="gaintrain-name">GainTrain</div>
      <div class="gaintrain-title">Espen og Ivans treningsdagbok</div>
      <div class="gaintrain-subtitle">Oppfølging av Coach Amund</div>
      <div id="who" class="who"></div>
    `;
    copy.querySelector('#who').textContent = currentWho;

    brand.append(newLogo, copy);
  };

  const installExpandableHistory = () => {
    if (typeof ownHistory !== 'function' || typeof labelWorkout !== 'function') return;

    const historyDetail = (k, x) => {
      if (k === 'w1') {
        return warmupSummary(x) + ex1.map(e => {
          const z = x.ex?.[e.name];
          if (!z) return '';
          let value;
          if (e.kind === 'max') value = z.r.map(stk).join(' / ');
          else if (e.kind === 'kvreps') value = z.r.map((r,i) => kg(z.w[i]) + ' x ' + r).join(' / ');
          else value = z.w.map((w,i) => kg(w) + ' x ' + (z.r?.[i] ?? '-')).join(' / ');
          return `<div><b>${e.name}:</b> ${value}</div>`;
        }).join('');
      }

      if (k === 'w3') {
        const rs = x.rounds || [];
        return warmupSummary(x) + ex3.map(e => {
          if (e.kind === 'sharedweight') {
            const first = rs[0]?.ex?.[e.name];
            const reps = [0,1,2,3].map(i => rs[i]?.ex?.[e.name]?.rep || '-').join(' / ');
            return `<div><b>${e.name}:</b> ${first ? kg(first.w) : '-'} x ${reps}</div>`;
          }
          if (e.kind === 'max') {
            const reps = [0,1,2,3].map(i => stk(rs[i]?.ex?.[e.name]?.rep)).join(' / ');
            return `<div><b>${e.name}:</b> ${reps}</div>`;
          }
          const reps = [0,1,2,3].map(i => rs[i]?.ex?.[e.name]?.rep || '-').join(' / ');
          return `<div><b>${e.name}:</b> KV x ${reps}</div>`;
        }).join('') +
        `<div style="margin-top:7px"><b>Rundetider:</b> ${[0,1,2,3].map(i => rs[i]?.time || '-').join(' / ')}</div>` +
        `<div><b>Total tid inkl. pauser:</b> ${x.total || '-'}</div>`;
      }

      return `<div><b>${esc(x.type || 'Aktivitet')}</b>${x.time ? ' – ' + esc(x.time) + ' min' : ''}${x.dist ? ' – ' + esc(x.dist) + ' km' : ''}</div>${x.com ? `<div class="muted" style="margin-top:5px">${esc(x.com)}</div>` : ''}`;
    };

    ownHistory = function(k) {
      const arr = d[k] || [];
      if (!arr.length) return `<div class="card"><h2>Tidligere ${labelWorkout(k)}</h2><div class="muted">Ingen registreringer ennå.</div></div>`;

      const items = arr.slice().reverse().map((x, ri) => {
        const idx = arr.length - 1 - ri;
        const latest = ri === 0;
        return `<details class="history-item" ${latest ? 'open' : ''}>
          <summary>
            <span>${esc(x.date || '-')}</span>
            <div><b>${shortSummary(k, x)}</b>${latest ? '<div style="margin-top:3px"><span class="history-latest">Siste økt</span></div>' : ''}</div>
          </summary>
          <div class="history-detail">
            ${historyDetail(k, x)}
            <div class="history-actions">
              <button class="btn small secondary" onclick="beginEdit('${k}',${idx})">Rediger</button>
              <button class="btn small danger" onclick="del('${k}',${idx})">Slett</button>
            </div>
          </div>
        </details>`;
      }).join('');

      return `<div class="card"><h2>Tidligere ${labelWorkout(k)}</h2><div class="muted" style="margin-bottom:7px">Siste økt vises åpen. Trykk på eldre økter for å åpne dem.</div>${items}</div>`;
    };

    if (typeof currentProfile !== 'undefined' && currentProfile && typeof renderPages === 'function') renderPages();
  };

  applyHeader();
  installExpandableHistory();
})();
