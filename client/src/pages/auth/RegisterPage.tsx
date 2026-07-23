import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { CareersNav } from '../careers/components/CareersNav';
import { CareersFooter } from '../careers/components/CareersFooter';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agree) {
      setError('You must agree to the Terms & Conditions.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Create Firebase User
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // 2. Set Display Name on Firebase User
      if (name.trim()) {
        await updateProfile(userCredential.user, { displayName: name.trim() });
      }

      // 3. Send Firebase Email Verification
      await sendEmailVerification(userCredential.user);

      // 4. Retrieve Firebase ID Token & Sync with Backend MongoDB Database
      const idToken = await userCredential.user.getIdToken();
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const syncResponse = await fetch(`${apiUrl}/api/auth/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name: name.trim(), role: 'candidate' })
      });

      if (syncResponse.ok) {
        const syncData = await syncResponse.json();
        localStorage.setItem('token', idToken);
        localStorage.setItem('user', JSON.stringify(syncData.user));
        navigate('/');
      } else {
        localStorage.setItem('token', idToken);
        navigate('/');
      }
    } catch (err: any) {
      let msg = err.message || 'Registration failed';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'A user with this email address already exists.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters long.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--gray-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CareersNav />

      <main className="auth-page-wrapper" style={{ flex: 1 }}>
        <div className="auth-card-wrapper active">
          
          {/* Right Blue/Indigo Toggle Panel (in active state) */}
          <div className="auth-toggle-container">
            <h2>Welcome Back!</h2>
            <p>If you already have an account, log in to access your candidate applications and workspace.</p>
            <Link to="/login" className="auth-switch-btn">
              Sign In
            </Link>

            {/* Social signup buttons */}
            <div className="auth-social-login">
              <div className="auth-social-btn" title="Sign up with Google">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#DB4437" d="M12 11v2h6.1c-.3 1.9-1.9 3.5-3.9 4.1v2.1c3-1 5.1-3.9 5.1-7.2 0-.6-.1-1.2-.2-1.8H12z" />
                  <path fill="#0F9D58" d="M6.3 13.1c-.2-.6-.3-1.3-.3-1.9 0-.6.1-1.2.3-1.8V6.3C3.9 7.7 2.3 9.9 2.3 12.2c0 2.4 1.6 4.6 3.9 5.9l.1-5z" />
                  <path fill="#F4B400" d="M12 7.6c1 0 1.9.3 2.6.9l1.9-1.9C15.6 5 13.9 4.4 12 4.4 9.4 4.4 7.1 5.7 5.6 7.9l1.9 1.8C8.2 9 10 7.6 12 7.6z" />
                  <path fill="#4285F4" d="M21.5 12.2c0-.8-.1-1.6-.3-2.3H12v4.3h5.5c-.2 1.1-.8 2-1.7 2.6l2 1.6c1.3-1.2 2.5-3 2.5-5.2z"/>
                </svg>
              </div>

              <div className="auth-social-btn" title="Sign up with GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#333" d="M12 .5C5.6.5.6 5.4.6 11.8c0 4.9 3.1 9 7.4 10.4.5.1.7-.2.7-.5v-1.8c-3 .6-3.6-1.4-3.6-1.4-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1.1.1 1.7 1.1 1.7 1.1 1 .1 1.7.7 2.1 1.2.1-.9.4-1.6.8-2-2.4-.3-4.9-1.2-4.9-5.3 0-1.2.4-2.2 1-3-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.6 1 .8-.2 1.7-.3 2.6-.3.9 0 1.8.1 2.6.3 1.7-1.3 2.6-1 2.6-1 .5 1.4.2 2.4.1 2.7.6.8 1 1.8 1 3 0 4.1-2.5 5-4.9 5.3.4.4.8 1 .8 2v3c0 .3.2.6.7.5 4.3-1.4 7.4-5.5 7.4-10.4C23.4 5.4 18.4.5 12 .5z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Left White Form Container (in active state) */}
          <div className="auth-form-container">
            <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--gray-text-primary)', marginBottom: 6 }}>
              Create an Account
            </h2>
            <p style={{ fontSize: 14, color: 'var(--gray-text-muted)', marginBottom: 20 }}>
              Get started by creating a candidate account
            </p>

            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--error)', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Email Address</label>
                <input 
                  type="email" 
                  placeholder="name@example.com"
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
              </div>

              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  style={inputStyle}
                  required
                />
              </div>

              {/* Terms and Conditions Checkbox */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <input 
                  type="checkbox" 
                  id="agree"
                  checked={agree}
                  onChange={() => {
                    setAgree(!agree);
                    if (error) setError(null);
                  }}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="agree" style={{ fontSize: 13, color: 'var(--gray-text-muted)', cursor: 'pointer' }}>
                  I agree to the Terms & Conditions
                </label>
              </div>

              <button 
                type="submit" 
                className="btn-primary-lg" 
                style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
                disabled={loading || !agree}
              >
                {loading ? 'Registering...' : 'Register'}
              </button>
            </form>
          </div>

        </div>
      </main>

      <CareersFooter />
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--gray-text-primary)',
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-default)',
  border: '1px solid var(--gray-border)',
  backgroundColor: 'var(--gray-bg)',
  fontSize: 14,
  color: 'var(--gray-text-primary)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box',
};
