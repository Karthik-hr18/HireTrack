import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const [user, setUser] = useState<any | null>(userJson ? JSON.parse(userJson) : null);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  // Hide Navbar on public Careers pages, Job Details, Candidate Workspace (/recruiter/candidates), Candidate Tracker, and Auth pages
  const isCareersHome = location.pathname === '/';
  const isJobDetail = location.pathname.startsWith('/jobs/');
  const isCandidateWorkspace = location.pathname === '/recruiter/candidates';
  const isCandidateTracker = location.pathname === '/candidate/applications';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isCareersHome || isJobDetail || isCandidateWorkspace || isCandidateTracker || isAuthPage) {
    return null;
  }

  return (
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

          {/* Navigation Links */}
          <nav className="careers-nav__links" aria-label="Recruiter Navigation">
            <Link 
              to="/dashboard" 
              className="careers-nav__link"
              style={location.pathname === '/dashboard' ? { color: 'var(--gray-text-primary)', fontWeight: 700 } : {}}
            >
              Dashboard
            </Link>
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

            {/* Sign Out Button */}
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
                borderRadius: 'var(--radius-pill)'
              }}
            >
              <LogOut size={15} />
              <span>Sign Out</span>
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
};
