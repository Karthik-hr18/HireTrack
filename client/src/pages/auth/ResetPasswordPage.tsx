import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Missing password reset token in URL.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password.');
      }

      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

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
          borderRadius: 16,
          padding: '36px 32px',
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
        }}>
          {success ? (
            <div style={{ textAlign: 'center' }}>
              <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 16px' }} />
              <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', marginBottom: 8 }}>Password Reset Complete!</h2>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24, lineHeight: 1.5 }}>
                Your password has been successfully updated. You can now log in with your new password.
              </p>
              <button 
                type="button" 
                onClick={() => navigate('/login')} 
                className="btn-primary-lg" 
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Sign In Now
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <ShieldCheck size={26} style={{ color: '#6366f1' }} />
                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#f9fafb', margin: 0 }}>Reset Your Password</h2>
              </div>
              <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 24 }}>
                Enter your new password below to secure your HireTrack candidate account.
              </p>

              {error && (
                <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={labelStyle}>New Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={inputStyle}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={eyeBtnStyle}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Confirm New Password</label>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={inputStyle}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary-lg" 
                  style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
                  disabled={loading}
                >
                  {loading ? 'Updating Password...' : 'Reset Password'}
                </button>
              </form>
            </div>
          )}
        </div>
    </div>
  );
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#f9fafb',
  marginBottom: 6
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 8,
  border: '1px solid #374151',
  backgroundColor: '#0b0f19',
  fontSize: 14,
  color: '#f9fafb',
  boxSizing: 'border-box'
};

const eyeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  color: '#9ca3af',
  cursor: 'pointer'
};
