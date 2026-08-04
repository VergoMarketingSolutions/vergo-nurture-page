import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, CheckCircle2 } from 'lucide-react';

// Fires a beat after landing. Kept as a named constant because 3s is
// deliberately aggressive — this is the single number to raise if it
// starts reading as pushy rather than cheeky.
const DELAY_MS = 3000;
const STORAGE_KEY = 'vm.popup.dismissedAt';
const REMEMBER_DAYS = 7;

// The headline value claim, in one place. It's a quantified figure shown to
// customers, so it needs to stay defensible — change or drop it here rather
// than hunting through markup.
const COURSE_VALUE = '$1,000';

// Where captured emails go.
//
// This posts to the same FormSubmit inbox alias the quote form uses, so
// signups land somewhere real from day one instead of being dropped. It does
// NOT send the drip sequence — FormSubmit only forwards to an inbox. To turn
// the 6-email course on, swap this one URL for your email platform's form
// endpoint (MailerLite/Brevo/ConvertKit all give you one) and the sequence
// runs from their side. See docs/email-course.md.
const SIGNUP_ENDPOINT = 'https://formsubmit.co/ajax/574fc98c40eb790b4c806754b487c034';

// Someone already filling in the quote form does not need a popup.
const SKIP_ROUTES = ['/quote'];

// Module-level so a route change mid-visit can't queue a second timer and
// pop the dialog in someone's face while they're navigating.
let scheduled = false;

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const dismissedRecently = () => {
  try {
    const ts = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(ts) && ts > 0 && Date.now() - ts < REMEMBER_DAYS * 86400000;
  } catch {
    // private mode / storage blocked — treat as "not dismissed" rather than throwing
    return false;
  }
};

export default function IntroPopup() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [hasMeme, setHasMeme] = useState(true);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const returnFocusRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* nothing to do — it just shows again next visit */
    }
  }, []);

  useEffect(() => {
    if (scheduled) return undefined;
    if (SKIP_ROUTES.includes(pathname)) return undefined;
    if (dismissedRecently()) return undefined;
    scheduled = true;
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    returnFocusRef.current = document.activeElement;

    // Lenis owns the scroll position on this site, so overflow:hidden alone
    // doesn't stop the page moving behind the dialog.
    const lenis = window.__lenis;
    if (lenis) lenis.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key !== 'Tab') return;
      const focusables = panelRef.current?.querySelectorAll(
        'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      if (lenis) lenis.start();
      returnFocusRef.current?.focus?.();
    };
  }, [open, close]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const value = email.trim();
    if (!value) {
      setError('Pop your email in first.');
      return;
    }
    if (!emailOk(value)) {
      setError('That email doesn’t look right.');
      return;
    }
    setError('');
    setSending(true);
    try {
      const res = await fetch(SIGNUP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: `AI SEO course signup — ${value}`,
          _template: 'table',
          _captcha: 'false',
          Email: value,
          'Signed up for': 'Free AI SEO course for HVAC & roofing (6-part email series)',
          Source: 'Site popup',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || String(data.success) === 'false') {
        throw new Error(data.message || `Request failed (${res.status})`);
      }
      setSent(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        /* non-fatal */
      }
    } catch {
      setError(
        'Couldn’t send that just now. Try again, or email us at vergomarketingsolutions@gmail.com.'
      );
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="pop-backdrop" onClick={close}>
      <div
        className="pop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pop-title"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="pop-close"
          onClick={close}
          aria-label="Close"
          ref={closeRef}
        >
          <X size={18} strokeWidth={2.4} />
        </button>

        {sent ? (
          <div className="pop-done">
            <CheckCircle2 size={44} strokeWidth={2} />
            <h2 id="pop-title" className="pop-title">
              You&rsquo;re in.
            </h2>
            <p className="pop-sub">
              Part one is on its way to <strong>{email.trim()}</strong>. Six short lessons, one at
              a time — no 90-minute webinar, no pitch deck.
            </p>
            <button type="button" className="pop-cta pop-cta--ghost" onClick={close}>
              Back to the site
            </button>
          </div>
        ) : (
          <>
            <span className="pop-flag">Free · {COURSE_VALUE} value</span>
            <h2 id="pop-title" className="pop-title">
              Stop sending the apprentice
              <br />
              <span className="pop-title-hl">for imaginary tools.</span>
            </h2>
            <p className="pop-sub">
              Six short emails on getting your HVAC or roofing business found in AI search —
              ChatGPT, Google&rsquo;s AI answers, the lot. Written for people on the tools, not
              marketers.
            </p>

            {hasMeme && (
              <img
                className="pop-meme"
                src="/popup-meme.gif"
                alt="Tradie in a hard hat waving off “actually training the apprentice” and giving the thumbs up to “sending them to get imaginary tools”."
                onError={() => setHasMeme(false)}
              />
            )}

            <form className="pop-form" onSubmit={onSubmit} noValidate>
              <label className="pop-label" htmlFor="pop-email">
                Where should we send it?
              </label>
              <input
                id="pop-email"
                type="email"
                className={`pop-input${error ? ' pop-input--error' : ''}`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                placeholder="you@business.com.au"
                autoComplete="email"
              />
              {error && (
                <span className="pop-error" role="alert">
                  {error}
                </span>
              )}
              <button type="submit" className="pop-cta" disabled={sending}>
                {sending ? 'Sending…' : `Send me the free course`}
              </button>
            </form>

            <p className="pop-fine">
              Six emails, then we leave you alone unless you want more. Unsubscribe any time, and
              we don&rsquo;t sell your details.{' '}
              <Link to="/legal#privacy" onClick={close}>
                See Legal
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}
