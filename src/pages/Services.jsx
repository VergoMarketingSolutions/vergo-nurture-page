import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import {
  PhoneCall,
  Megaphone,
  SearchCheck,
  Check,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Star,
} from 'lucide-react';
import IconGlass from '../components/IconGlass.jsx';
import usePageMeta from '../lib/usePageMeta.js';

function IncludedList({ items }) {
  return (
    <ul className="svc-list">
      {items.map((it) => (
        <li key={it}>
          <IconGlass icon={Check} size="xs" tone="var(--blue)" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Services() {
  usePageMeta(
    'Services — Marketing Audits, Trade Marketing & AI Receptionist | VM Solutions',
    'One system in three steps: audit your marketing, build a pipeline that suits the trades, and answer every call it generates in under 10 seconds — 24/7.'
  );
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.svc').forEach((sec) => {
        gsap.from(sec.querySelectorAll('.svc-copy, .svc-visual'), {
          opacity: 0,
          y: 40,
          duration: 0.8,
          ease: 'power3.out',
          stagger: 0.12,
          scrollTrigger: { trigger: sec, start: 'top 75%' },
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="page">
      <header className="page-head section" data-section="SERVICES" data-theme="light">
        <div className="eyebrow">Services</div>
        <h1>
          The system, in order:
          <br />
          audit, build, answer.
        </h1>
        <p>
          Three services that feed each other. No fixed packages — every engagement is
          scoped to your business, and you can start at whichever step matters most.
        </p>
      </header>

      <section className="svc section" data-section="STEP 1 AUDIT" data-theme="light" id="reviews">
        <div className="svc-grid">
          <div className="svc-copy">
            <span className="step-chip">Step 1 · Audit</span>
            <IconGlass icon={SearchCheck} size="lg" />
            <h2>Internal Marketing Review</h2>
            <p>
              Before you spend another dollar, know where the current ones go. We audit your
              website, ads, tracking, call handling and follow-up end to end, then hand you a
              prioritised fix-list — whether or not you hire us to do the fixing.
            </p>
            <IncludedList
              items={[
                'Full audit of website, ads and tracking',
                'Call-handling and follow-up gap analysis',
                'Competitor snapshot for your service area',
                'Prioritised 90-day action plan, in plain English',
              ]}
            />
            <div className="svc-outcome">
              <strong>The outcome:</strong> you stop guessing — you know exactly where leads
              leak out of your funnel and what to fix first.
            </div>
            <Link to="/quote" className="text-link">
              Get a Quote <ChevronRight size={16} />
            </Link>
          </div>
          <div className="svc-visual svc-visual--pink" aria-hidden="true">
            <div className="mock-score">
              <div className="mock-score-row">
                <span>Website</span>
                <div className="mock-bar">
                  <i style={{ width: '72%' }} />
                </div>
                <em>72</em>
              </div>
              <div className="mock-score-row">
                <span>Ads</span>
                <div className="mock-bar">
                  <i style={{ width: '41%' }} />
                </div>
                <em>41</em>
              </div>
              <div className="mock-score-row">
                <span>Follow-up</span>
                <div className="mock-bar mock-bar--bad">
                  <i style={{ width: '18%' }} />
                </div>
                <em>18</em>
              </div>
              <div className="mock-note">← your leak is follow-up</div>
            </div>
          </div>
        </div>
      </section>

      <section className="svc section" data-section="STEP 2 BUILD" data-theme="light" id="marketing">
        <div className="svc-grid svc-grid--flip">
          <div className="svc-copy">
            <span className="step-chip">Step 2 · Build</span>
            <IconGlass icon={Megaphone} size="lg" />
            <h2>Marketing Services</h2>
            <p>
              Ads, landing pages, review engines and lead follow-up designed specifically
              for HVAC and roofing. We manage the campaigns, respond to leads fast, and
              report in the only numbers you care about: booked jobs, not impressions.
            </p>
            <IncludedList
              items={[
                'Google & Meta ad management for trades',
                'Faster lead response — minutes, not days',
                'Landing pages and offers that convert locals',
                'Review generation to own your suburb',
              ]}
            />
            <div className="svc-outcome">
              <strong>The outcome:</strong> a steadier pipeline with a lower cost per booked
              job — and a phone that keeps ringing between storms.
            </div>
            <Link to="/quote" className="text-link">
              Get a Quote <ChevronRight size={16} />
            </Link>
          </div>
          <div className="svc-visual svc-visual--purple" aria-hidden="true">
            <div className="mock-stats">
              <div className="mock-stat">
                <IconGlass icon={TrendingUp} size="xs" tone="#1d9e5f" />
                <strong>+38%</strong>
                <span>Qualified leads</span>
              </div>
              <div className="mock-stat">
                <IconGlass icon={TrendingDown} size="xs" tone="var(--blue)" />
                <strong>−22%</strong>
                <span>Cost per lead</span>
              </div>
              <div className="mock-stat">
                <IconGlass icon={Star} size="xs" tone="#d68f10" />
                <strong>4.8★</strong>
                <span>Review average</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="svc section" data-section="STEP 3 ANSWER" data-theme="light" id="ai-receptionist">
        <div className="svc-grid">
          <div className="svc-copy">
            <span className="step-chip">Step 3 · Answer</span>
            <IconGlass icon={PhoneCall} size="lg" />
            <h2>AI Receptionist</h2>
            <p>
              The step that makes the other two pay: a natural-sounding receptionist that
              answers every call in under ten seconds, 24 hours a day — nights, weekends,
              storm season. It qualifies the caller, answers the common questions, and books
              the job straight into your calendar.
            </p>
            <IncludedList
              items={[
                'Missed calls captured 24/7 — no voicemail, ever',
                'Answers in under 10 seconds, every call at once',
                'Books jobs directly into your calendar',
                'Instant SMS + email summaries after every call',
              ]}
            />
            <div className="svc-outcome">
              <strong>The outcome:</strong> after-hours and overflow calls stop leaking to
              competitors — they land in your calendar instead.
            </div>
            <Link to="/quote" className="text-link">
              Get a Quote <ChevronRight size={16} />
            </Link>
          </div>
          <div className="svc-visual svc-visual--blue" aria-hidden="true">
            <div className="mock-chat">
              <div className="mock-bubble mock-bubble--caller">
                “My AC died this arvo — any chance of someone this week?”
              </div>
              <div className="mock-bubble mock-bubble--vm">
                “Absolutely — I can get a tech out Thursday at 2 PM. Does that work?”
              </div>
              <div className="mock-booked">
                <IconGlass icon={Check} size="xs" tone="#1d9e5f" />
                Booked · Thu 2:00 PM
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section cta-section" data-section="NEXT STEP" data-theme="light">
        <div className="cta-band">
          <h2>Not sure which step you need first?</h2>
          <p>
            Tell us about your setup and we&rsquo;ll point you at the smallest thing that moves
            the needle. Most owners start with the phones and work backwards.
          </p>
          <div className="cta-band-actions">
            <Link to="/quote" className="button-primary">
              Get a Quote
            </Link>
            <Link to="/real-math" className="text-link text-link--lg">
              See the real math <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
