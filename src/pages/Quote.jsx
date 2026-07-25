import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PhoneCall,
  Megaphone,
  SearchCheck,
  CheckCircle2,
  PhoneOutgoing,
  MessagesSquare,
  FileCheck2,
  Mail,
  Phone,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import IconGlass from '../components/IconGlass.jsx';
import { SpotsPill, SpotsNote } from '../components/Scarcity.jsx';
import { SPOTS_LEFT, INTAKE_MONTH } from '../lib/availability.js';
import usePageMeta from '../lib/usePageMeta.js';

const SERVICES = [
  { id: 'receptionist', label: 'AI Receptionist', Icon: PhoneCall },
  { id: 'marketing', label: 'Marketing Services', Icon: Megaphone },
  { id: 'review', label: 'Internal Marketing Review', Icon: SearchCheck },
];

const VOLUMES = ['Under 50 / month', '50–200 / month', '200–500 / month', '500+ / month', 'Not sure yet'];

const FAQS = [
  {
    q: 'Do I need to sign a long contract?',
    a: 'No. The AI receptionist is month-to-month, and marketing engagements are scoped per project. If it isn’t earning its keep, you walk.',
  },
  {
    q: 'What happens to my existing phone number?',
    a: 'Nothing changes for your customers. We forward missed or after-hours calls from your existing number — you keep it, we just make sure it always gets answered.',
  },
  {
    q: 'Can the AI actually book jobs, or just take messages?',
    a: 'It books real jobs into your calendar — checking availability, confirming with the caller, and sending you a summary the moment the call ends.',
  },
  {
    q: 'Which areas do you serve?',
    a: 'We work with HVAC and roofing businesses across Australia. The receptionist works anywhere; marketing engagements are scoped to your service area.',
  },
];

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

