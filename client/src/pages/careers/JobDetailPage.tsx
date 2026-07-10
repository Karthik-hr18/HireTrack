import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application Form States
  const [source, setSource] = useState('linkedin');
  const [resume, setResume] = useState<File | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const headers: any = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/jobs/${id}`, { headers });
        
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
  }, [id, token]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setSubmitError('Only PDF format resumes are accepted.');
        setResume(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('File size exceeds the 5MB limit.');
        setResume(null);
        return;
      }
      setSubmitError(null);
      setResume(file);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }

    if (!resume) {
      setSubmitError('Please select a PDF copy of your resume.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      formData.append('jobId', id || '');
      formData.append('source', source);
      formData.append('resume', resume);

      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/applications`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Application submission failed.');
      }

      setSuccess(true);
    } catch (err) {
      setSubmitError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--gray-text-muted)' }}>Loading job details...</h2>
          <div style={spinnerStyle}></div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={containerStyle}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h2 style={{ color: 'var(--error)' }}>Job Not Found</h2>
          <p style={{ color: 'var(--gray-text-muted)', margin: '1rem 0 2rem' }}>{error || 'The requested job posting could not be found.'}</p>
          <Link to="/" className="api-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link to="/" style={backLinkStyle}>
          &larr; Back to Open Roles
        </Link>
      </div>

      <div style={twoColumnLayout}>
        {/* Job Details Card */}
        <article className="card" style={detailCardStyle}>
          <header style={headerStyle}>
            <h1 style={jobTitleStyle}>{job.title}</h1>
            <div style={metaContainerStyle}>
              {job.location && <span style={metaItemStyle}>📍 {job.location}</span>}
              <span className="badge badge-success">Open</span>
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

        {/* Application Submission Form Column */}
        <aside style={asideColumnStyle}>
          {success ? (
            <div className="card" style={{ ...applyCardStyle, border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Application Submitted!</h3>
              <p style={{ color: 'var(--gray-text-muted)', fontSize: '14px', marginBottom: '2rem' }}>
                Thank you for applying. We have received your resume and source tracking metrics.
              </p>
              <Link to="/candidate/applications" className="api-btn" style={{ textDecoration: 'none', display: 'inline-block', width: '100%' }}>
                Go to Tracker
              </Link>
            </div>
          ) : !user ? (
            <div className="card" style={applyCardStyle}>
              <h3 style={{ marginBottom: '1rem' }}>Interested in this role?</h3>
              <p style={{ color: 'var(--gray-text-muted)', fontSize: '14px', marginBottom: '2.5rem' }}>
                Sign in to your candidate profile to upload your PDF resume and track your application status.
              </p>
              <Link to="/login" className="api-btn" style={{ textDecoration: 'none', display: 'inline-block', width: '100%', textAlign: 'center' }}>
                Sign In to Apply
              </Link>
            </div>
          ) : user.role !== 'candidate' ? (
            <div className="card" style={applyCardStyle}>
              <h3 style={{ marginBottom: '1rem' }}>Application Locked</h3>
              <p style={{ color: 'var(--gray-text-muted)', fontSize: '14px' }}>
                You are currently logged in as a <strong>{user.role}</strong>. Applications are reserved for Candidate profiles only.
              </p>
            </div>
          ) : (
            <div className="card" style={applyCardStyle}>
              <h3 style={{ marginBottom: '1.5rem' }}>Apply Now</h3>
              
              {submitError && (
                <div style={errorContainerStyle}>
                  {submitError}
                </div>
              )}

              <form onSubmit={handleApplySubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label>Sourcing Channel</label>
                  <select 
                    value={source} 
                    onChange={(e) => setSource(e.target.value)}
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="indeed">Indeed</option>
                    <option value="careers_page">Company Careers Page</option>
                    <option value="referral">Referral</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <label>Resume (PDF only, max 5MB)</label>
                  <input 
                    type="file" 
                    accept="application/pdf" 
                    onChange={handleFileChange}
                    required
                    style={{ paddingTop: '10px' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="api-btn" 
                  style={{ width: '100%' }}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </form>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: 'var(--space-2) 0',
  textAlign: 'left'
};

const backLinkStyle: React.CSSProperties = {
  color: 'var(--accent-hover)',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: 600
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

const twoColumnLayout: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-5)',
  flexWrap: 'wrap',
  alignItems: 'flex-start'
};

const detailCardStyle: React.CSSProperties = {
  flex: '2 1 600px',
  padding: 'var(--space-6)'
};

const asideColumnStyle: React.CSSProperties = {
  flex: '1 1 340px'
};

const applyCardStyle: React.CSSProperties = {
  padding: 'var(--space-5)',
  position: 'sticky',
  top: '20px'
};

const headerStyle: React.CSSProperties = {
  borderBottom: '1px solid var(--gray-border)',
  paddingBottom: 'var(--space-4)',
  marginBottom: 'var(--space-5)'
};

const jobTitleStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 800,
  color: 'var(--gray-text-primary)',
  marginBottom: 'var(--space-2)'
};

const metaContainerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--space-4)'
};

const metaItemStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--gray-text-muted)',
  fontWeight: 500
};

const sectionStyle: React.CSSProperties = {
  marginBottom: 'var(--space-5)'
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: 'var(--gray-text-primary)',
  marginBottom: 'var(--space-3)'
};

const paragraphStyle: React.CSSProperties = {
  fontSize: '16px',
  color: 'var(--gray-text-muted)',
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap'
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
