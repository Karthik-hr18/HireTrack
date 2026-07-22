import React from 'react';
import { Link } from 'react-router-dom';
import { Monitor, ArrowLeft, Briefcase, LogOut } from 'lucide-react';

export const RecruiterMobileGuard: React.FC = () => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      backgroundColor: '#f8fafc',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      textAlign: 'center',
      boxSizing: 'border-box'
    }}>
      {/* Container Card */}
      <div style={{
        maxWidth: 480,
        width: '100%',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 20,
        padding: '40px 28px',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)'
      }}>
        {/* HireTrack Logo */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <span style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: '#4f46e5',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: 18,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            H
          </span>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            Hire<span style={{ color: '#4f46e5' }}>Track</span>
          </span>
        </div>

        {/* Icon Illustration */}
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          backgroundColor: '#eff6ff',
          color: '#2563eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          border: '1px solid #bfdbfe'
        }}>
          <Monitor size={32} />
        </div>

        {/* Heading */}
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 12, lineHeight: 1.3, letterSpacing: '-0.02em' }}>
          Workspace Optimized for Desktop & Tablet
        </h2>

        {/* Body Text */}
        <p style={{ fontSize: 14.5, color: '#64748b', lineHeight: 1.6, marginBottom: 28 }}>
          HireTrack Recruiter Workspace is engineered as a high-density productivity tool for desktop, laptop, and tablet screens. Please open the portal on a larger screen for full recruiting capabilities.
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 44,
              borderRadius: 10,
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)'
            }}
          >
            <ArrowLeft size={16} /> Return to Public Home
          </Link>

          <Link
            to="/#open-positions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              height: 44,
              borderRadius: 10,
              backgroundColor: '#ffffff',
              color: '#0f172a',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
              border: '1px solid #cbd5e1'
            }}
          >
            <Briefcase size={16} /> Explore Careers
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              height: 40,
              borderRadius: 10,
              backgroundColor: 'transparent',
              color: '#64748b',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              marginTop: 4
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
