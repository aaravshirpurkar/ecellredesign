const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatchMod = require('pixelmatch');
const pixelmatch = pixelmatchMod.default || pixelmatchMod;

const EXE = process.env.CHROME ||
  'C:/Users/aarav/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const ROUTES = ['/', '/about', '/events', '/team', '/gallery', '/contact', '/e-summit', '/e-summit/agenda', '/e-summit/register', '/blogdetails'];

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  fs.mkdirSync('shots/live', { recursive: true });
  fs.mkdirSync('shots/local', { recursive: true });
  fs.mkdirSync('shots/diff', { recursive: true });

  let report = [];
  for (const r of ROUTES) {
    const name = r === '/' ? 'index' : r.slice(1).replace(/\//g, '-');
    try {
      await page.goto('https://www.ecellrscoe.org' + r, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2500);
      await page.screenshot({ path: `shots/live/${name}.png`, fullPage: true });
    } catch (e) { report.push(`live ${r}: FAIL ${e.message.split('\n')[0]}`); }
    try {
      await page.goto('http://localhost:4173' + r, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(1500);
      await page.screenshot({ path: `shots/local/${name}.png`, fullPage: true });
    } catch (e) { report.push(`local ${r}: FAIL ${e.message.split('\n')[0]}`); }

    try {
      const a = PNG.sync.read(fs.readFileSync(`shots/live/${name}.png`));
      const b = PNG.sync.read(fs.readFileSync(`shots/local/${name}.png`));
      const w = Math.min(a.width, b.width), h = Math.min(a.height, b.height);
      const aa = new PNG({ width: w, height: h }), bb = new PNG({ width: w, height: h });
      PNG.bitblt(a, aa, 0, 0, w, h, 0, 0); PNG.bitblt(b, bb, 0, 0, w, h, 0, 0);
      const diff = new PNG({ width: w, height: h });
      const n = pixelmatch(aa.data, bb.data, diff.data, w, h, { threshold: 0.2 });
      fs.writeFileSync(`shots/diff/${name}.png`, PNG.sync.write(diff));
      report.push(`${r}: diff px ${n} (${((n / (w * h)) * 100).toFixed(2)}%), live ${a.width}x${a.height}, local ${b.width}x${b.height}`);
    } catch (e) { report.push(`${r}: diff FAIL ${e.message}`); }
  }
  await browser.close();
  console.log(report.join('\n'));
})();
