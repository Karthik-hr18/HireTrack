import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CareersNav } from './components/CareersNav';
import { CareersFooter } from './components/CareersFooter';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application Form States
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [address, setAddress] = useState('');
  const [experience, setExperience] = useState<number | ''>('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [source, setSource] = useState('linkedin');
  const [resume, setResume] = useState<File | null>(null);

  // Validation States
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
        document.title = `HireTrack | ${data.title}`;
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

  // Real-time experience requirement checking
  const getExperienceValidationMessage = () => {
    if (experience === '') return null;
    if (job && job.minExperience > 0 && experience < job.minExperience) {
      if (experience === 0) {
        return `Freshers are not eligible for this position. This role requires at least ${job.minExperience} years of experience.`;
      }
      return `You do not meet the experience requirements. This role requires a minimum of ${job.minExperience} years of experience.`;
    }
    return null;
  };

  const experienceError = getExperienceValidationMessage();
  const isEligible = !experienceError;

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

    if (!termsAccepted) {
      setSubmitError('You must review and accept the terms and conditions.');
      return;
    }

    if (!isEligible) {
      setSubmitError('Cannot submit: You do not meet the eligibility requirements for this position.');
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();
      formData.append('jobId', id || '');
      formData.append('source', source);
      formData.append('resume', resume);
      formData.append('phone', phone);
      formData.append('country', country);
      formData.append('address', address);
      formData.append('experience', String(experience));
      formData.append('linkedinUrl', linkedinUrl);
      formData.append('githubUrl', githubUrl);
      formData.append('portfolioUrl', portfolioUrl);
      formData.append('currentCompany', currentCompany);
      formData.append('currentTitle', currentTitle);
      formData.append('coverLetter', coverLetter);
      formData.append('termsAccepted', String(termsAccepted));

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
      <div style={{ backgroundColor: 'var(--gray-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <CareersNav />
        <main className="careers-container" style={{ padding: '80px 24px', flex: 1, textAlign: 'center' }}>
          <div className="careers-card" style={{ padding: 48, maxWidth: 480, margin: '0 auto' }}>
            <h2 style={{ color: 'var(--gray-text-muted)', fontSize: 18, marginBottom: 16 }}>Loading job details...</h2>
            <div style={spinnerStyle}></div>
          </div>
        </main>
        <CareersFooter />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div style={{ backgroundColor: 'var(--gray-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <CareersNav />
        <main className="careers-container" style={{ padding: '80px 24px', flex: 1, textAlign: 'center' }}>
          <div className="careers-card" style={{ padding: 48, maxWidth: 480, margin: '0 auto', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h2 style={{ color: 'var(--error)', fontSize: 20, marginBottom: 12 }}>Job Not Found</h2>
            <p style={{ color: 'var(--gray-text-muted)', margin: '0 0 24px', fontSize: 14 }}>{error || 'The requested job posting could not be found.'}</p>
            <Link to="/" className="btn-primary-lg" style={{ textDecoration: 'none', display: 'inline-flex', margin: '0 auto' }}>
              Back to Open Roles
            </Link>
          </div>
        </main>
        <CareersFooter />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--gray-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CareersNav />

      <main className="careers-container" style={{ padding: '40px 24px 80px', flex: 1 }}>
        <div style={{ marginBottom: 24 }}>
          <Link to="/" style={backLinkStyle}>
            &larr; Back to All Open Roles
          </Link>
        </div>

        <div style={twoColumnLayout}>
          {/* Job Details Card */}
          <article className="careers-card" style={detailCardStyle}>
            <header style={headerStyle}>
              <h1 style={jobTitleStyle}>{job.title}</h1>
              <div style={metaContainerStyle}>
                {job.location && <span style={metaItemStyle}>📍 {job.location}</span>}
                <span>
                  • 💼 {job.minExperience === 0 ? 'Freshers Eligible' : `${job.minExperience} - ${job.maxExperience || '5+'} Yrs Exp`}
                </span>
                <span className="badge badge-success">Open</span>
              </div>
            </header>

            <section style={sectionStyle}>
              <h2 style={sectionTitleStyle}>Description</h2>
              <p style={paragraphStyle}>{job.description}</p>
            </section>

            {job.requirements && (
              <section style={sectionStyle}>
                <h2 style={sectionTitleStyle}>Requirements & Skills</h2>
                <p style={paragraphStyle}>{job.requirements}</p>
              </section>
            )}
          </article>

          {/* Application Submission Form Column */}
          <aside style={asideColumnStyle}>
            {success ? (
              <div className="careers-card" style={{ ...applyCardStyle, border: '1px solid rgba(16, 185, 129, 0.2)', textAlign: 'center' }}>
                <h3 style={{ color: 'var(--success)', marginBottom: '1rem' }}>Application Submitted!</h3>
                <p style={{ color: 'var(--gray-text-muted)', fontSize: '14px', marginBottom: '2rem' }}>
                  Thank you for applying. We have received your profile details and resume portfolio.
                </p>
                <Link to="/candidate/applications" className="btn-primary-lg" style={{ textDecoration: 'none', display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                  Go to Application Tracker
                </Link>
              </div>
            ) : !user ? (
              <div className="careers-card" style={applyCardStyle}>
                <h3 style={{ marginBottom: '1rem' }}>Interested in this role?</h3>
                <p style={{ color: 'var(--gray-text-muted)', fontSize: '14px', marginBottom: '2.5rem' }}>
                  Sign in to your candidate profile to upload your PDF resume, specify details, and track your application status.
                </p>
                <Link to="/login" className="btn-primary-lg" style={{ textDecoration: 'none', display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                  Sign In to Apply
                </Link>
              </div>
            ) : user.role !== 'candidate' ? (
              <div className="careers-card" style={applyCardStyle}>
                <h3 style={{ marginBottom: '1rem' }}>Application Locked</h3>
                <p style={{ color: 'var(--gray-text-muted)', fontSize: '14px' }}>
                  You are currently logged in as a <strong>{user.role}</strong>. Applications are reserved for Candidate profiles only.
                </p>
              </div>
            ) : (
              <div className="careers-card" style={applyCardStyle}>
                <h3 style={{ marginBottom: '1.5rem' }}>Apply for Position</h3>
                
                {submitError && (
                  <div style={errorContainerStyle}>
                    {submitError}
                  </div>
                )}

                {experienceError && (
                  <div style={warningContainerStyle}>
                    {experienceError}
                  </div>
                )}

                <form onSubmit={handleApplySubmit} style={formLayout}>
                  <div style={rowStyle}>
                    <div style={{ flex: 1 }}>
                      <label>Full Name</label>
                      <input type="text" value={user.name} disabled style={disabledInputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Email Address</label>
                      <input type="email" value={user.email} disabled style={disabledInputStyle} />
                    </div>
                  </div>

                  <div style={rowStyle}>
                    <div style={{ flex: 1 }}>
                      <label>Phone Number *</label>
                      <input 
                        type="tel" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="e.g. 9876543210"
                        required 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Years of Experience *</label>
                      <input 
                        type="number" 
                        min="0"
                        value={experience} 
                        onChange={(e) => setExperience(e.target.value === '' ? '' : Number(e.target.value))} 
                        placeholder="0 for Freshers"
                        required 
                      />
                    </div>
                  </div>

                  <div style={rowStyle}>
                    <div style={{ flex: 1 }}>
                      <label>Country *</label>
                      <input 
                        type="text" 
                        value={country} 
                        onChange={(e) => setCountry(e.target.value)} 
                        placeholder="e.g. India"
                        required 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>LinkedIn Profile URL *</label>
                      <input 
                        type="url" 
                        value={linkedinUrl} 
                        onChange={(e) => setLinkedinUrl(e.target.value)} 
                        placeholder="https://linkedin.com/in/..."
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label>Residential Address *</label>
                    <textarea 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      placeholder="Street, City, State, ZIP"
                      style={{ height: '70px', resize: 'vertical' }}
                      required 
                    />
                  </div>

                  <div style={rowStyle}>
                    <div style={{ flex: 1 }}>
                      <label>GitHub Profile (Optional)</label>
                      <input 
                        type="url" 
                        value={githubUrl} 
                        onChange={(e) => setGithubUrl(e.target.value)} 
                        placeholder="https://github.com/..."
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Portfolio / Personal Website</label>
                      <input 
                        type="url" 
                        value={portfolioUrl} 
                        onChange={(e) => setPortfolioUrl(e.target.value)} 
                        placeholder="https://mywebsite.com"
                      />
                    </div>
                  </div>

                  <div style={rowStyle}>
                    <div style={{ flex: 1 }}>
                      <label>Current Employer (Optional)</label>
                      <input 
                        type="text" 
                        value={currentCompany} 
                        onChange={(e) => setCurrentCompany(e.target.value)} 
                        placeholder="e.g. Acme Corp"
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label>Current Job Title</label>
                      <input 
                        type="text" 
                        value={currentTitle} 
                        onChange={(e) => setCurrentTitle(e.target.value)} 
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label>Sourcing Channel</label>
                    <select value={source} onChange={(e) => setSource(e.target.value)}>
                      <option value="linkedin">LinkedIn</option>
                      <option value="indeed">Indeed</option>
                      <option value="careers_page">Company Careers Page</option>
                      <option value="referral">Referral</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label>Cover Letter / Additional Notes (Optional)</label>
                    <textarea 
                      value={coverLetter} 
                      onChange={(e) => setCoverLetter(e.target.value)} 
                      placeholder="Introduce yourself to the hiring team..."
                      style={{ height: '90px', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ margin: '1.25rem 0' }}>
                    <label>Upload Resume PDF *</label>
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={handleFileChange}
                      required
                      style={{ paddingTop: '10px' }}
                    />
                  </div>

                  <div style={termsContainerStyle}>
                    <input 
                      type="checkbox" 
                      id="terms"
                      checked={termsAccepted} 
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      required
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    <label htmlFor="terms" style={termsLabelStyle}>
                      I confirm that the details provided are accurate. I accept the Terms of Service and Consent to share my profile details for evaluation.
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary-lg" 
                    style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
                    disabled={submitting || !isEligible}
                  >
                    {submitting ? 'Submitting Application...' : 'Submit Application'}
                  </button>
                </form>
              </div>
            )}
          </aside>
        </div>
      </main>

      <CareersFooter />
    </div>
  );
};

// Styles
const backLinkStyle: React.CSSProperties = {
  color: 'var(--accent-hover)',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: 600
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

const twoColumnLayout: React.CSSProperties = {
  display: 'flex',
  gap: 'var(--space-5)',
  flexWrap: 'wrap',
  alignItems: 'flex-start'
};

const detailCardStyle: React.CSSProperties = {
  flex: '1.2 1 500px',
  padding: 'var(--space-6)'
};

const asideColumnStyle: React.CSSProperties = {
  flex: '1 1 500px',
  maxWidth: '620px'
};

const applyCardStyle: React.CSSProperties = {
  padding: 'var(--space-5)'
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
  gap: 'var(--space-4)',
  flexWrap: 'wrap'
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

const warningContainerStyle: React.CSSProperties = {
  color: '#e11d48',
  backgroundColor: 'rgba(225, 29, 72, 0.08)',
  padding: 'var(--space-3)',
  borderRadius: 'var(--radius-default)',
  fontSize: '14px',
  marginBottom: 'var(--space-4)',
  border: '1px solid rgba(225, 29, 72, 0.2)',
  textAlign: 'center',
  fontWeight: 600
};

const formLayout: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  flexWrap: 'wrap'
};

const disabledInputStyle: React.CSSProperties = {
  backgroundColor: 'var(--gray-surface)',
  border: '1px solid var(--gray-border)',
  color: 'var(--gray-text-muted)',
  cursor: 'not-allowed'
};

const termsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  alignItems: 'flex-start',
  marginTop: '0.5rem',
  marginBottom: '0.5rem'
};

const termsLabelStyle: React.CSSProperties = {
  fontSize: '13px',
  color: 'var(--gray-text-muted)',
  cursor: 'pointer',
  userSelect: 'none',
  fontWeight: 500,
  lineHeight: 1.4,
  margin: 0
};
