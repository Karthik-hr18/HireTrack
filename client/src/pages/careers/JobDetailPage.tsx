import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/jobs/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('This job opportunity is no longer available.');
          }
          throw new Error('Failed to fetch job details');
        }
        const data = await response.json();
        setJob(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={containerStyle}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ color: '#94a3b8' }}>Loading job details...</h2>
          <div style={spinnerStyle}></div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={containerStyle}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h2 style={{ color: '#ef4444' }}>Job Not Found</h2>
          <p style={{ color: '#94a3b8', margin: '1rem 0 2rem' }}>{error || 'The requested job posting could not be found.'}</p>
          <Link to="/" className="api-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={backLinkStyle}>
          &larr; Back to Open Roles
        </Link>
      </div>

      <article className="card" style={detailCardStyle}>
        <header style={headerStyle}>
          <div style={headerMainStyle}>
            <h1 style={jobTitleStyle}>{job.title}</h1>
            <div style={metaContainerStyle}>
              {job.location && <span style={metaItemStyle}>📍 {job.location}</span>}
              <span className="badge badge-success" style={{ margin: 0 }}>Open</span>
            </div>
          </div>
          <div style={applySectionStyle}>
            <button 
              className="api-btn" 
              style={applyBtnStyle}
              onClick={() => alert('Candidate application flow and resume uploads will be unlocked on Day 3!')}
            >
              Apply for this role
            </button>
          </div>
        </header>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Description</h2>
          <p style={paragraphStyle}>{job.description}</p>
        </section>

        {job.requirements && (
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Requirements</h2>
            <p style={paragraphStyle}>{job.requirements}</p>
          </section>
        )}
      </article>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  padding: '2rem 1rem',
  textAlign: 'left'
};

const backLinkStyle: React.CSSProperties = {
  color: '#818cf8',
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: 600
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

const detailCardStyle: React.CSSProperties = {
  padding: '2.5rem',
  textAlign: 'left'
};

const headerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: '1.5rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  paddingBottom: '2.0rem',
  marginBottom: '2.0rem'
};

const headerMainStyle: React.CSSProperties = {
  flex: '1 1 400px'
};

const jobTitleStyle: React.CSSProperties = {
  margin: '0 0 0.75rem 0',
  fontSize: '2.2rem',
  fontWeight: 800,
  color: '#f8fafc',
  lineHeight: 1.2
};

const metaContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  flexWrap: 'wrap'
};

const metaItemStyle: React.CSSProperties = {
  fontSize: '0.95rem',
  color: '#cbd5e1',
  fontWeight: 500
};

const applySectionStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center'
};

const applyBtnStyle: React.CSSProperties = {
  padding: '0.85rem 2rem',
  fontSize: '1.05rem',
  boxShadow: '0 4px 20px 0 rgba(99, 102, 241, 0.3)'
};

const sectionStyle: React.CSSProperties = {
  marginBottom: '2rem'
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1.4rem',
  fontWeight: 700,
  color: '#f8fafc',
  margin: '0 0 1rem 0',
  borderBottom: '2px solid rgba(99, 102, 241, 0.2)',
  paddingBottom: '0.25rem',
  display: 'inline-block'
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '1.05rem',
  color: '#cbd5e1',
  lineHeight: 1.7,
  margin: 0,
  whiteSpace: 'pre-wrap'
};
