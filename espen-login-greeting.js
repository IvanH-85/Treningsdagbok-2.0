(() => {
  if (typeof startSession !== 'function') return;

  const style=document.createElement('style');
  style.textContent=`
    .espen-greet{position:fixed;inset:0;background:#10182faa;z-index:125;display:flex;align-items:center;justify-content:center;padding:18px}
    .espen-greet-box{background:#fff;border-radius:22px;padding:24px 20px 18px;max-width:370px;width:100%;text-align:center;box-shadow:0 18px 55px #0005}
    .espen-greet-kicker{font-size:12px;font-weight:900;color:#2f5597;text-transform:uppercase;letter-spacing:.05em}
    .espen-greet-text{font-size:24px;font-weight:900;line-height:1.18;margin:10px 0 12px}
    .espen-greet-sub{font-size:12px;color:#6b7589;margin-bottom:6px}
    .espen-greet-heart{border:0;background:transparent;color:#e64770;font-size:70px;line-height:1;cursor:pointer;padding:5px 12px;animation:espenHeart 1s ease-in-out infinite}
    @keyframes espenHeart{0%,100%{transform:scale(1)}50%{transform:scale(1.14)}}
  `;
  document.head.appendChild(style);

  const lines=[
    'Hei din fjomp. Kanskje du skal prøve å trene litt i dag også? 😏',
    'Der var du ja, din slask. Nå mangler bare selve treningen 💪',
    'God dag, din kuk. Overrask oss alle og gjør en økt da 😂',
    'Se der ja. Espen fant treningsdagboka. Nå gjenstår bare å finne formen 😎',
    'Hei din fjott. Fingrene dine klarte innloggingen, kanskje resten av kroppen klarer en økt også?',
    'Velkommen tilbake, din latsabb. Vi har fortsatt ikke registrert sofa som kondisjon 🛋️',
    'Nå var du smart, Espen. Neste nivå er å faktisk trene 🤓💪',
    'Jøss, du lever! Skal vi markere dagen med litt svette også? 😂',
    'Hei din slask. Treningsdagboka savnet deg mer enn manualene gjorde.',
    'Espen er innlogget. Dette kan enten bli trening eller scrolling. Overrask oss 😈'
  ];

  const pick=()=>lines[Math.floor(Math.random()*lines.length)];
  const show=()=>{
    if(document.getElementById('espenGreeting'))return;
    const el=document.createElement('div');el.id='espenGreeting';el.className='espen-greet';
    el.innerHTML=`<div class="espen-greet-box"><div class="espen-greet-kicker">Dagens varme velkomst</div><div class="espen-greet-text">${pick()}</div><div class="espen-greet-sub">Trykk på hjertet og kom deg videre, din helt.</div><button class="espen-greet-heart" aria-label="Lukk hilsen">♥</button></div>`;
    el.querySelector('button')?.addEventListener('click',()=>el.remove());
    document.body.appendChild(el);
  };

  const baseStartSession=startSession;
  startSession=async function(...args){
    const out=await baseStartSession(...args);
    setTimeout(()=>{if(currentProfile?.name==='Espen'&&currentProfile?.role!=='coach')show()},180);
    return out;
  };
})();