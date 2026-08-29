# Email Course Popup Survey & Architecture Report

## 1. Observation

Direct observations from the codebase investigation:

### 1.1 Key File Locations
- **Popup Component**: `src/components/IntroPopup.jsx` (307 lines)
- **Mount Point**: `src/App.jsx` (lines 9, 94)
- **Application Shell / Entry**: `src/main.jsx` (mounts `<BrowserRouter>` and `<App />`)
- **Styles**: `src/styles/site.css` (lines 845–1198 define `.pop-backdrop`, `.pop`, `.pop-close`, `.pop-done`, `.pop-form`, etc.)
- **Asset Sources**: `public/popup-meme.jpg` (referenced via `MEME_SOURCES` array in `IntroPopup.jsx`)
- **Documentation**: `docs/email-course.md`
- **Dependencies**: `package.json` includes `react` (18.3.1), `react-router-dom` (6.28.0), `puppeteer-core` (25.3.0), and `vite` (5.4.10).

---

### 1.2 Current Popup Implementation Details (`src/components/IntroPopup.jsx`)

#### A. Constants & Configuration (Lines 8–11, 43–48)
```javascript
// Lines 8-11:
const DELAY_MS = 3000;
const STORAGE_KEY = 'vm.popup.dismissedAt';
const REMEMBER_DAYS = 7;

// Lines 43-48:
// Someone already filling in the quote form does not need a popup.
const SKIP_ROUTES = ['/quote'];

// Module-level so a route change mid-visit can't queue a second timer and
// pop the dialog in someone's face while they're navigating.
let scheduled = false;
```

#### B. Expiration & Storage Check (Lines 51–59)
```javascript
const dismissedRecently = () => {
  try {
    const ts = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(ts) && ts > 0 && Date.now() - ts < REMEMBER_DAYS * 86400000;
  } catch {
    // private mode / storage blocked — treat as "not dismissed" rather than throwing
    return false;
  }
};
```

#### C. Dismissal Handler (Lines 74–81)
```javascript
const close = useCallback(() => {
  setOpen(false);
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
  } catch {
    /* nothing to do — it just shows again next visit */
  }
}, []);
```

#### D. Popup Trigger Hook (Lines 83–90)
```javascript
useEffect(() => {
  if (scheduled) return undefined;
  if (SKIP_ROUTES.includes(pathname)) return undefined;
  if (dismissedRecently()) return undefined;
  scheduled = true;
  const t = setTimeout(() => setOpen(true), DELAY_MS);
  return () => clearTimeout(t);
}, [pathname]);
```

#### E. Form Submission Handler (Lines 175–180)
```javascript
setSent(true);
try {
  window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
} catch {
  /* non-fatal */
}
```

---

### 1.3 Application Mounting & Routing Lifecycle (`src/App.jsx`)
In `src/App.jsx`:
```javascript
// Line 9:
import IntroPopup from './components/IntroPopup.jsx';

// Lines 77-96:
return (
  <>
    <AnnouncementBar />
    <Nav />
    <ScrollRail />
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/compare" element={<CostComparison />} />
        <Route path="/real-math" element={<RealMath />} />
        <Route path="/quote" element={<Quote />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </main>
    <Footer />
    <IntroPopup />
  </>
);
```

- `<IntroPopup />` is rendered unconditionally at the root of `<App />` outside `<Routes>`.
- Client-side navigation via `react-router-dom` updates `useLocation().pathname` without unmounting `<IntroPopup />`.

---

## 2. Logic Chain

1. **Analysis of Current Problem (Intermittent / 7-Day Memory)**:
   - Observation: `IntroPopup.jsx` lines 53, 77, and 177 use `window.localStorage` with `STORAGE_KEY = 'vm.popup.dismissedAt'` and `REMEMBER_DAYS = 7`.
   - Inference: `window.localStorage` persists across browser restarts, new tabs, and long periods. Once a user closes the popup or submits the form, `dismissedRecently()` returns `true` for 7 days (`604,800,000 ms`), preventing the popup from appearing on any subsequent visit within that week.
   - Requirement Violation: Violates **R2** ("The popup must no longer remember that it was dismissed across multiple visits... Every new visit to the site should show the popup again").

