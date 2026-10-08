// Crossfading hero background using RSCOE E-Summit event photos.
(function () {
  const FILES = [
    'hero-bg-C3yWAIVa.jpg',
    'Gallery3-DQoX00uM.JPG',
    'Gallery5-C5TPQVau.JPG',
    'Gallery7-XJHbMxeO.png',
    'Gallery10-gvRrzLvT.png',
    'Gallery20-VeCcpalh.png',
    'Gallery25-D3E7j2A7.png',
  ];
  let started = false;
  const iv = setInterval(() => {
    const hero = document.querySelector('section.relative.min-h-screen');
    const bg = hero && hero.querySelector('.bg-cover');
    if (!bg || started) return;
    started = true;
    clearInterval(iv);

    const parent = bg.parentElement;
    bg.style.opacity = '0';

    const a = bg.cloneNode(false);
    const b = bg.cloneNode(false);
    [a, b].forEach((el) => {
      el.style.transition = 'opacity 1.4s ease-in-out, filter 0.8s ease-in-out';
      el.style.pointerEvents = 'auto';
      el.style.backgroundSize = 'cover';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.backgroundPosition = 'center';
      el.style.filter = 'grayscale(1) sepia(0) saturate(1) hue-rotate(0deg) brightness(1)';
    });
    a.style.backgroundImage = `url("/assets/${FILES[0]}")`;
    a.style.opacity = '0.95';
    b.style.backgroundImage = `url("/assets/${FILES[1]}")`;
    b.style.opacity = '0';
    parent.insertBefore(a, bg.nextSibling);
    parent.insertBefore(b, a.nextSibling);

    // darken the crossfade layers so the hero text stays readable
    const dim = document.createElement('div');
    dim.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.38);pointer-events:none;z-index:10;';
    parent.insertBefore(dim, b.nextSibling);

    let i = 0;
    let front = a, back = b;
    setInterval(() => {
      i = (i + 1) % FILES.length;
      back.style.backgroundImage = `url("/assets/${FILES[i]}")`;
      back.style.opacity = '0.95';
      front.style.opacity = '0';
      const tmp = front; front = back; back = tmp;
    }, 5000);
  }, 300);
})();
