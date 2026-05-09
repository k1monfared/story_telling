/* Atlas of Feelings — graph view.
 * Renders the current center, its variations + complementaries, and all
 * other anchors (tray items) connected to the center. Backdrop shows the
 * remaining feelings at their UMAP positions, faint.
 *
 * Click/tap a variation: replaces the current tray slot.
 * Click/tap a complementary: adds and becomes new center.
 * Click/tap a backdrop feeling: focuses it (also becomes a candidate to add).
 * Long-press on touch / hover on desktop: previews definition panel without committing.
 */

(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';

  const NODE_R_CENTER = 28;
  const NODE_R_HALO   = 18;
  const NODE_R_ANCHOR = 14;
  const NODE_R_BACK   = 4;

  const view = {
    mount(root, controller) {
      this.root = root;
      this.controller = controller;
      this.svg = svg('svg', { width: '100%', height: '100%', xmlns: NS });
      this.svg.style.userSelect = 'none';
      this.gBackdrop = svg('g', { class: 'gv-backdrop' });
      this.gEdges    = svg('g', { class: 'gv-edges' });
      this.gNodes    = svg('g', { class: 'gv-nodes' });
      this.svg.appendChild(this.gBackdrop);
      this.svg.appendChild(this.gEdges);
      this.svg.appendChild(this.gNodes);
      root.appendChild(this.svg);

      this._wireResize();
    },

    update(state) {
      this.state = state;
      this._render();
    },

    unmount() {
      if (this._ro) this._ro.disconnect();
      if (this.root) this.root.innerHTML = '';
      this.root = null;
    },

    _wireResize() {
      this._ro = new ResizeObserver(() => {
        if (this.state) this._render();
      });
      this._ro.observe(this.root);
    },

    _render() {
      const { feelings, byId, selected, primary, hover, search, placeColor } = this.state;
      const rect = this.root.getBoundingClientRect();
      const W = Math.max(rect.width, 280);
      const H = Math.max(rect.height, 280);
      this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);

      // Determine center: explicit primary, or last selected, or null
      const centerId = primary || selected[selected.length - 1] || null;

      if (!centerId) {
        this._renderEmpty(W, H);
        return;
      }

      const center = byId.get(centerId);
      if (!center) return;

      const variations = (center.variations || []).map((id) => byId.get(id)).filter(Boolean);
      const complementaries = (center.complementaries || []).map((id) => byId.get(id)).filter(Boolean);

      const anchorIds = selected.filter((id) => id !== centerId);
      const anchorIdSet = new Set(anchorIds);
      const visibleIds = new Set([
        centerId,
        ...variations.map((f) => f.id),
        ...complementaries.map((f) => f.id),
        ...anchorIds,
      ]);

      // Compute UMAP-driven screen coordinates centered on the center node.
      const padding = 70;
      const drawW = W - padding * 2;
      const drawH = H - padding * 2;
      const nodesToFit = [center, ...variations, ...complementaries,
                          ...anchorIds.map((id) => byId.get(id)).filter(Boolean)];
      let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
      nodesToFit.forEach((f) => {
        const [u, v] = f.umap;
        if (u < minU) minU = u;
        if (u > maxU) maxU = u;
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
      });
      // Fall back to a window if the set is degenerate
      const spanU = Math.max(maxU - minU, 0.001);
      const spanV = Math.max(maxV - minV, 0.001);
      // Pad so nodes don't sit on the edge
      const padU = spanU * 0.25 + 1;
      const padV = spanV * 0.25 + 1;
      minU -= padU; maxU += padU;
      minV -= padV; maxV += padV;
      const baseScale = Math.min(drawW / (maxU - minU), drawH / (maxV - minV));
      const cx = padding + drawW / 2;
      const cy = padding + drawH / 2;
      const midU = (minU + maxU) / 2;
      const midV = (minV + maxV) / 2;
      const project = ([u, v]) => [cx + (u - midU) * baseScale, cy - (v - midV) * baseScale];

      // ── Backdrop ─────────────────────
      this.gBackdrop.innerHTML = '';
      feelings.forEach((f) => {
        if (visibleIds.has(f.id)) return;
        const [x, y] = project(f.umap);
        if (x < -NODE_R_BACK || x > W + NODE_R_BACK || y < -NODE_R_BACK || y > H + NODE_R_BACK) return;
        const c = svg('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: NODE_R_BACK });
        if (search && f.name.toLowerCase().includes(search.toLowerCase())) {
          c.setAttribute('class', 'gv-back-near');
        }
        this.gBackdrop.appendChild(c);
      });

      // ── Edges ─────────────────────
      this.gEdges.innerHTML = '';
      const [ccx, ccy] = project(center.umap);
      variations.forEach((f) => {
        const [x, y] = project(f.umap);
        this.gEdges.appendChild(svg('line', {
          x1: ccx, y1: ccy, x2: x, y2: y,
          class: 'gv-edge gv-edge-variation',
        }));
      });
      complementaries.forEach((f) => {
        const [x, y] = project(f.umap);
        this.gEdges.appendChild(svg('line', {
          x1: ccx, y1: ccy, x2: x, y2: y,
          class: 'gv-edge gv-edge-complementary',
        }));
      });
      anchorIds.forEach((id) => {
        const f = byId.get(id);
        if (!f) return;
        const [x, y] = project(f.umap);
        this.gEdges.appendChild(svg('line', {
          x1: ccx, y1: ccy, x2: x, y2: y,
          class: 'gv-edge gv-edge-anchor',
        }));
      });

      // ── Nodes ─────────────────────
      this.gNodes.innerHTML = '';
      const matchingSearch = search
        ? new Set(feelings.filter((f) => matchSearch(f, search)).map((f) => f.id))
        : null;

      // Backdrop nodes are drawn already (in gBackdrop). Foreground nodes are these:
      const drawNode = (f, role) => {
        const [x, y] = project(f.umap);
        const r = role === 'center' ? NODE_R_CENTER : role === 'anchor' ? NODE_R_ANCHOR : NODE_R_HALO;
        const fill = placeColor.get(f.place) || 'var(--text-muted)';
        const g = svg('g', {
          class:
            'gv-node gv-node-' + role +
            (hover === f.id ? ' is-hover' : '') +
            (matchingSearch && matchingSearch.has(f.id) ? ' is-search-match' : '') +
            (matchingSearch && !matchingSearch.has(f.id) ? ' is-search-dim' : ''),
          'data-id': f.id,
        });
        g.appendChild(svg('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r, fill }));
        const label = svg('text', { x: x.toFixed(1), y: (y + r + 14).toFixed(1) });
        label.textContent = f.name;
        g.appendChild(label);
        wireNodeInteractions(g, f, role, this.controller);
        this.gNodes.appendChild(g);
      };

      anchorIds.forEach((id) => {
        const f = byId.get(id);
        if (f) drawNode(f, 'anchor');
      });
      complementaries.forEach((f) => {
        if (anchorIdSet.has(f.id)) return; // already drawn as anchor
        drawNode(f, 'halo-complementary');
      });
      variations.forEach((f) => {
        if (anchorIdSet.has(f.id)) return;
        drawNode(f, 'halo-variation');
      });
      drawNode(center, 'center');
    },

    _renderEmpty(W, H) {
      this.gBackdrop.innerHTML = '';
      this.gEdges.innerHTML = '';
      this.gNodes.innerHTML = '';

      // Show all 87 as a faint backdrop so the user sees the field
      const { feelings, placeColor } = this.state;
      let minU = Infinity, maxU = -Infinity, minV = Infinity, maxV = -Infinity;
      feelings.forEach((f) => {
        const [u, v] = f.umap;
        if (u < minU) minU = u; if (u > maxU) maxU = u;
        if (v < minV) minV = v; if (v > maxV) maxV = v;
      });
      const padding = 70;
      const drawW = W - padding * 2, drawH = H - padding * 2;
      const padU = (maxU - minU) * 0.05;
      const padV = (maxV - minV) * 0.05;
      minU -= padU; maxU += padU; minV -= padV; maxV += padV;
      const baseScale = Math.min(drawW / (maxU - minU), drawH / (maxV - minV));
      const cx = padding + drawW / 2, cy = padding + drawH / 2;
      const midU = (minU + maxU) / 2, midV = (minV + maxV) / 2;
      const search = this.state.search;
      const matchingSearch = search
        ? new Set(feelings.filter((f) => matchSearch(f, search)).map((f) => f.id))
        : null;
      feelings.forEach((f) => {
        const x = cx + (f.umap[0] - midU) * baseScale;
        const y = cy - (f.umap[1] - midV) * baseScale;
        const isMatch = matchingSearch && matchingSearch.has(f.id);
        const fill = this.state.placeColor.get(f.place) || 'var(--text-muted)';
        const g = svg('g', {
          class: 'gv-node gv-node-back' +
                 (isMatch ? ' is-search-match' : '') +
                 (matchingSearch && !isMatch ? ' is-search-dim' : ''),
          'data-id': f.id,
        });
        g.appendChild(svg('circle', { cx: x.toFixed(1), cy: y.toFixed(1), r: 6, fill, opacity: 0.6 }));
        const label = svg('text', { x: x.toFixed(1), y: (y + 16).toFixed(1) });
        label.textContent = f.name;
        g.appendChild(label);
        wireNodeInteractions(g, f, 'back', this.controller);
        this.gNodes.appendChild(g);
      });

      // Hint text
      const hintGroup = svg('g');
      const hint = svg('text', {
        x: W / 2,
        y: 28,
        'text-anchor': 'middle',
        fill: 'var(--text-muted)',
        'font-size': 12,
      });
      hint.textContent = 'Tap a feeling to start, or search above.';
      hintGroup.appendChild(hint);
      this.gNodes.appendChild(hintGroup);
    },
  };

  // ─── Helpers ──────────────────────────────────────────
  function svg(name, attrs) {
    const el = document.createElementNS(NS, name);
    if (attrs) {
      for (const k in attrs) {
        if (k === 'class') el.setAttribute('class', attrs[k]);
        else el.setAttribute(k, attrs[k]);
      }
    }
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

  function wireNodeInteractions(g, feeling, role, controller) {
    let pressTimer = null;
    let isLongPress = false;
    let pressX = 0, pressY = 0;

    const setHoverClass = (on) => {
      if (on) g.classList.add('is-hover');
      else g.classList.remove('is-hover');
    };

    const onPointerDown = (e) => {
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        pressX = e.clientX; pressY = e.clientY;
        isLongPress = false;
        pressTimer = setTimeout(() => {
          isLongPress = true;
          setHoverClass(true);
          controller.setHover(feeling.id);
        }, 380);
      } else {
        setHoverClass(true);
        controller.setHover(feeling.id);
      }
    };
    const onPointerMove = (e) => {
      if (pressTimer && (Math.abs(e.clientX - pressX) > 8 || Math.abs(e.clientY - pressY) > 8)) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };
    const onPointerUp = () => {
      if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
    };
    const onPointerLeave = () => {
      if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; }
      setHoverClass(false);
      controller.setHover(null);
    };
    const onClick = (e) => {
      if (isLongPress) { isLongPress = false; return; }
      e.stopPropagation();
      const centerId = controller && controller._ ? null : null; // placeholder
      // We need to know the current center to dispatch the right action.
      // Cheaper: rely on the controller to figure it out by id.
      if (role === 'halo-variation') {
        const currentCenter = view.state && (view.state.primary || view.state.selected[view.state.selected.length - 1]);
        if (currentCenter) {
          controller.promoteVariation(currentCenter, feeling.id);
        } else {
          controller.addToTray(feeling.id);
        }
      } else if (role === 'halo-complementary') {
        const currentCenter = view.state && (view.state.primary || view.state.selected[view.state.selected.length - 1]);
        if (currentCenter) {
          controller.addComplementary(currentCenter, feeling.id);
        } else {
          controller.addToTray(feeling.id);
        }
      } else if (role === 'anchor') {
        // tap on a tray-anchor focuses it
        controller.setPrimary(feeling.id);
      } else if (role === 'back') {
        // tap on the backdrop adds & focuses
        controller.addToTray(feeling.id);
      } else if (role === 'center') {
        // tap on the center is a no-op (already centered)
      }
    };

    g.addEventListener('pointerdown', onPointerDown);
    g.addEventListener('pointermove', onPointerMove);
    g.addEventListener('pointerup', onPointerUp);
    g.addEventListener('pointerleave', onPointerLeave);
    g.addEventListener('click', onClick);
  }

  // Register
  if (typeof window !== 'undefined') {
    window.AtlasViews = window.AtlasViews || {};
    window.AtlasViews.graph = view;
  }
})();
