/* ==========================================================
   MAIN - spusti se jako posledni, az jsou zaregistrovane vsechny
   obrazovky. Rozhodne, jestli appka bude ukazovat onboarding
   (prvni spusteni / bez projektu), nebo rovnou dashboard.
   ========================================================== */
(function(){
  Layout.applyTheme(Layout.getTheme());

  // Safari na iPhonu umi dynamickou adresni listu, ktera meni skutecne
  // viditelnou vysku obrazovky, aniz by se to vzdy spravne promitlo do
  // CSS position:fixed;inset:0. Radeji si vysku hlidame sami a natvrdo
  // ji appce nastavime - takhle mame jistotu, ze menu je vzdy skutecne
  // dole, ne "nekde v cerne plose".
  function fixShellHeight(){
    const shell = document.getElementById('app-shell');
    if(!shell) return;
    const h = (window.visualViewport && window.visualViewport.height) || window.innerHeight;
    shell.style.height = h + 'px';
  }
  fixShellHeight();
  window.addEventListener('resize', fixShellHeight);
  window.addEventListener('orientationchange', ()=> setTimeout(fixShellHeight, 100));
  if(window.visualViewport) window.visualViewport.addEventListener('resize', fixShellHeight);

  if(!msHasOnboarded() || msLoadProjects().length===0){
    if(!location.hash || location.hash === '#/dashboard'){
      location.hash = '#/onboarding';
    }
  }
  Router.renderCurrent();
})();
