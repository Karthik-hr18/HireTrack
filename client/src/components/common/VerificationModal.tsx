import React, { useState, useEffect } from 'react';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  token?: string | null;
  customMessage?: string;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  token,
  customMessage
}) => {
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Auto-detect verification across devices/tabs (polls /api/auth/me and listens to tab focus)
  useEffect(() => {
    if (!isOpen || !token) return;

    const checkStatus = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiUrl}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.isEmailVerified) {
            // Update local storage and close modal
            const userJson = localStorage.getItem('user');
            const currentUser = userJson ? JSON.parse(userJson) : {};
            localStorage.setItem('user', JSON.stringify({ ...currentUser, isEmailVerified: true }));
            onClose();
          }
        }
      } catch (err) {}
    };

    // Poll every 3 seconds
    const interval = setInterval(checkStatus, 3000);

    // Also check immediately when user switches back to this tab/window
    const handleFocus = () => {
      checkStatus();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, [isOpen, token, onClose]);

  if (!isOpen) return null;

  const handleResend = async () => {
    try {
      setSending(true);
      setNotice(null);
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
      setNotice(data.message || 'Verification link sent to your inbox!');
    } catch (err) {
      setNotice('Failed to dispatch verification email. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: 16
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: '#111827',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 24,
          padding: '36px 28px',
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(14, 165, 233, 0.15)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            fontSize: 20,
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 8
          }}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Header Title */}
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', margin: '0 0 10px 0', letterSpacing: '-0.02em' }}>
          Check your email!
        </h2>

        {/* Subtitle / Description */}
        <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 20px 0', lineHeight: 1.55 }}>
          {customMessage || (
            <>
              We have sent a verification link to{' '}
              <strong style={{ color: '#f3f4f6' }}>{userEmail || 'your email address'}</strong>.
              Click and follow the link inside it to activate your account.
            </>
          )}
        </p>

        {/* Paper Airplane Vector Illustration */}
        <div style={{ margin: '10px 0 24px 0', width: 140, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="130" height="110" viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M10 100 Q 50 110 80 80 T 60 40 T 110 30" 
              stroke="#0284c7" 
              strokeWidth="2.5" 
              strokeLinecap="round"
              fill="none"
              strokeDasharray="4 4"
            />
            <path 
              d="M70 30 L125 15 L105 70 L90 50 L70 30 Z" 
              fill="#0ea5e9" 
            />
            <path 
              d="M125 15 L90 50 L100 45 Z" 
              fill="#38bdf8" 
            />
          </svg>
        </div>

        {/* Status Notice */}
        {notice && (
          <div style={{
            backgroundColor: 'rgba(14, 165, 233, 0.12)',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            color: '#38bdf8',
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 16,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            📩 {notice}
          </div>
        )}

        {/* Actions */}
        <button
          type="button"
          onClick={handleResend}
          disabled={sending}
          style={{
            width: '100%',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: 12,
            padding: '13px 20px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
            transition: 'all 0.2s ease',
            marginBottom: 12
          }}
        >
          {sending ? 'Resending Email...' : 'Resend Verification Email'}
        </button>

        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Explore Careers First
        </button>
      </div>
    </div>
  );
};
