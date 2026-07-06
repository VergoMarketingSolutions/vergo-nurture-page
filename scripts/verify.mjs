// Headless end-to-end verification for the VM Solutions site.
// Usage: node scripts/verify.mjs <screenshot-out-dir>
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const BASE = 'http://localhost:5173';
const OUT = process.argv[2] || 'shots';
fs.mkdirSync(OUT, { recursive: true });

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const results = [];
const log = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${detail ? ' | ' + detail : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--force-device-scale-factor=1', '--hide-scrollbars', '--disable-gpu'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text());
});

const shot = (name) => page.screenshot({ path: `${OUT}/${name}.png` });
const scrollTo = async (y) => {
  await page.evaluate((yy) => {
    if (window.__lenis) window.__lenis.scrollTo(yy, { immediate: true, force: true });
    window.scrollTo(0, yy);
  }, y);
  await sleep(1000);
};

// ---------- desktop ----------
await page.setViewport({ width: 1440, height: 900 });
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await page.waitForSelector('#stars circle');
await sleep(600);

// hero at p=0: night state
let starsOp = await page.$eval('#stars', (el) => parseFloat(el.getAttribute('opacity') ?? '1'));
log('hero: night state stars visible', starsOp > 0.95, `stars opacity ${starsOp}`);
await shot('01-hero-night');

const dims = await page.evaluate(() => ({
  heroH: document.querySelector('.hero-wrap').offsetHeight,
  vh: window.innerHeight,
  demoTop: document.querySelector('.demo-wrap').offsetTop,
  demoH: document.querySelector('.demo-wrap').offsetHeight,
  docH: document.documentElement.scrollHeight,
}));
const heroSpan = dims.heroH - dims.vh;

await scrollTo(heroSpan * 0.5);
await shot('02-hero-mid');
const midState = await page.evaluate(() => ({
  stars: parseFloat(document.querySelector('#stars').getAttribute('opacity')),
  headlineOp: parseFloat(getComputedStyle(document.querySelector('[data-el="headline"]')).opacity),
}));
log('hero: mid-scrub stars faded', midState.stars < 0.1, `stars ${midState.stars}`);
log('hero: headline revealed ~1/3 through', midState.headlineOp > 0.8, `opacity ${midState.headlineOp}`);

await scrollTo(heroSpan * 0.99);
await shot('03-hero-dawn');
const dawnState = await page.evaluate(() => ({
  sunDisc: parseFloat(document.querySelector('#sunDisc').getAttribute('opacity')),
  fog: parseFloat(document.querySelector('#fogSheet').getAttribute('opacity')),
  ctasOp: parseFloat(getComputedStyle(document.querySelector('[data-el="ctas"]')).opacity),
  railDark: document.querySelector('.rail').classList.contains('rail--dark'),
}));
log('hero: dawn sun disc risen', dawnState.sunDisc > 0.8, `sunDisc ${dawnState.sunDisc}`);
log('hero: fog cleared', dawnState.fog < 0.05, `fogSheet ${dawnState.fog}`);
log('hero: CTAs + stats revealed near full brightness', dawnState.ctasOp > 0.9, `opacity ${dawnState.ctasOp}`);
log('rail: switches to light theme at dawn', dawnState.railDark === false);

// scrub reverses cleanly
await scrollTo(0);
starsOp = await page.$eval('#stars', (el) => parseFloat(el.getAttribute('opacity')));
const nightAgain = await page.evaluate(() => ({
  railDark: document.querySelector('.rail').classList.contains('rail--dark'),
  fog: parseFloat(document.querySelector('#fogSheet').getAttribute('opacity')),
}));
log('hero: scrub reverses to night', starsOp > 0.95 && nightAgain.fog > 0.8, `stars ${starsOp}, fog ${nightAgain.fog}`);
log('rail: dark theme over night hero', nightAgain.railDark === true);
const railNum0 = await page.$eval('.rail-num', (el) => el.textContent);

