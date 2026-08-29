// scripts/challenger-stress-test.mjs
// Independent Empirical Adversarial Stress Harness for VM Solutions Email Course Popup
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import { spawn, execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PORT = 5179;
const BASE_URL = `http://localhost:${PORT}`;
const DELAY_MS = 3000;
const BUFFER_MS = 800;

function getBrowserPath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH && fs.existsSync(process.env.PUPPETEER_EXECUTABLE_PATH)) {
    return process.env.PUPPETEER_EXECUTABLE_PATH;
  }
  const candidates = [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No compatible browser executable found.');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function spawnDedicatedServer() {
  console.log(`[DevServer] Spawning isolated Vite server on ${BASE_URL}...`);
  const viteCliPath = path.resolve(ROOT_DIR, 'node_modules/vite/bin/vite.js');
  const proc = spawn(process.execPath, [viteCliPath, '--port', String(PORT), '--strictPort'], {
    cwd: ROOT_DIR,
    stdio: 'ignore',
  });

  const start = Date.now();
  while (Date.now() - start < 15000) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) {
        console.log(`[DevServer] Dedicated Vite dev server ready at ${BASE_URL} (PID: ${proc.pid}).`);
        return proc;
      }
    } catch {
      /* Wait */
    }
    await sleep(300);
  }
  throw new Error(`Vite dev server failed to respond on ${BASE_URL} within 15 seconds.`);
}

