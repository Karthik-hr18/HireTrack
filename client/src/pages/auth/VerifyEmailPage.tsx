import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { CareersNav } from '../careers/components/CareersNav';
import { CareersFooter } from '../careers/components/CareersFooter';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

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
    <div style={{ backgroundColor: 'var(--gray-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CareersNav />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{
          backgroundColor: '#111827',
          border: '1px solid #1f2937',
          borderRadius: 16,
          padding: '36px 32px',
          maxWidth: 440,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
        }}>
          {status === 'loading' && (
            <div>
              <Loader2 size={48} style={{ color: '#6366f1', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f9fafb', marginBottom: 8 }}>Verifying Email</h2>
              <p style={{ fontSize: 14, color: '#9ca3af' }}>{message}</p>
            </div>
          )}

          {status === 'success' && (
            <div>
              <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f9fafb', marginBottom: 8 }}>Email Verified!</h2>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>{message}</p>
              <Link to="/login" className="btn-primary-lg" style={{ display: 'inline-flex', justifyContent: 'center', width: '100%' }}>
                Sign In to Candidate Portal
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div>
              <XCircle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f9fafb', marginBottom: 8 }}>Verification Failed</h2>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>{message}</p>
              <Link to="/" className="btn-secondary" style={{ display: 'inline-flex', justifyContent: 'center', width: '100%' }}>
                Return to Careers Portal
              </Link>
            </div>
          )}
        </div>
      </main>

      <CareersFooter />
    </div>
  );
};
