import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Registration failed');
      }

      // Auto login after successful signup
      const loginResponse = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        navigate('/');
      } else {
        navigate('/login');
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authContainerStyle}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Create Account</h2>
        <p style={{ color: 'var(--gray-text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '2rem' }}>
          Sign up to track and submit applications.
        </p>

        {error && (
          <div style={errorContainerStyle}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label>Full Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required
            />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          <div style={{ marginBottom: '1.25rem' }}>
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
          <div style={{ marginBottom: '1.75rem' }}>
            <label>Confirm Password</label>
            <input 
              type="password" 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required
            />
          </div>

          <button 
            type="submit" 
            className="api-btn" 
            style={{ width: '100%', minHeight: '44px' }}
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ fontSize: '14px', textAlign: 'center', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-hover)', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

// Styles
const authContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '70vh',
  padding: 'var(--space-4) 0'
};

const errorContainerStyle: React.CSSProperties = {
  color: 'var(--error)',
  backgroundColor: 'rgba(239, 68, 68, 0.08)',
  padding: 'var(--space-3)',
  borderRadius: 'var(--radius-default)',
  fontSize: '14px',
  marginBottom: 'var(--space-4)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  textAlign: 'center'
};
