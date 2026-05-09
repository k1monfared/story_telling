/* Atlas of Feelings — constellation Done flow.
 * Renders the selected set as a graph image, offers PNG download, copy-text,
 * and shareable URL.
 */

(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';

  const Constellation = {
    open(state) {
      const dialog = document.getElementById('constellation-dialog');
      const canvas = document.getElementById('constellation-canvas');
      const status = document.getElementById('dialog-status');
      const copyTextBtn = document.getElementById('copy-text-btn');
      const copyLinkBtn = document.getElementById('copy-link-btn');
      const downloadBtn = document.getElementById('download-png-btn');

      const { feelings, byId, selected, primary, placeColor } = state;
      if (!selected.length) return;

      canvas.innerHTML = '';
      const rect = canvas.getBoundingClientRect();
      const W = rect.width || 640;
      const H = rect.height || 360;
      const svg = el('svg', { width: '100%', height: '100%', viewBox: `0 0 ${W} ${H}` });
      svg.style.background = 'var(--header-bg)';
      canvas.appendChild(svg);

      const items = selected.map((id) => byId.get(id)).filter(Boolean);
      const cx = W / 2, cy = H / 2;

      // Layout: place selected feelings around a circle, larger if more important.
      const ringR = Math.min(W, H) / 2 - 80;
      const positions = items.map((f, i) => {
        const a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
        return { x: cx + ringR * Math.cos(a), y: cy + ringR * Math.sin(a), feeling: f };
      });

      // Draw edges between selected feelings that share a variation/complementary link
      const idSet = new Set(items.map((f) => f.id));
      positions.forEach((p, i) => {
        for (let j = i + 1; j < positions.length; j++) {
          const q = positions[j];
          const linked =
            (p.feeling.variations || []).includes(q.feeling.id) ||
            (p.feeling.complementaries || []).includes(q.feeling.id) ||
            (q.feeling.variations || []).includes(p.feeling.id) ||
            (q.feeling.complementaries || []).includes(p.feeling.id);
          if (linked) {
            const line = el('line', {
              x1: p.x, y1: p.y, x2: q.x, y2: q.y,
              stroke: 'var(--text-muted)', 'stroke-width': 1.2, opacity: 0.55,
            });
            svg.appendChild(line);
          }
        }
      });

      // Draw nodes
      positions.forEach((p) => {
        const f = p.feeling;
        const isPrimary = f.id === primary;
        const r = isPrimary ? 28 : 22;
        const fill = placeColor.get(f.place) || 'var(--text-muted)';
        const c = el('circle', {
          cx: p.x, cy: p.y, r,
          fill, stroke: 'var(--bg)', 'stroke-width': 2,
        });
        svg.appendChild(c);
        const t = el('text', {
          x: p.x, y: p.y + r + 14,
          'text-anchor': 'middle',
          'font-family': 'system-ui, sans-serif',
          'font-size': isPrimary ? 13 : 12,
          'font-weight': isPrimary ? 700 : 500,
          fill: 'var(--text)',
        });
        t.textContent = f.name;
        svg.appendChild(t);
      });

      // Center text: summary
      const summaryText = items.map((f) => f.name).join(' · ');
      const sub = el('text', {
        x: cx, y: cy + 6,
        'text-anchor': 'middle',
        'font-family': 'system-ui, sans-serif',
        'font-size': 11,
        fill: 'var(--text-muted)',
        'letter-spacing': '0.06em',
      });
      sub.textContent = items.length === 1 ? items[0].name.toUpperCase() : `${items.length} FEELINGS`;
      svg.appendChild(sub);

      // Wire actions
      const url = location.origin + location.pathname + '#' + buildHash(state);
      const text = buildSummaryText(state);

      copyTextBtn.onclick = async () => {
        await copy(text);
        flash(status, 'Text copied to clipboard.');
      };
      copyLinkBtn.onclick = async () => {
        await copy(url);
        flash(status, 'Link copied to clipboard.');
      };
      downloadBtn.onclick = () => {
        downloadSvgAsPng(svg, W * 2, H * 2, 'atlas-constellation.png');
        flash(status, 'PNG downloaded.');
      };

      status.textContent = '';
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
    },
  };

  // ─── helpers ─────────────────────────────────────────────
  function el(name, attrs) {
    const e = document.createElementNS(NS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function buildHash(state) {
    const parts = ['v=' + (state.view || 'graph')];
    parts.push('f=' + state.selected.join(','));
    if (state.primary) parts.push('p=' + state.primary);
    return parts.join('&');
  }

  function buildSummaryText(state) {
    const items = state.selected.map((id) => state.byId.get(id)).filter(Boolean);
    if (!items.length) return '';
    if (items.length === 1) return items[0].name;
    const names = items.map((f) => f.name);
    if (names.length === 2) return `${names[0]} and ${names[1]}`;
    return `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}`;
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      document.body.removeChild(ta);
    }
  }

  function flash(el, msg) {
    el.textContent = msg;
    clearTimeout(flash._t);
    flash._t = setTimeout(() => { el.textContent = ''; }, 2200);
  }

  function downloadSvgAsPng(svgEl, w, h, filename) {
    // Inline computed CSS variables so the rasterized PNG looks right.
    const cs = getComputedStyle(document.documentElement);
    const swap = {
      '--text': cs.getPropertyValue('--text').trim() || '#fff',
      '--text-muted': cs.getPropertyValue('--text-muted').trim() || '#aaa',
      '--bg': cs.getPropertyValue('--bg').trim() || '#111',
      '--header-bg': cs.getPropertyValue('--header-bg').trim() || '#1a1a1a',
    };
    for (let i = 0; i <= 12; i++) {
      const v = cs.getPropertyValue(`--place-${i}`).trim();
      if (v) swap[`--place-${i}`] = v;
    }
    const clone = svgEl.cloneNode(true);
    clone.setAttribute('xmlns', NS);
    let raw = new XMLSerializer().serializeToString(clone);
    Object.entries(swap).forEach(([k, v]) => {
      raw = raw.split(`var(${k})`).join(v);
    });
    const blob = new Blob([raw], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = swap['--header-bg'];
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((b) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }, 'image/png');
    };
    img.src = url;
  }

  if (typeof window !== 'undefined') {
    window.Constellation = Constellation;
  }
})();
