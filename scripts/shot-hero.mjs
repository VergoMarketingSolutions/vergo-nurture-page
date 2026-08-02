import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.argv[2] || 'shots';
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

for (const vp of [
  { n: 'desktop', width: 1440, height: 900 },
  { n: 'laptop', width: 1366, height: 660 },
  { n: 'mobile', width: 375, height: 812 },
]) {
  await page.setViewport({ width: vp.width, height: vp.height });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await sleep(2200); // let entrance + call loop settle
  const s = await page.evaluate(() => {
    const g = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { op: +cs.opacity, top: Math.round(el.getBoundingClientRect().top) };
    };
    return {
      headline: g('.hero-headline'),
      ctas: g('.hero-ctas'),
      call: g('.hero-call'),
      stars: document.querySelectorAll('#stars circle').length,
      sigs: document.querySelectorAll('.sig').length,
      overflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
    };
  });
  console.log(vp.n, JSON.stringify(s));
  await page.screenshot({ path: `${OUT}/hero-${vp.n}.png` });
}
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
await browser.close();