// demo sequence: three scroll-tied frames
const demoSpan = dims.demoH - dims.vh;
const frameChecks = [];
for (let i = 0; i < 3; i++) {
  await scrollTo(dims.demoTop + demoSpan * (i === 0 ? 0.04 : i === 1 ? 0.5 : 0.96));
  await shot(`04-demo-frame${i + 1}`);
  const st = await page.evaluate((idx) => {
    const ops = [...document.querySelectorAll('[data-frame]')].map((f) => parseFloat(f.style.opacity || '0'));
    const dots = [...document.querySelectorAll('[data-dot]')].map((d) => d.classList.contains('is-active'));
    return { ops, dots };
  }, i);
  const ok = st.ops[i] > 0.9 && st.ops.every((o, j) => j === i || o < 0.1) && st.dots[i];
  frameChecks.push(ok);
  log(`demo: frame ${i + 1} exclusive + dot active`, ok, JSON.stringify(st));
}

// rail readout moves
const railNumMid = await page.$eval('.rail-num', (el) => el.textContent);
log('rail: numeric readout counts with scroll', railNum0 !== railNumMid, `${railNum0} -> ${railNumMid}`);

// pillars + rest of home
await scrollTo(dims.demoTop + dims.demoH + 400);
await shot('05-home-pillars');
const pillarChips = await page.$$eval('.pillar-card .icon-glass', (els) => els.length);
log('pillars: 3 cards each with glass chip', pillarChips === 3, `${pillarChips} chips`);

await scrollTo(dims.docH);
await shot('06-home-footer');
const footerChips = await page.$$eval('.footer .icon-glass', (els) => els.length);
log('footer: social/contact icons in glass chips', footerChips >= 6, `${footerChips} chips`);

// client-side nav to services
await page.click('.nav-links a[href="/services"]');
await sleep(1200);
log('routing: nav click -> /services', page.url().endsWith('/services'));
await shot('07-services-top');
const svcChips = await page.$$eval('.icon-glass', (els) => els.length);
log('services: liquid-glass chips present', svcChips > 10, `${svcChips} chips`);
const svcQuoteLinks = await page.$$eval('.svc a[href="/quote"]', (els) => els.length);
log('services: each section ends in Get a Quote link', svcQuoteLinks >= 3, `${svcQuoteLinks} links`);
await scrollTo(1400);
await shot('08-services-mid');

// compare page (direct load = SPA fallback route check)
await page.goto(BASE + '/compare', { waitUntil: 'networkidle0' });
await sleep(800);
log('routing: direct load /compare', await page.$('.spec-duel') !== null);
await scrollTo(700);
await shot('09-compare-duel');
await scrollTo(1600);
await shot('10-compare-table');
const winHighlight = await page.$eval('.spec-cell--win', (el) => getComputedStyle(el).borderColor);
log('compare: VM column highlighted blue', winHighlight.includes('6, 83, 182'), winHighlight);

// real math page
await page.goto(BASE + '/real-math', { waitUntil: 'networkidle0' });
await sleep(800);
log('routing: direct load /real-math', await page.$('.wb-table') !== null);
const wbChips = await page.$$eval('.wb .icon-glass', (els) => els.length);
log('real math: NO glass chips (analog page)', wbChips === 0, `${wbChips} chips`);
const wbRows = await page.$$eval('.wb-row', (els) => els.length);
log('real math: 8 rows (head + 6 + VM)', wbRows === 8, `${wbRows} rows`);
const vmHasPrice = await page.$eval('.wb-row--vm .wb-cell--cost', (el) => /\$\s?\d/.test(el.textContent));
log('real math: VM row has no dollar figure', vmHasPrice === false);
const vmLink = await page.$eval('.wb-vm-link', (el) => el.getAttribute('href'));
log('real math: Get Your Number links to /quote', vmLink === '/quote');
await shot('11-realmath');
await scrollTo(900);
await shot('12-realmath-vm-row');

