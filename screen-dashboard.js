/* ==========================================================
   DASHBOARD (Domu)
   ========================================================== */
const DashboardScreen = (function(){

  function todayISO(){
    const d = new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function formatToday(){
    const days = ['Neděle','Pondělí','Úterý','Středa','Čtvrtek','Pátek','Sobota'];
    const months = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince'];
    const d = new Date();
    return days[d.getDay()] + ', ' + d.getDate() + '. ' + months[d.getMonth()] + ' ' + d.getFullYear();
  }
  function formatDateCz(iso){
    const d = new Date(iso+'T00:00:00');
    return d.getDate()+'. '+(d.getMonth()+1)+'. '+d.getFullYear();
  }
  function dayCount(startISO){
    const start = new Date(startISO+'T00:00:00');
    const now = new Date();
    return Math.max(1, Math.floor((now-start)/86400000)+1);
  }
  function monthsBetween(startISO, todayD){
    const s = new Date(startISO+'T00:00:00');
    return (todayD.getFullYear()-s.getFullYear())*12 + (todayD.getMonth()-s.getMonth());
  }
  function jubileeLabel(months){
    if(months<=0) return null;
    if(months % 12 === 0) return (months/12) + (months/12===1 ? ' rok' : (months/12<5 ? ' roky' : ' let'));
    return months + (months===1?' měsíc':(months<5?' měsíce':' měsíců'));
  }

  function render(container){
    const projects = msLoadProjects();
    const activeId = msGetActiveProjectId();
    let p = projects.find(x=>x.id===activeId) || projects[0];

    container.innerHTML = `
      <div class="topbar">
        <div class="dropdown" id="projDropdown" style="flex:1">
          <button class="dd-btn" id="projBtn" style="border:0;background:none;padding:0;justify-content:flex-start;gap:6px">
            <span style="text-align:left">
              <b style="display:block;font-size:16px">${p ? p.name : 'Projekt'}</b>
              <span style="display:block;font-size:10.5px;color:var(--muted);font-weight:600">${p ? p.location : ''}</span>
            </span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="dd-panel" id="projPanel"></div>
        </div>
        <div class="top-actions">
          <div class="icon-btn" id="aiBtn" title="Martin - lokální AI" style="font-size:11px;font-weight:800">AI</div>
          <div class="icon-btn" id="searchBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></div>
          <div class="icon-btn" id="settingsBtn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09c0 .68.39 1.28 1 1.51.66.26 1.42.12 1.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06c-.45.4-.59 1.16-.33 1.82.23.61.83 1 1.51 1H21a2 2 0 010 4h-.09c-.68 0-1.28.39-1.51 1z"/></svg></div>
        </div>
      </div>

      <div id="searchWrap"></div>

      <div class="screen-scroll" style="padding-top:0;font-size:13px">
        <div style="position:relative;margin:8px -16px 6px">
          <img src="house.jpg" alt="Rodinný dům" class="house-neon" style="width:100%;height:auto;display:block"/>
          <img src="house-sketch.jpg" alt="Rodinný dům" class="house-sketch" style="width:100%;height:auto;display:none"/>
          <div class="hero-gradient" style="position:absolute;inset:0;background:linear-gradient(rgba(2,4,10,.55),rgba(2,4,10,0) 60%)"></div>
          <div id="heroText" style="position:absolute;left:0;top:0;padding:9px 16px 0"></div>
        </div>

        <div id="stageCardWrap"></div>
        <div id="moneyCardWrap"></div>
        <div class="tiles-row" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px">
          <div id="galleryTileWrap"></div>
          <div id="eventTileWrap"></div>
        </div>
      </div>
    `;

    if(!p){
      // bez projektu appka neni k cemu - poslat na onboarding
      Router.go('onboarding');
      return { activeTab:'dashboard', showNav:false };
    }

    renderHero(p);
    renderStageCard();
    renderMoneyCard();
    renderTiles();
    renderProjectSwitcher(p, projects, activeId);
    wireTopActions(p);
    checkJubilee(p);
    checkTodayEventNotifications();

    return { activeTab:'dashboard', showNav:true };

    // ---------- podfunkce ----------

    function persistProject(patch){
      const list = msLoadProjects();
      const idx = list.findIndex(x=>x.id===p.id);
      if(idx!==-1){ list[idx] = Object.assign({}, list[idx], patch); msSaveProjects(list); p = list[idx]; }
    }

    function renderHero(p){
      const wrap = container.querySelector('#heroText');
      const sh = 'text-shadow:0 1px 6px rgba(0,0,0,.8)';
      if(p.finished){
        wrap.innerHTML = `<p style="margin:0;color:#dfe4f5;font-size:9px;text-transform:uppercase;letter-spacing:.1em;font-weight:800;${sh}">Stavba dokončena</p><strong style="display:block;font-size:28px;color:#fff;${sh}">${dayCount(p.startDate)}</strong><small style="color:#dfe4f5;${sh}">zkolaudováno ${formatDateCz(p.finishDate)}</small>`;
      } else if(p.started){
        wrap.innerHTML = `<p style="margin:0;color:#dfe4f5;font-size:9px;text-transform:uppercase;letter-spacing:.1em;font-weight:800;${sh}">Den stavby</p><strong style="display:block;font-size:28px;color:#fff;${sh}">${dayCount(p.startDate)}</strong>
          <span style="display:block;color:#dfe4f5;font-size:10.5px;margin-top:1px;${sh}">${formatToday()}</span>
          <button id="finishLink" class="finish-btn" style="margin-top:5px;font-size:10px;font-weight:800;color:#4dffab;background:var(--card-bg-2);border:1px solid #4dffab;padding:4px 9px;border-radius:3px;cursor:pointer;${sh}">Zkolaudovat stavbu</button>`;
        wrap.querySelector('#finishLink').addEventListener('click', async ()=>{
          if(!await Layout.confirmDialog('Zkolaudovat stavbu? Den stavby se zastaví na dnešním dni.', 'Zkolaudovat')) return;
          persistProject({ finished:true, finishDate: todayISO() });
          Router.go('celebration', { type:'done', title:'Stavba zkolaudována!', photos: msPhotos().length, money: msTotalExpenses() });
        });
      } else {
        wrap.innerHTML = `<p style="margin:0;color:#dfe4f5;font-size:9px;text-transform:uppercase;letter-spacing:.1em;font-weight:800;${sh}">${formatToday()}</p><button class="btn-primary" id="startBtn" style="margin-top:7px;width:auto;padding:9px 16px;display:inline-block;font-size:12px">Zahájit stavbu</button><small style="display:block;color:#dfe4f5;margin-top:5px;font-size:10px;${sh}">Od zahájení se začne počítat den stavby</small>`;
        wrap.querySelector('#startBtn').addEventListener('click', async ()=>{
          if(!await Layout.confirmDialog('Zahájit stavbu dnešním dnem?', 'Zahájit')) return;
          persistProject({ started:true, startDate: todayISO(), finished:false });
          renderHero(p);
        });
      }
    }

    function renderStageCard(){
      const wrap = container.querySelector('#stageCardWrap');
      const cur = msStageByKey(msGetCurrentStage());
      const color = cur ? cur.color : '#94a0bc';
      wrap.innerHTML = `
        <div class="stage-card" id="stageCard" style="--stage-color:${color};border:1px solid color-mix(in srgb, ${color} 55%, transparent);
          background:var(--card-bg);border-radius:var(--radius);padding:10px;margin-top:9px;cursor:pointer;
          box-shadow:0 0 14px color-mix(in srgb, ${color} 18%, transparent)">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:44px;height:44px;border-radius:var(--radius);flex:0 0 44px;display:grid;place-items:center;color:${color};
              background:color-mix(in srgb, ${color} 8%, transparent);border:1px solid color-mix(in srgb, ${color} 55%, transparent)">
              ${msStageIconSvg(cur ? cur.key : null, 26)}
            </div>
            <div style="flex:1;min-width:0">
              <p style="margin:0 0 2px;color:#aeb7d6;text-transform:uppercase;letter-spacing:.1em;font-size:8.5px;font-weight:800">Aktuální etapa</p>
              <h2 style="margin:0 0 2px;font-size:14.5px">${cur ? cur.name : 'Zatím žádná etapa'}</h2>
              <p class="stage-status-line" style="display:flex;align-items:center;gap:5px;font-size:10.5px;color:#d8b8ff;margin:0"><i style="width:5px;height:5px;border-radius:50%;background:${color};display:inline-block;box-shadow:0 0 6px ${color}"></i>${cur ? msStageStatusLabel(cur.key) : 'Nevybráno'}</p>
            </div>
          </div>
          <button id="openStageBtn" style="width:100%;margin-top:8px;border:1px solid color-mix(in srgb, ${color} 55%, transparent);
            background:rgba(255,255,255,.02);color:#fff;font-weight:800;font-size:11.5px;padding:7px;cursor:pointer;border-radius:3px">Otevřít etapu →</button>
        </div>`;
      wrap.querySelector('#stageCard').addEventListener('click', (e)=>{
        if(e.target.closest('#openStageBtn')) return;
        Router.go(cur ? 'stage-detail' : 'stages', cur ? {key:cur.key} : {});
      });
      wrap.querySelector('#openStageBtn').addEventListener('click', ()=>{
        Router.go(cur ? 'stage-detail' : 'stages', cur ? {key:cur.key} : {});
      });
    }

    function renderMoneyCard(){
      const wrap = container.querySelector('#moneyCardWrap');
      const now = new Date();
      const ym = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
      const monthExp = msExpenses().filter(e=>e.type==='expense' && (e.date||'').startsWith(ym)).reduce((s,e)=>s+Number(e.amount||0),0);
      wrap.innerHTML = `
        <div style="border:1px solid var(--line);background:var(--card-bg);border-radius:var(--radius);padding:10px;margin-top:8px;cursor:pointer" id="moneyCard">
          <div style="display:flex;align-items:center;gap:5px;color:#4dffab;text-transform:uppercase;font-size:8.5px;font-weight:800;letter-spacing:.09em">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="20" height="13" rx="2"/><path d="M2 10h20"/></svg>
            Zůstatek účtu
          </div>
          <div style="font-size:22px;font-weight:800;color:#4dffab;margin:3px 0 6px">${msBalance().toLocaleString('cs-CZ')} Kč</div>
          <div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--muted)"><span>Výdaje celkem</span><b style="color:#dfe4f5">${msTotalExpenses().toLocaleString('cs-CZ')} Kč</b></div>
          <div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--muted);margin-top:2px"><span>Tento měsíc</span><b style="color:#dfe4f5">${monthExp.toLocaleString('cs-CZ')} Kč</b></div>
        </div>`;
      wrap.querySelector('#moneyCard').addEventListener('click', ()=> Router.go('finance'));
    }

    function renderTiles(){
      const gWrap = container.querySelector('#galleryTileWrap');
      const lastPhotos = [...msPhotos()].sort((a,b)=>(b.date||'').localeCompare(a.date||'')).slice(0,2);
      const thumbsHtml = lastPhotos.length
        ? `<div style="display:flex;gap:5px;margin-top:6px">${lastPhotos.map(p=>{
            const bg = p.thumb ? `background-image:url(${p.thumb});background-size:cover;background-position:center` : `background:rgba(179,76,255,.12)`;
            return `<div style="flex:1;aspect-ratio:1;border-radius:3px;border:1px solid var(--line);${bg}"></div>`;
          }).join('')}</div>`
        : `<div style="flex:1;display:flex;align-items:center;justify-content:center"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" style="color:var(--muted);opacity:.4"><rect x="3" y="5" width="18" height="14" rx="1"/><circle cx="9" cy="11" r="2"/></svg></div>`;
      gWrap.innerHTML = `
        <div style="border:1px solid var(--line);background:var(--card-bg);border-radius:var(--radius);padding:12px;cursor:pointer;height:100%;min-height:118px;display:flex;flex-direction:column" id="galleryTile">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <b style="font-size:13px;color:#fff">Galerie</b>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color:var(--muted)"><rect x="3" y="5" width="18" height="14" rx="1"/><circle cx="9" cy="11" r="2"/></svg>
          </div>
          ${thumbsHtml}
          <p style="margin:6px 0 0;font-size:10px;color:var(--muted)">${msPhotos().length} fotek</p>
        </div>`;
      gWrap.querySelector('#galleryTile').addEventListener('click', ()=> Router.go('gallery'));

      const eWrap = container.querySelector('#eventTileWrap');
      const events = msEvents();
      const today = todayISO();
      const next = events.filter(e=>e.date>=today).sort((a,b)=>a.date.localeCompare(b.date))[0];
      const evDateLabel = next ? formatDateCz(next.date) + (next.time ? ' · '+next.time : ' · celý den') : '';
      eWrap.innerHTML = `
        <div style="border:1px solid var(--line);background:var(--card-bg);border-radius:var(--radius);padding:12px;cursor:pointer;height:100%;min-height:118px;display:flex;flex-direction:column" id="eventTile">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <b style="font-size:13px;color:#fff">Kalendář</b>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="color:var(--muted)"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:3px">
            ${next ? `
              <p style="margin:0 0 2px;font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;font-weight:800">Nejbližší událost</p>
              <div style="display:flex;align-items:center;gap:6px">
                <div style="width:24px;height:24px;border-radius:3px;background:rgba(37,183,255,.12);border:1px solid #25b7ff;color:#25b7ff;display:grid;place-items:center;flex:0 0 auto">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="16" rx="1"/><path d="M8 3v4M16 3v4M3 10h18"/></svg>
                </div>
                <p style="margin:0;font-size:11px;color:#fff;font-weight:700;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${next.title}</p>
              </div>
              <span style="font-size:9.5px;color:#c9a3ff">${evDateLabel}</span>
            ` : `<p style="margin:0;font-size:11px;color:var(--muted)">Žádná událost</p>`}
          </div>
        </div>`;
      eWrap.querySelector('#eventTile').addEventListener('click', ()=> Router.go('calendar'));
    }

    function renderProjectSwitcher(activeP, list, activeId){
      const panel = container.querySelector('#projPanel');
      panel.innerHTML = list.map(pr=>`
        <div class="dd-item ${pr.id===activeId?'is-active':''}" data-id="${pr.id}">
          <span>${pr.name} <small style="color:var(--muted)">· ${pr.location||''}</small></span>
        </div>`).join('') + `<div class="dd-item" id="projAddItem" style="color:#b34cff;font-weight:800">+ Přidat projekt</div>`;
      panel.querySelectorAll('.dd-item[data-id]').forEach(el=>{
        el.addEventListener('click', ()=>{
          msSetActiveProjectId(el.dataset.id);
          Router.go('dashboard');
        });
      });
      panel.querySelector('#projAddItem').addEventListener('click', ()=> Router.go('onboarding-project'));
      container.querySelector('#projBtn').addEventListener('click', ()=> panel.classList.toggle('open'));
      document.addEventListener('click', function outside(e){
        if(!container.contains(e.target)){ return; }
        if(!e.target.closest('#projDropdown')) panel.classList.remove('open');
      });
    }

    function wireTopActions(p){
      container.querySelector('#settingsBtn').addEventListener('click', ()=> Router.go('settings'));
      container.querySelector('#aiBtn').addEventListener('click', ()=> openMartinChat(p));
      container.querySelector('#searchBtn').addEventListener('click', ()=> toggleSearch());
    }

    function toggleSearch(){
      const wrap = container.querySelector('#searchWrap');
      const isOpen = wrap.dataset.open === '1';
      if(isOpen){ wrap.innerHTML=''; wrap.dataset.open='0'; return; }
      wrap.dataset.open = '1';
      wrap.innerHTML = `
        <div style="padding:0 16px 8px">
          <input id="searchInput" class="f-input" placeholder="Hledat etapu nebo sekci…" autofocus/>
          <div id="searchResults" style="margin-top:6px"></div>
        </div>
      `;
      const index = [
        ...msSelectedStages().map(s=>({label:s.name, color:s.color, route:'stage-detail', params:{key:s.key}})),
        {label:'Finance', color:'#4dffab', route:'finance'},
        {label:'Galerie', color:'#25b7ff', route:'gallery'},
        {label:'Deník', color:'#ffd35c', route:'diary'},
        {label:'Projekt', color:'#c9a3ff', route:'project'},
        {label:'Kalendář', color:'#25b7ff', route:'calendar'},
        {label:'Nastavení', color:'#94a0bc', route:'settings'},
      ];
      const input = wrap.querySelector('#searchInput');
      const results = wrap.querySelector('#searchResults');
      input.addEventListener('input', ()=>{
        const q = input.value.trim().toLowerCase();
        if(!q){ results.innerHTML=''; return; }
        const matches = index.filter(i=>i.label.toLowerCase().includes(q));
        results.innerHTML = matches.length
          ? matches.map((m,i)=>`<div class="sr-item" data-i="${i}" style="display:flex;align-items:center;gap:8px;padding:9px 0;border-top:1px solid var(--line);cursor:pointer">
              <i style="width:7px;height:7px;border-radius:50%;background:${m.color};display:inline-block"></i><span style="font-size:12.5px">${m.label}</span>
            </div>`).join('')
          : '<p style="font-size:11px;color:var(--muted);padding:8px 0">Nic nenalezeno.</p>';
        results.querySelectorAll('.sr-item').forEach(el=>{
          el.addEventListener('click', ()=>{
            const m = matches[Number(el.dataset.i)];
            Router.go(m.route, m.params||{});
          });
        });
      });
    }

    function checkJubilee(p){
      if(!p.started) return;
      const months = monthsBetween(p.startDate, new Date());
      const label = jubileeLabel(months);
      if(!label) return;
      const lastDone = p.lastMilestoneMonths || 0;
      if(months > lastDone && months > 0 && months % 1 === 0 && (months===1 || months%1===0) && label){
        // jednoduchy jubilejni banner jen jednou za dany pocet mesicu
      }
    }

    function checkTodayEventNotifications(){
      const enabled = localStorage.getItem('ms_notifications_enabled_v1') === '1';
      if(!enabled || typeof Notification==='undefined' || Notification.permission!=='granted') return;
      const lastCheckKey = 'ms_notif_last_check_v1';
      const t = todayISO();
      if(localStorage.getItem(lastCheckKey) === t) return;
      localStorage.setItem(lastCheckKey, t);
      msEvents().filter(e=>e.date===t).forEach(e=>{
        new Notification('Moje Stavba — dnes', { body: e.title + (e.time ? ' · ' + e.time : '') });
      });
    }
  }

  function martinReply(q, p){
    q = q.toLowerCase();
    if(q.includes('peníz')||q.includes('utrac')||q.includes('zůstat')) return `Na účtu zbývá ${msBalance().toLocaleString('cs-CZ')} Kč, celkem jste zatím utratili ${msTotalExpenses().toLocaleString('cs-CZ')} Kč.`;
    if(q.includes('foto')) return `V galerii máte zatím ${msPhotos().length} fotek.`;
    if(q.includes('etap')){ const cur = msStageByKey(msGetCurrentStage()); return cur ? `Aktuální etapa je ${cur.name} (${msStageStatusLabel(cur.key)}).` : 'Zatím nemáte vybranou žádnou etapu.'; }
    if(q.includes('den') && p.started) return `Dnes je ${dayCount(p.startDate)}. den stavby.`;
    return 'Na tohle zatím neumím odpovědět, ale zkuste se zeptat na peníze, fotky, etapu nebo den stavby.';
  }

  function openMartinChat(p){
    const overlay = document.createElement('div');
    overlay.className = 'ms-overlay'; overlay.style.cssText = 'position:fixed;inset:0;background:rgba(2,4,10,.85);z-index:70;display:flex;flex-direction:column';
    overlay.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;padding:calc(14px + env(safe-area-inset-top)) 16px 12px;border-bottom:1px solid var(--line)">
        <div style="width:34px;height:34px;border:1px solid #b34cff;color:#b34cff;display:grid;place-items:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l2 4 4 .7-3 3 .7 4-3.7-2-3.7 2 .7-4-3-3 4-.7z"/></svg></div>
        <div style="flex:1"><b style="display:block;font-size:14px">Martin</b><span style="font-size:10.5px;color:var(--muted)">lokální AI asistent</span></div>
        <div id="chatClose" style="cursor:pointer;color:#fff;font-size:18px">✕</div>
      </div>
      <div id="chatMessages" style="flex:1;overflow-y:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px"></div>
      <div style="display:flex;gap:8px;padding:12px 16px calc(12px + env(safe-area-inset-bottom));border-top:1px solid var(--line)">
        <input id="chatInput" placeholder="Zeptej se na cokoli o stavbě…" style="flex:1;border:1px solid var(--line);background:rgba(255,255,255,.03);color:#fff;padding:10px 12px;font:inherit;font-size:13px;outline:none"/>
        <button id="chatSend" style="width:40px;height:40px;border:1px solid #b34cff;background:rgba(179,76,255,.1);color:#b34cff;cursor:pointer">→</button>
      </div>
    `;
    document.body.appendChild(overlay);
    const messages = overlay.querySelector('#chatMessages');
    function addMsg(text, who){
      const b = document.createElement('div');
      b.style.cssText = `max-width:80%;padding:9px 12px;font-size:12.5px;line-height:1.4;${who==='me' ? 'align-self:flex-end;background:rgba(179,76,255,.15);color:#fff' : 'align-self:flex-start;background:rgba(255,255,255,.05);color:#dfe4f5'}`;
      b.textContent = text;
      messages.appendChild(b);
      messages.scrollTop = messages.scrollHeight;
    }
    addMsg('Ahoj! Zeptej se mě na cokoliv o vaší stavbě - peníze, fotky, etapu nebo den stavby.', 'martin');
    overlay.querySelector('#chatClose').addEventListener('click', ()=> document.body.removeChild(overlay));
    function send(){
      const input = overlay.querySelector('#chatInput');
      const text = input.value.trim(); if(!text) return;
      addMsg(text, 'me'); input.value='';
      setTimeout(()=> addMsg(martinReply(text, p), 'martin'), 300);
    }
    overlay.querySelector('#chatSend').addEventListener('click', send);
    overlay.querySelector('#chatInput').addEventListener('keydown', e=>{ if(e.key==='Enter') send(); });
  }

  return { render };
})();

Router.register('dashboard', DashboardScreen);
