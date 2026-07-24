import React, { useState, useEffect } from 'react';
import { X, UserPlus, AlertCircle, Upload, Loader2, Sparkles } from 'lucide-react';
import './modal.css';

interface JobOption {
  id: string;
  title: string;
  department?: string;
}

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedJobId?: string;
  jobs: JobOption[];
}

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedJobId,
  jobs,
}) => {
  const [jobId, setJobId] = useState(selectedJobId || '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState<number | ''>(0);
  const [country, setCountry] = useState('India');
  const [address, setAddress] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentTitle, setCurrentTitle] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  // Source & Referrer Fields
  const [source, setSource] = useState('referral');
  const [referrerName, setReferrerName] = useState('');
  const [referrerEmail, setReferrerEmail] = useState('');
  const [referralNotes, setReferralNotes] = useState('');

  // File & Form Status
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync selectedJobId if provided
  useEffect(() => {
    if (selectedJobId) {
      setJobId(selectedJobId);
    } else if (jobs.length > 0 && !jobId) {
      setJobId(jobs[0].id);
    }
  }, [selectedJobId, jobs]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        setError('Please upload a valid PDF document.');
        return;
      }
      setError(null);
      setResumeFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) {
      setError('Please select a target job requisition.');
      return;
    }
    if (!resumeFile) {
      setError('Please upload candidate resume (PDF).');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('name', name.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      formData.append('experience', String(experience === '' ? 0 : experience));
      formData.append('country', country.trim());
      formData.append('address', address.trim());
      formData.append('linkedinUrl', linkedinUrl.trim());
      if (githubUrl.trim()) formData.append('githubUrl', githubUrl.trim());
      if (portfolioUrl.trim()) formData.append('portfolioUrl', portfolioUrl.trim());
      if (currentCompany.trim()) formData.append('currentCompany', currentCompany.trim());
      if (currentTitle.trim()) formData.append('currentTitle', currentTitle.trim());
      if (coverLetter.trim()) formData.append('coverLetter', coverLetter.trim());

      formData.append('source', source);
      if (referrerName.trim()) formData.append('referrerName', referrerName.trim());
      if (referrerEmail.trim()) formData.append('referrerEmail', referrerEmail.trim());
      if (referralNotes.trim()) formData.append('referralNotes', referralNotes.trim());

      formData.append('resume', resumeFile);

      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || '';

      const res = await fetch(`${apiUrl}/api/applications/manual`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to add candidate');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'An error occurred while adding the candidate.');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 700,
    color: '#475569',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '13.5px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    boxSizing: 'border-box',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 820, borderRadius: 16 }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{ padding: '16px 24px', backgroundColor: '#ffffff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
                Add Candidate to Pipeline
              </h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                Manually add candidate or employee referral directly into active requisition
              </p>
            </div>
          </div>
          <button type="button" className="close-button" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Form */}
        <form onSubmit={handleSubmit} className="modal-content" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {error && (
            <div style={{ padding: '12px 16px', borderRadius: 10, backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={16} /> <span>{error}</span>
            </div>
          )}

          {/* SECTION 1: REQUISITION & SOURCE CONTROL */}
          <div style={{ backgroundColor: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Target Requisition *</label>
              <select
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                style={inputStyle}
                required
              >
                <option value="">-- Select Open Job --</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} {j.department ? `(${j.department})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Candidate Source *</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                style={inputStyle}
                required
              >
                <option value="referral">Referral (Employee / Internal)</option>
                <option value="careers_page">Careers Page</option>
                <option value="linkedin">LinkedIn</option>
                <option value="agency">Agency Sourced</option>
                <option value="campus">Campus Drive</option>
                <option value="direct">Direct Sourcing</option>
                <option value="naukri">Naukri</option>
                <option value="indeed">Indeed</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* SECTION 2: REFERRER DETAILS (IF REFERRAL OR OPTIONAL) */}
          {source === 'referral' && (
            <div style={{ backgroundColor: '#f0f9ff', padding: 16, borderRadius: 12, border: '1px solid #bae6fd' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Sparkles size={16} style={{ color: '#0284c7' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0369a1' }}>Employee Referrer Metadata</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Referrer Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Jenkins"
                    value={referrerName}
                    onChange={(e) => setReferrerName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Referrer Email (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. sjenkins@company.com"
                    value={referrerEmail}
                    onChange={(e) => setReferrerEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Referral Endorsement Notes</label>
                <textarea
                  placeholder="Why is this candidate recommended for this role?"
                  value={referralNotes}
                  onChange={(e) => setReferralNotes(e.target.value)}
                  style={{ ...inputStyle, height: 60, resize: 'vertical' }}
                />
              </div>
            </div>
          )}

          {/* SECTION 3: CANDIDATE CONTACT DETAILS */}
          <div>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 12 }}>
              Candidate Information
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Candidate Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Candidate Email Address *</label>
                <input
                  type="email"
                  placeholder="rahul.sharma@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Years of Experience *</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0 for Fresher"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value === '' ? '' : Number(e.target.value))}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Country *</label>
                <input
                  type="text"
                  placeholder="India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Residential Address *</label>
              <textarea
                placeholder="Street, City, State, Pincode"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ ...inputStyle, height: 60, resize: 'vertical' }}
                required
              />
            </div>
          </div>

          {/* SECTION 4: PROFESSIONAL LINKS & EMPLOYMENT */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>LinkedIn Profile URL *</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label style={labelStyle}>GitHub Profile (Optional)</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Current Company (Optional)</label>
              <input
                type="text"
                placeholder="Acme Corp"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Current Job Title (Optional)</label>
              <input
                type="text"
                placeholder="Software Engineer"
                value={currentTitle}
                onChange={(e) => setCurrentTitle(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>Portfolio Website (Optional)</label>
              <input
                type="url"
                placeholder="https://mywebsite.com"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Candidate Cover Note (Optional)</label>
              <input
                type="text"
                placeholder="Additional candidate notes or cover summary..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* SECTION 5: RESUME PDF UPLOAD */}
          <div>
            <label style={labelStyle}>Upload Candidate Resume (PDF) *</label>
            <div style={{ border: '2px dashed #cbd5e1', padding: '16px', borderRadius: 12, backgroundColor: '#f8fafc', textAlign: 'center' }}>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                required
                style={{ display: 'none' }}
                id="modal-resume-input"
              />
              <label htmlFor="modal-resume-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <Upload size={24} style={{ color: '#0284c7' }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                  {resumeFile ? resumeFile.name : 'Click to select PDF Resume'}
                </span>
                <span style={{ fontSize: 11, color: '#64748b' }}>
                  {resumeFile ? `${(resumeFile.size / 1024).toFixed(1)} KB` : 'PDF format up to 10MB'}
                </span>
              </label>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="modal-footer" style={{ padding: '16px 0 0 0', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
            <button
              type="button"
              className="btn-secondary-sm"
              onClick={onClose}
              disabled={loading}
              style={{ height: 38, padding: '0 16px', borderRadius: 8 }}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary-sm"
              disabled={loading}
              style={{ height: 38, padding: '0 20px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, backgroundColor: '#0284c7' }}
            >
              {loading ? <Loader2 size={16} className="spin" /> : <UserPlus size={16} />}
              {loading ? 'Adding Candidate…' : 'Add Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
