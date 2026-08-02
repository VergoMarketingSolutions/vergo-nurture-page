import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.argv[2] || 'shots';
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const errs = [];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

for (const vp of [
  { n: 'desktop', width: 1440, height: 900 },
  { n: 'mobile', width: 375, height: 812 },
]) {
  await page.setViewport({ width: vp.width, height: vp.height });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await sleep(700);
  // scroll the stage into view to trigger the timeline
  await page.evaluate(() => {
    const el = document.querySelector('.callstage');
    const y = el.getBoundingClientRect().top + window.scrollY - 60;
    if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
    window.scrollTo(0, y);
  });
  await sleep(11000); // let the call play through to booked
  const s = await page.evaluate(() => ({
    live: document.querySelector('.callstage').classList.contains('is-live'),
    badge: document.querySelector('[data-cs="badge"]').textContent.trim(),
    timer: document.querySelector('[data-cs="timer"]').textContent.trim(),
    linesShown: [...document.querySelectorAll('[data-cs="line"]')].filter(
      (l) => +getComputedStyle(l).opacity > 0.9
    ).length,
    booked: !!document.querySelector('.cs-slot.is-booked'),
    stamp: +getComputedStyle(document.querySelector('[data-cs="stamp"]')).opacity,
    stepsDone: document.querySelectorAll('.cs-step.is-done').length,
    overflow: document.documentElement.scrollWidth <= window.innerWidth + 1,
  }));
  console.log(vp.n, JSON.stringify(s));
  await page.screenshot({ path: `${OUT}/stage-${vp.n}.png` });
}
console.log('errors:', errs.length ? errs.join(' | ') : 'none');
await browser.close();