2. **Analysis of Session Scope (R1 & R2 Requirements)**:
   - Requirement **R1**: "Show popup once per session... appear exactly once when a user arrives... If they navigate to other pages within the same visit, it should not appear again."
   - Requirement **R2**: "Remove long-term dismissal state... Every new visit to the site should show the popup again."
   - Inference: `window.sessionStorage` is the standard Web API designed specifically for session-scoped persistence.
     - A new browser session/tab context has empty `sessionStorage`.
     - In-session actions (navigating pages, reloading within the tab) retain `sessionStorage`.
     - When the tab/window is closed or a fresh browser context is opened, `sessionStorage` is cleared.

3. **Storage Mechanism & Dismissal Check Transition**:
   - Current: Stores timestamp in `localStorage`, checks `Date.now() - ts < 7 * 86400000`.
   - Proposed: Store a dismissal/seen flag in `sessionStorage` (e.g. `STORAGE_KEY = 'vm.popup.dismissed'`).
   - Check function:
     ```javascript
     const isDismissed = () => {
       try {
         return Boolean(window.sessionStorage.getItem(STORAGE_KEY));
       } catch {
         return false;
       }
     };
     ```
   - In `close()` and `onSubmit()`:
     ```javascript
     try {
       window.sessionStorage.setItem(STORAGE_KEY, '1');
     } catch {
       /* non-fatal */
     }
     ```

4. **Trigger & Routing Lifecycle Transition**:
   - When a user lands on any route except `/quote`:
     1. If `isDismissed()` returns `true` (already dismissed or completed in this session), the popup does not trigger.
     2. If `scheduled` is `true`, the popup does not queue duplicate timers.
     3. Otherwise, `scheduled = true` and a 3-second timer (`DELAY_MS = 3000`) is scheduled.
   - If the user navigates across client-side routes (e.g., from `/` to `/services`), `<IntroPopup />` remains mounted in `<App />`.
   - If dismissed, `sessionStorage.setItem(STORAGE_KEY, '1')` ensures that navigating across routes or even performing a full page reload within that session suppresses the popup.
   - If a new browser context (simulating a new visit/session) opens the site, `sessionStorage` is empty, so `isDismissed()` returns `false` and the popup triggers 3 seconds after arrival.

---

## 3. Caveats

1. **Storage Availability & Private Browsing**:
   - In restricted environments (e.g. strict Safari Private Browsing or disabled cookies/storage), accessing `window.sessionStorage` may throw a `SecurityError` or `QuotaExceededError`.
   - *Mitigation*: All `sessionStorage` operations must remain wrapped in `try...catch` blocks to fail gracefully (defaulting to in-memory state).

2. **Route Exclusion (`SKIP_ROUTES = ['/quote']`)**:
   - Users directly landing on `/quote` should not receive the popup because they are already engaged with the quote conversion flow.
   - If they subsequently navigate from `/quote` to `/` within the same session, `useEffect` will detect `pathname !== '/quote'` and schedule the popup if not previously dismissed. This behavior is preserved.

3. **Module-Scoped `scheduled` Variable**:
   - `let scheduled = false;` is module-scoped in `src/components/IntroPopup.jsx`. In an SPA, it persists in JS memory as long as the page is not reloaded.
   - Pairing `scheduled` with `sessionStorage` provides two layers of protection: `scheduled` prevents redundant timer scheduling during in-memory React re-renders/transitions, while `sessionStorage` prevents re-appearance across page reloads in the same session.

---

## 4. Conclusion & Proposed Implementation

### Summary of Changes in `src/components/IntroPopup.jsx`
1. Change storage key from `'vm.popup.dismissedAt'` to `'vm.popup.dismissed'`.
2. Remove `const REMEMBER_DAYS = 7;`.
3. Replace `dismissedRecently()` with `isDismissed()`, checking `window.sessionStorage.getItem(STORAGE_KEY)`.
4. In `close()`, replace `window.localStorage.setItem(...)` with `window.sessionStorage.setItem(STORAGE_KEY, '1')`.
5. In `onSubmit()`, replace `window.localStorage.setItem(...)` with `window.sessionStorage.setItem(STORAGE_KEY, '1')`.
6. In `useEffect()`, call `if (isDismissed()) return undefined;`.

