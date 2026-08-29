// scripts/stress-test-popup.mjs
// Adversarial Stress & Edge Case Test Suite for VM Solutions Email Course Popup
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const BASE_URL = 'http://localhost:5173';
const DELAY_MS = 3000;
const BUFFER_MS = 600;

function getBrowserPath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    if (fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
      return process.env.PUPPETEER_EXECUTABLE_PATH;
    }
  }
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No compatible browser executable found (Chrome / Edge).');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ensureDevServer() {
  try {
    const res = await fetch(BASE_URL);
    if (res.ok) {
      console.log(`[DevServer] Connected to existing server at ${BASE_URL}`);
      return { proc: null, spawned: false };
    }
  } catch {
    /* Server not running yet */
  }

  console.log(`[DevServer] Spawning Vite dev server on ${BASE_URL}...`);
  const viteCliPath = path.resolve(ROOT_DIR, 'node_modules/vite/bin/vite.js');
  const proc = spawn(process.execPath, [viteCliPath, '--port', '5173'], {
    cwd: ROOT_DIR,
    stdio: 'ignore',
  });

  const start = Date.now();
  while (Date.now() - start < 15000) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) {
        console.log(`[DevServer] Vite dev server ready at ${BASE_URL}.`);
        return { proc, spawned: true };
      }
    } catch {
      /* Wait for server */
    }
    await sleep(300);
  }
  throw new Error('Vite dev server failed to respond within 15 seconds.');
}

