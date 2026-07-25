import { useState, useEffect } from 'react';
import { getOfferDeadline } from './availability.js';

// Ticks once a second toward the current month's real deadline. Because the
// deadline is recomputed on every tick, the display auto-rolls to next month
// the instant the current one ends — no reset flag, no fabricated movement.
export default function useCountdown() {
  const [ms, setMs] = useState(() => getOfferDeadline().getTime() - Date.now());

  useEffect(() => {
    const tick = () => setMs(getOfferDeadline().getTime() - Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const clamped = Math.max(0, ms);
  const total = Math.floor(clamped / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    expired: clamped === 0,
  };
}
