/* ============================================================
   MOJE STAVBA — sdílená data (fotky, deník, dokumenty, výdaje)
   Jeden zdroj pravdy pro Detail etapy, Galerii, Deník a Finance.
   Ukládá se do localStorage, takže se dá přidávat/mazat a zůstane
   to uložené i po zavření appky (funguje ale jen přes lokální
   server, ne přes dvojklik na soubor - viz README).
   ============================================================ */

const MS_STAGES = [
  {key:'pozemek',   name:'Pozemek',          color:'#4dffab'},
  {key:'projekt_povoleni', name:'Projekt a povolení', color:'#b34cff'},
  {key:'zahrada',   name:'Zahrada',          color:'#4dffab'},
  {key:'zaklady',   name:'Základy',          color:'#b34cff'},
  {key:'zemni',     name:'Zemní práce',      color:'#25e8ff'},
  {key:'hruba',     name:'Hrubá stavba',     color:'#ff5e7b'},
  {key:'strecha',   name:'Střecha',          color:'#ff9b32'},
  {key:'okna',      name:'Okna a dveře',     color:'#25b7ff'},
  {key:'elektro',   name:'Elektro',          color:'#ffd35c'},
  {key:'voda',      name:'Voda/kanalizace',  color:'#25e8ff'},
  {key:'vytapeni',  name:'Vytápění',         color:'#ff5e7b'},
  {key:'zatepleni', name:'Zateplení a fasáda', color:'#25b7ff'},
  {key:'interier',  name:'Interiér (omítky)', color:'#ffd35c'},
  {key:'koupelna',  name:'Koupelna',         color:'#25e8ff'},
  {key:'kuchyne',   name:'Kuchyně',          color:'#ff9b32'},
  {key:'naradi',    name:'Nářadí',           color:'#ff5e7b'},
  {key:'chytra_domacnost', name:'Chytrá domácnost', color:'#ffd35c'},
  {key:'rekuperace', name:'Rekuperace',      color:'#4dffab'},
  {key:'posledni_upravy', name:'Poslední úpravy', color:'#b34cff'},
  {key:'plot',      name:'Plot',             color:'#4dffab'},
];
function msStageByKey(key){ return MS_STAGES.find(s=>s.key===key) || msCustomStages().find(s=>s.key===key); }

/* ============================================================
   VLASTNÍ ETAPY (uzivatel si muze vytvorit i neco mimo katalog)
   ============================================================ */
