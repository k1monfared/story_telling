/* Atlas of Feelings — grid view (axis scatter).
 * X axis: pleasantness (valence). Y axis: energy (arousal).
 * Each feeling is a colored dot. Tap to toggle. Drag for lasso multi-select.
 */

(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';

  const view = {
    mount(root, controller) {
      this.root = root;
      this.controller = controller;
      this.svg = svg('svg', { width: '100%', height: '100%', xmlns: NS });
      this.svg.style.userSelect = 'none';
      this.svg.style.touchAction = 'none';
      root.appendChild(this.svg);
      this._ro = new ResizeObserver(() => { if (this.state) this._render(); });
      this._ro.observe(this.root);
      this._wireLasso();
    },
    update(state) { this.state = state; this._render(); },
    unmount() {
      if (this._ro) this._ro.disconnect();
      if (this.root) this.root.innerHTML = '';
      this.root = null;
    },

    _wireLasso() {
      let startX = null, startY = null;
      let lassoEl = null;
      let dragged = false;

      const onPointerDown = (e) => {
        if (e.target.closest('.gridv-dot')) return;
        startX = e.offsetX; startY = e.offsetY;
        dragged = false;
        lassoEl = svg('rect', {
          x: startX, y: startY, width: 0, height: 0, class: 'gridv-lasso',
        });
        this.svg.appendChild(lassoEl);
        this.svg.setPointerCapture(e.pointerId);
      };
      const onPointerMove = (e) => {
        if (startX === null) return;
        const x = Math.min(startX, e.offsetX);
        const y = Math.min(startY, e.offsetY);
        const w = Math.abs(e.offsetX - startX);
        const h = Math.abs(e.offsetY - startY);
        if (w > 6 || h > 6) dragged = true;
        if (lassoEl) {
          lassoEl.setAttribute('x', x);
          lassoEl.setAttribute('y', y);
          lassoEl.setAttribute('width', w);
          lassoEl.setAttribute('height', h);
        }
      };
      const onPointerUp = (e) => {
        if (startX === null) return;
        const x0 = Math.min(startX, e.offsetX);
        const y0 = Math.min(startY, e.offsetY);
        const x1 = Math.max(startX, e.offsetX);
        const y1 = Math.max(startY, e.offsetY);
        if (dragged) {
          this.svg.querySelectorAll('.gridv-dot').forEach((g) => {
            const cx = +g.dataset.cx, cy = +g.dataset.cy;
            if (cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1) {
              const id = g.dataset.id;
              this.controller.addToTray(id);
            }
          });
        }
        if (lassoEl && lassoEl.parentNode) lassoEl.parentNode.removeChild(lassoEl);
        lassoEl = null;
        startX = null; startY = null; dragged = false;
      };
      this.svg.addEventListener('pointerdown', onPointerDown);
      this.svg.addEventListener('pointermove', onPointerMove);
      this.svg.addEventListener('pointerup', onPointerUp);
      this.svg.addEventListener('pointercancel', onPointerUp);
    },

    _render() {
      const { feelings, byId, selected, search, placeColor, hover } = this.state;
      const rect = this.root.getBoundingClientRect();
      const W = Math.max(rect.width, 280);
      const H = Math.max(rect.height, 280);
      this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      this.svg.innerHTML = '';

      const pad = 36;
      const x0 = pad, x1 = W - pad;
      const y0 = pad, y1 = H - pad;

      // Axes
      const ax = svg('line', { x1: x0, y1: (y0 + y1) / 2, x2: x1, y2: (y0 + y1) / 2, class: 'gridv-axis' });
      const ay = svg('line', { x1: (x0 + x1) / 2, y1: y0, x2: (x0 + x1) / 2, y2: y1, class: 'gridv-axis' });
      this.svg.appendChild(ax);
      this.svg.appendChild(ay);

      const lblL = svg('text', { x: x0 + 4, y: (y0 + y1) / 2 - 6, class: 'gridv-axis-label' });
      lblL.textContent = 'Unpleasant';
      const lblR = svg('text', { x: x1 - 4, y: (y0 + y1) / 2 - 6, class: 'gridv-axis-label', 'text-anchor': 'end' });
      lblR.textContent = 'Pleasant';
      const lblT = svg('text', { x: (x0 + x1) / 2 + 8, y: y0 + 12, class: 'gridv-axis-label' });
      lblT.textContent = 'High energy';
      const lblB = svg('text', { x: (x0 + x1) / 2 + 8, y: y1 - 4, class: 'gridv-axis-label' });
      lblB.textContent = 'Low energy';
      this.svg.appendChild(lblL);
      this.svg.appendChild(lblR);
      this.svg.appendChild(lblT);
      this.svg.appendChild(lblB);

      const project = (val, eng) => [
        x0 + ((val + 1) / 2) * (x1 - x0),
        y1 - ((eng + 1) / 2) * (y1 - y0),
      ];

      const selectedSet = new Set(selected);
      const matchingSearch = search
        ? new Set(feelings.filter((f) => matchSearch(f, search)).map((f) => f.id))
        : null;

      feelings.forEach((f) => {
        const [cx, cy] = project(f.valence, f.energy);
        const isSel = selectedSet.has(f.id);
        const isMatch = matchingSearch ? matchingSearch.has(f.id) : null;
        const cls = ['gridv-dot'];
        if (isSel) cls.push('is-selected');
        if (hover === f.id) cls.push('is-hover');
        if (isMatch === true) cls.push('is-search-match');
        if (isMatch === false) cls.push('is-search-dim');

        const g = svg('g', { class: cls.join(' '), 'data-id': f.id, 'data-cx': cx.toFixed(1), 'data-cy': cy.toFixed(1) });
        const r = isSel ? 11 : 7;
        const fill = placeColor.get(f.place) || 'var(--text-muted)';
        g.appendChild(svg('circle', { cx: cx.toFixed(1), cy: cy.toFixed(1), r, fill }));
        if (isSel || hover === f.id) {
          const t = svg('text', { x: cx.toFixed(1), y: (cy - r - 5).toFixed(1) });
          t.textContent = f.name;
          g.appendChild(t);
        }
        g.addEventListener('click', (e) => {
          e.stopPropagation();
          if (selectedSet.has(f.id)) this.controller.removeFromTray(f.id);
          else this.controller.addToTray(f.id);
        });
        // Hover styling is applied locally so we don't need to re-render the
        // whole view on every mouse move (re-render would detach this very
        // element mid-click).
        g.addEventListener('mouseenter', () => {
          g.classList.add('is-hover');
          this.controller.setHover(f.id);
        });
        g.addEventListener('mouseleave', () => {
          g.classList.remove('is-hover');
          this.controller.setHover(null);
        });
        this.svg.appendChild(g);
      });
    },
  };

  function svg(name, attrs) {
    const el = document.createElementNS(NS, name);
    if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function matchSearch(f, q) {
    const ql = q.toLowerCase();
    return (
      f.id.includes(ql) ||
      f.name.toLowerCase().includes(ql) ||
      f.definition.toLowerCase().includes(ql) ||
      f.place.toLowerCase().includes(ql)
    );
  }

  if (typeof window !== 'undefined') {
    window.AtlasViews = window.AtlasViews || {};
    window.AtlasViews.grid = view;
  }
})();
