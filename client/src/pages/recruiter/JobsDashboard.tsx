import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const JobsDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Job Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Create Job Posting');
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  
  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [minExperience, setMinExperience] = useState<number>(0);
  const [maxExperience, setMaxExperience] = useState<number>(0);
  const [status, setStatus] = useState<'open' | 'closed'>('open');


  const fetchJobs = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/jobs/manage`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch job postings');
      }

      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchJobs();
    }
  }, [token]);

  const handleOpenCreateModal = () => {
    setEditingJobId(null);
    setModalTitle('Create Job Posting');
    setTitle('');
    setDescription('');
    setRequirements('');
    setLocation('');
    setMinExperience(0);
    setMaxExperience(0);
    setStatus('open');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job: any) => {
    setEditingJobId(job._id);
    setModalTitle('Edit Job Posting');
    setTitle(job.title);
    setDescription(job.description);
    setRequirements(job.requirements || '');
    setLocation(job.location || '');
    setMinExperience(job.minExperience || 0);
    setMaxExperience(job.maxExperience || 0);
    setStatus(job.status);
    setIsModalOpen(true);
  };

  const handleSaveJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setLoading(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const url = editingJobId 
        ? `${apiUrl}/api/jobs/${editingJobId}` 
        : `${apiUrl}/api/jobs`;
      
      const method = editingJobId ? 'PATCH' : 'POST';
      const body: any = { 
        title, 
        description, 
        requirements, 
        location,
        minExperience: Number(minExperience),
        maxExperience: Number(maxExperience)
      };
      if (editingJobId) {
        body.status = status;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to save job');
      }

      setIsModalOpen(false);
      fetchJobs(); // Reload jobs list
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (job: any) => {
    if (!token) return;
    const targetStatus = job.status === 'open' ? 'closed' : 'open';

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/jobs/${job._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: targetStatus })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to toggle status');
      }

      fetchJobs();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to delete this job posting? (This will perform a soft-delete)')) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/jobs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to delete job');
      }

      fetchJobs();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Metrics
  const totalCount = jobs.length;
  const openCount = jobs.filter(j => j.status === 'open').length;
  const closedCount = jobs.filter(j => j.status === 'closed').length;

  if (!token) {
    return (
      <div style={authContainerStyle}>
        <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', textAlign: 'center' }}>
          <h2 style={{ marginBottom: '0.5rem', fontSize: '1.6rem' }}>Access Denied</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem' }}>
            Please sign in to access the internal recruitment dashboard.
          </p>
          <Link to="/login" className="api-btn" style={{ textDecoration: 'none', display: 'inline-block', width: '100%', padding: '0.85rem' }}>
            Sign In
          </Link>
          <div style={{ marginTop: '2rem' }}>
            <Link to="/" style={{ color: '#818cf8', textDecoration: 'none', fontSize: '0.9rem' }}>
              &larr; Back to Careers Board
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={dashboardHeaderStyle}>
        <div>
          <h1 style={titleStyle}>
            {user?.role === 'admin' ? 'Admin' : 'Recruiter'}{' '}
            <span className="gradient-text">Dashboard</span>
          </h1>
          <p style={subtitleStyle}>Create, edit, and track job opening pipelines</p>
        </div>
        <div style={actionGroupStyle}>
          <Link 
            to="/recruiter/candidates" 
            className="api-btn" 
            style={{ 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: 'var(--gray-surface)', 
              border: '1px solid var(--gray-border)', 
              color: 'var(--gray-text-primary)',
              marginRight: '0.5rem',
              padding: '0 1.25rem',
              boxSizing: 'border-box',
              minHeight: '40px'
            }}
          >
            👥 Candidate Pipeline
          </Link>
          <button className="api-btn" onClick={handleOpenCreateModal}>
            + Add New Job
          </button>
           <button 
            style={logoutButtonStyle}
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div style={metricsRowStyle}>
        <div className="card" style={metricCardStyle}>
          <span style={metricLabelStyle}>Total Listings</span>
          <span style={metricValueStyle}>{totalCount}</span>
        </div>
        <div className="card" style={metricCardStyle}>
          <span style={metricLabelStyle}>Active Openings</span>
          <span style={{ ...metricValueStyle, color: '#34d399' }}>{openCount}</span>
        </div>
        <div className="card" style={metricCardStyle}>
          <span style={metricLabelStyle}>Closed Postings</span>
          <span style={{ ...metricValueStyle, color: '#f87171' }}>{closedCount}</span>
        </div>
      </div>

      {loading && jobs.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ color: '#94a3b8' }}>Syncing job listings...</h2>
          <div style={spinnerStyle}></div>
        </div>
      ) : error ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h2 style={{ color: '#ef4444' }}>Sync failed</h2>
          <p style={{ color: '#94a3b8' }}>{error}</p>
          <button className="api-btn" onClick={fetchJobs}>Retry</button>
        </div>
      ) : jobs.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h2 style={{ color: '#94a3b8', marginBottom: '1rem' }}>No Jobs Listed Yet</h2>
          <p style={{ color: '#64748b', maxWidth: '400px', margin: '0 auto 2rem' }}>
            Get started by adding your first job posting. Candidates will see it on the careers board once published.
          </p>
          <button className="api-btn" onClick={handleOpenCreateModal}>
            + Add Your First Job
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={thStyle}>Role Title</th>
                <th style={thStyle}>Location</th>
                <th style={thStyle}>Created By</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id} style={tableRowStyle}>
                  <td style={tdTitleStyle}>{job.title}</td>
                  <td style={tdStyle}>{job.location || 'N/A'}</td>
                  <td style={tdStyle}>{job.createdBy?.name || 'Admin'}</td>
                  <td style={tdStyle}>
                    <button 
                      onClick={() => handleToggleStatus(job)}
                      style={job.status === 'open' ? activeBadgeStyle : closedBadgeStyle}
                      title="Click to toggle status"
                    >
                      {job.status === 'open' ? 'Open' : 'Closed'}
                    </button>
                  </td>
                  <td style={tdActionsStyle}>
                    <button 
                      onClick={() => handleOpenEditModal(job)}
                      style={actionEditStyle}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteJob(job._id)}
                      style={actionDeleteStyle}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sliding Right-Side Drawer Panel */}
      <div 
        className={`drawer-backdrop ${isModalOpen ? 'drawer-backdrop--open' : ''}`}
        onClick={() => setIsModalOpen(false)}
      >
        <div 
          className="drawer-panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="drawer-panel__header">
            <h3 className="drawer-panel__title">{modalTitle}</h3>
            <button 
              type="button" 
              className="drawer-panel__close"
              onClick={() => setIsModalOpen(false)}
              aria-label="Close drawer"
            >
              ✕
            </button>
          </div>
          <div className="drawer-panel__content">
            <form onSubmit={handleSaveJob} style={formStyle}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Job Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  style={inputStyle}
                  placeholder="e.g. Senior Frontend Engineer"
                  required
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Location</label>
                <input 
                  type="text" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                  style={inputStyle}
                  placeholder="e.g. Bengaluru, Remote"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label style={labelStyle}>Min Experience (Yrs)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={minExperience} 
                    onChange={(e) => setMinExperience(Number(e.target.value))} 
                    style={inputStyle}
                    required
                  />
                </div>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label style={labelStyle}>Max Experience (Yrs)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={maxExperience} 
                    onChange={(e) => setMaxExperience(Number(e.target.value))} 
                    style={inputStyle}
                    required
                  />
                </div>
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Job Description *</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  style={{ ...inputStyle, height: '120px', resize: 'vertical' }}
                  placeholder="Roles and responsibilities..."
                  required
                />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Job Requirements</label>
                <textarea 
                  value={requirements} 
                  onChange={(e) => setRequirements(e.target.value)} 
                  style={{ ...inputStyle, height: '120px', resize: 'vertical' }}
                  placeholder="Desired skills, experience..."
                />
              </div>
              {editingJobId && (
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Publishing Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as 'open' | 'closed')}
                    style={inputStyle}
                  >
                    <option value="open">Open (Public)</option>
                    <option value="closed">Closed (Internal)</option>
                  </select>
                </div>
              )}

              <div style={formButtonsStyle}>
                <button 
                  type="button" 
                  style={cancelButtonStyle} 
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="api-btn"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Job Posting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
        <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>
          &larr; Back to Public Careers Page
        </Link>
      </div>
    </div>
  );
};

// Styles
const authContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '80vh',
  padding: '1rem'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--gray-text-primary)',
  marginBottom: '0.4rem'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  borderRadius: '6px',
  backgroundColor: 'var(--gray-bg)',
  border: '1px solid var(--gray-border)',
  color: 'var(--gray-text-primary)',
  fontSize: '0.95rem',
  boxSizing: 'border-box'
};

const containerStyle: React.CSSProperties = {
  maxWidth: '1100px',
  margin: '0 auto',
  padding: '2rem 1rem',
  textAlign: 'left'
};

const dashboardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1.5rem',
  flexWrap: 'wrap',
  marginBottom: '2.5rem',
  borderBottom: '1px solid var(--gray-border)',
  paddingBottom: '1.5rem'
};

const titleStyle: React.CSSProperties = {
  fontSize: '2.2rem',
  fontWeight: 800,
  margin: '0 0 0.4rem 0',
  color: 'var(--gray-text-primary)'
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '1rem',
  color: 'var(--gray-text-muted)',
  margin: 0
};

const actionGroupStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
};

const logoutButtonStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--gray-border)',
  padding: '0.65rem 1.25rem',
  borderRadius: '8px',
  color: 'var(--gray-text-primary)',
  fontSize: '0.9rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.2s'
};

const metricsRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '1.5rem',
  marginBottom: '2.5rem'
};

const metricCardStyle: React.CSSProperties = {
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  textAlign: 'left',
  backgroundColor: 'var(--gray-surface)',
  border: '1px solid var(--gray-border)',
  borderRadius: 'var(--radius-card)'
};

const metricLabelStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontWeight: 600,
  color: 'var(--gray-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const metricValueStyle: React.CSSProperties = {
  fontSize: '2.2rem',
  fontWeight: 800,
  color: 'var(--gray-text-primary)',
  marginTop: '0.5rem'
};

const spinnerStyle: React.CSSProperties = {
  width: '35px',
  height: '35px',
  border: '3px solid var(--gray-border)',
  borderTop: '3px solid var(--accent)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '2rem auto 0 auto'
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: '0.95rem'
};

const tableHeaderRowStyle: React.CSSProperties = {
  backgroundColor: 'var(--gray-bg)',
  borderBottom: '2px solid var(--gray-border)'
};

const thStyle: React.CSSProperties = {
  padding: '1rem 1.5rem',
  fontWeight: 600,
  color: 'var(--gray-text-primary)'
};

const tableRowStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--gray-border)',
  transition: 'background-color 0.2s'
};

const tdStyle: React.CSSProperties = {
  padding: '1rem 1.5rem',
  color: 'var(--gray-text-muted)',
  verticalAlign: 'middle'
};

const tdTitleStyle: React.CSSProperties = {
  padding: '1rem 1.5rem',
  color: 'var(--gray-text-primary)',
  fontWeight: 600,
  verticalAlign: 'middle'
};

const activeBadgeStyle: React.CSSProperties = {
  padding: '0.25rem 0.65rem',
  borderRadius: '9999px',
  fontSize: '0.8rem',
  fontWeight: 600,
  backgroundColor: 'rgba(16, 185, 129, 0.1)',
  color: 'var(--success)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  cursor: 'pointer'
};

const closedBadgeStyle: React.CSSProperties = {
  padding: '0.25rem 0.65rem',
  borderRadius: '9999px',
  fontSize: '0.8rem',
  fontWeight: 600,
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  color: 'var(--error)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  cursor: 'pointer'
};

const tdActionsStyle: React.CSSProperties = {
  padding: '1rem 1.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  justifyContent: 'flex-start',
  verticalAlign: 'middle'
};

const actionEditStyle: React.CSSProperties = {
  backgroundColor: 'var(--gray-surface)',
  border: '1px solid var(--gray-border)',
  borderRadius: '6px',
  color: 'var(--gray-text-primary)',
  padding: '0.4rem 0.85rem',
  fontSize: '0.85rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s'
};

const actionDeleteStyle: React.CSSProperties = {
  backgroundColor: 'rgba(239, 68, 68, 0.05)',
  border: '1px solid rgba(239, 68, 68, 0.15)',
  borderRadius: '6px',
  color: 'var(--error)',
  padding: '0.4rem 0.85rem',
  fontSize: '0.85rem',
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s'
};

// Form Styles
const formStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem'
};

const formGroupStyle: React.CSSProperties = {
  textAlign: 'left'
};

const formButtonsStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '1rem',
  marginTop: '1rem',
  borderTop: '1px solid var(--gray-border)',
  paddingTop: '1.25rem'
};

const cancelButtonStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid var(--gray-border)',
  padding: '0.65rem 1.5rem',
  borderRadius: '8px',
  color: 'var(--gray-text-muted)',
  fontWeight: 600,
  cursor: 'pointer'
};
