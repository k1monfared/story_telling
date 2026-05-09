/* Atlas of Feelings — wheel view.
 * 13 Place wedges arranged radially. Each petal is one feeling in that Place.
 * Tap petal → toggles tray membership. Tap a place band → adds the first
 * feeling in that place to the tray.
 *
 * Place labels: curved text along the inner band. Arcs are flipped in the
 * bottom half of the wheel so labels stay upright.
 * Petal labels: straight text rotated to run along the radial midline.
 * Letters always right-side-up; reading direction goes toward the rim on the
 * right half and toward the center on the left half (the standard wheel
 * convention).
 */

(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';

  // Short labels for the inner band. Each ≤ 8 chars to fit the wedge arc length.
  const SHORT_PLACE_LABELS = {
    "When Things Are Uncertain or Too Much": 'TOO MUCH',
    "When We Compare":                        'COMPARE',
    "When Things Don't Go as Planned":        'OFF PLAN',
    "When It's Beyond Us":                    'BEYOND',
    "When Things Aren't What They Seem":      'PARADOX',
    "When We're Hurting":                     'HURTING',
    "With Others":                             'OTHERS',
    "When We Fall Short":                      'FALLING',
    "When We Search for Connection":          'CONNECT',
    "When the Heart Is Open":                  'OPEN',
    "When Life Is Good":                       'LIFE',
    "When We Feel Wronged":                    'WRONGED',
    "To Self-Assess":                          'ASSESS',
  };

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
      const rInnerPlate = Math.max(48, rOuter * 0.14);
      const rPlace = rOuter * 0.62;

      const places = Array.from(placeIndex.entries())
        .sort((a, b) => a[1] - b[1])
        .map(([p]) => p);
      const byPlace = new Map(places.map((p) => [p, []]));
      feelings.forEach((f) => {
        if (byPlace.has(f.place)) byPlace.get(f.place).push(f);
      });

      const wedgeAngle = (Math.PI * 2) / places.length;
      const selectedSet = new Set(selected);
      const matchingSearch = search
        ? new Set(feelings.filter((f) => matchSearch(f, search)).map((f) => f.id))
        : null;

      // ─── Center plate (decorative) ─────────────────────────
      this.svg.appendChild(svg('circle', {
        cx, cy, r: rInnerPlate,
        fill: 'var(--bg)', stroke: 'var(--border)',
      }));
      const plateText = svg('text', {
        x: cx, y: cy + 4, 'text-anchor': 'middle',
        fill: 'var(--text-muted)', 'font-size': 11, 'font-weight': 600,
        'letter-spacing': '0.08em',
      });
      plateText.textContent = '87 FEELINGS';
      this.svg.appendChild(plateText);

      // ─── Wedges + petals ───────────────────────────────────
      places.forEach((place, pi) => {
        const a0 = -Math.PI / 2 + pi * wedgeAngle;
        const a1 = a0 + wedgeAngle;
        const aMid = (a0 + a1) / 2;
        const colorVar = placeColor.get(place);

        // Place band
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

        // Place label: straight text rotated along the radial midline of the
        // wedge, centered in the band. Same flip rule as petals so letters
        // stay upright on both halves of the wheel.
        const bandMidR = (rInnerPlate + rPlace) / 2;
        const blx = cx + bandMidR * Math.cos(aMid);
        const bly = cy + bandMidR * Math.sin(aMid);
        const flipBand = Math.cos(aMid) < 0;
        const bandRotDeg = aMid * 180 / Math.PI + (flipBand ? 180 : 0);
        const labelText = svg('text', {
          class: 'wv-place-label',
          transform: `translate(${blx.toFixed(2)},${bly.toFixed(2)}) rotate(${bandRotDeg.toFixed(1)})`,
          'text-anchor': 'middle',
          'dominant-baseline': 'middle',
        });
        labelText.textContent = SHORT_PLACE_LABELS[place] || place;
        labelText.style.pointerEvents = 'none';
        this.svg.appendChild(labelText);

        // Petals
        const items = byPlace.get(place) || [];
        if (!items.length) return;
        const petalCount = items.length;
        const subAngle = wedgeAngle / petalCount;

        items.forEach((f, i) => {
          const pa0 = a0 + i * subAngle;
          const pa1 = a0 + (i + 1) * subAngle;
          const paMid = (pa0 + pa1) / 2;
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

          // Petal label: anchor at the OUTER rim of the petal, text extends
          // inward only as far as the name needs. Lets us spend the saved
          // inner space on a bigger place band.
          // For petals on the right half (cos > 0), text reads outward and we
          // anchor to its END (so the last letter sits at the rim). On the left
          // half we rotate 180° to keep letters upright; that flips reading
          // direction, so we anchor to its START instead.
          const labelR = rOuter - 6;
          const lx = cx + labelR * Math.cos(paMid);
          const ly = cy + labelR * Math.sin(paMid);
          const flipPetal = Math.cos(paMid) < 0;
          const rotDeg = paMid * 180 / Math.PI + (flipPetal ? 180 : 0);
          const txt = svg('text', {
            class: 'wv-petal-text',
            transform: `translate(${lx.toFixed(2)},${ly.toFixed(2)}) rotate(${rotDeg.toFixed(1)})`,
            'text-anchor': flipPetal ? 'start' : 'end',
            'dominant-baseline': 'middle',
          });
          txt.textContent = f.name;
          txt.style.pointerEvents = 'none';
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
