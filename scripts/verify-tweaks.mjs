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
await page.setViewport({ width: 1440, height: 900 });

// compare page: price spacing
await page.goto('http://localhost:5173/compare', { waitUntil: 'networkidle0' });
await sleep(700);
const spacing = await page.evaluate(() => {
  const h3 = document.querySelector('.spec-cell--win h3').getBoundingClientRect();
  const price = document.querySelector('.spec-cell--win .spec-price').getBoundingClientRect();
  const list = document.querySelector('.spec-cell--win .spec-list').getBoundingClientRect();
  return { above: Math.round(price.top - h3.bottom), below: Math.round(list.top - price.bottom) };
});
log('spec price: breathing room above/below', spacing.above >= 28 && spacing.below >= 28, JSON.stringify(spacing));
await page.evaluate(() => {
  const el = document.querySelector('.spec-duel');
  window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 130);
});
await sleep(800);
await page.screenshot({ path: `${OUT}/spec-spacing.png` });

// quote page: FAQ heading
await page.goto('http://localhost:5173/quote', { waitUntil: 'networkidle0' });
await sleep(600);
const faqH2 = await page.evaluate(() =>
  [...document.querySelectorAll('h2')].map((e) => e.textContent).find((t) => t.includes('Common'))
);
log('FAQ heading reworded', faqH2 === 'Common questions, answered.', faqH2);

// footer: socials gone, trust points in
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await sleep(900);
const footer = await page.evaluate(() => ({
  socials: document.querySelectorAll('.footer-social a').length,
  points: document.querySelectorAll('.footer-point').length,
  extLinks: [...document.querySelectorAll('.footer a')].filter((a) => /facebook|instagram|linkedin/.test(a.href)).length,
}));
log('footer: socials removed, 2 trust points added', footer.socials === 0 && footer.points === 2 && footer.extLinks === 0, JSON.stringify(footer));
await page.screenshot({ path: `${OUT}/footer.png` });

await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`==== ${results.length - fails}/${results.length} passed ====`);
if (fails) process.exitCode = 1;
