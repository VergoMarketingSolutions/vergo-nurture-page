// Single source of truth for the intake-capacity + deadline claims shown
// across the site.
//
// Onboarding is hands-on — number porting, script tuning, calendar hookup — so
// intake is capped per month rather than sold unlimited, and each month's
// offer runs to the last day of that month. Every place the site mentions
// availability or the countdown reads from here, so nothing can drift between
// the nav bar, the hero, and the quote form.
//
// SPOTS_LEFT is a real figure — update it as spots actually fill. The month
// label and the deadline are derived from the current date, so they roll over
// on the 1st with no manual edit and always agree with each other.

export const SPOTS_TOTAL = 25;
export const SPOTS_LEFT = 10;

export const SPOTS_TAKEN = SPOTS_TOTAL - SPOTS_LEFT;
export const SPOTS_FILLED_PCT = Math.round((SPOTS_TAKEN / SPOTS_TOTAL) * 100);

// Last moment of the current calendar month, local time. Day 0 of next month
// resolves to the last day of this one; computing it fresh each call is what
// makes the rollover automatic.
export function getOfferDeadline(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

// Full month name for the current intake, e.g. "August".
export function getIntakeMonth(now = new Date()) {
  return now.toLocaleString('en-AU', { month: 'long' });
}

export const INTAKE_MONTH = getIntakeMonth();
