import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.argv[2] || 'shots';
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BASE = 'http://localhost:5173';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--force-device-scale-factor=1'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const scrollTo = async (y) => {
  await page.evaluate((yy) => {
    if (window.__lenis) window.__lenis.scrollTo(yy, { immediate: true, force: true });
    else window.scrollTo(0, yy);
  }, y);
  await sleep(900);
};

// ---- Real Math ----
await page.goto(BASE + '/real-math', { waitUntil: 'networkidle0' });
await sleep(600);
const rm = await page.evaluate(() => {
  const cells = [...document.querySelectorAll('.wb-row:not(.wb-row--head) .wb-cell--cost')].map((c) => c.textContent.replace('Monthly cost:', '').trim());
  const vmPrice = document.querySelector('.wb-vm-price')?.textContent || null;
  const vmHasLink = !!document.querySelector('.wb-vm-link[href="/quote"]');
  return { costs: cells, vmPrice, vmHasLink };
});
console.log('REAL MATH costs:', JSON.stringify(rm, null, 2));
// frame the VM row area
await page.evaluate(() => {
  const el = document.querySelector('.wb-row--vm');
  const y = el.getBoundingClientRect().top + window.scrollY - 260;
  window.scrollTo(0, y);
});
await sleep(700);
await page.screenshot({ path: `${OUT}/realmath-rows.png` });

// ---- Footer contact (home) ----
await page.goto(BASE + '/', { waitUntil: 'networkidle0' });
await sleep(500);
await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await sleep(900);
const footer = await page.evaluate(() => {
  const rows = [...document.querySelectorAll('.footer-contact-row')].map((r) => r.textContent.trim());
  const tel = document.querySelector('.footer a[href^="tel:"]')?.getAttribute('href');
  const mail = document.querySelector('.footer a[href^="mailto:"]')?.getAttribute('href');
  return { rows, tel, mail };
});
console.log('FOOTER:', JSON.stringify(footer, null, 2));
await page.screenshot({ path: `${OUT}/footer.png` });

// ---- Quote aside contact ----
await page.goto(BASE + '/quote', { waitUntil: 'networkidle0' });
await sleep(500);
const quote = await page.evaluate(() => {
  const tel = document.querySelector('.aside-contact[href^="tel:"]')?.getAttribute('href');
  const telText = document.querySelector('.aside-contact[href^="tel:"]')?.textContent.trim();
  const mail = document.querySelector('.aside-contact[href^="mailto:"]')?.getAttribute('href');
  const mailText = document.querySelector('.aside-contact[href^="mailto:"]')?.textContent.trim();
  return { tel, telText, mail, mailText };
});
console.log('QUOTE ASIDE:', JSON.stringify(quote, null, 2));

// success card message uses phone
await page.type('#business', 'Apex Roofing Co');
await page.type('#contact', 'Sam');
await page.type('#email', 'sam@apex.com.au');
await page.type('#phone', '0400 000 000');
await page.click('.service-pick');
await page.click('.quote-submit');
await sleep(700);

await browser.close();
console.log('DONE');
