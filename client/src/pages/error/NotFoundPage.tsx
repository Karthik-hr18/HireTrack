import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={containerStyle}>
      <div className="card" style={cardStyle}>
        <div style={iconStyle}>🔍</div>
        <h1 style={titleStyle}>404</h1>
        <h2 style={subtitleStyle}>Page Not Found</h2>
        <p style={descriptionStyle}>
          The link you followed may be broken, or the page may have been removed. Let's get you back on track!
        </p>
        <div style={buttonContainerStyle}>
          <Link to="/" className="api-btn" style={homeBtnStyle}>
            🏠 Go to Careers Portal
          </Link>
          <Link to="/dashboard" style={dashboardBtnStyle}>
            📊 Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  minHeight: '80vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem 1rem',
  boxSizing: 'border-box'
};

const cardStyle: React.CSSProperties = {
  maxWidth: '500px',
  width: '100%',
  padding: '3rem 2rem',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '12px'
};

const iconStyle: React.CSSProperties = {
  fontSize: '64px',
  marginBottom: '0.5rem',
  animation: 'pulse 2s infinite'
};

const titleStyle: React.CSSProperties = {
  fontSize: '72px',
  fontWeight: 900,
  margin: 0,
  lineHeight: 1,
  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent'
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 700,
  color: 'var(--gray-text-primary)',
  margin: 0
};

const descriptionStyle: React.CSSProperties = {
  fontSize: '15px',
  color: 'var(--gray-text-muted)',
  lineHeight: 1.6,
  margin: '0.5rem 0 1.5rem 0',
  maxWidth: '380px'
};

const buttonContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  gap: '12px'
};

const homeBtnStyle: React.CSSProperties = {
  textDecoration: 'none',
  padding: '12px',
  width: '100%',
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const dashboardBtnStyle: React.CSSProperties = {
  textDecoration: 'none',
  padding: '12px',
  width: '100%',
  boxSizing: 'border-box',
  backgroundColor: 'transparent',
  border: '1px solid var(--gray-border)',
  color: 'var(--gray-text-muted)',
  borderRadius: 'var(--radius-default)',
  fontWeight: 600,
  fontSize: '14px',
  textAlign: 'center',
  display: 'inline-block',
  transition: 'all 0.2s'
};
