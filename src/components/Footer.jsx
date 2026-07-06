import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import IconGlass from './IconGlass.jsx';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="nav-mark">VM</span>
            <span>VM Solutions</span>
          </div>
          <p>
            Vergo Marketing Solutions — the AI front desk and marketing engine for HVAC and
            roofing businesses. Every call answered. Every lead followed up.
          </p>
          <div className="footer-social">
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer">
              <IconGlass icon={Facebook} size="sm" round />
            </a>
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer">
              <IconGlass icon={Instagram} size="sm" round />
            </a>
            <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer">
              <IconGlass icon={Linkedin} size="sm" round />
            </a>
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
        <span className="footer-tag">Built for the trades.</span>
      </div>
    </footer>
  );
}
