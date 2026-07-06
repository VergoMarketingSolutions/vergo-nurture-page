import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PhoneCall, Megaphone, SearchCheck, ChevronRight, Quote } from 'lucide-react';
import Hero from '../components/Hero.jsx';
import DemoSequence from '../components/DemoSequence.jsx';
import IconGlass from '../components/IconGlass.jsx';

const PILLARS = [
  {
    tone: 'blue',
    Icon: PhoneCall,
    title: 'AI Receptionist',
    pitch:
      'A voice that answers every call in seconds — qualifying, quoting and booking jobs while your crew stays on the tools.',
  },
  {
    tone: 'purple',
    Icon: Megaphone,
    title: 'Marketing Services',
    pitch:
      'Campaigns, ads and follow-up built for the trades — so the phone that never misses also never stops ringing.',
  },
  {
    tone: 'pink',
    Icon: SearchCheck,
    title: 'Internal Marketing Reviews',
    pitch:
      'An honest audit of your current marketing — what’s working, what’s leaking money, and what to fix first.',
  },
];

const TRADES = [
  'Apex Roofing Co',
  'Northside HVAC',
  'Summit Air & Heat',
  'Redline Roofing',
  'Bayside Climate',
  'Ironbark Exteriors',
  'True North Air',
  'Eagle Ridge Roofing',
];

const QUOTES = [
  {
    text: 'We used to lose after-hours calls every single week. Now they turn into booked jobs before I’ve even seen the missed-call log.',
    name: 'Owner, roofing company',
    where: 'Melbourne, VIC',
  },
  {
    text: 'The marketing review paid for itself in a month — they found where the leads were leaking and plugged it.',
    name: 'Director, HVAC service business',
    where: 'Brisbane, QLD',
  },
  {
    text: 'It genuinely sounds like someone at our front desk. Customers have no idea, and honestly, neither did I on the first test call.',
    name: 'GM, heating & cooling',
    where: 'Sydney, NSW',
  },
];

export default function Home() {
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.pillar-card', {
        opacity: 0,
        y: 44,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: { trigger: '.pillar-grid', start: 'top 78%' },
      });
      gsap.from('.quote-card', {
        opacity: 0,
        y: 36,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '.quote-grid', start: 'top 80%' },
      });
      gsap.from('.cta-band', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.cta-band', start: 'top 85%' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef}>
      <Hero />
      <DemoSequence />

      <div className="marquee" data-section="TRADES" data-theme="light" aria-hidden="true">
        <span className="marquee-label">Built for businesses like yours</span>
        <div className="marquee-window">
          <div className="marquee-track">
            {[...TRADES, ...TRADES].map((t, i) => (
              <span key={i} className="marquee-item">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <section className="pillars section" data-section="SERVICES" data-theme="light">
        <div className="section-head">
          <div className="eyebrow">What we do</div>
          <h2>Three ways we keep your pipeline full.</h2>
          <p>
            One partner across the whole journey — from the first ring to the review that
            tells you where the next job is coming from.
          </p>
        </div>
        <div className="pillar-grid">
          {PILLARS.map((p) => (
            <article key={p.title} className={`pillar-card pillar-card--${p.tone}`}>
              <IconGlass icon={p.Icon} size="lg" />
              <h3>{p.title}</h3>
              <p>{p.pitch}</p>
              <Link to="/services" className="text-link">
                Learn more <ChevronRight size={16} />
              </Link>
            </article>
          ))}
        </div>
        <div className="pillars-cta">
          <Link to="/quote" className="button-primary">
            Request a Quote
          </Link>
        </div>
      </section>

      <section className="quotes section" data-section="PROOF" data-theme="light">
        <div className="section-head">
          <div className="eyebrow">From the field</div>
          <h2>Operators who stopped losing calls.</h2>
        </div>
        <div className="quote-grid">
          {QUOTES.map((q) => (
            <figure key={q.name} className="quote-card">
              <IconGlass icon={Quote} size="sm" />
              <blockquote>{q.text}</blockquote>
              <figcaption>
                <strong>{q.name}</strong>
                <span>{q.where}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section cta-section" data-section="NEXT STEP" data-theme="light">
        <div className="cta-band">
          <h2>
            Stop letting jobs go to voicemail.
          </h2>
          <p>
            Tell us about your business and call volume — we&rsquo;ll scope it and come back
            with a quote within two business days.
          </p>
          <div className="cta-band-actions">
            <Link to="/quote" className="button-primary">
              Request a Quote
            </Link>
            <Link to="/compare" className="text-link text-link--lg">
              See the cost comparison <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
