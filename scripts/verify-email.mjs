// Verifies the quote form's email submission flow with the network mocked.
import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const log = (name, ok, detail = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'} | ${name}${detail ? ' | ' + detail : ''}`);
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

let captured = null;
await page.setRequestInterception(true);
let mode = 'success';
page.on('request', (req) => {
  if (req.url().includes('formsubmit.co/ajax')) {
    if (req.method() === 'OPTIONS') {
      // CORS preflight — wave it through
      req.respond({
        status: 204,
        headers: {
          'access-control-allow-origin': '*',
          'access-control-allow-methods': 'POST, OPTIONS',
          'access-control-allow-headers': 'content-type, accept',
        },
      });
      return;
    }
    captured = { url: req.url(), body: req.postData() };
    if (mode === 'success') {
      req.respond({
        status: 200,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({ success: 'true', message: 'ok' }),
      });
    } else {
      req.respond({
        status: 500,
        contentType: 'application/json',
        headers: { 'access-control-allow-origin': '*' },
        body: JSON.stringify({ success: 'false', message: 'boom' }),
      });
    }
    return;
  }
  req.continue();
});

const fill = async () => {
  await page.goto('http://localhost:5173/quote', { waitUntil: 'networkidle0' });
  await sleep(600);
  await page.type('#business', 'Apex Roofing Co');
  await page.type('#contact', 'Sam Tester');
  await page.type('#email', 'sam@apexroofing.com.au');
  await page.type('#phone', '0400 111 222');
  await page.click('.service-pick');
  await page.select('#volume', '50–200 / month');
  await page.type('#message', 'Testing the quote form wiring.');
};

// success path
await fill();
await page.click('.quote-submit');
await sleep(900);
log('submit: request sent to FormSubmit endpoint', !!captured && captured.url.includes('vergomarketingsolutions@gmail.com'), captured?.url);
const payload = captured ? JSON.parse(captured.body) : {};
log(
  'submit: payload carries all fields',
  payload['Business name'] === 'Apex Roofing Co' &&
    payload['Email'] === 'sam@apexroofing.com.au' &&
    payload['Phone'] === '0400 111 222' &&
    payload['Services interested in'] === 'AI Receptionist' &&
    payload['Monthly call/lead volume'] === '50–200 / month' &&
    payload['_subject'].includes('Apex Roofing Co'),
  JSON.stringify(payload).slice(0, 160)
);
log('submit: success card shown', (await page.$('.quote-success')) !== null);

// failure path -> inline error + form still there
mode = 'fail';
captured = null;
await fill();
await page.click('.quote-submit');
await sleep(900);
const errText = await page.$eval('.form-senderror', (el) => el.textContent).catch(() => null);
log('failure: inline fallback message shown', !!errText && errText.includes('0481 813 435'), (errText || '').slice(0, 80));
log('failure: form preserved (no false success)', (await page.$('.quote-success')) === null);

// validation unaffected: empty submit sends nothing
mode = 'success';
captured = null;
await page.goto('http://localhost:5173/quote', { waitUntil: 'networkidle0' });
await sleep(500);
await page.click('.quote-submit');
await sleep(500);
log('validation: empty submit makes no network call', captured === null);

await browser.close();
const fails = results.filter((r) => !r).length;
console.log(`\n==== ${results.length - fails}/${results.length} checks passed ====`);
if (fails) process.exitCode = 1;
