(function () {
  const base = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/';
  const clips = [
    'hf_20260423_084718_72a17915-4964-4059-afcd-22d59399b72e.mp4',
    'hf_20260418_115655_b4d9cd77-feed-43cd-a198-af78ebdf1f7a.mp4',
    'hf_20260613_180732_a54afbf6-b30d-470e-861f-669871f09f67.mp4',
    'hf_20260806_133255_956f653f-5d80-4b06-abd5-0f46c98b60fa.mp4',
    'hf_20260723_145606_ab143199-b593-4941-bb1b-9afca215416b.mp4',
    'https://stream.mux.com/3gErUdcrPfibrZ00ysHSLAupEL01PeX4PpAwgcGpGvbAM.m3u8'
  ];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const videos = new Map();
  let paused = motion.matches;
  const fixedClips = { '/': 0, '/about': 1, '/events': 0, '/team': 1, '/contact': 5, '/blogdetails': 5, '/blogs': 5, '/blog': 5 };
  const posters = { '/': '/assets/home-background-poster.jpg', '/about': '/assets/about-background-poster.jpg', '/events': '/assets/home-background-poster.jpg', '/team': '/assets/about-background-poster.jpg' };
  let fixedBackdrop;
  let hlsLibrary;
  const sourceFor = (index) => clips[index].startsWith('https://') ? clips[index] : base + clips[index];
  function attachSource(video, source) {
    video._hls?.destroy();
    video._hls = null;
    video.dataset.sourceAttached = source;
    if (!source.endsWith('.m3u8')) {
      video.src = source;
      video.load();
      return;
    }
    if (!hlsLibrary) {
      hlsLibrary = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.13/dist/hls.min.js';
        script.onload = () => resolve(window.Hls);
        script.onerror = () => reject(new Error('Could not load HLS playback support'));
        document.head.appendChild(script);
      });
    }
    hlsLibrary.then((Hls) => {
      if (video.dataset.sourceAttached !== source) return;
      if (!Hls.isSupported()) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.load();
        }
        return;
      }
      const hls = new Hls({ startLevel: 0, maxBufferLength: 12, maxMaxBufferLength: 24, capLevelToPlayerSize: true });
      video._hls = hls;
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, updatePlayback);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) { hls.destroy(); video._hls = null; }
      });
    }).catch(() => { /* Keep the dark fallback if the stream cannot load. */ });
  }
  // Warm the page video while the hero is being displayed, reusing the
  // same element later so there is no second download or playback instance.
  let fixedPreload;
  if (Object.hasOwn(fixedClips, location.pathname)) {
    fixedPreload = document.createElement('video');
    fixedPreload.muted = true;
    fixedPreload.playsInline = true;
    fixedPreload.preload = motion.matches ? 'metadata' : 'auto';
    fixedPreload.poster = posters[location.pathname] || '';
    attachSource(fixedPreload, sourceFor(fixedClips[location.pathname]));
  }

  function updatePlayback() {
    videos.forEach((video) => {
      if (!paused && !document.hidden && video.dataset.visible === 'true') {
        video.play().catch(() => { /* A static frame remains if autoplay is blocked. */ });
      } else video.pause();
    });
  }

  const visibility = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      const video = videos.get(target);
      if (!video) return;
      video.dataset.visible = String(isIntersecting);
      if (isIntersecting && !video.dataset.sourceAttached) {
        attachSource(video, video.dataset.src);
      }
    });
    updatePlayback();
  }, { threshold: 0 });

  function decorate() {
    const isHome = location.pathname === '/';
    const isFixed = Object.hasOwn(fixedClips, location.pathname);
    document.body.classList.toggle('fixed-video-page', isFixed);
    document.body.classList.toggle('events-video-page', location.pathname === '/events');
    if (!isFixed && fixedBackdrop) {
      fixedBackdrop.remove();
      fixedBackdrop = null;
      document.querySelectorAll('.fixed-video-shell, .fixed-video-section').forEach((element) => {
        element.classList.remove('fixed-video-shell', 'fixed-video-section');
      });
    }
    videos.forEach((video, section) => {
      if (!section.isConnected || section.dataset.homeRemoved === 'true' || (isFixed && section !== fixedBackdrop && section.tagName !== 'FOOTER')) {
        video.pause();
        video._hls?.destroy();
        video._hls = null;
        delete video.dataset.sourceAttached;
        visibility.unobserve(section);
        video.removeAttribute('src');
        video.load();
        video.remove();
        section.querySelector(':scope > .section-video-shade')?.remove();
        section.classList.remove('has-section-video');
        videos.delete(section);
      }
    });
    const main = document.querySelector('main');
    let sections;
    if (main) {
      sections = [...main.querySelectorAll('section')].filter((section) =>
        !section.parentElement.closest('section') && !section.querySelector('h1'));
      if (!sections.length) {
        // About, gallery and contact use content blocks rather than section tags.
        sections = [...main.children].filter((block) =>
          block.tagName === 'DIV' && !block.classList.contains('absolute') &&
          !block.querySelector('h1') &&
          (block.textContent.trim() || block.querySelector('img, form, button')));
      }
    } else {
      const hero = document.querySelector('section.relative.min-h-screen');
      sections = hero ? [...document.querySelectorAll('section')].filter((section) =>
        section !== hero && !section.contains(hero) && !section.parentElement.closest('section') &&
        Boolean(hero.compareDocumentPosition(section) & Node.DOCUMENT_POSITION_FOLLOWING)) : [];
    }
    sections = sections.filter((section) => section.dataset.homeRemoved !== 'true' &&
      !(location.pathname === '/' && [...section.querySelectorAll('h2, h3')].some((heading) =>
        /Three Pillars|^Flagship Events?$/i.test(heading.textContent.trim()))) &&
      getComputedStyle(section).display !== 'none');
    const footer = document.querySelector('footer');
    if (isFixed) {
      const content = isHome ? document.querySelector('section.relative.min-h-screen') : main;
      if (!content) return;
      // Clear only structural backgrounds; cards retain their readable surfaces.
      let shell = isHome ? content.parentElement : content;
      while (shell && shell !== document.body) {
        shell.classList.add('fixed-video-shell');
        shell = shell.parentElement;
      }
      // About's cards keep their surfaces; only its structural shell is cleared.
      if (isHome) sections.forEach((section) => section.classList.add('fixed-video-section'));
      if (!fixedBackdrop) {
        fixedBackdrop = document.createElement('div');
        fixedBackdrop.className = 'page-fixed-video';
        fixedBackdrop.setAttribute('aria-hidden', 'true');
        document.body.prepend(fixedBackdrop);
      }
      sections = [fixedBackdrop];
    }
    if (footer) {
      footer.classList.remove('fixed-video-section');
      sections.push(footer);
    }
    const rotationCount = 4;
    const offset = [...location.pathname].reduce((sum, char) => sum + char.charCodeAt(0), 0) % rotationCount;
    sections.forEach((section, index) => {
      const isFooter = section.tagName === 'FOOTER';
      const source = sourceFor(isFooter ? 2 : isFixed ? fixedClips[location.pathname] : (offset + index) % rotationCount);
      if (videos.has(section)) {
        const existing = videos.get(section);
        if (existing.dataset.src !== source) {
          existing.dataset.src = source;
          existing.poster = isFooter ? '' : posters[location.pathname] || '';
          if (existing.dataset.sourceAttached) {
            attachSource(existing, source);
            updatePlayback();
          }
        }
        return;
      }
      const video = section === fixedBackdrop && fixedPreload ? fixedPreload : document.createElement('video');
      if (video === fixedPreload) fixedPreload = null;
      video.className = 'section-background-video';
      video.dataset.src = source;
      video.dataset.visible = 'false';
      video.muted = true;
      video.defaultMuted = true;
      video.loop = true;
      video.playsInline = true;
      video.preload = isFixed && !isFooter ? (motion.matches ? 'metadata' : 'auto') : 'none';
      if (isFixed && !isFooter) {
        video.poster = posters[location.pathname] || '';
        if (video.dataset.sourceAttached !== source) attachSource(video, source);
      }
      video.tabIndex = -1;
      video.setAttribute('aria-hidden', 'true');
      video.setAttribute('disablepictureinpicture', '');
      const shade = document.createElement('div');
      shade.className = 'section-video-shade';
      shade.setAttribute('aria-hidden', 'true');
      section.classList.add('has-section-video');
      section.prepend(video, shade);
      videos.set(section, video);
      visibility.observe(section);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    updatePlayback();
    let queued = false;
    const changes = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => { queued = false; decorate(); });
    });
    changes.observe(document.getElementById('root'), { childList: true, subtree: true });
    decorate();
  });
  motion.addEventListener('change', () => { paused = motion.matches; updatePlayback(); });
  document.addEventListener('visibilitychange', updatePlayback);
})();
