import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    
    const targetEmail = customEmail || email;
    const targetPassword = customPassword || password;

    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: targetPassword })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Authentication failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redirect depending on user role
      if (data.user.role === 'admin' || data.user.role === 'recruiter') {
        navigate('/recruiter/jobs');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError((err as Error).message);
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
      demoEmail = 'recruiter1@hiretrack.com';
      demoPassword = 'Recruiter@123';
    } else if (role === 'candidate') {
      demoEmail = 'candidate@hiretrack.com';
      demoPassword = 'Candidate@123';
    }

    setEmail(demoEmail);
    setPassword(demoPassword);
    handleLogin({ preventDefault: () => {} } as any, demoEmail, demoPassword);
  };

  return (
    <div style={authContainerStyle}>
      <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '2.5rem' }}>
        <h2 style={{ marginBottom: '0.5rem', textAlign: 'center' }}>Welcome Back</h2>
        <p style={{ color: 'var(--gray-text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '2rem' }}>
          Sign in to manage your job application pipeline.
        </p>

        {error && (
          <div style={errorContainerStyle}>
            {error}
          </div>
        )}

        <form onSubmit={(e) => handleLogin(e)}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          <div style={{ marginBottom: '1.75rem' }}>
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          <button 
            type="submit" 
            className="api-btn" 
            style={{ width: '100%', minHeight: '44px', marginBottom: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <p style={{ fontSize: '14px', textAlign: 'center', margin: '1rem 0' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-hover)', textDecoration: 'none', fontWeight: 600 }}>
            Sign Up
          </Link>
        </p>

        <div style={demoCardStyle}>
          <h4 style={demoTitleStyle}>⚡ Demo Logins (Seeded accounts)</h4>
          <div style={demoButtonsContainerStyle}>
            <button onClick={() => handleDemoLogin('admin')} style={demoBtnStyle}>
              Admin
            </button>
            <button onClick={() => handleDemoLogin('recruiter')} style={demoBtnStyle}>
              Recruiter 1
            </button>
            <button onClick={() => handleDemoLogin('candidate')} style={demoBtnStyle}>
              Candidate
            </button>
          </div>
        </div>
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

const demoCardStyle: React.CSSProperties = {
  marginTop: '2rem',
  padding: '1.25rem',
  backgroundColor: 'var(--gray-bg)',
  border: '1px dashed var(--gray-border)',
  borderRadius: 'var(--radius-default)'
};

const demoTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: 'var(--gray-text-primary)',
  marginBottom: '0.75rem',
  textAlign: 'center'
};

const demoButtonsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '8px',
  justifyContent: 'center'
};

const demoBtnStyle: React.CSSProperties = {
  flex: 1,
  padding: '8px 4px',
  borderRadius: 'var(--radius-input)',
  backgroundColor: 'var(--gray-surface)',
  border: '1px solid var(--gray-border)',
  color: 'var(--gray-text-primary)',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all var(--transition-speed)',
  textAlign: 'center'
};
