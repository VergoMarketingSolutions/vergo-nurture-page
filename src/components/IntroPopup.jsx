import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

// Fires a beat after landing. Kept as a named constant because 3s is
// deliberately aggressive — this is the single number to raise if it
// starts reading as pushy rather than cheeky.
const DELAY_MS = 3000;
const STORAGE_KEY = 'vm.popup.dismissedAt';
const REMEMBER_DAYS = 7;

// Someone already filling in the quote form does not need a popup telling
// them to fill in the quote form.
const SKIP_ROUTES = ['/quote'];

// Module-level so a route change mid-visit can't queue a second timer and
// pop the dialog in someone's face while they're navigating.
let scheduled = false;

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
      // keep focus inside the dialog while it's modal
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
        <button type="button" className="pop-close" onClick={close} aria-label="Close" ref={closeRef}>
          <X size={18} strokeWidth={2.4} />
        </button>

        <h2 id="pop-title" className="pop-title">
          Hang on a tick.
        </h2>
        <p className="pop-sub">
          While you&rsquo;re weighing it up, the phone&rsquo;s still ringing out to someone else.
          Two minutes to tell us your call volume, and you&rsquo;ll get a straight answer back —
          including &ldquo;you don&rsquo;t need us yet&rdquo; if that&rsquo;s the honest one.
        </p>

        {hasMeme && (
          <img
            className="pop-meme"
            src="/popup-meme.jpg"
            alt="Tradie in a hard hat waving off “actually training the apprentice” and giving the thumbs up to “sending them to get imaginary tools”."
            onError={() => setHasMeme(false)}
          />
        )}

        <Link to="/quote" className="pop-cta" onClick={close}>
          Get my quote
        </Link>
        <p className="pop-fine">
          No spam, and we don&rsquo;t sell your details.{' '}
          <Link to="/legal#privacy" onClick={close}>
            See Legal
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
