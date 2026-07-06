import { useEffect, useRef } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PhoneMissed, AudioLines, CalendarCheck2 } from 'lucide-react';
import IconGlass from './IconGlass.jsx';

const clamp = (v, l, h) => Math.max(l, Math.min(h, v));
const seg = (p, s, e) => clamp((p - s) / (e - s), 0, 1);

const FRAMES = [
  {
    key: 'missed',
    tone: 'red',
    Icon: PhoneMissed,
    badge: 'Missed Call',
    title: 'Someone just called your business.',
    sub: 'It’s 7:40 PM and your crew is still on a roof. The phone rings out — and that homeowner is already dialling the next company on the list.',
  },
  {
    key: 'answering',
    tone: 'blue',
    Icon: AudioLines,
    badge: 'AI Answering',
    title: '“Got it — checking availability for Thursday…”',
    sub: 'Your VM receptionist picks up in under 10 seconds, every single time — qualifying the job and speaking like your best front-desk hire.',
  },
  {
    key: 'booked',
    tone: 'green',
    Icon: CalendarCheck2,
    badge: 'Job Booked',
    title: 'Booked: Thursday, 2:00 PM.',
    sub: 'Confirmed with the customer and dropped straight into your calendar — while your competitors’ phones were still ringing.',
  },
];

export default function DemoSequence() {
  const wrapRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const frames = Array.from(wrap.querySelectorAll('[data-frame]'));
    const tints = Array.from(wrap.querySelectorAll('[data-tint]'));
    const dots = Array.from(wrap.querySelectorAll('[data-dot]'));

    // p 0..1 -> fp 0..2; frame i is fully on at fp = i, crossfades at 0.5 / 1.5
    const visibility = (fp, i) => {
      const fadeIn = i === 0 ? 1 : seg(fp, i - 0.65, i - 0.35);
      const fadeOut = i === FRAMES.length - 1 ? 0 : seg(fp, i + 0.35, i + 0.65);
      return clamp(fadeIn - fadeOut, 0, 1);
    };

    const render = (p) => {
      const fp = p * (FRAMES.length - 1);
      frames.forEach((f, i) => {
        const v = visibility(fp, i);
        const dir = fp < i ? 1 : -1; // enter from below, exit upward
        f.style.opacity = v;
        f.style.transform = `translateY(${((1 - v) * 28 * dir).toFixed(2)}px)`;
        f.style.visibility = v <= 0.001 ? 'hidden' : 'visible';
        tints[i].style.opacity = v;
        dots[i].classList.toggle('is-active', v > 0.5);
      });
    };

    const st = ScrollTrigger.create({
      trigger: wrap,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
      onUpdate: (self) => render(self.progress),
    });
    render(0);
    return () => st.kill();
  }, []);

  return (
    <section className="demo-wrap" ref={wrapRef} data-section="DEMO" data-theme="light">
      <div className="demo-sticky">
        {FRAMES.map((f, i) => (
          <div key={f.key} className={`demo-tint demo-tint--${f.tone}`} data-tint={i} />
        ))}
        <div className="demo-inner">
          <div className="eyebrow">The 40-second story</div>
          <h2 className="demo-title">Watch a missed call become a booked job.</h2>
          <div className="demo-card">
            {FRAMES.map((f, i) => (
              <div key={f.key} className={`demo-frame demo-frame--${f.tone}`} data-frame={i}>
                <span className={`demo-badge demo-badge--${f.tone}`}>
                  <span className="demo-badge-dot" />
                  {f.badge}
                </span>
                <IconGlass icon={f.Icon} size="lg" className={`demo-chip demo-chip--${f.tone}`} />
                <h3>{f.title}</h3>
                <p>{f.sub}</p>
              </div>
            ))}
            <div className="demo-dots">
              {FRAMES.map((f, i) => (
                <span key={f.key} className="demo-dot" data-dot={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
