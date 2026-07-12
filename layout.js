/* ==========================================================
   LAYOUT
   Vsechno, co je spolecne pro (skoro) kazdou obrazovku, na
   jednom miste: spodni navigace, radialni rychle pridani a
   potvrzovaci dialog (nahrazuje prohlizecovy confirm() - stejny
   vzhled a chovani uplne vsude, misto ruzneho confirm() textu
   kopirovaneho do kazde obrazovky zvlast).
   ========================================================== */
const Layout = (function(){
  const nav = document.getElementById('bottom-nav');

  nav.querySelectorAll('.nav-item[data-route]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      setQaOpen(false);
      Router.go(btn.dataset.route);
    });
  });

  function applyNav(activeTab, show){
    nav.hidden = !show;
    nav.querySelectorAll('.nav-item[data-route]').forEach(btn=>{
      btn.classList.toggle('active', btn.dataset.route === activeTab);
    });
  }

  /* ---------- rychle pridani (radialni menu) ---------- */
  const qaBackdrop = document.getElementById('quick-add-backdrop');
  const qaRadial = document.getElementById('quick-add-radial');
  const qaSats = [...qaRadial.querySelectorAll('.qa-sat')];
  const R = 98, ANGLES = [-72,-24,24,72];
  qaSats.forEach((el,i)=>{
    const rad = ANGLES[i] * Math.PI/180;
    el.style.setProperty('--tx', (R*Math.sin(rad)) + 'px');
    el.style.setProperty('--ty', (-R*Math.cos(rad)) + 'px');
    el.style.transitionDelay = (i*0.03) + 's';
  });
  let qaOpen = false;
  function setQaOpen(v){
    qaOpen = v;
    qaBackdrop.hidden = false; qaRadial.hidden = false;
    qaBackdrop.classList.toggle('open', v);
    qaRadial.classList.toggle('open', v);
    qaSats.forEach(el=>{
      el.style.transform = v
        ? 'translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(1)'
        : 'translate(-50%,-50%) scale(.3)';
    });
  }
  document.getElementById('navAddBtn').addEventListener('click', ()=> setQaOpen(!qaOpen));
  qaBackdrop.addEventListener('click', ()=> setQaOpen(false));
  qaSats.forEach(el=>{
    el.addEventListener('click', ()=>{
      setQaOpen(false);
      Router.go(el.dataset.target);
    });
  });

  /* ---------- potvrzovaci dialog (misto prohlizeoveho confirm()) ---------- */
  const confirmOverlay = document.getElementById('confirm-overlay');
  const confirmMessage = document.getElementById('confirm-message');
  const confirmOkBtn = document.getElementById('confirm-ok-btn');
  const confirmCancelBtn = document.getElementById('confirm-cancel-btn');

  function confirmDialog(message, okLabel){
    return new Promise(resolve=>{
      confirmMessage.textContent = message;
      confirmOkBtn.textContent = okLabel || 'Potvrdit';
      confirmOverlay.classList.add('open');
      function cleanup(result){
        confirmOverlay.classList.remove('open');
        confirmOkBtn.removeEventListener('click', onOk);
        confirmCancelBtn.removeEventListener('click', onCancel);
        resolve(result);
      }
      function onOk(){ cleanup(true); }
      function onCancel(){ cleanup(false); }
      confirmOkBtn.addEventListener('click', onOk);
      confirmCancelBtn.addEventListener('click', onCancel);
    });
  }

  function getTheme(){ return localStorage.getItem('ms_theme_v1') || 'neon'; }
  function applyTheme(theme){
    const root = document.documentElement;
    if(theme === 'sketch'){ root.setAttribute('data-theme', 'sketch'); }
    else { root.removeAttribute('data-theme'); }
    localStorage.setItem('ms_theme_v1', theme);
  }

  return { applyNav, confirmDialog, closeQuickAdd(){ setQaOpen(false); }, getTheme, applyTheme };
})();
