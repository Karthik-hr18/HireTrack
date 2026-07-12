import React from 'react';
import { Navigate } from 'react-router-dom';
import { AdminDashboard } from '../admin/AdminDashboard';
import { ApplicationsTracker } from '../candidate/ApplicationsTracker';

export const Dashboard: React.FC = () => {
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Choose sub-dashboard according to role type
  const renderRoleDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard token={token} />;
      case 'recruiter':
        return <Navigate to="/recruiter/candidates" replace />;
      case 'candidate':
      default:
        // Re-use candidate tracker component as candidate's personalized dashboard
        return <ApplicationsTracker />;
    }
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>
            Welcome Back, <span className="gradient-text">{user.name}</span>
          </h1>
          <p style={subtitleStyle}>
            Role: <strong style={{ textTransform: 'uppercase', color: 'var(--accent-hover)' }}>{user.role}</strong> | Real-time ATS overview
          </p>
        </div>
      </header>
      
      {renderRoleDashboard()}
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem 1rem',
  textAlign: 'left'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem'
};

const titleStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 800,
  color: 'var(--gray-text-primary)',
  letterSpacing: '-0.02em',
  marginBottom: '0.25rem'
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '15px',
  color: 'var(--gray-text-muted)',
  margin: 0
};
