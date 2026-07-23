import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Verifying your email address...');

  useEffect(() => {
    const doVerify = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing email verification token in URL request.');
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token })
        });

        const data = await response.json();
        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Your email address has been successfully verified.');
          const userJson = localStorage.getItem('user');
          if (userJson) {
            try {
              const userObj = JSON.parse(userJson);
              userObj.isEmailVerified = true;
              localStorage.setItem('user', JSON.stringify(userObj));
            } catch (e) {}
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Invalid or expired verification token.');
        }
      } catch (err) {
        setStatus('error');
        setMessage((err as Error).message || 'Verification request failed. Please try again.');
      }
    };

    doVerify();
  }, [token]);

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
              {message}
            </p>
            <button
              type="button"
              onClick={() => navigate('/login')}
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
              Back to Login
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
