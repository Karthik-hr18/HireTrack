import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export const ApplicationsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Query / Filter States
  const [applications, setApplications] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [stage, setStage] = useState('');
  const [source, setSource] = useState('');
  const [jobId, setJobId] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch open jobs for the filter dropdown
    const fetchFilterJobs = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/jobs/manage`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
           setJobs(data.jobs || []);
        }
      } catch (err) {
        console.error('Failed to load filter jobs:', err);
      }
    };

    fetchFilterJobs();
  }, [token, navigate]);

  const fetchApplications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '10');
      if (search.trim()) params.append('search', search);
      if (stage) params.append('stage', stage);
      if (source) params.append('source', source);
      if (jobId) params.append('jobId', jobId);

      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/applications?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to load candidate applications');
      }

      const data = await response.json();
      setApplications(data.applications);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 on query modification
    setPage(1);
  }, [search, stage, source, jobId]);

  useEffect(() => {
    fetchApplications();
  }, [page, search, stage, source, jobId]);

  const getStageBadgeClass = (s: string) => {
    switch (s) {
      case 'applied':
        return 'badge-applied';
      case 'resume_screening':
        return 'badge-screening';
      case 'interview_scheduled':
      case 'interview_completed':
        return 'badge-interview';
      case 'final_review':
        return 'badge-review';
      case 'offer':
        return 'badge-offer';
      case 'hired':
        return 'badge-hired';
      case 'rejected':
        return 'badge-rejected';
      default:
        return 'badge-default';
    }
  };

  const formatStageText = (s: string) => {
    return s.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Candidate Pipeline</h1>
          <p style={subtitleStyle}>Manage job applicants, screen resumes, and schedule candidate interview panels</p>
        </div>
        <div style={actionsContainerStyle}>
          <Link to="/recruiter/jobs" style={navLinkStyle}>
            &larr; Manage Job Postings
          </Link>
        </div>
      </header>

      {/* Filter workspace */}
      <section className="card" style={filtersCardStyle}>
        <h3 style={filterTitleStyle}>🔍 Search & Filters</h3>
        <div style={filtersGridStyle}>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Search Candidate Name</label>
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. John Doe"
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Job Opportunity</label>
            <select 
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              style={inputStyle}
            >
              <option value="">All Openings</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>{job.title} ({job.location})</option>
              ))}
            </select>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Pipeline Stage</label>
            <select 
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              style={inputStyle}
            >
              <option value="">All Stages</option>
              <option value="applied">Applied</option>
              <option value="resume_screening">Resume Screening</option>
              <option value="interview_scheduled">Interview Scheduled</option>
              <option value="interview_completed">Interview Completed</option>
              <option value="final_review">Final Review</option>
              <option value="offer">Offer Extended</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Application Source</label>
            <select 
              value={source}
              onChange={(e) => setSource(e.target.value)}
              style={inputStyle}
            >
              <option value="">All Channels</option>
              <option value="careers_page">Company Careers Page</option>
              <option value="linkedin">LinkedIn</option>
              <option value="indeed">Indeed</option>
              <option value="referral">Referral</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </section>

      {error && (
        <div style={errorContainerStyle}>
          ⚠️ {error}
        </div>
      )}

      {/* Main applications list */}
      {loading && applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <h2 style={{ color: 'var(--gray-text-muted)' }}>Syncing candidate records...</h2>
          <div style={spinnerStyle}></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--gray-text-muted)', marginBottom: '1rem' }}>No Active Candidates Found</h2>
          <p style={{ color: 'var(--gray-text-muted)', maxWidth: '480px', margin: '0 auto' }}>
            Try clearing search keywords or selecting different stage filters to review records.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeaderRowStyle}>
                  <th style={thStyle}>Candidate</th>
                  <th style={thStyle}>Applying For</th>
                  <th style={thStyle}>Experience</th>
                  <th style={thStyle}>Sourcing Channel</th>
                  <th style={thStyle}>Stage</th>
                  <th style={thStyle}>Applied Date</th>
                  <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} style={trStyle} className="table-row-hover">
                    <td style={tdStyle}>
                      <div>
                        <strong style={candidateNameStyle}>{app.candidate?.name || 'Unknown Candidate'}</strong>
                        <div style={candidateEmailStyle}>{app.candidate?.email || 'N/A'}</div>
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <span style={jobTitleStyle}>{app.job?.title || 'Deleted Position'}</span>
                      <div style={jobLocationStyle}>{app.job?.location || 'Remote'}</div>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '14px', color: 'var(--gray-text-primary)' }}>
                        {app.experience === 0 ? 'Fresher' : `${app.experience} yrs`}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: '13px', textTransform: 'capitalize', color: 'var(--gray-text-muted)' }}>
                        {app.source.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span className={`badge ${getStageBadgeClass(app.stage)}`}>
                        {formatStageText(app.stage)}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={dateStyle}>
                        {new Date(app.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                      <Link to={`/recruiter/applications/${app._id}`} className="api-btn" style={viewBtnStyle}>
                        View Profile &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controllers */}
          {totalPages > 1 && (
            <footer style={paginationContainerStyle}>
              <div style={{ fontSize: '14px', color: 'var(--gray-text-muted)' }}>
                Showing <strong>{applications.length}</strong> of <strong>{total}</strong> applications
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setPage(p => Math.max(p - 1, 1))} 
                  disabled={page === 1}
                  style={pageButtonStyle}
                >
                  Previous
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))} 
                  disabled={page === totalPages}
                  style={pageButtonStyle}
                >
                  Next
                </button>
              </div>
            </footer>
          )}
        </div>
      )}
    </div>
  );
};

// Custom Stage Styles injected for premium UI
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .badge-applied { background-color: rgba(99, 102, 241, 0.15) !important; color: #818cf8 !important; border: 1px solid rgba(99, 102, 241, 0.3) !important; }
  .badge-screening { background-color: rgba(245, 158, 11, 0.15) !important; color: #fbbf24 !important; border: 1px solid rgba(245, 158, 11, 0.3) !important; }
  .badge-interview { background-color: rgba(236, 72, 153, 0.15) !important; color: #f472b6 !important; border: 1px solid rgba(236, 72, 153, 0.3) !important; }
  .badge-review { background-color: rgba(139, 92, 246, 0.15) !important; color: #a78bfa !important; border: 1px solid rgba(139, 92, 246, 0.3) !important; }
  .badge-offer { background-color: rgba(6, 182, 212, 0.15) !important; color: #22d3ee !important; border: 1px solid rgba(6, 182, 212, 0.3) !important; }
  .badge-hired { background-color: rgba(16, 185, 129, 0.15) !important; color: #34d399 !important; border: 1px solid rgba(16, 185, 129, 0.3) !important; }
  .badge-rejected { background-color: rgba(239, 68, 68, 0.15) !important; color: #f87171 !important; border: 1px solid rgba(239, 68, 68, 0.3) !important; }
  .table-row-hover:hover { background-color: rgba(255, 255, 255, 0.02) !important; }
`;
document.head.appendChild(styleSheet);

