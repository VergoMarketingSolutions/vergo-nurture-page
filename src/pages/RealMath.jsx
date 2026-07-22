import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import usePageMeta from '../lib/usePageMeta.js';

const ROWS = [
  {
    option: 'Doing Nothing',
    cost: 'Whatever a missed job is worth',
    catchLine: 'Every unanswered call is a job for your competitor',
  },
  {
    option: 'DIY Answering Service',
    cost: '$150–$500/mo',
    catchLine: 'Basic scripts, no lead follow-up',
  },
  {
    option: 'Marketing Agency Only',
    cost: '$2,500–$15,000/mo',
    catchLine: '12-month contracts, doesn’t touch your phones',
  },
  {
    option: 'Standalone AI Receptionist Service',
    cost: '$95–$899/mo',
    catchLine: 'Per-minute overages balloon fast, no marketing',
  },
  {
    option: 'In-House Receptionist',
    cost: '$55K–$90K/yr',
    catchLine: 'One location, business hours only, sick days',
  },
  {
    option: 'Buying All of the Above Separately',
    cost: '$7,300–$23,900/mo',
    catchLine: 'Three vendors, three contracts, nobody talks to each other',
  },
];

// hand-drawn wobbly grid, generated once per mount
function WobblyGrid() {
  const paths = useMemo(() => {
    const W = 1600;
    const H = 1400;
    const r = () => (Math.random() - 0.5) * 7;
    const out = [];
    for (let y = 70; y < H; y += 72) {
      let d = `M0 ${y + r()}`;
      for (let x = 130; x <= W; x += 130) {
        d += ` C ${x - 87} ${y + r()}, ${x - 43} ${y + r()}, ${x} ${y + r()}`;
      }
      out.push(d);
    }
    for (let x = 80; x < W; x += 84) {
      let d = `M${x + r()} 0`;
      for (let y = 140; y <= H; y += 140) {
        d += ` C ${x + r()} ${y - 93}, ${x + r()} ${y - 47}, ${x + r()} ${y}`;
      }
      out.push(d);
    }
    return out;
  }, []);
  return (
    <svg className="wb-grid" viewBox="0 0 1600 1400" preserveAspectRatio="none" aria-hidden="true">
      {paths.map((d, i) => (
        <path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="1.4" />
      ))}
    </svg>
  );
}

const Squiggle = ({ className = '' }) => (
  <svg className={`wb-squiggle ${className}`} viewBox="0 0 600 10" preserveAspectRatio="none" aria-hidden="true">
    <path
      d="M2 6 C 60 3, 120 8, 180 5 S 300 7 360 4 S 480 8 540 5 S 590 6 598 5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

const SketchCircle = () => (
  <svg className="wb-circle" viewBox="0 0 260 74" preserveAspectRatio="none" aria-hidden="true">
    <path
      d="M18 40 C 20 16, 90 6, 140 9 C 200 12, 250 20, 248 38 C 246 60, 180 70, 118 67 C 60 64, 8 56, 14 34 C 18 18, 60 10, 96 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

export default function RealMath() {
  usePageMeta(
    'The Real Math — What Answering Your Phones Actually Costs | VM Solutions',
    'Every option for covering your phones and marketing, priced side by side on a whiteboard: answering services, agencies, in-house staff — and the one bundle that beats them.'
  );
  return (
    <div className="wb" data-section="THE MATH" data-theme="light">
      <WobblyGrid />
      <div className="wb-inner">
        <header className="wb-head">
          <div className="wb-kicker">the honest breakdown</div>
          <h1 className="wb-title">
            The <span className="wb-title-real">Real</span> Math
          </h1>
          <Squiggle className="wb-title-squiggle" />
          <p className="wb-sub">
            What it actually costs to answer your phones and fill your pipeline — every option,
            side by side.
          </p>
        </header>

        <div className="wb-table">
          <div className="wb-row wb-row--head">
            <div className="wb-cell wb-cell--opt">The option</div>
            <div className="wb-cell wb-cell--cost">Monthly Cost</div>
            <div className="wb-cell wb-cell--catch">The Catch</div>
          </div>

          {ROWS.map((r) => (
            <div className="wb-row" key={r.option}>
              <div className="wb-cell wb-cell--opt">{r.option}</div>
              <div className="wb-cell wb-cell--cost">
                <span className="wb-label">Monthly cost:</span>
                {r.cost}
              </div>
              <div className="wb-cell wb-cell--catch">
                <span className="wb-label">The catch:</span>
                {r.catchLine}
              </div>
            </div>
          ))}

          <div className="wb-row wb-row--vm">
            <span className="wb-save-sign" aria-hidden="true">
              ≈90%<small>cheaper</small>
            </span>
            <div className="wb-cell wb-cell--opt">
              VM Solutions Bundle
              <span className="wb-vm-note">← the only row that isn&rsquo;t a compromise</span>
            </div>
            <div className="wb-cell wb-cell--cost">
              <span className="wb-label">Monthly cost:</span>
              <span className="wb-vm-price">est. $1,000–$1,500/mo</span>
              <span className="wb-vm-save">↑ ~90% less than buying it all separately</span>
              <Link to="/quote" className="wb-vm-link">
                Get Your Number →
                <SketchCircle />
              </Link>
            </div>
            <div className="wb-cell wb-cell--catch">
              <span className="wb-label">The catch:</span>
              One system, one point of contact, scoped to your business
            </div>
          </div>
        </div>

        <div className="wb-foot">
          <div className="wb-guarantee">
            <span className="wb-guarantee-check" aria-hidden="true">✓</span>
            <span>
              risk-free: 30-day money-back guarantee — if VM doesn&rsquo;t earn its keep, you
              don&rsquo;t pay.
            </span>
          </div>
          <p className="wb-footnote">
            * Ranges based on typical published AU pricing. Actual costs vary by provider and
            scope.
          </p>
          <p className="wb-footnote wb-footnote--green">
            One bill instead of three — and your phone never rings out.
          </p>
        </div>
      </div>
    </div>
  );
}
