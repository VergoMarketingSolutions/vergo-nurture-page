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

// desktop full-bleed check
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
await sleep(600);
const d = await page.evaluate(async () => {
  const m = document.querySelector('.tm-marquee');
  m.scrollIntoView({ block: 'center' });
  await new Promise((r) => setTimeout(r, 500));
  const mr = m.getBoundingClientRect();
  return {
    marqueeLeft: Math.round(mr.left),
    marqueeRight: Math.round(mr.right),
    vw: window.innerWidth,
    fullBleed: mr.left <= 1 && mr.right >= window.innerWidth - 1,
    cardOpacity: parseFloat(getComputedStyle(document.querySelector('.tm-card')).opacity),
    starCount: document.querySelectorAll('.tm-card:first-child .tm-star').length,
    ratings: [...document.querySelectorAll('.tm-rating')].slice(0, 7).map((e) => e.textContent),
    pageOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
  };
});
console.log('DESKTOP', JSON.stringify(d));
await page.screenshot({ path: `${OUT}/marquee-desktop.png` });

// zoom into one card to inspect the half star
await page.screenshot({ path: `${OUT}/marquee-card.png`, clip: await page.evaluate(() => {
  const c = document.querySelector('.tm-card');
  const r = c.getBoundingClientRect();
  return { x: Math.max(0, r.left), y: r.top, width: Math.min(380, r.width + 20), height: r.height };
}) });

// mobile
await page.setViewport({ width: 375, height: 812 });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
await sleep(600);
const m = await page.evaluate(async () => {
  const mq = document.querySelector('.tm-marquee');
  mq.scrollIntoView({ block: 'center' });
  await new Promise((r) => setTimeout(r, 500));
  return { pageOverflow: document.documentElement.scrollWidth <= window.innerWidth + 1, cardW: Math.round(document.querySelector('.tm-card').getBoundingClientRect().width) };
});
console.log('MOBILE', JSON.stringify(m));
await page.screenshot({ path: `${OUT}/marquee-mobile.png` });
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
await browser.close();
