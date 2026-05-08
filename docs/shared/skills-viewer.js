/**
 * skills-viewer.js — Interactive skills viewer for story_telling skills JSON.
 *
 * Usage:
 *   createSkillsViewer(document.getElementById('app'), {
 *     title: 'Saunders — A Swim in a Pond in the Rain',
 *     dataFile: '../data/saunders-skills.json',
 *     bookSlug: 'saunders',
 *   });
 *
 * Query syntax (typed into the query box, or built up by clicking pills):
 *   tag                — skills with this tag (or type: atomic/composed/recipe)
 *   tag1 tag2          — implicit AND
 *   tag1 AND tag2      — explicit AND
 *   tag1 OR tag2       — either
 *   NOT tag            — exclude
 *   (a OR b) AND NOT c — grouping
 */

(function () {
  'use strict';

  const SECTION_ORDER = ['when', 'move', 'signal', 'probe', 'failure', 'example', 'source', 'related_skills'];
  const SECTION_LABELS = {
    when: 'When to reach for this',
    move: 'The move',
    signal: 'Signal it landed',
    probe: 'Probe before & after',
    failure: 'Failure mode this prevents',
    example: 'Worked micro-example',
    source: 'Source',
    related_skills: 'Related skills',
  };

  const FACETS = [
    { name: 'Phase',  tags: ['preparation', 'in-the-moment', 'revision', 'closing'] },
    { name: 'Action', tags: ['diagnose', 'inquire', 'listen', 'reframe', 'assert', 'separate', 'sort', 'contain', 'experiment', 'cut', 'iterate'] },
    { name: 'Focus',  tags: ['self', 'text', 'other', 'exchange', 'relationship'] },
    { name: 'Topic',  tags: ['emotion', 'identity', 'intent-impact', 'contribution', 'triggers', 'purpose', 'distortion', 'coaching', 'evaluation', 'blind-spot', 'boundaries', 'accountability'] },
    { name: 'Craft',  tags: ['structure', 'voice', 'pacing', 'point-of-view', 'characterization', 'climax', 'endings'] },
    { name: 'Stance', tags: ['curiosity', 'growth'] },
  ];

  // ── HTML helpers ─────────────────────────────────────────────────────────

  function esc(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function prettifyName(slug) {
    return slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  function badgeHtml(type) {
    if (type === 'atomic') return '<span class="sv-badge sv-badge-atomic">Atomic</span>';
    if (type === 'composed') return '<span class="sv-badge sv-badge-composed">Composed</span>';
    return '<span class="sv-badge sv-badge-recipe">Recipe</span>';
  }

  // ── Query language ────────────────────────────────────────────────────────

  function tokenize(s) {
    const tokens = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (c === '(') { tokens.push({ type: 'LP' }); i++; continue; }
      if (c === ')') { tokens.push({ type: 'RP' }); i++; continue; }
      const m = s.slice(i).match(/^[A-Za-z0-9_-]+/);
      if (!m) { throw new Error(`Unexpected character: ${c}`); }
      const w = m[0];
      i += w.length;
      const upper = w.toUpperCase();
      if (upper === 'AND' || upper === 'OR' || upper === 'NOT') {
        tokens.push({ type: upper });
      } else {
        tokens.push({ type: 'WORD', value: w.toLowerCase() });
      }
    }
    return tokens;
  }

  // Recursive descent parser.
  // Precedence: NOT binds tightest (to its next term).
  // AND and OR have equal precedence and are left-associative, so
  // `a OR b AND c` parses as `(a OR b) AND c`, matching reading order.
  function parse(tokens) {
    let pos = 0;
    const peek = () => tokens[pos];
    const eat = (type) => (peek() && peek().type === type) ? tokens[pos++] : null;

    function parseBinary() {
      let left = parseNot();
      if (!left) return null;
      while (peek()) {
        const t = peek().type;
        if (t === 'RP') break;
        let op;
        if (t === 'AND') { eat('AND'); op = 'and'; }
        else if (t === 'OR') { eat('OR'); op = 'or'; }
        else if (t === 'WORD' || t === 'LP' || t === 'NOT') { op = 'and'; } // implicit AND
        else break;
        const right = parseNot();
        if (!right) {
          if (op === 'and' && t !== 'AND' && t !== 'OR') break; // trailing junk handled below
          throw new Error(`Expected expression after ${op.toUpperCase()}`);
        }
        left = { type: op, a: left, b: right };
      }
      return left;
    }

    function parseNot() {
      if (eat('NOT')) {
        const inner = parsePrimary();
        if (!inner) throw new Error('Expected expression after NOT');
        return { type: 'not', a: inner };
      }
      return parsePrimary();
    }

    function parsePrimary() {
      if (eat('LP')) {
        const inner = parseBinary();
        if (!eat('RP')) throw new Error('Missing closing parenthesis');
        return inner;
      }
      const w = eat('WORD');
      if (w) return { type: 'word', value: w.value };
      return null;
    }

    if (tokens.length === 0) return null;
    const expr = parseBinary();
    if (pos < tokens.length) {
      const t = tokens[pos];
      throw new Error(`Unexpected token: ${t.type === 'WORD' ? t.value : t.type}`);
    }
    return expr;
  }

  function evaluate(expr, skill) {
    if (!expr) return true;
    switch (expr.type) {
      case 'word': {
        const w = expr.value;
        if ((skill.tags || []).includes(w)) return true;
        const typeLabel = skill.is_recipe ? 'recipe' : skill.type;
        if (typeLabel === w) return true;
        if (skill.book === w) return true;
        return false;
      }
      case 'and': return evaluate(expr.a, skill) && evaluate(expr.b, skill);
      case 'or':  return evaluate(expr.a, skill) || evaluate(expr.b, skill);
      case 'not': return !evaluate(expr.a, skill);
    }
    return false;
  }

  // Returns the set of bare-word tokens used in the expression.
  function collectWords(expr, set = new Set()) {
    if (!expr) return set;
    if (expr.type === 'word') set.add(expr.value);
    else if (expr.type === 'and' || expr.type === 'or') {
      collectWords(expr.a, set);
      collectWords(expr.b, set);
    } else if (expr.type === 'not') {
      collectWords(expr.a, set);
    }
    return set;
  }

  // Pretty-print the parsed expression so users see how AND/OR grouped.
  function formatExpr(expr) {
    if (!expr) return '';
    switch (expr.type) {
      case 'word': return expr.value;
      case 'not':  return `NOT ${formatExpr(expr.a)}`;
      case 'and':  return `(${formatExpr(expr.a)} AND ${formatExpr(expr.b)})`;
      case 'or':   return `(${formatExpr(expr.a)} OR ${formatExpr(expr.b)})`;
    }
    return '';
  }

  function countBinaryOps(expr) {
    if (!expr) return 0;
    if (expr.type === 'and' || expr.type === 'or') {
      return 1 + countBinaryOps(expr.a) + countBinaryOps(expr.b);
    }
    if (expr.type === 'not') return countBinaryOps(expr.a);
    return 0;
  }

  function compileQuery(text) {
    const trimmed = (text || '').trim();
    if (!trimmed) return { ok: true, expr: null, words: new Set() };
    try {
      const tokens = tokenize(trimmed);
      const expr = parse(tokens);
      return { ok: true, expr, words: collectWords(expr) };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  // ── Card rendering ────────────────────────────────────────────────────────

  function renderCard(skill) {
    const name = prettifyName(skill.slug);
    const typeLabel = skill.is_recipe ? 'recipe' : skill.type;
    const tagsHtml = (skill.tags || []).map(t =>
      `<button class="sv-tag" data-tag="${esc(t)}">${esc(t)}</button>`
    ).join('');

    const sectionsHtml = SECTION_ORDER
      .filter(k => skill.sections_html && skill.sections_html[k])
      .map(k => `
        <div class="sv-section" data-section="${esc(k)}">
          <div class="sv-section-hdr">
            <span class="sv-section-arrow">&#9654;</span>
            <span class="sv-section-label">${esc(SECTION_LABELS[k])}</span>
          </div>
          <div class="sv-section-content">${skill.sections_html[k]}</div>
        </div>`)
      .join('');

    return `
      <div class="sv-card" id="skill-${esc(skill.slug)}" data-slug="${esc(skill.slug)}" data-type="${esc(typeLabel)}">
        <div class="sv-card-hdr">
          <span class="sv-card-arrow">&#9654;</span>
          <div class="sv-card-hdr-left">
            <div class="sv-card-name-row">
              ${badgeHtml(typeLabel)}
              <span class="sv-card-name">${esc(name)}</span>
            </div>
            <div class="sv-card-desc">${esc(skill.description)}</div>
            <div class="sv-card-tags">${tagsHtml}</div>
          </div>
        </div>
        <div class="sv-body">${sectionsHtml}</div>
      </div>`;
  }

  // ── Tag bookkeeping ───────────────────────────────────────────────────────

  function buildTagFrequency(skills) {
    const freq = {};
    for (const skill of skills) {
      for (const tag of (skill.tags || [])) {
        freq[tag] = (freq[tag] || 0) + 1;
      }
    }
    return freq;
  }

  function getSkillText(skill) {
    const parts = [
      skill.slug || '',
      skill.name || '',
      skill.description || '',
    ];
    if (skill.sections_html) {
      for (const v of Object.values(skill.sections_html)) {
        parts.push(v.replace(/<[^>]+>/g, ' '));
      }
    }
    return parts.join(' ').toLowerCase();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  window.createSkillsViewer = function (container, config) {
    const { title = 'Skills', dataFile, bookSlug = '' } = config;
    container.innerHTML = `<div class="sv-root"><div class="sv-loading">Loading…</div></div>`;
    const root = container.querySelector('.sv-root');

    fetch(dataFile)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(skills => init(root, skills, title, bookSlug))
      .catch(err => {
        root.innerHTML = `<div class="sv-empty">Failed to load skills: ${esc(String(err))}</div>`;
      });
  };

  function init(root, allSkills, title, bookSlug) {
    let queryText = '';
    let searchQuery = '';

    const tagFreq = buildTagFrequency(allSkills);
    const skillTexts = allSkills.map(getSkillText);

    // Stamp the book on every skill so `book` queries work uniformly.
    allSkills.forEach(s => { if (!s.book && bookSlug) s.book = bookSlug; });

    root.innerHTML = `
      <div class="sv-sidebar-overlay" id="sv-overlay"></div>
      <div class="sv-wrap">
        <aside class="sv-sidebar" id="sv-sidebar">
          <div class="sv-sidebar-section sv-sidebar-query">
            <div class="sv-sidebar-label">Tag query</div>
            <div class="sv-query-row">
              <input class="sv-query" id="sv-query" type="text"
                     placeholder='e.g. emotion AND (identity OR triggers) NOT cut'
                     autocomplete="off" spellcheck="false">
              <button class="sv-query-clear" id="sv-query-clear" title="Clear query">&#10005;</button>
            </div>
            <div class="sv-query-status" id="sv-query-status"></div>
          </div>
          <div class="sv-sidebar-section">
            <div class="sv-sidebar-label">Type</div>
            <div class="sv-pill-list" id="sv-type-pills"></div>
          </div>
          ${FACETS.map(f => `
            <div class="sv-sidebar-section" data-facet="${esc(f.name)}">
              <div class="sv-sidebar-label">${esc(f.name)}</div>
              <div class="sv-pill-list" data-facet-pills="${esc(f.name)}"></div>
            </div>`).join('')}
        </aside>

        <div class="sv-main">
          <div class="sv-hdr">
            <div class="sv-hdr-row">
              <h2 class="sv-title">${esc(title)}</h2>
              <span class="sv-count" id="sv-count"></span>
              <button class="sv-filter-btn" id="sv-filter-btn">Filter</button>
            </div>
            <div class="sv-search-row">
              <input class="sv-search" id="sv-search" type="text"
                     placeholder="Free-text search inside skills…" autocomplete="off">
            </div>
          </div>
          <div class="sv-list" id="sv-list"></div>
        </div>
      </div>`;

    const sidebar     = root.querySelector('#sv-sidebar');
    const overlay     = root.querySelector('#sv-overlay');
    const filterBtn   = root.querySelector('#sv-filter-btn');
    const queryEl     = root.querySelector('#sv-query');
    const queryClear  = root.querySelector('#sv-query-clear');
    const queryStatus = root.querySelector('#sv-query-status');
    const searchEl    = root.querySelector('#sv-search');
    const countEl     = root.querySelector('#sv-count');
    const listEl      = root.querySelector('#sv-list');
    const typePillEl  = root.querySelector('#sv-type-pills');

    // Build type pills.
    const typeCounts = { atomic: 0, composed: 0, recipe: 0 };
    for (const s of allSkills) {
      const t = s.is_recipe ? 'recipe' : s.type;
      if (typeCounts[t] !== undefined) typeCounts[t]++;
    }
    for (const t of ['atomic', 'composed', 'recipe']) {
      if (!typeCounts[t]) continue;
      const btn = document.createElement('button');
      btn.className = 'sv-sidebar-pill';
      btn.dataset.tag = t;
      btn.innerHTML = `<span class="sv-pill-name">${t}</span><span class="sv-pill-count">${typeCounts[t]}</span>`;
      typePillEl.appendChild(btn);
    }

    // Build facet pills.
    for (const facet of FACETS) {
      const container = root.querySelector(`[data-facet-pills="${facet.name}"]`);
      const section   = root.querySelector(`[data-facet="${facet.name}"]`);
      let any = false;
      for (const tag of facet.tags) {
        const count = tagFreq[tag] || 0;
        if (!count) continue;
        any = true;
        const btn = document.createElement('button');
        btn.className = 'sv-sidebar-pill';
        btn.dataset.tag = tag;
        btn.innerHTML = `<span class="sv-pill-name">${esc(tag)}</span><span class="sv-pill-count">${count}</span>`;
        container.appendChild(btn);
      }
      if (!any) section.style.display = 'none';
    }

    // Pill click → mutate the query string.
    sidebar.addEventListener('click', e => {
      const pill = e.target.closest('.sv-sidebar-pill');
      if (!pill) return;
      const tag = pill.dataset.tag;
      const op =
        e.shiftKey ? 'or' :
        (e.altKey || e.ctrlKey || e.metaKey) ? 'not' :
        'and';
      modifyQuery(tag, op);
    });

    // Mobile sidebar toggle
    filterBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });

    // Query box typing.
    queryEl.addEventListener('input', () => {
      queryText = queryEl.value;
      render();
    });
    queryClear.addEventListener('click', () => {
      queryEl.value = '';
      queryText = '';
      queryEl.focus();
      render();
    });

    // Free-text search.
    searchEl.addEventListener('input', () => {
      searchQuery = searchEl.value.trim().toLowerCase();
      render();
    });

    // Click on a tag inside a card → toggle into query (AND).
    listEl.addEventListener('click', e => {
      const tagBtn = e.target.closest('.sv-tag');
      if (tagBtn) {
        e.stopPropagation();
        modifyQuery(tagBtn.dataset.tag, 'and');
        return;
      }
      const sectionHdr = e.target.closest('.sv-section-hdr');
      if (sectionHdr) {
        e.stopPropagation();
        const section = sectionHdr.closest('.sv-section');
        toggleWithScrollAnchor(sectionHdr, () => section.classList.toggle('open'));
        return;
      }
      const cardHdr = e.target.closest('.sv-card-hdr');
      if (cardHdr) {
        const card = cardHdr.closest('.sv-card');
        if (card) {
          toggleWithScrollAnchor(cardHdr, () => card.classList.toggle('open'));
        }
      }
    });

    // Preserve the clicked element's viewport position across a layout change.
    // Without this, collapsing a tall section near the bottom of the page makes
    // the scroll jump up because the document just got shorter.
    function toggleWithScrollAnchor(anchorEl, action) {
      const before = anchorEl.getBoundingClientRect().top;
      action();
      const after = anchorEl.getBoundingClientRect().top;
      const delta = after - before;
      if (Math.abs(delta) > 0.5) {
        window.scrollBy({ top: delta, behavior: 'instant' });
      }
    }

    // ── Helpers used by event handlers ──────────────────────────────────────

    function modifyQuery(tag, op) {
      const compiled = compileQuery(queryText);
      // If the tag is already a bare token in the query, remove it instead.
      if (compiled.ok && compiled.words.has(tag)) {
        queryText = removeTagFromQuery(queryText, tag);
      } else {
        const trimmed = queryText.trim();
        if (!trimmed) {
          queryText = (op === 'not') ? `NOT ${tag}` : tag;
        } else {
          const joiner =
            op === 'or'  ? ' OR ' :
            op === 'not' ? ' AND NOT ' :
                           ' AND ';
          queryText = trimmed + joiner + tag;
        }
      }
      queryEl.value = queryText;
      render();
    }

    function removeTagFromQuery(text, tag) {
      // Strip occurrences of the tag along with their surrounding operator.
      // Handles `AND tag`, `OR tag`, `AND NOT tag`, `NOT tag`, leading `tag`.
      const escTag = tag.replace(/[-]/g, '\\-');
      const re = new RegExp(
        `\\s+(?:AND\\s+NOT|AND|OR|NOT)\\s+${escTag}\\b` +
        `|^(?:NOT\\s+)?${escTag}\\b\\s*` +
        `|\\b${escTag}\\b`,
        'gi'
      );
      return text.replace(re, ' ').replace(/\s+/g, ' ').trim();
    }

    function getFilteredSkills(compiled) {
      if (!compiled.ok) return [];
      return allSkills.filter((skill, idx) => {
        if (!evaluate(compiled.expr, skill)) return false;
        if (searchQuery && !skillTexts[idx].includes(searchQuery)) return false;
        return true;
      });
    }

    function updatePillStates(activeWords) {
      const pills = sidebar.querySelectorAll('.sv-sidebar-pill');
      pills.forEach(p => {
        p.classList.toggle('active', activeWords.has(p.dataset.tag));
      });
    }

    function render() {
      const compiled = compileQuery(queryText);

      if (!compiled.ok) {
        queryStatus.textContent = `Parse error: ${compiled.error}`;
        queryStatus.classList.add('sv-query-error');
        countEl.textContent = '';
        listEl.innerHTML = '';
        updatePillStates(new Set());
        return;
      }

      queryStatus.classList.remove('sv-query-error');
      // Show "parsed as ..." once there are 2+ binary ops so the user sees
      // how left-to-right grouping landed.
      if (compiled.expr && countBinaryOps(compiled.expr) >= 2) {
        queryStatus.textContent = `Parsed as: ${formatExpr(compiled.expr)}`;
      } else {
        queryStatus.textContent = '';
      }
      updatePillStates(compiled.words);

      const filtered = getFilteredSkills(compiled);
      const total = allSkills.length;
      countEl.textContent =
        filtered.length === total
          ? `${total} skill${total !== 1 ? 's' : ''}`
          : `${filtered.length} of ${total}`;

      if (filtered.length === 0) {
        listEl.innerHTML = '<div class="sv-empty">No skills match the current query.</div>';
        return;
      }

      listEl.innerHTML = filtered.map(s => renderCard(s)).join('');

      // Highlight tag pills inside cards that are part of the active query.
      if (compiled.words.size) {
        listEl.querySelectorAll('.sv-tag').forEach(t => {
          if (compiled.words.has(t.dataset.tag)) t.classList.add('active');
        });
      }

      linkifySkillReferences(listEl, knownSlugs);
    }

    // Build set of slugs once so linkify can verify references resolve.
    const knownSlugs = new Set(allSkills.map(s => s.slug));

    // Convert any <code>known-slug</code> inside the Related skills section
    // (and also the When/Failure/Source sections, which sometimes reference
    // sibling skills) into clickable deep-links to the target card.
    function linkifySkillReferences(root, slugs) {
      root.querySelectorAll('.sv-section .sv-section-content code').forEach(codeEl => {
        const text = codeEl.textContent.trim();
        if (!slugs.has(text)) return;
        const a = document.createElement('a');
        a.className = 'sv-skill-link';
        a.href = `#skill-${text}`;
        a.dataset.targetSlug = text;
        a.textContent = text;
        codeEl.replaceWith(a);
      });
    }

    // Click on a skill-link → scroll to and open the target card.
    listEl.addEventListener('click', e => {
      const link = e.target.closest('a.sv-skill-link');
      if (!link) return;
      e.preventDefault();
      e.stopPropagation();
      navigateToSkill(link.dataset.targetSlug);
    });

    function navigateToSkill(slug) {
      let target = document.getElementById(`skill-${slug}`);
      if (!target) {
        // Target is filtered out by current query: clear filters so it shows.
        queryEl.value = '';
        queryText = '';
        searchEl.value = '';
        searchQuery = '';
        render();
        target = document.getElementById(`skill-${slug}`);
      }
      if (!target) return;
      target.classList.add('open');
      // Wait one frame so the layout reflects the now-open card before we
      // ask the browser where to scroll to. Otherwise smooth-scroll picks a
      // stale destination and we overshoot.
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      target.classList.remove('sv-card-flash');
      void target.offsetWidth;
      target.classList.add('sv-card-flash');
      if (history.replaceState) {
        history.replaceState(null, '', `#skill-${slug}`);
      }
    }

    // Honor #skill-... in the URL on initial load.
    if (window.location.hash.startsWith('#skill-')) {
      const slug = window.location.hash.slice('#skill-'.length);
      // wait one frame so the cards are in the DOM
      requestAnimationFrame(() => navigateToSkill(slug));
    }

    // ── Page-header buttons: sidebar toggle + magnifying-glass search ────
    // The sidebar is open by default; users can collapse it. The free-text
    // search row inside .sv-hdr is hidden by default; the magnifying-glass
    // icon opens it (click-outside or Escape closes it). The search-input
    // value persists across hide/show because the DOM element is just hidden.
    const pageHeaderInner = document.querySelector('.page-header-inner');
    const searchRow = root.querySelector('.sv-search-row');
    const wrap = root.querySelector('.sv-wrap');

    if (pageHeaderInner && wrap && !pageHeaderInner.querySelector('.page-sidebar-toggle')) {
      const sbBtn = document.createElement('button');
      sbBtn.className = 'page-sidebar-toggle active';
      sbBtn.title = 'Toggle filters sidebar';
      sbBtn.setAttribute('aria-label', 'Toggle filters sidebar');
      sbBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <line x1="3"  y1="6"  x2="21" y2="6"/>
          <line x1="3"  y1="12" x2="21" y2="12"/>
          <line x1="3"  y1="18" x2="21" y2="18"/>
        </svg>`;
      const themeToggle = pageHeaderInner.querySelector('.theme-toggle');
      if (themeToggle) pageHeaderInner.insertBefore(sbBtn, themeToggle);
      else pageHeaderInner.appendChild(sbBtn);
      sbBtn.addEventListener('click', () => {
        const collapsed = wrap.classList.toggle('sv-collapsed-sidebar');
        sbBtn.classList.toggle('active', !collapsed);
      });
    }

    if (pageHeaderInner && searchRow && !pageHeaderInner.querySelector('.page-search-toggle')) {
      const btn = document.createElement('button');
      btn.className = 'page-search-toggle';
      btn.title = 'Search inside skills';
      btn.setAttribute('aria-label', 'Toggle search');
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>`;
      const themeToggle = pageHeaderInner.querySelector('.theme-toggle');
      if (themeToggle) pageHeaderInner.insertBefore(btn, themeToggle);
      else pageHeaderInner.appendChild(btn);

      btn.addEventListener('click', e => {
        e.stopPropagation();
        const opened = searchRow.classList.toggle('sv-search-row-open');
        btn.classList.toggle('active', opened);
        if (opened) searchEl.focus();
      });

      // Click anywhere outside the search row or the toggle hides the bar.
      document.addEventListener('click', e => {
        if (!searchRow.classList.contains('sv-search-row-open')) return;
        if (e.target.closest('.sv-search-row') || e.target.closest('.page-search-toggle')) return;
        searchRow.classList.remove('sv-search-row-open');
        btn.classList.remove('active');
      });

      // Escape also closes.
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && searchRow.classList.contains('sv-search-row-open')) {
          searchRow.classList.remove('sv-search-row-open');
          btn.classList.remove('active');
        }
      });
    }

    render();
  }

})();
