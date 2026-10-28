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
    simplifyHome();
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

  // Home-page layout overrides, reapplied after client-side navigation.
  function simplifyHome() {
    if (location.pathname !== '/') return;
    document.querySelectorAll('h2, h3').forEach((heading) => {
      if (!/Three Pillars/i.test(heading.textContent.trim()) &&
          !/^Flagship Events?$/i.test(heading.textContent.trim())) return;
      const section = heading.closest('section');
      if (section) {
        section.dataset.homeRemoved = 'true';
        section.inert = true;
        section.setAttribute('aria-hidden', 'true');
      }
    });
    document.querySelectorAll('section.relative.min-h-screen a[href="/events"] button').forEach((button) => {
      button.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && /Our Initiatives/i.test(node.textContent)) {
          node.textContent = 'Browse Events ';
        }
      });
      const icon = button.querySelector('svg');
      if (icon && icon.classList.contains('lucide-arrow-down')) {
        icon.classList.replace('lucide-arrow-down', 'lucide-arrow-right');
        const paths = icon.querySelectorAll('path');
        if (paths.length === 2) {
          paths[0].setAttribute('d', 'M5 12h14');
          paths[1].setAttribute('d', 'm12 5 7 7-7 7');
        }
      }
    });
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

  // Pillars architecture: animated illustration with simple, unboxed captions.
  setInterval(() => {
    if (document.querySelector('svg.pillars-svg')) return;
    const h = [...document.querySelectorAll('h2')].find((e) => /Three Pillars/.test(e.textContent));
    if (!h) return;
    const sec = h.closest('section');
    if (sec.dataset.homeRemoved === 'true') return;
    const head = h.parentElement;

    // The three detailed cards ("the square thing")
    const cards = [...sec.querySelectorAll('.group')].filter((g) => /0[123]/.test(g.textContent)).slice(0, 3);
    if (cards.length < 3) return;

    // Keep React-owned cards mounted, but remove their visual and interactive UI.
    const cardsRow = cards[0].parentElement;
    if (cardsRow) {
      cardsRow.style.display = 'none';
      cardsRow.inert = true;
      cardsRow.setAttribute('aria-hidden', 'true');
    }

    const W = 1200;
    const mk = (tag, attrs) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      return el;
    };

    const svg = mk('svg', {
      viewBox: `0 70 ${W} 315`,
      class: 'pillars-svg',
      style: 'width:100%;max-width:1150px;display:block;margin:0 auto 1.5rem;overflow:visible;'
    });
    svg.setAttribute('role', 'group');
    svg.setAttribute('aria-label', 'The three pillars of E-Cell RSCOE');
    const defs = mk('defs', {});
    ['#3b82f6', '#a855f7', '#10b981'].forEach((color, i) => {
      const gradient = mk('linearGradient', { id: `pillar-metal-${i}`, x1: '0%', y1: '0%', x2: '100%', y2: '0%' });
      [['0%', '#101827'], ['30%', color], ['50%', '#e2e8f0'], ['65%', color], ['100%', '#101827']].forEach(([offset, value]) => {
        gradient.appendChild(mk('stop', { offset, 'stop-color': value }));
      });
      defs.appendChild(gradient);
    });
    svg.appendChild(defs);
    svg.appendChild(mk('path', { d: 'M 140 370 H 1060', stroke: '#64748b', 'stroke-opacity': '.25', 'stroke-width': '1', fill: 'none' }));

    const colors = ['#3b82f6', '#a855f7', '#10b981'];
    const names = ['Innovation', 'Execution', 'Impact'];
    const descriptions = ['Turning ideas into viable solutions.', 'Bringing ideas to life through action.', 'Creating lasting value for society.'];
    const meanings = names.map((name, i) => `${name} — ${descriptions[i]}`);

    // All 3 Pillars are the exact same size:
    // cx: 240, 600, 960
    // topY: 86
    // shaftTop: 114
    // shaftBot: 334 (height: 220px)
    // botY: 368 (base height: 34px)
    // width: 104 (uniform shaft width)
    const pillarConfigs = [
      { cx: 240, topY: 86, shaftTop: 114, shaftBot: 334, botY: 368, width: 104, num: '01' },
      { cx: 600, topY: 86, shaftTop: 114, shaftBot: 334, botY: 368, width: 104, num: '02' },
      { cx: 960, topY: 86, shaftTop: 114, shaftBot: 334, botY: 368, width: 104, num: '03' }
    ];

    pillarConfigs.forEach((cfg, i) => {
      const g = mk('g', {
        class: 'pillar-group pillar-active',
        'data-index': i,
        'aria-label': meanings[i],
        style: `--pillar-color:${colors[i]};--pillar-delay:${i * 140}ms;`
      });
      const body = mk('g', { class: 'pillar-body' });
      g.appendChild(body);

      const halfW = cfg.width / 2;
      const capW = cfg.width + 28;
      const halfCapW = capW / 2;

      // Capital (Top molding)
      body.appendChild(mk('path', {
        d: `M ${cfg.cx - halfCapW} ${cfg.topY} L ${cfg.cx + halfCapW} ${cfg.topY} L ${cfg.cx + halfW + 6} ${cfg.shaftTop} L ${cfg.cx - halfW - 6} ${cfg.shaftTop} Z`,
        fill: colors[i]
      }));
      body.appendChild(mk('rect', {
        x: cfg.cx - halfW - 6, y: cfg.shaftTop - 8,
        width: cfg.width + 12, height: 8,
        fill: colors[i]
      }));

      // Fluted Shaft
      body.appendChild(mk('rect', {
        x: cfg.cx - halfW, y: cfg.shaftTop,
        width: cfg.width, height: cfg.shaftBot - cfg.shaftTop,
        fill: `url(#pillar-metal-${i})`, opacity: '0.8'
      }));

      // Shaft fluting lines
      const step = cfg.width / 7;
      for (let f = 1; f < 7; f++) {
        body.appendChild(mk('line', {
          x1: cfg.cx - halfW + f * step, y1: cfg.shaftTop,
          x2: cfg.cx - halfW + f * step, y2: cfg.shaftBot,
          stroke: 'rgba(0,0,0,0.3)', 'stroke-width': '3.5'
        }));
      }

      // Center glowing core badge with number
      const coreY = (cfg.shaftTop + cfg.shaftBot) / 2;
      body.appendChild(mk('path', {
        d: `M ${cfg.cx} ${cfg.shaftBot - 8} V ${cfg.shaftTop + 8}`,
        class: 'pillar-energy', stroke: '#ffffff', 'stroke-width': '2', fill: 'none',
        'stroke-dasharray': '18 202', 'stroke-linecap': 'round'
      }));
      body.appendChild(mk('circle', {
        cx: cfg.cx, cy: coreY, r: 34, class: 'pillar-core-ring',
        fill: 'none', stroke: colors[i], 'stroke-width': '1', opacity: '.5'
      }));
      body.appendChild(mk('circle', {
        cx: cfg.cx, cy: coreY, r: 24,
        fill: '#090d16', stroke: colors[i], 'stroke-width': '2.5'
      }));
      const coreNum = mk('text', {
        x: cfg.cx, y: coreY + 6,
        'text-anchor': 'middle', 'font-size': '15', 'font-weight': '800',
        'font-family': 'JetBrains Mono, monospace', fill: colors[i]
      });
      coreNum.textContent = cfg.num;
      body.appendChild(coreNum);

      // Base plinth
      body.appendChild(mk('rect', {
        x: cfg.cx - halfW - 6, y: cfg.shaftBot,
        width: cfg.width + 12, height: 10,
        fill: colors[i]
      }));
      body.appendChild(mk('path', {
        d: `M ${cfg.cx - halfW - 6} ${cfg.shaftBot + 10} L ${cfg.cx + halfW + 6} ${cfg.shaftBot + 10} L ${cfg.cx + halfCapW} ${cfg.botY} L ${cfg.cx - halfCapW} ${cfg.botY} Z`,
        fill: colors[i]
      }));

      svg.appendChild(g);
    });

    head.after(svg);
    const captions = document.createElement('div');
    captions.className = 'pillar-captions';
    meanings.forEach((meaning, i) => {
      const caption = document.createElement('p');
      const name = document.createElement('strong');
      name.textContent = names[i];
      const description = document.createElement('span');
      description.textContent = ` — ${descriptions[i]}`;
      caption.append(name, description);
      caption.style.setProperty('--pillar-color', colors[i]);
      captions.appendChild(caption);
    });
    svg.after(captions);

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      svg.classList.toggle('pillars-in-view', entry.isIntersecting);
      if (entry.isIntersecting) svg.classList.add('pillars-assembled');
      if (!svg.isConnected) visibilityObserver.disconnect();
    }, { threshold: 0.15 });
    visibilityObserver.observe(svg);

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
      const afterPunct = /[:.!?\n]\s*$/.test(prev);
      if (w.includes('.')) {
        return w.split('.').map((segment, sIdx) => {
          if (!segment) return '';
          if (sIdx > 0 || pos === 0 || pos === wi.length - 1 || afterPunct || !MINOR.has(segment)) {
            if (segment === 'e-cell') return 'E-Cell';
            if (segment === 'rscoe') return 'RSCOE';
            return segment.charAt(0).toUpperCase() + segment.slice(1);
          }
          return segment;
        }).join('.');
      }
      if (pos === 0 || pos === wi.length - 1 || afterPunct || !MINOR.has(w)) {
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
    try { renderBranchTree(); } catch (e) {}
    try { centerConnect(); } catch (e) {}
    try { tuneTitles(); } catch (e) {}
  }, 1000);

  // Animate moving highlights across title lead texts (Empowering Future & About)
  function tuneTitles() {
    // 1. Hero title
    const heroH1 = document.querySelector('section.relative.min-h-screen h1');
    if (heroH1) {
      if (!heroH1.dataset.leadHighlighted) {
        heroH1.childNodes.forEach((n) => {
          if (n.nodeType === 3 && /Empowering Future/i.test(n.textContent)) {
            const sp = document.createElement('span');
            sp.className = 'hero-lead-highlight';
            sp.textContent = 'Empowering Future ';
            sp.style.marginRight = '0.2rem';
            heroH1.replaceChild(sp, n);
            heroH1.dataset.leadHighlighted = '1';
          }
        });
      }
      const heroSpan = heroH1.querySelector('span.bg-clip-text');
      if (heroSpan && !heroSpan.classList.contains('team-gradient-text')) {
        heroSpan.classList.add('team-gradient-text');
      }
    }

    // 2. About page title
    const aboutH1 = document.querySelector('main h1');
    if (aboutH1 && /\/about/.test(location.pathname)) {
      if (!aboutH1.dataset.leadHighlighted) {
        aboutH1.childNodes.forEach((n) => {
          if (n.nodeType === 3 && /About/i.test(n.textContent)) {
            const sp = document.createElement('span');
            sp.className = 'about-title-lead';
            sp.textContent = 'About ';
            sp.style.marginRight = '0.35rem';
            aboutH1.replaceChild(sp, n);
            aboutH1.dataset.leadHighlighted = '1';
          }
        });
      }
      const aboutSpan = aboutH1.querySelector('span[class*="bg-clip-text"], span.bg-gradient-to-r');
      if (aboutSpan && !aboutSpan.classList.contains('team-gradient-text')) {
        aboutSpan.classList.add('team-gradient-text');
      }
    }

    // 3. Navbar brand
    const navRscoe = document.querySelector('nav a span.text-blue-500, header a span.text-blue-500');
    if (navRscoe && !navRscoe.classList.contains('team-gradient-text')) {
      navRscoe.classList.add('team-gradient-text');
    }
  }

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

  // Home "Connect with the E-Cell Team": full-width spacious bento layout utilizing the full space
  function centerConnect() {
    if (/blogdetails|contact|events|team|gallery|e-summit|about/.test(location.pathname)) return;
    const h = [...document.querySelectorAll('h2')].find((e) => /connect with/i.test(e.textContent));
    if (!h) return;
    const sec = h.closest('section');
    if (!sec) return;
    sec.setAttribute('id', 'contact');
    sec.classList.add('home-connect-section');
    sec.style.width = '100%';
    sec.style.paddingTop = '6rem';
    sec.style.paddingBottom = '7rem';

    const cont = sec.querySelector('.container');
    if (cont) {
      cont.style.maxWidth = '1200px';
      cont.style.width = '100%';
      cont.style.marginLeft = 'auto';
      cont.style.marginRight = 'auto';
      cont.style.paddingLeft = '1.5rem';
      cont.style.paddingRight = '1.5rem';
    }

    const outerGrid = sec.querySelector('.grid.gap-12') || sec.querySelector('.grid');
    if (outerGrid) {
      outerGrid.style.display = 'block';
      outerGrid.style.maxWidth = '100%';
      outerGrid.style.width = '100%';
      outerGrid.style.marginLeft = 'auto';
      outerGrid.style.marginRight = 'auto';
    }

    const spaceWrap = sec.querySelector('.space-y-8') || sec.querySelector('.space-y-6') || sec.querySelector('.max-w-3xl');
    if (spaceWrap) {
      spaceWrap.style.maxWidth = '100%';
      spaceWrap.style.width = '100%';
    }

    // Header elements: center them
    const pLabel = spaceWrap ? spaceWrap.querySelector('p:first-of-type') : null;
    if (pLabel) {
      if (/^contact$/i.test(pLabel.textContent.trim())) pLabel.style.display = 'none';
      pLabel.style.textAlign = 'center';
      pLabel.style.letterSpacing = '0.3em';
      pLabel.style.marginBottom = '0.5rem';
    }
    h.style.textAlign = 'center';
    h.style.marginBottom = '1rem';

    const pDesc = spaceWrap ? spaceWrap.querySelector('p.text-muted-foreground') : null;
    if (pDesc) {
      pDesc.style.textAlign = 'center';
      pDesc.style.maxWidth = '680px';
      pDesc.style.marginLeft = 'auto';
      pDesc.style.marginRight = 'auto';
      pDesc.style.marginBottom = '3.5rem';
      pDesc.style.fontSize = '1.1rem';
      pDesc.style.lineHeight = '1.6';
    }

    // Cards list: single-column wide horizontal stack matching Image 2
    const cardsGrid = sec.querySelector('.rounded-2xl')?.parentElement || (spaceWrap ? spaceWrap.querySelector('.grid') : null);
    if (cardsGrid) {
      cardsGrid.style.display = 'flex';
      cardsGrid.style.flexDirection = 'column';
      cardsGrid.style.gap = '1rem';
      cardsGrid.style.maxWidth = '820px';
      cardsGrid.style.width = '100%';
      cardsGrid.style.marginLeft = 'auto';
      cardsGrid.style.marginRight = 'auto';

      const cards = [...cardsGrid.children];
      cards.forEach((card, idx) => {
        card.style.width = '100%';
        card.style.gridColumn = 'auto';
        card.style.background = 'rgba(13, 17, 28, 0.75)';
        card.style.backdropFilter = 'blur(12px)';
        card.style.border = '1px solid rgba(255, 255, 255, 0.08)';
        card.style.borderRadius = '1rem';
        card.style.padding = '1.25rem 1.75rem';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.justifyContent = 'center';
        card.style.transition = 'all 0.25s ease';
        card.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.25)';

        // Inner row alignment: icons strictly left-aligned
        card.querySelectorAll('div').forEach((d) => {
          if (/(^|\s)flex(\s|$)/.test(d.className.toString())) {
            d.style.justifyContent = 'flex-start';
            d.style.alignItems = idx === 2 ? 'flex-start' : 'center'; // phone card has two numbers
            d.style.textAlign = 'left';
            d.style.width = '100%';
            d.style.gap = '1.25rem';
          }
        });

        // Icon box styling - BLUE
        const iconDiv = card.querySelector('.rounded-xl') || card.querySelector('.flex > div:first-child');
        if (iconDiv) {
          iconDiv.style.width = '46px';
          iconDiv.style.height = '46px';
          iconDiv.style.minWidth = '46px';
          iconDiv.style.flexShrink = '0';
          iconDiv.style.display = 'flex';
          iconDiv.style.alignItems = 'center';
          iconDiv.style.justifyContent = 'center';
          iconDiv.style.borderRadius = '0.875rem';
          iconDiv.style.background = 'rgba(59, 130, 246, 0.12)';
          iconDiv.style.color = '#60a5fa';
          iconDiv.style.border = '1px solid rgba(59, 130, 246, 0.3)';
          const svg = iconDiv.querySelector('svg');
          if (svg) svg.style.stroke = '#60a5fa';
        }

        // Card typography
        card.querySelectorAll('p.font-medium').forEach((p) => {
          p.style.fontSize = '1rem';
          p.style.fontWeight = '600';
          p.style.color = '#f8fafc';
          p.style.marginBottom = '0.25rem';
          p.style.textAlign = 'left';
        });
        card.querySelectorAll('a, p.text-muted-foreground, p:not(.font-medium)').forEach((el) => {
          el.style.textAlign = 'left';
          el.style.color = '#60a5fa';
        });
      });
    }
  }

  // Contact page: align icons cleanly on the left inside cards
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
      head.style.textAlign = 'center';
    }
    // cards fill the leftover width/height and have cleanly aligned icons
    const grid = main.querySelector('.grid');
    if (!grid) return;
    grid.style.flex = '1 1 auto';
    grid.style.alignItems = 'stretch';
    grid.style.minHeight = '360px';
    [...grid.children].forEach((c) => {
      c.style.display = 'flex';
      c.style.flexDirection = 'column';
      c.style.justifyContent = 'flex-start';
      c.style.alignItems = 'stretch';
      c.style.textAlign = 'left';
      c.style.height = '100%';
      c.style.padding = '3rem 2.5rem';
      const h2 = c.querySelector('h2');
      if (h2) {
        h2.style.textAlign = 'center';
        h2.style.marginBottom = '2rem';
      }
      c.querySelectorAll('div').forEach((d) => {
        if (/(^|\s)flex(\s|$)/.test(d.className.toString())) {
          d.style.justifyContent = 'flex-start';
          d.style.alignItems = 'center';
          d.style.textAlign = 'left';
          d.style.width = '100%';
        }
      });
      // Ensure icon wrappers have identical fixed dimensions and left alignment
      c.querySelectorAll('svg').forEach((svg) => {
        const iconWrap = svg.parentElement;
        if (iconWrap && /rounded-2xl/.test(iconWrap.className.toString())) {
          iconWrap.style.width = '46px';
          iconWrap.style.height = '46px';
          iconWrap.style.minWidth = '46px';
          iconWrap.style.flexShrink = '0';
          iconWrap.style.display = 'flex';
          iconWrap.style.alignItems = 'center';
          iconWrap.style.justifyContent = 'center';
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

  // About page: render the organic tree architecture with Core Platform as base
  function renderBranchTree() {
    if (!/\/about/.test(location.pathname)) return;
    const blueprint = [...document.querySelectorAll('main h2')].find((heading) => /Strategic Blueprint/i.test(heading.textContent));
    if (blueprint) {
      let block = blueprint.parentElement;
      const main = blueprint.closest('main');
      while (block.parentElement && block.parentElement !== main) block = block.parentElement;
      block.style.display = 'none';
      block.inert = true;
      block.setAttribute('aria-hidden', 'true');
    }
    const p = [...document.querySelectorAll('p')].find((el) => el.textContent.includes('Core Platform & Branch Tree'));
    if (!p) return;
    const headerBox = p.parentElement;
    const container = headerBox && headerBox.parentElement;
    if (!container) return;

    if (document.getElementById('branch-tree-interactive-container')) {
      if (window._updateTreeLines) window._updateTreeLines();
      return;
    }

    const corePlatformDiv = container.querySelector('.flex.flex-col.items-center.justify-center');
    const branchesGrid = container.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
    if (!corePlatformDiv || !branchesGrid) return;

    const oldWire = corePlatformDiv.querySelector('.w-0\\.5');
    if (oldWire) oldWire.remove();

    corePlatformDiv.className = 'tree-base-platform relative z-20 mt-12 flex flex-col items-center justify-center';
    corePlatformDiv.style.marginBottom = '0';
    container.appendChild(corePlatformDiv);

    const cards = [...branchesGrid.children];
    if (cards.length < 5) return;
    cards.forEach((card) => {
      card.querySelectorAll('span').forEach((label) => {
        if (/^Branch\s+\d+$/i.test(label.textContent.trim())) label.style.display = 'none';
      });
    });

    const treeWrapper = document.createElement('div');
    treeWrapper.id = 'branch-tree-interactive-container';
    treeWrapper.className = 'relative w-full max-w-6xl mx-auto my-8';

    container.insertBefore(treeWrapper, corePlatformDiv);

    const tiersContainer = document.createElement('div');
    tiersContainer.className = 'tree-tiers relative z-10 flex flex-col w-full';

    // Tier Top: Branch 05 (Canopy)
    const topRow = document.createElement('div');
    topRow.className = 'tree-tier tree-tier-top flex justify-center items-center w-full';
    cards[4].id = 'tree-card-05';
    cards[4].style.width = '100%';
    cards[4].style.maxWidth = '440px';
    cards[4].style.margin = '0 auto';
    topRow.appendChild(cards[4]);

    // Tier Mid: Branch 03 & Branch 04
    const midRow = document.createElement('div');
    midRow.className = 'tree-tier tree-tier-mid grid grid-cols-1 md:grid-cols-2 w-full';
    midRow.style.columnGap = '150px';
    midRow.style.rowGap = '3.5rem';
    cards[2].id = 'tree-card-03';
    cards[3].id = 'tree-card-04';
    midRow.appendChild(cards[2]);
    midRow.appendChild(cards[3]);

    // Tier Low: Branch 01 & Branch 02
    const lowRow = document.createElement('div');
    lowRow.className = 'tree-tier tree-tier-low grid grid-cols-1 md:grid-cols-2 w-full';
    lowRow.style.columnGap = '150px';
    lowRow.style.rowGap = '3.5rem';
    cards[0].id = 'tree-card-01';
    cards[1].id = 'tree-card-02';
    lowRow.appendChild(cards[0]);
    lowRow.appendChild(cards[1]);

    tiersContainer.appendChild(topRow);
    tiersContainer.appendChild(midRow);
    tiersContainer.appendChild(lowRow);

    treeWrapper.appendChild(tiersContainer);
    treeWrapper.appendChild(corePlatformDiv);

    const baseCard = corePlatformDiv.querySelector('.relative.group.p-1');
    if (baseCard) {
      baseCard.id = 'tree-card-base';
      baseCard.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)';
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.id = 'tree-network-svg';
    svg.setAttribute('class', 'tree-svg-layer pointer-events-none absolute inset-0 w-full h-full');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100%';
    svg.style.height = '100%';
    svg.style.zIndex = '0';
    svg.style.overflow = 'visible';

    svg.innerHTML = `
      <defs>
        <linearGradient id="trunkGrad" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#3b82f6" />
          <stop offset="45%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#06b6d4" />
        </linearGradient>
        <linearGradient id="branchGradLeft" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#ec4899" />
        </linearGradient>
        <linearGradient id="branchGradRight" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#8b5cf6" />
          <stop offset="100%" stop-color="#06b6d4" />
        </linearGradient>
        <filter id="glowFilter" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="blur2" />
          <feMerge>
            <feMergeNode in="blur2" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g id="tree-roots-group" opacity="0.75"></g>
      <g id="tree-branches-group"></g>
      <g id="tree-nodes-group"></g>
    `;

    treeWrapper.appendChild(svg);
    branchesGrid.remove();

    function updateLines() {
      const wrapRect = treeWrapper.getBoundingClientRect();
      if (wrapRect.width === 0) return;

      const isMobile = window.innerWidth <= 768;

      const getPos = (id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        const r = el.getBoundingClientRect();
        return {
          x: r.left - wrapRect.left + r.width / 2,
          y: r.top - wrapRect.top + r.height / 2,
          top: r.top - wrapRect.top,
          bottom: r.bottom - wrapRect.top,
          left: r.left - wrapRect.left,
          right: r.right - wrapRect.left,
          width: r.width,
          height: r.height
        };
      };

      const cBase = getPos('tree-card-base');
      const c01 = getPos('tree-card-01');
      const c02 = getPos('tree-card-02');
      const c03 = getPos('tree-card-03');
      const c04 = getPos('tree-card-04');
      const c05 = getPos('tree-card-05');

      if (!cBase || !c01 || !c02 || !c03 || !c04 || !c05) return;

      const trunkX = cBase.x;
      const trunkBaseY = cBase.top;
      const trunkTopY = c05.bottom;

      const branchesG = document.getElementById('tree-branches-group');
      const nodesG = document.getElementById('tree-nodes-group');
      const rootsG = document.getElementById('tree-roots-group');

      const rBY = cBase.bottom + 35;
      rootsG.innerHTML = `
        <path d="M ${trunkX} ${cBase.bottom} Q ${trunkX - 60} ${rBY - 15} ${trunkX - 140} ${rBY}" stroke="#3b82f6" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <path d="M ${trunkX} ${cBase.bottom} Q ${trunkX + 15} ${rBY} ${trunkX} ${rBY + 10}" stroke="#8b5cf6" stroke-width="3" fill="none" stroke-linecap="round" />
        <path d="M ${trunkX} ${cBase.bottom} Q ${trunkX + 60} ${rBY - 15} ${trunkX + 140} ${rBY}" stroke="#06b6d4" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <circle cx="${trunkX - 140}" cy="${rBY}" r="4" fill="#3b82f6" filter="url(#glowFilter)" />
        <circle cx="${trunkX}" cy="${rBY + 10}" r="4.5" fill="#8b5cf6" filter="url(#glowFilter)" />
        <circle cx="${trunkX + 140}" cy="${rBY}" r="4" fill="#06b6d4" filter="url(#glowFilter)" />
      `;

      if (!isMobile) {
        const trunk = `
          <path id="trunk-main-line" d="M ${trunkX - 13} ${trunkBaseY} C ${trunkX - 20} ${trunkBaseY - 150}, ${trunkX - 7} ${trunkTopY + 160}, ${trunkX - 2} ${trunkTopY} L ${trunkX + 2} ${trunkTopY} C ${trunkX + 12} ${trunkTopY + 160}, ${trunkX + 5} ${trunkBaseY - 150}, ${trunkX + 13} ${trunkBaseY} Z" fill="url(#trunkGrad)" opacity="0.8" />
        `;

        const forkLowY = Math.min(trunkBaseY - 16, Math.max(c01.bottom, c02.bottom) + 35);
        const forkMidY = Math.max(c03.bottom, c04.bottom) + 25;

        const curveOffset = Math.max(60, Math.abs(trunkX - c01.right) * 0.65);
        const b01 = `M ${trunkX} ${forkLowY} C ${trunkX - curveOffset} ${forkLowY - 50}, ${c01.right + 25} ${c01.y + 60}, ${c01.right} ${c01.y}`;
        const b02 = `M ${trunkX} ${forkLowY} C ${trunkX + curveOffset} ${forkLowY - 50}, ${c02.left - 25} ${c02.y + 60}, ${c02.left} ${c02.y}`;
        const b03 = `M ${trunkX} ${forkMidY} C ${trunkX - curveOffset} ${forkMidY - 50}, ${c03.right + 25} ${c03.y + 60}, ${c03.right} ${c03.y}`;
        const b04 = `M ${trunkX} ${forkMidY} C ${trunkX + curveOffset} ${forkMidY - 50}, ${c04.left - 25} ${c04.y + 60}, ${c04.left} ${c04.y}`;

        branchesG.innerHTML = trunk + `
          <path id="branch-path-01" d="${b01}" stroke="url(#branchGradLeft)" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#glowFilter)" />
          <path id="branch-path-02" d="${b02}" stroke="url(#branchGradRight)" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#glowFilter)" />
          <path id="branch-path-03" d="${b03}" stroke="url(#branchGradLeft)" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#glowFilter)" />
          <path id="branch-path-04" d="${b04}" stroke="url(#branchGradRight)" stroke-width="4" fill="none" stroke-linecap="round" filter="url(#glowFilter)" />

          <path d="${b01}" stroke="#ffffff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-dasharray="6 12" opacity="0.75" class="tree-pulse-flow" />
          <path d="${b02}" stroke="#ffffff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-dasharray="6 12" opacity="0.75" class="tree-pulse-flow" />
          <path d="${b03}" stroke="#ffffff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-dasharray="6 12" opacity="0.75" class="tree-pulse-flow" />
          <path d="${b04}" stroke="#ffffff" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-dasharray="6 12" opacity="0.75" class="tree-pulse-flow" />
        `;

        const makeNode = (x, y, color = '#8b5cf6', size = 5) => `
          <circle cx="${x}" cy="${y}" r="${size * 2}" fill="${color}" opacity="0.3" filter="url(#nodeGlow)" />
          <circle cx="${x}" cy="${y}" r="${size}" fill="#ffffff" stroke="${color}" stroke-width="2.5" />
        `;

        nodesG.innerHTML = `
          ${makeNode(trunkX, forkLowY, '#8b5cf6', 6)}
          ${makeNode(trunkX, forkMidY, '#a855f7', 6)}
          ${makeNode(trunkX, trunkTopY, '#06b6d4', 6)}
          ${makeNode(trunkX, trunkBaseY, '#3b82f6', 7)}
          ${makeNode(c01.right, c01.y, '#ec4899', 5)}
          ${makeNode(c02.left, c02.y, '#06b6d4', 5)}
          ${makeNode(c03.right, c03.y, '#ec4899', 5)}
          ${makeNode(c04.left, c04.y, '#06b6d4', 5)}
        `;
      } else {
        const trunk = `
          <path d="M ${trunkX} ${trunkBaseY} C ${trunkX} ${trunkBaseY - 50}, 12 ${trunkBaseY - 50}, 12 ${trunkBaseY - 100} L 12 ${c05.y}" stroke="url(#trunkGrad)" stroke-width="5" stroke-linecap="round" fill="none" />
        `;
        branchesG.innerHTML = trunk + [c05, c03, c04, c01, c02].map((card) =>
          `<path d="M 12 ${card.y + 40} Q 12 ${card.y}, ${card.left} ${card.y}" stroke="url(#trunkGrad)" stroke-width="2.5" fill="none" />`
        ).join('');
        nodesG.innerHTML = '';
      }
    }

    window._updateTreeLines = updateLines;
    updateLines();
    window.addEventListener('resize', updateLines);

    const attachHover = (cardId, branchId, glowColor) => {
      const card = document.getElementById(cardId);
      if (!card) return;
      card.addEventListener('mouseenter', () => {
        const b = document.getElementById(branchId);
        if (b) {
          b.style.stroke = glowColor;
          b.style.strokeWidth = '6';
        }
      });
      card.addEventListener('mouseleave', () => {
        const b = document.getElementById(branchId);
        if (b) {
          b.style.stroke = '';
          b.style.strokeWidth = '4';
        }
      });
    };

    attachHover('tree-card-01', 'branch-path-01', '#f43f5e');
    attachHover('tree-card-02', 'branch-path-02', '#38bdf8');
    attachHover('tree-card-03', 'branch-path-03', '#f43f5e');
    attachHover('tree-card-04', 'branch-path-04', '#38bdf8');
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
