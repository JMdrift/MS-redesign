/* ==========================================================
   NASTAVENI
   ========================================================== */
const SettingsScreen = (function(){
  function render(container){
    container.innerHTML = `
      <div class="topbar">
        <div class="back-btn" id="backBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></div>
        <h1>Nastavení</h1>
      </div>
      <div class="screen-scroll">
        <p class="section-label" style="margin-top:4px">Projekty</p>
        <div id="projectsCard" style="border:1px solid var(--line)"></div>

        <p class="section-label">Předvolby</p>
        <div style="border:1px solid var(--line);margin-bottom:14px">
          <div style="padding:12px">
            <b style="display:block;font-size:12.5px;margin-bottom:9px">Motiv appky</b>
            <div id="themeSeg" style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
              <button data-theme="neon" style="height:38px;border:1px solid var(--line);background:transparent;color:#dfe4f5;font-size:11.5px;font-weight:700;cursor:pointer">Neon</button>
              <button data-theme="sketch" style="height:38px;border:1px solid var(--line);background:transparent;color:#dfe4f5;font-size:11.5px;font-weight:700;cursor:pointer">Skica</button>
            </div>
          </div>
        </div>
        <div style="border:1px solid var(--line)">
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px">
            <div><b style="display:block;font-size:12.5px">Oznámení</b><span id="notifStatus" style="font-size:10.5px;color:var(--muted)">Posílat události přímo jako notifikaci</span></div>
            <div id="notifSwitch" style="width:38px;height:22px;border-radius:11px;border:1px solid var(--line);position:relative;cursor:pointer"><i style="position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:var(--muted)"></i></div>
          </div>
        </div>

        <p class="section-label">Zálohování dat</p>
        <div style="border:1px solid var(--line)">
          <div class="row-item" id="rowExport" style="padding:12px;cursor:pointer;border-bottom:1px solid var(--line)"><b style="font-size:12.5px">Exportovat zálohu</b><span style="display:block;font-size:10.5px;color:var(--muted)">Stáhne všechna data appky jako soubor</span></div>
          <div class="row-item" id="rowImport" style="padding:12px;cursor:pointer"><b style="font-size:12.5px">Obnovit ze zálohy</b><span style="display:block;font-size:10.5px;color:var(--muted)">Nahraje dříve stažený soubor</span></div>
          <input type="file" id="importFile" accept="application/json" style="display:none"/>
        </div>

        <p class="section-label">Generátory a export</p>
        <div style="border:1px solid var(--line)">
          <div class="row-item soon" style="padding:12px;border-bottom:1px solid var(--line)"><b style="font-size:12.5px">Generátor vzpomínkové knihy</b><span style="display:block;font-size:10.5px;color:var(--muted)">Připravujeme</span></div>
          <div class="row-item soon" style="padding:12px;border-bottom:1px solid var(--line)"><b style="font-size:12.5px">Podklady pro banku</b><span style="display:block;font-size:10.5px;color:var(--muted)">Připravujeme</span></div>
          <div class="row-item soon" style="padding:12px"><b style="font-size:12.5px">Sdílení informací</b><span style="display:block;font-size:10.5px;color:var(--muted)">Připravujeme</span></div>
        </div>

        <p class="section-label">Podpora</p>
        <div style="border:1px solid var(--line)">
          <div class="row-item soon" style="padding:12px;border-bottom:1px solid var(--line)"><b style="font-size:12.5px">Nápověda a podpora</b><span style="display:block;font-size:10.5px;color:var(--muted)">Připravujeme</span></div>
          <div class="row-item" id="rowDeleteAll" style="padding:12px;cursor:pointer;color:#ff7a86"><b style="font-size:12.5px">Smazat všechna data appky</b><span style="display:block;font-size:10.5px;color:var(--muted)">Nevratné</span></div>
        </div>

        <p class="section-label">O aplikaci</p>
        <div style="border:1px solid var(--line);padding:16px;text-align:center">
          <b style="display:block;font-size:14px">Moje Stavba</b>
          <span style="font-size:11px;color:var(--muted)">Verze 1.0 (nová architektura)</span>
        </div>
      </div>
    `;
    container.querySelector('#backBtn').addEventListener('click', ()=> Router.back());

    function renderProjects(){
      const wrap = container.querySelector('#projectsCard');
      const projects = msLoadProjects();
      const activeId = msGetActiveProjectId();
      wrap.innerHTML = projects.map(p=>`
        <div class="proj-row" data-id="${p.id}" style="display:flex;align-items:center;gap:10px;padding:11px 12px;border-bottom:1px solid var(--line);cursor:pointer">
          <div style="width:8px;height:8px;border-radius:50%;background:${p.currentStage?p.currentStage.color:'#94a0bc'}"></div>
          <div style="flex:1;min-width:0"><b style="display:block;font-size:13px">${p.name}</b><span style="font-size:10.5px;color:var(--muted)">${p.type?p.type+' · ':''}${p.location||''}</span></div>
          ${p.id===activeId?'<span style="font-size:8.5px;font-weight:800;color:var(--accent);border:1px solid var(--accent);padding:2px 5px">Aktivní</span>':''}
          <span class="edit-btn" data-id="${p.id}" style="font-size:11px;color:#25b7ff;font-weight:700">Upravit</span>
        </div>
      `).join('') + `<div id="addProjectRow" style="display:flex;align-items:center;gap:8px;padding:12px;color:#b34cff;font-size:12.5px;font-weight:800;cursor:pointer">+ Přidat projekt</div>`;

      wrap.querySelectorAll('.proj-row').forEach(row=>{
        row.addEventListener('click', (e)=>{
          if(e.target.closest('.edit-btn')) return;
          msSetActiveProjectId(row.dataset.id);
          renderProjects();
        });
      });
      wrap.querySelectorAll('.edit-btn').forEach(btn=>{
        btn.addEventListener('click', (e)=>{
          e.stopPropagation();
          const p = projects.find(x=>x.id===btn.dataset.id);
          const name = prompt('Název projektu:', p.name);
          if(name===null) return;
          const loc = prompt('Místo stavby:', p.location||'');
          if(loc===null) return;
          msUpdateProject(p.id, {name:name.trim()||p.name, location:loc.trim()});
          renderProjects();
        });
      });
      wrap.querySelector('#addProjectRow').addEventListener('click', ()=> Router.go('onboarding-project'));
    }
    renderProjects();

    // motiv appky
    const themeButtons = container.querySelectorAll('#themeSeg button');
    function refreshThemeButtons(){
      const active = Layout.getTheme();
      themeButtons.forEach(b=>{
        const isActive = b.dataset.theme === active;
        b.style.borderColor = isActive ? 'var(--accent)' : 'var(--line)';
        b.style.color = isActive ? 'var(--accent)' : '#dfe4f5';
        b.style.background = isActive ? 'color-mix(in srgb, var(--accent) 8%, transparent)' : 'transparent';
      });
    }
    themeButtons.forEach(b=>{
      b.addEventListener('click', ()=>{
        Layout.applyTheme(b.dataset.theme);
        refreshThemeButtons();
      });
    });
    refreshThemeButtons();

    // notifikace
    const notifSwitch = container.querySelector('#notifSwitch');
    const notifStatus = container.querySelector('#notifStatus');
    const NOTIF_KEY = 'ms_notifications_enabled_v1';
    function refreshNotif(){
      const enabled = localStorage.getItem(NOTIF_KEY)==='1' && (typeof Notification!=='undefined' && Notification.permission==='granted');
      notifSwitch.style.borderColor = enabled ? '#4dffab' : 'var(--line)';
      notifSwitch.querySelector('i').style.left = enabled ? '18px' : '2px';
      notifSwitch.querySelector('i').style.background = enabled ? '#4dffab' : 'var(--muted)';
      if(typeof Notification==='undefined') notifStatus.textContent = 'Tento prohlížeč oznámení nepodporuje';
      else if(Notification.permission==='denied') notifStatus.textContent = 'Zablokováno v nastavení prohlížeče';
      else if(enabled) notifStatus.textContent = 'Zapnuto';
      else notifStatus.textContent = 'Posílat události přímo jako notifikaci';
    }
    notifSwitch.addEventListener('click', async ()=>{
      if(typeof Notification==='undefined'){ alert('Prohlížeč oznámení nepodporuje.'); return; }
      if(localStorage.getItem(NOTIF_KEY)==='1'){ localStorage.setItem(NOTIF_KEY,'0'); refreshNotif(); return; }
      const perm = await Notification.requestPermission();
      if(perm==='granted'){ localStorage.setItem(NOTIF_KEY,'1'); new Notification('Moje Stavba', {body:'Oznámení jsou zapnutá.'}); }
      refreshNotif();
    });
    refreshNotif();

    // zaloha
    container.querySelector('#rowExport').addEventListener('click', ()=>{
      const data = {};
      for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.startsWith('ms_')) data[k]=localStorage.getItem(k); }
      const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href=url; a.download='moje-stavba-zaloha-'+new Date().toISOString().slice(0,10)+'.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    });
    container.querySelector('#rowImport').addEventListener('click', ()=> container.querySelector('#importFile').click());
    container.querySelector('#importFile').addEventListener('change', (e)=>{
      const file = e.target.files[0]; if(!file) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        try{
          const data = JSON.parse(reader.result);
          Object.keys(data).forEach(k=>{ if(k.startsWith('ms_')) localStorage.setItem(k, data[k]); });
          alert('Záloha byla obnovena.');
          Router.go('dashboard');
        }catch(err){ alert('Tenhle soubor se nepodařilo přečíst jako zálohu.'); }
      };
      reader.readAsText(file);
    });

    container.querySelector('#rowDeleteAll').addEventListener('click', async ()=>{
      if(!await Layout.confirmDialog('Opravdu smazat úplně všechna data appky? Tohle je nevratné.', 'Smazat vše')) return;
      const keys = [];
      for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); if(k&&k.startsWith('ms_')) keys.push(k); }
      keys.forEach(k=>localStorage.removeItem(k));
      Router.go('onboarding');
    });

    return { activeTab:'', showNav:true };
  }
  return { render };
})();
Router.register('settings', SettingsScreen);
