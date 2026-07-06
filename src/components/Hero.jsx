import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, l, h) => Math.max(l, Math.min(h, v));
const hex = (h) => {
  h = h.replace('#', '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
const mix = (c1, c2, t) => {
  const a = hex(c1);
  const b = hex(c2);
  return `rgb(${Math.round(lerp(a[0], b[0], t))},${Math.round(lerp(a[1], b[1], t))},${Math.round(
    lerp(a[2], b[2], t)
  )})`;
};
const seg = (p, s, e) => clamp((p - s) / (e - s), 0, 1);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// color journeys [dark night -> bright dawn]
const C = {
  skyTop: ['#080b1c', '#a9cdf0'],
  skyUp: ['#111633', '#cbe0f5'],
  skyMid: ['#221c3d', '#e6dcf3'],
  skyBot: ['#2e2340', '#fdeede'],
  backTop: ['#2a3350', '#e9d4b8'],
  backBot: ['#1e2540', '#9db9da'],
  midTop: ['#232b47', '#d8b58c'],
  midBot: ['#161c33', '#5f77a0'],
  frontTop: ['#1a2138', '#3d4a68'],
  frontBot: ['#0d1122', '#1c2338'],
};

export default function Hero() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const q = (sel) => wrap.querySelector(sel);
    const el = {
      skyTop: q('#skyTop'),
      skyUp: q('#skyUp'),
      skyMid: q('#skyMid'),
      skyBot: q('#skyBot'),
      backTop: q('#backTop'),
      backBot: q('#backBot'),
      midTop: q('#midTop'),
      midBot: q('#midBot'),
      frontTop: q('#frontTop'),
      frontBot: q('#frontBot'),
      aurora: q('#auroraRect'),
      stars: q('#stars'),
      haze: q('#hazeBand'),
      sun: q('#sun'),
      sunCore: q('#sunCore'),
      sunMid: q('#sunMidStop'),
      sunDisc: q('#sunDisc'),
      snowBack: q('#snowBack'),
      snowMid: q('#snowMid'),
      backG: q('#backG'),
      midG: q('#midG'),
      frontG: q('#frontG'),
      fogLayer: q('#fogLayer'),
      fogSheet: q('#fogSheet'),
      content: q('.hero-content'),
      eyebrow: q('[data-el="eyebrow"]'),
      headline: q('[data-el="headline"]'),
      sub: q('[data-el="sub"]'),
      ctas: q('[data-el="ctas"]'),
      stats: q('[data-el="stats"]'),
      hint: q('[data-el="hint"]'),
    };

    // generate stars (~70, y 0-430; fewer on small screens)
    const isMobile = window.matchMedia('(max-width: 640px)').matches;
    const starCount = isMobile ? 28 : 70;
    let frag = '';
    for (let i = 0; i < starCount; i++) {
      const x = (Math.random() * 1440).toFixed(1);
      const y = (Math.random() * 430).toFixed(1);
      const r = (0.6 + Math.random() * 1.3).toFixed(2);
      const o = (0.35 + Math.random() * 0.65).toFixed(2);
      frag += `<circle cx="${x}" cy="${y}" r="${r}" opacity="${o}"/>`;
    }
    el.stars.innerHTML = frag;

    // film grain: a static noise tile rendered once — a live full-screen
    // feTurbulence filter stalls the compositor, so we bake the same noise
    const grain = wrap.querySelector('.grain');
    if (grain && !grain.style.backgroundImage) {
      const c = document.createElement('canvas');
      c.width = c.height = 180;
      const ctx = c.getContext('2d');
      const img = ctx.createImageData(180, 180);
      for (let i = 0; i < img.data.length; i += 4) {
        // overlay-blend is neutral at 128, so keep values near mid-gray for a
        // whisper of film grain instead of TV static
        const v = (114 + Math.random() * 28) | 0;
        img.data[i] = v;
        img.data[i + 1] = v;
        img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      grain.style.backgroundImage = `url(${c.toDataURL()})`;
    }

    const reveal = (node, t) => {
      const e = easeOut(t);
      node.style.opacity = e;
      node.style.transform = `translateY(${lerp(26, 0, e)}px)`;
    };

    const render = (p) => {
      const e = easeOut(clamp(p, 0, 1));
      el.skyTop.setAttribute('stop-color', mix(C.skyTop[0], C.skyTop[1], e));
      el.skyUp.setAttribute('stop-color', mix(C.skyUp[0], C.skyUp[1], e));
      el.skyMid.setAttribute('stop-color', mix(C.skyMid[0], C.skyMid[1], e));
      el.skyBot.setAttribute('stop-color', mix(C.skyBot[0], C.skyBot[1], e));

      el.aurora.setAttribute('opacity', lerp(1, 0, seg(p, 0.05, 0.4)));
      el.stars.setAttribute('opacity', lerp(1, 0, seg(p, 0, 0.28)));
      el.haze.setAttribute('opacity', lerp(0, 0.5, seg(p, 0.25, 0.8)));

      // ridges catch warm dawn light, bases stay in blue shadow
      const litB = seg(p, 0.1, 1);
      const litM = seg(p, 0.18, 1);
      const litF = seg(p, 0.3, 1);
      el.backTop.setAttribute('stop-color', mix(C.backTop[0], C.backTop[1], litB));
      el.backBot.setAttribute('stop-color', mix(C.backBot[0], C.backBot[1], litB));
      el.midTop.setAttribute('stop-color', mix(C.midTop[0], C.midTop[1], litM));
      el.midBot.setAttribute('stop-color', mix(C.midBot[0], C.midBot[1], litM));
      el.frontTop.setAttribute('stop-color', mix(C.frontTop[0], C.frontTop[1], litF));
      el.frontBot.setAttribute('stop-color', mix(C.frontBot[0], C.frontBot[1], litF));

      el.snowBack.setAttribute('opacity', lerp(0, 0.9, seg(p, 0.4, 0.85)));
      el.snowMid.setAttribute('opacity', lerp(0, 0.85, seg(p, 0.5, 0.9)));

      el.backG.setAttribute('transform', `translate(0 ${lerp(0, -18, e).toFixed(2)})`);
      el.midG.setAttribute('transform', `translate(0 ${lerp(0, -34, e).toFixed(2)})`);
      el.frontG.setAttribute('transform', `translate(0 ${lerp(0, -54, e).toFixed(2)})`);

      const sp = seg(p, 0.15, 0.92);
      const spe = easeInOut(sp);
      el.sun.setAttribute('cy', lerp(720, 455, spe).toFixed(1));
      el.sun.setAttribute('r', lerp(300, 440, sp).toFixed(1));
      el.sunCore.setAttribute('stop-opacity', lerp(0, 0.95, spe).toFixed(3));
      el.sunMid.setAttribute('stop-opacity', lerp(0, 0.55, spe).toFixed(3));
      el.sunDisc.setAttribute('cy', lerp(720, 455, spe).toFixed(1));
      el.sunDisc.setAttribute('opacity', lerp(0, 0.92, seg(p, 0.55, 0.95)).toFixed(3));

      el.fogLayer.setAttribute('opacity', lerp(1, 0, seg(p, 0.12, 0.72)));
      el.fogSheet.setAttribute('opacity', lerp(0.85, 0, seg(p, 0.1, 0.6)));

      reveal(el.eyebrow, seg(p, 0.3, 0.55));
      reveal(el.headline, seg(p, 0.3, 0.55));
      reveal(el.sub, seg(p, 0.4, 0.62));
      const cta = seg(p, 0.6, 0.85);
      reveal(el.ctas, cta);
      reveal(el.stats, cta);
      el.ctas.style.pointerEvents = cta > 0.5 ? 'auto' : 'none';
      el.hint.style.opacity = clamp(1 - p * 5, 0, 1);

      // as the sky pales, settle text toward ink so contrast holds at full dawn
      const tShift = seg(p, 0.55, 0.95);
      el.content.style.setProperty('--heroInk', mix('#f4f7ff', '#14141a', tShift));
      el.content.style.setProperty('--heroSub', mix('#b9c6e2', '#4c4f5a', tShift));
      el.content.style.setProperty('--heroAccent', mix('#66a3f2', '#0653B6', tShift));
      el.content.style.setProperty('--heroGlassA', lerp(0.12, 0.5, tShift).toFixed(3));
      el.content.style.setProperty('--heroBorderA', lerp(0.22, 0.65, tShift).toFixed(3));

      // rail theme follows the scene: night = dark HUD, dawn = light HUD
      wrap.dataset.theme = p > 0.6 ? 'light' : 'dark';
    };

    if (isMobile) {
      // static "cleared dawn" state below 640px
      render(1);
      return undefined;
    }

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => render(self.progress),
    });
    render(0);
    return () => st.kill();
  }, []);

  return (
    <div className="hero-wrap" ref={wrapRef} data-section="HERO" data-theme="dark">
      <div className="hero-sticky">
        <svg
          className="scene"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop id="skyTop" offset="0%" stopColor="#080b1c" />
              <stop id="skyUp" offset="38%" stopColor="#111633" />
              <stop id="skyMid" offset="66%" stopColor="#221c3d" />
              <stop id="skyBot" offset="100%" stopColor="#2e2340" />
            </linearGradient>
            <linearGradient id="aurora" x1="0" y1="0" x2="1" y2="0.4">
              <stop offset="0%" stopColor="#0653B6" stopOpacity="0" />
              <stop offset="45%" stopColor="#3f7bd6" stopOpacity=".18" />
              <stop offset="70%" stopColor="#7d6bd0" stopOpacity=".14" />
              <stop offset="100%" stopColor="#0653B6" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
              <stop id="sunCore" offset="0%" stopColor="#fff6e6" stopOpacity="0" />
              <stop id="sunMidStop" offset="35%" stopColor="#ffe6bd" stopOpacity="0" />
              <stop offset="100%" stopColor="#ffdca8" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="gBack" x1="0" y1="0" x2="0" y2="1">
              <stop id="backTop" offset="0%" stopColor="#2a3350" />
              <stop id="backBot" offset="100%" stopColor="#1e2540" />
            </linearGradient>
            <linearGradient id="gMid" x1="0" y1="0" x2="0" y2="1">
              <stop id="midTop" offset="0%" stopColor="#232b47" />
              <stop id="midBot" offset="100%" stopColor="#161c33" />
            </linearGradient>
            <linearGradient id="gFront" x1="0" y1="0" x2="0" y2="1">
              <stop id="frontTop" offset="0%" stopColor="#1a2138" />
              <stop id="frontBot" offset="100%" stopColor="#0d1122" />
            </linearGradient>
            <linearGradient id="fogGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0" />
              <stop offset="50%" stopColor="#eef3fb" stopOpacity=".85" />
              <stop offset="100%" stopColor="#e7edf7" stopOpacity=".55" />
            </linearGradient>
            <filter id="soft">
              <feGaussianBlur stdDeviation="18" />
            </filter>
            <filter id="softer">
              <feGaussianBlur stdDeviation="34" />
            </filter>
          </defs>

          <rect x="0" y="0" width="1440" height="900" fill="url(#sky)" />
          <rect id="auroraRect" x="0" y="0" width="1440" height="620" fill="url(#aurora)" />
          <g id="stars" fill="#ffffff"></g>
          <circle id="sun" cx="720" cy="700" r="380" fill="url(#sunGlow)" filter="url(#softer)" />
          <circle id="sunDisc" cx="720" cy="700" r="46" fill="#fff3dc" opacity="0" />
          <rect id="hazeBand" x="0" y="430" width="1440" height="260" fill="#c9d8ef" opacity="0" filter="url(#softer)" />

          <g id="backG">
            <path
              id="peakBack"
              fill="url(#gBack)"
              d="M0,540 C160,470 240,420 330,455 C430,494 470,540 560,470 C660,392 700,430 800,500 C900,568 970,470 1080,430 C1180,394 1260,470 1360,500 C1400,512 1420,520 1440,522 L1440,900 L0,900 Z"
            />
            <path
              id="snowBack"
              fill="#dbe8f7"
              opacity="0"
              d="M0,540 C160,470 240,420 330,455 C430,494 470,540 560,470 C660,392 700,430 800,500 C900,568 970,470 1080,430 C1180,394 1260,470 1360,500 C1400,512 1420,520 1440,522 L1440,556 C1410,548 1360,540 1330,548 C1250,516 1180,440 1090,474 C980,514 910,600 802,532 C700,462 662,430 566,506 C476,574 430,528 336,490 C250,456 168,504 20,572 L0,576 Z"
            />
          </g>
          <g id="midG">
            <path
              id="peakMid"
              fill="url(#gMid)"
              d="M0,640 C120,600 220,470 330,520 C440,570 520,660 620,560 C720,462 780,500 880,580 C980,660 1060,540 1180,500 C1280,468 1360,560 1440,600 L1440,900 L0,900 Z"
            />
            <path
              id="snowMid"
              fill="#eaf2fb"
              opacity="0"
              d="M330,520 C440,570 520,660 620,560 C660,522 700,506 742,512 L720,540 C700,512 664,528 628,590 C520,690 436,596 326,544 Z"
            />
          </g>
          <g id="frontG">
            <path
              id="peakFront"
              fill="url(#gFront)"
              d="M0,760 C140,700 240,600 360,660 C480,720 560,780 660,660 C760,540 840,600 960,700 C1080,800 1180,660 1300,640 C1360,630 1410,660 1440,672 L1440,900 L0,900 Z"
            />
          </g>

          <g id="fogLayer" filter="url(#soft)">
            <ellipse cx="300" cy="600" rx="420" ry="120" fill="url(#fogGrad)" />
            <ellipse cx="820" cy="640" rx="520" ry="140" fill="url(#fogGrad)" />
            <ellipse cx="1200" cy="590" rx="440" ry="120" fill="url(#fogGrad)" />
          </g>
          <rect id="fogSheet" x="-60" y="420" width="1560" height="480" fill="url(#fogGrad)" />
        </svg>

        <div className="grain" aria-hidden="true" />

        <div className="hero-content">
          <div className="hero-eyebrow" data-el="eyebrow">
            AI Front Desk + Marketing for HVAC &amp; Roofing
          </div>
          <h1 className="hero-headline" data-el="headline">
            Every call answered.
            <br />
            Every lead <span className="hero-accent">followed&nbsp;up.</span>
          </h1>
          <p className="hero-sub" data-el="sub">
            VM Solutions clears the chaos of missed calls and cold leads — a 24/7 AI
            receptionist, sharper marketing, and an honest read on what&rsquo;s actually
            working. The fog lifts. The calendar fills.
          </p>
          <div className="hero-ctas" data-el="ctas">
            <Link to="/quote" className="hero-cta-solid">
              Request a Quote
            </Link>
            <Link to="/services" className="hero-cta-glass">
              See Services
            </Link>
          </div>
          <div className="hero-stats" data-el="stats">
            <div className="hero-stat">
              <strong>24/7</strong>
              <span>Always answering</span>
            </div>
            <div className="hero-stat">
              <strong>&lt;10s</strong>
              <span>To pick up any call</span>
            </div>
            <div className="hero-stat">
              <strong>$0.09/min</strong>
              <span>AUD — that&rsquo;s it</span>
            </div>
          </div>
        </div>
        <div className="scroll-hint" data-el="hint">
          Scroll to clear the fog
          <span className="scroll-hint-line" />
        </div>
      </div>
    </div>
  );
}