function stopDevServer(serverState) {
  if (serverState?.spawned && serverState?.proc?.pid) {
    console.log(`[DevServer] Stopping spawned dev server (PID: ${serverState.proc.pid})...`);
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /F /T /PID ${serverState.proc.pid}`, { stdio: 'ignore' });
      } else {
        serverState.proc.kill('SIGTERM');
      }
    } catch {
      /* Process already exited */
    }
  }
}

const results = [];
function recordResult(name, passed, detail = '') {
  results.push({ name, passed, detail });
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`${status} | ${name}${detail ? ' | ' + detail : ''}`);
}

async function runStressSuite() {
  console.log('========================================================');
  console.log(' Starting Adversarial & Stress Test Suite for Email Popup');
  console.log('========================================================\n');

  const serverState = await ensureDevServer();
  const executablePath = getBrowserPath();
  console.log(`[Browser] Using browser at: ${executablePath}\n`);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--force-device-scale-factor=1',
      '--hide-scrollbars',
    ],
  });

  try {
    // ----------------------------------------------------------------------
    // STRESS 1: Multi-Context Isolation & Concurrency
    // ----------------------------------------------------------------------
    console.log('--- Stress 1: Multi-Context Isolation & Concurrency ---');
    const ctxA = await browser.createBrowserContext();
    const ctxB = await browser.createBrowserContext();

    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();
    await pageA.setViewport({ width: 1440, height: 900 });
    await pageB.setViewport({ width: 1440, height: 900 });

    // Both open home concurrently
    await Promise.all([
      pageA.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' }),
      pageB.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' }),
    ]);

    // Wait for popup in pageA and dismiss it via close button
    await pageA.waitForSelector('.pop', { timeout: DELAY_MS + 3000 });
    const closeBtnA = await pageA.$('.pop-close');
    await closeBtnA.click();
    await pageA.waitForFunction(() => document.querySelector('.pop') === null);

    const isDismissedA = await pageA.evaluate(() => window.sessionStorage.getItem('vm.popup.dismissed'));
    recordResult('Stress 1: Context A sets sessionStorage upon close', isDismissedA === '1');

    // Context B should NOT be affected by Context A dismissal
    const popInB = await pageB.waitForSelector('.pop', { timeout: DELAY_MS + 3000 });
    recordResult('Stress 1: Context B is isolated and still displays popup', popInB !== null);

    // Verify localStorage has no leakage in either context
    const localA = await pageA.evaluate(() => window.localStorage.getItem('vm.popup.dismissedAt') || window.localStorage.getItem('vm.popup.dismissed'));
    const localB = await pageB.evaluate(() => window.localStorage.getItem('vm.popup.dismissedAt') || window.localStorage.getItem('vm.popup.dismissed'));
    recordResult('Stress 1: Zero localStorage cross-leakage across contexts', localA === null && localB === null);

    await ctxA.close();
    await ctxB.close();

    // ----------------------------------------------------------------------
    // STRESS 2: Dismissal Modalities (Escape Key, Backdrop Click, Form Submit)
    // ----------------------------------------------------------------------
    console.log('\n--- Stress 2: Dismissal Modalities (Escape Key, Backdrop, Form) ---');

    // 2.1 Escape Key Dismissal
    const ctxEscape = await browser.createBrowserContext();
    const pageEscape = await ctxEscape.newPage();
    await pageEscape.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await pageEscape.waitForSelector('.pop', { timeout: DELAY_MS + 3000 });
    
    await pageEscape.keyboard.press('Escape');
    await pageEscape.waitForFunction(() => document.querySelector('.pop') === null);
    const escapeDismissed = await pageEscape.evaluate(() => window.sessionStorage.getItem('vm.popup.dismissed'));
    recordResult('Stress 2.1: Escape key dismisses modal and persists to sessionStorage', escapeDismissed === '1');
    
    // Navigate in same session to confirm suppression after Escape
    await pageEscape.goto(`${BASE_URL}/services`, { waitUntil: 'networkidle0' });
    await sleep(DELAY_MS + BUFFER_MS);
    const popAfterEscape = (await pageEscape.$('.pop')) !== null;
    recordResult('Stress 2.1: Popup stays suppressed after Escape dismissal', !popAfterEscape);
    await ctxEscape.close();

    // 2.2 Backdrop Click Dismissal
    const ctxBackdrop = await browser.createBrowserContext();
    const pageBackdrop = await ctxBackdrop.newPage();
    await pageBackdrop.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await pageBackdrop.waitForSelector('.pop', { timeout: DELAY_MS + 3000 });

    // Click outside modal (.pop-backdrop) at coordinate (10, 10)
    await pageBackdrop.mouse.click(10, 10);
    await pageBackdrop.waitForFunction(() => document.querySelector('.pop') === null);
    const backdropDismissed = await pageBackdrop.evaluate(() => window.sessionStorage.getItem('vm.popup.dismissed'));
    recordResult('Stress 2.2: Backdrop click dismisses modal and persists to sessionStorage', backdropDismissed === '1');
    await ctxBackdrop.close();

    // 2.3 Form Submission Dismissal
    const ctxForm = await browser.createBrowserContext();
    const pageForm = await ctxForm.newPage();
    await pageForm.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await pageForm.waitForSelector('.pop', { timeout: DELAY_MS + 3000 });

    // Intercept / mock MailerLite request to return successful response
    await pageForm.setRequestInterception(true);
    pageForm.on('request', (req) => {
      if (req.url().includes('mailerlite.com')) {
        req.respond({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true }),
        });
      } else {
        req.continue();
      }
    });

    await pageForm.type('#pop-email', 'tradie.boss@example.com.au');
    await pageForm.type('#pop-phone', '0412345678');
    await pageForm.click('.pop-cta');

    // Wait for "You're in" confirmation view
    await pageForm.waitForSelector('.pop-done', { timeout: 3000 });
    const formDismissed = await pageForm.evaluate(() => window.sessionStorage.getItem('vm.popup.dismissed'));
    recordResult('Stress 2.3: Form submit transitions to success and sets sessionStorage', formDismissed === '1');

    // Click "Back to the site"
    await pageForm.click('.pop-cta--ghost');
    await pageForm.waitForFunction(() => document.querySelector('.pop') === null);
    const modalClosedAfterSubmit = (await pageForm.$('.pop')) === null;
    recordResult('Stress 2.3: "Back to the site" button cleanly closes modal', modalClosedAfterSubmit);

    // Verify suppression after form submit
    await pageForm.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await sleep(DELAY_MS + BUFFER_MS);
    const popAfterSubmit = (await pageForm.$('.pop')) !== null;
    recordResult('Stress 2.3: Popup remains suppressed on subsequent home visit after submission', !popAfterSubmit);
    await ctxForm.close();

    // ----------------------------------------------------------------------
    // STRESS 3: Direct Skip Route (/quote) to In-App Navigation Flow
    // ----------------------------------------------------------------------
    console.log('\n--- Stress 3: Skip Route (/quote) Arrival & Subsequent Navigation ---');
    const ctxQuote = await browser.createBrowserContext();
    const pageQuote = await ctxQuote.newPage();
    
    // Land on /quote
    await pageQuote.goto(`${BASE_URL}/quote`, { waitUntil: 'networkidle0' });
    await sleep(DELAY_MS + BUFFER_MS);
    const popOnQuoteDirect = (await pageQuote.$('.pop')) !== null;
    recordResult('Stress 3: Direct arrival on /quote suppresses initial popup', !popOnQuoteDirect);

    // Now user navigates to /services (either via link or URL)
    await pageQuote.goto(`${BASE_URL}/services`, { waitUntil: 'networkidle0' });
    // Since /quote did not set scheduled = true (due to early return in effect), arriving on /services triggers popup after 3s
    const popOnServicesAfterQuote = await pageQuote.waitForSelector('.pop', { timeout: DELAY_MS + 3000 }).catch(() => null);
    recordResult('Stress 3: Navigating from /quote to /services triggers popup as expected on unvisited site', popOnServicesAfterQuote !== null);

    // Dismiss on /services
    const closeBtnQuoteFlow = await pageQuote.$('.pop-close');
    if (closeBtnQuoteFlow) await closeBtnQuoteFlow.click();
    await pageQuote.waitForFunction(() => document.querySelector('.pop') === null);

    // Return to /quote
    await pageQuote.goto(`${BASE_URL}/quote`, { waitUntil: 'networkidle0' });
    await sleep(DELAY_MS + BUFFER_MS);
    const popOnQuoteReturn = (await pageQuote.$('.pop')) !== null;
    recordResult('Stress 3: Returning to /quote remains clean with no popup', !popOnQuoteReturn);
    await ctxQuote.close();

    // ----------------------------------------------------------------------
    // STRESS 4: Session Storage Reset (Simulating Fresh Session in Tab)
    // ----------------------------------------------------------------------
    console.log('\n--- Stress 4: Session Storage Reset (Manual Session Clear) ---');
    const ctxReset = await browser.createBrowserContext();
    const pageReset = await ctxReset.newPage();
    await pageReset.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await pageReset.waitForSelector('.pop', { timeout: DELAY_MS + 3000 });
    const closeBtnReset = await pageReset.$('.pop-close');
    await closeBtnReset.click();
    await pageReset.waitForFunction(() => document.querySelector('.pop') === null);

    // Verify dismissed
    const beforeClear = await pageReset.evaluate(() => window.sessionStorage.getItem('vm.popup.dismissed'));
    recordResult('Stress 4: Session storage is 1 before clearing', beforeClear === '1');

    // Simulate clearing session storage
    await pageReset.evaluate(() => window.sessionStorage.clear());

    // Reload page
    await pageReset.reload({ waitUntil: 'networkidle0' });
    const popAfterClear = await pageReset.waitForSelector('.pop', { timeout: DELAY_MS + 3000 }).catch(() => null);
    recordResult('Stress 4: Clearing sessionStorage causes popup to trigger again on reload', popAfterClear !== null);
    await ctxReset.close();

    // ----------------------------------------------------------------------
    // STRESS 5: Scroll Lock Cleanup & Accessibility Body State
    // ----------------------------------------------------------------------
    console.log('\n--- Stress 5: Scroll Lock & DOM Body Cleanup ---');
    const ctxDom = await browser.createBrowserContext();
    const pageDom = await ctxDom.newPage();
    await pageDom.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    // Check body overflow before popup
    const overflowBefore = await pageDom.evaluate(() => document.body.style.overflow);

    // Wait for popup
    await pageDom.waitForSelector('.pop', { timeout: DELAY_MS + 3000 });
    const overflowDuring = await pageDom.evaluate(() => document.body.style.overflow);
    recordResult('Stress 5: Body overflow locked to "hidden" while popup is open', overflowDuring === 'hidden');

    // Close popup
    const closeBtnDom = await pageDom.$('.pop-close');
    await closeBtnDom.click();
    await pageDom.waitForFunction(() => document.querySelector('.pop') === null);

    const overflowAfter = await pageDom.evaluate(() => document.body.style.overflow);
    recordResult('Stress 5: Body overflow restored after popup close', overflowAfter === overflowBefore);
    await ctxDom.close();

    // ----------------------------------------------------------------------
    // STRESS 6: Storage Exception Resilience (Private/Restricted Mode)
    // ----------------------------------------------------------------------
    console.log('\n--- Stress 6: Storage Exception Resilience ---');
    const ctxErr = await browser.createBrowserContext();
    const pageErr = await ctxErr.newPage();

    // Throw error on any sessionStorage access before navigating
    await pageErr.evaluateOnNewDocument(() => {
      const throwError = () => {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      };
      Object.defineProperty(window, 'sessionStorage', {
        get: throwError,
      });
    });

    let pageCrashed = false;
    pageErr.on('pageerror', (err) => {
      console.error('Page error logged under storage restriction:', err.message);
      pageCrashed = true;
    });

    await pageErr.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    const popUnderRestriction = await pageErr.waitForSelector('.pop', { timeout: DELAY_MS + 3000 }).catch(() => null);
    recordResult('Stress 6: App degrades gracefully and does not crash when sessionStorage throws SecurityError', !pageCrashed && popUnderRestriction !== null);

    if (popUnderRestriction) {
      const closeErr = await pageErr.$('.pop-close');
      await closeErr.click();
      await pageErr.waitForFunction(() => document.querySelector('.pop') === null);
      recordResult('Stress 6: Modal closes gracefully even when storage setItem throws', !pageCrashed);
    }
    await ctxErr.close();

  } finally {
    await browser.close();
    stopDevServer(serverState);
  }

  // Summary
  const failed = results.filter((r) => !r.passed);
  console.log('\n========================================================');
  console.log(` Stress Test Summary: ${results.length - failed.length}/${results.length} checks passed`);
  console.log('========================================================\n');

  if (failed.length > 0) {
    console.error(`Failed ${failed.length} stress assertions.`);
    process.exit(1);
  }
  process.exit(0);
}

runStressSuite().catch((err) => {
  console.error('Fatal error in stress suite:', err);
  process.exit(1);
});
