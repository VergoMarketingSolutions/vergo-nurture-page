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
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
await sleep(600);

const info = await page.evaluate(async () => {
  const el = document.querySelector('.tm-grid');
  const y = el.getBoundingClientRect().top + window.scrollY - 130;
  window.scrollTo(0, y);
  await new Promise((r) => setTimeout(r, 1200));
  return {
    cards: document.querySelectorAll('.tm-card').length,
    avatars: [...document.querySelectorAll('.tm-avatar')].map((a) => a.textContent),
    stars: document.querySelectorAll('.tm-card:first-child .tm-stars svg').length,
    hasImg: document.querySelectorAll('.tm-card img').length, // must be 0 — no real photos
    cardVisible: parseFloat(getComputedStyle(document.querySelector('.tm-card')).opacity),
  };
});
console.log(JSON.stringify(info));
await page.screenshot({ path: `${OUT}/testimonials.png` });
// mobile
await page.setViewport({ width: 375, height: 812 });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
await sleep(600);
const overflow = await page.evaluate(async () => {
  const el = document.querySelector('.tm-grid');
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 80);
  await new Promise((r) => setTimeout(r, 900));
  return document.documentElement.scrollWidth <= window.innerWidth + 1;
});
console.log('mobile no overflow:', overflow);
await page.screenshot({ path: `${OUT}/testimonials-mobile.png` });
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
await browser.close();
