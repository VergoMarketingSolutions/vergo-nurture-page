# Specification Report: VM Solutions Email Course Popup & Architecture

**Agent:** `teamwork_preview_spec_miner_1`  
**Phase:** Survey Phase  
**Target:** `c:\medify-timer\vm-solutions`  
**Date:** 2026-08-29T22:23:00Z  

---

## 1. Executive Summary & Tech Stack Overview

| Dimension | Specification | Source / Location |
|---|---|---|
| **Application Name** | `vm-solutions` (Vergo Marketing Solutions) | `package.json:2` |
| **Framework** | React 18.3.1 (`react`, `react-dom`) | `package.json:15-16` |
| **Bundler / Build Tool** | Vite 5.4.10 with `@vitejs/plugin-react` 4.3.3 | `package.json:20,22`, `vite.config.js` |
| **Module System** | ES Modules (`"type": "module"`) | `package.json:5` |
| **Routing** | `react-router-dom` 6.28.0 with `BrowserRouter` | `package.json:17`, `src/main.jsx:11-13` |
| **Dev Server Command** | `npm run dev` (executes `vite`) | `package.json:7` |
| **Dev Server Port** | `5173` (with `strictPort: true`) | `vite.config.js:6-9` |
| **Dev Server URL** | `http://localhost:5173` | `vite.config.js` |
| **Production Build** | `npm run build` (executes `vite build`) | `package.json:8` |
| **Preview Server** | `npm run preview` (executes `vite preview`) | `package.json:9` |
| **Animation & Motion** | `gsap` 3.12.5 (ScrollTrigger), `lenis` 1.1.14 (`window.__lenis`) | `package.json:12-13`, `src/App.jsx:3-5,58-69` |
| **Iconography** | `lucide-react` 0.454.0 | `package.json:14`, `src/components/IntroPopup.jsx:3` |
| **Automated Testing** | `puppeteer-core` 25.3.0 | `package.json:21`, `scripts/*.mjs` |
| **Chrome Binary** | `C:\Program Files\Google\Chrome\Application\chrome.exe` | Verified on filesystem |
| **Serverless / Host Config** | `vercel.json` rewrite: `/(.*)` -> `/index.html` | `vercel.json:2` |

---

