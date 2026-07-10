import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface RecruiterDashboardProps {
  token: string;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({ token }) => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/analytics/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to retrieve recruiter metrics');
        }

        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [token]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ color: 'var(--gray-text-muted)' }}>Syncing recruiter metrics...</h2>
        <div style={spinnerStyle}></div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div style={errorContainerStyle}>
        ⚠️ Failed to load metrics: {error || 'Unknown error'}
      </div>
    );
  }

  const { totalActiveJobs, totalApplications, needsAttention } = metrics;

  return (
    <div>
      {/* Recruiter Stats Cards */}
      <div style={statsGridStyle}>
        <div className="card" style={statCardStyle}>
          <div style={statHeaderStyle}>
            <span style={statTitleStyle}>Active Job Openings</span>
            <span style={iconStyle}>💼</span>
          </div>
          <div style={statNumberStyle}>{totalActiveJobs}</div>
          <p style={statSubStyle}>Live careers pages receiving applicants</p>
        </div>

        <div className="card" style={statCardStyle}>
          <div style={statHeaderStyle}>
            <span style={statTitleStyle}>Total Applications</span>
            <span style={iconStyle}>📄</span>
          </div>
          <div style={statNumberStyle}>{totalApplications}</div>
          <p style={statSubStyle}>Applicants processed inside pipeline</p>
        </div>

        <div className="card" style={statCardStyle}>
          <div style={statHeaderStyle}>
            <span style={statTitleStyle}>Screener Action Items</span>
            <span style={iconStyle}>⏳</span>
          </div>
          <div style={statNumberStyle}>{needsAttention.length}</div>
          <p style={statSubStyle}>Candidates stuck in screening &gt; 7 days</p>
        </div>
      </div>

      {/* "Needs Attention" Panel Table */}
      <div className="card" style={{ padding: 0, marginTop: '2rem', overflow: 'hidden', border: needsAttention.length > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--gray-border)' }}>
        <div style={warningHeaderStyle}>
          <h3 style={{ margin: 0, color: 'var(--gray-text-primary)' }}>⚠️ Screening Actions Required</h3>
          <span style={warningBadgeStyle}>{needsAttention.length} Candidates Lockout</span>
        </div>

        {needsAttention.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--gray-text-muted)' }}>
            🎉 Great job! No candidates are currently stuck in the Resume Screening stage.
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Candidate</th>
                <th style={thStyle}>Target Position</th>
                <th style={thStyle}>Last Activity</th>
                <th style={thStyle}>Time Stale</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {needsAttention.map((app: any) => {
                const staleMs = Date.now() - new Date(app.updatedAt).getTime();
                const staleDays = Math.floor(staleMs / (24 * 60 * 60 * 1000));
                return (
                  <tr key={app._id} style={trStyle} className="table-row-hover">
                    <td style={tdStyle}>
                      <div>
                        <strong style={nameStyle}>{app.candidate?.name}</strong>
                        <div style={emailStyle}>{app.candidate?.email}</div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={jobStyle}>{app.job?.title}</span>
                      <div style={locationStyle}>{app.job?.location}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={dateStyle}>
                        {new Date(app.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ color: '#ef4444', fontWeight: 700 }}>
                        {staleDays} Days Stuck
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <Link to={`/recruiter/applications/${app._id}`} className="api-btn" style={viewBtnStyle}>
                        Review Profile &rarr;
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// Styles
const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1.5rem'
};

const statCardStyle: React.CSSProperties = {
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  textAlign: 'left'
};

const statHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const statTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: 'var(--gray-text-muted)',
  letterSpacing: '0.05em'
};

const iconStyle: React.CSSProperties = {
  fontSize: '20px'
};

const statNumberStyle: React.CSSProperties = {
  fontSize: '36px',
  fontWeight: 800,
  color: 'var(--gray-text-primary)'
};

const statSubStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--gray-text-muted)',
  margin: 0
};

const warningHeaderStyle: React.CSSProperties = {
  padding: '16px 20px',
  borderBottom: '1px solid var(--gray-border)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  backgroundColor: 'rgba(239, 68, 68, 0.02)'
};

const warningBadgeStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 700,
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  color: '#ef4444',
  padding: '4px 10px',
  borderRadius: '20px'
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left'
};

const tableHeaderRowStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--gray-border)',
  backgroundColor: 'rgba(255, 255, 255, 0.01)'
};

const thStyle: React.CSSProperties = {
  padding: '14px 16px',
  fontSize: '12px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--gray-text-muted)'
};

const trStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--gray-border)',
  transition: 'background-color var(--transition-speed)'
};

const tdStyle: React.CSSProperties = {
  padding: '16px',
  verticalAlign: 'middle'
};

const nameStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--gray-text-primary)'
};

const emailStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--gray-text-muted)',
  marginTop: '2px'
};

const jobStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--gray-text-primary)'
};

const locationStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--gray-text-muted)',
  marginTop: '2px'
};

const dateStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--gray-text-primary)'
};

const viewBtnStyle: React.CSSProperties = {
  textDecoration: 'none',
  padding: '6px 14px',
  fontSize: '13px',
  fontWeight: 600,
  display: 'inline-block',
  minHeight: 'auto'
};

const errorContainerStyle: React.CSSProperties = {
  color: 'var(--error)',
  backgroundColor: 'rgba(239, 68, 68, 0.08)',
  padding: '12px',
  borderRadius: 'var(--radius-default)',
  fontSize: '14px',
  border: '1px solid rgba(239, 68, 68, 0.2)'
};

const spinnerStyle: React.CSSProperties = {
  width: '30px',
  height: '30px',
  border: '3px solid rgba(255, 255, 255, 0.1)',
  borderTop: '3px solid var(--accent)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '1.5rem auto 0 auto'
};
