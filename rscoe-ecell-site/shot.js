// Scratch screenshot tool: node shot.js <route> <outfile> [waitMs] [fullpage]
const { chromium } = require('playwright-core');
const path = require('path');

const EXE = process.env.CHROME ||
  'C:/Users/aarav/AppData/Local/ms-playwright/chromium-1243/chrome-win64/chrome.exe';

(async () => {
  const route = process.argv[2] || '/';
  const out = process.argv[3] || path.join(__dirname, 'shot.png');
  const wait = Number(process.argv[4] || 1500);
  const full = process.argv[5] !== 'nofull';
  const browser = await chromium.launch({ executablePath: EXE, headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('http://localhost:4173' + route, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(wait);
  await page.screenshot({ path: out, fullPage: full });
  console.log('saved', out);
  await browser.close();
})();