## 2. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Popup / Core | Lead Magnet Intro Popup | Displays email course signup dialog for trades marketing after 3s delay | Timer (3000ms delay), Page pathname | Rendered `.pop-backdrop` and `.pop` dialog | Suppressed if on `/quote` or previously dismissed in session | `src/components/IntroPopup.jsx:8,61-91` |
| 2 | Popup / Storage | Dismissal State Persistence | Controls when the popup is prevented from re-appearing | `localStorage` key `vm.popup.dismissedAt` (currently 7-day memory) | Boolean suppression in `dismissedRecently()` | Fallback to `false` in private mode / storage exceptions | `src/components/IntroPopup.jsx:9-10,51-59,77` |
| 3 | Popup / Routing | Skip Routes Filter | Bypasses popup display on high-intent conversion pages | `SKIP_ROUTES = ['/quote']`, `location.pathname` | Skips timer registration on `/quote` | None | `src/components/IntroPopup.jsx:43,85` |
| 4 | Popup / Signup | Email Course Subscription API | Submits lead email and optional phone to MailerLite JSONP endpoint | Form URL-encoded POST: `fields[email]`, `fields[phone]`, `ml-submit`, `anticsrf` | HTTP 200 JSON with `{success: true}` | Checks response body `data.success === false` and surfaces validation error | `src/components/IntroPopup.jsx:39-40,134-188`, `docs/email-course.md` |
| 5 | Popup / Accessibility | Dialog Focus Trap & Keyboard Navigation | Traps focus within popup dialog, closes on Escape, restores prior focus | Key events (`Tab`, `Shift+Tab`, `Escape`) | Focus movement, `close()` on Escape | None | `src/components/IntroPopup.jsx:104-132` |
| 6 | Popup / UX | Scroll Lock Integration | Pauses Lenis smooth scrolling and sets `overflow: hidden` while open | `window.__lenis.stop()`, `start()` | Page scrolling prevented behind modal | Safe check if `window.__lenis` is null | `src/components/IntroPopup.jsx:98-102,128-130` |
| 7 | Popup / Assets | Dynamic Meme Fallback | Tries image extensions sequentially until asset loads | `MEME_SOURCES = ['.gif', '.png', '.jpg', '.jpeg', '.webp']` | Rendered `<img>` or removed if none found | Increments `memeIndex` on `onError` | `src/components/IntroPopup.jsx:21-27,240-247` |
| 8 | Routing | Single Page Application Navigation | Client-side routing with 6 distinct paths and wildcard catch-all | Path URL / NavLink clicks | Renders matching Page component | Wildcard `*` falls back to `<Home />` | `src/App.jsx:83-91`, `src/components/Nav.jsx` |
| 9 | Scarcity / Header | Announcement Bar | Global banner displaying availability status & CTA to `/quote` | Real-time date / availability state | Sticky banner at top of viewport | None | `src/components/Scarcity.jsx`, `src/App.jsx:79` |
| 10 | Navigation | Responsive Primary Nav | Desktop navigation bar with brand, routes, and mobile hamburger drawer | Screen width, `menu-open` class | Nav links, slideout panel on mobile | Body overflow toggled on open | `src/components/Nav.jsx` |
| 11 | Testing | Puppeteer Automated Suite | End-to-end browser test scripts for layout, forms, and popups | Node CLI execution via Chrome executable | Console TAP/log format, exit code 0 or 1 | Fails script if assertions fail | `scripts/verify.mjs`, `scripts/verify-email.mjs` |

---

## 3. Edge Cases & Boundary Conditions

| # | Feature | Input | Observed / Expected Behavior |
|---|---------|-------|------------------------------|
| 1 | Route Exclusion | User lands directly on `/quote` | Popup is skipped (`SKIP_ROUTES`). Timer is not scheduled. If user later navigates to `/services`, popup should trigger once. |
| 2 | Fast Route Navigation | User navigates from `/` to `/services` within < 3s | Module-level `scheduled` boolean prevents scheduling duplicate timers. Only 1 timer runs and opens popup once. |
| 3 | Storage Restrictions | Private Browsing / Blocked Storage | `try...catch` blocks around storage access prevent uncaught exceptions. Popup falls back to in-memory session behavior. |
| 4 | Dismissal by Escape / Backdrop | User presses Escape or clicks `.pop-backdrop` | Closes dialog, restores Lenis scrolling, stores session-dismissed flag so it will not reappear during this visit. |
| 5 | Intra-session Page Reload / Multi-route Visits | User visits `/`, dismisses popup, navigates to `/compare`, `/real-math`, `/legal` | Popup MUST NOT appear again during the same visit/session. |
| 6 | New Browser Session / Context | User closes browser / opens new tab / new context | Popup MUST appear again on first landing (7-day memory removed). |
| 7 | Lenis Scroll Restoration | Dialog opens while user is scrolled mid-page | Lenis stops smoothly, background does not jitter; on close, Lenis resumes at current scroll position. |
| 8 | Form Validation | Submit empty or invalid email | Surfaces inline error ("Pop your email in first" / "That email doesn’t look right") without triggering network call. |

---

## 4. Application Routes & Navigation Map

The application consists of 6 primary routes defined in `src/App.jsx` and navigated via `src/components/Nav.jsx` and `src/components/Footer.jsx`:

