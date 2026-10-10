// Scratch: dump the home-page Connect section HTML + geometry of its children
const { chromium } = require('playwright-core');
const fs = require('fs');
const EXE = 'C:/Users/aarav/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  const data = await page.evaluate(() => {
    const sec = [...document.querySelectorAll('section')].find(
      (s) => s.textContent.includes('Connect with the E-Cell Team')
    );
    if (!sec) return 'not found';
    const geom = (el) => {
      const r = el.getBoundingClientRect();
      return `x=${Math.round(r.x)} y=${Math.round(r.y + window.scrollY)} w=${Math.round(r.width)} h=${Math.round(r.height)}`;
    };
    const kids = [...sec.querySelectorAll(':scope > * , :scope > * > *')].slice(0, 30).map(
      (el) => `<${el.tagName.toLowerCase()} class="${el.className}"> ${geom(el)}`
    );
    sec.setAttribute('data-connect', '1');
    return { sectionGeom: geom(sec), kids, html: sec.outerHTML };
  });
  console.log(JSON.stringify(data, null, 2));
  fs.writeFileSync(__dirname + '/shots/tmp-connect.html', data.html);
  // screenshot just the section
  const el = await page.$('[data-connect="1"]');
  await el.screenshot({ path: __dirname + '/shots/tmp-connect-section.png' });
  console.log('saved section screenshot');
  await browser.close();
})();
