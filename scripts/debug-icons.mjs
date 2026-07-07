import puppeteer from 'puppeteer-core';
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
await sleep(1000);

// jump straight to the pillars area
await page.evaluate(() => {
  const el = document.querySelector('.pillar-grid');
  const y = el.getBoundingClientRect().top + window.scrollY - 300;
  if (window.__lenis) window.__lenis.scrollTo(y, { immediate: true, force: true });
  window.scrollTo(0, y);
});
await sleep(3000);

const report = await page.evaluate(() => {
  const info = (el, label) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      label,
      opacity: cs.opacity,
      transform: cs.transform.slice(0, 40),
      inlineOpacity: el.style.opacity,
      top: Math.round(r.top),
      inViewport: r.top < innerHeight && r.bottom > 0,
    };
  };
  return [
    ...[...document.querySelectorAll('.trust-item .icon-glass')].map((el, i) => info(el, 'trust' + i)),
    ...[...document.querySelectorAll('.pillar-card .icon-glass')].map((el, i) => info(el, 'pillar' + i)),
  ];
});
console.log(JSON.stringify(report, null, 1));
await browser.close();
