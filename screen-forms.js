/* ==========================================================
   FORMULARE (cile rychleho pridani + editace)
   ========================================================== */

/* ---------- Vydaj / Vklad ---------- */
const ExpenseAddScreen = (function(){
  function render(container, params){
    const editingTx = params.edit ? msTransactionById(params.edit) : null;
    let txType = editingTx ? editingTx.type : 'expense';
    let category = (editingTx && editingTx.category) || 'Materiál';
    let stageKey = (editingTx && editingTx.stage) || msGetCurrentStage();
    let dateVal = editingTx ? editingTx.date : (new Date().toISOString().slice(0,10));

    container.innerHTML = `
      <div class="topbar">
        <div class="back-btn" id="backBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></div>
        <h1 id="formTitle">Nový výdaj</h1>
      </div>
      <div class="screen-scroll">
        <div id="typeToggle" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">
          <button data-t="expense" style="height:38px;border:1px solid #ff7a86;color:#ff9aa3;background:rgba(255,122,134,.08);font-weight:800;cursor:pointer">Výdaj</button>
          <button data-t="income" style="height:38px;border:1px solid var(--line);color:var(--muted);background:transparent;font-weight:800;cursor:pointer">Vklad</button>
        </div>
        <p class="f-label">Částka</p>
        <div style="display:flex;align-items:baseline;gap:8px;border:1px solid #ff7a86;padding:9px 12px;margin-bottom:12px" id="amountBox">
          <input id="fAmount" value="${editingTx?editingTx.amount:''}" inputmode="numeric" placeholder="0" style="border:0;background:transparent;color:#ff9aa3;font-size:22px;font-weight:800;width:100%;font:inherit;outline:none"/><span style="color:#ff9aa3;font-weight:800">Kč</span>
        </div>
        <p class="f-label">Popis</p>
        <input class="f-input" id="fTitle" value="${editingTx?editingTx.title:''}" placeholder="Např. Beton C20/25" style="margin-bottom:12px"/>
        <div id="stageBlock">
          <p class="f-label">Etapa</p>
          <div class="dropdown" id="stageDropdown" style="margin-bottom:12px">
            <button class="dd-btn" id="stageDdBtn"><span class="left"><i id="stageDdDot"></i><span id="stageDdLabel">—</span></span></button>
            <div class="dd-panel" id="stageDdPanel"></div>
          </div>
        </div>
        <div id="categoryBlock">
          <p class="f-label">Kategorie</p>
          <div id="categorySeg" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px">
            ${['Materiál','Práce','Doprava','Ostatní'].map(c=>`<button data-cat="${c}" style="height:40px;border:1px solid ${c===category?'#ff7a86':'var(--line)'};background:transparent;color:#dfe4f5;font-size:9.5px;font-weight:700;cursor:pointer">${c}</button>`).join('')}
          </div>
        </div>
        <p class="f-label">Datum</p>
        <div style="display:flex;gap:8px;margin-bottom:0">
          <input class="f-input" id="fDate" value="" style="flex:1"/>
          <div class="icon-btn" id="calToggleBtn" style="flex:0 0 auto"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M8 3v4M16 3v4M3 10h18"/></svg></div>
        </div>
        <div id="miniCal" style="max-height:0;overflow:hidden;transition:max-height .2s ease">
          <div style="border:1px solid var(--line);background:#0b0f1c;border-radius:var(--radius);padding:10px;margin-top:8px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <b id="mcLabel" style="font-size:12px"></b>
              <div style="display:flex;gap:6px">
                <button id="mcPrev" style="width:24px;height:24px;border:1px solid var(--line);background:transparent;color:#fff;cursor:pointer">‹</button>
                <button id="mcNext" style="width:24px;height:24px;border:1px solid var(--line);background:transparent;color:#fff;cursor:pointer">›</button>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px">
              ${['Po','Út','St','Čt','Pá','So','Ne'].map(d=>`<span style="text-align:center;font-size:8.5px;color:var(--muted);font-weight:800">${d}</span>`).join('')}
            </div>
            <div id="mcGrid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px"></div>
          </div>
        </div>
      </div>
      <div style="padding:12px 16px calc(20px + env(safe-area-inset-bottom));border-top:1px solid var(--line)">
        <button class="btn-primary" id="saveBtn" style="border-color:#ff7a86;color:#fff">${editingTx?'Uložit změny':'Uložit výdaj'}</button>
        ${editingTx?'<button class="btn-ghost" id="deleteBtn" style="margin-top:8px;color:#ff7a86">Smazat</button>':''}
      </div>
    `;
    container.querySelector('#backBtn').addEventListener('click', ()=> Router.go(params.back||'dashboard'));

    function applyType(){
      const isExpense = txType==='expense';
      container.querySelector('#stageBlock').style.display = isExpense?'block':'none';
      container.querySelector('#categoryBlock').style.display = isExpense?'block':'none';
      container.querySelector('#formTitle').textContent = editingTx ? (isExpense?'Upravit výdaj':'Upravit vklad') : (isExpense?'Nový výdaj':'Nový vklad');
      container.querySelector('#saveBtn').textContent = editingTx ? 'Uložit změny' : (isExpense?'Uložit výdaj':'Uložit vklad');
      const color = isExpense ? '#ff7a86' : '#4dffab';
      container.querySelector('#amountBox').style.borderColor = color;
      container.querySelectorAll('#amountBox input,#amountBox span').forEach(el=>el.style.color = isExpense?'#ff9aa3':color);
      container.querySelector('#saveBtn').style.borderColor = color;
      container.querySelectorAll('#typeToggle button').forEach(b=>{
        const active = b.dataset.t===txType;
        b.style.borderColor = active ? color : 'var(--line)';
        b.style.color = active ? (isExpense?'#ff9aa3':color) : 'var(--muted)';
        b.style.background = active ? (isExpense?'rgba(255,122,134,.08)':'rgba(77,255,171,.08)') : 'transparent';
      });
    }
    container.querySelector('#typeToggle').addEventListener('click', (e)=>{
      const btn = e.target.closest('button'); if(!btn) return;
      txType = btn.dataset.t; applyType();
    });
    applyType();

    container.querySelector('#categorySeg').addEventListener('click', (e)=>{
      const btn = e.target.closest('button'); if(!btn) return;
      category = btn.dataset.cat;
      container.querySelectorAll('#categorySeg button').forEach(b=>b.style.borderColor = b.dataset.cat===category ? '#ff7a86' : 'var(--line)');
    });


    // --- datum: primy prepis nebo mini kalendar (misto jen type=date) ---
    const MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];
    function formatDateCz(d){ return `${d.getDate()}. ${d.getMonth()+1}. ${d.getFullYear()}`; }
    let selectedDate = editingTx ? new Date(editingTx.date+'T00:00:00') : new Date();
    container.querySelector('#fDate').value = formatDateCz(selectedDate);
    const miniCal = container.querySelector('#miniCal');
    let mcYear = selectedDate.getFullYear(), mcMonth = selectedDate.getMonth();
    function renderMiniCal(){
      container.querySelector('#mcLabel').textContent = MONTHS[mcMonth] + ' ' + mcYear;
      const grid = container.querySelector('#mcGrid');
      grid.innerHTML = '';
      const firstDay = new Date(mcYear, mcMonth, 1);
      let startWeekday = firstDay.getDay(); startWeekday = startWeekday===0?6:startWeekday-1;
      const daysInMonth = new Date(mcYear, mcMonth+1, 0).getDate();
      for(let i=0;i<startWeekday;i++) grid.appendChild(document.createElement('div'));
      for(let d=1; d<=daysInMonth; d++){
        const isSel = selectedDate.getFullYear()===mcYear && selectedDate.getMonth()===mcMonth && selectedDate.getDate()===d;
        const cell = document.createElement('div');
        cell.style.cssText = `height:26px;display:flex;align-items:center;justify-content:center;font-size:10px;cursor:pointer;border-radius:3px;background:${isSel?'#b34cff':'transparent'};color:${isSel?'#fff':'#c7cee6'}`;
        cell.textContent = d;
        cell.addEventListener('click', ()=>{
          selectedDate = new Date(mcYear, mcMonth, d);
          container.querySelector('#fDate').value = formatDateCz(selectedDate);
          renderMiniCal();
          miniCal.style.maxHeight = '0';
        });
        grid.appendChild(cell);
      }
    }
    container.querySelector('#mcPrev').addEventListener('click', ()=>{ mcMonth--; if(mcMonth<0){mcMonth=11;mcYear--;} renderMiniCal(); });
    container.querySelector('#mcNext').addEventListener('click', ()=>{ mcMonth++; if(mcMonth>11){mcMonth=0;mcYear++;} renderMiniCal(); });
    container.querySelector('#calToggleBtn').addEventListener('click', ()=>{
      const isOpen = miniCal.style.maxHeight !== '0px' && miniCal.style.maxHeight !== '';
      miniCal.style.maxHeight = isOpen ? '0' : '280px';
      if(!isOpen) renderMiniCal();
    });
    container.querySelector('#fDate').addEventListener('change', (e)=>{
      const m = e.target.value.trim().match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/);
      if(m){ selectedDate = new Date(Number(m[3]), Number(m[2])-1, Number(m[1])); mcYear=selectedDate.getFullYear(); mcMonth=selectedDate.getMonth(); renderMiniCal(); }
    });

    const stageDdBtn = container.querySelector('#stageDdBtn');
    const stageDdPanel = container.querySelector('#stageDdPanel');
    const selectedStages = msSelectedStages();
    selectedStages.forEach(s=>{
      const it = document.createElement('div');
      it.className = 'dd-item';
      it.innerHTML = `<i style="background:${s.color};display:inline-block;width:7px;height:7px;margin-right:8px"></i>${s.name}`;
      it.addEventListener('click', ()=>{
        stageKey = s.key;
        container.querySelector('#stageDdLabel').textContent = s.name;
        container.querySelector('#stageDdDot').style.background = s.color;
        stageDdPanel.classList.remove('open');
      });
      stageDdPanel.appendChild(it);
    });
    stageDdBtn.addEventListener('click', ()=> stageDdPanel.classList.toggle('open'));
    const initS = msStageByKey(stageKey) || selectedStages[0];
    if(initS){ stageKey = initS.key; container.querySelector('#stageDdLabel').textContent = initS.name; container.querySelector('#stageDdDot').style.background = initS.color; }

    container.querySelector('#saveBtn').addEventListener('click', ()=>{
      const amount = Number((container.querySelector('#fAmount').value||'').replace(/\s/g,'')) || 0;
      if(amount<=0){ alert('Zadej částku.'); return; }
      const title = container.querySelector('#fTitle').value.trim() || (txType==='expense'?'Bez popisu':'Vklad na účet');
      const date = selectedDate.getFullYear()+'-'+String(selectedDate.getMonth()+1).padStart(2,'0')+'-'+String(selectedDate.getDate()).padStart(2,'0');
      const tx = { type:txType, title, amount, date };
      if(txType==='expense'){ tx.stage=stageKey; tx.category=category; } else { tx.stage=null; tx.category=null; }
      if(editingTx){ msUpdateTransaction(params.edit, tx); } else { msAddTransaction(tx); }
      Router.go(params.back || 'dashboard');
    });
    if(editingTx){
      container.querySelector('#deleteBtn').addEventListener('click', async ()=>{
        if(!await Layout.confirmDialog('Opravdu smazat tuhle transakci? Nedá se to vrátit zpět.', 'Smazat')) return;
        msDeleteTransaction(params.edit);
        Router.go(params.back || 'dashboard');
      });
    }
    return { activeTab:'dashboard' };
  }
  return { render };
})();
Router.register('expense-add', ExpenseAddScreen);