// quote page + validation
await page.goto(BASE + '/quote', { waitUntil: 'networkidle0' });
await sleep(800);
await scrollTo(500);
await shot('13-quote-form');
await page.click('.quote-submit');
await sleep(400);
let errCount = await page.$$eval('.field-error', (els) => els.length);
log('quote: empty submit shows required errors', errCount === 5, `${errCount} errors`);
await shot('14-quote-errors');

await page.type('#business', 'Apex Roofing Co');
await page.type('#contact', 'Divyaansh Goswami');
await page.type('#email', 'not-an-email');
await page.type('#phone', '0400 111 222');
await page.click('.service-pick');
await page.click('.quote-submit');
await sleep(400);
const emailErr = await page.$$eval('.field-error', (els) => els.map((e) => e.textContent).join(' | '));
log('quote: bad email caught', emailErr.includes('email'), emailErr);

await page.click('#email', { clickCount: 3 });
await page.type('#email', 'divyaansh@apexroofing.com.au');
await page.select('#volume', '200–500 / month');
await page.click('.quote-submit');
await sleep(800);
const success = await page.$('.quote-success');
log('quote: valid submit shows success card', success !== null);
await shot('15-quote-success');

// ---------- mobile (375x812) ----------
await page.setViewport({ width: 375, height: 812 });
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await sleep(1000);
const mob = await page.evaluate(() => ({
  railDisplay: getComputedStyle(document.querySelector('.rail')).display,
  burgerVisible: getComputedStyle(document.querySelector('.nav-burger')).display !== 'none',
  heroH: document.querySelector('.hero-wrap').offsetHeight,
  vh: window.innerHeight,
  headlineOp: parseFloat(getComputedStyle(document.querySelector('[data-el="headline"]')).opacity),
  overflowX: document.documentElement.scrollWidth <= window.innerWidth + 1,
}));
log('mobile: rail hidden', mob.railDisplay === 'none');
log('mobile: hamburger shown', mob.burgerVisible);
log('mobile: hero static dawn (no tall scrub)', mob.heroH <= mob.vh * 1.2 && mob.headlineOp > 0.9, `heroH ${mob.heroH}, headline ${mob.headlineOp}`);
log('mobile: no horizontal overflow', mob.overflowX);
await shot('16-mobile-hero');
await page.click('.nav-burger');
await sleep(400);
await shot('17-mobile-menu');
await page.click('.nav-panel a[href="/compare"]');
await sleep(1200);
await scrollTo(1500);
await shot('18-mobile-compare');
const mobCmp = await page.evaluate(() => {
  const row = document.querySelectorAll('.cmp-row')[2];
  return row ? row.getBoundingClientRect().width : 0;
});
log('mobile: comparison rows stack as cards', mobCmp > 0 && mobCmp < 380, `row width ${mobCmp}`);

await page.goto(BASE + '/real-math', { waitUntil: 'networkidle0' });
await sleep(800);
await scrollTo(800);
await shot('19-mobile-realmath');
const mobWb = await page.evaluate(() => {
  const cells = [...document.querySelectorAll('.wb-row:not(.wb-row--head) .wb-cell')];
  return cells.every((c) => c.getBoundingClientRect().right <= window.innerWidth + 1);
});
log('mobile: whiteboard rows readable, no clipping', mobWb);

await page.goto(BASE + '/quote', { waitUntil: 'networkidle0' });
await sleep(600);
await scrollTo(400);
await shot('20-mobile-quote');

log('console: zero page errors across run', errors.length === 0, errors.slice(0, 5).join(' || ') || 'clean');

await browser.close();
const fails = results.filter((r) => !r.ok);
console.log(`\n==== ${results.length - fails.length}/${results.length} checks passed ====`);
if (fails.length) process.exitCode = 1;
