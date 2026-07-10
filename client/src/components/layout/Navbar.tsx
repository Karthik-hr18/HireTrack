import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
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

  return (
    <div style={navWrapperStyle}>
      <nav style={navStyle}>
        <div style={logoContainerStyle}>
          <Link to="/" style={logoStyle}>
            Hire<span className="gradient-text">Track</span>
          </Link>
          {user && (
            <span style={roleBadgeStyle}>
              {user.role.toUpperCase()}
            </span>
          )}
        </div>

        <div style={linksContainerStyle}>
          <Link to="/" style={linkStyle}>
            Browse Jobs
          </Link>

          {user && user.role === 'candidate' && (
            <Link to="/candidate/applications" style={linkStyle}>
              My Applications
            </Link>
          )}

          {user && (user.role === 'recruiter' || user.role === 'admin') && (
            <Link to="/recruiter/jobs" style={linkStyle}>
              Manage Jobs
            </Link>
          )}

          {user && user.role === 'admin' && (
            <Link to="/admin/interviews" style={linkStyle}>
              My Interviews
            </Link>
          )}

          {token ? (
            <div style={authSectionStyle}>
              <span style={userNameStyle}>{user?.name}</span>
              <button onClick={handleLogout} style={logoutBtnStyle}>
                Sign Out
              </button>
            </div>
          ) : (
            <div style={authSectionStyle}>
              <Link to="/login" style={loginLinkStyle}>
                Sign In
              </Link>
              <Link to="/register" className="api-btn" style={signUpBtnStyle}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

// Styles
const navWrapperStyle: React.CSSProperties = {
  width: '100%',
  marginBottom: 'var(--space-4)'
};
const navStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 'var(--space-3) 0',
  borderBottom: '1px solid var(--gray-border)'
};

const logoContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-3)'
};

const logoStyle: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 800,
  textDecoration: 'none',
  color: 'var(--gray-text-primary)',
  letterSpacing: '-0.02em'
};

const roleBadgeStyle: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  padding: 'var(--space-1) var(--space-2)',
  borderRadius: '4px',
  backgroundColor: 'var(--accent-glow)',
  color: 'var(--accent-hover)',
  border: '1px solid rgba(99, 102, 241, 0.2)',
  letterSpacing: '0.05em'
};

const linksContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-5)'
};

const linkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: 'var(--gray-text-muted)',
  fontSize: '15px',
  fontWeight: 500,
  transition: 'color var(--transition-speed)'
};

const authSectionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-4)'
};

const userNameStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--gray-text-primary)',
  fontWeight: 600
};

const logoutBtnStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--gray-border)',
  color: 'var(--gray-text-muted)',
  padding: '6px 12px',
  borderRadius: 'var(--radius-default)',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
  transition: 'all var(--transition-speed)'
};

const loginLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: 'var(--gray-text-muted)',
  fontSize: '15px',
  fontWeight: 600
};

const signUpBtnStyle: React.CSSProperties = {
  minHeight: '36px',
  padding: '0 var(--space-3)',
  fontSize: '13px'
};
