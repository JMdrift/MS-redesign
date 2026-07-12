/* ==========================================================
   VYDAJE ETAPY (solo karta, prepinatelna etapa)
   ========================================================== */
const StageExpensesScreen = (function(){
  function render(container, params){
    let stageKey = params.stage || msGetCurrentStage();

    container.innerHTML = `
      <div class="topbar">
        <div class="back-btn" id="backBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></div>
        <h1>Výdaje etapy</h1>
      </div>
      <div class="screen-scroll">
        <div class="dropdown" id="stageDropdown" style="margin-bottom:12px">
          <button class="dd-btn" id="ddBtn"><span class="left"><i id="ddDot"></i><span id="ddLabel">—</span></span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg></button>
          <div class="dd-panel" id="ddPanel"></div>
        </div>
        <div style="border:1px solid var(--line);padding:14px;margin-bottom:14px">
          <div style="display:flex;justify-content:space-between"><span style="font-size:9.5px;color:var(--muted);text-transform:uppercase">Zůstatek účtu</span><b id="sumBalance" style="font-size:14px"></b></div>
          <div style="text-align:center;padding-top:8px;margin-top:8px;border-top:1px solid var(--line)">
            <span style="display:block;font-size:9.5px;color:var(--muted);text-transform:uppercase;margin-bottom:4px">Výdaje v této etapě</span>
            <b id="sumStageSpent" style="font-size:26px;color:#4dffab"></b>
          </div>
        </div>
        <p class="section-label">Výdaje</p>
        <div id="txList"></div>
      </div>
    `;
    container.querySelector('#backBtn').addEventListener('click', ()=> Router.back());

    const ddBtn = container.querySelector('#ddBtn');
    const ddPanel = container.querySelector('#ddPanel');
    MS_STAGES.forEach(s=>{
      const it = document.createElement('div');
      it.className = 'dd-item';
      it.innerHTML = `<i style="background:${s.color};display:inline-block;width:7px;height:7px;margin-right:8px"></i>${s.name}`;
      it.addEventListener('click', ()=>{ stageKey=s.key; updateLabel(); ddPanel.classList.remove('open'); draw(); });
      ddPanel.appendChild(it);
    });
    ddBtn.addEventListener('click', ()=> ddPanel.classList.toggle('open'));
    function updateLabel(){
      const s = msStageByKey(stageKey);
      if(s){ container.querySelector('#ddLabel').textContent = s.name; container.querySelector('#ddDot').style.background = s.color; }
    }
    updateLabel();

    function draw(){
      container.querySelector('#sumBalance').textContent = msBalance().toLocaleString('cs-CZ')+' Kč';
      const spent = msSumExpensesByStage(stageKey);
      container.querySelector('#sumStageSpent').textContent = spent.toLocaleString('cs-CZ')+' Kč';
      const list = container.querySelector('#txList');
      const txs = msExpenses().filter(t=>t.stage===stageKey && t.type==='expense').sort((a,b)=>(b.date||'').localeCompare(a.date||''));
      if(txs.length===0){ list.innerHTML = '<p class="empty-msg">V této etapě zatím nejsou žádné výdaje.</p>'; return; }
      list.innerHTML = txs.map(t=>`
        <div style="border:1px solid var(--line);padding:10px;margin-bottom:7px;display:flex;justify-content:space-between;align-items:center">
          <div style="flex:1;min-width:0"><b style="display:block;font-size:12.5px">${t.title}</b><span style="font-size:10px;color:var(--muted)">${t.date}${t.category?' · '+t.category:''}</span></div>
          <b style="font-size:13px;color:#ff7a86">-${Number(t.amount).toLocaleString('cs-CZ')} Kč</b>
          <span class="edit-tx" data-id="${t.id}" style="width:26px;height:26px;border:1px solid var(--line);display:grid;place-items:center;cursor:pointer;color:var(--muted);margin-left:8px">✎</span>
        </div>`).join('');
      list.querySelectorAll('.edit-tx').forEach(el=>{
        el.addEventListener('click', ()=> Router.go('expense-add', {edit:el.dataset.id, back:'stage-expenses'}));
      });
    }
    draw();

    return { activeTab:'stages' };
  }
  return { render };
})();
Router.register('stage-expenses', StageExpensesScreen);
