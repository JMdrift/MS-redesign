/* ==========================================================
   PROJEKT (spravce dokumentu) - realny vyber souboru misto
   simulace prazdneho dokumentu, poznamka jako soubor, mazani,
   nahrani cele slozky
   ========================================================== */
const ProjectScreen = (function(){
  function render(container, params){
    const ROOT = { name:'Projekt', type:'folder', children:[
      { name:'Dokumenty etap', type:'stagedocs-root', children:[] },
      ...msLoadFolderTree(),
    ]};
    function persistTree(){ msSaveFolderTree(ROOT.children.slice(1)); }

    let path = [ROOT];
    if(params.stage){
      const s = msStageByKey(params.stage);
      if(s) path = [ROOT, ROOT.children[0], { type:'stagedocs-stage', name:s.name, stageKey:s.key }];
    }

    container.innerHTML = `
      <div class="topbar">
        <div class="back-btn" id="backBtn" style="visibility:hidden"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></div>
        <h1 id="pathTitle">Projekt</h1>
        <div class="icon-btn" id="addBtn"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg></div>
      </div>
      <div class="screen-scroll">
        <div id="statsRow" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">
          <div class="proj-stat" data-field="landArea" style="border:1px solid var(--line);background:var(--card-bg);border-radius:var(--radius);padding:9px 6px;text-align:center;cursor:pointer">
            <span style="display:block;font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">Pozemek</span>
            <b id="statLand" style="display:block;font-size:12.5px;color:#fff;margin-top:3px">Doplnit</b>
          </div>
          <div class="proj-stat" data-field="type" style="border:1px solid var(--line);background:var(--card-bg);border-radius:var(--radius);padding:9px 6px;text-align:center;cursor:pointer">
            <span style="display:block;font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">Typ domu</span>
            <b id="statType" style="display:block;font-size:12.5px;color:#fff;margin-top:3px">Doplnit</b>
          </div>
          <div class="proj-stat" data-field="builtArea" style="border:1px solid var(--line);background:var(--card-bg);border-radius:var(--radius);padding:9px 6px;text-align:center;cursor:pointer">
            <span style="display:block;font-size:8px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em">Užitná pl.</span>
            <b id="statBuilt" style="display:block;font-size:12.5px;color:#fff;margin-top:3px">Doplnit</b>
          </div>
        </div>
        <div id="grid" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px"></div>
        <div id="noteRow" style="display:none">
          <p class="f-label">Přidat poznámku (uloží se jako soubor)</p>
          <div style="display:flex;gap:8px">
            <input class="f-input" id="noteInput" placeholder="Napiš poznámku…" style="flex:1"/>
            <button id="noteSaveBtn" style="flex:0 0 auto;border:1px solid var(--line);background:transparent;color:#fff;padding:0 14px;border-radius:3px;cursor:pointer;font-weight:800">Uložit</button>
          </div>
        </div>
      </div>
      <input type="file" id="fileInput" multiple style="display:none"/>
      <input type="file" id="folderInput" webkitdirectory directory multiple style="display:none"/>
    `;

    const meta = msProjectMeta ? msProjectMeta() : {};
    container.querySelector('#statLand').textContent = meta.landArea ? meta.landArea+' m²' : 'Doplnit';
    container.querySelector('#statType').textContent = meta.type || 'Doplnit';
    container.querySelector('#statBuilt').textContent = meta.builtArea ? meta.builtArea+' m²' : 'Doplnit';
    container.querySelectorAll('.proj-stat').forEach(el=>{
      el.addEventListener('click', ()=>{
        const field = el.dataset.field;
        const label = field==='type' ? 'Typ domu' : (field==='landArea' ? 'Plocha pozemku (m²)' : 'Užitná plocha (m²)');
        const cur = meta[field] || '';
        const val = prompt(label+':', cur);
        if(val===null) return;
        const patch = {};
        patch[field] = field==='type' ? val.trim() : (Number(val)||null);
        msSetProjectMeta(patch);
        render(container, params);
      });
    });

    function orderedStagesForDocs(){
      const currentKey = msGetCurrentStage();
      const selected = msSelectedStages();
      const started = selected.filter(s=>s.key!==currentKey && msStageZahajeno(s.key));
      started.sort((a,b)=> msStageZahajeno(a.key).localeCompare(msStageZahajeno(b.key)));
      const notStarted = selected.filter(s=>s.key!==currentKey && !msStageZahajeno(s.key));
      const cur = selected.find(s=>s.key===currentKey);
      return [...(cur?[cur]:[]), ...started, ...notStarted];
    }

    function draw(){
      const node = path[path.length-1];
      const isRoot = path.length===1;
      clickTargets = [];
      deleteTargets = [];
      container.querySelector('#backBtn').style.visibility = isRoot ? 'hidden' : 'visible';
      container.querySelector('#pathTitle').textContent = node.name || 'Projekt';
      const canAddHere = !(node.type==='stagedocs-root' || isRoot);
      container.querySelector('#addBtn').style.display = canAddHere ? 'grid' : 'none';
      container.querySelector('#noteRow').style.display = canAddHere ? 'block' : 'none';
      container.querySelector('#statsRow').style.display = isRoot ? 'grid' : 'none';

      const grid = container.querySelector('#grid');
      grid.innerHTML = '';

      if(node.type==='stagedocs-root'){
        const stages = orderedStagesForDocs();
        if(stages.length===0){
          grid.innerHTML = '<p class="empty-msg" style="grid-column:1/-1">Zatím nemáš vybranou žádnou etapu. Přidej ji v Etapách.</p>';
          return;
        }
        stages.forEach(s=>{
          const count = msDocuments().filter(d=>d.stage===s.key).length;
          grid.innerHTML += tile(s.name, count+' dok.', s.color, ()=>{ path.push({type:'stagedocs-stage', name:s.name, stageKey:s.key}); draw(); });
        });
      } else if(node.type==='stagedocs-stage'){
        const docs = msDocuments().filter(d=>d.stage===node.stageKey);
        if(docs.length===0) grid.innerHTML = '<p class="empty-msg" style="grid-column:1/-1">Zatím žádné dokumenty.</p>';
        docs.forEach(d=>{
          grid.innerHTML += tile(d.name, d.date||'', '#25b7ff', d.isNote ? ()=>editNote(d) : null, true, ()=>{
            msDeleteDocument(d.id); draw();
          });
        });
      } else {
        node.children.forEach((child,i)=>{
          if(child.type==='stagedocs-root'){
            grid.innerHTML += tile('Dokumenty etap', msDocuments().length+' souborů', '#b34cff', ()=>{ path.push(child); draw(); });
          } else if(child.type==='folder'){
            grid.innerHTML += tile(child.name, (child.children||[]).length+' položek', '#4dffab', ()=>{ path.push(child); draw(); }, false, ()=>{
              node.children.splice(i,1); persistTree(); draw();
            });
          } else {
            grid.innerHTML += tile(child.name, child.isNote?'poznámka':'soubor', '#94a0bc', child.isNote ? ()=>editLocalNote(node, i) : null, true, ()=>{
              node.children.splice(i,1); persistTree(); draw();
            });
          }
        });
      }
      bindTileClicks(node);
    }

    let clickTargets = [];
    let deleteTargets = [];
    function tile(name, sub, color, onClick, isFile, onDelete){
      const idx = clickTargets.length;
      clickTargets.push(onClick);
      deleteTargets.push(onDelete);
      return `<div class="tile-item" data-idx="${idx}" style="position:relative;border:1px solid var(--line);padding:14px 10px;text-align:center;cursor:${onClick?'pointer':'default'}">
        ${onDelete ? `<span class="tile-del" data-idx="${idx}" style="position:absolute;top:5px;right:5px;width:20px;height:20px;border:1px solid var(--line);border-radius:3px;display:grid;place-items:center;color:var(--muted);cursor:pointer;background:#0b0f1c">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v13a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7"/></svg>
        </span>` : ''}
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.8">${isFile?'<path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 14h6"/>':'<rect x="3" y="7" width="18" height="13" rx="1"/><path d="M3 7l2-3h6l2 3"/>'}</svg>
        <b style="display:block;margin-top:8px;font-size:11.5px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${name}</b>
        <span style="font-size:9.5px;color:var(--muted)">${sub}</span>
      </div>`;
    }
    function bindTileClicks(node){
      container.querySelectorAll('.tile-item').forEach(el=>{
        const idx = Number(el.dataset.idx);
        el.addEventListener('click', (e)=>{
          if(e.target.closest('.tile-del')) return;
          const fn = clickTargets[idx]; if(fn) fn();
        });
      });
      container.querySelectorAll('.tile-del').forEach(el=>{
        el.addEventListener('click', async (e)=>{
          e.stopPropagation();
          const idx = Number(el.dataset.idx);
          if(!await Layout.confirmDialog('Smazat tuhle položku? Nedá se to vrátit zpět.', 'Smazat')) return;
          const fn = deleteTargets[idx]; if(fn) fn();
        });
      });
    }

    function editNote(d){
      const text = prompt('Upravit poznámku:', d.name.replace(/^Poznámka: /,''));
      if(text===null) return;
      msUpdateDocument(d.id, { name:'Poznámka: '+text.trim() });
      draw();
    }
    function editLocalNote(node, i){
      const child = node.children[i];
      const text = prompt('Upravit poznámku:', child.name.replace(/^Poznámka: /,''));
      if(text===null) return;
      child.name = 'Poznámka: '+text.trim();
      persistTree();
      draw();
    }

    container.querySelector('#backBtn').addEventListener('click', ()=>{
      if(path.length>1){ path.pop(); draw(); }
      else { Router.back(); }
    });

    // --- pridani: realny vyber souboru / cele slozky / nova slozka ---
    container.querySelector('#addBtn').addEventListener('click', async ()=>{
      const choice = await addSheet();
      if(choice==='files') container.querySelector('#fileInput').click();
      else if(choice==='folder') container.querySelector('#folderInput').click();
      else if(choice==='newFolder'){
        const name = prompt('Název nové složky:');
        if(!name || !name.trim()) return;
        addLocalItems([{ name:name.trim(), type:'folder', children:[] }]);
      }
    });

    function addSheet(){
      return new Promise(resolve=>{
        const overlay = document.createElement('div');
        overlay.className = 'ms-overlay'; overlay.style.cssText = 'position:fixed;inset:0;background:rgba(2,4,10,.7);z-index:60;display:flex;align-items:flex-end;justify-content:center';
        overlay.innerHTML = `
          <div style="width:100%;max-width:480px;background:#0b0f1c;border-top:1px solid var(--line);padding:14px 16px calc(16px + env(safe-area-inset-bottom))">
            <div class="mi" data-c="files" style="display:flex;align-items:center;gap:10px;padding:11px 4px;cursor:pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 14h6"/></svg>
              <b style="font-size:12.5px">Nahrát soubory</b>
            </div>
            <div class="mi" data-c="folder" style="display:flex;align-items:center;gap:10px;padding:11px 4px;border-top:1px solid var(--line);cursor:pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="7" width="18" height="13" rx="1"/><path d="M3 7l2-3h6l2 3"/></svg>
              <b style="font-size:12.5px">Nahrát celou složku</b>
            </div>
            <div class="mi" data-c="newFolder" style="display:flex;align-items:center;gap:10px;padding:11px 4px;border-top:1px solid var(--line);cursor:pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
              <b style="font-size:12.5px">Vytvořit prázdnou složku</b>
            </div>
            <button id="sheetClose" style="width:100%;margin-top:10px;border:1px solid var(--line);background:transparent;color:var(--muted);padding:9px;font-size:12px;font-weight:700;cursor:pointer;border-radius:3px">Zrušit</button>
          </div>`;
        document.body.appendChild(overlay);
        overlay.querySelector('#sheetClose').addEventListener('click', ()=>{ document.body.removeChild(overlay); resolve(null); });
        overlay.querySelectorAll('.mi').forEach(el=>{
          el.addEventListener('click', ()=>{ document.body.removeChild(overlay); resolve(el.dataset.c); });
        });
      });
    }

    function addLocalItems(items){
      const node = path[path.length-1];
      if(node.type==='stagedocs-stage'){
        items.forEach(it=> msAddDocument({ name: it.name, stage: node.stageKey, isNote: !!it.isNote }));
      } else {
        node.children = node.children || [];
        node.children.push(...items);
        persistTree();
      }
      draw();
    }

    container.querySelector('#fileInput').addEventListener('change', (e)=>{
      const items = [...e.target.files].map(f=>({ name:f.name, type:'file' }));
      addLocalItems(items);
      e.target.value = '';
    });
    container.querySelector('#folderInput').addEventListener('change', (e)=>{
      const items = [...e.target.files].map(f=>({ name:f.webkitRelativePath || f.name, type:'file' }));
      addLocalItems(items);
      e.target.value = '';
    });

    container.querySelector('#noteSaveBtn').addEventListener('click', ()=>{
      const input = container.querySelector('#noteInput');
      const text = input.value.trim();
      if(!text) return;
      addLocalItems([{ name:'Poznámka: '+text, type:'file', isNote:true }]);
      input.value = '';
    });

    draw();
    return { activeTab:'project' };
  }
  return { render };
})();
Router.register('project', ProjectScreen);
