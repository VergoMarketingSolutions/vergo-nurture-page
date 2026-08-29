import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, CheckCircle2 } from 'lucide-react';

// Fires a beat after landing. Kept as a named constant because 3s is
// deliberately aggressive — this is the single number to raise if it
// starts reading as pushy rather than cheeky.
const DELAY_MS = 3000;
const STORAGE_KEY = 'vm.popup.dismissed';

// The headline value claim, in one place. It's a quantified figure shown to
// customers, so it needs to stay defensible — change or drop it here rather
// than hunting through markup.
const COURSE_VALUE = '$1,000';

// Drop the meme into public/ named "popup-meme" with any of these extensions
// and it just works — no need to convert a screenshot to a specific format
// to match a hardcoded filename. Tried in order; the <img> removes itself
// entirely if none of them exist.
const MEME_SOURCES = [
  '/popup-meme.gif',
  '/popup-meme.png',
  '/popup-meme.jpg',
  '/popup-meme.jpeg',
  '/popup-meme.webp',
];

// MailerLite embedded-form endpoint for the "AI SEO course" group. Signups
// land in that group, which is what triggers the drip automation.
//
// It expects form-encoded `fields[email]`, NOT JSON — posting JSON here gets a
// "The email field is required" error back. It replies 200 with
// {"success":false,...} on validation failures, so the response body has to be
// checked rather than just the status code.
//
// Verified it sends `access-control-allow-origin: *`, so the browser can post
// to it directly and no serverless proxy is needed. See docs/email-course.md.
const SIGNUP_ENDPOINT =
  'https://assets.mailerlite.com/jsonp/2556825/forms/194928629535213309/subscribe';

// Someone already filling in the quote form does not need a popup.
const SKIP_ROUTES = ['/quote'];

// Module-level so a route change mid-visit can't queue a second timer and
// pop the dialog in someone's face while they're navigating.
let scheduled = false;

const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const isDismissed = () => {
  try {
    return Boolean(window.sessionStorage.getItem(STORAGE_KEY));
  } catch {
    // private mode / storage blocked — treat as "not dismissed" rather than throwing
    return false;
  }
};

export default function IntroPopup() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [memeIndex, setMemeIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const returnFocusRef = useRef(null);

  const close = useCallback(() => {
    setOpen(false);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* nothing to do — it just shows again next visit */
    }
  }, []);

  useEffect(() => {
    if (scheduled) return undefined;
    if (SKIP_ROUTES.includes(pathname)) return undefined;
    if (isDismissed()) return undefined;
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
    const phoneValue = phone.trim();
    // Optional, so an empty box is fine — but a number with too few digits to
    // ever be callable is almost certainly a typo, and silently storing it
    // means finding out when someone tries to ring it.
    if (phoneValue && phoneValue.replace(/\D/g, '').length < 8) {
      setError('That phone number looks too short — or leave it blank.');
      return;
    }
    setError('');
    setSending(true);
    try {
      const body = new URLSearchParams();
      body.set('fields[email]', value);
      if (phoneValue) body.set('fields[phone]', phoneValue);
      body.set('ml-submit', '1');
      body.set('anticsrf', 'true');

      const res = await fetch(SIGNUP_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      // MailerLite answers 200 even for validation failures, so the body has
      // to be inspected — status alone would report a rejected signup as fine.
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) {
        const field = data?.errors?.fields?.email?.[0];
        throw new Error(field || `Request failed (${res.status})`);
      }
      setSent(true);
      try {
        window.sessionStorage.setItem(STORAGE_KEY, '1');
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

            {memeIndex < MEME_SOURCES.length && (
              <img
                className="pop-meme"
                src={MEME_SOURCES[memeIndex]}
                alt="Tradie in a hard hat waving off “actually training the apprentice” and giving the thumbs up to “sending them to get imaginary tools”."
                onError={() => setMemeIndex((i) => i + 1)}
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

              <label className="pop-label pop-label--optional" htmlFor="pop-phone">
                Phone <span>optional</span>
              </label>
              <input
                id="pop-phone"
                type="tel"
                className="pop-input"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (error) setError('');
                }}
                placeholder="04xx xxx xxx"
                autoComplete="tel"
                inputMode="tel"
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
