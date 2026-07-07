import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  PhoneCall,
  Megaphone,
  SearchCheck,
  ChevronRight,
  Quote,
  Timer,
  CalendarClock,
  CircleDollarSign,
  ShieldCheck,
} from 'lucide-react';
import Hero from '../components/Hero.jsx';
import DemoSequence from '../components/DemoSequence.jsx';
import IconGlass from '../components/IconGlass.jsx';
import usePageMeta from '../lib/usePageMeta.js';

const NUMBERS = [
  { Icon: Timer, big: '<10s', small: 'median answer time' },
  { Icon: CalendarClock, big: '24/7/365', small: 'nights, weekends, storms' },
  { Icon: CircleDollarSign, big: '$0.09/min', small: 'AUD — no retainers' },
  { Icon: ShieldCheck, big: '30 days', small: 'money-back guarantee' },
];

const STEPS = [
  {
    tone: 'sand',
    step: 'Step 1 · Audit',
    Icon: SearchCheck,
    title: 'Internal Marketing Review',
    pitch:
      'Before you spend a dollar, we audit your website, ads, tracking and call handling — and hand you a fix-list in plain English. You see exactly where leads leak.',
  },
  {
    tone: 'blue',
    step: 'Step 2 · Build',
    Icon: Megaphone,
    title: 'Marketing Services',
    pitch:
      'Ads, landing pages and review engines built for the trades. We report in booked jobs — not impressions, not clicks.',
  },
  {
    tone: 'green',
    step: 'Step 3 · Answer',
    Icon: PhoneCall,
    title: 'AI Receptionist',
    pitch:
      'Every call the marketing generates gets answered in under 10 seconds, 24/7 — qualified, quoted, and booked into your calendar.',
  },
];

const QUOTES = [
  {
    text: 'Fourteen after-hours calls turned into booked jobs in our first month. Two of those were full system replacements.',
    name: 'Owner, HVAC service co.',
    where: 'Melbourne, VIC',
  },
  {
    text: 'The audit found about $1,900 a month of wasted ad spend in the first week. That alone paid for the whole year.',
    name: 'Director, roofing company',
    where: 'Brisbane, QLD',
  },
  {
    text: 'Customers can’t tell it isn’t our front desk. I rang it myself to test it — honestly, neither could I.',
    name: 'GM, heating & cooling',
    where: 'Sydney, NSW',
  },
];

export default function Home() {
  usePageMeta(
    'VM Solutions — 24/7 AI Receptionist & Marketing for HVAC + Roofing',
    'Every call answered in under 10 seconds, 24/7. AI receptionist, trade-specific marketing and honest marketing audits for HVAC and roofing businesses across Australia.'
  );
  const rootRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.trust-item', {
        opacity: 0,
        y: 26,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.08,
        clearProps: 'all',
        scrollTrigger: { trigger: '.trustbar', start: 'top 88%' },
      });
      gsap.from('.pillar-card', {
        opacity: 0,
        y: 44,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.12,
        clearProps: 'transform',
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

      <section className="trustbar" data-section="NUMBERS" data-theme="light">
        <div className="trustbar-inner">
          {NUMBERS.map((n) => (
            <div key={n.big} className="trust-item">
              <IconGlass icon={n.Icon} size="xs" tone="var(--blue)" />
              <div>
                <strong>{n.big}</strong>
                <span>{n.small}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pillars section" data-section="THE SYSTEM" data-theme="light">
        <div className="section-head">
          <div className="eyebrow">The system</div>
          <h2>Audit. Build. Answer.</h2>
          <p>
            Three services that only make sense in order: find the leaks, fill the pipeline,
            then make sure every call it generates actually gets picked up.
          </p>
        </div>
        <div className="pillar-grid">
          {STEPS.map((p) => (
            <article key={p.title} className={`pillar-card pillar-card--${p.tone}`}>
              <span className="step-chip">{p.step}</span>
              <IconGlass icon={p.Icon} size="lg" />
              <h3>{p.title}</h3>
              <p>{p.pitch}</p>
              <Link to="/services" className="text-link">
                Learn more <ChevronRight size={16} />
              </Link>
            </article>
          ))}
        </div>
        <p className="pillars-note">
          Start anywhere — most owners start with the phones and work backwards.
        </p>
        <div className="pillars-cta">
          <Link to="/quote" className="button-primary">
            Get a Quote
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
        <p className="quotes-note">
          Anonymous here on purpose — ask us and we&rsquo;ll put you on the phone with them.
        </p>
      </section>

      <section className="section cta-section" data-section="NEXT STEP" data-theme="light">
        <div className="cta-band">
          <h2>Stop paying for missed calls.</h2>
          <p>
            Tell us your call volume and where it hurts. You&rsquo;ll have a scoped quote
            within two business days — backed by a 30-day money-back guarantee.
          </p>
          <div className="cta-band-actions">
            <Link to="/quote" className="button-primary">
              Get a Quote
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