| Route Path | Page Component | Description | Popup Target Behavior |
|---|---|---|---|
| `/` | `Home.jsx` | Landing page (Hero scroll scrub, demo sequence, pillars, availability) | **Shows popup** (after 3s delay on session arrival) |
| `/services` | `Services.jsx` | Services breakdown (AI Receptionist, Speed-to-lead, AI SEO, Reviews) | **Shows popup** (if first page of session) |
| `/compare` | `CostComparison.jsx` | Comparison matrix vs in-house staff & traditional agencies | **Shows popup** (if first page of session) |
| `/real-math` | `RealMath.jsx` | Analog whiteboard financial breakdown & ROI calculator | **Shows popup** (if first page of session) |
| `/quote` | `Quote.jsx` | Interactive quote request form & lead intake | **EXCLUDED** (`SKIP_ROUTES` — popup never pops up on `/quote`) |
| `/legal` | `Legal.jsx` | Terms, Privacy policy (`#privacy`), Refund policy (`#refund-policy`) | **Shows popup** (if first page of session) |
| `*` | `Home.jsx` | Catch-all wildcard for invalid or missing URLs | Falls back to Home, shows popup if new session |

---

## 5. User Requirements & Acceptance Criteria Mapping

From `ORIGINAL_REQUEST.md`:

### Requirement 1 (R1): Show popup once per session
- **Requirement:** The popup should appear exactly once when a user arrives at the website. If they navigate to other pages within the same visit, it should not appear again.
- **Specification:**
  - Transition persistence mechanism from multi-day `localStorage` to **session-scoped persistence** (e.g., `sessionStorage` with key `vm.popup.dismissed` or `vm.popup.shown` and module session state).
  - When the user visits any eligible route (`/`, `/services`, `/compare`, `/real-math`, `/legal`), a 3-second delay timer is scheduled once per session.
  - When shown or dismissed, the session store is marked. Subsequent route changes within the same session will detect the session flag and will not show or re-schedule the popup.

### Requirement 2 (R2): Remove long-term dismissal state
- **Requirement:** The popup must no longer remember that it was dismissed across multiple visits (e.g., the 7-day memory should be removed). Every new visit to the site should show the popup again.
- **Specification:**
  - Remove `const REMEMBER_DAYS = 7;`.
  - Remove `localStorage` timestamp comparisons (`Date.now() - ts < REMEMBER_DAYS * 86400000`).
  - Clear / stop setting long-term `localStorage` key (`vm.popup.dismissedAt`).
  - In a new browser context / visit where session storage is empty, the popup will always trigger on arrival.

### Requirement 3 (R3): Automated Browser Testing
- **Requirement:** Write an automated browser test (using Puppeteer) to prove the popup shows on the first page load, and does not show on subsequent page loads within the same session.
- **Specification:**
  - Add dedicated test script (e.g. `scripts/verify-popup.mjs` or npm test runner).
  - Use `puppeteer-core` pointing to `C:\Program Files\Google\Chrome\Application\chrome.exe`.
  - Test Suite Coverage:
    1. **Test 1 (Fresh Session):** Launch fresh browser context, navigate to `http://localhost:5173/`, wait 3.5s, verify `.pop` dialog appears and is visible.
    2. **Test 2 (Dismiss & Navigate):** Click `.pop-close` (or `.pop-backdrop`), verify dialog disappears, navigate to `http://localhost:5173/services` and `http://localhost:5173/compare`, wait >3s, verify popup does NOT appear.
    3. **Test 3 (New Session / Context):** Create a new browser context (or new incognito context / fresh session), navigate to `http://localhost:5173/`, wait 3.5s, verify popup appears again.
    4. **Test 4 (Skip Route Direct Visit):** In a fresh session, navigate directly to `http://localhost:5173/quote`, verify popup does not appear.

---

## 6. Dev Server Specifications & Execution Lifecycle

### 6.1 Server Configuration
- **Entry Configuration:** `vite.config.js`
- **Config Content:**
  ```javascript
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';

  export default defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
    },
  });
  ```
- **Port:** `5173`
- **Host:** `localhost` (`127.0.0.1`)

### 6.2 Dev Server Startup Command
- **Command:** `npm run dev`
- **Alternate Direct Command:** `npx vite`
- **Output:**
  ```text
  VITE v5.4.10  ready in ~200 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
  ```

