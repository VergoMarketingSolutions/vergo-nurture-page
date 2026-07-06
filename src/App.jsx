import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import ScrollRail from './components/ScrollRail.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import CostComparison from './pages/CostComparison.jsx';
import RealMath from './pages/RealMath.jsx';
import Quote from './pages/Quote.jsx';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const location = useLocation();

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
      <Nav />
      <ScrollRail />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/compare" element={<CostComparison />} />
          <Route path="/real-math" element={<RealMath />} />
          <Route path="/quote" element={<Quote />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
