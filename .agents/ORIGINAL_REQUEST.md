# Original User Request

## Initial Request — 2026-08-29T22:16:57Z

# Teamwork Project Prompt — Draft

> Status: Launched.
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: The user asked for the full team ("max it out")

This is a single self-contained fix, but the user requested the full team. Modify the email course popup so it appears every time a user visits the website (once per session/visit), removing the current intermittent behaviour.

Working directory: c:\medify-timer\vm-solutions
Integrity mode: development

## Requirements

### R1. Show popup once per session
The popup should appear exactly once when a user arrives at the website. If they navigate to other pages within the same visit, it should not appear again.

### R2. Remove long-term dismissal state
The popup must no longer remember that it was dismissed across multiple visits (e.g. the 7-day memory should be removed). Every new visit to the site should show the popup again.

### R3. Automated Browser Testing
Write an automated browser test (using Puppeteer) to prove the popup shows on the first page load, and does not show on subsequent page loads within the same session.

## Acceptance Criteria

### Automated Verification
- [ ] A Puppeteer test suite is added that runs against the local dev server.
- [ ] The test verifies that on a fresh browser context, the popup appears.
- [ ] The test verifies that after dismissing the popup and navigating to another route, the popup does not reappear.
- [ ] The test verifies that on a *new* browser context (simulating a new visit), the popup appears again.
- [ ] The test suite passes completely.

### Independent Agent Verification
- [ ] An independent agent must review the Puppeteer test results and independently run `npm run dev` to verify the popup behaviour manually.
