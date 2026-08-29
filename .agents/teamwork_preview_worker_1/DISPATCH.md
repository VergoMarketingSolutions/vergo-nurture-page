## 2026-08-29T22:25:37Z

You are teamwork_preview_worker_1 for the VM Solutions Email Course Popup project.
Working directory: c:\medify-timer\vm-solutions\.agents\teamwork_preview_worker_1

MANDATORY: Read the original request at:
c:\medify-timer\vm-solutions\.agents\ORIGINAL_REQUEST.md
Also review the project plan and explorer findings:
- Project Plan: c:\medify-timer\vm-solutions\.agents\PROJECT.md
- Test Infra: c:\medify-timer\vm-solutions\.agents\TEST_INFRA.md
- Explorer 1 Report: c:\medify-timer\vm-solutions\.agents\teamwork_preview_explorer_1\handoff.md
- Spec Miner Report: c:\medify-timer\vm-solutions\.agents\teamwork_preview_spec_miner_1\handoff.md
- Explorer 2 Report: c:\medify-timer\vm-solutions\.agents\teamwork_preview_explorer_2\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File write ownership:
You exclusively own and are responsible for modifying/creating:
- `src/components/IntroPopup.jsx`
- `package.json`
- `scripts/test-popup.mjs`

Your Tasks:
1. Modify `src/components/IntroPopup.jsx`:
   - Replace 7-day `localStorage` persistence with `sessionStorage` persistence using key `vm.popup.dismissed`.
   - Remove `const REMEMBER_DAYS = 7;` and timestamp subtraction logic.
   - Replace `dismissedRecently()` with `isDismissed()`, checking `window.sessionStorage.getItem(STORAGE_KEY)`.
   - In `close()` and `onSubmit()`, set `window.sessionStorage.setItem(STORAGE_KEY, '1')`.
   - Ensure all `sessionStorage` access is wrapped in `try...catch` for private browsing / restricted environments.
   - Preserve existing styling, delay (3000ms), focus trap, scroll lock, and `/quote` skip route behavior.

2. Create automated Puppeteer browser test suite `scripts/test-popup.mjs`:
   - Use `puppeteer-core` with Chrome executable resolution (`C:/Program Files/Google/Chrome/Application/chrome.exe` and Edge fallback).
   - Ensure Vite dev server (`http://localhost:5173`) is running or auto-spawned with proper cleanup on Windows (`taskkill /F /T /PID`).
   - Implement test scenarios verifying:
     * Test 1 (Fresh context / arrival): Popup appears within expected delay with title and email input.
     * Test 2 (In-session route navigation): After clicking close, navigating routes (`/services`, `/compare`, `/`) and page reload does NOT re-trigger popup.
     * Test 3 (New browser context / new visit): Creating a fresh browser context triggers the popup anew on arrival (proving 7-day memory is eliminated).
     * Test 4 (Skip route): Direct visit to `/quote` does not trigger popup.
   - Output clear TAP/console status (PASS/FAIL) and exit with code 0 on success, code 1 on failure.

3. Update `package.json`:
   - Add `"test": "node scripts/test-popup.mjs"`.
   - Add `"test:popup": "node scripts/test-popup.mjs"`.

4. Verification & Testing:
   - Run `npm run build` to verify clean build without errors.
   - Run `node scripts/test-popup.mjs` (or `npm test`) against the local dev server and ensure all test scenarios pass 100%.

5. Deliverable:
   - Write your complete handoff report to:
     `c:\medify-timer\vm-solutions\.agents\teamwork_preview_worker_1\handoff.md`
   - Include: Observation, Logic Chain, Caveats, Conclusion, and Verification Method (including exact terminal commands run, outputs, and diffs).
   - Update `c:\medify-timer\vm-solutions\.agents\teamwork_preview_worker_1\progress.md`.
   - Send a completion message back to the orchestrator.
