import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.argv[2] || 'shots';
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const log = (n, ok, d = '') => { results.push(ok); console.log(`${ok ? 'PASS' : 'FAIL'} | ${n}${d ? ' | ' + d : ''}`); };

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await page.setViewport({ width: 1440, height: 900 });

// scan every page for banned AI-tell / meta / coaching phrases
const banned = [
  'clear the fog', '40-second story', 'grab a marker', 'explain it to a mate',
  'Drag the sliders', 'Anonymous here on purpose', 'pulled from thin air',
  'simple enough to publish', 'shape of the problem', 'The whole pitch in one line',
  'where it hurts', 'legend', 'Prefer it on a whiteboard', 'Simple as that',
];
const routes = ['/', '/services', '/compare', '/real-math', '/quote'];
for (const r of routes) {
  await page.goto('http://localhost:5173' + r, { waitUntil: 'networkidle0' });
  await sleep(700);
  const text = await page.evaluate(() => document.body.innerText);
  const hits = banned.filter((b) => text.toLowerCase().includes(b.toLowerCase()));
  log(`copy clean: ${r}`, hits.length === 0, hits.join(' | ') || 'clean');
}

// home: testimonials gone, reasons in
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
await sleep(500);
const home = await page.evaluate(() => ({
  reasons: document.querySelectorAll('.reason-card').length,
  whyHeading: [...document.querySelectorAll('h2')].some((e) => /built for the trades/i.test(e.textContent)),
  faker: /Owner, HVAC|Director, roofing|GM, heating/i.test(document.body.innerText),
}));
log('home: 3 reason cards, no fake testimonials', home.reasons === 3 && home.whyHeading && !home.faker, JSON.stringify(home));
await page.evaluate(() => { const el = document.querySelector('.reasons-grid'); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 130); });
await sleep(700);
await page.screenshot({ path: `${OUT}/why-vm.png` });

// quote success copy (no 'legend')
await page.goto('http://localhost:5173/quote', { waitUntil: 'networkidle0' });
await sleep(500);
await page.screenshot({ path: `${OUT}/quote-head.png`, clip: { x: 120, y: 90, width: 900, height: 260 } });

log('console: no errors', errs.length === 0, errs.slice(0, 3).join(' || ') || 'clean');
await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n==== ${results.length - fails}/${results.length} passed ====`);
if (fails) process.exitCode = 1;