/* ---------- Novy zapis do deniku ---------- */
const DiaryAddScreen = (function(){
  function render(container){
    let photos = [];
    let important = false;
    let worker = '';
    let stageKey = msGetCurrentStage();
    let selectedDate = new Date();
    function formatDateCz(d){ return `${d.getDate()}. ${d.getMonth()+1}. ${d.getFullYear()}`; }
    const MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];

    container.innerHTML = `
      <div class="topbar">
        <div class="back-btn" id="backBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></div>
        <h1>Nový záznam</h1>
      </div>
      <div class="screen-scroll">
        <div id="impRow" style="display:flex;align-items:center;justify-content:space-between;border:1px solid var(--line);padding:11px 12px;margin-bottom:16px">
          <div><b style="display:flex;align-items:center;gap:6px;font-size:12.5px"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3l2.5 5.5L20 9l-4 4 1 6-5-3-5 3 1-6-4-4 5.5-.5z"/></svg>Důležitý zápis</b><span style="font-size:10px;color:var(--muted)">Bude vždy nahoře při zobrazení této etapy</span></div>
          <div id="impSwitch" style="width:38px;height:22px;border-radius:11px;border:1px solid var(--line);position:relative;cursor:pointer;flex:0 0 auto"><i style="position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--muted)"></i></div>
        </div>
        <p class="section-label" style="margin-top:0">Povinné</p>

        <p class="f-label">📅 Datum</p>
        <div style="display:flex;gap:8px;margin-bottom:12px">
          <input class="f-input" id="fDate" value="" style="flex:1"/>
          <div class="icon-btn" id="calToggleBtn" style="flex:0 0 auto"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M8 3v4M16 3v4M3 10h18"/></svg></div>
        </div>
        <div id="miniCal" style="max-height:0;overflow:hidden;transition:max-height .2s ease;margin-bottom:0">
          <div style="border:1px solid var(--line);background:#0b0f1c;border-radius:var(--radius);padding:10px;margin-bottom:12px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <b id="mcLabel" style="font-size:12px"></b>
              <div style="display:flex;gap:6px">
                <button id="mcPrev" style="width:24px;height:24px;border:1px solid var(--line);background:transparent;color:#fff;cursor:pointer">‹</button>
                <button id="mcNext" style="width:24px;height:24px;border:1px solid var(--line);background:transparent;color:#fff;cursor:pointer">›</button>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px">
              ${['Po','Út','St','Čt','Pá','So','Ne'].map(d=>`<span style="text-align:center;font-size:8.5px;color:var(--muted);font-weight:800">${d}</span>`).join('')}
            </div>
            <div id="mcGrid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px"></div>
          </div>
        </div>

        <p class="f-label">🔨 Etapa</p>
        <div class="dropdown" id="stageDropdown" style="margin-bottom:12px">
          <button class="dd-btn" id="stageDdBtn"><span class="left"><i id="stageDdDot"></i><span id="stageDdLabel">—</span></span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg></button>
          <div class="dd-panel" id="stageDdPanel"></div>
        </div>

        <p class="f-label">📝 Co se dnes udělalo? *</p>
        <textarea class="f-textarea" id="fText" placeholder="Např. Založena první řada Ytongu / Zabetonován věnec / Osazena okna…" style="margin-bottom:12px;min-height:70px"></textarea>

        <p class="f-label">📷 Foto <span style="color:var(--muted);font-weight:600;text-transform:none;letter-spacing:0">(nepovinné, ale doporučené)</span></p>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:16px" id="photoGrid"></div>
        <input type="file" accept="image/*" multiple id="photoInput" style="display:none"/>

        <div id="detailsToggle" style="display:flex;align-items:center;justify-content:space-between;border:1px solid var(--line);padding:11px 12px;cursor:pointer">
          <b style="font-size:12.5px;color:var(--muted)">+ Přidat podrobnosti</b>
          <svg id="detailsChevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="color:var(--muted);transition:transform .15s"><path d="M6 9l6 6 6-6"/></svg>
        </div>
        <div id="detailsFields" style="max-height:0;overflow:hidden;transition:max-height .25s ease">
          <div style="padding-top:14px">
            <p class="f-label">👷 Kdo pracoval</p>
            <input class="f-input" id="fWorker" placeholder="Např. Firma Novák s.r.o. / Pepa Svoboda" style="margin-bottom:14px"/>
            <p class="f-label">📦 Materiál</p>
            <input class="f-input" id="fMaterial" placeholder="Např. 12 ks překladů" style="margin-bottom:14px"/>
            <p class="f-label">⚠️ Problém / poznámka</p>
            <textarea class="f-textarea" id="fIssue" placeholder="Cokoliv, co stojí za zaznamenání navíc…" style="margin-bottom:0;min-height:60px"></textarea>
          </div>
        </div>
      </div>
      <div style="padding:12px 16px calc(20px + env(safe-area-inset-bottom));border-top:1px solid var(--line)">
        <button class="btn-primary" id="saveBtn" style="border-color:#ffd35c">Uložit záznam</button>
      </div>
    `;
    container.querySelector('#backBtn').addEventListener('click', ()=> Router.back());

    // --- datum ---
    container.querySelector('#fDate').value = formatDateCz(selectedDate);
    const miniCal = container.querySelector('#miniCal');
    let mcYear = selectedDate.getFullYear(), mcMonth = selectedDate.getMonth();
    function renderMiniCal(){
      container.querySelector('#mcLabel').textContent = MONTHS[mcMonth] + ' ' + mcYear;
      const grid = container.querySelector('#mcGrid');
      grid.innerHTML = '';
      const firstDay = new Date(mcYear, mcMonth, 1);
      let startWeekday = firstDay.getDay(); startWeekday = startWeekday===0?6:startWeekday-1;
      const daysInMonth = new Date(mcYear, mcMonth+1, 0).getDate();
      for(let i=0;i<startWeekday;i++) grid.appendChild(document.createElement('div'));
      for(let d=1; d<=daysInMonth; d++){
        const isSel = selectedDate.getFullYear()===mcYear && selectedDate.getMonth()===mcMonth && selectedDate.getDate()===d;
        const cell = document.createElement('div');
        cell.style.cssText = `height:26px;display:flex;align-items:center;justify-content:center;font-size:10px;cursor:pointer;border-radius:3px;background:${isSel?'#ffd35c':'transparent'};color:${isSel?'#04070f':'#c7cee6'}`;
        cell.textContent = d;
        cell.addEventListener('click', ()=>{
          selectedDate = new Date(mcYear, mcMonth, d);
          container.querySelector('#fDate').value = formatDateCz(selectedDate);
          renderMiniCal();
          miniCal.style.maxHeight = '0';
        });
        grid.appendChild(cell);
      }
    }
    container.querySelector('#mcPrev').addEventListener('click', ()=>{ mcMonth--; if(mcMonth<0){mcMonth=11;mcYear--;} renderMiniCal(); });
    container.querySelector('#mcNext').addEventListener('click', ()=>{ mcMonth++; if(mcMonth>11){mcMonth=0;mcYear++;} renderMiniCal(); });
    container.querySelector('#calToggleBtn').addEventListener('click', ()=>{
      const isOpen = miniCal.style.maxHeight !== '0px' && miniCal.style.maxHeight !== '';
      miniCal.style.maxHeight = isOpen ? '0' : '280px';
      if(!isOpen) renderMiniCal();
    });

    // --- etapa: predvyplnena aktualni, jde zmenit ---
    const stageDdBtn = container.querySelector('#stageDdBtn');
    const stageDdPanel = container.querySelector('#stageDdPanel');
    msSelectedStages().forEach(s=>{
      const it = document.createElement('div');
      it.className = 'dd-item';
      it.innerHTML = `<i style="background:${s.color};display:inline-block;width:7px;height:7px;margin-right:8px"></i>${s.name}`;
      it.addEventListener('click', ()=>{
        stageKey = s.key;
        container.querySelector('#stageDdLabel').textContent = s.name;
        container.querySelector('#stageDdDot').style.background = s.color;
        stageDdPanel.classList.remove('open');
      });
      stageDdPanel.appendChild(it);
    });
    stageDdBtn.addEventListener('click', ()=> stageDdPanel.classList.toggle('open'));
    const initS = msStageByKey(stageKey);
    if(initS){ container.querySelector('#stageDdLabel').textContent = initS.name; container.querySelector('#stageDdDot').style.background = initS.color; }
    else { container.querySelector('#stageDdLabel').textContent = 'Vyber etapu'; }

    // --- rozbalovaci podrobnosti ---
    let detailsOpen = false;
    const detailsFields = container.querySelector('#detailsFields');
    container.querySelector('#detailsToggle').addEventListener('click', ()=>{
      detailsOpen = !detailsOpen;
      detailsFields.style.maxHeight = detailsOpen ? '400px' : '0';
      container.querySelector('#detailsChevron').style.transform = detailsOpen ? 'rotate(180deg)' : 'rotate(0)';
    });

    const impSwitch = container.querySelector('#impSwitch');
    impSwitch.addEventListener('click', ()=>{
      important = !important;
      impSwitch.style.borderColor = important ? '#ffd35c' : 'var(--line)';
      impSwitch.querySelector('i').style.left = important ? '18px' : '2px';
      impSwitch.querySelector('i').style.background = important ? '#ffd35c' : 'var(--muted)';
    });

    // --- foto ---
    function resizeImage(file, maxDim){
      return new Promise(resolve=>{
        const reader = new FileReader();
        reader.onload = ()=>{
          const img = new Image();
          img.onload = ()=>{
            let {width,height} = img;
            if(width>height && width>maxDim){ height=height*maxDim/width; width=maxDim; }
            else if(height>maxDim){ width=width*maxDim/height; height=maxDim; }
            const canvas = document.createElement('canvas');
            canvas.width=width; canvas.height=height;
            canvas.getContext('2d').drawImage(img,0,0,width,height);
            resolve(canvas.toDataURL('image/jpeg',0.7));
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      });
    }
    function renderPhotoGrid(){
      const grid = container.querySelector('#photoGrid');
      grid.innerHTML = photos.map((p,i)=>`<div style="aspect-ratio:1;border:1px solid #ffd35c;border-radius:3px;background-image:url(${p});background-size:cover;position:relative">
        <span data-i="${i}" class="rmp" style="position:absolute;top:-6px;right:-6px;width:16px;height:16px;background:#0a0d16;border:1px solid var(--line);border-radius:50%;display:grid;place-items:center;font-size:9px;cursor:pointer">✕</span>
      </div>`).join('') + `<div id="addPhotoBtn" style="aspect-ratio:1;border:1px dashed var(--line);border-radius:3px;display:grid;place-items:center;cursor:pointer;color:var(--muted)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></div>`;
      grid.querySelectorAll('.rmp').forEach(el=> el.addEventListener('click', ()=>{ photos.splice(Number(el.dataset.i),1); renderPhotoGrid(); }));
      grid.querySelector('#addPhotoBtn').addEventListener('click', ()=> container.querySelector('#photoInput').click());
    }
    container.querySelector('#photoInput').addEventListener('change', async (e)=>{
      for(const file of e.target.files){ if(!file.type.startsWith('image/')) continue; photos.push(await resizeImage(file,480)); }
      renderPhotoGrid();
    });
    renderPhotoGrid();

    container.querySelector('#saveBtn').addEventListener('click', ()=>{
      const text = container.querySelector('#fText').value.trim();
      if(!text){ alert('Napiš prosím, co se dnes udělalo.'); return; }
      if(!stageKey){ alert('Vyber prosím etapu.'); return; }
      const material = container.querySelector('#fMaterial').value.trim();
      const issue = container.querySelector('#fIssue').value.trim();
      const date = selectedDate.getFullYear()+'-'+String(selectedDate.getMonth()+1).padStart(2,'0')+'-'+String(selectedDate.getDate()).padStart(2,'0');
      msAddDiaryEntry({ stage: stageKey, date, text, workerType, material: material||null, issue: issue||null, important, photos });
      Router.go('diary');
    });
    return { activeTab:'diary' };
  }
  return { render };
})();
Router.register('diary-add', DiaryAddScreen);


/* ---------- Nova udalost ---------- */
const EventAddScreen = (function(){
  function render(container){
    container.innerHTML = `
      <div class="topbar">
        <div class="back-btn" id="backBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></div>
        <h1>Nová událost</h1>
      </div>
      <div class="screen-scroll">
        <p class="f-label">Název *</p>
        <input class="f-input" id="fTitle" placeholder="Např. Návštěva statika" style="margin-bottom:12px"/>
        <p class="f-label">Datum *</p>
        <input class="f-input" id="fDate" type="date" value="${new Date().toISOString().slice(0,10)}" style="margin-bottom:12px"/>
        <div id="timeBlock">
          <p class="f-label">Čas</p>
          <input class="f-input" id="fTime" type="time" value="09:00" style="margin-bottom:12px"/>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;border:1px solid var(--line);padding:11px 12px">
          <b style="font-size:12.5px">Celodenní událost</b>
          <div id="allDaySwitch" style="width:38px;height:22px;border-radius:11px;border:1px solid var(--line);position:relative;cursor:pointer"><i style="position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--muted)"></i></div>
        </div>
      </div>
      <div style="padding:12px 16px calc(20px + env(safe-area-inset-bottom));border-top:1px solid var(--line)">
        <button class="btn-primary" id="saveBtn" style="border-color:#25b7ff">Uložit událost</button>
      </div>
    `;
    container.querySelector('#backBtn').addEventListener('click', ()=> Router.go('dashboard'));
    let allDay = false;
    const sw = container.querySelector('#allDaySwitch');
    sw.addEventListener('click', ()=>{
      allDay = !allDay;
      sw.style.borderColor = allDay ? '#25b7ff' : 'var(--line)';
      sw.querySelector('i').style.left = allDay ? '18px' : '2px';
      sw.querySelector('i').style.background = allDay ? '#25b7ff' : 'var(--muted)';
      container.querySelector('#timeBlock').style.display = allDay ? 'none' : 'block';
    });
    container.querySelector('#saveBtn').addEventListener('click', ()=>{
      const title = container.querySelector('#fTitle').value.trim();
      const date = container.querySelector('#fDate').value;
      if(!title || !date){ alert('Vyplň název a datum.'); return; }
      const time = allDay ? null : container.querySelector('#fTime').value;
      msAddEvent({ title, date, time });
      Router.go('dashboard');
    });
    return { activeTab:'dashboard' };
  }
  return { render };
})();
Router.register('event-add', EventAddScreen);


/* ---------- Nova fotka ---------- */
const PhotoAddScreen = (function(){
  function render(container){
    let photos = [];
    let stageKey = msGetCurrentStage();

    container.innerHTML = `
      <div class="topbar">
        <div class="back-btn" id="backBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></div>
        <h1>Přidat fotku</h1>
      </div>
      <div class="screen-scroll">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
          <div id="btnCamera" style="border:1px dashed var(--line);padding:16px 8px;text-align:center;cursor:pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="14" rx="1"/><circle cx="12" cy="13" r="3.5"/></svg>
            <b style="display:block;font-size:11.5px;margin-top:6px">Vyfotit</b>
          </div>
          <div id="btnGallery" style="border:1px dashed var(--line);padding:16px 8px;text-align:center;cursor:pointer">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="1"/><circle cx="9" cy="11" r="2"/></svg>
            <b style="display:block;font-size:11.5px;margin-top:6px">Z galerie</b>
          </div>
        </div>
        <input type="file" accept="image/*" capture="environment" id="cameraInput" style="display:none"/>
        <input type="file" accept="image/*" multiple id="galleryInput" style="display:none"/>
        <p class="f-label">Vybráno (<span id="selCount">0</span>)</p>
        <div id="thumbGrid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:12px"></div>
        <p class="f-label">Etapa</p>
        <div class="dropdown" id="stageDropdown" style="margin-bottom:12px">
          <button class="dd-btn" id="stageDdBtn"><span class="left"><i id="stageDdDot"></i><span id="stageDdLabel">—</span></span></button>
          <div class="dd-panel" id="stageDdPanel"></div>
        </div>
        <p class="f-label">Popisek (nepovinné)</p>
        <input class="f-input" id="fCaption" placeholder="Např. Betonáž základové desky" style="margin-bottom:12px"/>
      </div>
      <div style="padding:12px 16px calc(20px + env(safe-area-inset-bottom));border-top:1px solid var(--line)">
        <button class="btn-primary" id="saveBtn" style="border-color:#b34cff">Nahrát fotky</button>
      </div>
    `;
    container.querySelector('#backBtn').addEventListener('click', ()=> Router.go('dashboard'));

    function resizeImage(file, maxDim){
      return new Promise(resolve=>{
        const reader = new FileReader();
        reader.onload = ()=>{
          const img = new Image();
          img.onload = ()=>{
            let {width,height} = img;
            if(width>height && width>maxDim){ height=height*maxDim/width; width=maxDim; }
            else if(height>maxDim){ width=width*maxDim/height; height=maxDim; }
            const canvas = document.createElement('canvas');
            canvas.width=width; canvas.height=height;
            canvas.getContext('2d').drawImage(img,0,0,width,height);
            resolve(canvas.toDataURL('image/jpeg',0.7));
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      });
    }
    function renderThumbs(){
      const grid = container.querySelector('#thumbGrid');
      grid.innerHTML = photos.map((dataUrl,i)=>`<div style="aspect-ratio:1;border:1px solid #b34cff;background-image:url(${dataUrl});background-size:cover;position:relative">
        <span data-i="${i}" class="rm" style="position:absolute;top:-6px;right:-6px;width:18px;height:18px;background:#0a0d16;border:1px solid var(--line);border-radius:50%;display:grid;place-items:center;font-size:10px;cursor:pointer">✕</span>
      </div>`).join('');
      grid.querySelectorAll('.rm').forEach(el=> el.addEventListener('click', ()=>{ photos.splice(Number(el.dataset.i),1); renderThumbs(); }));
      container.querySelector('#selCount').textContent = photos.length;
    }
    async function handleFiles(fileList){
      for(const file of fileList){ if(!file.type.startsWith('image/')) continue; photos.push(await resizeImage(file,480)); }
      renderThumbs();
    }
    container.querySelector('#cameraInput').addEventListener('change', e=>handleFiles(e.target.files));
    container.querySelector('#galleryInput').addEventListener('change', e=>handleFiles(e.target.files));
    container.querySelector('#btnCamera').addEventListener('click', ()=> container.querySelector('#cameraInput').click());
    container.querySelector('#btnGallery').addEventListener('click', ()=> container.querySelector('#galleryInput').click());
    renderThumbs();

    const stageDdBtn = container.querySelector('#stageDdBtn');
    const stageDdPanel = container.querySelector('#stageDdPanel');
    MS_STAGES.forEach(s=>{
      const it = document.createElement('div');
      it.className = 'dd-item';
      it.innerHTML = `<i style="background:${s.color};display:inline-block;width:7px;height:7px;margin-right:8px"></i>${s.name}`;
      it.addEventListener('click', ()=>{ stageKey=s.key; container.querySelector('#stageDdLabel').textContent=s.name; container.querySelector('#stageDdDot').style.background=s.color; stageDdPanel.classList.remove('open'); });
      stageDdPanel.appendChild(it);
    });
    stageDdBtn.addEventListener('click', ()=> stageDdPanel.classList.toggle('open'));
    const initS = msStageByKey(stageKey);
    if(initS){ container.querySelector('#stageDdLabel').textContent = initS.name; container.querySelector('#stageDdDot').style.background = initS.color; }

    container.querySelector('#saveBtn').addEventListener('click', ()=>{
      if(photos.length===0){ alert('Nejdřív vyber nebo vyfoť aspoň jednu fotku.'); return; }
      const caption = container.querySelector('#fCaption').value.trim() || null;
      photos.forEach(dataUrl=> msAddPhoto({ stage: stageKey, thumb: dataUrl, caption }));
      Router.go('dashboard');
    });
    return { activeTab:'dashboard' };
  }
  return { render };
})();
Router.register('photo-add', PhotoAddScreen);
