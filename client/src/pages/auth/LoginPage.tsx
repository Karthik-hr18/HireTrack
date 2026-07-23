import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, Sparkles } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { CareersNav } from '../careers/components/CareersNav';
import { CareersFooter } from '../careers/components/CareersFooter';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal State
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;

    try {
      setForgotLoading(true);
      setForgotMessage(null);

      await sendPasswordResetEmail(auth, forgotEmail.trim());
      setForgotMessage('Password reset email dispatched! Please check your inbox.');
    } catch (err: any) {
      let msg = err.message || 'Failed to send reset email';
      if (err.code === 'auth/user-not-found') {
        msg = 'If an account with that email exists, a password reset link has been dispatched.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      }
      setForgotMessage(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    
    const targetEmail = customEmail || email;
    const targetPassword = customPassword || password;

    try {
      setLoading(true);
      setError(null);

      // 1. Authenticate via Firebase Client SDK
      const userCredential = await signInWithEmailAndPassword(auth, targetEmail.trim(), targetPassword);

      // 2. Retrieve Firebase ID Token
      const idToken = await userCredential.user.getIdToken();
      const apiUrl = import.meta.env.VITE_API_URL || '';

      // 3. Sync & Retrieve MongoDB User Profile from Backend
      const syncRes = await fetch(`${apiUrl}/api/auth/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({})
      });

      if (!syncRes.ok) {
        throw new Error('Failed to synchronize user profile.');
      }

      const syncData = await syncRes.json();
      localStorage.setItem('token', idToken);
      localStorage.setItem('user', JSON.stringify(syncData.user));

      if (syncData.user.role === 'recruiter' || syncData.user.role === 'admin') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      let errorMessage = 'Invalid email or password.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (role: 'admin' | 'recruiter' | 'candidate') => {
    let demoEmail = '';
    let demoPassword = '';

    if (role === 'admin') {
      demoEmail = 'karthikhr676@gmail.com';
      demoPassword = 'Karthik@64';
    } else if (role === 'recruiter') {
      demoEmail = 'sarah.j@hiretrack.io';
      demoPassword = 'RecruiterPass123!';
    } else if (role === 'candidate') {
      demoEmail = 'karthik.h.r@example.com';
      demoPassword = 'CandidatePass123!';
    }

    setEmail(demoEmail);
    setPassword(demoPassword);
    handleLogin(undefined, demoEmail, demoPassword);
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CareersNav />

      <main className="auth-page-wrapper" style={{ flex: 1 }}>
        <div className="auth-card-wrapper">
          
          {/* Left Blue/Indigo Toggle Panel */}
          <div className="auth-toggle-container">
            <h2>New here?</h2>
            <p>Create an account and explore job opportunities across engineering and design.</p>
            <Link to="/register" className="auth-switch-btn">
              Create Account
            </Link>

            {/* Social login buttons */}
            <div className="auth-social-login">
              <div className="auth-social-btn" title="Sign in with Google">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#DB4437" d="M12 11v2h6.1c-.3 1.9-1.9 3.5-3.9 4.1v2.1c3-1 5.1-3.9 5.1-7.2 0-.6-.1-1.2-.2-1.8H12z" />
                  <path fill="#0F9D58" d="M6.3 13.1c-.2-.6-.3-1.3-.3-1.9 0-.6.1-1.2.3-1.8V6.3C3.9 7.7 2.3 9.9 2.3 12.2c0 2.4 1.6 4.6 3.9 5.9l.1-5z" />
                  <path fill="#F4B400" d="M12 7.6c1 0 1.9.3 2.6.9l1.9-1.9C15.6 5 13.9 4.4 12 4.4 9.4 4.4 7.1 5.7 5.6 7.9l1.9 1.8C8.2 9 10 7.6 12 7.6z" />
                  <path fill="#4285F4" d="M21.5 12.2c0-.8-.1-1.6-.3-2.3H12v4.3h5.5c-.2 1.1-.8 2-1.7 2.6l2 1.6c1.3-1.2 2.5-3 2.5-5.2z"/>
                </svg>
              </div>

              <div className="auth-social-btn" title="Sign in with GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#333" d="M12 .5C5.6.5.6 5.4.6 11.8c0 4.9 3.1 9 7.4 10.4.5.1.7-.2.7-.5v-1.8c-3 .6-3.6-1.4-3.6-1.4-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.7.7 2.1 1.2.1-.9.4-1.6.8-2-2.4-.3-4.9-1.2-4.9-5.3 0-1.2.4-2.2 1-3-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.6 1 .8-.2 1.7-.3 2.6-.3.9 0 1.8.1 2.6.3 1.7-1.3 2.6-1 2.6-1 .5 1.4.2 2.4.1 2.7.6.8 1 1.8 1 3 0 4.1-2.5 5-4.9 5.3.4.4.8 1 .8 2v3c0 .3.2.6.7.5 4.3-1.4 7.4-5.5 7.4-10.4C23.4 5.4 18.4.5 12 .5z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Right White Form Container */}
          <div className="auth-form-container">
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-text-primary)', marginBottom: 6 }}>
              Welcome Back!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--gray-text-muted)', marginBottom: 24 }}>
              Sign in to access your HireTrack workspace
            </p>

            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--error)', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={(e) => handleLogin(e)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="enter your email..."
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Password</label>
                <div className="input-with-eye">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    style={inputStyle}
                    required
                  />
                  <button
                    type="button"
                    className="eye-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div style={{ textAlign: 'right', marginTop: 6 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setIsForgotPasswordModalOpen(true);
                    }}
                    style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary-lg" 
                style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Quick Demo Logins Card */}
            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--gray-border)' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--gray-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={13} style={{ color: 'var(--accent)' }} /> Quick Demo Logins
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  onClick={() => handleDemoLogin('admin')}
                  style={demoBtnStyle}
                >
                  Admin
                </button>
                <button 
                  type="button" 
                  onClick={() => handleDemoLogin('recruiter')}
                  style={demoBtnStyle}
                >
                  Recruiter
                </button>
                <button 
                  type="button" 
                  onClick={() => handleDemoLogin('candidate')}
                  style={demoBtnStyle}
                >
                  Candidate
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Forgot Password Modal */}
      {isForgotPasswordModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999999,
            padding: 16
          }}
          onClick={() => setIsForgotPasswordModalOpen(false)}
        >
          <div 
            style={{
              backgroundColor: '#111827',
              border: '1px solid #1f2937',
              borderRadius: 16,
              padding: 28,
              maxWidth: 420,
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#f9fafb', marginBottom: 8 }}>Forgot Password</h3>
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20, lineHeight: 1.5 }}>
              Enter your account email below to receive a single-use password reset link.
            </p>

            {forgotMessage && (
              <div style={{ backgroundColor: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', padding: '12px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 16 }}>
                📩 {forgotMessage}
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#f9fafb', marginBottom: 6 }}>Email Address</label>
                <input 
                  type="email"
                  placeholder="enter your account email..."
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #374151', backgroundColor: '#0b0f19', fontSize: 14, color: '#f9fafb', boxSizing: 'border-box' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button 
                  type="button" 
                  onClick={() => setIsForgotPasswordModalOpen(false)} 
                  className="btn-secondary" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary-lg" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={forgotLoading}
                >
                  {forgotLoading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CareersFooter />
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--gray-text-primary)',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 'var(--radius-default)',
  border: '1px solid var(--gray-border)',
  backgroundColor: 'var(--gray-bg)',
  fontSize: 14,
  color: 'var(--gray-text-primary)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};

const demoBtnStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 600,
  borderRadius: 'var(--radius-pill)',
  border: '1px solid var(--gray-border)',
  backgroundColor: 'var(--gray-bg)',
  color: 'var(--gray-text-primary)',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'all 0.15s ease',
};
