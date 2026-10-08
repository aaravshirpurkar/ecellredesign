// Count-up animation for the E-Cell RSCOE stats cards.
(function () {
  function animate(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const raw = el.textContent.trim();
    const m = raw.match(/^([\d,]+)(\+?)(.*)$/);
    if (!m || /^\D/.test(raw)) return;
    const target = parseInt(m[1].replace(/,/g, ''), 10);
    const suffix = m[2] || '';
    const rest = m[3] ? m[3].toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase()) : '';
    const dur = 1600;
    const t0 = performance.now();
    function tick(t) {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const val = Math.round(target * eased);
      el.textContent = val.toLocaleString('en-US') + (p === 1 ? suffix + rest : suffix + rest);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = m[1] + suffix + rest; // restore title-cased rest text
    }
    requestAnimationFrame(tick);
  }

  function init() {
    const els = document.querySelectorAll('.stats-card p, section.relative.min-h-screen .font-black');
    const targets = [...els].filter((e) => /^[\d,]+\+?/.test(e.textContent.trim()));
    if (!targets.length) return false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    targets.forEach((e) => io.observe(e));
    return true;
  }

  // React mounts asynchronously; keep watching for SPA re-renders.
  setInterval(() => {
    init();
  }, 500);

  // Normalize Instagram handle display to e_cell_rscoe
  setTimeout(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (n.textContent.includes('@E_CELL_RSCOE')) n.textContent = n.textContent.replace(/@E_CELL_RSCOE/g, 'e_cell_rscoe');
    }
  }, 1200);

  // Pillars graphic: full-width SVG columns; hovering a pillar reveals its detail card below
  setInterval(() => {
    if (document.querySelector('svg.pillars-svg')) return;
    const h = [...document.querySelectorAll('h2')].find((e) => /Three Pillars/.test(e.textContent));
    if (!h) return;
    const sec = h.closest('section');
    const head = h.parentElement;
    // hide the three detail cards until a pillar is hovered; normalize to equal size
    const cards = [...sec.querySelectorAll('.group')].filter((g) => /0[123]/.test(g.textContent)).slice(0, 3);
    cards.forEach((c) => {
      c.style.opacity = '0';
      c.style.visibility = 'hidden';
      c.style.transition = 'opacity .4s ease';
      c.style.width = '320px';
      c.style.maxWidth = '320px';
      c.style.margin = '0 auto';
      c.style.transform = 'none';
      c.querySelectorAll('div').forEach((d) => {
        const cl = (d.className && d.className.toString) ? d.className.toString() : '';
        if (/w-40|w-36|w-48|w-42/.test(cl) && /h-40|h-36|h-48|h-42/.test(cl)) {
          d.style.width = '192px';
          d.style.height = '192px';
          d.style.marginBottom = '3rem';
        }
      });
    });
    // sticky reveal: once a pillar is hovered its card stays visible until refresh
    const reveal = (i) => {
      cards[i].style.opacity = '1';
      cards[i].style.visibility = 'visible';
    };
    const W = 1200, H = 400;
    const mk = (tag, attrs) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      return el;
    };
    const svg = mk('svg', { viewBox: `0 0 ${W} ${H}`, class: 'pillars-svg', style: 'width:100%;max-width:1100px;display:block;margin:0 auto 1rem;' });
    // platform spanning the full section width
    svg.appendChild(mk('rect', { x: 20, y: 16, width: W - 40, height: 52, rx: 10, fill: 'rgba(255,255,255,0.06)', stroke: 'rgba(168,85,247,0.6)' }));
    const t = mk('text', { x: W / 2, y: 52, 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 800, 'font-family': 'Plus Jakarta Sans, sans-serif', fill: '#a78bfa' });
    t.textContent = 'E-Cell RSCOE';
    svg.appendChild(t);
    const labels = ['The Innovation', 'The Execution', 'The Impact'];
    const colors = ['#3b82f6', '#a855f7', '#10b981'];
    const groups = [];
    for (let i = 0; i < 3; i++) {
      const cx = 200 + i * 400;
      const g = mk('g', { style: 'cursor:pointer;transition:opacity .3s' });
      // capital
      g.appendChild(mk('path', { d: `M ${cx - 70} 68 L ${cx + 70} 68 L ${cx + 52} 92 L ${cx - 52} 92 Z`, fill: colors[i] }));
      g.appendChild(mk('rect', { x: cx - 52, y: 92, width: 104, height: 12, fill: colors[i] }));
      // fluted shaft
      g.appendChild(mk('rect', { x: cx - 48, y: 104, width: 96, height: 210, fill: colors[i], opacity: 0.75 }));
      for (let f = -36; f <= 36; f += 12) {
        g.appendChild(mk('line', { x1: cx + f, y1: 104, x2: cx + f, y2: 314, stroke: 'rgba(0,0,0,0.25)', 'stroke-width': 4 }));
      }
      // base
      g.appendChild(mk('rect', { x: cx - 52, y: 314, width: 104, height: 12, fill: colors[i] }));
      g.appendChild(mk('path', { d: `M ${cx - 52} 326 L ${cx + 52} 326 L ${cx + 70} 348 L ${cx - 70} 348 Z`, fill: colors[i] }));
      // hover label
      const lbl = mk('text', { x: cx, y: 384, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, 'font-family': 'Plus Jakarta Sans, sans-serif', fill: '#fff', opacity: 0, style: 'transition:opacity .3s' });
      lbl.textContent = labels[i];
      g.appendChild(lbl);
      g.addEventListener('mouseenter', () => {
        lbl.setAttribute('opacity', 1);
        groups.forEach((o, j) => o.setAttribute('opacity', j === i ? 1 : 0.45));
        reveal(i);
      });
      g.addEventListener('click', () => { lbl.setAttribute('opacity', 1); reveal(i); });
      groups.push(g);
      svg.appendChild(g);
    }
    svg.addEventListener('mouseleave', () => {
      groups.forEach((o) => o.setAttribute('opacity', 1));
    });
    head.after(svg);
  }, 1500);

  // Normalize Instagram handle display to e_cell_rscoe
  setTimeout(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (n.textContent.includes('@E_CELL_RSCOE')) n.textContent = n.textContent.replace(/@E_CELL_RSCOE/g, 'e_cell_rscoe');
    }
  }, 1200);

  // Mixed case: de-uppercase headings and small uppercase labels
  const MINOR = new Set(['a','an','the','and','but','or','nor','for','so','yet','as','at','by','in','of','on','to','up','via','vs','per','is','are','was','were','be','with','from','into','over','under','after','before','between']);
  function titleCase(s) {
    const parts = s.toLowerCase().split(/(\s+)/);
    const wi = parts.map((w, i) => (/^\s*$/.test(w) ? -1 : i)).filter((i) => i >= 0);
    return parts.map((w, i) => {
      if (/^\s*$/.test(w)) return w;
      const pos = wi.indexOf(i);
      const prev = parts.slice(0, i).join('');
      const afterColon = /[:]\s*$/.test(prev);
      if (pos === 0 || pos === wi.length - 1 || afterColon || !MINOR.has(w)) {
        if (w === 'e-cell') return 'E-Cell';
        if (w === 'rscoe') return 'RSCOE';
        return w.charAt(0).toUpperCase() + w.slice(1);
      }
      if (w === 'e-cell') return 'E-Cell';
      if (w === 'rscoe') return 'RSCOE';
      return w;
    }).join('');
  }
  const iv3 = setInterval(() => {
    const els = document.querySelectorAll('h1,h2,h3,h4,h5,h6,.uppercase,section span[class*="text-6xl"]');
    if (els.length) {
      els.forEach((el) => {
        if (el.closest('nav,a,button')) return;
        if (el.classList && el.classList.contains('uppercase') && !el.closest('nav,a,button')) el.classList.remove('uppercase');
        el.childNodes.forEach(function walk(node) {
          if (node.nodeType === 3 && /[A-Z]/.test(node.textContent) && node.textContent === node.textContent.toUpperCase()) {
            // element-level context: only convert if the whole heading is uppercase,
            // so first/last-word rules apply across split text nodes
            const full = el.textContent;
            if (full === full.toUpperCase()) {
              const nodes = [];
              (function gather(n) { [...n.childNodes].forEach((c) => { if (c.nodeType === 3) nodes.push(c); else gather(c); }); })(el);
              const converted = titleCase(full);
              let off = 0;
              nodes.forEach((n) => {
                const len = n.textContent.length;
                n.textContent = converted.substr(off, len);
                off += len;
              });
            } else {
              node.textContent = titleCase(node.textContent);
            }
          }
          node.childNodes && [...node.childNodes].forEach(walk);
        });
        // center the Latest Insights header block on home
        const li = [...document.querySelectorAll('h2')].find((x) => /Latest Insights/.test(x.textContent));
        if (li && li.parentElement && li.parentElement.parentElement) {
          const box = li.parentElement.parentElement;
          box.style.display = 'flex';
          box.style.flexDirection = 'column';
          box.style.alignItems = 'center';
          box.style.textAlign = 'center';
        }
      });
      // persistent: keep watching for SPA re-renders (all operations idempotent)
    }
  }, 1000);

  // Article body readability: reflow single-sentence lines into real paragraphs
  function formatArticle() {
    if (!/blogdetails/.test(location.pathname + location.search)) return;
    const body = document.querySelector('div.whitespace-pre-line');
    if (!body || body.querySelector('*')) return; // only raw-text bodies
    const raw = body.textContent || '';
    if (raw.length < 200) return;
    const sig = raw.length + ':' + raw.slice(0, 60);
    if (body.dataset.fmtSig === sig) return;
    body.dataset.fmtSig = sig;
    const P = (t) => {
      const p = document.createElement('p');
      p.textContent = t;
      p.style.cssText = 'margin:0 0 1.4rem;font-size:1.05rem;line-height:1.85;color:#cbd5e1;';
      return p;
    };
    const H = (t) => {
      const h = document.createElement('h3');
      h.textContent = t;
      h.style.cssText = 'margin:2.4rem 0 1rem;font-family:"Plus Jakarta Sans",sans-serif;font-weight:800;font-size:1.35rem;line-height:1.4;color:#fff;';
      return h;
    };
    const Q = (t) => {
      const q = document.createElement('p');
      q.textContent = t;
      q.style.cssText = 'margin:0 0 1.4rem;padding-left:1rem;border-left:3px solid #a855f7;font-style:italic;font-size:1.1rem;line-height:1.8;color:#f1f5f9;';
      return q;
    };
    const isHead = (l, next) => l.length > 0 && l.length < 70 && !/[.?!:;,'"…"”]$/.test(l) && next && next.length > 0;
    const isQuote = (l) => /^["“]/.test(l) && /["”]$/.test(l);
    const lines = raw.split('\n').map((l) => l.trim());
    const frag = document.createDocumentFragment();
    let short = [];
    const flushShort = () => { if (short.length) { frag.appendChild(P(short.join(' '))); short = []; } };
    lines.forEach((l, i) => {
      if (!l) { flushShort(); return; }
      const next = lines[i + 1] || '';
      if (isHead(l, next)) { flushShort(); frag.appendChild(H(l)); return; }
      if (isQuote(l)) { flushShort(); frag.appendChild(Q(l)); return; }
      if (l.length < 60) { short.push(l); return; }
      flushShort();
      frag.appendChild(P(l));
    });
    flushShort();
    body.textContent = '';
    body.appendChild(frag);
    body.style.fontSize = '';
  }
  setInterval(() => {
    try { formatArticle(); } catch (e) {}
    try { tuneEvents(); } catch (e) {}
    try { centerBlogHero(); } catch (e) {}
    try { fixInstagram(); } catch (e) {}
    try { centerSpeakerOverlays(); } catch (e) {}
    try { tuneContact(); } catch (e) {}
    try { countUpInnovators(); } catch (e) {}
    try { centerLoneBranch(); } catch (e) {}
    try { centerConnect(); } catch (e) {}
  }, 1000);

  // Normalize Instagram handle display to e_cell_rscoe (persistent for SPA re-renders)
  function fixInstagram() {
    if (!document.body.textContent.includes('e_cell_rscoe') && !document.body.textContent.includes('E_CELL_RSCOE')) return;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (n.textContent.includes('@E_CELL_RSCOE')) n.textContent = n.textContent.replace(/@E_CELL_RSCOE/g, 'e_cell_rscoe');
      if (n.textContent.includes('@e_cell_rscoe')) n.textContent = n.textContent.replace(/@e_cell_rscoe/g, 'e_cell_rscoe');
    }
  }

  // Speaker photo hover overlays: center name + role
  function centerSpeakerOverlays() {
    document.querySelectorAll('div.absolute.inset-0').forEach((d) => {
      if (d.dataset.sc) return;
      const cl = d.className.toString();
      if (!/group-hover/.test(cl) || !d.querySelector('h3')) return;
      d.dataset.sc = '1';
      d.style.alignItems = 'center';
      d.style.textAlign = 'center';
      d.querySelectorAll('h3,p').forEach((x) => {
        x.style.textAlign = 'center';
        x.style.marginLeft = 'auto';
        x.style.marginRight = 'auto';
      });
    });
  }

  // Home "Connect with the E-Cell Team": center text + cards
  function centerConnect() {
    if (/blogdetails|contact|events|team|gallery|e-summit|about/.test(location.pathname)) return;
    const h = [...document.querySelectorAll('h2')].find((e) => /connect with/i.test(e.textContent));
    if (!h) return;
    const sec = h.closest('section');
    if (!sec || sec.dataset.centered) return;
    sec.dataset.centered = '1';
    const cont = sec.querySelector('.container');
    if (cont) {
      cont.style.display = 'flex';
      cont.style.flexDirection = 'column';
      cont.style.alignItems = 'center';
      cont.style.textAlign = 'center';
    }
    const grid = sec.querySelector('.grid');
    if (grid) {
      grid.style.maxWidth = '760px';
      grid.style.width = '100%';
      grid.style.marginLeft = 'auto';
      grid.style.marginRight = 'auto';
    }
    sec.querySelectorAll('div').forEach((d) => {
      const c = d.className.toString();
      if (/^flex /.test(c) || / flex /.test(' ' + c)) d.style.justifyContent = 'center';
    });
  }
  // Contact page: properly center the section and use the available space
  function tuneContact() {
    document.querySelectorAll('a[href^="mailto:ecellrscoe01@gmail.com"]').forEach((m) => {
      m.setAttribute('href', 'mailto:contact@ecellrscoe.org');
      if (m.textContent.includes('ecellrscoe01@gmail.com')) m.textContent = m.textContent.replace(/ecellrscoe01@gmail\.com/g, 'contact@ecellrscoe.org');
    });
    if (!/\/contact/.test(location.pathname)) return;
    const main = document.querySelector('main');
    if (!main) return;
    if (!main.dataset.contactLayout) {
      main.dataset.contactLayout = '1';
      main.style.maxWidth = '1120px';
      main.style.textAlign = 'center';
      main.style.display = 'flex';
      main.style.flexDirection = 'column';
      main.style.justifyContent = 'center';
      main.style.alignItems = 'stretch';
      main.style.paddingTop = '9rem';
      main.style.paddingBottom = '5rem';
    }
    // heading block stays a centered column above the cards
    const head = main.firstElementChild;
    if (head && !head.dataset.contactHead) {
      head.dataset.contactHead = '1';
      head.style.maxWidth = '660px';
      head.style.margin = '0 auto 4.5rem';
    }
    // cards fill the leftover width/height and center their own content
    const grid = main.querySelector('.grid');
    if (!grid) return;
    grid.style.flex = '1 1 auto';
    grid.style.alignItems = 'stretch';
    grid.style.minHeight = '360px';
    [...grid.children].forEach((c) => {
      c.style.display = 'flex';
      c.style.flexDirection = 'column';
      c.style.justifyContent = 'center';
      c.style.alignItems = 'center';
      c.style.textAlign = 'center';
      c.style.height = '100%';
      c.style.padding = '3.25rem 2.75rem';
      c.querySelectorAll('div').forEach((d) => {
        if (/(^|\s)flex(\s|$)/.test(d.className.toString())) {
          d.style.justifyContent = 'center';
          d.style.alignItems = 'center';
        }
      });
    });
  }

  // About page: count up the "100+ student innovators and leaders" figure
  function countUpInnovators() {
    if (!/\/about/.test(location.pathname)) return;
    const el = [...document.querySelectorAll('span')].find((e) => /^\d+\+\s*student innovators/i.test(e.textContent.trim()));
    if (!el || el.dataset.counted) return;
    el.dataset.counted = '1';
    const raw = el.textContent.trim();
    const m = raw.match(/^([\d,]+)(\+)(.*)$/);
    if (!m) return;
    const target = parseInt(m[1].replace(/,/g, ''), 10);
    const tail = m[2] + m[3]; // "+ student innovators and leaders"
    const dur = 1800;
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased).toLocaleString('en-US') + tail;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = raw; // restore the exact original wording
    };
    requestAnimationFrame(tick);
  }

  // About page: center the lone "Branch 05" card inside the branch tree grid
  function centerLoneBranch() {
    if (!/\/about/.test(location.pathname)) return;
    const badge = [...document.querySelectorAll('span')].find((e) => /^Branch 05$/.test(e.textContent.trim()));
    if (!badge) return;
    let card = badge;
    while (card && !(card.parentElement && /(^|\s)grid(\s|$)/.test(card.parentElement.className.toString()))) card = card.parentElement;
    const grid = card && card.parentElement;
    if (!grid) return;
    const tpl = getComputedStyle(grid).gridTemplateColumns;
    const cols = (!tpl || tpl === 'none') ? 1 : tpl.split(' ').filter(Boolean).length;
    if (cols !== 2) { // single column: the card already spans full width
      card.style.gridColumn = '';
      card.style.width = '';
      card.style.justifySelf = '';
      return;
    }
    const w = Math.round(grid.children[0].getBoundingClientRect().width);
    card.style.gridColumn = '1 / -1';
    card.style.width = w + 'px';
    card.style.justifySelf = 'center';
    card.dataset.branchCentered = '1';
  }

  // Events: E-Summit first, with the generated '26 artwork on its card
  function tuneEvents() {
    if (!/\/events/.test(location.pathname)) return;
    const h = [...document.querySelectorAll('h1,h2,h3')].find((e) => /e-summit 2026/i.test(e.textContent));
    if (!h || h.dataset.esDone) return;
    h.dataset.esDone = '1';
    const card = h.closest('div.rounded-3xl') || h.parentElement;
    const row = card.parentElement;
    if (row && row.firstElementChild !== card) row.prepend(card);
    if (!card.querySelector('img')) {
      const wrap = document.createElement('div');
      wrap.className = 'h-48 sm:h-52 bg-black/90 overflow-hidden flex items-center justify-center border-b border-border/40 relative';
      const img = document.createElement('img');
      img.src = '/assets/esummit-2026.png';
      img.alt = 'E-SUMMIT 26';
      img.className = 'w-full h-full object-cover group-hover:scale-105 transition-transform duration-500';
      wrap.appendChild(img);
      card.prepend(wrap);
    }
    // hide the card's original placeholder visual now that the poster is in place
    [...card.children].forEach((ch) => {
      if (ch !== card.firstElementChild && ch.tagName === 'DIV' && /h-48|h-52/.test(ch.className.toString()) && !ch.querySelector('img')) {
        ch.style.display = 'none';
      }
    });
  }

  // Blog hero: center the title block
  function centerBlogHero() {
    if (!/\/blogdetails/.test(location.pathname) || /id=/.test(location.search)) return;
    const s = [...document.querySelectorAll('span')].find((x) => x.textContent.trim() === 'Blog');
    if (!s) return;
    const inner = s.closest('div.items-start') || s.closest('div.flex');
    if (!inner || inner.dataset.centered) return;
    inner.dataset.centered = '1';
    inner.style.alignItems = 'center';
    inner.style.textAlign = 'center';
  }

  // Blog article titles arrive from the CMS in inconsistent case — normalize unconditionally
  const iv4 = setInterval(() => {
    const titles = document.querySelectorAll('h3.text-xl, h3.text-lg, h3.text-base');
    if (titles.length) {
      titles.forEach((el) => {
        if (el.closest('nav')) return;
        const full = el.textContent;
        if (!/[A-Za-z]/.test(full)) return;
        const nodes = [];
        (function gather(n) { [...n.childNodes].forEach((c) => { if (c.nodeType === 3) nodes.push(c); else gather(c); }); })(el);
        const converted = titleCase(full);
        if (converted === full) return;
        let off = 0;
        nodes.forEach((n) => {
          const len = n.textContent.length;
          n.textContent = converted.substr(off, len);
          off += len;
        });
      });
    }
    // persistent: keep watching for SPA re-renders (conversion is idempotent)
  }, 1000);

})();
