/* ==========================================================
   GALERIE
   ========================================================== */
const GalleryScreen = (function(){
  const MONTHS = ['Leden','Únor','Březen','Duben','Květen','Červen','Červenec','Srpen','Září','Říjen','Listopad','Prosinec'];

  function render(container, params){
    let activeStage = params.stage || 'all';

    container.innerHTML = `
      <div class="topbar">
        <div class="back-btn" id="backBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></div>
        <h1>Galerie</h1>
        <div class="icon-btn" id="addBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></div>
      </div>
      <div class="screen-scroll">
        <div class="dropdown" id="stageDropdown" style="margin-bottom:12px">
          <button class="dd-btn" id="ddBtn"><span class="left"><i id="ddDot"></i><span id="ddLabel">Etapa: Vše</span></span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 9l6 6 6-6"/></svg></button>
          <div class="dd-panel" id="ddPanel"></div>
        </div>
        <div id="months"></div>
      </div>
    `;
    container.querySelector('#backBtn').addEventListener('click', ()=> Router.back());
    container.querySelector('#addBtn').addEventListener('click', ()=> Router.go('photo-add'));

    const ddBtn = container.querySelector('#ddBtn');
    const ddPanel = container.querySelector('#ddPanel');
    function buildDropdown(){
      const allPhotos = msPhotos();
      ddPanel.innerHTML = '';
      const allItem = document.createElement('div');
      allItem.className = 'dd-item' + (activeStage==='all'?' is-active':'');
      allItem.innerHTML = `<i style="background:#fff;display:inline-block;width:8px;height:8px;margin-right:7px"></i>Vše · ${allPhotos.length} fotek`;
      allItem.addEventListener('click', ()=>{ activeStage='all'; ddLabelUpdate(); ddPanel.classList.remove('open'); draw(); });
      ddPanel.appendChild(allItem);
      msSelectedStages().forEach(s=>{
        const count = allPhotos.filter(p=>p.stage===s.key).length;
        const it = document.createElement('div');
        it.className = 'dd-item' + (activeStage===s.key?' is-active':'');
        it.style.color = s.color;
        it.innerHTML = `<i style="background:${s.color};display:inline-block;width:8px;height:8px;margin-right:7px"></i>${s.name} · ${count} fotek`;
        it.addEventListener('click', ()=>{ activeStage=s.key; ddLabelUpdate(); ddPanel.classList.remove('open'); draw(); });
        ddPanel.appendChild(it);
      });
    }
    function ddLabelUpdate(){
      const s = msStageByKey(activeStage);
      container.querySelector('#ddLabel').textContent = 'Etapa: ' + (s?s.name:'Vše');
    }
    ddBtn.addEventListener('click', ()=> ddPanel.classList.toggle('open'));

    function monthKey(iso){ return (iso||'').slice(0,7); }
    function monthLabel(key){
      const [y,m] = key.split('-');
      return MONTHS[Number(m)-1] + ' ' + y;
    }

    function draw(){
      buildDropdown(); ddLabelUpdate();
      const wrap = container.querySelector('#months');
      const photos = msPhotos().filter(p=> activeStage==='all' || p.stage===activeStage).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
      if(photos.length===0){ wrap.innerHTML = '<p class="empty-msg">Zatím žádné fotky. Přidej první přes +.</p>'; return; }

      const groups = {};
      photos.forEach(p=>{
        const k = monthKey(p.date) || 'neznámo';
        (groups[k] = groups[k] || []).push(p);
      });
      const keys = Object.keys(groups).sort().reverse();

      wrap.innerHTML = keys.map(k=>`
        <div style="margin-bottom:16px">
          <p style="font-size:11px;font-weight:800;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin:0 0 8px">${monthLabel(k)} · ${groups[k].length} fotek</p>
          <div class="month-grid" data-month="${k}" style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px"></div>
        </div>
      `).join('');

      keys.forEach(k=>{
        const grid = wrap.querySelector(`.month-grid[data-month="${k}"]`);
        groups[k].forEach(p=>{
          const s = msStageByKey(p.stage);
          const bg = p.thumb ? `background-image:url(${p.thumb});background-size:cover;background-position:center` : `background:color-mix(in srgb, ${s?s.color:'#94a0bc'} 15%, #0b0f1c)`;
          const cell = document.createElement('div');
          cell.className = 'gallery-photo';
          cell.style.cssText = `aspect-ratio:1;border:1px solid ${s?s.color:'var(--line)'};border-radius:3px;cursor:pointer;${bg}`;
          cell.addEventListener('click', ()=> openPhoto(p));
          grid.appendChild(cell);
        });
      });
    }

    function openPhoto(p){
      const s = msStageByKey(p.stage);
      const overlay = document.createElement('div');
      overlay.className = 'ms-overlay'; overlay.style.cssText = 'position:fixed;inset:0;background:rgba(2,4,10,.92);z-index:70;display:flex;flex-direction:column';
      overlay.innerHTML = `
        <div style="display:flex;justify-content:flex-end;padding:calc(14px + env(safe-area-inset-top)) 16px 8px">
          <div id="closePhoto" style="width:32px;height:32px;border:1px solid var(--line);border-radius:3px;display:grid;place-items:center;color:#fff;cursor:pointer">✕</div>
        </div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:0 16px">
          <div style="width:100%;aspect-ratio:1;border-radius:var(--radius);border:1px solid ${s?s.color:'var(--line)'};${p.thumb?`background-image:url(${p.thumb});background-size:cover;background-position:center`:'background:rgba(255,255,255,.04)'}"></div>
        </div>
        <div style="padding:14px 16px calc(20px + env(safe-area-inset-bottom))">
          ${s ? `<p style="margin:0 0 4px;font-size:11px;color:${s.color};font-weight:800">${s.name}</p>` : ''}
          <p style="margin:0 0 8px;font-size:11px;color:var(--muted)">${p.date || ''}</p>
          <textarea id="capField" class="f-textarea" placeholder="Přidat popisek…" style="min-height:50px">${p.caption||''}</textarea>
          <div style="display:flex;gap:8px;margin-top:8px">
            <button id="saveCapBtn" class="btn-primary" style="border-color:${s?s.color:'#b34cff'}">Uložit popisek</button>
            <button id="delPhotoBtn" class="btn-ghost" style="color:#ff7a86;flex:0 0 auto;width:auto;padding:11px 16px">Smazat</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      overlay.querySelector('#closePhoto').addEventListener('click', ()=> document.body.removeChild(overlay));
      overlay.querySelector('#saveCapBtn').addEventListener('click', ()=>{
        const caption = overlay.querySelector('#capField').value.trim();
        msUpdatePhoto(p.id, { caption });
        document.body.removeChild(overlay);
        draw();
      });
      overlay.querySelector('#delPhotoBtn').addEventListener('click', async ()=>{
        if(!await Layout.confirmDialog('Smazat tuhle fotku? Nedá se to vrátit zpět.', 'Smazat')) return;
        msDeletePhoto(p.id);
        document.body.removeChild(overlay);
        draw();
      });
    }

    draw();
    return { activeTab:'dashboard' };
  }
  return { render };
})();
Router.register('gallery', GalleryScreen);
