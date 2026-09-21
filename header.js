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
      await loadScript('coach-preview.js?v=20260903');
      await loadScript('profile-enhancements.js?v=20260903');
      await loadScript('pb-workout.js?v=20260903b');
      await loadScript('coach-challenge-tab.js?v=20260903b');
      await loadScript('coach-activity-alert.js?v=20260905');
      await loadScript('fun-updates.js?v=20260905');
      await loadScript('brag-balance.js?v=20260908');
      await loadScript('training-calendar.js?v=20260907d');
      await loadScript('espen-login-greeting.js?v=20260907');
      await loadScript('workout-names.js?v=20260907b');
      await loadScript('next-workout.js?v=20260907');
      await loadScript('espen-preview.js?v=20260907b');
      await loadScript('progression-best.js?v=20260908b');
      await loadScript('challenge-status-history.js?v=20260914');
      await loadScript('gaintrain-fun.js?v=20260921');
      await loadScript('straffekassa.js?v=20260921');
      await loadScript('action-theme-v2.js?v=20260921-v2a');
    }catch(e){
      console.error('Kunne ikke laste GainTrain-moduler',e);
    }
  })();
})();