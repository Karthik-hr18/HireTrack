import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CareersFooter } from '../careers/components/CareersFooter';
import { 
  FileText, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  LogOut, 
  User, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Briefcase 
} from 'lucide-react';

import { PdfViewerModal } from '../../components/ui/PdfViewerModal';

export const ApplicationsTracker: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewCandidateName, setPreviewCandidateName] = useState<string>('My Resume');

  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  useEffect(() => {
    document.title = "HireTrack | Candidate Applications";
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchApplications = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/applications/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load application tracker information.');
        }

        const data = await response.json();
        setApplications(data || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getStageBadgeStyle = (stage: string) => {
    switch (stage) {
      case 'applied':
        return { backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent)', border: '1px solid rgba(79, 70, 229, 0.2)' };
      case 'technical':
      case 'behavioral':
        return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#b45309', border: '1px solid rgba(245, 158, 11, 0.25)' };
      case 'offer':
        return { backgroundColor: 'rgba(167, 139, 250, 0.15)', color: '#7c3aed', border: '1px solid rgba(167, 139, 250, 0.3)' };
      case 'hired':
        return { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#047857', border: '1px solid rgba(16, 185, 129, 0.25)' };
      case 'rejected':
        return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' };
      default:
        return { backgroundColor: 'var(--gray-bg)', color: 'var(--gray-text-muted)', border: '1px solid var(--gray-border)' };
    }
  };

  // Metrics computation
  const activeCount = applications.filter(a => a.stage !== 'rejected' && a.stage !== 'hired').length;
  const offerCount = applications.filter(a => a.stage === 'offer' || a.stage === 'hired').length;

  return (
    <div style={{ backgroundColor: 'var(--gray-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* DEDICATED STICKY CANDIDATE NAVBAR */}
      <header className="careers-nav">
        <div className="careers-container">
          <div className="careers-nav__inner">
            <Link to="/" className="careers-nav__logo" aria-label="HireTrack Homepage">
              <span style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: 32, 
                height: 32, 
                borderRadius: 8, 
                backgroundColor: 'var(--accent)', 
                color: '#fff', 
                fontWeight: 800, 
                fontSize: 16 
              }}>
                H
              </span>
              Hire<span style={{ color: 'var(--accent)' }}>Track</span>
            </Link>

            {/* NAV ITEMS: Careers | Candidate Name | Sign Out */}
            <nav className="careers-nav__links" aria-label="Candidate Navigation">
              <a href="/#open-positions" className="careers-nav__link" style={{ fontWeight: 600 }}>
                Careers
              </a>

              {/* Candidate Name Pill */}
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'var(--gray-surface)',
                  border: '1px solid var(--gray-border)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--gray-text-primary)',
                  boxShadow: 'var(--shadow-card-subtle)',
                }}
              >
                <User size={14} style={{ color: 'var(--accent)' }} />
                <span>{user?.name || 'Candidate'}</span>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="careers-nav__cta"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  color: 'var(--error)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="careers-container" style={{ flex: 1, padding: '40px 24px 80px' }}>
        
        {/* Header Title */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.15)', fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            <Sparkles size={13} /> Candidate Portal
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: 'var(--gray-text-primary)', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
            Application <span style={{ color: 'var(--accent)' }}>Tracker</span>
          </h1>
          <p style={{ fontSize: 16, color: 'var(--gray-text-muted)', margin: 0 }}>
            Monitor your active pipelines, interview schedules, and evaluation status in real-time.
          </p>
        </div>

        {/* Pipeline Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 36 }}>
          <div className="careers-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={16} style={{ color: 'var(--accent)' }} /> Total Submissions
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--gray-text-primary)' }}>
              {applications.length}
            </div>
          </div>

          <div className="careers-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} style={{ color: '#b45309' }} /> In Active Review
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#b45309' }}>
              {activeCount}
            </div>
          </div>

          <div className="careers-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} style={{ color: '#047857' }} /> Offers & Hires
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#047857' }}>
              {offerCount}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="careers-card" style={{ padding: 48, textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-text-muted)', marginBottom: 16 }}>
              Syncing application records...
            </div>
            <div style={{ width: 36, height: 36, border: '3px solid var(--gray-border)', borderTop: '3px solid var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          </div>
        ) : error ? (
          <div className="careers-card" style={{ padding: 48, textAlign: 'center', maxWidth: 480, margin: '0 auto', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--error)', marginBottom: 12 }}>Sync Failed</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-text-muted)', marginBottom: 20 }}>{error}</p>
            <button type="button" className="btn-primary-lg" onClick={() => window.location.reload()} style={{ backgroundColor: 'var(--error)', margin: '0 auto', fontSize: 14, padding: '10px 20px' }}>
              Retry Sync
            </button>
          </div>
        ) : applications.length === 0 ? (
          /* Empty Submissions Card */
          <div className="careers-card" style={{ padding: '60px 24px', textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(79, 70, 229, 0.08)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Briefcase size={26} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-text-primary)', marginBottom: 10 }}>
              No Applications Submitted Yet
            </h3>
            <p style={{ fontSize: 14, color: 'var(--gray-text-muted)', lineHeight: 1.6, marginBottom: 24 }}>
              You haven't submitted any applications to HireTrack yet. Explore open roles on our careers portal to start your candidate journey!
            </p>
            <Link to="/" className="btn-primary-lg" style={{ textDecoration: 'none', display: 'inline-flex', margin: '0 auto' }}>
              Explore Openings →
            </Link>
          </div>
        ) : (
          /* Applications Table Card */
          <div className="careers-card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--gray-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-text-primary)', margin: 0 }}>
                Submitted Applications ({applications.length})
              </h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-sans)' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--gray-bg)', borderBottom: '1px solid var(--gray-border)' }}>
                    <th style={thStyle}>Position Title</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>Applied Date</th>
                    <th style={thStyle}>Pipeline Stage</th>
                    <th style={thStyle}>Resume Portfolio</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id} style={{ borderBottom: '1px solid var(--gray-border)', transition: 'background-color 0.15s' }}>
                      <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--gray-text-primary)' }}>
                        <Link to={`/jobs/${app.job?._id}`} style={{ color: 'var(--gray-text-primary)', textDecoration: 'none' }}>
                          {app.job?.title || 'Unknown Role'}
                        </Link>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--gray-text-muted)', fontSize: 13 }}>
                          <MapPin size={13} style={{ color: 'var(--accent)' }} />
                          {app.job?.location || 'Remote'}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--gray-text-muted)', fontSize: 13 }}>
                          <Calendar size={13} />
                          {new Date(app.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <span 
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-pill)',
                            display: 'inline-block',
                            ...getStageBadgeStyle(app.stage)
                          }}
                        >
                          {app.stage}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewPdfUrl(app.resumeUrl);
                            setPreviewCandidateName(user?.name || 'My Resume');
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: 'var(--accent)',
                            fontSize: 13,
                            fontWeight: 600,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          <FileText size={14} /> View PDF Resume <ExternalLink size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER */}
      <CareersFooter />

      {/* PDF VIEWER MODAL */}
      <PdfViewerModal
        isOpen={!!previewPdfUrl}
        onClose={() => setPreviewPdfUrl(null)}
        pdfUrl={previewPdfUrl || ''}
        candidateName={previewCandidateName}
      />
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: '14px 20px',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--gray-text-muted)'
};

const tdStyle: React.CSSProperties = {
  padding: '16px 20px',
  fontSize: 14,
  verticalAlign: 'middle'
};
