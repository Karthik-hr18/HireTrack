import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CareersNav } from './components/CareersNav';
import { CareersFooter } from './components/CareersFooter';
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  ArrowLeft, 
  ArrowUpRight, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  LogIn, 
  UserPlus,
  AlertCircle
} from 'lucide-react';

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
  const [source, setSource] = useState('careers_page');
  const [resume, setResume] = useState<File | null>(null);

  // Validation & Submission States
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
        <main className="careers-container" style={{ padding: '100px 24px', flex: 1, textAlign: 'center' }}>
          <div className="careers-card" style={{ padding: 48, maxWidth: 480, margin: '0 auto' }}>
            <h2 style={{ color: 'var(--gray-text-muted)', fontSize: 18, marginBottom: 16 }}>Loading opportunity details...</h2>
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
        <main className="careers-container" style={{ padding: '100px 24px', flex: 1, textAlign: 'center' }}>
          <div className="careers-card" style={{ padding: 48, maxWidth: 480, margin: '0 auto', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h2 style={{ color: 'var(--error)', fontSize: 20, marginBottom: 12 }}>Position Not Available</h2>
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

  // Derive salary band estimate
  const salaryEstimate = `$${(job.minExperience || 0) * 20 + 80}k – $${(job.minExperience || 0) * 20 + 120}k`;

  return (
    <div style={{ backgroundColor: 'var(--gray-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CareersNav />

      {/* OVERLAPPING HERO SECTION */}
      <header className="job-detail-hero">
        <div className="careers-container">
          <div className="job-detail-hero__topbar">
            <Link to="/" className="job-detail-hero__backlink">
              <ArrowLeft size={16} /> Back to Open Roles
            </Link>
            <button 
              type="button" 
              onClick={() => navigate('/')} 
              className="job-detail-hero__backlink"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              View Other Openings <ArrowUpRight size={16} />
            </button>
          </div>

          <h1 className="job-detail-hero__title">{job.title}</h1>

          <div className="job-detail-hero__meta">
            <span className="job-detail-hero__chip">
              <MapPin size={14} /> {job.location || 'Remote'}
            </span>
            <span className="job-detail-hero__chip">
              <Briefcase size={14} /> {job.minExperience === 0 || job.minExperience === undefined ? 'Freshers Eligible' : `${job.minExperience}+ Yrs Experience`}
            </span>
            <span className="job-detail-hero__chip">
              <Clock size={14} /> Full-time Position
            </span>
            <span className="job-detail-hero__chip" style={{ background: 'rgba(52, 211, 153, 0.2)', border: '1px solid rgba(52, 211, 153, 0.3)', color: '#6ee7b7' }}>
              <Sparkles size={14} /> Active Role
            </span>
          </div>

          <button
            type="button"
            className="btn-primary-lg"
            style={{ backgroundColor: '#ffffff', color: '#1e1b4b', fontWeight: 700, border: 'none' }}
            onClick={() => {
              document.getElementById('apply-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Apply Now <ArrowUpRight size={16} />
          </button>
        </div>
      </header>

      {/* OVERLAPPING FLOATING CONTAINER */}
      <main className="careers-container" style={{ flex: 1 }}>
        <div className="job-detail-overlap-card">
          <div className="job-detail-grid">

            {/* LEFT COLUMN: Application Form or Signed-Out Auth State */}
            <section id="apply-section">
              {success ? (
                <div style={{ padding: '32px 24px', textAlign: 'center', backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: 16, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <CheckCircle2 size={48} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-text-primary)', marginBottom: 8 }}>
                    Application Submitted!
                  </h3>
                  <p style={{ color: 'var(--gray-text-muted)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                    Thank you for applying for <strong>{job.title}</strong>. Your profile and PDF resume have been successfully transmitted to our recruiting pipeline.
                  </p>
                  <Link to="/candidate/applications" className="btn-primary-lg" style={{ textDecoration: 'none', display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                    View Application Tracker
                  </Link>
                </div>
              ) : !user ? (
                /* SIGNED-OUT VISITOR EXPERIENCE */
                <div style={{ backgroundColor: 'var(--gray-bg)', padding: 32, borderRadius: 20, border: '1px solid var(--gray-border)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <ShieldCheck size={22} />
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-text-primary)', marginBottom: 8 }}>
                    Sign in to apply for this position
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--gray-text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
                    Create a free candidate profile or log in to submit your resume, specify experience details, and track your application status in real-time.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--gray-text-primary)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} /> Instant PDF resume evaluation
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--gray-text-primary)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} /> Real-time pipeline stage updates
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--gray-text-primary)' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--accent)' }} /> Direct interview scheduling triggers
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <Link to="/login" className="btn-primary-lg" style={{ padding: '12px', fontSize: 14, justifyContent: 'center', textDecoration: 'none' }}>
                      <LogIn size={16} /> Sign In
                    </Link>
                    <Link to="/register" className="btn-secondary-lg" style={{ padding: '12px', fontSize: 14, justifyContent: 'center', textDecoration: 'none' }}>
                      <UserPlus size={16} /> Create Account
                    </Link>
                  </div>
                </div>
              ) : user.role !== 'candidate' ? (
                /* RECRUITER / ADMIN USER */
                <div style={{ backgroundColor: 'var(--gray-bg)', padding: 32, borderRadius: 20, border: '1px solid var(--gray-border)' }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-text-primary)', marginBottom: 8 }}>
                    Application Form Locked
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--gray-text-muted)', lineHeight: 1.6 }}>
                    You are currently logged in as a <strong>{user.role}</strong>. Job applications are reserved for candidate accounts.
                  </p>
                </div>
              ) : (
                /* AUTHENTICATED CANDIDATE APPLICATION FORM */
                <div>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-text-primary)', marginBottom: 8 }}>
                    Apply for Position
                  </h3>
                  <p style={{ fontSize: 14, color: 'var(--gray-text-muted)', marginBottom: 24 }}>
                    Complete your profile information and upload your PDF resume.
                  </p>

                  {submitError && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--error)', padding: '12px 16px', borderRadius: 12, fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={16} /> {submitError}
                    </div>
                  )}

                  {experienceError && (
                    <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#b45309', padding: '12px 16px', borderRadius: 12, fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={16} /> {experienceError}
                    </div>
                  )}

                  <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Full Name</label>
                        <input type="text" value={user.name} disabled style={disabledInputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Email Address</label>
                        <input type="email" value={user.email} disabled style={disabledInputStyle} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Phone Number *</label>
                        <input 
                          type="tel" 
                          value={phone} 
                          onChange={(e) => setPhone(e.target.value)} 
                          placeholder="e.g. 9876543210"
                          style={inputStyle}
                          required 
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Years of Experience *</label>
                        <input 
                          type="number" 
                          min="0"
                          value={experience} 
                          onChange={(e) => setExperience(e.target.value === '' ? '' : Number(e.target.value))} 
                          placeholder="0 for Freshers"
                          style={inputStyle}
                          required 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Country *</label>
                        <input 
                          type="text" 
                          value={country} 
                          onChange={(e) => setCountry(e.target.value)} 
                          placeholder="e.g. India"
                          style={inputStyle}
                          required 
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>LinkedIn Profile URL *</label>
                        <input 
                          type="url" 
                          value={linkedinUrl} 
                          onChange={(e) => setLinkedinUrl(e.target.value)} 
                          placeholder="https://linkedin.com/in/..."
                          style={inputStyle}
                          required 
                        />
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Residential Address *</label>
                      <textarea 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        placeholder="Street, City, State, ZIP"
                        style={{ ...inputStyle, height: 70, resize: 'vertical' }}
                        required 
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>GitHub Profile (Optional)</label>
                        <input 
                          type="url" 
                          value={githubUrl} 
                          onChange={(e) => setGithubUrl(e.target.value)} 
                          placeholder="https://github.com/..."
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Portfolio Website</label>
                        <input 
                          type="url" 
                          value={portfolioUrl} 
                          onChange={(e) => setPortfolioUrl(e.target.value)} 
                          placeholder="https://mywebsite.com"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                      <div>
                        <label style={labelStyle}>Current Employer</label>
                        <input 
                          type="text" 
                          value={currentCompany} 
                          onChange={(e) => setCurrentCompany(e.target.value)} 
                          placeholder="e.g. Acme Corp"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Current Job Title</label>
                        <input 
                          type="text" 
                          value={currentTitle} 
                          onChange={(e) => setCurrentTitle(e.target.value)} 
                          placeholder="e.g. Software Engineer"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={labelStyle}>Sourcing Channel</label>
                      <select 
                        value={source} 
                        onChange={(e) => setSource(e.target.value)}
                        style={inputStyle}
                      >
                        <option value="careers_page">Company Careers Page</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="indeed">Indeed</option>
                        <option value="referral">Referral</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Cover Letter / Additional Notes</label>
                      <textarea 
                        value={coverLetter} 
                        onChange={(e) => setCoverLetter(e.target.value)} 
                        placeholder="Introduce yourself to the hiring team..."
                        style={{ ...inputStyle, height: 90, resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Upload Resume PDF *</label>
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        onChange={handleFileChange}
                        required
                        style={{ ...inputStyle, paddingTop: 8 }}
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 8 }}>
                      <input 
                        type="checkbox" 
                        id="terms"
                        checked={termsAccepted} 
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        required
                        style={{ width: 18, height: 18, marginTop: 2, cursor: 'pointer' }}
                      />
                      <label htmlFor="terms" style={{ fontSize: 13, color: 'var(--gray-text-muted)', lineHeight: 1.5, cursor: 'pointer' }}>
                        I confirm that the details provided are accurate. I accept the Terms of Service and Consent to share my profile details for evaluation.
                      </label>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-primary-lg" 
                      style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
                      disabled={submitting || !isEligible}
                    >
                      {submitting ? 'Submitting Application...' : 'Submit Application'}
                    </button>
                  </form>
                </div>
              )}
            </section>

            {/* RIGHT COLUMN: Role Overview, Requirements & Company Info */}
            <section>
              {/* Overview Summary Pills */}
              <div className="job-detail-overview-pill">
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Experience</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-text-primary)' }}>
                    {job.minExperience === 0 || job.minExperience === undefined ? 'Freshers Eligible' : `${job.minExperience}–${job.maxExperience || '5+'} Years`}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Seniority Level</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-text-primary)' }}>
                    {job.minExperience === 0 ? 'Entry Level' : job.minExperience >= 5 ? 'Senior / Lead' : 'Mid Level'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 4 }}>Est. Band</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-text-primary)' }}>
                    {salaryEstimate}
                  </div>
                </div>
              </div>

              {/* Role Overview */}
              <div style={{ marginBottom: 36 }}>
                <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-text-primary)', marginBottom: 14 }}>
                  Role Overview
                </h3>
                <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--gray-text-muted)', whiteSpace: 'pre-line' }}>
                  {job.description}
                </p>
              </div>

              {/* Duties & Requirements */}
              {job.requirements && (
                <div style={{ marginBottom: 36 }}>
                  <h3 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-text-primary)', marginBottom: 14 }}>
                    Duties & Requirements
                  </h3>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--gray-text-muted)', whiteSpace: 'pre-line' }}>
                    {job.requirements}
                  </p>
                </div>
              )}

              {/* What We Offer */}
              <div className="careers-card" style={{ padding: 28, backgroundColor: 'rgba(79, 70, 229, 0.03)', border: '1px solid rgba(79, 70, 229, 0.12)' }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={18} style={{ color: 'var(--accent)' }} /> What We Offer
                </h4>
                <ul style={{ paddingLeft: 20, margin: 0, fontSize: 14, color: 'var(--gray-text-muted)', lineHeight: 1.8 }}>
                  <li>Remote-first flexibility with global async collaboration</li>
                  <li>$2,500 annual personal learning and conference budget</li>
                  <li>Latest hardware setup (MacBook Pro / Linux workstation)</li>
                  <li>Comprehensive medical, dental, and health coverage</li>
                </ul>
              </div>
            </section>

          </div>
        </div>
      </main>

      <CareersFooter />
    </div>
  );
};

// Form Input Styles
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: 'var(--gray-text-primary)',
  marginBottom: 6
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-default)',
  border: '1px solid var(--gray-border)',
  backgroundColor: 'var(--gray-bg)',
  fontSize: 14,
  color: 'var(--gray-text-primary)',
  fontFamily: 'var(--font-sans)',
  boxSizing: 'border-box'
};

const disabledInputStyle: React.CSSProperties = {
  ...inputStyle,
  backgroundColor: 'rgba(226, 232, 240, 0.5)',
  color: 'var(--gray-text-muted)',
  cursor: 'not-allowed'
};

const spinnerStyle: React.CSSProperties = {
  width: '35px',
  height: '35px',
  border: '3px solid var(--gray-border)',
  borderTop: '3px solid var(--accent)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '1.5rem auto 0 auto'
};
