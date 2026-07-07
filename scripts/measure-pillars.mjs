import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.argv[2] || 'shots';
import fs from 'node:fs';
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--force-device-scale-factor=1'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

// scroll pillars into view THROUGH Lenis so ScrollTrigger fires the reveal
await page.evaluate(() => {
  const el = document.querySelector('.pillars');
  const y = el.getBoundingClientRect().top + window.scrollY - 120;
  if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
});
await sleep(1800);

const m = await page.evaluate(() => {
  const grid = document.querySelector('.pillar-grid').getBoundingClientRect();
  const cta = document.querySelector('.pillars-cta').getBoundingClientRect();
  const btn = document.querySelector('.pillars-cta .button-primary').getBoundingClientRect();
  const card = document.querySelector('.pillar-card').getBoundingClientRect();
  return {
    gridBottom: Math.round(grid.bottom),
    ctaTop: Math.round(cta.top),
    btnTop: Math.round(btn.top),
    btnCenterX: Math.round(btn.left + btn.width / 2),
    viewportCenterX: 720,
    gapGridToBtn: Math.round(btn.top - grid.bottom),
    cardTransform: getComputedStyle(document.querySelector('.pillar-card')).transform,
    ctaMarginTop: getComputedStyle(document.querySelector('.pillars-cta')).marginTop,
  };
});
console.log(JSON.stringify(m, null, 2));

// frame the pillars + button in the viewport, then full-viewport screenshot
await page.evaluate(() => {
  const el = document.querySelector('.pillars');
  const y = el.getBoundingClientRect().top + window.scrollY - 60;
  if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
});
await sleep(1200);
await page.screenshot({ path: `${OUT}/pillars-fixed.png` });
await browser.close();
