// End-to-end submission through the LIVE form UI (proves the whole path + sends one real lead email).
import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SITE = 'https://vergomarketingsolutions.vercel.app';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
let apiResp = null;
page.on('response', async (res) => {
  if (res.url().includes('formsubmit.co')) {
    apiResp = { status: res.status(), body: await res.text().catch(() => '') };
  }
});

await page.goto(SITE + '/quote', { waitUntil: 'networkidle0' });
await sleep(1200);

// set values via native setter (robust) then submit
await page.evaluate(() => {
  const setVal = (sel, v) => {
    const el = document.querySelector(sel);
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  setVal('#business', 'VM Solutions — live form test');
  setVal('#contact', 'Divyaansh');
  setVal('#email', 'goswamidivyaansh@gmail.com');
  setVal('#phone', '0481813435');
  document.querySelector('.service-pick input').click();
  const ta = document.querySelector('#message');
  const taSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
  taSetter.call(ta, 'This is Claude testing the live quote form end to end. If you got this email, the form works.');
  ta.dispatchEvent(new Event('input', { bubbles: true }));
});
await sleep(300);
await page.evaluate(() => document.querySelector('.quote-submit').click());
await sleep(3500);

const state = await page.evaluate(() => ({
  success: !!document.querySelector('.quote-success'),
  error: document.querySelector('.form-senderror')?.textContent || null,
  heading: document.querySelector('.quote-success h2')?.textContent || null,
}));
console.log('API response:', JSON.stringify(apiResp));
console.log('UI state:', JSON.stringify(state));
console.log(state.success ? '\n✅ LIVE FORM WORKS — success card shown, lead email sent.' : '\n❌ Still failing.');
await browser.close();
if (!state.success) process.exitCode = 1;
