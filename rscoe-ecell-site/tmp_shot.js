const { chromium } = require('playwright-core');
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Users/aarav/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe', headless: true });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
  const p = await ctx.newPage();
  const pages = ['', 'events', 'team', 'gallery', 'blogs', 'e-summit', 'about'];
  for (const url of pages) {
    await p.goto('http://localhost:4173/' + url, { waitUntil: 'domcontentloaded' });
    await p.waitForTimeout(3500);
    await p.screenshot({ path: 'shots/reg-' + (url || 'home') + '.png', fullPage: true });
  }
  // mobile pass on about + contact
  const m = await (await b.newContext({ viewport: { width: 390, height: 844 } })).newPage();
  for (const url of ['about', 'contact', '']) {
    await m.goto('http://localhost:4173/' + url, { waitUntil: 'domcontentloaded' });
    await m.waitForTimeout(3500);
    await m.screenshot({ path: 'shots/mob-' + (url || 'home') + '.png', fullPage: true });
  }
  await b.close();
  console.log('done');
})();
