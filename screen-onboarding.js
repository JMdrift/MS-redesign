/* ==========================================================
   ONBOARDING - uvodni slidy + zalozeni projektu (prvniho i dalsiho)
   ========================================================== */
const OnboardingScreen = (function(){
  const slides = [
    { color:'#b34cff', title:'Sleduj svou stavbu', text:'Den stavby, aktuální etapa a přehled financí na jednom místě.' },
    { color:'#25e8ff', title:'Etapy, deník i finance', text:'Procházej etapami, zapisuj do deníku a sleduj výdaje podle etapy i za celý projekt.' },
    { color:'#ffd35c', title:'Rychlé přidání kdekoli', text:'Prostřední tlačítko dole je vždycky po ruce - zápis, výdaj, událost i fotka bez hledání záložky.' },
  ];

  function render(container){
    let i = 0;
    function draw(){
      const s = slides[i];
      container.innerHTML = `
        <div style="display:flex;justify-content:flex-end;padding:calc(14px + env(safe-area-inset-top)) 16px 4px">
          <div id="skipBtn" style="font-size:12.5px;color:var(--muted);font-weight:700;cursor:pointer">Přeskočit</div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px 30px;text-align:center">
          <div style="width:96px;height:96px;border:1px solid ${s.color};color:${s.color};display:grid;place-items:center;margin-bottom:28px;filter:drop-shadow(0 0 14px ${s.color})">
            <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
          </div>
          <h2 style="margin:0 0 12px;font-size:21px">${s.title}</h2>
          <p style="margin:0;font-size:13.5px;color:var(--muted);line-height:1.6;max-width:280px">${s.text}</p>
        </div>
        <div style="padding:8px 24px calc(24px + env(safe-area-inset-bottom))">
          <div style="display:flex;justify-content:center;gap:7px;margin-bottom:20px">
            ${slides.map((_,idx)=>`<i style="width:${idx===i?18:6}px;height:6px;background:${idx===i?'#b34cff':'var(--line)'};display:inline-block;transition:width .2s"></i>`).join('')}
          </div>
          <button class="btn-primary" id="nextBtn" style="background:linear-gradient(90deg,#25e8ff,#b34cff);color:#04070f;border:0">${i===slides.length-1?'Pokračovat':'Další'}</button>
        </div>
      `;
      container.querySelector('#skipBtn').addEventListener('click', ()=> Router.go('onboarding-project'));
      container.querySelector('#nextBtn').addEventListener('click', ()=>{
        if(i < slides.length-1){ i++; draw(); } else { Router.go('onboarding-project'); }
      });
    }
    draw();
    return { showNav:false };
  }
  return { render };
})();
Router.register('onboarding', OnboardingScreen);


const OnboardingProjectScreen = (function(){
  const TYPES = ['Rodinný dům','Chata','Byt / rekonstrukce','Komerční objekt','Jiné'];

  function render(container){
    const isAdditional = msLoadProjects().length > 0;
    let selectedType = null;

    container.innerHTML = `
      <div style="padding:calc(14px + env(safe-area-inset-top)) 16px 6px">
        <p style="font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);font-weight:800;margin:0 0 4px">${isAdditional?'Nový projekt':'Poslední krok'}</p>
        <h1 style="margin:0;font-size:21px">${isAdditional?'Založ další projekt':'Založ svůj první projekt'}</h1>
        <p style="margin:8px 0 0;font-size:12px;color:var(--muted);line-height:1.5">${isAdditional?'Vyplň základní údaje o dalším projektu.':'Appka bez projektu neví, co má sledovat. Další projekty pak přidáš kdykoliv v nastavení.'}</p>
      </div>
      <div class="screen-scroll">
        <div class="field-block"><p class="f-label">Název projektu *</p><input class="f-input" id="fName" placeholder="Např. Rodinný dům"/></div>
        <div class="field-block">
          <p class="f-label">Typ stavby *</p>
          <div id="typeGrid" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
            ${TYPES.map(t=>`<div class="type-card" data-type="${t}" style="border:1px solid var(--line);padding:12px 10px;text-align:center;cursor:pointer;border-radius:3px;font-size:11.5px;font-weight:700;${t==='Jiné'?'grid-column:1/-1':''}">${t}</div>`).join('')}
          </div>
        </div>
        <div class="field-block"><p class="f-label">Místo stavby *</p><input class="f-input" id="fLocation" placeholder="Např. Malé Březno u Mostu"/></div>
      </div>
      <div style="padding:12px 16px calc(20px + env(safe-area-inset-bottom))">
        <button class="btn-primary" id="continueBtn" style="background:linear-gradient(90deg,#25e8ff,#b34cff);color:#04070f;border:0">${isAdditional?'Vytvořit projekt':'Vytvořit projekt a spustit appku'}</button>
        ${isAdditional?'<p style="text-align:center;font-size:11px;color:var(--muted);margin-top:8px;text-decoration:underline;cursor:pointer" id="cancelLink">Zrušit a vrátit se do nastavení</p>':''}
      </div>
    `;

    container.querySelectorAll('.type-card').forEach(card=>{
      card.addEventListener('click', ()=>{
        selectedType = card.dataset.type;
        container.querySelectorAll('.type-card').forEach(c=>{ c.style.borderColor='var(--line)'; c.style.background='transparent'; c.style.color=''; });
        card.style.borderColor = '#b34cff'; card.style.background = 'rgba(179,76,255,.08)';
      });
    });
    if(isAdditional){
      container.querySelector('#cancelLink').addEventListener('click', ()=> Router.go('settings'));
    }
    container.querySelector('#continueBtn').addEventListener('click', ()=>{
      const name = container.querySelector('#fName').value.trim();
      const location_ = container.querySelector('#fLocation').value.trim();
      if(!name || !selectedType || !location_){
        alert('Vyplň prosím název projektu, typ stavby a místo.');
        return;
      }
      msCreateProject({ name, type:selectedType, location:location_ });
      msSetOnboarded();
      Router.go(isAdditional ? 'settings' : 'dashboard');
    });

    return { showNav:false };
  }
  return { render };
})();
Router.register('onboarding-project', OnboardingProjectScreen);
