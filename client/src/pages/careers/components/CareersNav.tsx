import React from 'react';
import { Link } from 'react-router-dom';

export const CareersNav: React.FC = () => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  return (
    <header className="careers-nav">
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
            <a href="/#open-positions" className="careers-nav__link">
              Careers
            </a>
            <a href="/#company-story" className="careers-nav__link">
              Company
            </a>
            <a href="/#why-join" className="careers-nav__link">
              Benefits
            </a>
            <a href="/#faq" className="careers-nav__link">
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
