import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.argv[2] || 'shots';
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'http://localhost:5173';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--force-device-scale-factor=1'] });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

const frame = async (sel, pad = 120) => {
  await page.evaluate((s, p) => {
    const el = document.querySelector(s);
    const y = el.getBoundingClientRect().top + window.scrollY - p;
    window.scrollTo(0, Math.max(0, y));
  }, sel, pad);
  await sleep(700);
};

// ---- Cost Comparison (desktop) ----
await page.setViewport({ width: 1440, height: 900 });
await page.goto(BASE + '/compare', { waitUntil: 'networkidle0' });
await sleep(500);
const cmp = await page.evaluate(() => ({
  save: document.querySelector('.spec-save')?.textContent.trim(),
  guarantee: !!document.querySelector('.guarantee'),
  seal: document.querySelector('.guarantee-seal strong')?.textContent,
}));
console.log('COMPARE:', JSON.stringify(cmp));
await frame('.spec-duel', 130);
await page.screenshot({ path: `${OUT}/compare-desktop.png` });

// ---- Real Math (desktop) ----
await page.goto(BASE + '/real-math', { waitUntil: 'networkidle0' });
await sleep(500);
const rm = await page.evaluate(() => ({
  sign: document.querySelector('.wb-save-sign')?.textContent.replace(/\s+/g, ' ').trim(),
  inline: document.querySelector('.wb-vm-save')?.textContent.trim(),
  guarantee: document.querySelector('.wb-guarantee')?.textContent.replace(/\s+/g, ' ').trim(),
}));
console.log('REAL MATH:', JSON.stringify(rm));
await frame('.wb-row--vm', 150);
await page.screenshot({ path: `${OUT}/realmath-desktop.png` });

// ---- Quote (desktop) ----
await page.goto(BASE + '/quote', { waitUntil: 'networkidle0' });
await sleep(500);
const qg = await page.evaluate(() => document.querySelector('.form-guarantee')?.textContent.replace(/\s+/g, ' ').trim());
console.log('QUOTE GUARANTEE:', JSON.stringify(qg));
await frame('.quote-submit', 260);
await page.screenshot({ path: `${OUT}/quote-desktop.png` });

// ---- Mobile checks ----
await page.setViewport({ width: 375, height: 812 });
await page.goto(BASE + '/real-math', { waitUntil: 'networkidle0' });
await sleep(600);
const rmMob = await page.evaluate(() => {
  const sign = document.querySelector('.wb-save-sign').getBoundingClientRect();
  const g = document.querySelector('.wb-guarantee').getBoundingClientRect();
  return {
    signInView: sign.right <= window.innerWidth + 1 && sign.left >= -1,
    guaranteeNoOverflow: g.right <= window.innerWidth + 1,
    overflowX: document.documentElement.scrollWidth <= window.innerWidth + 1,
  };
});
console.log('REAL MATH mobile:', JSON.stringify(rmMob));
await frame('.wb-row--vm', 130);
await page.screenshot({ path: `${OUT}/realmath-mobile.png` });

await page.goto(BASE + '/compare', { waitUntil: 'networkidle0' });
await sleep(600);
await frame('.guarantee', 90);
await page.screenshot({ path: `${OUT}/compare-mobile.png` });
const cmpMob = await page.evaluate(() => ({
  overflowX: document.documentElement.scrollWidth <= window.innerWidth + 1,
}));
console.log('COMPARE mobile:', JSON.stringify(cmpMob));

console.log('ERRORS:', errors.length ? errors.slice(0, 5).join(' | ') : 'none');
await browser.close();
