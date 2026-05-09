/* Atlas of Feelings — main controller (no framework, just plain JS).
 *
 * Holds the shared state, mounts/unmounts views, wires search, tray,
 * definition panel, URL hash codec, and the Done dialog.
 *
 * State shape:
 *   { feelings, byId, selected: [ids], primary: id|null, hover: id|null,
 *     view: 'graph'|'wheel'|'grid', search: '' }
 *
 * Public actions (passed to views as `controller`):
 *   setHover(id|null)
 *   setPrimary(id|null)               focus/center on id
 *   addToTray(id)                     append to tray (no-op if already in)
 *   removeFromTray(id)
 *   promoteVariation(currentId, varId)   tray slot of currentId becomes varId
 *   addComplementary(currentId, compId)  add compId after currentId, focus it
 *   setView(name)
 *   setSearch(s)
 *   openDone()
 */

(function () {
  'use strict';

  // ─── State ──────────────────────────────────────────────
  const state = {
    feelings: [],
    byId: new Map(),
    placeColor: new Map(),  // place name → CSS var
    placeIndex: new Map(),
    selected: [],
    primary: null,
    hover: null,
    view: 'graph',
    search: '',
    loaded: false,
  };

  // View modules register themselves on window.AtlasViews before selector.js loads.
  // We share that object rather than overwrite it.
  const views = (window.AtlasViews = window.AtlasViews || {});
  let activeView = null;
  let canvasEl = null;
  let defPanelEl = null;
  let trayEl = null;
  let searchInputEl = null;
  let doneBtn = null;
  let viewTabsEls = [];

  // ─── Bootstrap ──────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    canvasEl       = document.getElementById('canvas');
    defPanelEl     = document.getElementById('definition-panel');
    trayEl         = document.getElementById('tray');
    searchInputEl  = document.getElementById('search-input');
    doneBtn        = document.getElementById('done-btn');
    viewTabsEls    = Array.from(document.querySelectorAll('.view-tab'));

    try {
      const resp = await fetch('../data/atlas-feelings.json');
      const data = await resp.json();
      hydrate(data);
    } catch (err) {
      console.error('Failed to load feelings data', err);
      canvasEl.innerHTML = '<div class="empty-state"><span>Could not load feelings data. Try refreshing.</span></div>';
      return;
    }

    state.loaded = true;
    wireToolbar();
    restoreFromHash() || restoreFromStorage();
    mountView(state.view);
    renderTray();
    renderDefinitionPanel();
  }

  function hydrate(data) {
    state.feelings = data.feelings;
    state.byId = new Map(state.feelings.map((f) => [f.id, f]));
    data.places.forEach((p, i) => {
      state.placeIndex.set(p, i);
      state.placeColor.set(p, `var(--place-${i})`);
    });
  }

  // ─── View management ───────────────────────────────────
  function mountView(name) {
    if (activeView && typeof activeView.unmount === 'function') {
      activeView.unmount();
    }
    canvasEl.innerHTML = '';
    activeView = views[name] || null;
    if (activeView && typeof activeView.mount === 'function') {
      activeView.mount(canvasEl, controller);
      activeView.update(snapshot());
    } else {
      canvasEl.innerHTML = `<div class="placeholder"><div>${name} view coming soon.</div></div>`;
    }
    viewTabsEls.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.view === name)));
  }

  function notifyView() {
    if (activeView && typeof activeView.update === 'function') {
      activeView.update(snapshot());
    }
  }

  function snapshot() {
    return {
      feelings: state.feelings,
      byId: state.byId,
      placeColor: state.placeColor,
      placeIndex: state.placeIndex,
      selected: state.selected.slice(),
      primary: state.primary,
      hover: state.hover,
      search: state.search,
    };
  }

  // ─── Wiring ─────────────────────────────────────────────
  function wireToolbar() {
    viewTabsEls.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (state.view === btn.dataset.view) return;
        state.view = btn.dataset.view;
        mountView(state.view);
      });
    });

    searchInputEl.addEventListener('input', () => {
      state.search = searchInputEl.value.trim();
      notifyView();
    });
    searchInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && state.search) {
        const matches = matchSearch(state.search);
        if (matches.length) {
          controller.setPrimary(matches[0].id);
          controller.addToTray(matches[0].id);
          state.search = '';
          searchInputEl.value = '';
          notifyView();
        }
      } else if (e.key === 'Escape') {
        state.search = '';
        searchInputEl.value = '';
        notifyView();
      }
    });

    doneBtn.addEventListener('click', () => controller.openDone());

    document.getElementById('clear-btn').addEventListener('click', () => {
      state.selected = [];
      state.primary = null;
      persist();
      renderTray();
      renderDefinitionPanel();
      notifyView();
    });

    document.getElementById('dialog-close').addEventListener('click', () => {
      document.getElementById('constellation-dialog').close();
    });

    window.addEventListener('hashchange', () => {
      restoreFromHash();
      mountView(state.view);
      renderTray();
      renderDefinitionPanel();
    });
  }

  // ─── Search helpers ─────────────────────────────────────
  function matchSearch(q) {
    if (!q) return [];
    const ql = q.toLowerCase();
    return state.feelings.filter(
      (f) =>
        f.id.includes(ql) ||
        f.name.toLowerCase().includes(ql) ||
        f.definition.toLowerCase().includes(ql) ||
        f.place.toLowerCase().includes(ql)
    );
  }

  // ─── Tray ───────────────────────────────────────────────
  function renderTray() {
    trayEl.innerHTML = '';
    state.selected.forEach((id) => {
      const f = state.byId.get(id);
      if (!f) return;
      const chip = document.createElement('button');
      chip.className = 'tray-chip' + (id === state.primary ? ' is-primary' : '');
      chip.style.setProperty('--chip-color', state.placeColor.get(f.place));
      chip.type = 'button';
      const lbl = document.createElement('span');
      lbl.textContent = f.name;
      chip.appendChild(lbl);
      const x = document.createElement('span');
      x.className = 'tray-chip-x';
      x.textContent = '×';
      x.setAttribute('aria-label', `Remove ${f.name}`);
      x.addEventListener('click', (e) => {
        e.stopPropagation();
        controller.removeFromTray(id);
      });
      chip.appendChild(x);
      chip.addEventListener('click', () => controller.setPrimary(id));
      chip.addEventListener('mouseenter', () => controller.setHover(id));
      chip.addEventListener('mouseleave', () => controller.setHover(null));
      trayEl.appendChild(chip);
    });
    doneBtn.disabled = state.selected.length === 0;
  }

  // ─── Definition panel ───────────────────────────────────
  function renderDefinitionPanel() {
    const showId = state.hover || state.primary || (state.selected[state.selected.length - 1] || null);
    const f = showId ? state.byId.get(showId) : null;
    if (!f) {
      defPanelEl.innerHTML = '<div class="def-empty">Hover or tap a feeling to read its definition.</div>';
      return;
    }
    const placeColor = state.placeColor.get(f.place);
    const inTray = state.selected.includes(f.id);
    const isCenter = f.id === state.primary;

    const variations = (f.variations || [])
      .map((vid) => state.byId.get(vid))
      .filter(Boolean);
    const complementaries = (f.complementaries || [])
      .map((cid) => state.byId.get(cid))
      .filter(Boolean);

    const tag = (g, cls) =>
      `<button class="def-tag ${cls}" data-id="${g.id}" type="button">${escapeHtml(g.name)}</button>`;

    defPanelEl.innerHTML = `
      <h3 class="def-name" style="border-left: 3px solid ${placeColor}; padding-left: 0.55rem;">${escapeHtml(f.name)}</h3>
      <div class="def-place">${escapeHtml(f.place)}</div>
      <p class="def-body">${escapeHtml(f.definition)}</p>
      ${f.examples && f.examples.length ? `
        <div class="def-section-label">Sounds like</div>
        <div class="def-examples">${f.examples.map((e) => `&ldquo;${escapeHtml(e)}&rdquo;`).join('<br>')}</div>
      ` : ''}
      ${variations.length ? `
        <div class="def-section-label">Variations <span style="font-weight: 400; opacity: 0.7;">(replace)</span></div>
        <div class="def-tags">${variations.map((v) => tag(v, 'is-variation')).join('')}</div>
      ` : ''}
      ${complementaries.length ? `
        <div class="def-section-label">Often shows up with <span style="font-weight: 400; opacity: 0.7;">(add)</span></div>
        <div class="def-tags">${complementaries.map((c) => tag(c, 'is-complementary')).join('')}</div>
      ` : ''}
      <div class="def-actions">
        ${inTray
          ? `<button data-action="remove">Remove from constellation</button>`
          : `<button data-action="add">Add to constellation</button>`}
        ${!isCenter ? `<button data-action="focus">Focus</button>` : ''}
      </div>
    `;

    defPanelEl.querySelectorAll('.def-tag.is-variation').forEach((b) => {
      b.addEventListener('click', () => {
        controller.promoteVariation(f.id, b.dataset.id);
      });
    });
    defPanelEl.querySelectorAll('.def-tag.is-complementary').forEach((b) => {
      b.addEventListener('click', () => {
        controller.addComplementary(f.id, b.dataset.id);
      });
    });
    defPanelEl.querySelectorAll('button[data-action]').forEach((b) => {
      const act = b.dataset.action;
      b.addEventListener('click', () => {
        if (act === 'add') controller.addToTray(f.id);
        if (act === 'remove') controller.removeFromTray(f.id);
        if (act === 'focus') controller.setPrimary(f.id);
      });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ─── Persistence (localStorage + URL hash) ──────────────
  function persist() {
    localStorage.setItem('atlas.last', JSON.stringify({
      selected: state.selected,
      primary: state.primary,
      view: state.view,
    }));
    const hash = encodeHash();
    if (hash) {
      history.replaceState(null, '', '#' + hash);
    } else {
      history.replaceState(null, '', location.pathname + location.search);
    }
  }

  function encodeHash() {
    if (!state.selected.length) return '';
    const parts = ['v=' + state.view];
    parts.push('f=' + state.selected.join(','));
    if (state.primary && state.selected.includes(state.primary)) {
      parts.push('p=' + state.primary);
    }
    return parts.join('&');
  }

  function restoreFromHash() {
    const h = location.hash.replace(/^#/, '');
    if (!h) return false;
    const params = new URLSearchParams(h);
    const fields = (params.get('f') || '').split(',').filter(Boolean);
    if (!fields.length) return false;
    state.selected = fields.filter((id) => state.byId.has(id));
    const p = params.get('p');
    state.primary = p && state.byId.has(p) ? p : (state.selected[0] || null);
    const v = params.get('v');
    if (v && views[v]) state.view = v;
    return true;
  }

  function restoreFromStorage() {
    try {
      const raw = localStorage.getItem('atlas.last');
      if (!raw) return false;
      const d = JSON.parse(raw);
      if (Array.isArray(d.selected)) {
        state.selected = d.selected.filter((id) => state.byId.has(id));
        if (d.primary && state.byId.has(d.primary)) state.primary = d.primary;
        else state.primary = state.selected[0] || null;
        if (d.view && views[d.view]) state.view = d.view;
        return state.selected.length > 0;
      }
    } catch (e) {
      // ignore
    }
    return false;
  }

  // ─── Public actions (the controller) ────────────────────
  const controller = {
    setHover(id) {
      // Hover updates the definition panel but does NOT trigger a view
      // re-render. Re-rendering during mouse movement detaches the
      // elements that an in-flight click is targeting, swallowing clicks.
      // Views handle their own hover styling locally on existing nodes.
      if (id && !state.byId.has(id)) id = null;
      state.hover = id;
      renderDefinitionPanel();
    },
    setPrimary(id) {
      if (id && !state.byId.has(id)) return;
      state.primary = id || null;
      if (id && !state.selected.includes(id)) {
        state.selected.push(id);
      }
      persist();
      renderTray();
      renderDefinitionPanel();
      notifyView();
    },
    addToTray(id) {
      if (!state.byId.has(id)) return;
      if (!state.selected.includes(id)) state.selected.push(id);
      state.primary = id;
      persist();
      renderTray();
      renderDefinitionPanel();
      notifyView();
    },
    removeFromTray(id) {
      const idx = state.selected.indexOf(id);
      if (idx === -1) return;
      state.selected.splice(idx, 1);
      if (state.primary === id) {
        state.primary = state.selected[state.selected.length - 1] || null;
      }
      persist();
      renderTray();
      renderDefinitionPanel();
      notifyView();
    },
    promoteVariation(currentId, varId) {
      if (!state.byId.has(varId)) return;
      const idx = state.selected.indexOf(currentId);
      if (idx === -1) {
        state.selected.push(varId);
      } else {
        state.selected[idx] = varId;
      }
      // dedupe
      state.selected = state.selected.filter((id, i, a) => a.indexOf(id) === i);
      state.primary = varId;
      persist();
      renderTray();
      renderDefinitionPanel();
      notifyView();
    },
    addComplementary(currentId, compId) {
      if (!state.byId.has(compId)) return;
      if (!state.selected.includes(currentId) && state.byId.has(currentId)) {
        state.selected.push(currentId);
      }
      if (!state.selected.includes(compId)) {
        const anchorIdx = state.selected.indexOf(currentId);
        if (anchorIdx === -1) {
          state.selected.push(compId);
        } else {
          state.selected.splice(anchorIdx + 1, 0, compId);
        }
      }
      state.primary = compId;
      persist();
      renderTray();
      renderDefinitionPanel();
      notifyView();
    },
    setView(name) {
      if (!views[name] || state.view === name) return;
      state.view = name;
      persist();
      mountView(name);
    },
    setSearch(s) {
      state.search = s || '';
      searchInputEl.value = state.search;
      notifyView();
    },
    openDone() {
      if (!state.selected.length) return;
      if (window.Constellation && typeof window.Constellation.open === 'function') {
        window.Constellation.open(snapshot());
      }
    },
  };

})();
