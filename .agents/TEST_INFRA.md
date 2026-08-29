# E2E Test Infra: VM Solutions Email Course Popup

## Test Philosophy
- Automated browser-level validation using `puppeteer-core`.
- Tests run against Vite dev server at `http://localhost:5173`.
- Verifies session isolation, persistence scope, route navigation, and fresh session re-triggering.

## Feature Inventory & Test Mapping
| # | Feature | Source (Requirement) | Test Scenario | Tier |
|---|---------|---------------------|---------------|------|
| 1 | Popup appearance on arrival | ORIGINAL_REQUEST §R1 | Test 1: Fresh Context Popup Appearance | 1 |
| 2 | Dialog content & interactivity | ORIGINAL_REQUEST §R1 | Test 1: Title, email input, CTA verification | 1 |
| 3 | Close button dismissal | ORIGINAL_REQUEST §R1 | Test 2: Close button click dismissal | 1 |
| 4 | In-session route navigation suppression | ORIGINAL_REQUEST §R1 | Test 2: Navigate /services, /compare, / | 1 |
| 5 | In-session page reload suppression | Codebase survey | Test 2: Page reload in same context | 2 |
| 6 | Fresh browser visit / new session reappearance | ORIGINAL_REQUEST §R2 | Test 3: New BrowserContext popup triggers | 1 |
| 7 | Skip route /quote isolation | Codebase survey | Test 4: Direct visit to /quote suppresses popup | 2 |

## Test Architecture
- **Test runner**: `scripts/test-popup.mjs`
- **Invocation**: `npm test` or `node scripts/test-popup.mjs`
- **Pass/fail semantics**: Exit code 0 if all assertions pass, exit code 1 if any fail.
- **Browser Binary**: Automatic discovery of Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe`) with fallback to Edge.
- **Dev Server Lifecycle**: Auto-connects to existing server at `http://localhost:5173` or auto-spawns and terminates Vite dev server.
