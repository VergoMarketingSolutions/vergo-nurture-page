# Project: VM Solutions Email Course Popup Session Lifecycle

## Architecture
- **Framework**: React 18.3.1 SPA with Vite 5.4.10, React Router DOM 6.28.0, GSAP + Lenis smooth scrolling.
- **Component**: `src/components/IntroPopup.jsx` mounted in `src/App.jsx` root shell.
- **Storage**: Transitioned from 7-day `localStorage` (`STORAGE_KEY = 'vm.popup.dismissedAt'`, `REMEMBER_DAYS = 7`) to session-scoped `sessionStorage` (`STORAGE_KEY = 'vm.popup.dismissed'`).
- **Testing**: Node ESM test suite using `puppeteer-core` 25.3.0 against Vite dev server at `http://localhost:5173` with 30/30 automated assertions.

## Feature Inventory
| # | Feature | Description | Milestone | Source | Status |
|---|---------|-------------|-----------|--------|--------|
| 1 | R1: Session-scoped popup display | Popup triggers 3s after arrival on first page load of session | M1 | ORIGINAL_REQUEST.md §R1 | DONE |
| 2 | R1: In-session route navigation suppression | After dismissal or viewing, popup does not reappear on client-side route changes | M1 | ORIGINAL_REQUEST.md §R1 | DONE |
| 3 | R1: In-session reload suppression | Reloading a page in the same session does not re-trigger popup | M1 | Survey Explorer 1 & 2 | DONE |
| 4 | R2: Elimination of 7-day memory | Remove `REMEMBER_DAYS = 7` and long-term `localStorage` persistence | M1 | ORIGINAL_REQUEST.md §R2 | DONE |
| 5 | R2: Fresh session reappearance | Opening a new browser visit / context triggers popup anew on arrival | M1 | ORIGINAL_REQUEST.md §R2 | DONE |
| 6 | Skip Route isolation | Direct visits to `/quote` bypass popup scheduling | M1 | Codebase Survey | DONE |
| 7 | R3: Puppeteer E2E test runner | Automated browser test suite verifying all session lifecycles | M2 | ORIGINAL_REQUEST.md §R3 | DONE |
| 8 | Independent verification & gate | Full Reviewer, Challenger, and Auditor pass | M3 | System Protocol | DONE |

## Milestones
| # | Name | Scope | Dependencies | Status | Key Outputs |
|---|------|-------|-------------|--------|-------------|
| M1 | Popup Component Session Logic | Modify `src/components/IntroPopup.jsx` to use `sessionStorage` and remove 7-day persistence | none | DONE | `src/components/IntroPopup.jsx` |
| M2 | Automated Puppeteer Test Suite | Implement `scripts/test-popup.mjs` and update `package.json` test scripts | M1 | DONE | `scripts/test-popup.mjs`, `package.json` |
| M3 | Integration, Adversarial Challenge & Audit | Run Puppeteer test suite, dev server verification, Reviewers, Challengers, and Forensic Auditor | M1, M2 | DONE | 30/30 test pass, CLEAN audit, 2x APPROVE |

## Interface Contracts
### `IntroPopup.jsx` Storage & Lifecycle Contract
- **Storage mechanism**: `window.sessionStorage`
- **Storage key**: `'vm.popup.dismissed'`
- **Set value**: `'1'` upon close (`.pop-close` click, Escape key, backdrop click) or submit (`setSent(true)`)
- **Check condition**: `isDismissed()` returns `Boolean(window.sessionStorage.getItem(STORAGE_KEY))` wrapped in `try...catch`
- **Timing**: 3000ms delay (`DELAY_MS = 3000`)
- **Route guard**: `SKIP_ROUTES = ['/quote']`

## Code Layout
- `src/components/IntroPopup.jsx` — Popup component implementation
- `package.json` — Scripts configuration (`"test": "node scripts/test-popup.mjs"`)
- `scripts/test-popup.mjs` — Comprehensive automated Puppeteer browser test suite (30 assertions across 10 scenarios)
