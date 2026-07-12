/* ==========================================================
   KALENDAR
   ========================================================== */
const CalendarScreen = (function(){
  const MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];

  function render(container){
    const today = new Date();
    let viewYear = today.getFullYear(), viewMonth = today.getMonth();
    let selectedDate = today.toISOString().slice(0,10);

    container.innerHTML = `
      <div class="topbar">
        <div class="back-btn" id="backBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></div>
        <h1>Kalendář</h1>
        <div class="icon-btn" id="addBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></div>
      </div>
      <div class="screen-scroll">
        <div style="border:1px solid var(--line);padding:12px;margin-bottom:14px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <b id="monthLabel" style="font-size:13px"></b>
            <div style="display:flex;gap:6px">
              <button id="prevBtn" style="width:24px;height:24px;border:1px solid var(--line);background:transparent;color:#fff;cursor:pointer">‹</button>
              <button id="nextBtn" style="width:24px;height:24px;border:1px solid var(--line);background:transparent;color:#fff;cursor:pointer">›</button>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:4px">
            ${['Po','Út','St','Čt','Pá','So','Ne'].map(d=>`<span style="text-align:center;font-size:8.5px;color:var(--muted);font-weight:800">${d}</span>`).join('')}
          </div>
          <div id="grid" style="display:grid;grid-template-columns:repeat(7,1fr);gap:2px"></div>
        </div>
        <p class="section-label" id="listLabel">Události tento den</p>
        <div id="eventList"></div>
        <p class="section-label">Nadcházející události</p>
        <div id="allEvents"></div>
      </div>
    `;
    container.querySelector('#backBtn').addEventListener('click', ()=> Router.back());
    container.querySelector('#addBtn').addEventListener('click', ()=> Router.go('event-add'));
    container.querySelector('#prevBtn').addEventListener('click', ()=>{ viewMonth--; if(viewMonth<0){viewMonth=11;viewYear--;} draw(); });
    container.querySelector('#nextBtn').addEventListener('click', ()=>{ viewMonth++; if(viewMonth>11){viewMonth=0;viewYear++;} draw(); });

    function draw(){
      container.querySelector('#monthLabel').textContent = MONTHS[viewMonth]+' '+viewYear;
      const events = msEvents();
      const grid = container.querySelector('#grid');
      grid.innerHTML = '';
      const firstDay = new Date(viewYear, viewMonth, 1);
      let startWeekday = firstDay.getDay(); startWeekday = startWeekday===0?6:startWeekday-1;
      const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
      for(let i=0;i<startWeekday;i++) grid.appendChild(document.createElement('div'));
      for(let d=1; d<=daysInMonth; d++){
        const iso = viewYear+'-'+String(viewMonth+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
        const has = events.some(e=>e.date===iso);
        const cell = document.createElement('div');
        cell.style.cssText = `aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:10px;cursor:pointer;
          border:1px solid ${iso===selectedDate?'#25b7ff':'transparent'};color:${iso===selectedDate?'#fff':'#c7cee6'}`;
        cell.innerHTML = d + (has?'<i style="width:3px;height:3px;background:#25b7ff;display:block;margin-top:1px"></i>':'');
        cell.addEventListener('click', ()=>{ selectedDate = iso; draw(); });
        grid.appendChild(cell);
      }
      const list = container.querySelector('#eventList');
      const dayEvents = events.filter(e=>e.date===selectedDate).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
      if(dayEvents.length===0){ list.innerHTML = '<p class="empty-msg">Žádné události tento den.</p>'; }
      else {
      list.innerHTML = dayEvents.map(e=>`
        <div style="border:1px solid var(--line);padding:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">
          <div><b style="display:block;font-size:12.5px">${e.title}</b><span style="font-size:10.5px;color:var(--muted)">${e.time?e.time:'Celý den'}</span></div>
          <span class="del-ev" data-id="${e.id}" style="color:#ff7a86;cursor:pointer;font-size:11px">Smazat</span>
        </div>`).join('');
      list.querySelectorAll('.del-ev').forEach(el=>{
        el.addEventListener('click', async ()=>{
          if(!await Layout.confirmDialog('Smazat tuhle událost?', 'Smazat')) return;
          msDeleteEvent(el.dataset.id); draw();
        });
      });
      }

      renderAllEvents(events);
    }

    function renderAllEvents(events){
      const wrap = container.querySelector('#allEvents');
      const todayIso = today.toISOString().slice(0,10);
      const upcoming = events.filter(e=>e.date>=todayIso).sort((a,b)=>a.date.localeCompare(b.date));
      if(upcoming.length===0){ wrap.innerHTML = '<p class="empty-msg">Žádné nadcházející události.</p>'; return; }
      const nextId = upcoming[0].id;
      wrap.innerHTML = upcoming.map(e=>{
        const d = new Date(e.date+'T00:00:00');
        return `<div class="upcoming-ev" data-date="${e.date}" style="display:flex;align-items:center;gap:10px;border:1px solid var(--line);padding:9px;margin-bottom:6px;cursor:pointer">
          <div style="width:38px;height:38px;border:1px solid #25b7ff;border-radius:var(--radius);display:flex;flex-direction:column;align-items:center;justify-content:center;flex:0 0 auto;color:#25b7ff">
            <b style="font-size:13px;line-height:1">${d.getDate()}</b><span style="font-size:7px;text-transform:uppercase">${MONTHS[d.getMonth()].slice(0,3)}</span>
          </div>
          <div style="flex:1;min-width:0"><b style="display:block;font-size:12px">${e.title}</b><span style="font-size:10px;color:var(--muted)">${e.time?e.time:'Celý den'}</span></div>
          ${e.id===nextId ? '<span style="font-size:8px;font-weight:800;color:#4dffab;border:1px solid #4dffab;padding:2px 5px;border-radius:3px;flex:0 0 auto">Nejbližší</span>' : ''}
        </div>`;
      }).join('');
      wrap.querySelectorAll('.upcoming-ev').forEach(el=>{
        el.addEventListener('click', ()=>{
          const d = new Date(el.dataset.date+'T00:00:00');
          selectedDate = el.dataset.date; viewYear = d.getFullYear(); viewMonth = d.getMonth();
          draw();
          container.closest('.screen-scroll').scrollTop = 0;
        });
      });
    }
    draw();
    return { activeTab:'dashboard' };
  }
  return { render };
})();
Router.register('calendar', CalendarScreen);