### Proposed Code Diff for `src/components/IntroPopup.jsx`

```diff
--- a/src/components/IntroPopup.jsx
+++ b/src/components/IntroPopup.jsx
@@ -6,8 +6,7 @@
 // deliberately aggressive — this is the single number to raise if it
 // starts reading as pushy rather than cheeky.
 const DELAY_MS = 3000;
-const STORAGE_KEY = 'vm.popup.dismissedAt';
-const REMEMBER_DAYS = 7;
+const STORAGE_KEY = 'vm.popup.dismissed';
 
 // The headline value claim, in one place. It's a quantified figure shown to
 // customers, so it needs to stay defensible — change or drop it here rather
@@ -48,11 +47,10 @@
 
 const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
 
-const dismissedRecently = () => {
+const isDismissed = () => {
   try {
-    const ts = Number(window.localStorage.getItem(STORAGE_KEY));
-    return Number.isFinite(ts) && ts > 0 && Date.now() - ts < REMEMBER_DAYS * 86400000;
+    return Boolean(window.sessionStorage.getItem(STORAGE_KEY));
   } catch {
     // private mode / storage blocked — treat as "not dismissed" rather than throwing
     return false;
   }
 };
@@ -74,7 +72,7 @@
   const close = useCallback(() => {
     setOpen(false);
     try {
-      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
+      window.sessionStorage.setItem(STORAGE_KEY, '1');
     } catch {
       /* nothing to do — it just shows again next visit */
     }
@@ -83,7 +81,7 @@
   useEffect(() => {
     if (scheduled) return undefined;
     if (SKIP_ROUTES.includes(pathname)) return undefined;
-    if (dismissedRecently()) return undefined;
+    if (isDismissed()) return undefined;
     scheduled = true;
     const t = setTimeout(() => setOpen(true), DELAY_MS);
     return () => clearTimeout(t);
@@ -174,7 +172,7 @@
       }
       setSent(true);
       try {
-        window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
+        window.sessionStorage.setItem(STORAGE_KEY, '1');
       } catch {
         /* non-fatal */
       }
```

---

## 5. Verification Method

### 5.1 Automated Puppeteer Test Verification
A dedicated Puppeteer verification script (e.g. `scripts/verify-popup-session.mjs`) will test:
1. **Fresh Browser Context 1 (Visit 1 Arrival)**:
   - Launch Puppeteer with a fresh browser context (`browser.createBrowserContext()`).
   - Navigate to `http://localhost:5173/`.
   - Wait 3.5s (`DELAY_MS` = 3000ms).
   - Assert `.pop` dialog is visible in DOM (`await page.$('.pop') !== null`).
2. **In-Session Dismissal & Route Navigation (R1)**:
   - Click close button `.pop-close` or press `Escape`.
   - Assert `.pop` dialog is closed/removed from DOM (`await page.$('.pop') === null`).
   - Navigate client-side to `http://localhost:5173/services`.
   - Wait 3.5s.
   - Assert `.pop` dialog DOES NOT reappear.
   - Navigate client-side to `http://localhost:5173/compare`.
   - Wait 3.5s.
   - Assert `.pop` dialog DOES NOT reappear.
3. **Fresh Browser Context 2 (Visit 2 - Simulating New Visit) (R2)**:
   - Close first context.
   - Open second fresh browser context (`browser.createBrowserContext()`).
   - Navigate to `http://localhost:5173/`.
   - Wait 3.5s.
   - Assert `.pop` dialog appears again (`await page.$('.pop') !== null`).
   - Pass/fail summary output.

### 5.2 Build & Dev Commands
- Start dev server: `npm run dev`
- Build check: `npm run build`
- Run automated test: `node scripts/verify-popup-session.mjs`
