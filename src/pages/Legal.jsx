import { useEffect } from 'react';
import usePageMeta from '../lib/usePageMeta.js';

// Clears the fixed announcement bar + floating nav so an anchored heading
// doesn't land underneath them.
const ANCHOR_OFFSET = 140;

// Section list drives both the desktop table of contents and the rendered
// bodies, so an id can never drift between the nav and the heading it targets.
const SECTIONS = [
  {
    id: 'terms-of-service',
    title: 'Terms of Service',
    body: [
      'This site describes VM Solutions’ services — advertising management, the AI Receptionist service, and Internal Marketing Review — for general informational purposes. Nothing on this site, including any example, case study, testimonial, projected outcome, or pricing reference, is a binding offer, warranty, or contractual term. The actual terms of your engagement are set out exclusively in the Service Agreement you sign at the time of purchase.',
      'Examples, case studies, and testimonials shown on this site reflect specific past clients’ individual circumstances. They’re illustrative only and aren’t a guarantee of the results any particular business will achieve.',
    ],
  },
  {
    id: 'refund-policy',
    title: 'Refund Policy',
    body: [
      'VM Solutions may offer a 30-day money-back guarantee on eligible services, most commonly the AI Receptionist component of a Package.',
      'Eligibility, scope, and any exclusions — for example, advertising spend already committed to ad platforms, third-party API or usage costs, and work already delivered at the time a refund is requested — are determined case by case and are set out in the Service Agreement you sign at the time of purchase. Refund terms can differ between clients depending on the Package purchased and the specific Service Agreement signed.',
      'If anything on this page differs from your signed Service Agreement, your Service Agreement governs. To request a refund, contact us in writing within 30 days of the relevant charge, referencing your signed Service Agreement.',
    ],
  },
  {
    id: 'website-content-disclaimer',
    title: 'Website Content Disclaimer',
    body: [
      'To the maximum extent permitted by law, this site and its content are provided “as is” without warranties of any kind, whether express or implied, including as to accuracy, completeness, or fitness for a particular purpose. We exclude liability for loss arising from reliance on content published on this site, except to the extent that liability cannot lawfully be excluded — including any consumer guarantee or protection against misleading or deceptive conduct that applies under the Australian Consumer Law.',
    ],
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    body: [
      'All content on this site — including text, graphics, logos, and the VM Solutions name and branding — is owned by or licensed to Company and may not be copied, reproduced, or used without our prior written consent, other than for personal, non-commercial reference.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    body: [
      'If you contact us through this site, we collect the information you provide (such as your name, email, and message) to respond to your enquiry. We don’t sell your information to third parties.',
      'A full Privacy Policy covering all data this site collects — including any analytics, cookies, or call-handling data — is in preparation. Contact us at the email below with any questions in the meantime.',
    ],
  },
  {
    id: 'governing-law',
    title: 'Governing Law',
    body: ['This page and your use of this site are governed by the laws of the State of Victoria, Australia.'],
  },
  {
    id: 'contact',
    title: 'Contact',
    body: ['Questions about any of the above can be directed to:'],
    contact: true,
  },
];

export default function Legal() {
  usePageMeta(
    'Legal | VM Solutions',
    'Terms of Service, refund policy, and related legal information for VM Solutions (Vergo Marketing Solutions Pty Ltd).'
  );

  // Deep links to a section have to survive two things the rest of the site
  // does: App.jsx force-scrolls to the top on every route change, and Lenis
  // owns the scroll position and settles over several frames. On a cold load
  // one deferred scroll is enough, but arriving via a client-side <Link> races
  // both — so re-assert over a short window, and stop as soon as we're there.
  useEffect(() => {
    let timers = [];

    const settleTo = (el) => {
      const target = el.getBoundingClientRect().top + window.scrollY - ANCHOR_OFFSET;
      if (Math.abs(window.scrollY - target) < 8) return true;
      if (window.__lenis) {
        window.__lenis.scrollTo(target, { immediate: true });
      } else {
        window.scrollTo({ top: target });
      }
      return false;
    };

    const goToHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const el = document.getElementById(id);
      if (!el) return;
      timers.forEach(clearTimeout);
      // plain timeouts, not rAF: rAF is paused while the tab is hidden, which
      // would strand a background-opened deep link at the top of the page
      timers = [0, 60, 160, 320].map((d) => setTimeout(() => settleTo(el), d));
    };

    goToHash();
    window.addEventListener('hashchange', goToHash);
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener('hashchange', goToHash);
    };
  }, []);

  return (
    <div className="page legal-page" data-section="LEGAL" data-theme="light">
      <div className="legal-shell">
        <nav className="legal-toc" aria-label="On this page">
          <h2 className="legal-toc-title" id="on-this-page">
            On this page
          </h2>
          <ul>
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="legal-doc">
          <h1>Legal</h1>
          <p className="legal-updated">
            <em>Last updated: 28 July 2026</em>
          </p>
          <p className="legal-lede">
            This page covers the Terms of Service, refund policy, and related legal information
            for vergosolutions.com.au, operated by Vergo Marketing Solutions Pty Ltd,
            trading as &ldquo;VM Solutions&rdquo; (&ldquo;Company&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;). By using this site you agree to what&rsquo;s below. Where anything
            on this page differs from the Service Agreement you sign when you purchase a Package,
            your Service Agreement governs.
          </p>

          {SECTIONS.map((s) => (
            <section className="legal-section" key={s.id}>
              <h2 id={s.id}>{s.title}</h2>
              {s.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
              {s.contact && (
                <ul className="legal-contact">
                  <li>
                    <span>Email</span>
                    <a href="mailto:vergomarketingsolutions@gmail.com">
                      vergomarketingsolutions@gmail.com
                    </a>
                  </li>
                  <li>
                    <span>Phone</span>
                    <a href="tel:+61481813435">0481 813 435</a>
                  </li>
                  <li>
                    <span>Post</span>
                    <span className="legal-contact-plain">
                      Vergo Marketing Solutions Pty Ltd, Melbourne, Victoria, Australia
                    </span>
                  </li>
                </ul>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
