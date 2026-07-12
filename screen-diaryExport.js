/* ==========================================================
   GENERATOR DENIKU
   ========================================================== */
const DiaryExportScreen = (function(){
  function render(container){
    let step = 1;
    let selectedType = null;
    let selectedStageKey = msGetCurrentStage();

    function drawStep1(){
      const meta = msDiaryMeta();
      container.innerHTML = `
        <div class="topbar">
          <div class="back-btn" id="backBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></div>
          <h1>Titulní strana</h1>
        </div>
        <div class="screen-scroll">
          <p style="font-size:15px;font-weight:800;margin:2px 0 12px">Doplňte údaje pro titulní stranu</p>
          <p class="f-label">Název stavby *</p><input class="f-input" id="mNazev" value="${meta.nazev||''}" style="margin-bottom:10px"/>
          <p class="f-label">Místo stavby *</p><input class="f-input" id="mMisto" value="${meta.misto||''}" style="margin-bottom:10px"/>
          <p class="f-label">Stavebník *</p><input class="f-input" id="mStavebnik" value="${meta.stavebnik||''}" style="margin-bottom:10px"/>
          <p class="f-label">Projektant</p><input class="f-input" id="mProjektant" value="${meta.projektant||''}" style="margin-bottom:10px"/>
        </div>
        <div style="padding:12px 16px calc(20px + env(safe-area-inset-bottom));border-top:1px solid var(--line)">
          <button class="btn-primary" id="nextBtn" style="background:linear-gradient(90deg,#25e8ff,#b34cff);color:#04070f;border:0">Pokračovat →</button>
        </div>
      `;
      container.querySelector('#backBtn').addEventListener('click', ()=> Router.go('diary'));
      container.querySelector('#nextBtn').addEventListener('click', ()=>{
        const nazev = container.querySelector('#mNazev').value.trim();
        const misto = container.querySelector('#mMisto').value.trim();
        const stavebnik = container.querySelector('#mStavebnik').value.trim();
        if(!nazev||!misto||!stavebnik){ alert('Vyplň prosím povinné údaje.'); return; }
        msSetDiaryMeta({ nazev, misto, stavebnik, projektant: container.querySelector('#mProjektant').value.trim()||null });
        step = 2; drawStep2();
      });
    }

    function drawStep2(){
      container.innerHTML = `
        <div class="topbar">
          <div class="back-btn" id="backBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></div>
          <h1>Rozsah exportu</h1>
        </div>
        <div class="screen-scroll" id="optWrap">
          <p style="font-size:15px;font-weight:800;margin:2px 0 14px">Co se má vygenerovat?</p>
          ${opt('complete','Kompletní deník','Všechny zápisy ze všech etap')}
          ${opt('bystage','Po etapách','Zápisy rozdělené do kapitol podle etap')}
          ${opt('onestage','Jedna etapa','Vyber konkrétní etapu níže')}
          <div id="stageExtra" style="display:none;margin:-4px 0 12px 8px">
            <div class="dropdown" id="stageDropdown">
              <button class="dd-btn" id="stageDdBtn"><span class="left"><i id="stageDdDot"></i><span id="stageDdLabel">Vyber etapu</span></span></button>
              <div class="dd-panel" id="stageDdPanel"></div>
            </div>
          </div>
        </div>
        <div style="padding:12px 16px calc(20px + env(safe-area-inset-bottom));border-top:1px solid var(--line)">
          <button class="btn-primary" id="genBtn" style="background:linear-gradient(90deg,#25e8ff,#b34cff);color:#04070f;border:0">Vygenerovat PDF</button>
        </div>
      `;
      function opt(key, title, sub){
        return `<div class="opt-card" data-opt="${key}" style="border:1px solid ${key==='complete'?'#ffd35c':'var(--line)'};padding:12px;margin-bottom:9px;cursor:pointer">
          <b style="display:block;font-size:13px">${title}</b><span style="font-size:11px;color:var(--muted)">${sub}</span>
        </div>`;
      }
      container.querySelector('#backBtn').addEventListener('click', ()=>{ step=1; drawStep1(); });
      selectedType = 'complete';
      container.querySelectorAll('.opt-card').forEach(card=>{
        card.addEventListener('click', ()=>{
          container.querySelectorAll('.opt-card').forEach(c=>c.style.borderColor='var(--line)');
          card.style.borderColor = '#ffd35c';
          selectedType = card.dataset.opt;
          container.querySelector('#stageExtra').style.display = selectedType==='onestage' ? 'block' : 'none';
        });
      });
      const stageDdBtn = container.querySelector('#stageDdBtn');
      const stageDdPanel = container.querySelector('#stageDdPanel');
      msSelectedStages().forEach(s=>{
        const it = document.createElement('div');
        it.className = 'dd-item';
        it.innerHTML = `<i style="background:${s.color};display:inline-block;width:7px;height:7px;margin-right:8px"></i>${s.name}`;
        it.addEventListener('click', ()=>{ selectedStageKey=s.key; container.querySelector('#stageDdLabel').textContent=s.name; stageDdPanel.classList.remove('open'); });
        stageDdPanel.appendChild(it);
      });
      stageDdBtn.addEventListener('click', ()=> stageDdPanel.classList.toggle('open'));

      container.querySelector('#genBtn').addEventListener('click', ()=>{
        let msg = 'PDF s kompletním stavebním deníkem bylo vygenerováno.';
        if(selectedType==='bystage') msg = 'PDF rozdělené do kapitol podle etap bylo vygenerováno.';
        if(selectedType==='onestage') msg = `PDF pro etapu "${msStageByKey(selectedStageKey)?.name||''}" bylo vygenerováno.`;
        container.innerHTML = `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center">
            <div style="width:64px;height:64px;border:1px solid #ffd35c;color:#ffd35c;display:grid;place-items:center">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>
            </div>
            <h2 style="margin:0;font-size:16px">Deník je připravený</h2>
            <p style="margin:0;font-size:12px;color:var(--muted);max-width:250px">${msg}</p>
            <button class="btn-primary" id="doneBtn" style="margin-top:6px;background:linear-gradient(90deg,#25e8ff,#b34cff);color:#04070f;border:0;width:auto;padding:12px 24px">Zpět do deníku</button>
          </div>`;
        container.querySelector('#doneBtn').addEventListener('click', ()=> Router.go('diary'));
      });
    }

    drawStep1();
    return { showNav:false };
  }
  return { render };
})();
Router.register('diary-export', DiaryExportScreen);
