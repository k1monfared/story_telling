/* Atlas of Feelings — wheel view.
 * 13 Place wedges arranged radially. Each petal is one feeling in that Place.
 * Tap petal → toggles tray membership. Tap place label → focuses first feeling there.
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
      root.appendChild(this.svg);
      this._ro = new ResizeObserver(() => { if (this.state) this._render(); });
      this._ro.observe(this.root);
    },
    update(state) { this.state = state; this._render(); },
    unmount() {
      if (this._ro) this._ro.disconnect();
      if (this.root) this.root.innerHTML = '';
      this.root = null;
    },

    _render() {
      const { feelings, byId, placeIndex, placeColor, selected, search } = this.state;
      const rect = this.root.getBoundingClientRect();
      const W = Math.max(rect.width, 280);
      const H = Math.max(rect.height, 280);
      this.svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
      this.svg.innerHTML = '';

      const cx = W / 2;
      const cy = H / 2;
      const rOuter = Math.min(W, H) / 2 - 12;
      const rInnerPlate = Math.max(36, rOuter * 0.18);
      const rPlace = rOuter * 0.34;

      // Group feelings by place, ordered by Brown's chapter sequence
      const places = Array.from(placeIndex.entries()).sort((a, b) => a[1] - b[1]).map(([p]) => p);
      const byPlace = new Map(places.map((p) => [p, []]));
      feelings.forEach((f) => {
        if (byPlace.has(f.place)) byPlace.get(f.place).push(f);
      });

      const wedgeAngle = (Math.PI * 2) / places.length;
      const selectedSet = new Set(selected);
      const matchingSearch = search
        ? new Set(feelings.filter((f) => matchSearch(f, search)).map((f) => f.id))
        : null;

      // Center plate (decorative)
      const plate = svg('circle', { cx, cy, r: rInnerPlate, fill: 'var(--bg)', stroke: 'var(--border)' });
      this.svg.appendChild(plate);
      const plateText = svg('text', {
        x: cx, y: cy + 4, 'text-anchor': 'middle',
        fill: 'var(--text-muted)', 'font-size': 11, 'font-weight': 600,
        'letter-spacing': '0.08em',
      });
      plateText.textContent = '87 FEELINGS';
      this.svg.appendChild(plateText);

      // Place wedges (inner colored band) + outer petals (per feeling)
      places.forEach((place, pi) => {
        const a0 = -Math.PI / 2 + pi * wedgeAngle;
        const a1 = a0 + wedgeAngle;
        const colorVar = placeColor.get(place);

        // Place band (inner ring, used for label background)
        const band = svg('path', {
          d: ringSectorPath(cx, cy, rInnerPlate + 4, rPlace, a0, a1),
          fill: colorVar,
          opacity: 0.85,
          class: 'wv-wedge',
          'data-place': place,
        });
        band.addEventListener('click', () => {
          const items = byPlace.get(place);
          if (items && items[0]) view.controller.addToTray(items[0].id);
        });
        this.svg.appendChild(band);

        // Place label arc (curved text)
        const labelArcId = 'wv-arc-' + pi;
        const arcMidR = (rInnerPlate + rPlace) / 2;
        const arcPath = svg('path', {
          id: labelArcId,
          d: arcPathOnly(cx, cy, arcMidR, a0 + wedgeAngle * 0.06, a1 - wedgeAngle * 0.06),
          fill: 'none',
          stroke: 'none',
        });
        this.svg.appendChild(arcPath);
        const labelText = svg('text', { class: 'wv-place-label' });
        const tp = document.createElementNS(NS, 'textPath');
        tp.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + labelArcId);
        tp.setAttribute('href', '#' + labelArcId);
        tp.setAttribute('startOffset', '50%');
        tp.setAttribute('text-anchor', 'middle');
        tp.textContent = shortPlaceLabel(place);
        labelText.appendChild(tp);
        this.svg.appendChild(labelText);

        // Petals (one per feeling in place), arranged in two rows if many
        const items = byPlace.get(place) || [];
        if (!items.length) return;
        const petalCount = items.length;
        const subAngle = wedgeAngle / petalCount;

        items.forEach((f, i) => {
          const pa0 = a0 + i * subAngle;
          const pa1 = a0 + (i + 1) * subAngle;
          const isSel = selectedSet.has(f.id);
          const isMatch = matchingSearch ? matchingSearch.has(f.id) : null;
          const cls = ['wv-wedge'];
          if (isSel) cls.push('wv-petal-selected');
          if (isMatch === true) cls.push('wv-petal-search-match');
          if (isMatch === false) cls.push('wv-petal-search-dim');

          const petal = svg('path', {
            d: ringSectorPath(cx, cy, rPlace, rOuter, pa0, pa1),
            fill: colorVar,
            opacity: isSel ? 1 : 0.55,
            class: cls.join(' '),
            'data-id': f.id,
          });
          petal.addEventListener('click', (e) => {
            e.stopPropagation();
            if (selectedSet.has(f.id)) {
              view.controller.removeFromTray(f.id);
            } else {
              view.controller.addToTray(f.id);
            }
          });
          petal.addEventListener('mouseenter', () => view.controller.setHover(f.id));
          petal.addEventListener('mouseleave', () => view.controller.setHover(null));
          this.svg.appendChild(petal);

          // Petal label - curved text along the outer middle of the petal
          const labelId = `wv-petal-${pi}-${i}`;
          const labelR = (rPlace + rOuter) / 2;
          const aMid = (pa0 + pa1) / 2;
          // pick a direction so the text reads outward
          const flip = aMid > 0 && aMid < Math.PI;
          const arc = svg('path', {
            id: labelId,
            d: flip
              ? arcPathOnly(cx, cy, labelR, pa1, pa0)
              : arcPathOnly(cx, cy, labelR, pa0, pa1),
            fill: 'none', stroke: 'none',
          });
          this.svg.appendChild(arc);
          const txt = svg('text', { class: 'wv-petal-text' });
          const tp2 = document.createElementNS(NS, 'textPath');
          tp2.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + labelId);
          tp2.setAttribute('href', '#' + labelId);
          tp2.setAttribute('startOffset', '50%');
          tp2.setAttribute('text-anchor', 'middle');
          tp2.textContent = f.name;
          txt.appendChild(tp2);
          this.svg.appendChild(txt);
        });
      });
    },
  };

  function svg(name, attrs) {
    const el = document.createElementNS(NS, name);
    if (attrs) for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function pt(cx, cy, r, a) {
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  }

  function ringSectorPath(cx, cy, r0, r1, a0, a1) {
    const largeArc = (a1 - a0) > Math.PI ? 1 : 0;
    const [x0a, y0a] = pt(cx, cy, r1, a0);
    const [x1a, y1a] = pt(cx, cy, r1, a1);
    const [x1b, y1b] = pt(cx, cy, r0, a1);
    const [x0b, y0b] = pt(cx, cy, r0, a0);
    return `M ${x0a},${y0a} A ${r1},${r1} 0 ${largeArc} 1 ${x1a},${y1a} L ${x1b},${y1b} A ${r0},${r0} 0 ${largeArc} 0 ${x0b},${y0b} Z`;
  }

  function arcPathOnly(cx, cy, r, a0, a1) {
    const sweep = a1 > a0 ? 1 : 0;
    const largeArc = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
    const [x0, y0] = pt(cx, cy, r, a0);
    const [x1, y1] = pt(cx, cy, r, a1);
    return `M ${x0},${y0} A ${r},${r} 0 ${largeArc} ${sweep} ${x1},${y1}`;
  }

  function shortPlaceLabel(place) {
    return place
      .replace(/^When (We're|We Feel|We Compare|We Search for Connection|We Fall Short|It's Beyond Us|Things|Life Is Good|the Heart Is Open) /i, (m, p1) => `${p1.toUpperCase()}: `)
      .toUpperCase();
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
    window.AtlasViews.wheel = view;
  }
})();
