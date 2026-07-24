import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, RefreshCw } from 'lucide-react';
import { auth } from '../../config/firebase';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'unverified' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Checking email verification status...');

  const checkVerification = async () => {
    try {
      setStatus('loading');
      if (!auth.currentUser) {
        setStatus('unverified');
        setMessage('Please log in to your account to verify your email status.');
        return;
      }

      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setStatus('success');
        setMessage('Your email address has been verified successfully!');

        const idToken = await auth.currentUser.getIdToken(true);
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const syncRes = await fetch(`${apiUrl}/api/auth/sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({})
        });

        if (syncRes.ok) {
          const syncData = await syncRes.json();
          localStorage.setItem('token', idToken);
          localStorage.setItem('user', JSON.stringify(syncData.user));
        }

        setTimeout(() => {
          navigate('/');
        }, 1800);
      } else {
        setStatus('unverified');
        setMessage('Your email address is not yet verified. Please check your inbox for the link.');
      }
    } catch (err: unknown) {
      setStatus('error');
      setMessage((err as Error).message || 'Failed to verify email status.');
    }
  };

  useEffect(() => {
    checkVerification();
  }, []);

  return (
    <div style={{ backgroundColor: '#090d16', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
        <span style={{ 
          width: 34, 
          height: 34, 
          borderRadius: 8, 
          backgroundColor: '#6366f1', 
          color: '#ffffff', 
          fontWeight: 800, 
          fontSize: 18, 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>H</span>
        <span style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
          Hire<span style={{ color: '#6366f1' }}>Track</span>
        </span>
      </div>

      <div style={{
        backgroundColor: '#111827',
        border: '1px solid #1f2937',
        borderRadius: 20,
        padding: '40px 32px',
        maxWidth: 420,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        {status === 'loading' && (
          <div>
            <Loader2 size={48} style={{ color: '#6366f1', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', marginBottom: 8 }}>Verifying Email...</h2>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <CheckCircle2 size={52} style={{ color: '#10b981', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', marginBottom: 8 }}>Email Verified!</h2>
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 28, lineHeight: 1.5 }}>
              Your account has been activated. Redirecting you to the Careers Portal...
            </p>
            <button
              type="button"
              onClick={() => {
                const authToken = localStorage.getItem('token');
                navigate(authToken ? '/' : '/login');
              }}
              style={{
                width: '100%',
                backgroundColor: '#6366f1',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                padding: '13px 20px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
              }}
            >
              Continue to Careers Portal →
            </button>
          </div>
        )}

        {status === 'unverified' && (
          <div>
            <Loader2 size={48} style={{ color: '#f59e0b', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', marginBottom: 8 }}>Email Unverified</h2>
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 28, lineHeight: 1.5 }}>{message}</p>
            <button
              type="button"
              onClick={checkVerification}
              style={{
                width: '100%',
                backgroundColor: '#6366f1',
                color: '#ffffff',
                border: 'none',
                borderRadius: 12,
                padding: '13px 20px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
              }}
            >
              <RefreshCw size={16} /> Refresh Verification Status
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <XCircle size={52} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', marginBottom: 8 }}>Verification Failed</h2>
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 28, lineHeight: 1.5 }}>{message}</p>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                backgroundColor: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
                borderRadius: 12,
                padding: '13px 20px',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
