import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export const RecruiterNavbar: React.FC = () => {
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
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const freshData = await response.json();
          setUser(freshData);
          localStorage.setItem('user', JSON.stringify(freshData));
        }
      } catch (e) {
        // Fallback to cached user
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

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header 
      style={{ 
        height: 52, 
        minHeight: 52, 
        width: '100%', 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid var(--gray-border)', 
        position: 'sticky',
        top: 0,
        zIndex: 500, 
        boxSizing: 'border-box'
      }}
    >
      <div 
        style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 32px',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
        {/* LEFTMOST — Logo linking to root '/' */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link 
            to="/" 
            aria-label="HireTrack Homepage" 
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
          >
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
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-text-primary)', letterSpacing: '-0.02em' }}>
              Hire<span style={{ color: 'var(--accent)' }}>Track</span>
            </span>
          </Link>
        </div>

        {/* CENTER — Chrome Browser Tabs (Dashboard / Candidates / Jobs) */}
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: 0, display: 'flex', alignItems: 'flex-end' }}>
          <nav style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
            <Link 
              to="/dashboard" 
              style={{
                height: isActive('/dashboard') ? 36 : 32,
                padding: '0 18px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: isActive('/dashboard') ? 700 : 500,
                color: isActive('/dashboard') ? 'var(--gray-text-primary)' : 'var(--gray-text-muted)',
                backgroundColor: isActive('/dashboard') ? 'var(--gray-bg)' : 'transparent',
                borderRadius: '8px 8px 0 0',
                textDecoration: 'none',
                borderTop: isActive('/dashboard') ? '2px solid var(--accent)' : '2px solid transparent',
                borderLeft: isActive('/dashboard') ? '1px solid var(--gray-border)' : '1px solid transparent',
                borderRight: isActive('/dashboard') ? '1px solid var(--gray-border)' : '1px solid transparent',
                borderBottom: isActive('/dashboard') ? '1px solid var(--gray-bg)' : '1px solid transparent',
                marginBottom: -1,
                transition: 'all 0.15s ease',
                zIndex: isActive('/dashboard') ? 2 : 1
              }}
            >
              Dashboard
            </Link>
            <Link 
              to="/recruiter/candidates" 
              style={{
                height: isActive('/recruiter/candidates') ? 36 : 32,
                padding: '0 18px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: isActive('/recruiter/candidates') ? 700 : 500,
                color: isActive('/recruiter/candidates') ? 'var(--gray-text-primary)' : 'var(--gray-text-muted)',
                backgroundColor: isActive('/recruiter/candidates') ? 'var(--gray-bg)' : 'transparent',
                borderRadius: '8px 8px 0 0',
                textDecoration: 'none',
                borderTop: isActive('/recruiter/candidates') ? '2px solid var(--accent)' : '2px solid transparent',
                borderLeft: isActive('/recruiter/candidates') ? '1px solid var(--gray-border)' : '1px solid transparent',
                borderRight: isActive('/recruiter/candidates') ? '1px solid var(--gray-border)' : '1px solid transparent',
                borderBottom: isActive('/recruiter/candidates') ? '1px solid var(--gray-bg)' : '1px solid transparent',
                marginBottom: -1,
                transition: 'all 0.15s ease',
                zIndex: isActive('/recruiter/candidates') ? 2 : 1
              }}
            >
              Candidates
            </Link>
            <Link 
              to="/recruiter/jobs" 
              style={{
                height: isActive('/recruiter/jobs') ? 36 : 32,
                padding: '0 18px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: isActive('/recruiter/jobs') ? 700 : 500,
                color: isActive('/recruiter/jobs') ? 'var(--gray-text-primary)' : 'var(--gray-text-muted)',
                backgroundColor: isActive('/recruiter/jobs') ? 'var(--gray-bg)' : 'transparent',
                borderRadius: '8px 8px 0 0',
                textDecoration: 'none',
                borderTop: isActive('/recruiter/jobs') ? '2px solid var(--accent)' : '2px solid transparent',
                borderLeft: isActive('/recruiter/jobs') ? '1px solid var(--gray-border)' : '1px solid transparent',
                borderRight: isActive('/recruiter/jobs') ? '1px solid var(--gray-border)' : '1px solid transparent',
                borderBottom: isActive('/recruiter/jobs') ? '1px solid var(--gray-bg)' : '1px solid transparent',
                marginBottom: -1,
                transition: 'all 0.15s ease',
                zIndex: isActive('/recruiter/jobs') ? 2 : 1
              }}
            >
              Jobs
            </Link>
            {user?.role === 'admin' && (
              <Link 
                to="/admin/interviews" 
                style={{
                  height: isActive('/admin/interviews') ? 36 : 32,
                  padding: '0 18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: isActive('/admin/interviews') ? 700 : 500,
                  color: isActive('/admin/interviews') ? 'var(--gray-text-primary)' : 'var(--gray-text-muted)',
                  backgroundColor: isActive('/admin/interviews') ? 'var(--gray-bg)' : 'transparent',
                  borderRadius: '8px 8px 0 0',
                  textDecoration: 'none',
                  borderTop: isActive('/admin/interviews') ? '2px solid var(--accent)' : '2px solid transparent',
                  borderLeft: isActive('/admin/interviews') ? '1px solid var(--gray-border)' : '1px solid transparent',
                  borderRight: isActive('/admin/interviews') ? '1px solid var(--gray-border)' : '1px solid transparent',
                  borderBottom: isActive('/admin/interviews') ? '1px solid var(--gray-bg)' : '1px solid transparent',
                  marginBottom: -1,
                  transition: 'all 0.15s ease',
                  zIndex: isActive('/admin/interviews') ? 2 : 1
                }}
              >
                Interviews
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link 
                to="/admin/recruiters" 
                style={{
                  height: isActive('/admin/recruiters') ? 36 : 32,
                  padding: '0 18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: isActive('/admin/recruiters') ? 700 : 500,
                  color: isActive('/admin/recruiters') ? 'var(--gray-text-primary)' : 'var(--gray-text-muted)',
                  backgroundColor: isActive('/admin/recruiters') ? 'var(--gray-bg)' : 'transparent',
                  borderRadius: '8px 8px 0 0',
                  textDecoration: 'none',
                  borderTop: isActive('/admin/recruiters') ? '2px solid var(--accent)' : '2px solid transparent',
                  borderLeft: isActive('/admin/recruiters') ? '1px solid var(--gray-border)' : '1px solid transparent',
                  borderRight: isActive('/admin/recruiters') ? '1px solid var(--gray-border)' : '1px solid transparent',
                  borderBottom: isActive('/admin/recruiters') ? '1px solid var(--gray-bg)' : '1px solid transparent',
                  marginBottom: -1,
                  transition: 'all 0.15s ease',
                  zIndex: isActive('/admin/recruiters') ? 2 : 1
                }}
              >
                Recruiters
              </Link>
            )}
          </nav>
        </div>

        {/* RIGHTMOST — Recruiter Name & Sign Out Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-text-primary)' }}>
            {user?.name || 'Recruiter'}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--gray-text-muted)',
              cursor: 'pointer',
              padding: '4px 10px',
              borderRadius: 'var(--radius-default)',
              border: '1px solid var(--gray-border)',
              backgroundColor: 'transparent'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};
