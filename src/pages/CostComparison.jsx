import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { User, Bot, ChevronRight, Sparkles, ShieldCheck, Percent, PhoneMissed } from 'lucide-react';
import IconGlass from '../components/IconGlass.jsx';
import usePageMeta from '../lib/usePageMeta.js';

const aud = (n) => '$' + Math.round(n).toLocaleString('en-AU');

const TABLE = [
  { label: 'Availability', a: 'Business hours, one desk', b: '24/7/365 — nights, weekends, storms' },
  { label: 'Answer speed', a: 'When they’re free', b: 'Under 10 seconds, every time' },
  { label: 'Simultaneous calls', a: 'One at a time', b: 'Every call at once' },
  { label: 'Sick days & leave', a: '4+ weeks a year to cover', b: 'None. Ever.' },
  { label: 'Cost basis', a: '$70,000+ fixed, per year', b: '$0.09/min — pay only for talk time' },
  { label: 'Time to start', a: 'Weeks of hiring & training', b: 'Live in days' },
];

export default function CostComparison() {
  usePageMeta(
    'Cost Comparison — $0.09/min vs a $70k Receptionist | VM Solutions',
    'An in-house receptionist really costs $70k+ a year. VM Solutions answers 24/7 at $0.09 AUD per minute. Run the numbers, including what your missed calls already cost you.'
  );
  const rootRef = useRef(null);
  const [missedWk, setMissedWk] = useState(6);
  const [jobVal, setJobVal] = useState(800);
  // deliberately conservative: assume only 1 in 3 missed calls was a real job
  const leak = (missedWk * 52 * jobVal) / 3;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.spec-cell', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.14,
        scrollTrigger: { trigger: '.spec-duel', start: 'top 78%' },
      });
      gsap.from('.cmp-row', {
        opacity: 0,
        y: 24,
        duration: 0.55,
        ease: 'power2.out',
        stagger: 0.07,
        scrollTrigger: { trigger: '.cmp-table', start: 'top 80%' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="page">
      <header className="page-head section" data-section="COMPARE" data-theme="light">
        <div className="eyebrow">Cost comparison</div>
        <h1>
          One desk. One salary.
          <br />
          Or nine cents a minute.
        </h1>
        <p>
          This is the only page on this site with prices on it — because this one is simple
          enough to publish.
        </p>
      </header>

      <section className="section" data-section="THE DUEL" data-theme="light">
        <div className="spec-duel">
          <div className="spec-cell">
            <div className="spec-cell-head">
              <IconGlass icon={User} size="sm" />
              <span className="spec-tag">The traditional way</span>
            </div>
            <h3>In-house receptionist</h3>
            <div className="spec-price">
              $70k<span>+ real cost / year</span>
            </div>
            <ul className="spec-list">
              <li>Base salary $50,000–$70,000 in Australia</li>
              <li>+ superannuation on top of that</li>
              <li>+ annual leave, sick leave, public holidays</li>
              <li>+ training, turnover and re-hiring</li>
              <li>Covers business hours only — one call at a time</li>
            </ul>
          </div>

          <div className="spec-cell spec-cell--win">
            <span className="spec-save">
              <Percent size={13} strokeWidth={2.6} /> ~98% less than in-house
            </span>
            <div className="spec-cell-head">
              <IconGlass icon={Bot} size="sm" tone="var(--blue)" />
              <span className="spec-tag spec-tag--blue">VM Solutions</span>
            </div>
            <h3>AI Receptionist</h3>
            <div className="spec-price spec-price--blue">
              $0.09<span>AUD / minute</span>
            </div>
            <ul className="spec-list">
              <li>No salary, no super, no leave — ever</li>
              <li>24/7 coverage including nights &amp; weekends</li>
              <li>Answers in under 10 seconds</li>
              <li>Takes every call at once during storm surges</li>
              <li>You pay only for actual talk time</li>
            </ul>
          </div>
        </div>

        <div className="yardstick">
          <IconGlass icon={Sparkles} size="sm" tone="var(--blue)" />
          <p>
            <strong>The yardstick:</strong> at 1,000 minutes of calls a month, a full year of
            AI-answered calls comes to about <strong>$1,080 AUD</strong> — a small fraction of a{' '}
            <em>single month</em> of a receptionist&rsquo;s salary.
          </p>
        </div>

        <div className="guarantee">
          <IconGlass icon={ShieldCheck} size="lg" tone="#1d9e5f" />
          <div className="guarantee-copy">
            <h3>And it&rsquo;s completely risk-free</h3>
            <p>
              Every engagement is backed by a <strong>30-day money-back guarantee</strong> — no
              lock-in contracts. If VM Solutions doesn&rsquo;t earn its keep in the first month,
              you get your money back. Simple as that.
            </p>
          </div>
          <div className="guarantee-seal">
            <strong>100%</strong>
            <span>Money-back</span>
          </div>
        </div>
      </section>

      <section className="section" data-section="THE LEAK" data-theme="light">
        <div className="section-head">
          <div className="eyebrow">Your numbers</div>
          <h2>What do missed calls already cost you?</h2>
          <p>Drag the sliders. We&rsquo;ll keep it conservative.</p>
        </div>
        <div className="calc">
          <div className="calc-controls">
            <label className="calc-row">
              <span className="calc-label">
                Calls you miss in a week
                <em>{missedWk}</em>
              </span>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={missedWk}
                onChange={(e) => setMissedWk(Number(e.target.value))}
                aria-label="Missed calls per week"
              />
            </label>
            <label className="calc-row">
              <span className="calc-label">
                Average job value
                <em>{aud(jobVal)}</em>
              </span>
              <input
                type="range"
                min="300"
                max="5000"
                step="100"
                value={jobVal}
                onChange={(e) => setJobVal(Number(e.target.value))}
                aria-label="Average job value in dollars"
              />
            </label>
            <p className="calc-note">
              Assumes only 1 in 3 missed calls was a real job. Yours may be worse.
            </p>
          </div>
          <div className="calc-result">
            <IconGlass icon={PhoneMissed} size="sm" tone="#c23b3b" />
            <span className="calc-leak-label">Walking to competitors every year</span>
            <strong className="calc-leak">{aud(leak)}</strong>
            <span className="calc-vs">
              A full year of VM answering at this volume: <strong>≈ {aud(1080)}</strong>
              {leak > 1080 && (
                <>
                  {' '}
                  — about <strong>{Math.max(1, Math.round(leak / 1080))}×</strong> return if we
                  catch them
                </>
              )}
            </span>
          </div>
        </div>
      </section>

      <section className="section" data-section="SIDE BY SIDE" data-theme="light">
        <div className="section-head">
          <div className="eyebrow">Side by side</div>
          <h2>The same job, line by line.</h2>
        </div>
        <div className="cmp-table">
          <div className="cmp-row cmp-row--head">
            <div className="cmp-feature"></div>
            <div className="cmp-a">In-house receptionist</div>
            <div className="cmp-b">VM Solutions AI</div>
          </div>
          {TABLE.map((r) => (
            <div className="cmp-row" key={r.label}>
              <div className="cmp-feature">{r.label}</div>
              <div className="cmp-a" data-label="In-house receptionist">
                {r.a}
              </div>
              <div className="cmp-b" data-label="VM Solutions AI">
                {r.b}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section" data-section="SCOPE" data-theme="light">
        <div className="scope-note">
          <h3>What about marketing &amp; reviews?</h3>
          <p>
            Marketing Services and Internal Marketing Reviews are quoted individually based
            on scope — typical engagements run <strong>$1,500–$10,000 AUD</strong> depending
            on your market, service area and goals. No packages, no lock-in pricing pulled
            from thin air: we scope it to your business.
          </p>
          <div className="cta-band-actions">
            <Link to="/quote" className="button-primary">
              Request a Quote
            </Link>
            <Link to="/real-math" className="text-link text-link--lg">
              Prefer it on a whiteboard? <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
