# Test Architecture Survey & Implementation Report — Puppeteer Browser Verification

## Executive Summary
This report analyzes the existing test infrastructure, environment configurations, and server lifecycle for `c:\medify-timer\vm-solutions`, and provides a complete architecture for an automated Puppeteer test suite to verify the email course popup session behavior (Requirements R1, R2, R3).

---

## 1. Observation

### 1.1 Environment & Package Dependencies
- **Node.js**: `v24.13.1` (supports native ESM, top-level await, `fetch`, and `node:test`).
- **npm**: `11.10.1`.
- **Operating System**: Windows (x64).
- **Chrome Binary**: Verified installed and accessible at `C:/Program Files/Google/Chrome/Application/chrome.exe`. Fallback Edge browser present at `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe`.
- **`package.json` Inspection**:
  - `type`: `"module"` (ESM native).
  - `dependencies`: `react` (18.3.1), `react-dom` (18.3.1), `react-router-dom` (6.28.0), `gsap` (3.12.5), `lenis` (1.1.14), `lucide-react` (0.454.0).
  - `devDependencies`: `@vitejs/plugin-react` (4.3.3), `puppeteer-core` (25.3.0), `vite` (5.4.10).
  - No external test frameworks (`jest`, `vitest`, `mocha`, `playwright`, or standard `puppeteer` bundle) are installed.
- **Existing Script Conventions**:
  - The project maintains 19 automation and verification scripts in `scripts/*.mjs` (e.g. `scripts/verify.mjs`, `scripts/verify-email.mjs`, `scripts/verify-edits.mjs`).
  - All existing scripts use `puppeteer-core` with `executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'`, run directly with `node scripts/<script-name>.mjs`.

### 1.2 Dev Server Configuration & Lifecycle
- **Configuration (`vite.config.js`)**:
  ```javascript
  export default defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
    },
  });
  ```
- **Base URL**: `http://localhost:5173`.
- **Startup Script**: `npm run dev` (`vite`).
- **Build Status**: Verified via `npm run build` — compiles cleanly in ~3.28s without errors.

### 1.3 Popup Component Mechanics (`src/components/IntroPopup.jsx`)
- **Timer Delay**: `const DELAY_MS = 3000;` (dialog triggers 3000ms after landing).
- **Current Dismissal Storage**:
  - `const STORAGE_KEY = 'vm.popup.dismissedAt';`
  - `const REMEMBER_DAYS = 7;`
  - `dismissedRecently()` reads `window.localStorage.getItem(STORAGE_KEY)`.
  - Closing or submitting sets `window.localStorage.setItem(STORAGE_KEY, String(Date.now()))`.
- **Routes & Navigation**:
  - `const SKIP_ROUTES = ['/quote'];`
  - Rendered globally in `src/App.jsx` under `<IntroPopup />`.
  - Available navigation routes in `src/App.jsx`: `/`, `/services`, `/compare`, `/real-math`, `/quote`, `/legal`.
- **DOM Elements & Selectors**:
  - Popup overlay / dialog: `.pop` (with `role="dialog"` and `aria-labelledby="pop-title"`).
  - Backdrop: `.pop-backdrop`.
  - Close button: `.pop-close` or `button[aria-label="Close"]`.
  - Headline: `#pop-title` / `.pop-title` ("Stop sending the apprentice for imaginary tools.").
  - Form & Inputs: `.pop-form`, `#pop-email` (`input[type="email"]`), `#pop-phone` (`input[type="tel"]`), submit button `.pop-cta` (`button[type="submit"]`).
  - Completion card: `.pop-done` ("You're in.").

---

## 2. Logic Chain

1. **Test Runner Selection**:
   - `puppeteer-core` 25.3.0 is already installed in `devDependencies`, and Google Chrome is confirmed present at `C:/Program Files/Google/Chrome/Application/chrome.exe`.
   - Node 24 supports ESM top-level await and native execution.
   - Introducing heavy test runners like Jest or Playwright would require downloading multiple dependencies and browser binaries, which is redundant given the existing 19 `scripts/*.mjs` Puppeteer scripts.
   - **Conclusion**: A dedicated Node ESM test runner (`scripts/test-popup.mjs`) or `node:test` suite using `puppeteer-core` integrates seamlessly with zero additional dependencies.

2. **Session Isolation & Context Simulation**:
   - In Puppeteer, each `BrowserContext` (`browser.createBrowserContext()`) creates an isolated session with its own `sessionStorage`, `localStorage`, and cookies.
   - **Fresh Context**: Creating a new `BrowserContext` simulates a first-time visitor / fresh session.
   - **In-Session Navigation**: Navigating between routes (`/` -> `/services` -> `/compare` -> `/`) within the same `BrowserContext` / page preserves the session state.
   - **New Session**: Closing the context and opening a new `BrowserContext` simulates opening a brand new browser visit.

