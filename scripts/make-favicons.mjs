// Renders the VM "V" mark to raster PNG favicons. Google's search-result
// icon fetcher requests a real network URL — it can't resolve the data:
// URI the site used before — so these give it (and older browsers/Apple)
// a fetchable fallback alongside the vector favicon.svg.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const MARK = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:#0653B6;border-radius:22%;">
  <svg viewBox="0 0 100 100" style="width:62%;height:62%;">
    <path d="M15 27 L37 27 L50 44 L63 27 L85 27 L50 78 Z" fill="#fff"/>
  </svg>
</div>`;

const targets = [
  { file: 'favicon-96.png', size: 96 },
  { file: 'apple-touch-icon.png', size: 180 },
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();

for (const { file, size } of targets) {
  await page.setViewport({ width: size, height: size, deviceScaleFactor: 1 });
  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8"><style>
      *{margin:0;padding:0;} html,body{width:${size}px;height:${size}px;background:transparent;}
    </style></head><body>${MARK}</body></html>`,
    { waitUntil: 'domcontentloaded' }
  );
  await new Promise((r) => setTimeout(r, 150));
  const out = path.resolve('public', file);
  await page.screenshot({ path: out, omitBackground: true });
  console.log('wrote', out, fs.statSync(out).size, 'bytes');
}

await browser.close();
