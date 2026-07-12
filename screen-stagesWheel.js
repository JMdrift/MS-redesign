/* ==========================================================
   ETAPY - kolo (karusel)
   ========================================================== */
const StagesWheelScreen = (function(){
  function render(container){
    const stages = msSelectedStages();
    const N = stages.length;
    let pos = Math.max(0, stages.findIndex(s=>s.key===msGetCurrentStage()));

    container.innerHTML = `
      <div class="topbar">
        <div>
          <b style="display:block;font-size:18px" id="hProjName">Projekt</b>
          <span style="display:block;font-size:11.5px;color:var(--muted)" id="hProjLoc"></span>
        </div>
        <div style="flex:1"></div>
        <div class="icon-btn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg></div>
        <div class="icon-btn" onclick="Router.go('settings')"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.6 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09c0 .68.39 1.28 1 1.51.66.26 1.42.12 1.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06c-.45.4-.59 1.16-.33 1.82.23.61.83 1 1.51 1H21a2 2 0 010 4h-.09c-.68 0-1.28.39-1.51 1z"/></svg></div>
      </div>
      <div class="screen-scroll">
        <h1 style="font-size:26px;margin:4px 0 14px">Etapy</h1>
        <div id="wheelArea"></div>
        <div id="emptyWheel" style="display:none;margin:20px 0;padding:26px 20px;text-align:center;border:1px dashed var(--line);cursor:pointer">
          <div style="width:44px;height:44px;border:1px solid var(--accent);color:var(--accent);margin:0 auto 12px;display:grid;place-items:center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          </div>
          <b style="display:block;font-size:15px;margin-bottom:6px">Přidat etapu</b>
          <span style="font-size:11.5px;color:var(--muted);line-height:1.5">Zatím nemáš vybranou žádnou etapu - přidej první, se kterou chceš začít.</span>
        </div>
        <div id="centerCardWrap"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px">
          <div class="btn-ghost" style="cursor:pointer;text-align:left;padding:12px" id="listBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            <b style="display:block;margin-top:6px;color:#fff;font-size:13px">Přehled etap</b><span style="font-size:10.5px">Všechny etapy přehledně</span>
          </div>
          <div class="btn-ghost" style="cursor:pointer;text-align:left;padding:12px" id="newStageBtn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
            <b style="display:block;margin-top:6px;color:#fff;font-size:13px">Nová etapa</b><span style="font-size:10.5px">Vytvořit novou etapu</span>
          </div>
        </div>
      </div>
    `;

    const projects = msLoadProjects();
    const active = projects.find(p=>p.id===msGetActiveProjectId()) || projects[0];
    if(active){
      container.querySelector('#hProjName').textContent = active.name;
      container.querySelector('#hProjLoc').textContent = active.location||'';
    }

    container.querySelector('#listBtn').addEventListener('click', ()=> Router.go('stages-list'));
    container.querySelector('#newStageBtn').addEventListener('click', ()=> Router.go('new-stage'));

    if(N===0){
      container.querySelector('#emptyWheel').style.display = 'block';
      container.querySelector('#emptyWheel').addEventListener('click', ()=> Router.go('new-stage'));
      return { activeTab:'stages' };
    }

    renderWheelArea();
    renderCenterCard();

    function renderWheelArea(){
      const wrap = container.querySelector('#wheelArea');
      const CARD_W = 96;
      wrap.innerHTML = `
        <div style="position:relative">
          <div id="wheelSpotlight" style="position:absolute;top:0;bottom:0;left:50%;width:${CARD_W+16}px;margin-left:${-(CARD_W+16)/2}px;
            background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.01));border-left:1px solid var(--line);border-right:1px solid var(--line);
            pointer-events:none;z-index:0;border-radius:6px"></div>
          <div style="display:flex;gap:8px;overflow-x:auto;padding:6px calc(50% - ${CARD_W/2}px) 16px;scroll-snap-type:x mandatory;position:relative;z-index:1" id="wheelScroll"></div>
        </div>
      `;
      const scroll = wrap.querySelector('#wheelScroll');
      stages.forEach((s,i)=>{
        const card = document.createElement('div');
        card.dataset.i = i;
        const isCurrentStage = msGetCurrentStage() === s.key;
        card.style.cssText = `flex:0 0 auto;width:${CARD_W}px;height:130px;border:1px solid color-mix(in srgb, ${s.color} 45%, var(--line));
          background:color-mix(in srgb, ${s.color} 7%, var(--card-bg-2));display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;
          cursor:pointer;color:${s.color};scroll-snap-align:center;transition:transform .2s ease, opacity .2s ease, box-shadow .2s ease;position:relative`;
        card.innerHTML = `${isCurrentStage?'<span style="position:absolute;top:8px;left:50%;transform:translateX(-50%);font-size:7.5px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;border:1px solid currentColor;padding:2px 6px;white-space:nowrap">Aktuální</span>':''}${msStageIconSvg(s.key, 30)}<b style="font-size:11px;color:#e7e9fb;text-align:center;padding:0 5px">${s.name}</b>`;
        card.addEventListener('click', ()=>{
          if(i===pos){ Router.go('stage-detail', {key:s.key}); }
          else { pos = i; scrollToCard(i, true); renderCenterCard(); }
        });
        scroll.appendChild(card);
      });

      function applyDepthEffect(){
        const rect = scroll.getBoundingClientRect();
        const center = rect.left + rect.width/2;
        [...scroll.children].forEach(card=>{
          const cr = card.getBoundingClientRect();
          const cardCenter = cr.left + cr.width/2;
          const dist = Math.abs(cardCenter - center);
          const norm = Math.min(1, dist / (rect.width/2));
          const scale = 1 - norm*0.16;
          const opacity = 1 - norm*0.55;
          card.style.transform = `scale(${scale.toFixed(3)})`;
          card.style.opacity = opacity.toFixed(2);
          card.style.boxShadow = norm < 0.15 ? `0 0 16px color-mix(in srgb, ${stages[card.dataset.i].color} 35%, transparent)` : 'none';
        });
      }
      let scrollTimeout;
      scroll.addEventListener('scroll', ()=>{
        applyDepthEffect();
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(()=>{
          // po doscrollovani zjisti, ktera karta je nejblize stredu, a udelej z ni "pos"
          const rect = scroll.getBoundingClientRect();
          const center = rect.left + rect.width/2;
          let closest = 0, closestDist = Infinity;
          [...scroll.children].forEach((card,i)=>{
            const cr = card.getBoundingClientRect();
            const d = Math.abs((cr.left+cr.width/2) - center);
            if(d < closestDist){ closestDist = d; closest = i; }
          });
          if(closest !== pos){ pos = closest; renderCenterCard(); }
        }, 120);
      }, {passive:true});

      function scrollToCard(i, smooth){
        const card = scroll.children[i];
        if(!card) return;
        const target = card.offsetLeft - (scroll.clientWidth - card.clientWidth)/2;
        scroll.scrollTo({ left: target, behavior: smooth ? 'smooth' : 'auto' });
      }
      requestAnimationFrame(()=>{ scrollToCard(pos, false); applyDepthEffect(); });
    }

    function renderCenterCard(){
      const s = stages[pos];
      const stats = msStageStats(s.key);
      const isCur = msGetCurrentStage() === s.key;
      const isClosed = msIsStageClosed(s.key);
      const wrap = container.querySelector('#centerCardWrap');
      wrap.innerHTML = `
        <div id="ccBox" style="position:relative;border-radius:var(--radius);border:1px solid ${s.color};background:color-mix(in srgb, ${s.color} 6%, var(--card-bg));padding:14px;color:${s.color};
          box-shadow:0 0 18px color-mix(in srgb, ${s.color} 30%, transparent);transition:box-shadow .5s ease">
          <div id="cornerCur" style="position:absolute;top:9px;left:9px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;${isCur?'':'color:var(--muted)'}">
            <div style="width:20px;height:20px;border-radius:3px;border:1px solid currentColor;display:grid;place-items:center;${isCur?'background:rgba(255,255,255,.06)':''}">
              ${isCur?'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>':''}
            </div>
            <span style="font-size:7.5px;font-weight:800;text-transform:uppercase">Aktuální</span>
          </div>
          <div id="cornerClosed" style="position:absolute;top:9px;right:9px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;${isClosed?'':'color:var(--muted)'}">
            <div style="width:20px;height:20px;border-radius:3px;border:1px solid currentColor;display:grid;place-items:center;${isClosed?'background:rgba(255,255,255,.06)':''}">
              ${isClosed?'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>':''}
            </div>
            <span style="font-size:7.5px;font-weight:800;text-transform:uppercase">${isClosed?'Ukončeno':'Ukončit'}</span>
          </div>
          <div style="text-align:center;padding-top:10px">
            <div style="width:46px;height:46px;border-radius:var(--radius);background:color-mix(in srgb, ${s.color} 10%, transparent);border:1px solid currentColor;display:grid;place-items:center;margin:0 auto 6px;filter:drop-shadow(0 0 6px currentColor)">
              ${msStageIconSvg(s.key, 26)}
            </div>
            <h2 style="margin:0;font-size:16px;color:#fff">${s.name}</h2>
            <p style="display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px;margin:2px 0 0"><i style="width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block;box-shadow:0 0 6px currentColor"></i>${msStageStatusLabel(s.key)}</p>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:8px;padding:7px 10px;border-radius:var(--radius);border:1px solid var(--line);background:var(--card-bg)">
            <span style="font-size:10.5px;color:var(--muted);font-weight:700">Utraceno v etapě</span><b style="font-size:14px;color:currentColor">${stats.spent.toLocaleString('cs-CZ')} Kč</b>
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0">
            ${[['photos','foto'],['documents','dok.'],['diary','zápisů'],['expensesCount','výdajů']].map(([k,label])=>`
              <div style="border-radius:var(--radius);border:1px solid var(--line);background:var(--card-bg);padding:6px;text-align:center"><b style="display:block;font-size:12px;color:#fff">${stats[k]}</b><span style="font-size:8px;color:var(--muted)">${label}</span></div>
            `).join('')}
          </div>
          <button id="openBtn" style="width:100%;border-radius:var(--radius);border:1px solid currentColor;background:rgba(255,255,255,.03);color:currentColor;font-weight:800;font-size:12.5px;padding:9px;cursor:pointer;filter:drop-shadow(0 0 5px currentColor)">Otevřít etapu →</button>
        </div>
      `;
      wrap.querySelector('#openBtn').addEventListener('click', ()=> Router.go('stage-detail', {key:s.key}));
      // pulz pri kazde zmene vyberu - kratke zvyrazneni ramecku
      const ccBox = wrap.querySelector('#ccBox');
      requestAnimationFrame(()=>{
        ccBox.style.boxShadow = `0 0 0 1px ${s.color}, 0 0 30px color-mix(in srgb, ${s.color} 70%, transparent)`;
        setTimeout(()=>{ ccBox.style.boxShadow = `0 0 18px color-mix(in srgb, ${s.color} 30%, transparent)`; }, 320);
      });
      wrap.querySelector('#cornerCur').addEventListener('click', async ()=>{
        if(msGetCurrentStage()===s.key) return;
        if(!await Layout.confirmDialog(`Nastavit "${s.name}" jako aktuální etapu?`, 'Nastavit')) return;
        msSetCurrentStage(s.key);
        renderCenterCard();
      });
      wrap.querySelector('#cornerClosed').addEventListener('click', async ()=>{
        const closed = msIsStageClosed(s.key);
        const msg = closed ? `Znovu otevřít etapu "${s.name}"?` : `Uzavřít etapu "${s.name}"? Bude označená jako dokončená, dál se do ní dá cokoliv přidávat. Jde to kdykoliv vzít zpět.`;
        if(!await Layout.confirmDialog(msg, closed?'Otevřít':'Uzavřít')) return;
        msSetStageClosed(s.key, !closed);
        renderCenterCard();
      });
    }

    return { activeTab:'stages' };
  }
  return { render };
})();
Router.register('stages', StagesWheelScreen);
