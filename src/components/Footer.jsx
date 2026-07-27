import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck, Clock, CalendarClock } from 'lucide-react';
import IconGlass from './IconGlass.jsx';
import Logo from './Logo.jsx';
import { SPOTS_LEFT, SPOTS_TOTAL, INTAKE_MONTH } from '../lib/availability.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <Logo className="nav-mark" />
            <span>VM Solutions</span>
          </div>
          <p>
            Vergo Marketing Solutions — the AI front desk and marketing engine for HVAC and
            roofing businesses. Every call answered. Every lead followed up.
          </p>
          <div className="footer-points">
            <div className="footer-point">
              <IconGlass icon={Clock} size="xs" tone="var(--blue)" />
              <span>Lines answered 24/7 — call-backs within one business day</span>
            </div>
            <div className="footer-point">
              <IconGlass icon={ShieldCheck} size="xs" tone="#1d9e5f" />
              <span>30-day money-back guarantee on every engagement</span>
            </div>
            <div className="footer-point">
              <IconGlass icon={CalendarClock} size="xs" tone="#e2560c" />
              <span>
                <strong>{SPOTS_LEFT} of {SPOTS_TOTAL} {INTAKE_MONTH} build spots left</strong> —{' '}
                <Link to="/quote" className="footer-inline-link">
                  claim one
                </Link>
              </span>
            </div>
          </div>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/compare">Cost Comparison</Link>
          <Link to="/real-math">The Real Math</Link>
          <Link to="/quote">Request a Quote</Link>
        </div>

        <div className="footer-col footer-contact">
          <h4>Contact</h4>
          <a href="mailto:vergomarketingsolutions@gmail.com" className="footer-contact-row">
            <IconGlass icon={Mail} size="xs" />
            <span>vergomarketingsolutions@gmail.com</span>
          </a>
          <a href="tel:+61481813435" className="footer-contact-row">
            <IconGlass icon={Phone} size="xs" />
            <span>0481 813 435</span>
          </a>
          <div className="footer-contact-row">
            <IconGlass icon={MapPin} size="xs" />
            <span>Melbourne, Australia</span>
          </div>
        </div>
      </div>
      <div className="footer-base">
        <span>© 2026 Vergo Marketing Solutions Pty Ltd. All rights reserved.</span>
        <span>Australian owned &amp; operated · Fully insured</span>
        <Link to="/legal" className="footer-legal-link">
          Legal
        </Link>
        <span className="footer-tag">Built for the trades.</span>
      </div>
    </footer>
  );
}
