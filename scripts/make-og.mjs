// Renders a 1200x630 branded Open Graph share card to public/og.png
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import path from 'node:path';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.resolve('public/og.png');
fs.mkdirSync(path.dirname(OUT), { recursive: true });

const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&display=swap" rel="stylesheet">
<style>
  * { margin:0; box-sizing:border-box; }
  html,body { width:1200px; height:630px; }
  body {
    font-family:'Inter',sans-serif;
    background:
      radial-gradient(900px 500px at 82% 18%, rgba(46,110,220,.30), transparent 60%),
      linear-gradient(150deg,#0b1730,#0e1b33 55%,#0a1428);
    color:#fff; overflow:hidden; position:relative;
    padding:76px 80px; display:flex; flex-direction:column; justify-content:space-between;
  }
  .grain { position:absolute; inset:0; opacity:.05;
    background-image:radial-gradient(circle,#fff 1px,transparent 1px); background-size:5px 5px; }
  .top { display:flex; align-items:center; gap:20px; position:relative; }
  .mark { width:74px; height:74px; border-radius:19px; background:#0653B6;
    display:flex; align-items:center; justify-content:center; box-shadow:0 12px 30px rgba(6,83,182,.45); }
  .brand-name { font-size:30px; font-weight:800; letter-spacing:-.02em; line-height:1.1; }
  .brand-sub { font-size:13px; font-weight:600; letter-spacing:3px; color:#8fa6c9; margin-top:3px; }
  h1 { font-size:74px; font-weight:800; letter-spacing:-.035em; line-height:1.03; position:relative; }
  h1 .accent { color:#5b9bf0; }
  .sub { font-size:27px; font-weight:500; color:#b9c6e2; margin-top:26px; max-width:840px; line-height:1.4; position:relative; }
  .chips { display:flex; gap:14px; margin-top:6px; position:relative; }
  .chip { font-size:20px; font-weight:600; color:#dce6f7; padding:12px 22px; border-radius:999px;
    background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.16); }
  .foot { display:flex; justify-content:space-between; align-items:center; position:relative;
    font-size:20px; font-weight:600; color:#8fa6c9; }
  .foot .guar { color:#4ecb8a; }
</style></head><body>
  <div class="grain"></div>
  <div class="top">
    <div class="mark">
      <svg width="46" height="46" viewBox="0 0 100 100"><path d="M15 27 L37 27 L50 44 L63 27 L85 27 L50 78 Z" fill="#fff"/></svg>
    </div>
    <div>
      <div class="brand-name">VM Solutions</div>
      <div class="brand-sub">VERGO MARKETING</div>
    </div>
  </div>
  <div>
    <h1>Every call answered.<br>Every lead <span class="accent">followed up.</span></h1>
    <div class="sub">24/7 AI receptionist &amp; marketing, built for HVAC and roofing businesses.</div>
  </div>
  <div class="chips">
    <div class="chip">Answers in &lt;10s</div>
    <div class="chip">24/7/365</div>
    <div class="chip">$0.09 / min</div>
  </div>
  <div class="foot">
    <span>vergomarketingsolutions.vercel.app</span>
    <span class="guar">30-day money-back guarantee</span>
  </div>
</body></html>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
await page.setContent(html, { waitUntil: 'networkidle0' });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({ path: OUT });
await browser.close();
console.log('wrote', OUT, fs.statSync(OUT).size, 'bytes');
