import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { CareersNav } from './components/CareersNav';
import { CareersFooter } from './components/CareersFooter';
import { 
  MapPin, 
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
        <main style={{ padding: '100px 24px', flex: 1, textAlign: 'center' }}>
          <div className="careers-card" style={{ padding: 48, maxWidth: 480, margin: '0 auto' }}>
            <h2 style={{ color: 'var(--gray-text-muted)', fontSize: 18, marginBottom: 16 }}>Loading job opportunity...</h2>
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
        <main style={{ padding: '100px 24px', flex: 1, textAlign: 'center' }}>
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

  return (
    <div style={{ backgroundColor: 'var(--gray-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CareersNav />

      {/* ARCHITECTURAL LAYERED COMPOSITION (Hence / Stripe / Vercel layout) */}
      <main style={{ flex: 1 }}>
        <div className="job-layered-wrapper">

          {/* LEFT LAYER: HERO & APPLICATION FORM (Deep Indigo Header + Form) */}
          <aside className="job-layered-left">
            <div className="job-layered-left__topbar">
              <Link to="/" className="job-layered-left__backlink">
                <ArrowLeft size={15} /> Back to Open Roles
              </Link>
              <button 
                type="button" 
                onClick={() => navigate('/')} 
                className="job-layered-left__backlink"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                View Other Openings <ArrowUpRight size={15} />
              </button>
            </div>

            <h1 className="job-layered-left__title">{job.title}</h1>

            <div className="job-layered-left__location">
              <MapPin size={16} style={{ color: 'var(--accent)' }} />
              {job.location || 'Remote'}
            </div>

            <button
              type="button"
              className="btn-primary-lg"
              style={{ backgroundColor: '#ffffff', color: '#1e1b4b', fontWeight: 700, border: 'none', marginBottom: 28 }}
              onClick={() => {
                document.getElementById('application-form-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Apply Now <ArrowUpRight size={16} />
            </button>

            <div className="job-layered-left__divider" />

            {/* INTEGRATED APPLICATION FORM OR AUTHENTICATION CTA */}
            <div id="application-form-section">
              <h2 style={{ fontSize: 24, fontWeight: 700, color: '#ffffff', marginBottom: 8, fontFamily: 'serif' }}>
                Application Form
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.6)', marginBottom: 28 }}>
                * Required fields
              </p>

              {success ? (
                <div style={{ padding: 24, backgroundColor: 'rgba(52, 211, 153, 0.1)', borderRadius: 16, border: '1px solid rgba(52, 211, 153, 0.3)', color: '#ffffff' }}>
                  <CheckCircle2 size={40} style={{ color: '#34d399', marginBottom: 12 }} />
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Application Submitted!</h3>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.8)', marginBottom: 20 }}>
                    Your application for <strong>{job.title}</strong> has been received by our recruiting team.
                  </p>
                  <Link to="/candidate/applications" className="btn-primary-lg" style={{ background: '#ffffff', color: '#1e1b4b', textDecoration: 'none', display: 'inline-flex', width: '100%', justifyContent: 'center' }}>
                    View Tracker
                  </Link>
                </div>
              ) : !user ? (
                /* SIGNED-OUT VISITOR EXPERIENCE */
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 28, borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: 'rgba(79, 70, 229, 0.3)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                    <ShieldCheck size={20} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
                    Sign in to apply for this position
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6, marginBottom: 24 }}>
                    Log in to your candidate account or register to upload your PDF resume, track evaluations, and schedule interviews.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Link to="/login" className="btn-primary-lg" style={{ background: '#ffffff', color: '#1e1b4b', padding: '12px', fontSize: 14, justifyContent: 'center', textDecoration: 'none', border: 'none' }}>
                      <LogIn size={16} /> Sign In to Apply
                    </Link>
                    <Link to="/register" className="btn-secondary-lg" style={{ background: 'transparent', color: '#ffffff', borderColor: 'rgba(255, 255, 255, 0.3)', padding: '12px', fontSize: 14, justifyContent: 'center', textDecoration: 'none' }}>
                      <UserPlus size={16} /> Create Account
                    </Link>
                  </div>
                </div>
              ) : user.role !== 'candidate' ? (
                <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 24, borderRadius: 16, border: '1px solid rgba(255, 255, 255, 0.15)' }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 6 }}>
                    Application Form Locked
                  </h3>
                  <p style={{ fontSize: 13, color: 'rgba(255, 255, 255, 0.7)' }}>
                    Logged in as <strong>{user.role}</strong>. Applications are reserved for candidate accounts.
                  </p>
                </div>
              ) : (
                /* AUTHENTICATED CANDIDATE APPLICATION FORM */
                <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {submitError && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#fca5a5', padding: '12px 16px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={16} /> {submitError}
                    </div>
                  )}

                  {experienceError && (
                    <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245, 158, 11, 0.4)', color: '#fcd34d', padding: '12px 16px', borderRadius: 10, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <AlertCircle size={16} /> {experienceError}
                    </div>
                  )}

                  <div>
                    <label style={darkLabelStyle}>Full Name *</label>
                    <input type="text" value={user.name} disabled className="job-layered-input-disabled" />
                  </div>

                  <div>
                    <label style={darkLabelStyle}>Email Address *</label>
                    <input type="email" value={user.email} disabled className="job-layered-input-disabled" />
                  </div>

                  <div>
                    <label style={darkLabelStyle}>Contact Number *</label>
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      placeholder="e.g. +1 555-0198"
                      className="job-layered-input"
                      required 
                    />
                  </div>

                  <div>
                    <label style={darkLabelStyle}>Total Full Time Experience (Years) *</label>
                    <input 
                      type="number" 
                      min="0"
                      value={experience} 
                      onChange={(e) => setExperience(e.target.value === '' ? '' : Number(e.target.value))} 
                      placeholder="0 for Freshers"
                      className="job-layered-input"
                      required 
                    />
                  </div>

                  <div>
                    <label style={darkLabelStyle}>Country *</label>
                    <input 
                      type="text" 
                      value={country} 
                      onChange={(e) => setCountry(e.target.value)} 
                      placeholder="e.g. India / USA"
                      className="job-layered-input"
                      required 
                    />
                  </div>

                  <div>
                    <label style={darkLabelStyle}>LinkedIn Profile URL *</label>
                    <input 
                      type="url" 
                      value={linkedinUrl} 
                      onChange={(e) => setLinkedinUrl(e.target.value)} 
                      placeholder="https://linkedin.com/in/..."
                      className="job-layered-input"
                      required 
                    />
                  </div>

                  <div>
                    <label style={darkLabelStyle}>Residential Address *</label>
                    <textarea 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      placeholder="Street, City, State, ZIP"
                      className="job-layered-input"
                      style={{ height: 70, resize: 'vertical' }}
                      required 
                    />
                  </div>

                  <div>
                    <label style={darkLabelStyle}>GitHub Profile (Optional)</label>
                    <input 
                      type="url" 
                      value={githubUrl} 
                      onChange={(e) => setGithubUrl(e.target.value)} 
                      placeholder="https://github.com/..."
                      className="job-layered-input"
                    />
                  </div>

                  <div>
                    <label style={darkLabelStyle}>Portfolio Website (Optional)</label>
                    <input 
                      type="url" 
                      value={portfolioUrl} 
                      onChange={(e) => setPortfolioUrl(e.target.value)} 
                      placeholder="https://mywebsite.com"
                      className="job-layered-input"
                    />
                  </div>

                  <div>
                    <label style={darkLabelStyle}>Current Employer (Optional)</label>
                    <input 
                      type="text" 
                      value={currentCompany} 
                      onChange={(e) => setCurrentCompany(e.target.value)} 
                      placeholder="e.g. Acme Corp"
                      className="job-layered-input"
                    />
                  </div>

                  <div>
                    <label style={darkLabelStyle}>Current Job Title (Optional)</label>
                    <input 
                      type="text" 
                      value={currentTitle} 
                      onChange={(e) => setCurrentTitle(e.target.value)} 
                      placeholder="e.g. Software Engineer"
                      className="job-layered-input"
                    />
                  </div>

                  <div>
                    <label style={darkLabelStyle}>Sourcing Channel</label>
                    <select 
                      value={source} 
                      onChange={(e) => setSource(e.target.value)}
                      className="job-layered-input"
                      style={{ color: '#ffffff', backgroundColor: '#1e293b' }}
                    >
                      <option value="careers_page">Company Careers Page</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="indeed">Indeed</option>
                      <option value="referral">Referral</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={darkLabelStyle}>Cover Letter / Additional Notes (Optional)</label>
                    <textarea 
                      value={coverLetter} 
                      onChange={(e) => setCoverLetter(e.target.value)} 
                      placeholder="Introduce yourself to the hiring team..."
                      className="job-layered-input"
                      style={{ height: 80, resize: 'vertical' }}
                    />
                  </div>

                  <div>
                    <label style={darkLabelStyle}>Upload Resume PDF *</label>
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      onChange={handleFileChange}
                      required
                      style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 13, paddingTop: 6 }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 4 }}>
                    <input 
                      type="checkbox" 
                      id="terms"
                      checked={termsAccepted} 
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      required
                      style={{ width: 16, height: 16, marginTop: 3, cursor: 'pointer' }}
                    />
                    <label htmlFor="terms" style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5, cursor: 'pointer' }}>
                      I confirm details are accurate. I accept Terms of Service & Consent to share profile.
                    </label>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary-lg" 
                    style={{ width: '100%', marginTop: 8, justifyContent: 'center', backgroundColor: 'var(--accent)', color: '#ffffff', border: 'none' }}
                    disabled={submitting || !isEligible}
                  >
                    {submitting ? 'Submitting Application...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </div>
          </aside>

          {/* RIGHT LAYER: ELEVATED WHITE EDITORIAL CONTENT SECTION */}
          <section className="job-layered-right">

            {/* Top Metadata Grid */}
            <div className="job-layered-metadata-grid">
              <div className="job-layered-metadata-item">
                <span className="job-layered-metadata-label">Experience</span>
                <span className="job-layered-metadata-val">
                  {job.minExperience === 0 || job.minExperience === undefined ? 'Freshers Eligible' : `${job.minExperience}–${job.maxExperience || '5+'} Years`}
                </span>
              </div>

              <div className="job-layered-metadata-item">
                <span className="job-layered-metadata-label">Seniority Level</span>
                <span className="job-layered-metadata-val">
                  {job.minExperience === 0 ? 'Entry Level' : job.minExperience >= 5 ? 'Senior / Lead' : 'Mid Level'}
                </span>
              </div>

              <div className="job-layered-metadata-item">
                <span className="job-layered-metadata-label">Employment Type</span>
                <span className="job-layered-metadata-val">Full-time</span>
              </div>

              <div className="job-layered-metadata-item">
                <span className="job-layered-metadata-label">Compensation</span>
                <span className="job-layered-metadata-val">
                  ${(job.minExperience || 0) * 20 + 80}k – ${(job.minExperience || 0) * 20 + 120}k
                </span>
              </div>
            </div>

            {/* Role Overview */}
            <div style={{ marginBottom: 48 }}>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-text-primary)', marginBottom: 18, fontFamily: 'serif' }}>
                Role Overview
              </h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--gray-text-muted)', whiteSpace: 'pre-line' }}>
                {job.description}
              </p>
            </div>

            {/* Duties and Responsibilities / Requirements */}
            {job.requirements && (
              <div style={{ marginBottom: 48 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-text-primary)', marginBottom: 18, fontFamily: 'serif' }}>
                  Duties and Responsibilities
                </h2>
                <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--gray-text-muted)', whiteSpace: 'pre-line' }}>
                  {job.requirements}
                </p>
              </div>
            )}

            {/* What We Offer & Culture */}
            <div className="careers-card" style={{ padding: 32, backgroundColor: 'rgba(79, 70, 229, 0.03)', border: '1px solid rgba(79, 70, 229, 0.12)', borderRadius: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-text-primary)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={20} style={{ color: 'var(--accent)' }} /> What We Offer
              </h3>
              <ul style={{ paddingLeft: 20, margin: 0, fontSize: 15, color: 'var(--gray-text-muted)', lineHeight: 1.8 }}>
                <li>Remote-first global freedom with async collaboration hours</li>
                <li>$2,500 annual budget for conferences, courses, and certifications</li>
                <li>Choice of MacBook Pro or Linux workstation + 4K monitor</li>
                <li>Comprehensive family medical, dental, and health coverage</li>
              </ul>
            </div>

          </section>

        </div>
      </main>

      <CareersFooter />
    </div>
  );
};

const darkLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: 'rgba(255, 255, 255, 0.85)',
  marginBottom: 6,
  letterSpacing: '0.02em'
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
