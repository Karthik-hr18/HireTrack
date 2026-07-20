import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Home, Users, Briefcase, Calendar, Settings, LogOut, User, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const [user, setUser] = useState<any | null>(userJson ? JSON.parse(userJson) : null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide Navbar on public Careers pages, Job Details, Candidate Tracker, and Auth pages
  const isCareersHome = location.pathname === '/';
  const isJobDetail = location.pathname.startsWith('/jobs/');
  const isCandidateTracker = location.pathname === '/candidate/applications';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isCareersHome || isJobDetail || isCandidateTracker || isAuthPage) {
    return null;
  }

  useEffect(() => {
    const fetchLatestUser = async () => {
      if (!token) {
        setUser(null);
        return;
      }
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
      } catch (e) {
        console.error('Failed to sync user profile:', e);
      }
    };
    
    fetchLatestUser();
  }, [token]);

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="careers-nav">
        <div className="careers-container">
          <div className="careers-nav__inner">
            
            {/* Logo + Role Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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

              {user && (
                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '3px 9px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'rgba(79, 70, 229, 0.08)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(79, 70, 229, 0.15)'
                }}>
                  {user.role}
                </span>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="careers-nav__links" aria-label="Recruiter Navigation">
              <Link 
                to="/recruiter/candidates" 
                className="careers-nav__link"
                style={location.pathname === '/recruiter/candidates' ? { color: 'var(--gray-text-primary)', fontWeight: 700 } : {}}
              >
                Candidates
              </Link>
              <Link 
                to="/recruiter/jobs" 
                className="careers-nav__link"
                style={location.pathname === '/recruiter/jobs' ? { color: 'var(--gray-text-primary)', fontWeight: 700 } : {}}
              >
                Jobs
              </Link>
              {user?.role === 'admin' && (
                <Link 
                  to="/admin/interviews" 
                  className="careers-nav__link"
                  style={location.pathname === '/admin/interviews' ? { color: 'var(--gray-text-primary)', fontWeight: 700 } : {}}
                >
                  My Interviews
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link 
                  to="/admin/recruiters" 
                  className="careers-nav__link"
                  style={location.pathname === '/admin/recruiters' ? { color: 'var(--gray-text-primary)', fontWeight: 700 } : {}}
                >
                  Recruiters
                </Link>
              )}

              {/* User Profile Pill */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--gray-surface)',
                border: '1px solid var(--gray-border)',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--gray-text-primary)',
              }}>
                <User size={14} style={{ color: 'var(--accent)' }} />
                <span>{user?.name || 'User'}</span>
              </div>

              {/* HAMBURGER MENU BUTTON (3 lines icon) */}
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle Side Menu"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  border: '1px solid var(--gray-border)',
                  backgroundColor: 'var(--gray-surface)',
                  color: 'var(--gray-text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </nav>

          </div>
        </div>
      </header>

      {/* SIDE MENU DRAWER (HAMBURGER SLIDE-OUT PANEL) */}
      {menuOpen && (
        <>
          <div 
            className="side-menu-overlay" 
            onClick={() => setMenuOpen(false)} 
            aria-hidden="true"
          />

          <aside className="side-menu-drawer" aria-label="Side Menu Navigation">
            <div className="side-menu-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 800, color: 'var(--gray-text-primary)' }}>
                <Sparkles size={18} style={{ color: 'var(--accent)' }} /> Menu
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* User Pill Card in Drawer */}
            <div className="side-menu-user-pill">
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-text-primary)', marginBottom: 2 }}>
                {user?.name || 'Recruiter'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-text-muted)', marginBottom: 8 }}>
                {user?.email}
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                color: 'var(--accent)',
                border: '1px solid rgba(79, 70, 229, 0.15)'
              }}>
                {user?.role}
              </span>
            </div>

            {/* Menu Items List */}
            <nav className="side-menu-list">
              {/* HOME OPTION: Navigates to / (lands on root page with Recruiter Dashboard / Candidate Workspace button) */}
              <Link 
                to="/" 
                className="side-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                <Home size={18} style={{ color: 'var(--accent)' }} />
                <span>Home (Careers & Dashboard)</span>
              </Link>

              <Link 
                to="/recruiter/candidates" 
                className={`side-menu-item ${location.pathname === '/recruiter/candidates' ? 'side-menu-item--active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <Users size={18} />
                <span>Candidate Pipeline</span>
              </Link>

              <Link 
                to="/recruiter/jobs" 
                className={`side-menu-item ${location.pathname === '/recruiter/jobs' ? 'side-menu-item--active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <Briefcase size={18} />
                <span>Manage Jobs</span>
              </Link>

              {user?.role === 'admin' && (
                <Link 
                  to="/admin/interviews" 
                  className={`side-menu-item ${location.pathname === '/admin/interviews' ? 'side-menu-item--active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Calendar size={18} />
                  <span>Assigned Interviews</span>
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link 
                  to="/admin/recruiters" 
                  className={`side-menu-item ${location.pathname === '/admin/recruiters' ? 'side-menu-item--active' : ''}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Manage Recruiters</span>
                </Link>
              )}
            </nav>

            {/* Sign Out Button in Drawer */}
            <div style={{ borderTop: '1px solid var(--gray-border)', paddingTop: 16, marginTop: 'auto' }}>
              <button
                type="button"
                onClick={handleLogout}
                className="side-menu-item"
                style={{ width: '100%', color: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </>
      )}
    </>
  );
};