3. **Dev Server Orchestration**:
   - Tests need a running dev server at `http://localhost:5173`.
   - The test script should be dual-mode:
     1. First check if `http://localhost:5173` is already responding (e.g. if the developer ran `npm run dev`).
     2. If not active, automatically spawn `npx vite --port 5173` as a child process, wait for readiness (health check polling), run the tests, and cleanly terminate the server process tree (`taskkill /F /T /PID` on Windows) on exit.

4. **Timing & Assertion Strategy**:
   - Because `DELAY_MS` is 3000ms, the popup takes 3.0s to open.
   - For positive assertions (expecting popup): wait up to 5000ms for `.pop` selector using `page.waitForSelector('.pop', { timeout: 5000 })`.
   - For negative assertions (expecting popup NOT to appear): wait for `DELAY_MS + 500ms` (3500ms) and assert `(await page.$('.pop')) === null`.

---

## 3. Caveats

1. **Chrome Binary Resolution**:
   - Hardcoding `C:/Program Files/Google/Chrome/Application/chrome.exe` works in this Windows environment, but the script should include fallback resolution (checking Edge at `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe` or `process.env.PUPPETEER_EXECUTABLE_PATH`) for resilience.
2. **Process Cleanup on Windows**:
   - When spawning Vite as a child process via `child_process.spawn('npx.cmd', ['vite'])`, standard `proc.kill()` in Node on Windows might leave orphaned Node processes. Using Windows `taskkill /F /T /PID <pid>` or `process.on('exit')` cleanup ensures no hanging ports.
3. **Execution Duration**:
   - Due to the 3-second popup delay, running 3-4 consecutive test scenarios will take ~12-15 seconds. This is normal and expected for end-to-end timing verification.

---

## 4. Conclusion & Test Architecture Proposal

### 4.1 Recommended Test File Layout
```
c:\medify-timer\vm-solutions\
├── package.json              # Add "test": "node scripts/test-popup.mjs"
├── scripts/
│   ├── test-popup.mjs        # Automated Puppeteer test suite for popup session behavior
│   ├── verify-popup.mjs      # (Alias/symlink if needed)
│   └── verify-email.mjs      # Existing email form verification
```

### 4.2 `package.json` Script Integration
Add the following to `package.json` under `"scripts"`:
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "test": "node scripts/test-popup.mjs",
  "test:popup": "node scripts/test-popup.mjs"
}
```

### 4.3 Test Case Specification

| Test Case | Objective | Action Sequence | Expected Assertion |
|---|---|---|---|
| **Test 1: Fresh Context Popup Appearance** | Verify popup opens on first visit in fresh session | 1. Create fresh `BrowserContext`.<br>2. Open page at `http://localhost:5173/`.<br>3. Wait up to 5000ms. | `.pop` is visible in DOM.<br>`#pop-title` contains expected text.<br>`#pop-email` and `.pop-cta` are present. |
| **Test 2: In-Session Route Navigation** | Verify popup does NOT reappear after dismissal when navigating routes | 1. Dismiss popup by clicking `.pop-close`.<br>2. Verify `.pop` disappears.<br>3. Navigate to `/services`.<br>4. Wait 3500ms.<br>5. Navigate to `/compare`.<br>6. Wait 3500ms.<br>7. Navigate back to `/`.<br>8. Wait 3500ms. | `page.$('.pop') === null` across all navigated routes. |
| **Test 3: In-Session Reload Verification** | Verify popup does NOT reappear on page reload in same session | 1. In same `BrowserContext`, reload `http://localhost:5173/`.<br>2. Wait 3500ms. | `page.$('.pop') === null` (popup stays suppressed for session duration). |
| **Test 4: New Browser Context (New Visit)** | Verify popup reappears in a new session | 1. Close previous context.<br>2. Create a new `BrowserContext`.<br>3. Navigate to `http://localhost:5173/`.<br>4. Wait up to 5000ms. | `.pop` appears again in DOM.<br>Popup is fully interactive. |
| **Test 5: Skip Route Isolation** | Verify popup is skipped on quote page | 1. Create fresh `BrowserContext`.<br>2. Navigate to `http://localhost:5173/quote`.<br>3. Wait 3500ms. | `page.$('.pop') === null`. |

---

### 4.4 Reference Test Runner Implementation (`scripts/test-popup.mjs`)

