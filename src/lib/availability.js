// Single source of truth for the intake-capacity claim shown across the site.
//
// Onboarding is hands-on — number porting, script tuning, calendar hookup — so
// intake is capped per month rather than sold unlimited. Every place the site
// mentions availability reads these values, so the number can't drift between
// the nav bar, the hero, and the quote form.
//
// Keep these honest: update SPOTS_LEFT as spots actually fill, and roll
// INTAKE_MONTH over at the start of each month.

export const SPOTS_TOTAL = 25;
export const SPOTS_LEFT = 10;
export const INTAKE_MONTH = 'August';

export const SPOTS_TAKEN = SPOTS_TOTAL - SPOTS_LEFT;
export const SPOTS_FILLED_PCT = Math.round((SPOTS_TAKEN / SPOTS_TOTAL) * 100);
