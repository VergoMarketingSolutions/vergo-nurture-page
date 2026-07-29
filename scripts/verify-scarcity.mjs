// Confirms: bar+availability only on home, no countdown/spots anywhere else,
// and nothing at the top of any page is covered by the bar or nav.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.argv[2] || 'shots';
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const log = (n, ok, d = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${n}${d ? ' | ' + d : ''}`);
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });

const routes = ['/', '/services', '/compare', '/real-math', '/quote', '/legal'];

const probe = async () =>
  page.evaluate(() => {
    const bar = document.querySelector('.announce');
    const nav = document.querySelector('.nav-bar');
    const navRect = nav.getBoundingClientRect();
    const barRect = bar ? bar.getBoundingClientRect() : null;

    // topmost meaningful content element on the page
    const first =
      document.querySelector('.hero-eyebrow') ||
      document.querySelector('.page-head .eyebrow') ||
      document.querySelector('.wb-kicker') ||
      document.querySelector('.legal-wrap h1');
    const fr = first ? first.getBoundingClientRect() : null;

    return {
      hasBar: !!bar,
      barBottom: barRect ? Math.round(barRect.bottom) : 0,
      navTop: Math.round(navRect.top),
      navBottom: Math.round(navRect.bottom),
      firstTop: fr ? Math.round(fr.top) : null,
      announceVar: getComputedStyle(document.documentElement).getPropertyValue('--announce-h').trim(),
      // countdown/spots in the page body, i.e. excluding the bar's own inline timer
      bodyCountdowns: [...document.querySelectorAll('.countdown, .cd-inline')].filter(
        (el) => !el.closest('.announce')
      ).length,
      spots: document.querySelectorAll('.spots-pill, .spots-note, .spots-meter').length,
      availability: document.querySelectorAll('.availability').length,
    };
  });

for (const vp of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1366, height: 660 },
  { name: 'mobile', width: 375, height: 812 },
]) {
  await page.setViewport({ width: vp.width, height: vp.height });
  console.log(`\n--- ${vp.name} ${vp.width}x${vp.height} ---`);
  for (const r of routes) {
    await page.goto('http://localhost:5173' + r, { waitUntil: 'networkidle0' });
    await sleep(900);
    const p = await probe();
    const isHome = r === '/';

    // the bar belongs on every page
    log(`${vp.name} ${r}: bar present`, p.hasBar, `--announce-h ${p.announceVar}`);
    if (isHome) {
      log(`${vp.name} ${r}: availability section kept`, p.availability === 1);
      log(`${vp.name} ${r}: 1 in-page countdown (availability only)`, p.bodyCountdowns === 1, `cd ${p.bodyCountdowns}`);
    } else {
      log(
        `${vp.name} ${r}: no in-page countdown/spots`,
        p.bodyCountdowns === 0 && p.spots === 0,
        `cd ${p.bodyCountdowns} spots ${p.spots}`
      );
    }

    // nav must sit fully below the bar
    log(`${vp.name} ${r}: nav clears bar`, p.navTop >= p.barBottom, `navTop ${p.navTop} >= barBottom ${p.barBottom}`);
    // first content must sit below the nav (not covered)
    if (p.firstTop !== null) {
      log(`${vp.name} ${r}: top content clears nav`, p.firstTop >= p.navBottom - 1, `firstTop ${p.firstTop} >= navBottom ${p.navBottom}`);
    }
    if (r === '/' || r === '/quote' || r === '/compare' || r === '/legal') {
      await page.screenshot({ path: `${OUT}/${vp.name}${r.replace('/', '-') || '-home'}.png` });
    }
  }
}

log('console: no errors', errs.length === 0, errs.slice(0, 3).join(' || ') || 'clean');
await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n==== ${results.length - fails}/${results.length} passed ====`);
if (fails) process.exitCode = 1;
