import { useMemo } from 'react';
import { Link } from 'react-router-dom';

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
    cost: '$2,500–$10,000/mo',
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
    cost: '$3,000–$6,000+/mo',
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
  return (
    <div className="wb" data-section="THE MATH" data-theme="light">
      <WobblyGrid />
      <div className="wb-inner">
        <header className="wb-head">
          <div className="wb-kicker">ok, grab a marker —</div>
          <h1 className="wb-title">
            The <span className="wb-title-real">Real</span> Math
          </h1>
          <Squiggle className="wb-title-squiggle" />
          <p className="wb-sub">
            What it actually costs to answer your phones and fill your pipeline — sketched
            out the way I&rsquo;d explain it to a mate.
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
            <div className="wb-cell wb-cell--opt">
              VM Solutions Bundle
              <span className="wb-vm-note">← the only row that isn&rsquo;t a compromise</span>
            </div>
            <div className="wb-cell wb-cell--cost">
              <span className="wb-label">Monthly cost:</span>
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
          <p className="wb-footnote">
            * ranges pulled from typical published AU pricing — your mileage will vary. The
            point isn&rsquo;t the exact dollars, it&rsquo;s the shape of the problem.
          </p>
          <p className="wb-footnote wb-footnote--green">
            The whole pitch in one line: one bill instead of three, and your phone never
            rings out.
          </p>
        </div>
      </div>
    </div>
  );
}
