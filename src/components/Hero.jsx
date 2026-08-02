import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { PhoneIncoming, CalendarCheck2 } from 'lucide-react';

export default function Hero() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return undefined;
    const q = (sel) => wrap.querySelector(sel);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 640px)').matches;

    // --- starfield (fewer + dimmer on small screens) ---
    const stars = q('#stars');
    const count = isMobile ? 34 : 84;
    let frag = '';
    for (let i = 0; i < count; i++) {
      const x = (Math.random() * 1440).toFixed(1);
      const y = (Math.random() * 430).toFixed(1);
      const r = (0.5 + Math.random() * 1.25).toFixed(2);
      const o = (0.25 + Math.random() * 0.6).toFixed(2);
      const d = (Math.random() * 6).toFixed(2);
      frag += `<circle cx="${x}" cy="${y}" r="${r}" opacity="${o}" style="--tw:${d}s"/>`;
    }
    stars.innerHTML = frag;

    // --- film grain: one baked noise tile (a live feTurbulence stalls paint) ---
    const grain = wrap.querySelector('.grain');
    if (grain && !grain.style.backgroundImage) {
      const c = document.createElement('canvas');
      c.width = c.height = 180;
      const ctx = c.getContext('2d');
      const img = ctx.createImageData(180, 180);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (114 + Math.random() * 28) | 0;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      grain.style.backgroundImage = `url(${c.toDataURL()})`;
    }

    // --- the live call: ring -> answered -> booked, looping ---
    const call = {
      card: q('[data-el="card"]'),
      status: q('[data-call="status"]'),
      wave: q('[data-call="wave"]'),
      line: q('[data-call="line"]'),
      booked: q('[data-call="booked"]'),
    };
    if (reduced) {
      call.card.classList.add('is-answered');
      call.status.textContent = 'Answered · VM receptionist';
      return undefined;
    }

    gsap.set([call.line, call.booked], { opacity: 0, y: 10 });
    gsap.set(call.wave, { opacity: 0 });
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 0.5 });
    tl.call(() => {
      call.card.classList.remove('is-answered');
      call.status.textContent = 'Incoming call…';
    })
      .to({}, { duration: 0.8 })
      .call(() => {
        call.card.classList.add('is-answered');
        call.status.textContent = 'Answered · VM receptionist';
      })
      .to(call.wave, { opacity: 1, duration: 0.25 })
      .to(call.line, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, '<0.15')
      .to(call.booked, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.8)' }, '+=0.9')
      .to({}, { duration: 2.0 })
      .to([call.wave, call.line, call.booked], { opacity: 0, duration: 0.45 })
      .set([call.line, call.booked], { y: 10 });

    return () => tl.kill();
  }, []);

  return (
    <div className="hero-wrap" ref={wrapRef} data-section="HERO" data-theme="dark">
      <div className="hero-sticky">
        <svg
          className="scene"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#050a16" />
              <stop offset="26%" stopColor="#0a1a36" />
              <stop offset="48%" stopColor="#0f3059" />
              <stop offset="64%" stopColor="#1e558e" />
              <stop offset="75%" stopColor="#4d8dc4" />
              <stop offset="83%" stopColor="#b9d9f2" />
              <stop offset="88%" stopColor="#e8f2fb" />
              <stop offset="100%" stopColor="#7fa8cc" />
            </linearGradient>

            <radialGradient id="aurora" cx="72%" cy="16%" r="58%">
              <stop offset="0%" stopColor="#2f7fd4" stopOpacity=".34" />
              <stop offset="60%" stopColor="#1b4f92" stopOpacity=".12" />
              <stop offset="100%" stopColor="#0653b6" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity=".95" />
              <stop offset="22%" stopColor="#cfe6ff" stopOpacity=".55" />
              <stop offset="55%" stopColor="#5ea2e0" stopOpacity=".22" />
              <stop offset="100%" stopColor="#0653b6" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="gBack" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3f7cb8" />
              <stop offset="55%" stopColor="#1d4677" />
              <stop offset="100%" stopColor="#14355e" />
            </linearGradient>
            <linearGradient id="gMid" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1e4a7d" />
              <stop offset="60%" stopColor="#102c52" />
              <stop offset="100%" stopColor="#0b2040" />
            </linearGradient>
            <linearGradient id="gFront" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0e2444" />
              <stop offset="60%" stopColor="#08182f" />
              <stop offset="100%" stopColor="#050f1f" />
            </linearGradient>

            <linearGradient id="hazeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bcdcf7" stopOpacity="0" />
              <stop offset="45%" stopColor="#bcdcf7" stopOpacity=".38" />
              <stop offset="100%" stopColor="#8fc0e8" stopOpacity="0" />
            </linearGradient>

            <filter id="soft" x="-30%" y="-60%" width="160%" height="260%">
              <feGaussianBlur stdDeviation="26" />
            </filter>
            <filter id="softer" x="-40%" y="-80%" width="180%" height="300%">
              <feGaussianBlur stdDeviation="48" />
            </filter>
          </defs>

          <rect x="0" y="0" width="1440" height="900" fill="url(#sky)" />
          <rect x="0" y="0" width="1440" height="640" fill="url(#aurora)" />
          <g id="stars" className="stars" fill="#ffffff" />

          {/* sun sitting on the horizon, behind the ridges */}
          <circle cx="720" cy="700" r="340" fill="url(#sunGlow)" filter="url(#softer)" />
          <circle className="sun-disc" cx="720" cy="700" r="46" fill="#f6faff" opacity=".92" />

          {/* call-signal rings radiating from the sun: the brand motif */}
          <g className="signals" fill="none" stroke="#a8d2ff">
            <circle className="sig" cx="720" cy="700" r="120" strokeWidth="1.6" />
            <circle className="sig sig--2" cx="720" cy="700" r="120" strokeWidth="1.4" />
            <circle className="sig sig--3" cx="720" cy="700" r="120" strokeWidth="1.2" />
          </g>

          {/* horizon haze */}
          <rect x="-40" y="620" width="1520" height="200" fill="url(#hazeGrad)" filter="url(#soft)" />

          {/* ridgelines, far to near */}
          <path
            fill="url(#gBack)"
            opacity=".92"
            d="M0,700 C120,664 210,612 300,646 C396,682 460,722 546,660 C640,592 700,628 790,686 C880,744 950,660 1060,628 C1160,598 1250,660 1344,686 C1390,698 1416,704 1440,708 L1440,900 L0,900 Z"
          />
          <rect
            x="-40"
            y="676"
            width="1520"
            height="130"
            fill="url(#hazeGrad)"
            filter="url(#soft)"
            opacity=".85"
          />
          <path
            fill="url(#gMid)"
            d="M0,762 C130,730 226,650 336,694 C442,736 516,800 616,724 C714,650 776,682 874,742 C970,802 1048,712 1164,678 C1270,648 1354,722 1440,754 L1440,900 L0,900 Z"
          />
          <path
            fill="url(#gFront)"
            d="M0,838 C150,800 246,742 366,780 C484,818 562,858 662,790 C760,724 840,760 960,818 C1078,876 1176,796 1294,782 C1354,776 1406,796 1440,806 L1440,900 L0,900 Z"
          />

          {/* drifting valley mist */}
          <g className="mist" filter="url(#soft)" fill="#cfe4f7">
            <ellipse className="mist-a" cx="380" cy="782" rx="440" ry="38" opacity=".28" />
            <ellipse className="mist-b" cx="1020" cy="818" rx="520" ry="42" opacity=".24" />
          </g>
        </svg>

        <div className="grain" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-eyebrow">AI Front Desk + Marketing for HVAC &amp; Roofing</div>
          <h1 className="hero-headline">
            Every call answered.
            <br />
            Every lead <span className="hero-accent">followed&nbsp;up.</span>
          </h1>
          <p className="hero-sub">
            You&rsquo;re on the tools and the phone rings anyway. VM answers in under 10
            seconds, sounds like your best front-desk hire, and books the job straight into
            your calendar. Nights, weekends, storm season.
          </p>
          <div className="hero-ctas">
            <Link to="/quote" className="hero-cta-solid">
              Get a Quote
            </Link>
            <Link to="/services" className="hero-cta-glass">
              See how it works
            </Link>
          </div>
          <div className="hero-call" data-el="card" aria-hidden="true">
            <div className="hero-call-top">
              <span className="hero-call-dot" />
              <span className="hero-call-status" data-call="status">
                Incoming call…
              </span>
              <span className="hero-call-time">7:42 PM</span>
            </div>
            <div className="hero-call-body">
              <span className="hero-call-icon">
                <PhoneIncoming size={17} strokeWidth={2} />
              </span>
              <div className="hero-call-caller">
                <strong>Mrs. Chen</strong>
                <span>Ducted AC not cooling — Thornbury</span>
              </div>
              <span className="hero-call-wave" data-call="wave">
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>
            <div className="hero-call-line" data-call="line">
              &ldquo;Got it — a tech can be there Thursday at 2 PM. Locking that in now.&rdquo;
            </div>
            <div className="hero-call-booked" data-call="booked">
              <CalendarCheck2 size={15} strokeWidth={2.4} />
              Booked · Thu 2:00 PM · summary texted to you
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