// Layout Styles
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
  marginBottom: '2rem',
  flexWrap: 'wrap',
  gap: '1rem'
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

const actionsContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
};

const navLinkStyle: React.CSSProperties = {
  textDecoration: 'none',
  color: 'var(--accent-hover)',
  fontSize: '15px',
  fontWeight: 600
};

const filtersCardStyle: React.CSSProperties = {
  padding: 'var(--space-4)',
  marginBottom: '2rem'
};

const filterTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 700,
  color: 'var(--gray-text-primary)',
  marginBottom: '1rem'
};

const filtersGridStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  flexWrap: 'wrap'
};

const formGroupStyle: React.CSSProperties = {
  flex: '1 1 200px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--gray-text-muted)'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'var(--gray-surface)',
  border: '1px solid var(--gray-border)',
  color: 'var(--gray-text-primary)',
  fontSize: '14px',
  height: '38px',
  borderRadius: '6px',
  padding: '0 12px',
  boxSizing: 'border-box'
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
  border: '3px solid rgba(255, 255, 255, 0.1)',
  borderTop: '3px solid var(--accent)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '1.5rem auto 0 auto'
};

// Table layout
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

const dateStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--gray-text-muted)'
};

const viewBtnStyle: React.CSSProperties = {
  textDecoration: 'none',
  padding: '6px 14px',
  fontSize: '13px',
  fontWeight: 600,
  display: 'inline-block',
  minHeight: 'auto'
};

const paginationContainerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '1rem var(--space-4)',
  borderTop: '1px solid var(--gray-border)',
  backgroundColor: 'rgba(255, 255, 255, 0.01)'
};

const pageButtonStyle: React.CSSProperties = {
  backgroundColor: 'var(--gray-surface)',
  border: '1px solid var(--gray-border)',
  color: 'var(--gray-text-primary)',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
  transition: 'all 0.2s'
};
