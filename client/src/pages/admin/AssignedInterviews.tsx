import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const AssignedInterviews: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchInterviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/interviews/mine?status=scheduled`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to retrieve assigned interviews list');
        }

        const data = await response.json();
        setInterviews(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [token, navigate]);

  const [activeTab, setActiveTab] = useState<'all' | 'technical' | 'hr'>('technical');

  // Filter interviews by active tab
  const filteredInterviews = interviews.filter((item) => {
    if (activeTab === 'technical') return item.type === 'technical';
    if (activeTab === 'hr') return item.type === 'hr';
    return true;
  });

  const techCount = interviews.filter(i => i.type === 'technical').length;
  const hrCount = interviews.filter(i => i.type === 'hr').length;

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>My Assigned Interviews</h1>
          <p style={subtitleStyle}>Conduct screening evaluations and submit candidate evaluation scorecards</p>
        </div>
      </header>

      {error && (
        <div style={errorContainerStyle}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'var(--gray-text-muted)' }}>Syncing schedule queue...</h2>
          <div style={spinnerStyle}></div>
        </div>
      ) : (
        <>
          {/* CHROME WINDOW TAB SWITCHER FOR INTERVIEW TYPES */}
          <div className="chrome-tab-bar">
            <button 
              type="button"
              className={`chrome-tab ${activeTab === 'technical' ? 'chrome-tab--active' : ''}`}
              onClick={() => setActiveTab('technical')}
            >
              <span>Technical Interviews</span>
              <span className="chrome-tab-badge">{techCount}</span>
            </button>

            <button 
              type="button"
              className={`chrome-tab ${activeTab === 'hr' ? 'chrome-tab--active' : ''}`}
              onClick={() => setActiveTab('hr')}
            >
              <span>HR Interviews</span>
              <span className="chrome-tab-badge">{hrCount}</span>
            </button>

            <button 
              type="button"
              className={`chrome-tab ${activeTab === 'all' ? 'chrome-tab--active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              <span>All Panels</span>
              <span className="chrome-tab-badge">{interviews.length}</span>
            </button>
          </div>

          {filteredInterviews.length === 0 ? (
            <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '0 0 16px 16px', borderTop: 'none' }}>
              <h2 style={{ color: 'var(--gray-text-muted)', marginBottom: '1rem' }}>
                No {activeTab === 'technical' ? 'Technical' : activeTab === 'hr' ? 'HR' : 'Assigned'} Interviews Scheduled
              </h2>
              <p style={{ color: 'var(--gray-text-muted)', maxWidth: '480px', margin: '0 auto' }}>
                You do not have any pending {activeTab} candidate interviews assigned to you at the moment.
              </p>
            </div>
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: '0 0 16px 16px', borderTop: 'none' }}>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeaderRowStyle}>
                    <th style={thStyle}>Candidate</th>
                    <th style={thStyle}>Job Opening</th>
                    <th style={thStyle}>Round & Schedule</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInterviews.map((item) => (
                    <tr key={item._id} style={trStyle} className="table-row-hover">
                      <td style={tdStyle}>
                        <div>
                          <strong style={candidateNameStyle}>{item.application?.candidate?.name}</strong>
                          <div style={candidateEmailStyle}>{item.application?.candidate?.email}</div>
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={jobTitleStyle}>{item.application?.job?.title}</span>
                        <div style={jobLocationStyle}>{item.application?.job?.location}</div>
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)' }}>
                            {item.type === 'technical' ? 'Technical Round' : 'HR Round'}
                          </span>
                          <span style={dateTimeStyle}>
                            {new Date(item.scheduledAt).toLocaleString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        <Link to={`/admin/interviews/${item._id}/conduct`} className="api-btn" style={viewBtnStyle}>
                          Conduct {item.type === 'technical' ? 'Technical' : 'HR'} Interview &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Styling Parameters
const containerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem 1rem',
  textAlign: 'left'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '2rem'
};

const titleStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 800,
  color: 'var(--gray-text-primary)',
  letterSpacing: '-0.02em',
  marginBottom: '0.25rem'
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '15px',
  color: 'var(--gray-text-muted)',
  margin: 0
};

const errorContainerStyle: React.CSSProperties = {
  color: 'var(--error)',
  backgroundColor: 'rgba(239, 68, 68, 0.08)',
  padding: '12px',
  borderRadius: 'var(--radius-default)',
  fontSize: '14px',
  marginBottom: '1.5rem',
  border: '1px solid rgba(239, 68, 68, 0.2)'
};

const spinnerStyle: React.CSSProperties = {
  width: '30px',
  height: '30px',
  border: '3px solid var(--gray-border)',
  borderTop: '3px solid var(--accent)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '1.5rem auto 0 auto'
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left'
};

const tableHeaderRowStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--gray-border)',
  backgroundColor: 'var(--gray-bg)'
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

const candidateNameStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--gray-text-primary)'
};

const candidateEmailStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--gray-text-muted)',
  marginTop: '2px'
};

const jobTitleStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--gray-text-primary)'
};

const jobLocationStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--gray-text-muted)',
  marginTop: '2px'
};

const dateTimeStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--gray-text-primary)',
  fontWeight: 500
};

const viewBtnStyle: React.CSSProperties = {
  textDecoration: 'none',
  padding: '6px 14px',
  fontSize: '13px',
  fontWeight: 600,
  display: 'inline-block',
  minHeight: 'auto'
};
