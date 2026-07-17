import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo.jsx';

const links = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/compare', label: 'Cost Comparison' },
  { to: '/real-math', label: 'The Real Math' },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', open);
    return () => document.body.classList.remove('menu-open');
  }, [open]);

  return (
    <header className="nav">
      <div className="nav-bar">
        <Link to="/" className="nav-brand">
          <Logo className="nav-mark" />
          <span className="nav-name">
            VM Solutions
            <span className="nav-sub">Vergo Marketing</span>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' is-active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
          <Link to="/quote" className="button-primary button-primary--sm nav-cta">
            Get a Quote
          </Link>
        </nav>
        <button
          type="button"
          className="nav-burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className={`nav-panel${open ? ' is-open' : ''}`}>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => `nav-panel-link${isActive ? ' is-active' : ''}`}
          >
            {l.label}
          </NavLink>
        ))}
        <Link to="/quote" className="button-primary nav-panel-cta">
          Get a Quote
        </Link>
      </div>
    </header>
  );
}
