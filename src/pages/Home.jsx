import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  PhoneCall,
  Megaphone,
  SearchCheck,
  ChevronRight,
  PhoneForwarded,
  LineChart,
  Timer,
  CalendarClock,
  CircleDollarSign,
  ShieldCheck,
  Star,
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

const TESTIMONIALS = [
  {
    stars: 5,
    quote:
      'The phones used to ring out every time we were up on a roof. Now they don’t. The jobs just show up in the calendar.',
    initials: 'DR',
    color: '#0653b6',
    name: 'Dave R.',
    role: 'Northside Roofing',
    where: 'Melbourne, VIC',
  },
  {
    stars: 5,
    quote:
      'I had my doubts it’d sound right to customers. First week in, a regular told me the new girl on the desk was lovely. That was the AI.',
    initials: 'ST',
    color: '#1d7a4c',
    name: 'Sarah T.',
    role: 'ClimaCool Heating & Air',
    where: 'Brisbane, QLD',
  },
  {
    stars: 4,
    quote:
      'Took us a couple of days to get the script the way we wanted it. Since then it hasn’t missed a call. Worth the setup.',
    initials: 'JM',
    color: '#0e1b33',
    name: 'Josh M.',
    role: 'Apex Air Conditioning',
    where: 'Adelaide, SA',
  },
  {
    stars: 5,
    quote:
      'The marketing review paid for itself. They showed me exactly where I was wasting ad spend, and booked jobs are up since.',
    initials: 'MD',
    color: '#0653b6',
    name: 'Mick D.',
    role: 'Elite Roofing & Restoration',
    where: 'Perth, WA',
  },
  {
    stars: 4,
    quote:
      'Not the cheapest option we looked at. It’s the only one that actually books the job instead of just taking a message.',
    initials: 'RT',
    color: '#1d7a4c',
    name: 'Ryan T.',
    role: 'Coastline Roofing',
    where: 'Gold Coast, QLD',
  },
  {
    stars: 5,
    quote:
      'We book more after-hours jobs in a week now than we used to get in a month. No more voicemail tag.',
    initials: 'KP',
    color: '#0e1b33',
    name: 'Kate P.',
    role: 'Summit Heating & Cooling',
    where: 'Sydney, NSW',
  },
  {
    stars: 5,
    quote:
      'Customers can’t tell it isn’t a person. On the first test call, honestly, neither could I.',
    initials: 'AL',
    color: '#0653b6',
    name: 'Anna L.',
    role: 'FreshAir Climate Solutions',
    where: 'Newcastle, NSW',
  },
];

const REASONS = [
  {
    Icon: ShieldCheck,
    title: 'No lock-in contracts',
    text: 'Month-to-month on the phones, project-scoped on marketing. If it isn’t working, you walk.',
  },
  {
    Icon: PhoneForwarded,
    title: 'You keep your number',
    text: 'We forward your existing line. Nothing changes for your customers — the calls just start getting answered.',
  },
  {
    Icon: LineChart,
    title: 'Measured in booked jobs',
    text: 'Plain-English reporting on what matters: jobs booked and cost per job, not clicks and impressions.',
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
      gsap.from('.reason-card', {
        opacity: 0,
        y: 36,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '.reasons-grid', start: 'top 80%' },
      });
      gsap.from('.tm-card', {
        opacity: 0,
        y: 36,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: '.tm-grid', start: 'top 82%' },
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
          Most owners start with the phones and work backwards.
        </p>
        <div className="pillars-cta">
          <Link to="/quote" className="button-primary">
            Get a Quote
          </Link>
        </div>
      </section>

      <section className="quotes section" data-section="WHY VM" data-theme="light">
        <div className="section-head">
          <div className="eyebrow">Why VM</div>
          <h2>Straight with you, built for the trades.</h2>
        </div>
        <div className="reasons-grid quote-grid">
          {REASONS.map((r) => (
            <div key={r.title} className="reason-card quote-card">
              <IconGlass icon={r.Icon} size="sm" tone="var(--blue)" />
              <h3>{r.title}</h3>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="testimonials section" data-section="REVIEWS" data-theme="light">
        <div className="section-head">
          <div className="eyebrow">Reviews</div>
          <h2>What operators say.</h2>
        </div>
        <div className="tm-grid">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="tm-card">
              <div className="tm-stars" aria-label={`${t.stars} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    fill={i < t.stars ? 'currentColor' : 'none'}
                    strokeWidth={i < t.stars ? 0 : 1.5}
                  />
                ))}
              </div>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <span className="tm-avatar" style={{ background: t.color }}>
                  {t.initials}
                </span>
                <span className="tm-who">
                  <strong>{t.name}</strong>
                  <span>
                    {t.role} · {t.where}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="section cta-section" data-section="NEXT STEP" data-theme="light">
        <div className="cta-band">
          <h2>Stop paying for missed calls.</h2>
          <p>
            Tell us your call volume and current setup. You&rsquo;ll have a scoped quote
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
