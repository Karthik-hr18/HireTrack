import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const CareersPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/jobs`);
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

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div style={containerStyle}>
        <div className="card" style={{ padding: '3rem' }}>
          <h2 style={{ color: '#94a3b8' }}>Loading job opportunities...</h2>
          <div style={spinnerStyle}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <div className="card" style={{ padding: '3rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h2 style={{ color: '#ef4444' }}>Unable to load jobs</h2>
          <p style={{ color: '#94a3b8', margin: '1rem 0 2rem' }}>{error}</p>
          <button 
            className="api-btn" 
            onClick={() => window.location.reload()}
            style={{ backgroundColor: '#ef4444' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>
          Join the <span className="gradient-text">Future</span>
        </h1>
        <p style={subtitleStyle}>Explore open roles and build your career with us</p>
      </header>

      {jobs.length === 0 ? (
        <div className="card" style={{ padding: '4rem 2rem' }}>
          <h2 style={{ color: '#94a3b8', marginBottom: '1rem' }}>No Openings Right Now</h2>
          <p style={{ color: '#64748b', maxWidth: '480px', margin: '0 auto' }}>
            We don't have any active roles matching your query. Check back later or follow our social channels for updates.
          </p>
        </div>
      ) : (
        <div style={gridStyle}>
          {jobs.map((job) => (
            <div key={job._id} className="card" style={jobCardStyle}>
              <div style={cardHeaderStyle}>
                <h3 style={jobTitleStyle}>{job.title}</h3>
                <span className="badge badge-success" style={{ margin: 0 }}>Open</span>
              </div>
              <p style={jobMetaStyle}>
                {job.location && <span>📍 {job.location}</span>}
              </p>
              <p style={jobDescStyle}>
                {job.description.length > 140 
                  ? `${job.description.substring(0, 140)}...` 
                  : job.description}
              </p>
              <div style={cardFooterStyle}>
                <Link to={`/jobs/${job._id}`} style={linkStyle}>
                  View Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
      <footer style={footerStyle}>
        <Link to="/recruiter/jobs" style={adminLinkStyle}>
          ⚙️ Recruiter Portal
        </Link>
      </footer>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '2rem 1rem',
  textAlign: 'left'
};

const headerStyle: React.CSSProperties = {
  marginBottom: '3rem',
  textAlign: 'center'
};

const titleStyle: React.CSSProperties = {
  fontSize: '2.5rem',
  fontWeight: 800,
  margin: '0 0 0.5rem 0',
  color: '#f8fafc'
};

const subtitleStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  color: '#94a3b8',
  margin: 0
};

const spinnerStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  border: '4px solid rgba(255, 255, 255, 0.1)',
  borderTop: '4px solid #6366f1',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '2rem auto 0 auto'
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: '1.5rem',
  marginBottom: '3rem'
};

const jobCardStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  padding: '1.75rem',
  textAlign: 'left',
  height: '100%'
};

const cardHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '1rem',
  marginBottom: '0.75rem'
};

const jobTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#f8fafc',
  lineHeight: 1.3
};

const jobMetaStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#6366f1',
  margin: '0 0 1rem 0',
  fontWeight: 600
};

const jobDescStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  color: '#94a3b8',
  margin: '0 0 1.5rem 0',
  lineHeight: 1.5,
  flexGrow: 1
};

const cardFooterStyle: React.CSSProperties = {
  borderTop: '1px solid rgba(255, 255, 255, 0.05)',
  paddingTop: '1rem',
  display: 'flex',
  justifyContent: 'flex-end'
};

const linkStyle: React.CSSProperties = {
  color: '#818cf8',
  textDecoration: 'none',
  fontWeight: 600,
  fontSize: '0.95rem',
  transition: 'color 0.2s'
};

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  marginTop: '4rem',
  paddingTop: '2rem',
  borderTop: '1px solid rgba(255, 255, 255, 0.06)'
};

const adminLinkStyle: React.CSSProperties = {
  fontSize: '0.9rem',
  color: '#64748b',
  textDecoration: 'none',
  fontWeight: 500
};
