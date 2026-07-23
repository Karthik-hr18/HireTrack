import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Briefcase, Building2, Sparkles, HelpCircle, LogIn, UserPlus, LayoutDashboard, Users, FileText, LogOut } from 'lucide-react';

export const CareersNav: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile drawer is open & handle Escape key
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    setIsMobileMenuOpen(false);
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

  const [sendingEmail, setSendingEmail] = useState(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const handleResendVerificationEmail = async () => {
    try {
      setSendingEmail(true);
      setResendNotice(null);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();
      setResendNotice(data.message || 'Verification link sent! Please check your email inbox.');
    } catch (err) {
      setResendNotice('Failed to dispatch verification email. Please try again.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <>
      {/* Premium Email Verification Top Banner */}
      {token && user?.role === 'candidate' && !user?.isEmailVerified && (
        <div style={{
          background: 'linear-gradient(90deg, #1e1b4b 0%, #31104b 50%, #1e1b4b 100%)',
          borderBottom: '1px solid rgba(139, 92, 246, 0.3)',
          color: '#f3e8ff',
          padding: '10px 20px',
          fontSize: 13,
          fontWeight: 600,
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 14,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100000,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 22,
              height: 22,
              borderRadius: '50%',
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              color: '#f59e0b',
              fontSize: 12,
              fontWeight: 800
            }}>⚡</span>
            <span>Account Action Required: Please verify <strong>{user?.email}</strong> to unlock full candidate features & apply for roles.</span>
          </div>

          <button
            type="button"
            onClick={handleResendVerificationEmail}
            disabled={sendingEmail}
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 20,
              padding: '5px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
          >
            {sendingEmail ? 'Sending Email...' : 'Resend Verification Email'}
          </button>
        </div>
      )}

      {/* Floating Premium Toast Notification */}
      {resendNotice && (
        <div style={{
          position: 'fixed',
          top: (token && user?.role === 'candidate' && !user?.isEmailVerified) ? 56 : 16,
          right: 20,
          zIndex: 100002,
          backgroundColor: '#0f172a',
          border: '1px solid rgba(99, 102, 241, 0.4)',
          borderRadius: 14,
          padding: '14px 18px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 0 15px rgba(99, 102, 241, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          maxWidth: 440,
          color: '#f8fafc',
          backdropFilter: 'blur(16px)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 16,
            flexShrink: 0
          }}>
            📩
          </div>
          <div style={{ flex: 1, fontSize: 13, lineHeight: 1.4, fontWeight: 500 }}>
            {resendNotice}
          </div>
          <button
            type="button"
            onClick={() => setResendNotice(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: 16,
              padding: 4,
              borderRadius: 6
            }}
          >
            ✕
          </button>
        </div>
      )}

      <header 
        className={`careers-nav ${isScrolled ? 'careers-nav--scrolled' : ''}`}
        style={{
          position: 'fixed',
          top: (token && user?.role === 'candidate' && !user?.isEmailVerified) ? 36 : 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 99999
        }}
      >
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
            <span
              className="careers-nav__mobile-badge"
              onClick={(e: React.MouseEvent<HTMLSpanElement>) => {
                e.preventDefault();
                e.stopPropagation();
                handleNavClick(e as unknown as React.MouseEvent<HTMLAnchorElement>, 'open-positions');
              }}
            >
              Careers →
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="careers-nav__links careers-nav__links--desktop" aria-label="Main navigation">
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
              user?.role === 'recruiter' || user?.role === 'admin' ? (
                <>
                  <Link to="/dashboard" className="careers-nav__btn-primary">
                    Dashboard
                  </Link>
                  <Link to="/recruiter/candidates" className="careers-nav__btn-secondary">
                    Candidate Pipeline
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="careers-nav__btn-secondary"
                    style={{ cursor: 'pointer' }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/candidate/applications" className="careers-nav__btn-primary">
                    My Applications
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="careers-nav__btn-secondary"
                    style={{ cursor: 'pointer' }}
                  >
                    Sign Out
                  </button>
                </>
              )
            ) : (
              <>
                <Link to="/login" className="careers-nav__btn-secondary">
                  Sign In
                </Link>
                <Link to="/register" className="careers-nav__btn-primary">
                  Get Started →
                </Link>
              </>
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            type="button"
            className="careers-nav__mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Out Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="careers-nav__mobile-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="careers-nav__mobile-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="careers-nav__mobile-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 14,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>H</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-text-primary)' }}>
                  Hire<span style={{ color: 'var(--accent)' }}>Track</span> Navigation
                </span>
              </div>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ padding: 6, cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            <nav className="careers-nav__mobile-links">
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 4 }}>
                Explore Pages
              </span>

              <a
                href="/#open-positions"
                className="careers-nav__mobile-link"
                onClick={(e) => handleNavClick(e, 'open-positions')}
              >
                <Briefcase size={18} style={{ color: 'var(--accent)' }} /> Careers & Roles
              </a>
              <a
                href="/#company-story"
                className="careers-nav__mobile-link"
                onClick={(e) => handleNavClick(e, 'company-story')}
              >
                <Building2 size={18} style={{ color: 'var(--accent)' }} /> About & Culture
              </a>
              <a
                href="/#why-join"
                className="careers-nav__mobile-link"
                onClick={(e) => handleNavClick(e, 'why-join')}
              >
                <Sparkles size={18} style={{ color: 'var(--accent)' }} /> Team Benefits
              </a>
              <a
                href="/#faq"
                className="careers-nav__mobile-link"
                onClick={(e) => handleNavClick(e, 'faq')}
              >
                <HelpCircle size={18} style={{ color: 'var(--accent)' }} /> FAQ
              </a>

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--gray-border)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', display: 'block', marginBottom: 12 }}>
                  Account & Portal
                </span>

                {token ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {user?.role === 'recruiter' || user?.role === 'admin' ? (
                      <>
                        <Link 
                          to="/dashboard" 
                          onClick={() => setIsMobileMenuOpen(false)} 
                          className="careers-nav__mobile-link"
                          style={{ fontWeight: 600, color: 'var(--accent)' }}
                        >
                          <LayoutDashboard size={18} /> Recruiter Dashboard
                        </Link>
                        <Link 
                          to="/recruiter/candidates" 
                          onClick={() => setIsMobileMenuOpen(false)} 
                          className="careers-nav__mobile-link"
                          style={{ fontWeight: 600, color: 'var(--gray-text-primary)' }}
                        >
                          <Users size={18} /> Candidate Pipeline
                        </Link>
                      </>
                    ) : (
                      <Link 
                        to="/candidate/applications" 
                        onClick={() => setIsMobileMenuOpen(false)} 
                        className="careers-nav__mobile-link"
                        style={{ fontWeight: 600, color: 'var(--accent)' }}
                      >
                        <FileText size={18} /> My Applications
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="btn-secondary-lg"
                      style={{ justifyContent: 'center', padding: '12px 16px', fontSize: 14, marginTop: 8 }}
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Link 
                      to="/login" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="careers-nav__mobile-link"
                      style={{ fontWeight: 600, color: 'var(--gray-text-primary)' }}
                    >
                      <LogIn size={18} /> Sign In
                    </Link>
                    <Link 
                      to="/register" 
                      onClick={() => setIsMobileMenuOpen(false)} 
                      className="btn-primary-lg" 
                      style={{ justifyContent: 'center', padding: '12px 16px', textDecoration: 'none' }}
                    >
                      <UserPlus size={18} /> Get Started →
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
    </>
  );
};