### 6.3 Dev Server Lifecycle
1. **Startup:** Executed in project root `c:\medify-timer\vm-solutions`.
2. **Readiness Probe:** Ready once port 5173 responds to HTTP GET requests (HTTP 200).
3. **Execution Mode:** Background process / daemon during test suites and manual verification.
4. **Shutdown:** Process termination (SIGINT / task kill).

---

## 7. 5-Component Handoff Report

### 1. Observation
- `package.json` contains scripts `"dev": "vite"`, `"build": "vite build"`, `"preview": "vite preview"`. Dependencies include `react: 18.3.1`, `react-dom: 18.3.1`, `react-router-dom: 6.28.0`, `gsap: 3.12.5`, `lenis: 1.1.14`, `lucide-react: 0.454.0`, and devDependencies include `puppeteer-core: 25.3.0` and `vite: 5.4.10`.
- `vite.config.js` configures port `5173` with `strictPort: true`.
- Chrome executable exists at `C:\Program Files\Google\Chrome\Application\chrome.exe`.
- `src/App.jsx` mounts `<IntroPopup />` unconditionally on all routes.
- `src/components/IntroPopup.jsx` lines 8-11: `DELAY_MS = 3000`, `STORAGE_KEY = 'vm.popup.dismissedAt'`, `REMEMBER_DAYS = 7`.
- Lines 51-59 of `src/components/IntroPopup.jsx` check `window.localStorage.getItem(STORAGE_KEY)` and suppress popup if dismissed within 7 days (`Date.now() - ts < REMEMBER_DAYS * 86400000`).
- Line 77 and 177 write dismissal timestamp into `localStorage`.
- `npm run build` ran successfully generating production assets in `dist/`.

### 2. Logic Chain
1. The user request in `ORIGINAL_REQUEST.md` demands removing the 7-day memory (`REMEMBER_DAYS = 7`) and changing popup behavior so it displays once per session/visit.
2. The current implementation uses `localStorage` with a 7-day timestamp expiry, which prevents the popup from showing on subsequent visits within a week.
3. By replacing `localStorage` long-term persistence with `sessionStorage` (scoped to the browser session / tab lifecycle) and removing `REMEMBER_DAYS`, the popup will naturally show on every new visit/session while remaining suppressed during route navigation within the same session.
4. An automated test script using `puppeteer-core` can start the dev server (or target `http://localhost:5173`), create a browser context, verify the popup displays on first visit, verify it does not reappear after dismissal across route navigation, and verify a second new browser context triggers the popup anew.

### 3. Caveats
- `sessionStorage` is isolated per tab. Opening a new tab or closing and reopening the browser initiates a new session, which is standard browser session semantics.
- If storage is disabled (e.g. strict privacy blockers), storage operations throw an exception. Existing `try...catch` handlers must be preserved with a session-scoped in-memory fallback.
- `SKIP_ROUTES` (`/quote`) must continue to be respected so users on the quote form are not interrupted.

### 4. Conclusion
The codebase is a clean Vite + React 18 SPA. The requirements R1, R2, R3 are straightforward:
1. Update `src/components/IntroPopup.jsx` to eliminate `localStorage` 7-day persistence and utilize session-scoped state (`sessionStorage`).
2. Add a comprehensive Puppeteer test script (e.g. `scripts/verify-popup.mjs`) to verify R1, R2, R3 across browser contexts and routes.
3. Validate with dev server on port 5173.

### 5. Verification Method
1. **Build Check:** Run `npm run build` — must compile with zero errors.
2. **Dev Server Check:** Run `npm run dev` — must listen on `http://localhost:5173`.
3. **Automated Test Check:** Run `node scripts/verify-popup.mjs` against the running dev server — must output all PASS checks and exit code 0.
4. **Multi-Context Test:** Verify with fresh context that popup appears after 3 seconds, does not appear after dismissal during navigation, and appears in a new context.
