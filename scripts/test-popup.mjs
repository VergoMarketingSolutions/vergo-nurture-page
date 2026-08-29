// scripts/test-popup.mjs
// Automated Puppeteer browser test suite for VM Solutions Email Course Popup session lifecycle.
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

// Resolve Chrome / Edge binary
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

// Dev Server Manager
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

// Test Suite Runner
const results = [];
function recordResult(name, passed, detail = '') {
  results.push({ name, passed, detail });
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`${status} | ${name}${detail ? ' | ' + detail : ''}`);
}

async function runSuite() {
  console.log('========================================================');
  console.log(' Starting Email Popup Comprehensive Test & Stress Suite');
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
    // ----------------------------------------------------
    // Scenario 1: Fresh browser context / arrival (R1)
    // ----------------------------------------------------
    console.log('--- Scenario 1: Fresh Context / Arrival ---');
    const context1 = await browser.createBrowserContext();
    const page1 = await context1.newPage();
    await page1.setViewport({ width: 1440, height: 900 });

    await page1.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    // Verify popup is not immediately visible before the 3s delay
    const immediatePop = await page1.$('.pop');
    recordResult('Fresh Visit: popup does not appear immediately before delay', immediatePop === null);

    // Wait for popup to appear after 3000ms delay
    const popSelector = await page1.waitForSelector('.pop', { timeout: DELAY_MS + 3000 }).catch(() => null);
    recordResult('Fresh Visit: popup appears within expected delay', popSelector !== null);

    // Check title and content
    const titleText = await page1.$eval('#pop-title', (el) => el.textContent).catch(() => '');
    recordResult(
      'Fresh Visit: popup contains correct course title',
      titleText.includes('Stop sending the apprentice'),
      titleText.trim().replace(/\s+/g, ' ')
    );

    // Check email input and CTA
    const hasFormInputs = await page1.evaluate(() => {
      const email = document.querySelector('#pop-email');
      const submit = document.querySelector('.pop-cta');
      return email !== null && submit !== null;
    });
    recordResult('Fresh Visit: popup contains email input and CTA button', hasFormInputs);

    // ----------------------------------------------------
    // Scenario 2: In-session route navigation & reload (R1)
    // ----------------------------------------------------
    console.log('\n--- Scenario 2: In-Session Route Navigation & Reload ---');
    const closeBtn = await page1.$('.pop-close');
    if (closeBtn) {
      await closeBtn.click();
      await page1.waitForFunction(() => document.querySelector('.pop') === null, { timeout: 2000 }).catch(() => {});
      const isClosed = (await page1.$('.pop')) === null;
      recordResult('Dismissal: popup closes when close button is clicked', isClosed);
    } else {
      recordResult('Dismissal: close button found', false);
    }

    // Verify sessionStorage has key set
    const dismissedKeyVal = await page1.evaluate(() => window.sessionStorage.getItem('vm.popup.dismissed'));
    recordResult('Dismissal: sessionStorage key vm.popup.dismissed is set to "1"', dismissedKeyVal === '1');

    // Navigate to /services
    await page1.goto(`${BASE_URL}/services`, { waitUntil: 'networkidle0' });
    await sleep(DELAY_MS + BUFFER_MS);
    let popupPresent = (await page1.$('.pop')) !== null;
    recordResult('In-Session: popup does not appear on /services after dismissal', !popupPresent);

    // Navigate to /compare
    await page1.goto(`${BASE_URL}/compare`, { waitUntil: 'networkidle0' });
    await sleep(DELAY_MS + BUFFER_MS);
    popupPresent = (await page1.$('.pop')) !== null;
    recordResult('In-Session: popup does not appear on /compare', !popupPresent);

    // Navigate back to home /
    await page1.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await sleep(DELAY_MS + BUFFER_MS);
    popupPresent = (await page1.$('.pop')) !== null;
    recordResult('In-Session: popup does not reappear when returning to /', !popupPresent);

    // Reload page within the same session
    await page1.reload({ waitUntil: 'networkidle0' });
    await sleep(DELAY_MS + BUFFER_MS);
    popupPresent = (await page1.$('.pop')) !== null;
    recordResult('In-Session: popup does not reappear on page reload in same session', !popupPresent);

    await context1.close();

    // ----------------------------------------------------
    // Scenario 3: New browser context / new visit (R2)
    // ----------------------------------------------------
    console.log('\n--- Scenario 3: New Browser Context (New Visit) ---');
    const context2 = await browser.createBrowserContext();
    const page2 = await context2.newPage();
    await page2.setViewport({ width: 1440, height: 900 });

    await page2.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    const popSelector2 = await page2.waitForSelector('.pop', { timeout: DELAY_MS + 3000 }).catch(() => null);
    recordResult('New Visit: popup appears again in a fresh browser context', popSelector2 !== null);

    // Verify localStorage was NOT used for long-term dismissal
    const localStorageKey = await page2.evaluate(() => window.localStorage.getItem('vm.popup.dismissedAt'));
    recordResult('New Visit: localStorage 7-day memory key is absent', localStorageKey === null);

    await context2.close();

    // ----------------------------------------------------
    // Scenario 4: Skip route check (/quote)
    // ----------------------------------------------------
    console.log('\n--- Scenario 4: Skip Route Check (/quote) ---');
    const context3 = await browser.createBrowserContext();
    const page3 = await context3.newPage();
    await page3.setViewport({ width: 1440, height: 900 });

    await page3.goto(`${BASE_URL}/quote`, { waitUntil: 'networkidle0' });
    await sleep(DELAY_MS + BUFFER_MS);
    const popOnQuote = (await page3.$('.pop')) !== null;
    recordResult('Skip Route: popup does not appear when landing directly on /quote', !popOnQuote);

    await context3.close();

    // ----------------------------------------------------------------------
    // Scenario 5: Multi-Context Concurrency & Cross-Session Isolation
    // ----------------------------------------------------------------------
    console.log('\n--- Scenario 5: Multi-Context Concurrency & Cross-Session Isolation ---');
    const ctxA = await browser.createBrowserContext();
    const ctxB = await browser.createBrowserContext();

    const pageA = await ctxA.newPage();
    const pageB = await ctxB.newPage();
    await pageA.setViewport({ width: 1440, height: 900 });
    await pageB.setViewport({ width: 1440, height: 900 });

    // Open concurrently
    await Promise.all([
      pageA.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' }),
      pageB.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' }),
    ]);

    await pageA.waitForSelector('.pop', { timeout: DELAY_MS + 3000 });
    const closeBtnA = await pageA.$('.pop-close');
    await closeBtnA.click();
    await pageA.waitForFunction(() => document.querySelector('.pop') === null);

    const isDismissedA = await pageA.evaluate(() => window.sessionStorage.getItem('vm.popup.dismissed'));
    recordResult('Concurrent Sessions: Context A sets sessionStorage on close', isDismissedA === '1');

    // Context B should still display popup independently
    const popInB = await pageB.waitForSelector('.pop', { timeout: DELAY_MS + 3000 });
    recordResult('Concurrent Sessions: Context B is isolated and displays popup', popInB !== null);

    // Verify localStorage has no cross-leakage
    const localA = await pageA.evaluate(() => window.localStorage.getItem('vm.popup.dismissedAt') || window.localStorage.getItem('vm.popup.dismissed'));
    const localB = await pageB.evaluate(() => window.localStorage.getItem('vm.popup.dismissedAt') || window.localStorage.getItem('vm.popup.dismissed'));
    recordResult('Concurrent Sessions: Zero localStorage cross-leakage across contexts', localA === null && localB === null);

    await ctxA.close();
    await ctxB.close();

    // ----------------------------------------------------------------------
    // Scenario 6: Dismissal Modalities (Escape Key, Backdrop, Form Submission)
    // ----------------------------------------------------------------------
    console.log('\n--- Scenario 6: Dismissal Modalities (Escape, Backdrop, Form) ---');

    // 6.1 Escape key
    const ctxEscape = await browser.createBrowserContext();
    const pageEscape = await ctxEscape.newPage();
    await pageEscape.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await pageEscape.waitForSelector('.pop', { timeout: DELAY_MS + 3000 });
    await pageEscape.keyboard.press('Escape');
    await pageEscape.waitForFunction(() => document.querySelector('.pop') === null);
    const escapeDismissed = await pageEscape.evaluate(() => window.sessionStorage.getItem('vm.popup.dismissed'));
    recordResult('Dismissal Modality: Escape key dismisses modal and persists to sessionStorage', escapeDismissed === '1');
    await ctxEscape.close();

    // 6.2 Backdrop click
    const ctxBackdrop = await browser.createBrowserContext();
    const pageBackdrop = await ctxBackdrop.newPage();
    await pageBackdrop.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await pageBackdrop.waitForSelector('.pop', { timeout: DELAY_MS + 3000 });
    await pageBackdrop.mouse.click(10, 10);
    await pageBackdrop.waitForFunction(() => document.querySelector('.pop') === null);
    const backdropDismissed = await pageBackdrop.evaluate(() => window.sessionStorage.getItem('vm.popup.dismissed'));
    recordResult('Dismissal Modality: Backdrop click dismisses modal and persists to sessionStorage', backdropDismissed === '1');
    await ctxBackdrop.close();

    // 6.3 Form submission
    const ctxForm = await browser.createBrowserContext();
    const pageForm = await ctxForm.newPage();
    await pageForm.setRequestInterception(true);
    pageForm.on('request', (req) => {
      if (req.url().includes('mailerlite.com')) {
        req.respond({
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ success: true }),
        });
      } else {
        req.continue();
      }
    });

    await pageForm.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await pageForm.waitForSelector('.pop', { timeout: DELAY_MS + 3000 });

    await pageForm.type('#pop-email', 'tradie.test@example.com.au');
    await pageForm.type('#pop-phone', '0412345678');
    await pageForm.click('.pop-cta');

    await pageForm.waitForSelector('.pop-done', { timeout: 4000 });
    const formDismissed = await pageForm.evaluate(() => window.sessionStorage.getItem('vm.popup.dismissed'));
    recordResult('Dismissal Modality: Form submit transitions to success and sets sessionStorage', formDismissed === '1');

    await pageForm.click('.pop-cta--ghost');
    await pageForm.waitForFunction(() => document.querySelector('.pop') === null);
    const modalClosedAfterSubmit = (await pageForm.$('.pop')) === null;
    recordResult('Dismissal Modality: "Back to the site" CTA cleanly closes modal', modalClosedAfterSubmit);

    // Verify suppression
    await pageForm.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await sleep(DELAY_MS + BUFFER_MS);
    const popAfterSubmit = (await pageForm.$('.pop')) !== null;
    recordResult('Dismissal Modality: Popup remains suppressed after successful submission', !popAfterSubmit);
    await ctxForm.close();

    // ----------------------------------------------------------------------
    // Scenario 7: Skip Route Landing to In-App Navigation Flow
    // ----------------------------------------------------------------------
    console.log('\n--- Scenario 7: Skip Route (/quote) to In-App Navigation Flow ---');
    const ctxQuoteFlow = await browser.createBrowserContext();
    const pageQuoteFlow = await ctxQuoteFlow.newPage();
    
    await pageQuoteFlow.goto(`${BASE_URL}/quote`, { waitUntil: 'networkidle0' });
    await sleep(DELAY_MS + BUFFER_MS);
    const popOnQuoteInitial = (await pageQuoteFlow.$('.pop')) !== null;
    recordResult('Skip Flow: Initial landing on /quote suppresses popup', !popOnQuoteInitial);

    await pageQuoteFlow.goto(`${BASE_URL}/services`, { waitUntil: 'networkidle0' });
    const popOnServicesAfterQuote = await pageQuoteFlow.waitForSelector('.pop', { timeout: DELAY_MS + 3000 }).catch(() => null);
    recordResult('Skip Flow: Navigating from /quote to /services triggers popup after delay', popOnServicesAfterQuote !== null);

    const closeBtnQuoteFlow = await pageQuoteFlow.$('.pop-close');
    if (closeBtnQuoteFlow) await closeBtnQuoteFlow.click();
    await pageQuoteFlow.waitForFunction(() => document.querySelector('.pop') === null);

    await pageQuoteFlow.goto(`${BASE_URL}/quote`, { waitUntil: 'networkidle0' });
    await sleep(DELAY_MS + BUFFER_MS);
    const popOnQuoteFinal = (await pageQuoteFlow.$('.pop')) !== null;
    recordResult('Skip Flow: Returning to /quote remains clean with no popup', !popOnQuoteFinal);
    await ctxQuoteFlow.close();

    // ----------------------------------------------------------------------
    // Scenario 8: Session Storage Clearing / Tab Reset
    // ----------------------------------------------------------------------
    console.log('\n--- Scenario 8: Session Storage Reset Simulation ---');
    const ctxReset = await browser.createBrowserContext();
    const pageReset = await ctxReset.newPage();
    await pageReset.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    await pageReset.waitForSelector('.pop', { timeout: DELAY_MS + 3000 });
    const closeBtnReset = await pageReset.$('.pop-close');
    await closeBtnReset.click();
    await pageReset.waitForFunction(() => document.querySelector('.pop') === null);

    const beforeClear = await pageReset.evaluate(() => window.sessionStorage.getItem('vm.popup.dismissed'));
    recordResult('Reset Simulation: sessionStorage key is set prior to clearing', beforeClear === '1');

    await pageReset.evaluate(() => window.sessionStorage.clear());
    await pageReset.reload({ waitUntil: 'networkidle0' });
    const popAfterClear = await pageReset.waitForSelector('.pop', { timeout: DELAY_MS + 3000 }).catch(() => null);
    recordResult('Reset Simulation: Clearing sessionStorage causes popup to trigger anew on reload', popAfterClear !== null);
    await ctxReset.close();

    // ----------------------------------------------------------------------
    // Scenario 9: Scroll Lock & DOM Body State Cleanup
    // ----------------------------------------------------------------------
    console.log('\n--- Scenario 9: Scroll Lock & DOM Body Cleanup ---');
    const ctxDom = await browser.createBrowserContext();
    const pageDom = await ctxDom.newPage();
    await pageDom.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

    const overflowBefore = await pageDom.evaluate(() => document.body.style.overflow);
    await pageDom.waitForSelector('.pop', { timeout: DELAY_MS + 3000 });
    const overflowDuring = await pageDom.evaluate(() => document.body.style.overflow);
    recordResult('DOM Cleanup: Body overflow locked to "hidden" when popup is open', overflowDuring === 'hidden');

    const closeBtnDom = await pageDom.$('.pop-close');
    await closeBtnDom.click();
    await pageDom.waitForFunction(() => document.querySelector('.pop') === null);

    const overflowAfter = await pageDom.evaluate(() => document.body.style.overflow);
    recordResult('DOM Cleanup: Body overflow restored after popup close', overflowAfter === overflowBefore);
    await ctxDom.close();

    // ----------------------------------------------------------------------
    // Scenario 10: Storage Exception Resilience (Private/Restricted Mode)
    // ----------------------------------------------------------------------
    console.log('\n--- Scenario 10: Storage Exception Resilience ---');
    const ctxErr = await browser.createBrowserContext();
    const pageErr = await ctxErr.newPage();

    await pageErr.evaluateOnNewDocument(() => {
      const throwError = () => {
        throw new DOMException('The operation is insecure.', 'SecurityError');
      };
      Object.defineProperty(window, 'sessionStorage', {
        get: throwError,
      });
    });

    let pageCrashed = false;
    pageErr.on('pageerror', () => {
      pageCrashed = true;
    });

    await pageErr.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    const popUnderRestriction = await pageErr.waitForSelector('.pop', { timeout: DELAY_MS + 3000 }).catch(() => null);
    recordResult('Storage Resilience: App does not crash when sessionStorage throws SecurityError', !pageCrashed && popUnderRestriction !== null);

    if (popUnderRestriction) {
      const closeErr = await pageErr.$('.pop-close');
      await closeErr.click();
      await pageErr.waitForFunction(() => document.querySelector('.pop') === null);
      recordResult('Storage Resilience: Modal closes gracefully even when storage setItem throws', !pageCrashed);
    }
    await ctxErr.close();

  } finally {
    await browser.close();
    stopDevServer(serverState);
  }

  // Summary
  const failed = results.filter((r) => !r.passed);
  console.log('\n========================================================');
  console.log(` Test Summary: ${results.length - failed.length}/${results.length} checks passed`);
  console.log('========================================================\n');

  if (failed.length > 0) {
    console.error(`Failed ${failed.length} test assertions.`);
    process.exit(1);
  }
  process.exit(0);
}

runSuite().catch((err) => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
