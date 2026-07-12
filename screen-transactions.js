/* ==========================================================
   VSECHNY TRANSAKCE - seznam + sbalitelny kalendarni filtr podle dne
   ========================================================== */
const TransactionsScreen = (function(){
  const MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];

  function render(container, params){
    const showExpense = params.expense !== '0';
    const showIncome = params.income === '1';
    const stageFilter = params.stage || null;
    let selectedDate = null;
    const today = new Date();
    let viewYear = today.getFullYear(), viewMonth = today.getMonth();

    let labelParts = [];
    if(showExpense) labelParts.push('výdaje');
    if(showIncome) labelParts.push('vklady');
    if(stageFilter){ const s = msStageByKey(stageFilter); if(s) labelParts.push(s.name); }

    container.innerHTML = `
      <div class="topbar">
        <div class="back-btn" id="backBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></div>
        <h1>Transakce <span style="font-size:10.5px;color:var(--muted)">${labelParts.length?'· '+labelParts.join(' + '):''}</span></h1>
        <div class="icon-btn" id="calToggleBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M8 3v4M16 3v4M3 10h18"/></svg></div>
      </div>
      <div class="screen-scroll">
        <div id="miniCalWrap" style="max-height:0;overflow:hidden;transition:max-height .2s ease">
          <div style="border:1px solid var(--line);background:#0b0f1c;border-radius:var(--radius);padding:10px;margin-bottom:8px">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <b id="calMonthLabel" style="font-size:12px"></b>
              <div style="display:flex;gap:6px">
                <button id="calPrev" style="width:24px;height:24px;border:1px solid var(--line);background:transparent;color:#fff;cursor:pointer">‹</button>
                <button id="calNext" style="width:24px;height:24px;border:1px solid var(--line);background:transparent;color:#fff;cursor:pointer">›</button>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px">
              ${['Po','Út','St','Čt','Pá','So','Ne'].map(d=>`<span style="text-align:center;font-size:8.5px;color:var(--muted);font-weight:800">${d}</span>`).join('')}
            </div>
            <div id="calGrid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px"></div>
            <p id="clearDay" style="display:none;text-align:center;font-size:10.5px;color:#ff7a86;margin:8px 0 0;cursor:pointer">Zrušit výběr dne ✕</p>
          </div>
        </div>
        <div id="txList"></div>
      </div>
    `;
    container.querySelector('#backBtn').addEventListener('click', ()=> Router.back());

    const miniCalWrap = container.querySelector('#miniCalWrap');
    container.querySelector('#calToggleBtn').addEventListener('click', ()=>{
      const isOpen = miniCalWrap.style.maxHeight !== '0px' && miniCalWrap.style.maxHeight !== '';
      miniCalWrap.style.maxHeight = isOpen ? '0' : '320px';
      if(!isOpen) renderCalendar();
    });

    const ALL_TX = msExpenses().filter(t=>{
      if(stageFilter && t.stage!==stageFilter) return false;
      if(t.type==='expense') return showExpense;
      if(t.type==='income') return showIncome;
      return false;
    });
    function txOnDay(iso){ return ALL_TX.filter(t=>t.date===iso); }

    function renderCalendar(){
      container.querySelector('#calMonthLabel').textContent = MONTHS[viewMonth] + ' ' + viewYear;
      const grid = container.querySelector('#calGrid');
      grid.innerHTML = '';
      const firstDay = new Date(viewYear, viewMonth, 1);
      let startWeekday = firstDay.getDay(); startWeekday = startWeekday===0?6:startWeekday-1;
      const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
      for(let i=0;i<startWeekday;i++) grid.appendChild(document.createElement('div'));
      for(let d=1; d<=daysInMonth; d++){
        const iso = viewYear+'-'+String(viewMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
        const has = txOnDay(iso).length>0;
        const cell = document.createElement('div');
        cell.style.cssText = `height:26px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:10px;border-radius:3px;
          cursor:${has?'pointer':'default'};background:${iso===selectedDate?'#b34cff':'transparent'};color:${iso===selectedDate?'#fff':(has?'#c7cee6':'#5c6584')}`;
        cell.innerHTML = d + (has?'<i style="width:3px;height:3px;background:currentColor;border-radius:50%;display:block;margin-top:1px"></i>':'');
        if(has){ cell.addEventListener('click', ()=>{ selectedDate = (selectedDate===iso)?null:iso; renderCalendar(); renderList(); }); }
        grid.appendChild(cell);
      }
      container.querySelector('#clearDay').style.display = selectedDate ? 'block' : 'none';
    }
    container.querySelector('#calPrev').addEventListener('click', ()=>{ viewMonth--; if(viewMonth<0){viewMonth=11;viewYear--;} renderCalendar(); });
    container.querySelector('#calNext').addEventListener('click', ()=>{ viewMonth++; if(viewMonth>11){viewMonth=0;viewYear++;} renderCalendar(); });
    container.querySelector('#clearDay').addEventListener('click', ()=>{ selectedDate=null; renderCalendar(); renderList(); });

    function renderList(){
      const wrap = container.querySelector('#txList');
      const list = ALL_TX.filter(t=> !selectedDate || t.date===selectedDate).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
      if(list.length===0){ wrap.innerHTML = '<p class="empty-msg">Žádné transakce neodpovídají filtru.</p>'; return; }
      wrap.innerHTML = list.map(t=>{
        const s = msStageByKey(t.stage);
        return `<div style="border:1px solid var(--line);padding:10px;margin-bottom:7px;display:flex;justify-content:space-between;align-items:center">
          <div style="flex:1;min-width:0"><b style="display:block;font-size:12.5px">${t.title}</b><span style="font-size:10px;color:var(--muted)">${s?s.name+' · ':''}${t.date}</span></div>
          <b style="font-size:13px;color:${t.type==='income'?'#4dffab':'#ff7a86'}">${t.type==='income'?'+':'-'}${Number(t.amount).toLocaleString('cs-CZ')} Kč</b>
          <span class="edit-tx" data-id="${t.id}" style="width:26px;height:26px;border:1px solid var(--line);display:grid;place-items:center;cursor:pointer;color:var(--muted);margin-left:8px">✎</span>
        </div>`;
      }).join('');
      wrap.querySelectorAll('.edit-tx').forEach(el=>{
        el.addEventListener('click', ()=> Router.go('expense-add', {edit:el.dataset.id, back:'transactions'}));
      });
    }
    renderList();

    return { activeTab:'dashboard' };
  }
  return { render };
})();
Router.register('transactions', TransactionsScreen);
