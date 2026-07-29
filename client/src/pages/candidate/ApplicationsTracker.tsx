import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CareersNav } from '../careers/components/CareersNav';
import { CareersFooter } from '../careers/components/CareersFooter';
import { 
  FileText, 
  MapPin, 
  Calendar, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Briefcase 
} from 'lucide-react';

import { PdfViewerModal } from '../../components/ui/PdfViewerModal';

export interface CandidateApplication {
  _id: string;
  stage: string;
  createdAt: string;
  updatedAt?: string;
  rejectionReason?: string;
  job?: {
    _id: string;
    title: string;
    department: string;
    location: string;
    type: string;
  };
  resumeUrl?: string;
}

export const ApplicationsTracker: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
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

  const getStageBadgeStyle = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'offer':
        return { backgroundColor: '#e0e7ff', color: '#3730a3', border: '1px solid #a5b4fc' };
      case 'hired':
        return { backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7' };
      case 'rejected':
        return { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
      default:
        return { backgroundColor: '#f1f5f9', color: '#1e293b', border: '1px solid #94a3b8' };
    }
  };

  // Metrics computation
  const activeCount = applications.filter(a => a.stage !== 'rejected' && a.stage !== 'hired').length;
  const offerCount = applications.filter(a => a.stage === 'offer' || a.stage === 'hired').length;

  return (
    <div style={{ backgroundColor: '#f8fafc', color: '#0f172a', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* STICKY CAREERS & CANDIDATE NAVBAR WITH MOBILE DRAWER */}
      <CareersNav />

      {/* MAIN CONTAINER */}
      <main className="careers-container" style={{ flex: 1, padding: '40px 24px 80px' }}>
        
        {/* Header Title */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.25)', fontSize: 12.5, fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            <Sparkles size={14} /> Candidate Portal
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
            Application <span style={{ color: '#4f46e5' }}>Tracker</span>
          </h1>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#475569', margin: 0 }}>
            Monitor your active pipelines, interview schedules, and evaluation status in real-time.
          </p>
        </div>

        {/* Pipeline Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 36 }}>
          <div className="careers-card" style={{ padding: 24, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)' }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#334155', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={16} style={{ color: '#4f46e5' }} /> Total Submissions
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>
              {applications.length}
            </div>
          </div>

          <div className="careers-card" style={{ padding: 24, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)' }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#334155', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} style={{ color: '#b45309' }} /> In Active Review
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#b45309' }}>
              {activeCount}
            </div>
          </div>

          <div className="careers-card" style={{ padding: 24, backgroundColor: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)' }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#334155', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CheckCircle2 size={16} style={{ color: '#047857' }} /> Offers & Hires
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#047857' }}>
              {offerCount}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="careers-card" style={{ padding: 48, textAlign: 'center', maxWidth: 480, margin: '0 auto', backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>
              Syncing application records...
            </div>
            <div style={{ width: 36, height: 36, border: '3px solid #cbd5e1', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          </div>
        ) : error ? (
          <div className="careers-card" style={{ padding: 48, textAlign: 'center', maxWidth: 480, margin: '0 auto', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: '#ffffff' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#dc2626', marginBottom: 12 }}>Sync Failed</h3>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 20 }}>{error}</p>
            <button type="button" className="btn-primary-lg" onClick={() => window.location.reload()} style={{ backgroundColor: '#dc2626', margin: '0 auto', fontSize: 14, padding: '10px 20px' }}>
              Retry Sync
            </button>
          </div>
        ) : applications.length === 0 ? (
          /* Empty Submissions Card */
          <div className="careers-card" style={{ padding: '60px 24px', textAlign: 'center', maxWidth: 520, margin: '0 auto', backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(79, 70, 229, 0.1)', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Briefcase size={26} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
              No Applications Submitted Yet
            </h3>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, marginBottom: 24 }}>
              You haven't submitted any applications to HireTrack yet. Explore open roles on our careers portal to start your candidate journey!
            </p>
            <Link to="/" className="btn-primary-lg" style={{ textDecoration: 'none', display: 'inline-flex', margin: '0 auto' }}>
              Explore Openings →
            </Link>
          </div>
        ) : (
          /* Applications Table Card */
          <div className="careers-card" style={{ padding: 0, overflow: 'hidden', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', boxShadow: '0 4px 20px rgba(15, 23, 42, 0.06)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Submitted Applications ({applications.length})
              </h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-sans)' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <th style={thStyle}>Position Title</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>Applied Date</th>
                    <th style={thStyle}>Pipeline Stage</th>
                    <th style={thStyle}>Resume Portfolio</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', transition: 'background-color 0.15s' }}>
                      <td style={{ ...tdStyle, fontWeight: 800, color: '#0f172a' }}>
                        <Link to={`/jobs/${app.job?._id}`} style={{ color: '#0f172a', textDecoration: 'none' }}>
                          {app.job?.title || 'Unknown Role'}
                        </Link>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#334155', fontWeight: 600, fontSize: 13.5 }}>
                          <MapPin size={14} style={{ color: '#4f46e5' }} />
                          {app.job?.location || 'Remote'}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#334155', fontWeight: 600, fontSize: 13.5 }}>
                          <Calendar size={14} />
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
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            padding: '5px 14px',
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
                            setPreviewPdfUrl(app.resumeUrl || null);
                            setPreviewCandidateName(user?.name || 'My Resume');
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            color: '#4f46e5',
                            fontSize: 13.5,
                            fontWeight: 700,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0
                          }}
                        >
                          <FileText size={15} /> View PDF Resume <ExternalLink size={13} />
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
  fontSize: 12.5,
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#334155'
};

const tdStyle: React.CSSProperties = {
  padding: '18px 20px',
  fontSize: 14,
  verticalAlign: 'middle'
};