```javascript
// scripts/test-popup.mjs
// Automated Puppeteer browser test suite for Email Course Popup session lifecycle.
import puppeteer from 'puppeteer-core';
import fs from 'node:fs';
import { spawn, execSync } from 'node:child_process';

const BASE_URL = 'http://localhost:5173';
const DELAY_MS = 3000;
const BUFFER_MS = 600;

// Resolve Chrome / Edge binary
function getBrowserPath() {
  if (process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.PUPPETEER_EXECUTABLE_PATH;
  const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const edgePath = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
  if (fs.existsSync(chromePath)) return chromePath;
  if (fs.existsSync(edgePath)) return edgePath;
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
  } catch {}

  console.log(`[DevServer] Spawning Vite dev server on ${BASE_URL}...`);
  const isWindows = process.platform === 'win32';
  const cmd = isWindows ? 'npx.cmd' : 'npx';
  const proc = spawn(cmd, ['vite', '--port', '5173'], {
    shell: isWindows,
    stdio: 'ignore',
  });

  const start = Date.now();
  while (Date.now() - start < 15000) {
    try {
      const res = await fetch(BASE_URL);
      if (res.ok) {
        console.log(`[DevServer] Vite dev server ready.`);
        return { proc, spawned: true };
      }
    } catch {}
    await sleep(300);
  }
  throw new Error('Vite dev server failed to respond within 15 seconds.');
}

function stopDevServer(serverState) {
  if (serverState?.spawned && serverState?.proc?.pid) {
    console.log(`[DevServer] Stopping spawned dev server...`);
    try {
      if (process.platform === 'win32') {
        execSync(`taskkill /F /T /PID ${serverState.proc.pid}`, { stdio: 'ignore' });
      } else {
        serverState.proc.kill('SIGTERM');
      }
    } catch {}
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
  console.log(' Starting Email Popup Puppeteer Automated Test Suite');
  console.log('========================================================\n');

  const serverState = await ensureDevServer();
  const executablePath = getBrowserPath();

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
    // Scenario 1: Fresh browser context (popup appears)
    // ----------------------------------------------------
    console.log('\n--- Scenario 1: Fresh Browser Context ---');
    const context1 = await browser.createBrowserContext();
    const page1 = await context1.newPage();
    await page1.setViewport({ width: 1440, height: 900 });

    await page1.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    const popSelector = await page1.waitForSelector('.pop', { timeout: DELAY_MS + 2000 }).catch(() => null);
    recordResult('Fresh Visit: popup appears within expected delay', popSelector !== null);

    const titleText = await page1.$eval('#pop-title', (el) => el.textContent).catch(() => '');
    recordResult('Fresh Visit: popup contains correct course title', titleText.includes('Stop sending the apprentice'));

    const hasFormInputs = await page1.evaluate(() => {
      const email = document.querySelector('#pop-email');
      const submit = document.querySelector('.pop-cta');
      return email !== null && submit !== null;
    });
    recordResult('Fresh Visit: popup contains email input and CTA', hasFormInputs);

    // ----------------------------------------------------
    // Scenario 2: In-session navigation (popup does NOT reappear)
    // ----------------------------------------------------
    console.log('\n--- Scenario 2: In-Session Navigation ---');
    // Dismiss the popup
    const closeBtn = await page1.$('.pop-close');
    if (closeBtn) {
      await closeBtn.click();
      await sleep(400);
      const isClosed = (await page1.$('.pop')) === null;
      recordResult('Dismissal: popup closes when close button is clicked', isClosed);
    } else {
      recordResult('Dismissal: close button found', false);
    }

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

    // Reload home page within same session
    await page1.reload({ waitUntil: 'networkidle0' });
    await sleep(DELAY_MS + BUFFER_MS);
    popupPresent = (await page1.$('.pop')) !== null;
    recordResult('In-Session: popup does not reappear on page reload in same session', !popupPresent);

    await context1.close();

    // ----------------------------------------------------
    // Scenario 3: New browser context (simulating new visit)
    // ----------------------------------------------------
    console.log('\n--- Scenario 3: New Browser Context (New Visit) ---');
    const context2 = await browser.createBrowserContext();
    const page2 = await context2.newPage();
    await page2.setViewport({ width: 1440, height: 900 });

    await page2.goto(`${BASE_URL}/`, { waitUntil: 'networkidle0' });
    const popSelector2 = await page2.waitForSelector('.pop', { timeout: DELAY_MS + 2000 }).catch(() => null);
    recordResult('New Visit: popup appears again in new browser session', popSelector2 !== null);

    await context2.close();

    // ----------------------------------------------------
    // Scenario 4: Skip route check (/quote)
    // ----------------------------------------------------
    console.log('\n--- Scenario 4: Skip Route Check ---');
    const context3 = await browser.createBrowserContext();
    const page3 = await context3.newPage();
    await page3.setViewport({ width: 1440, height: 900 });

    await page3.goto(`${BASE_URL}/quote`, { waitUntil: 'networkidle0' });
    await sleep(DELAY_MS + BUFFER_MS);
    const popOnQuote = (await page3.$('.pop')) !== null;
    recordResult('Skip Route: popup does not appear when landing on /quote', !popOnQuote);

    await context3.close();
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
}

runSuite().catch((err) => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
```

---

## 5. Verification Method

To independently verify the test setup and findings:

1. **Verify Environment & Dependencies**:
   ```powershell
   node -v
   npm -v
   Test-Path "C:\Program Files\Google\Chrome\Application\chrome.exe"
   ```
2. **Verify Project Compilation**:
   ```powershell
   npm run build
   ```
3. **Execute Automated Test Suite**:
   ```powershell
   npm test
   # OR directly:
   node scripts/test-popup.mjs
   ```
4. **Manual Dev Server Verification**:
   ```powershell
   npm run dev
   ```
   Open `http://localhost:5173` in a normal browser window, observe the popup appearing after 3s, dismiss it, navigate routes, open a new incognito window, and observe the popup appearing again.