export default function Quote() {
  usePageMeta(
    'Request a Quote | VM Solutions',
    'Tell us your call volume and current setup. A scoped quote within two business days — no lock-in, backed by a 30-day money-back guarantee.'
  );
  const [values, setValues] = useState({
    business: '',
    contact: '',
    email: '',
    phone: '',
    services: [],
    volume: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const set = (k, v) => {
    setValues((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const toggleService = (id) => {
    setValues((s) => ({
      ...s,
      services: s.services.includes(id) ? s.services.filter((x) => x !== id) : [...s.services, id],
    }));
    setErrors((e) => ({ ...e, services: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!values.business.trim()) e.business = 'Business name is required.';
    if (!values.contact.trim()) e.contact = 'Contact name is required.';
    if (!values.email.trim()) e.email = 'Email is required.';
    else if (!emailOk(values.email.trim())) e.email = 'That email doesn’t look right.';
    if (!values.phone.trim()) e.phone = 'Phone number is required.';
    if (values.services.length === 0) e.services = 'Pick at least one service.';
    return e;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (sending) return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSending(true);
    setSendError('');
    const serviceLabels = values.services
      .map((id) => SERVICES.find((s) => s.id === id)?.label)
      .filter(Boolean)
      .join(', ');
    try {
      // FormSubmit alias for the business inbox — keeps the raw address out of the bundle
      const res = await fetch('https://formsubmit.co/ajax/574fc98c40eb790b4c806754b487c034', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `New quote request — ${values.business.trim()}`,
          _template: 'table',
          _captcha: 'false',
          'Business name': values.business.trim(),
          'Contact name': values.contact.trim(),
          'Email': values.email.trim(),
          'Phone': values.phone.trim(),
          'Services interested in': serviceLabels,
          'Monthly call/lead volume': values.volume || 'Not specified',
          'Message': values.message.trim() || '—',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) === 'false') {
        throw new Error(data.message || `Request failed (${res.status})`);
      }
      setSent(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setSendError(
        'Something went wrong sending your request. Please try again, or call us on 0481 813 435 / email vergomarketingsolutions@gmail.com directly.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <header className="page-head section" data-section="QUOTE" data-theme="light">
        <div className="eyebrow">Request a quote</div>
        <h1>Tell us about your business.</h1>
        <p>
          No checkout, no card, no lock-in. Send us a few details and we&rsquo;ll come back
          with a scoped quote, usually within two business days.
        </p>
        <SpotsPill className="spots-pill--head" />
      </header>

      <section className="section quote-section" data-section="THE FORM" data-theme="light">
        <div className="qform-grid">
          {sent ? (
            <div className="quote-card-form quote-success">
              <IconGlass icon={CheckCircle2} size="lg" tone="#1d9e5f" />
              <h2>Request received.</h2>
              <p>
                Thanks{values.contact.trim() ? `, ${values.contact.split(' ')[0]}` : ''} — your
                request is in. Someone from VM Solutions will call {values.phone} within one
                business day to talk it through.
              </p>
              <Link to="/" className="button-primary">
                Back to Home
              </Link>
            </div>
          ) : (
            <form className="quote-card-form" onSubmit={onSubmit} noValidate>
              <div className="form-row">
                <div className={`field${errors.business ? ' field--error' : ''}`}>
                  <label htmlFor="business">Business name *</label>
                  <input
                    id="business"
                    type="text"
                    value={values.business}
                    onChange={(e) => set('business', e.target.value)}
                    placeholder="e.g. Apex Roofing Co"
                  />
                  {errors.business && <span className="field-error">{errors.business}</span>}
                </div>
                <div className={`field${errors.contact ? ' field--error' : ''}`}>
                  <label htmlFor="contact">Contact name *</label>
                  <input
                    id="contact"
                    type="text"
                    value={values.contact}
                    onChange={(e) => set('contact', e.target.value)}
                    placeholder="Your name"
                  />
                  {errors.contact && <span className="field-error">{errors.contact}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className={`field${errors.email ? ' field--error' : ''}`}>
                  <label htmlFor="email">Email *</label>
                  <input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="you@business.com.au"
                  />
                  {errors.email && <span className="field-error">{errors.email}</span>}
                </div>
                <div className={`field${errors.phone ? ' field--error' : ''}`}>
                  <label htmlFor="phone">Phone *</label>
                  <input
                    id="phone"
                    type="tel"
                    value={values.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    placeholder="04xx xxx xxx"
                  />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
              </div>

              <div className={`field${errors.services ? ' field--error' : ''}`}>
                <span className="field-label">Services you&rsquo;re interested in *</span>
                <div className="service-picks">
                  {SERVICES.map(({ id, label, Icon }) => (
                    <label
                      key={id}
                      className={`service-pick${values.services.includes(id) ? ' is-picked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={values.services.includes(id)}
                        onChange={() => toggleService(id)}
                      />
                      <IconGlass icon={Icon} size="xs" />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
                {errors.services && <span className="field-error">{errors.services}</span>}
              </div>

              <div className="field">
                <label htmlFor="volume">Rough monthly call / lead volume</label>
                <select id="volume" value={values.volume} onChange={(e) => set('volume', e.target.value)}>
                  <option value="">Select a range (optional)</option>
                  {VOLUMES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="message">Anything else we should know?</label>
                <textarea
                  id="message"
                  rows={4}
                  value={values.message}
                  onChange={(e) => set('message', e.target.value)}
                  placeholder="Current setup, busy season, what’s not working…"
                />
              </div>

              <SpotsNote>
                You&rsquo;re requesting one of the {SPOTS_LEFT} remaining {INTAKE_MONTH} spots.
                Requests are worked in the order they land.
              </SpotsNote>
              <button type="submit" className="button-primary quote-submit" disabled={sending}>
                {sending ? 'Sending…' : 'Claim My Spot'}
              </button>
              {sendError && <p className="form-senderror">{sendError}</p>}
              <p className="form-guarantee">
                <ShieldCheck size={16} strokeWidth={2.2} />
                Risk-free — every engagement is backed by our 30-day money-back guarantee.
              </p>
              <p className="form-fineprint">Lead capture only — no payment details, ever.</p>
            </form>
          )}

          <aside className="quote-aside">
            <div className="aside-card">
              <h3>What happens next</h3>
              <div className="aside-step">
                <IconGlass icon={PhoneOutgoing} size="sm" />
                <div>
                  <strong>1 · We call you back</strong>
                  <span>Within one business day, from a real person.</span>
                </div>
              </div>
              <div className="aside-step">
                <IconGlass icon={MessagesSquare} size="sm" />
                <div>
                  <strong>2 · A 20-minute scope chat</strong>
                  <span>Call volume, service area, current setup.</span>
                </div>
              </div>
              <div className="aside-step">
                <IconGlass icon={FileCheck2} size="sm" />
                <div>
                  <strong>3 · Your quote, in writing</strong>
                  <span>Scoped to your business within two business days.</span>
                </div>
              </div>
            </div>
            <div className="aside-card">
              <h3>Rather just talk?</h3>
              <a href="tel:+61481813435" className="aside-contact">
                <IconGlass icon={Phone} size="xs" />
                <span>0481 813 435</span>
              </a>
              <a href="mailto:vergomarketingsolutions@gmail.com" className="aside-contact">
                <IconGlass icon={Mail} size="xs" />
                <span>vergomarketingsolutions@gmail.com</span>
              </a>
            </div>
          </aside>
        </div>
      </section>

      <section className="section" data-section="FAQ" data-theme="light">
        <div className="section-head">
          <div className="eyebrow">FAQ</div>
          <h2>Common questions, answered.</h2>
        </div>
        <div className="faq">
          {FAQS.map((f) => (
            <details key={f.q} className="faq-item">
              <summary>
                {f.q}
                <ChevronDown size={18} className="faq-chev" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
