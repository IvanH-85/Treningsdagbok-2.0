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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyHeader);
  } else {
    applyHeader();
  }
})();
