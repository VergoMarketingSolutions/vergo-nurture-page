import { useEffect, useRef } from 'react';

const TICKS = 21;

export default function ScrollRail() {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const marker = root.querySelector('.rail-marker');
    const num = root.querySelector('.rail-num');
    const secEl = root.querySelector('.rail-sec');
    const spine = root.querySelector('.rail-spine');
    const ticks = Array.from(root.querySelectorAll('.rail-tick'));

    let cur = 0;
    let lastY = window.scrollY;
    let scrollTimer = 0;
    let rafId = 0;
    let lastTop = -1;
    let lastNum = '';
    let lastNear = -1;
    let settled = false;

    const loop = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      cur += (target - cur) * 0.14;
      if (Math.abs(target - cur) < 0.0004) cur = target;

      // idle guard: once settled, skip all DOM writes until scroll resumes
      const idle = cur === target && window.scrollY === lastY;
      if (idle && settled) {
        rafId = requestAnimationFrame(loop);
        return;
      }
      settled = idle;

      const h = spine.clientHeight;
      const topPx = Math.round(cur * h * 10) / 10;
      if (topPx !== lastTop) {
        marker.style.top = `${topPx}px`;
        lastTop = topPx;
      }
      const numStr = String(Math.round(cur * 1000)).padStart(4, '0');
      if (numStr !== lastNum) {
        num.textContent = numStr;
        lastNum = numStr;
      }

      const near = Math.round(cur * (ticks.length - 1));
      if (near !== lastNear) {
        ticks.forEach((t, i) => t.classList.toggle('is-near', Math.abs(i - near) <= 1));
        lastNear = near;
      }

      if (Math.abs(window.scrollY - lastY) > 1) {
        root.classList.add('is-scrolling');
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(() => root.classList.remove('is-scrolling'), 180);
        lastY = window.scrollY;
      }

      // Which section sits behind the rail? Drives theme + name readout.
      const midY = window.innerHeight * 0.5;
      let theme = 'light';
      let name = '';
      document.querySelectorAll('[data-section]').forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top <= midY && r.bottom >= midY) {
          theme = el.dataset.theme || 'light';
          name = el.dataset.section || '';
        }
      });
      root.classList.toggle('rail--dark', theme === 'dark');
      if (secEl.textContent !== name) secEl.textContent = name;

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(scrollTimer);
    };
  }, []);

  return (
    <div className="rail" ref={rootRef} aria-hidden="true">
      <div className="rail-readout">
        <span className="rail-num">0000</span>
        <span className="rail-unit">M</span>
      </div>
      <div className="rail-sec"></div>
      <div className="rail-spine">
        {Array.from({ length: TICKS }).map((_, i) => (
          <span key={i} className={`rail-tick${i % 5 === 0 ? ' rail-tick--major' : ''}`} />
        ))}
        <span className="rail-marker" />
      </div>
    </div>
  );
}
