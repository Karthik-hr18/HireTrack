import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Linkedin, Github, CheckCircle2 } from 'lucide-react';

export const CareersFooter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer style={{ backgroundColor: '#0b0f19', color: '#94a3b8', padding: '80px 0 40px', borderTop: '1px solid #1e293b' }}>
      <div className="careers-container">
        <div className="careers-footer-grid">
          {/* Brand Col */}
          <div>
            <Link to="/" style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <span style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: 'var(--accent)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>H</span>
              Hire<span style={{ color: 'var(--accent)' }}>Track</span>
            </Link>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: '#94a3b8', marginBottom: 24, maxWidth: 300 }}>
              Augment your talent acquisition across the world with intuitive candidate workspaces and evaluation tools.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <a href="https://github.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>
                <Github size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', transition: 'color 0.2s' }}>
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
              Product
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <li><a href="#open-positions" style={{ color: '#94a3b8', textDecoration: 'none' }}>Careers</a></li>
              <li><Link to="/recruiter/jobs" style={{ color: '#94a3b8', textDecoration: 'none' }}>Manage Jobs</Link></li>
              <li><Link to="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Recruiter Login</Link></li>
              <li><a href="#why-join" style={{ color: '#94a3b8', textDecoration: 'none' }}>Benefits</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
              Company
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12, fontSize: 14 }}>
              <li><a href="#company-story" style={{ color: '#94a3b8', textDecoration: 'none' }}>About Us</a></li>
              <li><a href="#company-story" style={{ color: '#94a3b8', textDecoration: 'none' }}>Culture</a></li>
              <li><a href="#faq" style={{ color: '#94a3b8', textDecoration: 'none' }}>FAQ</a></li>
              <li><a href="#open-positions" style={{ color: '#94a3b8', textDecoration: 'none' }}>Open Roles</a></li>
            </ul>
          </div>

          {/* Newsletter Form */}
          <div>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 20 }}>
              Stay up to date
            </h4>
            <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 16 }}>
              Receive monthly updates on open engineering roles and hiring insights.
            </p>
            {subscribed ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', fontSize: 14, fontWeight: 600 }}>
                <CheckCircle2 size={18} /> You're subscribed!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 8 }}>
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    height: 40,
                    padding: '0 12px',
                    borderRadius: 8,
                    border: '1px solid #334155',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontSize: 13,
                  }}
                />
                <button
                  type="submit"
                  style={{
                    height: 40,
                    padding: '0 16px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom copyright */}
        <div style={{ borderTop: '1px solid #1e293b', paddingTop: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, fontSize: 13 }}>
          <div>
            © {new Date().getFullYear()} HireTrack Inc. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <span style={{ color: '#64748b' }}>Privacy Policy</span>
            <span style={{ color: '#64748b' }}>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
