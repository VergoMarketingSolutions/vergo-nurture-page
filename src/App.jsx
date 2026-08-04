import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import { AnnouncementBar } from './components/Scarcity.jsx';
import IntroPopup from './components/IntroPopup.jsx';
import ScrollRail from './components/ScrollRail.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import CostComparison from './pages/CostComparison.jsx';
import RealMath from './pages/RealMath.jsx';
import Quote from './pages/Quote.jsx';
import Legal from './pages/Legal.jsx';

gsap.registerPlugin(ScrollTrigger);

// Springy pop-in for every glass icon chip as it scrolls into view.
// Hero manages its own reveals, so its chips are excluded; reduced-motion skips it.
function useIconReveal(pathname) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const icons = gsap
      .utils.toArray('.icon-glass')
      .filter((el) => !el.closest('.hero-content'));
    if (!icons.length) return undefined;
    // rise + fade, no scale: scaling a backdrop-filter chip mid-tween
    // resamples its rasterized layer and looks blurry
    gsap.set(icons, { y: 26, opacity: 0 });
    const triggers = ScrollTrigger.batch(icons, {
      start: 'top 94%',
      once: true,
      onEnter: (els) =>
        gsap.to(els, {
          y: 0,
          opacity: 1,
          duration: 0.65,
          ease: 'back.out(2.2)',
          stagger: 0.07,
          overwrite: true,
          clearProps: 'y,opacity,transform',
        }),
    });
    return () => {
      triggers.forEach((t) => t.kill());
      gsap.set(icons, { clearProps: 'all' });
    };
  }, [pathname]);
}

export default function App() {
  const location = useLocation();
  useIconReveal(location.pathname);

  useEffect(() => {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [location.pathname]);

  return (
    <>
      <AnnouncementBar />
      <Nav />
      <ScrollRail />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/compare" element={<CostComparison />} />
          <Route path="/real-math" element={<RealMath />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
      <IntroPopup />
    </>
  );
}