const MS_CUSTOM_STAGES_KEY = 'ms_custom_stages_v1';
function msCustomStages(){
  try{
    const raw = localStorage.getItem(MS_CUSTOM_STAGES_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return [];
}
function msSaveCustomStages(list){ msSave(MS_CUSTOM_STAGES_KEY, list); }
// katalog k vyberu v "Nova etapa" = vestavenych 9 + vlastni, ktere si uzivatel jiz vytvoril
function msStageCatalog(){ return [...MS_STAGES, ...msCustomStages()]; }
function msAddCustomStage(name, color){
  const list = msCustomStages();
  const stage = {key: msUid('custom_'), name, color, custom:true};
  list.push(stage);
  msSaveCustomStages(list);
  return stage;
}

/* ============================================================
   VYBRANÉ ETAPY (MS_STAGES je jen katalog možností; uživatel si
   vybere, které z nich se skutečně týkají jeho stavby - nulový
   stav = žádná vybraná, dokud si sám nepřidá)
   ============================================================ */
const MS_SELECTED_STAGES_KEY = 'ms_selected_stages_v1';
function msSelectedStageKeys(){
  try{
    const raw = localStorage.getItem(MS_SELECTED_STAGES_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return [];
}
function msSetSelectedStageKeys(keys){
  try{ localStorage.setItem(MS_SELECTED_STAGES_KEY, JSON.stringify(keys)); }catch(e){}
}
function msSelectedStages(){
  const keys = msSelectedStageKeys();
  return msStageCatalog().filter(s => keys.includes(s.key));
}
function msAddSelectedStage(key){
  const keys = msSelectedStageKeys();
  if(!keys.includes(key)){
    keys.push(key);
    msSetSelectedStageKeys(keys);
  }
}
function msRemoveSelectedStage(key){
  msSetSelectedStageKeys(msSelectedStageKeys().filter(k => k !== key));
}

const MS_KEYS = {
  photos: 'ms_photos_v1',
  diary: 'ms_diary_v1',
  documents: 'ms_documents_v1',
  expenses: 'ms_expenses_v1',
  events: 'ms_events_v1',
};

function msEvents(){ return msLoad(MS_KEYS.events, ()=>[]); }
function msAddEvent(ev){
  const list = msEvents();
  const withId = Object.assign({id: msUid('e')}, ev);
  list.push(withId);
  msSave(MS_KEYS.events, list);
  return withId;
}
function msDeleteEvent(id){ msSave(MS_KEYS.events, msEvents().filter(e=>e.id!==id)); }

function msUid(prefix){
  return prefix + Date.now() + Math.random().toString(36).slice(2, 8);
}

// gesto "zpet": tazeni prstem od leveho okraje displeje doprava (jako na iOS)
// - v HTML/webovem rozhrani to neni tak spolehlive jako v opravdove nativni
//   appce (prohlizec si to muze brat pro sve vlastni gesto), ale jako doplnek
//   k historii appky to funguje. Volá Router.back() - vlastni historie appky,
//   ne historii prohlizece (uz nejde o skutecne stranky).
(function swipeBack(){
  let startX = null, startY = null, startT = 0;
  const EDGE = 24; // px od leveho okraje, kde gesto muze zacit
  document.addEventListener('touchstart', (e)=>{
    if(e.touches.length !== 1) return;
    const t = e.touches[0];
    if(t.clientX <= EDGE){
      startX = t.clientX; startY = t.clientY; startT = Date.now();
    } else {
      startX = null;
    }
  }, {passive:true});
  document.addEventListener('touchend', (e)=>{
    if(startX === null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = Math.abs(t.clientY - startY);
    const dt = Date.now() - startT;
    if(dx > 70 && dy < 60 && dt < 600 && window.Router){
      Router.back();
    }
    startX = null;
  }, {passive:true});
})();

function msLoad(storageKey, seedFn){
  try{
    const raw = localStorage.getItem(storageKey);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  const seed = seedFn();
  try{ localStorage.setItem(storageKey, JSON.stringify(seed)); }catch(e){}
  return seed;
}
function msSave(storageKey, list){
  try{ localStorage.setItem(storageKey, JSON.stringify(list)); }catch(e){}
}

/* --- výchozí ukázková data --- */
function msSeedPhotos(){
  return [];
}
function msSeedDiary(){
  return [];
}
function msAddDiaryEntry(entry){
  const list = msDiary();
  const withId = Object.assign({id:msUid('d'), date: msTodayISO(), time: new Date().toTimeString().slice(0,5), author:'Stavebník'}, entry);
  list.push(withId);
  msSave(MS_KEYS.diary, list);
  return withId;
}
// vsechny zapisy serazene chronologicky (od nejstarsiho) s prirazenym poradovym cislem - napric etapami, jak to ma skutecny stavebni denik
function msDiaryNumbered(){
  const sorted = msDiary().slice().sort((a,b)=>{
    const da = a.date + ' ' + (a.time||'00:00');
    const db = b.date + ' ' + (b.time||'00:00');
    return da.localeCompare(db);
  });
  return sorted.map((e,i)=> Object.assign({}, e, {number: i+1}));
}

/* ============================================================
   METADATA PRO GENEROVANI STAVEBNIHO DENIKU (titulni strana)
   ============================================================ */
function msDiaryMeta(){
  return msLoad('ms_diary_meta_v1', ()=>({
    nazev:null, misto:null, stavebnik:null, projektant:null,
    dozor:null, parcela:null, katastr:null, povoleni:null
  }));
}
function msSetDiaryMeta(patch){
  const next = Object.assign({}, msDiaryMeta(), patch);
  msSave('ms_diary_meta_v1', next);
  return next;
}
function msSeedDocuments(){
  return [];
}
function msSeedExpenses(){
  return [];
}

function msPhotos(){ return msLoad(MS_KEYS.photos, msSeedPhotos); }
function msDiary(){ return msLoad(MS_KEYS.diary, msSeedDiary); }
function msDocuments(){ return msLoad(MS_KEYS.documents, msSeedDocuments); }
function msAddDocument(doc){
  const list = msDocuments();
  const withId = Object.assign({id:msUid('doc'), date: msTodayISO()}, doc);
  list.push(withId);
  msSave(MS_KEYS.documents, list);
  return withId;
}
function msDeleteDocument(id){
  msSave(MS_KEYS.documents, msDocuments().filter(d=>d.id!==id));
}
function msUpdateDocument(id, patch){
  const list = msDocuments();
  const idx = list.findIndex(d=>d.id===id);
  if(idx===-1) return null;
  list[idx] = Object.assign({}, list[idx], patch);
  msSave(MS_KEYS.documents, list);
  return list[idx];
}
function msExpenses(){ return msLoad(MS_KEYS.expenses, msSeedExpenses); }

/* --- pomocne funkce pro pocty a soucty podle etapy --- */
function msCountByStage(list, stageKey){ return list.filter(i=>i.stage===stageKey).length; }
function msSumExpensesByStage(stageKey){
  return msExpenses().filter(e=>e.stage===stageKey && e.type==='expense').reduce((sum,e)=>sum+Number(e.amount||0), 0);
}
function msTotalExpenses(){
  return msExpenses().filter(e=>e.type==='expense').reduce((s,e)=>s+Number(e.amount||0),0);
}
function msTotalIncome(){
  return msExpenses().filter(e=>e.type==='income').reduce((s,e)=>s+Number(e.amount||0),0);
}
function msBalance(){ return msTotalIncome() - msTotalExpenses(); }
function msMonthExpenses(){
  const now = new Date();
  const ym = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0');
  return msExpenses().filter(e=>e.type==='expense' && (e.date||'').startsWith(ym)).reduce((s,e)=>s+Number(e.amount||0),0);
}
function msAddTransaction(tx){
  const list = msExpenses();
  const withId = Object.assign({id:msUid('tx'), date: msTodayISO()}, tx);
  list.push(withId);
  msSave(MS_KEYS.expenses, list);
  return withId;
}
function msUpdateTransaction(id, patch){
  const list = msExpenses();
  const idx = list.findIndex(t=>t.id===id);
  if(idx===-1) return null;
  list[idx] = Object.assign({}, list[idx], patch);
  msSave(MS_KEYS.expenses, list);
  return list[idx];
}
function msDeleteTransaction(id){
  msSave(MS_KEYS.expenses, msExpenses().filter(t=>t.id!==id));
}
function msTransactionById(id){
  return msExpenses().find(t=>t.id===id);
}
function msStageStats(stageKey){
  return {
    photos: msCountByStage(msPhotos(), stageKey),
    documents: msCountByStage(msDocuments(), stageKey),
    diary: msCountByStage(msDiary(), stageKey),
    expensesCount: msExpenses().filter(e=>e.stage===stageKey && e.type==='expense').length,
    spent: msSumExpensesByStage(stageKey),
    important: msCountByStage(msImportant(), stageKey),
  };
}

/* ============================================================
   AKTUÁLNÍ ETAPA V ČASE
   - ktera etapa je prave "aktualni" (jen jedna v ramci projektu)
   - pro kazdou etapu si pamatujeme MNOZINU dnu, kdy byla aktualni
     (den se pocita, i kdyz byla aktualni treba jen minutu - proto
     mnozina dat, ne casovy rozsah)
   - "Zahajeno" = nejstarsi den v teto mnozine
   - "Den etapy" = pocet dnu v teto mnozine (ne rozdil dat!)
   ============================================================ */
const MS_CURRENT_STAGE_KEY = 'ms_current_stage_v1';
const MS_ACTIVE_DAYS_KEY = 'ms_stage_active_days_v1';

function msTodayISO(){
  const d = new Date();
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function msAddDays(n){
  const d = new Date(); d.setDate(d.getDate()+n);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}

function msSeedActiveDays(){
  return {};
}
function msLoadActiveDaysMap(){
  return msLoad(MS_ACTIVE_DAYS_KEY, msSeedActiveDays);
}
function msSaveActiveDaysMap(map){ msSave(MS_ACTIVE_DAYS_KEY, map); }

function msGetCurrentStage(){
  try{
    const v = localStorage.getItem(MS_CURRENT_STAGE_KEY);
    if(v) return v;
  }catch(e){}
  const selected = msSelectedStageKeys();
  return selected.length ? selected[0] : null;
}

// nastavi etapu jako aktualni a pripocita dnesni den do jeji mnoziny aktivnich dnu
// (bez ohledu na to, kolikrat/jak kratce se to za den stane - den se pocita jen jednou)
function msSetCurrentStage(key){
  try{ localStorage.setItem(MS_CURRENT_STAGE_KEY, key); }catch(e){}
  msAddSelectedStage(key);
  const map = msLoadActiveDaysMap();
  const today = msTodayISO();
  if(!map[key]) map[key] = [];
  if(!map[key].includes(today)) map[key].push(today);
  msSaveActiveDaysMap(map);
}

function msStageActiveDays(key){
  const map = msLoadActiveDaysMap();
  return (map[key] || []).slice().sort();
}
function msStageZahajeno(key){
  const days = msStageActiveDays(key);
  return days.length ? days[0] : null;
}
function msStageDenEtapy(key){
  return msStageActiveDays(key).length;
}
// 'aktualni' | 'probiha' | 'nezahajeno'
const MS_CLOSED_STAGES_KEY = 'ms_closed_stages_v1';
function msClosedStageKeys(){
  try{
    const raw = localStorage.getItem(MS_CLOSED_STAGES_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return [];
}
function msIsStageClosed(key){ return msClosedStageKeys().includes(key); }
function msSetStageClosed(key, closed){
  const keys = msClosedStageKeys();
  const has = keys.includes(key);
  if(closed && !has) keys.push(key);
  if(!closed && has) keys.splice(keys.indexOf(key), 1);
  try{ localStorage.setItem(MS_CLOSED_STAGES_KEY, JSON.stringify(keys)); }catch(e){}
}
// 'uzavrena' ma prednost pred vsim ostatnim - je to jen status, dal se do etapy da cokoliv pridavat
function msStageStatus(key){
  if(msIsStageClosed(key)) return 'uzavrena';
  if(msGetCurrentStage() === key) return 'aktualni';
  return msStageActiveDays(key).length > 0 ? 'probiha' : 'nezahajeno';
}
function msStageStatusLabel(key){
  const s = msStageStatus(key);
  if(s==='uzavrena') return 'Dokončeno';
  if(s==='aktualni') return 'Aktuální';
  if(s==='probiha') return 'Probíhá';
  return 'Nezahájeno';
}

/* ============================================================
   NABÍDKY A DŮLEŽITÉ (zakladni model, plna obrazovka prijde pozdeji)
   ============================================================ */
function msSeedOffers(){
  return [];
}
function msSeedImportant(){
  return [];
}
function msAddImportant(item){
  const list = msImportant();
  const withId = Object.assign({id:msUid('imp'), date: msTodayISO()}, item);
  list.push(withId);
  msSave('ms_important_v1', list);
  return withId;
}

/* ============================================================
   VLASTNÍ POŘADÍ ETAP (tažením za "..." v přehledu etap)
   - aktuální etapa se pri vykresleni vzdy da navrch zvlast,
     tohle uchovava jen poradi TĚCH OSTATNÍCH
   ============================================================ */
const MS_STAGE_ORDER_KEY = 'ms_stage_order_v1';
function msStageOrder(){
  try{
    const raw = localStorage.getItem(MS_STAGE_ORDER_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return MS_STAGES.map(s=>s.key);
}
function msSetStageOrder(orderKeys){
  try{ localStorage.setItem(MS_STAGE_ORDER_KEY, JSON.stringify(orderKeys)); }catch(e){}
}
// vrati kompletni serazeny seznam klicu etap: aktualni prvni, pak zbytek podle ulozeneho poradi
function msOrderedStageKeys(){
  const selected = msSelectedStageKeys();
  if(selected.length===0) return [];
  const cur = msGetCurrentStage();
  const order = msStageOrder().filter(k => k !== cur && selected.includes(k));
  selected.forEach(k=>{ if(k!==cur && !order.includes(k)) order.push(k); });
  return selected.includes(cur) ? [cur, ...order] : order;
}
function msOffers(){ return msLoad('ms_offers_v1', msSeedOffers); }
function msImportant(){ return msLoad('ms_important_v1', msSeedImportant); }

/* --- poslednich N zaznamu dane etapy, serazeno od nejnovejsiho --- */
function msLastN(list, stageKey, n){
  return list.filter(i=>i.stage===stageKey).sort((a,b)=> (b.date||'').localeCompare(a.date||'')).slice(0,n);
}
function msLastPhotos(key,n){ return msLastN(msPhotos(), key, n); }
function msLastDiary(key,n){ return msLastN(msDiary(), key, n); }
function msLastExpenses(key,n){ return msLastN(msExpenses(), key, n); }
function msLastOffers(key,n){ return msLastN(msOffers(), key, n); }
function msLastDocuments(key,n){ return msLastN(msDocuments(), key, n); }
function msLastImportant(key,n){ return msLastN(msImportant(), key, n); }
function msAddPhoto(photo){
  const list = msPhotos();
  const withId = Object.assign({id:msUid('ph'), date: msTodayISO()}, photo);
  list.push(withId);
  msSave(MS_KEYS.photos, list);
  return withId;
}
function msUpdatePhoto(id, patch){
  const list = msPhotos();
  const idx = list.findIndex(p=>p.id===id);
  if(idx===-1) return null;
  list[idx] = Object.assign({}, list[idx], patch);
  msSave(MS_KEYS.photos, list);
  return list[idx];
}
function msDeletePhoto(id){
  msSave(MS_KEYS.photos, msPhotos().filter(p=>p.id!==id));
}

/* ============================================================
   ZAKLADNI METADATA PROJEKTU (plocha pozemku, zastavena plocha, typ)
   ============================================================ */
function msProjectMeta(){
  return msLoad('ms_project_meta_v1', ()=>({landArea:null, builtArea:null, type:null}));
}
function msSetProjectMeta(patch){
  const next = Object.assign({}, msProjectMeta(), patch);
  msSave('ms_project_meta_v1', next);
  return next;
}

/* ============================================================
   OBECNÝ STROM SLOŽEK V PROJEKTU (Smlouvy, Projektová dokumentace...)
   "Dokumenty etap" se resi zvlast pres msDocuments() - tady se
   uklada jen zbytek, ktery si uzivatel sam vytvari.
   ============================================================ */
function msLoadFolderTree(){
  return msLoad('ms_folder_tree_v1', () => ([
    {name:'Smlouvy', type:'folder', children:[]},
    {name:'Projektová dokumentace', type:'folder', children:[]},
    {name:'Stavební povolení', type:'folder', children:[]},
  ]));
}
function msSaveFolderTree(children){
  msSave('ms_folder_tree_v1', children);
}

/* ============================================================
   PROJEKTY (spravovano centralne - pouziva Dashboard, Onboarding i Nastaveni)
   ============================================================ */
const MS_PROJECTS_KEY = 'ms_projects_v1';
const MS_ACTIVE_PROJECT_KEY = 'ms_active_project_v1';
const MS_ONBOARDED_KEY = 'ms_onboarded_v1';

function msDefaultProjects(){ return []; } // bez onboardingu zadny projekt neexistuje
function msLoadProjects(){
  try{
    const raw = localStorage.getItem(MS_PROJECTS_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return msDefaultProjects();
}
function msSaveProjects(list){ try{ localStorage.setItem(MS_PROJECTS_KEY, JSON.stringify(list)); }catch(e){} }
function msGetActiveProjectId(){
  try{ return localStorage.getItem(MS_ACTIVE_PROJECT_KEY) || null; }catch(e){ return null; }
}
function msSetActiveProjectId(id){ try{ localStorage.setItem(MS_ACTIVE_PROJECT_KEY, id); }catch(e){} }

function msHasOnboarded(){
  try{ return localStorage.getItem(MS_ONBOARDED_KEY) === '1'; }catch(e){ return false; }
}
function msSetOnboarded(){ try{ localStorage.setItem(MS_ONBOARDED_KEY, '1'); }catch(e){} }

// vytvori novy projekt (pouziva se pri onboardingu i pri "Pridat projekt" v Nastaveni/Dashboardu)
function msCreateProject({name, type, location}){
  const list = msLoadProjects();
  const id = msUid('p');
  const project = {
    id, name, type: type || null, location: location || '',
    started:false, startDate:null, finished:false, finishDate:null, lastMilestoneMonths:0,
    currentStage:{name:'Bez etapy', color:'#94a0bc'},
    totalExpenses:0, monthExpenses:0, balance:0, photoCount:0
  };
  list.push(project);
  msSaveProjects(list);
  msSetActiveProjectId(id);
  if(type) msSetProjectMeta({type});
  return project;
}
function msUpdateProject(id, patch){
  const list = msLoadProjects();
  const idx = list.findIndex(p=>p.id===id);
  if(idx===-1) return null;
  list[idx] = Object.assign({}, list[idx], patch);
  msSaveProjects(list);
  return list[idx];
}
function msDeleteProject(id){
  let list = msLoadProjects();
  list = list.filter(p=>p.id!==id);
  msSaveProjects(list);
  if(msGetActiveProjectId()===id){
    msSetActiveProjectId(list.length ? list[0].id : null);
  }
}
