// Headless verification for the redesign pass.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:5173';
const OUT = process.argv[2] || 'shots';
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const log = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${detail ? ' | ' + detail : ''}`);
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--force-device-scale-factor=1', '--hide-scrollbars'],
});
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + String(e)));
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text());
});

const scrollTo = async (y) => {
  await page.evaluate((yy) => {
    if (window.__lenis) window.__lenis.scrollTo(yy, { immediate: true, force: true });
    window.scrollTo(0, yy);
  }, y);
  await sleep(1000);
};

// ---------- desktop home ----------
await page.setViewport({ width: 1440, height: 900 });
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await page.waitForSelector('#stars circle');
await sleep(700);

log('meta: home title', (await page.title()).includes('24/7 AI Receptionist'), await page.title());

const dims = await page.evaluate(() => ({
  heroH: document.querySelector('.hero-wrap').offsetHeight,
  vh: window.innerHeight,
  docH: document.documentElement.scrollHeight,
}));
const heroSpan = dims.heroH - dims.vh;

// hero scrub still works both directions
let stars = await page.$eval('#stars', (el) => parseFloat(el.getAttribute('opacity') ?? '1'));
log('hero: night state', stars > 0.95);
await scrollTo(heroSpan * 0.99);
const dawn = await page.evaluate(() => ({
  fog: parseFloat(document.querySelector('#fogSheet').getAttribute('opacity')),
  cardOp: parseFloat(getComputedStyle(document.querySelector('[data-el="card"]')).opacity),
}));
log('hero: dawn + call card revealed', dawn.fog < 0.05 && dawn.cardOp > 0.9, JSON.stringify(dawn));

// call loop cycles: poll one full ~8.5s cycle, expect both states to appear
const states = await page.evaluate(async () => {
  const seen = new Set();
  const el = document.querySelector('[data-call="status"]');
  for (let i = 0; i < 24; i++) {
    seen.add(el.textContent.startsWith('Incoming') ? 'incoming' : 'answered');
    await new Promise((r) => setTimeout(r, 400));
  }
  return [...seen];
});
log('hero: call loop animates (ring + answer states)', states.length === 2, states.join(','));
await page.screenshot({ path: `${OUT}/hero-dawn-call.png` });

// trust bar + steps — jump to the pillar grid by element position
await page.evaluate(() => {
  const el = document.querySelector('.pillar-grid');
  const y = el.getBoundingClientRect().top + window.scrollY - 320;
  if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
  window.scrollTo(0, y);
});
await sleep(1200);
const trust = await page.$$eval('.trust-item', (els) => els.length);
log('trust bar: 4 numbers', trust === 4, `${trust}`);
const marquee = await page.$('.marquee');
log('marquee removed', marquee === null);
const steps = await page.$$eval('.pillar-card .step-chip', (els) => els.map((e) => e.textContent));
log('pillars: 3 step chips in order', steps.length === 3 && steps[0].includes('1') && steps[2].includes('3'), steps.join(' / '));
await page.screenshot({ path: `${OUT}/home-steps.png` });

// icon pop-in ran (poll until the stagger settles, max 5s)
const iconOk = await page.evaluate(async () => {
  const visible = () =>
    [...document.querySelectorAll('.pillar-card .icon-glass, .trust-item .icon-glass')].every(
      (el) => parseFloat(getComputedStyle(el).opacity) > 0.9
    );
  for (let i = 0; i < 25; i++) {
    if (visible()) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
});
log('icons: scroll pop-in settled visible', iconOk);

// CTA is deep navy
const ctaBg = await page.$eval('.pillars-cta .button-primary', (el) => getComputedStyle(el).backgroundColor);
log('CTA: navy from palette', ctaBg.includes('14, 27, 51'), ctaBg);

// icon hover must not scale/rotate (that's what caused the blur)
const hoverT = await page.evaluate(() => {
  const el = document.querySelector('.pillar-card .icon-glass');
  el.parentElement.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  return new Promise((r) => {
    setTimeout(() => {
      const card = el.closest('.pillar-card');
      card.classList.add('js-hover');
      r(getComputedStyle(el).transform);
    }, 100);
  });
});
log('icons: hover uses translate only (no blur-inducing scale)', !/matrix\(0\.|matrix\(1\.[1-9]/.test(hoverT), hoverT);

// ---------- services ----------
await page.goto(BASE + '/services', { waitUntil: 'networkidle0' });
await sleep(800);
log('meta: services title', (await page.title()).includes('Services'), await page.title());
const svcOrder = await page.$$eval('.svc h2', (els) => els.map((e) => e.textContent));
log(
  'services: audit -> build -> answer order',
  svcOrder[0].includes('Review') && svcOrder[1].includes('Marketing') && svcOrder[2].includes('Receptionist'),
  svcOrder.join(' / ')
);

// ---------- compare + calculator ----------
await page.goto(BASE + '/compare', { waitUntil: 'networkidle0' });
await sleep(800);
log('meta: compare title', (await page.title()).includes('Cost Comparison'), await page.title());
await page.evaluate(() => {
  const el = document.querySelector('.calc');
  const y = el.getBoundingClientRect().top + window.scrollY - 200;
  if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
  window.scrollTo(0, y);
});
await sleep(900);
// side-by-side table: checks + dashes render
const marks = await page.evaluate(() => ({
  checks: document.querySelectorAll('.cmp-check').length,
  dashes: document.querySelectorAll('.cmp-dash').length,
  headIcons: document.querySelectorAll('.cmp-row--head .icon-glass').length,
}));
log('table: check/dash marks + header icons', marks.checks === 6 && marks.dashes === 6 && marks.headIcons === 2, JSON.stringify(marks));
await page.evaluate(() => {
  const el = document.querySelector('.cmp-table');
  const y = el.getBoundingClientRect().top + window.scrollY - 160;
  if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
  window.scrollTo(0, y);
});
await sleep(900);
await page.screenshot({ path: `${OUT}/cmp-table.png` });

const leak1 = await page.$eval('.calc-leak', (el) => el.textContent);
await page.evaluate(() => {
  const input = document.querySelector('.calc-row input');
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(input, 20);
  input.dispatchEvent(new Event('input', { bubbles: true }));
});
await sleep(300);
const leak2 = await page.$eval('.calc-leak', (el) => el.textContent);
log('calculator: sliders drive the number', leak1 !== leak2, `${leak1} -> ${leak2}`);
await page.screenshot({ path: `${OUT}/calc.png` });

// seal centering: text box fits inside circle
const seal = await page.evaluate(() => {
  const wrap = document.querySelector('.guarantee-seal').getBoundingClientRect();
  const strong = document.querySelector('.guarantee-seal strong').getBoundingClientRect();
  const span = document.querySelector('.guarantee-seal span').getBoundingClientRect();
  const inside = (r) => r.left >= wrap.left + 10 && r.right <= wrap.right - 10;
  return { ok: inside(strong) && inside(span), w: Math.round(wrap.width) };
});
log('seal: text clear of dashed ring', seal.ok, `seal ${seal.w}px`);
await page.evaluate(() => {
  const el = document.querySelector('.guarantee');
  const y = el.getBoundingClientRect().top + window.scrollY - 300;
  if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
  window.scrollTo(0, y);
});
await sleep(700);
await page.screenshot({ path: `${OUT}/seal.png` });

// ---------- real math (Kalam gone) ----------
await page.goto(BASE + '/real-math', { waitUntil: 'networkidle0' });
await sleep(800);
log('meta: real math title', (await page.title()).includes('Real Math'), await page.title());
const fonts = await page.evaluate(() => ({
  cell: getComputedStyle(document.querySelector('.wb-row:not(.wb-row--head) .wb-cell--opt')).fontFamily,
  title: getComputedStyle(document.querySelector('.wb-title')).fontFamily,
}));
log('fonts: whiteboard body back to Kalam (as before)', fonts.cell.includes('Kalam'), fonts.cell);
log('fonts: title still Caveat', fonts.title.includes('Caveat'), fonts.title);
await scrollTo(500);
await page.screenshot({ path: `${OUT}/realmath.png` });

// ---------- quote ----------
await page.goto(BASE + '/quote', { waitUntil: 'networkidle0' });
await sleep(700);
log('meta: quote title', (await page.title()).includes('Quote'), await page.title());
await page.click('.quote-submit');
await sleep(400);
const errCount = await page.$$eval('.field-error', (els) => els.length);
log('quote: validation intact', errCount === 5, `${errCount} errors`);

// ---------- mobile ----------
await page.setViewport({ width: 375, height: 812 });
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await sleep(1200);
const mob = await page.evaluate(() => ({
  overflowX: document.documentElement.scrollWidth <= window.innerWidth + 1,
  card: !!document.querySelector('.hero-call'),
  cardOp: parseFloat(getComputedStyle(document.querySelector('.hero-call')).opacity),
  railHidden: getComputedStyle(document.querySelector('.rail')).display === 'none',
  heroFits: document.querySelector('.hero-content').scrollHeight <= window.innerHeight + 8,
}));
log('mobile: no overflow, rail hidden', mob.overflowX && mob.railHidden, JSON.stringify(mob));
log('mobile: call card visible + fits', mob.card && mob.cardOp > 0.9 && mob.heroFits, JSON.stringify(mob));
await page.screenshot({ path: `${OUT}/mobile-hero.png` });
await page.goto(BASE + '/compare', { waitUntil: 'networkidle0' });
await sleep(800);
await page.evaluate(() => {
  const el = document.querySelector('.calc');
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 90);
});
await sleep(700);
await page.screenshot({ path: `${OUT}/mobile-calc.png` });

log('console: zero page errors', errors.length === 0, errors.slice(0, 4).join(' || ') || 'clean');

await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n==== ${results.length - fails}/${results.length} checks passed ====`);
if (fails) process.exitCode = 1;
