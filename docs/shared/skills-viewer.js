/**
 * skills-viewer.js — Interactive skills viewer for story_telling skills JSON.
 *
 * Usage:
 *   createSkillsViewer(document.getElementById('app'), {
 *     title: 'Saunders — A Swim in a Pond in the Rain',
 *     dataFile: '../data/saunders-skills.json',
 *     bookSlug: 'saunders',
 *   });
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

  function renderCard(skill) {
    const name = prettifyName(skill.slug);
    const typeLabel = skill.is_recipe ? 'recipe' : skill.type;
    const tagsHtml = (skill.tags || []).map(t =>
      `<button class="sv-tag" data-tag="${esc(t)}">${esc(t)}</button>`
    ).join('');

    const sectionsHtml = SECTION_ORDER.filter(k => skill.sections_html && skill.sections_html[k])
      .map(k => `
        <div class="sv-section">
          <div class="sv-section-label">${esc(SECTION_LABELS[k])}</div>
          <div class="sv-section-content">${skill.sections_html[k]}</div>
        </div>`)
      .join('');

    return `
      <div class="sv-card" data-slug="${esc(skill.slug)}" data-type="${esc(typeLabel)}">
        <div class="sv-card-hdr">
          <div class="sv-card-hdr-left">
            <div class="sv-card-name-row">
              ${badgeHtml(typeLabel)}
              <span class="sv-card-name">${esc(name)}</span>
            </div>
            <div class="sv-card-desc">${esc(skill.description)}</div>
            <div class="sv-card-tags">${tagsHtml}</div>
          </div>
          <span class="sv-card-arrow">▶</span>
        </div>
        <div class="sv-body">${sectionsHtml}</div>
      </div>`;
  }

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
        // Strip HTML tags for text search
        parts.push(v.replace(/<[^>]+>/g, ' '));
      }
    }
    return parts.join(' ').toLowerCase();
  }

  window.createSkillsViewer = function (container, config) {
    const { title = 'Skills', dataFile, bookSlug = '' } = config;

    // Inject root wrapper
    container.innerHTML = `<div class="sv-root"><div class="sv-loading">Loading…</div></div>`;
    const root = container.querySelector('.sv-root');

    fetch(dataFile)
      .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(skills => init(root, skills, title))
      .catch(err => {
        root.innerHTML = `<div class="sv-empty">Failed to load skills: ${esc(String(err))}</div>`;
      });
  };

  function init(root, allSkills, title) {
    let activeTag = null;
    let activeType = 'all';
    let searchQuery = '';

    // Build tag frequency map from all skills
    const tagFreq = buildTagFrequency(allSkills);
    const sortedTags = Object.keys(tagFreq).sort((a, b) => tagFreq[b] - tagFreq[a]);

    // Precompute search text for each skill
    const skillTexts = allSkills.map(getSkillText);

    root.innerHTML = `
      <div class="sv-sidebar-overlay" id="sv-overlay"></div>
      <div class="sv-wrap">
        <aside class="sv-sidebar" id="sv-sidebar">
          <div class="sv-sidebar-section">
            <div class="sv-sidebar-label">Type</div>
            <div class="sv-type-btns">
              <button class="sv-type-btn active" data-type="all">All</button>
              <button class="sv-type-btn" data-type="atomic">Atomic</button>
              <button class="sv-type-btn" data-type="composed">Composed</button>
              <button class="sv-type-btn" data-type="recipe">Recipe</button>
            </div>
          </div>
          <div class="sv-sidebar-section">
            <div class="sv-sidebar-label">Tags</div>
            <div class="sv-tag-list" id="sv-tag-list"></div>
          </div>
        </aside>

        <div class="sv-main">
          <div class="sv-hdr">
            <div class="sv-hdr-row">
              <h2 class="sv-title">${esc(title)}</h2>
              <span class="sv-count" id="sv-count"></span>
              <button class="sv-filter-btn" id="sv-filter-btn">Filter</button>
            </div>
            <div class="sv-search-row">
              <input class="sv-search" id="sv-search" type="text" placeholder="Search skills…" autocomplete="off">
            </div>
          </div>
          <div class="sv-list" id="sv-list"></div>
        </div>
      </div>`;

    const sidebar = root.querySelector('#sv-sidebar');
    const overlay = root.querySelector('#sv-overlay');
    const filterBtn = root.querySelector('#sv-filter-btn');
    const searchEl = root.querySelector('#sv-search');
    const countEl = root.querySelector('#sv-count');
    const listEl = root.querySelector('#sv-list');
    const tagListEl = root.querySelector('#sv-tag-list');
    const typeBtns = root.querySelectorAll('.sv-type-btn');

    // Build tag sidebar
    for (const tag of sortedTags) {
      const btn = document.createElement('button');
      btn.className = 'sv-sidebar-tag';
      btn.dataset.tag = tag;
      btn.innerHTML = `<span class="sv-tag-name">${esc(tag)}</span><span class="sv-tag-count">${tagFreq[tag]}</span>`;
      tagListEl.appendChild(btn);
    }

    // Mobile sidebar toggle
    filterBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });

    // Type filter
    typeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeType = btn.dataset.type;
        render();
      });
    });

    // Tag filter (sidebar)
    tagListEl.addEventListener('click', e => {
      const btn = e.target.closest('.sv-sidebar-tag');
      if (!btn) return;
      const tag = btn.dataset.tag;
      if (activeTag === tag) {
        activeTag = null;
      } else {
        activeTag = tag;
      }
      // Update active state in sidebar
      tagListEl.querySelectorAll('.sv-sidebar-tag').forEach(b => {
        b.classList.toggle('active', b.dataset.tag === activeTag);
      });
      // Close sidebar on mobile
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
      render();
    });

    // Search
    searchEl.addEventListener('input', () => {
      searchQuery = searchEl.value.trim().toLowerCase();
      render();
    });

    // Card expand/collapse and tag clicks
    listEl.addEventListener('click', e => {
      // Tag pill click inside a card
      const tagBtn = e.target.closest('.sv-tag');
      if (tagBtn) {
        e.stopPropagation();
        const tag = tagBtn.dataset.tag;
        if (activeTag === tag) {
          activeTag = null;
        } else {
          activeTag = tag;
        }
        tagListEl.querySelectorAll('.sv-sidebar-tag').forEach(b => {
          b.classList.toggle('active', b.dataset.tag === activeTag);
        });
        render();
        return;
      }

      // Card header click
      const hdr = e.target.closest('.sv-card-hdr');
      if (hdr) {
        const card = hdr.closest('.sv-card');
        if (card) card.classList.toggle('open');
      }
    });

    function getFilteredSkills() {
      return allSkills.filter((skill, idx) => {
        // Type filter
        const typeLabel = skill.is_recipe ? 'recipe' : skill.type;
        if (activeType !== 'all' && typeLabel !== activeType) return false;

        // Tag filter
        if (activeTag && !(skill.tags || []).includes(activeTag)) return false;

        // Search filter
        if (searchQuery && !skillTexts[idx].includes(searchQuery)) return false;

        return true;
      });
    }

    function render() {
      const filtered = getFilteredSkills();
      const total = allSkills.length;

      if (filtered.length === total) {
        countEl.textContent = `${total} skill${total !== 1 ? 's' : ''}`;
      } else {
        countEl.textContent = `${filtered.length} of ${total} skills`;
      }

      if (filtered.length === 0) {
        listEl.innerHTML = '<div class="sv-empty">No skills match the current filters.</div>';
        return;
      }

      listEl.innerHTML = filtered.map(s => renderCard(s)).join('');

      // Highlight active tags in rendered cards
      if (activeTag) {
        listEl.querySelectorAll(`.sv-tag[data-tag="${CSS.escape(activeTag)}"]`).forEach(t => {
          t.classList.add('active');
        });
      }
    }

    render();
  }

})();