function stopServer(proc) {
  if (proc?.pid) {
    console.log(`[DevServer] Stopping server (PID: ${proc.pid})...`);
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /F /T /PID ${proc.pid}`, { stdio: 'ignore' });
      } else {
        proc.kill('SIGTERM');
      }
    } catch {
      /* Process already exited */
    }
  }
}

const results = [];
function recordResult(category, name, passed, detail = '') {
  results.push({ category, name, passed, detail });
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`[${status}] [${category}] ${name}${detail ? ' -> ' + detail : ''}`);
}

async function runAdversarialHarness() {
  console.log('================================================================');
  console.log(' EMPIRICAL ADVERSARIAL CHALLENGER STRESS HARNESS');
  console.log(' Target: VM Solutions Email Course Popup Session Lifecycle');
  console.log('================================================================\n');

  const serverProc = await spawnDedicatedServer();
  const executablePath = getBrowserPath();
  console.log(`[Browser] Running Chrome/Edge at: ${executablePath}\n`);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const consoleErrors = [];

  try {
    // =================================================================
    // SUITE 1: Private Browsing / Storage SecurityError Fallback Simulation
    // =================================================================
    console.log('\n--- Test Group 1: Private Browsing / Storage SecurityError Simulation ---');
    {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      page.on('pageerror', (err) => consoleErrors.push({ test: 'Group 1', error: err.message }));
      page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push({ test: 'Group 1', error: msg.text() });
      });

      await page.evaluateOnNewDocument(() => {
        const throwSecurityError = () => {
          throw new DOMException('The operation is insecure / storage access denied', 'SecurityError');
        };
        Object.defineProperty(window, 'sessionStorage', {
          get: () => ({
            getItem: throwSecurityError,
            setItem: throwSecurityError,
            removeItem: throwSecurityError,
            clear: throwSecurityError,
            length: 0,
            key: throwSecurityError,
          }),
          configurable: true,
        });
      });

      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });

      const pop = await page.waitForSelector('.pop', { timeout: DELAY_MS + BUFFER_MS + 2000 }).catch(() => null);
      recordResult('Storage Fallback', 'Popup renders when sessionStorage.getItem throws SecurityError', pop !== null);

      const closeBtn = await page.$('.pop-close');
      if (closeBtn) {
        await closeBtn.click();
        await page.waitForFunction(() => document.querySelector('.pop') === null, { timeout: 2000 }).catch(() => {});
        const isClosed = (await page.$('.pop')) === null;
        recordResult('Storage Fallback', 'Popup closes cleanly when sessionStorage.setItem throws SecurityError', isClosed);
      } else {
        recordResult('Storage Fallback', 'Close button exists', false);
      }

      await context.close();
    }

    // =================================================================
    // SUITE 2: Storage QuotaExceededError Simulation
    // =================================================================
    console.log('\n--- Test Group 2: Storage QuotaExceededError Simulation ---');
    {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      page.on('pageerror', (err) => consoleErrors.push({ test: 'Group 2', error: err.message }));

      await page.evaluateOnNewDocument(() => {
        window.sessionStorage.setItem = () => {
          throw new DOMException('QuotaExceededError: DOM Exception 22', 'QuotaExceededError');
        };
      });

      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.pop', { timeout: DELAY_MS + BUFFER_MS + 2000 });
      const closeBtn = await page.$('.pop-close');
      await closeBtn.click();
      await page.waitForFunction(() => document.querySelector('.pop') === null, { timeout: 2000 }).catch(() => {});
      const isClosed = (await page.$('.pop')) === null;
      recordResult('Storage Quota', 'Popup dismisses gracefully when sessionStorage quota is exceeded', isClosed);

      await context.close();
    }

    // =================================================================
    // SUITE 3: Form Validation, Error Handling & Form Submission
    // =================================================================
    console.log('\n--- Test Group 3: Form Validation & Submission ---');
    {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      page.on('pageerror', (err) => consoleErrors.push({ test: 'Group 3', error: err.message }));

      // Intercept MailerLite endpoint
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        if (req.url().includes('mailerlite.com')) {
          req.respond({
            status: 200,
            contentType: 'application/json',
            headers: { 'access-control-allow-origin': '*' },
            body: JSON.stringify({ success: true }),
          });
        } else {
          req.continue();
        }
      });

      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.pop', { timeout: DELAY_MS + BUFFER_MS + 2000 });

      // 3.1 Empty email validation
      const submitBtn = await page.$('form.pop-form button[type="submit"]');
      await submitBtn.click();
      await page.waitForSelector('.pop-error', { timeout: 2000 }).catch(() => {});
      const emptyErr = await page.$eval('.pop-error', (el) => el.textContent).catch(() => '');
      recordResult('Validation', 'Empty email triggers required error message', emptyErr.includes('Pop your email in first'), `Got: "${emptyErr}"`);

      // 3.2 Invalid email format
      await page.type('#pop-email', 'invalid-user-email');
      await submitBtn.click();
      await page.waitForFunction(() => {
        const err = document.querySelector('.pop-error');
        return err && err.textContent.includes('doesn’t look right');
      }, { timeout: 2000 }).catch(() => {});
      const invalidErr = await page.$eval('.pop-error', (el) => el.textContent).catch(() => '');
      recordResult('Validation', 'Invalid email format triggers format error', invalidErr.includes('That email doesn’t look right'), `Got: "${invalidErr}"`);

      // 3.3 Short phone number validation
      await page.evaluate(() => {
        const emailInput = document.querySelector('#pop-email');
        emailInput.value = '';
      });
      await page.type('#pop-email', 'lead@tradie.com.au');
      await page.type('#pop-phone', '1234');
      await submitBtn.click();
      await page.waitForFunction(() => {
        const err = document.querySelector('.pop-error');
        return err && err.textContent.includes('too short');
      }, { timeout: 2000 }).catch(() => {});
      const shortPhoneErr = await page.$eval('.pop-error', (el) => el.textContent).catch(() => '');
      recordResult('Validation', 'Short phone (<8 digits) triggers phone error', shortPhoneErr.includes('That phone number looks too short'), `Got: "${shortPhoneErr}"`);

      // 3.4 Valid submission with phone
      await page.evaluate(() => {
        const phoneInput = document.querySelector('#pop-phone');
        phoneInput.value = '';
      });
      await page.type('#pop-phone', '0412 345 678');
      await submitBtn.click();

      // Wait for success screen
      await page.waitForSelector('.pop-done', { timeout: 3000 });
      const doneHeading = await page.$eval('.pop-done #pop-title', (el) => el.textContent).catch(() => '');
      recordResult('Submission', 'Valid submission renders confirmation screen ("You’re in.")', doneHeading.includes("You’re in"));

      // Verify sessionStorage key set on submit
      const dismissedOnSubmit = await page.evaluate(() => window.sessionStorage.getItem('vm.popup.dismissed'));
      recordResult('Submission', 'Submission sets sessionStorage vm.popup.dismissed = "1"', dismissedOnSubmit === '1');

      // Click "Back to the site"
      const backBtn = await page.$('.pop-cta--ghost');
      await backBtn.click();
      await page.waitForFunction(() => document.querySelector('.pop') === null, { timeout: 2000 }).catch(() => {});
      const closedAfterSubmit = (await page.$('.pop')) === null;
      recordResult('Submission', 'Dismissing confirmation closes modal and returns to page', closedAfterSubmit);

      await context.close();
    }

    // =================================================================
    // SUITE 4: Keyboard Accessibility (Escape & Tab Loop)
    // =================================================================
    console.log('\n--- Test Group 4: Keyboard Accessibility (Escape & Tab Trap) ---');
    {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      page.on('pageerror', (err) => consoleErrors.push({ test: 'Group 4', error: err.message }));

      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      await page.waitForSelector('.pop', { timeout: DELAY_MS + BUFFER_MS + 2000 });

      // Initial active element should be close button
      const initialActiveTag = await page.evaluate(() => document.activeElement.className);
      recordResult('Accessibility', 'Focus moves to close button upon opening', initialActiveTag.includes('pop-close'));

      // Press Escape key
      await page.keyboard.press('Escape');
      await page.waitForFunction(() => document.querySelector('.pop') === null, { timeout: 2000 }).catch(() => {});
      const isClosedOnEsc = (await page.$('.pop')) === null;
      const dismissedOnEsc = await page.evaluate(() => window.sessionStorage.getItem('vm.popup.dismissed'));
      recordResult('Accessibility', 'Escape key closes modal and sets sessionStorage', isClosedOnEsc && dismissedOnEsc === '1');

      await context.close();
    }

    // =================================================================
    // SUITE 5: Navigation Flow: /quote landing then navigate to /
    // =================================================================
    console.log('\n--- Test Group 5: Direct Quote Landing -> Navigate to Home ---');
    {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      page.on('pageerror', (err) => consoleErrors.push({ test: 'Group 5', error: err.message }));

      // Land on /quote
      await page.goto(`${BASE_URL}/quote`, { waitUntil: 'networkidle0' });
      await sleep(DELAY_MS + BUFFER_MS);
      const popOnQuote = (await page.$('.pop')) !== null;
      recordResult('Quote Guard', 'Direct load on /quote does not trigger popup', !popOnQuote);

      // Navigate to /
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      const popOnHomeAfterQuote = await page.waitForSelector('.pop', { timeout: DELAY_MS + BUFFER_MS + 2000 }).catch(() => null);
      recordResult('Quote Guard', 'Navigating from /quote to / properly triggers popup on arrival', popOnHomeAfterQuote !== null);

      await context.close();
    }

    // =================================================================
    // SUITE 6: Rapid Navigation Before Timer Expires
    // =================================================================
    console.log('\n--- Test Group 6: Pre-timer Route Switch (within 1s) ---');
    {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      page.on('pageerror', (err) => consoleErrors.push({ test: 'Group 6', error: err.message }));

      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
      await sleep(800);
      await page.goto(`${BASE_URL}/services`, { waitUntil: 'networkidle0' });

      await sleep(DELAY_MS + BUFFER_MS);
      const popCount = await page.$$eval('.pop', (els) => els.length);
      recordResult('Route Switch', 'Fast navigation does not cause duplicate popups (count <= 1)', popCount <= 1);

      await context.close();
    }

    // =================================================================
    // SUITE 7: Console Error Inspection
    // =================================================================
    console.log('\n--- Test Group 7: Console Error & Page Crash Audit ---');
    {
      const severeErrors = consoleErrors.filter((e) => !e.error.includes('favicon'));
      recordResult(
        'Console Audit',
        'Zero uncaught page errors or console errors during all stress tests',
        severeErrors.length === 0,
        severeErrors.length ? JSON.stringify(severeErrors) : 'Clean console'
      );
    }
  } finally {
    await browser.close();
    stopServer(serverProc);
  }

  // Summary
  const failed = results.filter((r) => !r.passed);
  console.log('\n================================================================');
  console.log(` Challenger Stress Test Summary: ${results.length - failed.length}/${results.length} checks passed`);
  console.log('================================================================\n');

  if (failed.length > 0) {
    console.error(`Failed ${failed.length} adversarial assertions.`);
    process.exit(1);
  }
  process.exit(0);
}

runAdversarialHarness().catch((err) => {
  console.error('Fatal error in stress harness:', err);
  process.exit(1);
});
