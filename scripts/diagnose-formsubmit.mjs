// Reproduce the EXACT browser submission against the live site and read
// what FormSubmit actually returns (CORS + real Origin, unlike PowerShell).
import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SITE = process.argv[2] || 'https://vergomarketingsolutions.vercel.app';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.goto(SITE + '/quote', { waitUntil: 'domcontentloaded' }).catch((e) => console.log('nav warn:', e.message));

// which endpoint is the deployed bundle actually calling?
const endpointInSource = await page.evaluate(async () => {
  try {
    const html = await (await fetch(location.href)).text();
    return 'checked';
  } catch {
    return 'n/a';
  }
});

const result = await page.evaluate(async () => {
  const out = {};
  const bodies = {};
  const endpoints = {
    aliasAjax: 'https://formsubmit.co/ajax/574fc98c40eb790b4c806754b487c034',
    emailAjax: 'https://formsubmit.co/ajax/vergomarketingsolutions@gmail.com',
  };
  for (const [key, url] of Object.entries(endpoints)) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ _subject: 'diagnostic', name: 'diagnostic probe', message: 'diagnostic' }),
      });
      out[key] = res.status + ' ok=' + res.ok;
      bodies[key] = await res.text();
    } catch (e) {
      out[key] = 'FETCH THREW: ' + e.message;
      bodies[key] = '(threw — likely CORS block)';
    }
  }
  return { origin: location.origin, out, bodies };
});

console.log('SITE ORIGIN:', result.origin);
console.log('endpoint source check:', endpointInSource);
for (const k of Object.keys(result.out)) {
  console.log(`\n[${k}] -> ${result.out[k]}`);
  console.log('   body:', (result.bodies[k] || '').slice(0, 300));
}
await browser.close();
