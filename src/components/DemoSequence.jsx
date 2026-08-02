import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PhoneIncoming, CalendarCheck2, Check } from 'lucide-react';

const LINES = [
  { who: 'caller', text: 'Hi, my ducted aircon is blowing warm air. Any chance someone can come out?' },
  { who: 'vm', text: 'That’s no good, especially this week. I can get a tech to you Thursday at 2 PM, or Friday morning if that suits better.' },
  { who: 'caller', text: 'Thursday’s good. It’s the place on Beavers Road.' },
  { who: 'vm', text: 'Locked in. You’ll get a text with the time and your tech’s name in a moment.' },
];

const SLOTS = ['9:00 AM', '12:30 PM', '2:00 PM'];
const PICKED = 2;

export default function DemoSequence() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const q = (s) => root.querySelector(s);
    const qa = (s) => Array.from(root.querySelectorAll(s));

    const badge = q('[data-cs="badge"]');
    const dot = q('[data-cs="dot"]');
    const timer = q('[data-cs="timer"]');
    const wave = q('[data-cs="wave"]');
    const lines = qa('[data-cs="line"]');
    const slots = qa('[data-cs="slot"]');
    const stamp = q('[data-cs="stamp"]');
    const steps = qa('[data-cs="step"]');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      badge.textContent = 'Answered by VM';
      root.classList.add('is-live');
      gsap.set([...lines, stamp], { opacity: 1, y: 0 });
      slots[PICKED].classList.add('is-booked');
      steps.forEach((s) => s.classList.add('is-done'));
      timer.textContent = '01:12';
      return undefined;
    }

    const clock = { t: 0 };
    const setStep = (i) =>
      steps.forEach((s, k) => s.classList.toggle('is-done', k <= i));

    gsap.set(lines, { opacity: 0, y: 14 });
    gsap.set(stamp, { opacity: 0, scale: 0.8 });
    gsap.set(wave, { opacity: 0 });

    const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 1.6 });

    // 1 — ringing
    tl.call(() => {
      root.classList.remove('is-live');
      badge.textContent = 'Incoming call';
      clock.t = 0;
      timer.textContent = '00:00';
      slots[PICKED].classList.remove('is-booked');
      setStep(-1);
      gsap.set(lines, { opacity: 0, y: 14 });
      gsap.set(stamp, { opacity: 0, scale: 0.8 });
      gsap.set(wave, { opacity: 0 });
    })
      .to({}, { duration: 1.1 })
      // 2 — answered
      .call(() => {
        root.classList.add('is-live');
        badge.textContent = 'Answered by VM';
        setStep(0);
      })
      .to(wave, { opacity: 1, duration: 0.3 })
      .to(
        clock,
        {
          t: 72,
          duration: 9,
          ease: 'none',
          onUpdate: () => {
            const s = Math.floor(clock.t);
            timer.textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(
              s % 60
            ).padStart(2, '0')}`;
          },
        },
        '<'
      );

    // 3 — transcript (absolute times: the 9s timer tween runs alongside these)
    const LINE_AT = [1.9, 3.4, 5.3, 6.9];
    lines.forEach((ln, i) => {
      tl.to(ln, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, LINE_AT[i]);
    });
    tl.call(() => setStep(1), null, LINE_AT[1]);

    // 4 — booked
    tl.call(
      () => {
        slots[PICKED].classList.add('is-booked');
        setStep(2);
      },
      null,
      8.2
    )
      .to(stamp, { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(2)' }, 8.35)
      .to({}, { duration: 2.8 }, 9.2);

    const st = ScrollTrigger.create({
      trigger: root,
      start: 'top 75%',
      onEnter: () => tl.play(0),
      onEnterBack: () => tl.play(0),
      onLeave: () => tl.pause(),
      onLeaveBack: () => tl.pause(),
    });

    return () => {
      st.kill();
      tl.kill();
    };
  }, []);

  return (
    <section className="callstage" ref={rootRef} data-section="LIVE CALL" data-theme="dark">
      <div className="callstage-inner">
        <div className="callstage-head">
          <span className="eyebrow eyebrow--onDark">A real call, start to finish</span>
          <h2>
            Watch a missed call turn into <span className="cs-hl">a booked job.</span>
          </h2>
          <p>
            This is what happens at 7:42 PM while your crew is packing up. No voicemail, no
            call-back list, no lost job.
          </p>
        </div>

        <div className="cs-grid">
          {/* the call */}
          <div className="cs-panel cs-call">
            <div className="cs-bar">
              <span className="cs-dot" data-cs="dot" />
              <span className="cs-badge" data-cs="badge">
                Incoming call
              </span>
              <span className="cs-timer" data-cs="timer">
                00:00
              </span>
            </div>

            <div className="cs-caller">
              <span className="cs-avatar">
                <PhoneIncoming size={18} strokeWidth={2} />
              </span>
              <div className="cs-who">
                <strong>Mrs. Chen</strong>
                <span>0412 887 341 · Thornbury</span>
              </div>
              <span className="cs-wave" data-cs="wave">
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
                <i />
              </span>
            </div>

            <div className="cs-transcript">
              {LINES.map((l, i) => (
                <div key={i} className={`cs-line cs-line--${l.who}`} data-cs="line">
                  <span className="cs-line-who">{l.who === 'vm' ? 'VM' : 'Caller'}</span>
                  <p>{l.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* the outcome */}
          <div className="cs-panel cs-book">
            <div className="cs-book-head">
              <span>Thursday, 14 August</span>
              <strong>Your calendar</strong>
            </div>
            <div className="cs-slots">
              {SLOTS.map((s, i) => (
                <div key={s} className="cs-slot" data-cs="slot">
                  <span className="cs-slot-time">{s}</span>
                  <span className="cs-slot-state">
                    <Check size={13} strokeWidth={3} />
                    Booked
                  </span>
                </div>
              ))}
            </div>
            <div className="cs-stamp" data-cs="stamp">
              <CalendarCheck2 size={16} strokeWidth={2.4} />
              <div>
                <strong>Job booked</strong>
                <span>Summary texted to you and the tech</span>
              </div>
            </div>
          </div>
        </div>

        <ol className="cs-steps">
          <li className="cs-step" data-cs="step">
            Answered in under 10 seconds
          </li>
          <li className="cs-step" data-cs="step">
            Qualified the job
          </li>
          <li className="cs-step" data-cs="step">
            Booked it in your calendar
          </li>
        </ol>
      </div>
    </section>
  );
}
