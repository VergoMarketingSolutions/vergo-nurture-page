import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Users, Clock } from 'lucide-react';
import {
  SPOTS_LEFT,
  SPOTS_TOTAL,
  SPOTS_TAKEN,
  SPOTS_FILLED_PCT,
  INTAKE_MONTH,
} from '../lib/availability.js';
import useCountdown from '../lib/useCountdown.js';

const pad = (n) => String(n).padStart(2, '0');

// Compact one-line countdown for tight spots (the availability bar).
export function CountdownInline({ className = '' }) {
  const { days, hours, minutes, seconds } = useCountdown();
  return (
    <span
      className={`cd-inline ${className}`.trim()}
      role="timer"
      aria-label={`${INTAKE_MONTH} offer closes in ${days} days ${hours} hours`}
    >
      <Clock size={13} strokeWidth={2.4} aria-hidden="true" />
      <span aria-hidden="true">
        {days}d {pad(hours)}h {pad(minutes)}m {pad(seconds)}s
      </span>
    </span>
  );
}

// Boxed digit blocks for prominent placements (hero, availability, CTAs).
export function Countdown({ label = `${INTAKE_MONTH} intake closes in`, tone = 'light' }) {
  const { days, hours, minutes, seconds } = useCountdown();
  const units = [
    { v: days, l: 'days' },
    { v: hours, l: 'hrs' },
    { v: minutes, l: 'min' },
    { v: seconds, l: 'sec' },
  ];
  return (
    <div
      className={`countdown countdown--${tone}`}
      role="timer"
      aria-label={`${label} ${days} days ${hours} hours ${minutes} minutes`}
    >
      {label && <span className="countdown-label">{label}</span>}
      <span className="countdown-units" aria-hidden="true">
        {units.map((u, i) => (
          <Fragment key={u.l}>
            <span className="cd-block">
              <span className="cd-num">{pad(u.v)}</span>
              <span className="cd-label">{u.l}</span>
            </span>
            {i < units.length - 1 && <span className="cd-sep">:</span>}
          </Fragment>
        ))}
      </span>
    </div>
  );
}

// Slim sitewide bar pinned above the floating nav.
export function AnnouncementBar() {
  return (
    <div className="announce" role="region" aria-label="Current availability">
      <div className="announce-inner">
        <span className="announce-dot" aria-hidden="true" />
        <p className="announce-copy">
          <strong>{SPOTS_LEFT} spots left</strong> for {INTAKE_MONTH}
          <span className="announce-why"> — we cap intake at {SPOTS_TOTAL} builds a month</span>
        </p>
        <span className="announce-sep" aria-hidden="true" />
        <CountdownInline className="announce-countdown" />
        <Link to="/quote" className="announce-cta">
          Claim a spot
        </Link>
      </div>
    </div>
  );
}

// Inline pill for use next to CTAs and headings.
export function SpotsPill({ className = '' }) {
  return (
    <span className={`spots-pill ${className}`.trim()}>
      <CalendarClock size={15} strokeWidth={2.3} aria-hidden="true" />
      Only {SPOTS_LEFT} {INTAKE_MONTH} spots left
    </span>
  );
}

// One-line reminder for the bottom of forms and CTA bands.
export function SpotsNote({ children }) {
  return (
    <p className="spots-note">
      <Users size={15} strokeWidth={2.3} aria-hidden="true" />
      <span>
        {children || (
          <>
            {SPOTS_TAKEN} of {SPOTS_TOTAL} {INTAKE_MONTH} spots are already taken — {SPOTS_LEFT}{' '}
            left.
          </>
        )}
      </span>
    </p>
  );
}

// Capacity meter — the "why" behind the cap, with a visual fill.
export function SpotsMeter() {
  return (
    <div className="spots-meter">
      <div className="spots-meter-head">
        <div>
          <div className="spots-meter-count">
            <strong>{SPOTS_LEFT}</strong> of {SPOTS_TOTAL} spots left
          </div>
          <p className="spots-meter-sub">
            {INTAKE_MONTH} intake. We only take on {SPOTS_TOTAL} new builds a month — porting your
            number, tuning the script to how you actually quote, and wiring up your calendar is
            hands-on work, and we&rsquo;d rather do ten properly than fifty badly.
          </p>
        </div>
        <SpotsPill className="spots-pill--lg" />
      </div>
      <div
        className="spots-bar"
        role="img"
        aria-label={`${SPOTS_TAKEN} of ${SPOTS_TOTAL} ${INTAKE_MONTH} spots taken`}
      >
        <span className="spots-bar-fill" style={{ width: `${SPOTS_FILLED_PCT}%` }} />
      </div>
      <div className="spots-bar-legend">
        <span>{SPOTS_TAKEN} taken</span>
        <span>{SPOTS_LEFT} remaining</span>
      </div>
    </div>
  );
}
