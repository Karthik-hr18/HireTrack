import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const ApplicationsTracker: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/applications/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load application tracker information.');
        }

        const data = await response.json();
        setApplications(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token, navigate]);

  const getStageBadgeStyle = (stage: string) => {
    switch (stage) {
      case 'applied':
        return { backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' };
      case 'technical':
      case 'behavioral':
        return { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'offer':
        return { backgroundColor: 'rgba(167, 139, 250, 0.15)', color: '#c084fc', border: '1px solid rgba(167, 139, 250, 0.3)' };
      case 'hired':
        return { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'rejected':
        return { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
      default:
        return { backgroundColor: 'var(--gray-bg)', color: 'var(--gray-text-muted)', border: '1px solid var(--gray-border)' };
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--gray-text-muted)' }}>Loading your applications...</h2>
          <div style={spinnerStyle}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h2 style={{ color: 'var(--error)' }}>Sync Failed</h2>
          <p style={{ color: 'var(--gray-text-muted)', margin: '1rem 0 2rem' }}>{error}</p>
          <button className="api-btn" onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>Application <span className="gradient-text">Tracker</span></h1>
        <p style={subtitleStyle}>Monitor your interview pipelines and offer stages in real-time</p>
      </header>

      {applications.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--gray-text-muted)', marginBottom: '1rem' }}>No Submissions Found</h2>
          <p style={{ color: 'var(--gray-text-muted)', maxWidth: '400px', margin: '0 auto 2rem' }}>
            You haven't applied to any job postings yet. Find an opening on our careers board to kick off your application!
          </p>
          <Link to="/" className="api-btn" style={{ textDecoration: 'none' }}>
            Explore Openings
          </Link>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Position</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Applied Date</th>
                <th style={thStyle}>Stage Status</th>
                <th style={thStyle}>Uploaded Resume</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} style={tableRowStyle}>
                  <td style={tdTitleStyle}>{app.job?.title || 'Unknown Position'}</td>
                  <td style={tdStyle}>{app.job?.location || 'N/A'}</td>
                  <td style={tdStyle}>
                    {new Date(app.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td style={tdStyle}>
                    <span 
                      className="badge" 
                      style={{ ...badgeStyle, ...getStageBadgeStyle(app.stage) }}
                    >
                      {app.stage}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <a 
                      href={app.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={resumeLinkStyle}
                    >
                      📄 View Resume PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  maxWidth: '1000px',
  margin: '0 auto',
  padding: 'var(--space-2) 0',
  textAlign: 'left'
};

const headerStyle: React.CSSProperties = {
  marginBottom: 'var(--space-6)'
};

const titleStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 800,
  margin: '0 0 var(--space-2) 0',
  color: 'var(--gray-text-primary)'
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '15px',
  color: 'var(--gray-text-muted)',
  margin: 0
};

const spinnerStyle: React.CSSProperties = {
  width: '35px',
  height: '35px',
  border: '3px solid rgba(255, 255, 255, 0.1)',
  borderTop: '3px solid var(--accent)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '2rem auto 0 auto'
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: '14px'
};

const tableHeaderRowStyle: React.CSSProperties = {
  backgroundColor: '#0f172a',
  borderBottom: '1px solid var(--gray-border)'
};

const thStyle: React.CSSProperties = {
  padding: 'var(--space-4) var(--space-5)',
  fontWeight: 600,
  color: 'var(--gray-text-primary)'
};

const tableRowStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--gray-border)'
};

const tdStyle: React.CSSProperties = {
  padding: 'var(--space-4) var(--space-5)',
  color: 'var(--gray-text-muted)',
  verticalAlign: 'middle'
};

const tdTitleStyle: React.CSSProperties = {
  padding: 'var(--space-4) var(--space-5)',
  color: 'var(--gray-text-primary)',
  fontWeight: 600,
  verticalAlign: 'middle'
};

const badgeStyle: React.CSSProperties = {
  textTransform: 'capitalize'
};

const resumeLinkStyle: React.CSSProperties = {
  color: 'var(--accent-hover)',
  textDecoration: 'none',
  fontWeight: 600
};
