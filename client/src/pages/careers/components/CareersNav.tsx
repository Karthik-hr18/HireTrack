import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const CareersNav: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (window.location.pathname === '/' || window.location.pathname === '') {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        const navHeight = 72;
        const targetPos = el.getBoundingClientRect().top + window.pageYOffset - navHeight;
        window.scrollTo({
          top: targetPos,
          behavior: 'smooth'
        });
        window.history.pushState(null, '', `#${targetId}`);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <header className={`careers-nav ${isScrolled ? 'careers-nav--scrolled' : ''}`}>
      <div className="careers-container">
        <div className="careers-nav__inner">
          <Link to="/" className="careers-nav__logo" aria-label="HireTrack Homepage">
            <span style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              width: 32, 
              height: 32, 
              borderRadius: 8, 
              backgroundColor: 'var(--accent)', 
              color: '#fff', 
              fontWeight: 800, 
              fontSize: 16 
            }}>
              H
            </span>
            Hire<span style={{ color: 'var(--accent)' }}>Track</span>
          </Link>

          <nav className="careers-nav__links" aria-label="Main navigation">
            <a
              href="/#open-positions"
              className="careers-nav__link"
              onClick={(e) => handleNavClick(e, 'open-positions')}
            >
              Careers
            </a>
            <a
              href="/#company-story"
              className="careers-nav__link"
              onClick={(e) => handleNavClick(e, 'company-story')}
            >
              Company
            </a>
            <a
              href="/#why-join"
              className="careers-nav__link"
              onClick={(e) => handleNavClick(e, 'why-join')}
            >
              Benefits
            </a>
            <a
              href="/#faq"
              className="careers-nav__link"
              onClick={(e) => handleNavClick(e, 'faq')}
            >
              FAQ
            </a>

            {token ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {user?.role === 'recruiter' || user?.role === 'admin' ? (
                  <>
                    <Link to="/dashboard" className="careers-nav__cta" style={{ backgroundColor: 'var(--accent)' }}>
                      Dashboard
                    </Link>
                    <Link to="/recruiter/candidates" className="careers-nav__cta" style={{ backgroundColor: 'var(--gray-surface)', color: 'var(--gray-text-primary)', border: '1px solid var(--gray-border)' }}>
                      Candidate Pipeline
                    </Link>
                  </>
                ) : (
                  <Link to="/candidate/applications" className="careers-nav__cta">
                    My Applications
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-ghost"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--gray-text-muted)',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-pill)',
                    border: '1px solid var(--gray-border)'
                  }}
                >
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Link to="/login" className="careers-nav__link" style={{ fontWeight: 600 }}>
                  Sign In
                </Link>
                <Link to="/register" className="careers-nav__cta">
                  Get Started →
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
