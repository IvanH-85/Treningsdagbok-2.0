(() => {
  // Sirkeløkt is a fixed-standard, timed workout. Keep the previous stored sessions untouched.
  if(typeof w3form!=='function'||typeof saveW3!=='function')return;
  const STANDARD=Object.freeze({
    'Sumosquat':{w:'KV',rep:'15'},
    'Sandbag to shoulder':{w:'10',rep:'20'},
    'Armheving':{w:'KV',rep:'15'},
    'Mountainclimbers':{w:'KV',rep:'20'},
    'Ground to air':{w:'8',rep:'12'},
    'Burpees':{w:'KV',rep:'8'}
  });
  const fixedLine='Sandbag 10 kg · Armhevinger 15 stk · Ground to air 8 kg';
  const note='Fast oppsett i alle fire runder: 15 sumosquat, 20 sandbag to shoulder (10 per side) med 10 kg, 15 armhevinger, 20 mountainclimbers (10 per side), 12 ground to air per arm med 8 kg og 8 burpees.';
  const standardMatch=x=>[0,1,2,3].every(i=>{
    const ex=x?.rounds?.[i]?.ex;
    if(!ex)return false;
    return Object.entries(STANDARD).every(([name,target])=>{
      const z=ex[name];if(!z)return false;
      const w=String(z.w||'').replace(',','.');
      return (target.w==='KV'?w.toUpperCase()==='KV':Number(w)===Number(target.w))&&Number(z.rep)===Number(target.rep);
    });
  });
  window.gaintrainCircleStandardMatch=standardMatch;
  const css=document.createElement('style');
  css.textContent=`
    .circle-standard{padding:12px;border:1px solid var(--line);border-radius:10px;margin:10px 0;font-size:12px;line-height:1.5;background:#f5f7fb}
    .circle-standard strong{display:block;font-size:13px;margin-bottom:4px}
    .circle-fixed-line{font-size:12px;line-height:1.5;margin:9px 0;padding:8px 10px;background:#f4f6fa;border-radius:8px}
    body.gt-action .circle-standard,body.gt-action .circle-fixed-line{background:#303d4e;color:#edf4ff;border-color:#64758c}
    body.gt-action .circle-standard strong{color:#ffbf77}
  `;document.head.appendChild(css);
  const e=window.esc||((s)=>String(s??''));
  w3form=function(){
    const ed=currentEdit('w3');
    const rounds=[1,2,3,4].map(r=>`<div class="round"><h3>Runde ${r}</h3><label for="circleTime${r}">Tid på runden</label><input id="circleTime${r}" data-rt="${r}" inputmode="text" value="${e(ed?.rounds?.[r-1]?.time??'')}" placeholder="f.eks. 03:45" oninput="updateW3Total()"></div>`).join('');
    return `${editBanner('w3')}<div class="card ${ed?'editing':''}"><h2>${ed?'Rediger':'Ny'} Sirkeløkt – ${e(currentProfile.name)}</h2>
      <div class="muted">Fire like runder. Fokus er tiden. To minutter pause mellom rundene.</div>
      <label>Dato</label><input id="w3date" type="date" value="${ed?.date||today()}">
      ${warmupFields('w3',ed)}
      <div class="circle-standard"><strong>💪 Fast oppsett – alle runder</strong>${note}<div style="margin-top:6px"><b>${fixedLine}</b></div></div>
      ${rounds}
      <label>Total tid inkl. pauser</label><input id="w3tot" class="kv" value="${e(ed?.total??'')}" placeholder="Beregnes automatisk" readonly>
      <div class="muted" style="margin-top:4px">Runde 1–4 + tre pauser à 2 minutter.</div>
      <button class="btn" style="margin-top:10px" onclick="saveW3()">${ed?'Oppdater økt':'Lagre økt'}</button></div>`;
  };
  saveW3=async function(){
    updateW3Total();
    const ed=currentEdit('w3');
    const times=[1,2,3,4].map(r=>document.querySelector('[data-rt="'+r+'"]')?.value.trim()||'');
    if(times.some(t=>timeToSeconds(t)===null||timeToSeconds(t)<=0)){
      alert('Fyll inn en gyldig rundetid for alle fire runder, for eksempel 03:45.');return;
    }
    const rounds=times.map(time=>({time,ex:Object.fromEntries(Object.entries(STANDARD).map(([name,z])=>[name,{...z}]))}));
    const data={_id:ed?ed._id||workoutRef('w3',ed):uid(),date:document.getElementById('w3date').value,
      warmupType:document.getElementById('w3warmupType').value,
      warmupMinutes:document.getElementById('w3warmupMinutes').value,
      total:document.getElementById('w3tot').value,rounds};
    if(!data.date){alert('Velg dato.');return;}
    if(ed){d.w3[editTarget.i]=data;editTarget=null;await save('Økten er oppdatert');}
    else{d.w3.push(data);await save();showCongrats();}
    showPage('w3');
  };
  const originalOwnHistory=ownHistory;
  const circleDetails=x=>{
    const rs=x.rounds||[];
    const times=[0,1,2,3].map(i=>rs[i]?.time||'-').join(' / ');
    return warmupSummary(x)+`<div class="lastrow"><b>Rundetider:</b> ${times}</div><div class="lastrow"><b>Total tid inkl. pauser:</b> ${e(x.total||'-')}</div><div class="circle-fixed-line"><b>Fast oppsett:</b> ${fixedLine}</div>`+
      (!standardMatch(x)?'<div class="muted">Eldre økt: registrert med annet oppsett. Tidene inngår ikke i ny sammenlignbar PB.</div>':'');
  };
  const originalWorkoutCard=workoutCard;
  workoutCard=function(name,p,k,x,index){
    const html=originalWorkoutCard(name,p,k,x,index);
    if(k!=='w3')return html;
    // The original is a full card, with comments and actions; replace only the exercise detail area.
    const start=html.indexOf('<div style="margin-top:8px">');
    const end=start<0?-1:html.indexOf('<div class="workactions">',start);
    if(start<0)return html;
    // Only use this strategy if the expected detail block can be located reliably.
    const marker='<div class="commentbox">';
    const commentAt=html.indexOf(marker,start);
    const footer=end>=0&&end<commentAt?end:commentAt;
    if(footer<0)return html;
    return html.slice(0,start)+'<div style="margin-top:8px">'+circleDetails(x)+'</div>'+html.slice(footer);
  };
  // The latest workout and older own-history summaries are still rendered by the existing app.
  if(currentProfile){renderPages();renderPerson('Ivan');renderPerson('Espen');}
})();