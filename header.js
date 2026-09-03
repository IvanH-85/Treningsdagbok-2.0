(() => {
  const loadScript = src => new Promise((resolve,reject) => {
    const s=document.createElement('script');
    s.src=src;
    s.async=false;
    s.onload=resolve;
    s.onerror=reject;
    document.head.appendChild(s);
  });

  (async()=>{
    try{
      await loadScript('ui-core.js?v=20260903');
      await loadScript('challenge.js?v=20260903');
    }catch(e){
      console.error('Kunne ikke laste GainTrain-moduler',e);
    }
  })();
})();
