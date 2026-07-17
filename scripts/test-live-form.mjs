// Drive the REAL deployed form on the live site and report the outcome.
import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SITE = process.argv[2] || 'https://vergomarketingsolutions.vercel.app';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();

let fsReq = null;
let fsRes = null;
page.on('request', (r) => {
  if (r.url().includes('formsubmit.co')) fsReq = { url: r.url(), method: r.method() };
});
page.on('response', async (r) => {
  if (r.url().includes('formsubmit.co') && r.request().method() === 'POST') {
    fsRes = { status: r.status(), body: await r.text().catch(() => '(no body)') };
  }
});
const consoleErrs = [];
page.on('console', (m) => m.type() === 'error' && consoleErrs.push(m.text()));

await page.goto(SITE + '/quote', { waitUntil: 'networkidle0' });
await sleep(800);

// what endpoint is baked into the live bundle?
const endpointInBundle = await page.evaluate(async () => {
  const scripts = [...document.querySelectorAll('script[src]')].map((s) => s.src);
  for (const src of scripts) {
    try {
      const t = await (await fetch(src)).text();
      const m = t.match(/formsubmit\.co\/ajax\/[^"'`]+/);
      if (m) return m[0];
    } catch {}
  }
  return 'not found in bundle';
});
console.log('ENDPOINT IN LIVE BUNDLE:', endpointInBundle);

await page.type('#business', 'Diagnostic Test Co');
await page.type('#contact', 'Automated Probe');
await page.type('#email', 'goswamidivyaansh@gmail.com');
await page.type('#phone', '0481813435');
await page.click('.service-pick');
await page.type('#message', 'Automated end-to-end delivery test — please ignore.');
await page.click('.quote-submit');
await sleep(3500);

const outcome = await page.evaluate(() => ({
  success: !!document.querySelector('.quote-success'),
  error: document.querySelector('.form-senderror')?.textContent?.slice(0, 90) || null,
}));

console.log('\nFORM REQUEST:', JSON.stringify(fsReq));
console.log('FORM RESPONSE:', JSON.stringify(fsRes));
console.log('OUTCOME:', JSON.stringify(outcome));
console.log('CONSOLE ERRORS:', consoleErrs.slice(0, 5).join(' | ') || 'none');
await browser.close();
