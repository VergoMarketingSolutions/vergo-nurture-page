import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.argv[2] || 'shots';
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:5173/quote', { waitUntil: 'networkidle0' });
await sleep(800);

// blow the mark up to 168px on a white card so the shape is judgeable
await page.evaluate(() => {
  const svg = document.querySelector('.nav-mark').cloneNode(true);
  svg.removeAttribute('class');
  svg.style.width = '168px';
  svg.style.height = '168px';
  const box = document.createElement('div');
  box.id = 'logo-probe';
  box.style.cssText =
    'position:fixed;inset:0;z-index:99999;background:#fff;display:grid;place-items:center;';
  box.appendChild(svg);
  document.body.appendChild(box);
});
await sleep(400);
await page.screenshot({ path: `${OUT}/logo-large.png`, clip: { x: 636, y: 366, width: 168, height: 168 } });

// nav in context
await page.evaluate(() => document.getElementById('logo-probe').remove());
await sleep(300);
await page.screenshot({ path: `${OUT}/logo-nav.png`, clip: { x: 140, y: 14, width: 520, height: 70 } });

const meta = await page.evaluate(() => {
  const el = document.querySelector('.nav-mark');
  const r = el.getBoundingClientRect();
  return { tag: el.tagName, w: Math.round(r.width), h: Math.round(r.height), hasVM: /VM/.test(el.textContent) };
});
console.log(JSON.stringify(meta));
await browser.close();
