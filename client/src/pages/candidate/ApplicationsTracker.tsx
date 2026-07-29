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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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
      case 'interview':
      case 'screening':
      case 'technical':
      case 'hr_interview':
        return { backgroundColor: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74' };
      case 'offer':
        return { backgroundColor: '#faf5ff', color: '#7e22ce', border: '1px solid #d8b4fe' };
      case 'hired':
        return { backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' };
      case 'rejected':
        return { backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fca5a5' };
      default:
        // Applied / In Review
        return { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd' };
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
      <main className="careers-container" style={{ flex: 1, padding: '40px 24px 80px', animation: 'fadeIn 300ms ease-out' }}>
        
        {/* Header Title */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 9999, backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', fontSize: 12, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
            <Sparkles size={13} /> Candidate Portal
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', margin: '0 0 8px 0' }}>
            Application <span style={{ color: '#4f46e5' }}>Tracker</span>
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0, fontWeight: 500 }}>
            Monitor your active pipelines, interview schedules, and evaluation status in real-time.
          </p>
        </div>

        {/* Pipeline Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 36 }}>
          
          {/* Card 1: Total Submissions */}
          <div 
            onMouseEnter={() => setHoveredCard('total')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: 18, 
              padding: 24, 
              boxShadow: hoveredCard === 'total' ? '0 12px 30px rgba(0, 0, 0, 0.08)' : '0 4px 20px rgba(0, 0, 0, 0.04)',
              transform: hoveredCard === 'total' ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
              transition: 'all 200ms ease'
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Total Submissions</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={18} />
              </div>
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {applications.length}
            </div>
          </div>

          {/* Card 2: In Active Review */}
          <div 
            onMouseEnter={() => setHoveredCard('active')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: 18, 
              padding: 24, 
              boxShadow: hoveredCard === 'active' ? '0 12px 30px rgba(0, 0, 0, 0.08)' : '0 4px 20px rgba(0, 0, 0, 0.04)',
              transform: hoveredCard === 'active' ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
              transition: 'all 200ms ease'
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>In Active Review</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#fffbe6', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={18} />
              </div>
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {activeCount}
            </div>
          </div>

          {/* Card 3: Offers & Hires */}
          <div 
            onMouseEnter={() => setHoveredCard('offers')}
            onMouseLeave={() => setHoveredCard(null)}
            style={{ 
              backgroundColor: '#ffffff', 
              border: '1px solid #e2e8f0', 
              borderRadius: 18, 
              padding: 24, 
              boxShadow: hoveredCard === 'offers' ? '0 12px 30px rgba(0, 0, 0, 0.08)' : '0 4px 20px rgba(0, 0, 0, 0.04)',
              transform: hoveredCard === 'offers' ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
              transition: 'all 200ms ease'
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Offers & Hires</span>
              <div style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {offerCount}
            </div>
          </div>

        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, padding: 48, textAlign: 'center', maxWidth: 480, margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#64748b', marginBottom: 16 }}>
              Syncing application records...
            </div>
            <div style={{ width: 36, height: 36, border: '3px solid #e2e8f0', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          </div>
        ) : error ? (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #fca5a5', borderRadius: 20, padding: 48, textAlign: 'center', maxWidth: 480, margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#dc2626', marginBottom: 12 }}>Sync Failed</h3>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 20 }}>{error}</p>
            <button type="button" className="btn-primary-lg" onClick={() => window.location.reload()} style={{ backgroundColor: '#dc2626', margin: '0 auto', fontSize: 14, padding: '10px 20px', borderRadius: 9999 }}>
              Retry Sync
            </button>
          </div>
        ) : applications.length === 0 ? (
          /* Empty Submissions Card */
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, padding: '60px 24px', textAlign: 'center', maxWidth: 520, margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: '#eef2ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Briefcase size={28} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>
              No Applications Submitted Yet
            </h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
              You haven't submitted any applications to HireTrack yet. Explore open roles on our careers portal to start your candidate journey!
            </p>
            <Link to="/" className="btn-primary-lg" style={{ textDecoration: 'none', display: 'inline-flex', margin: '0 auto', borderRadius: 9999, padding: '12px 24px', backgroundColor: '#4f46e5', color: '#ffffff' }}>
              Explore Openings →
            </Link>
          </div>
        ) : (
          /* Applications Table Card */
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 20, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff' }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Submitted Applications ({applications.length})
              </h2>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={thStyle}>Position Title</th>
                    <th style={thStyle}>Location</th>
                    <th style={thStyle}>Applied Date</th>
                    <th style={thStyle}>Pipeline Stage</th>
                    <th style={thStyle}>Resume Portfolio</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr 
                      key={app._id} 
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    >
                      <td style={{ ...tdStyle, fontWeight: 700, color: '#0f172a' }}>
                        <Link to={`/jobs/${app.job?._id}`} style={{ color: '#0f172a', textDecoration: 'none', transition: 'color 0.15s' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#4f46e5')} onMouseLeave={(e) => (e.currentTarget.style.color = '#0f172a')}>
                          {app.job?.title || 'Unknown Role'}
                        </Link>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#475569', fontSize: 13, fontWeight: 500 }}>
                          <MapPin size={14} style={{ color: '#4f46e5' }} />
                          {app.job?.location || 'Remote'}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#475569', fontSize: 13, fontWeight: 500 }}>
                          <Calendar size={14} style={{ color: '#64748b' }} />
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
                            borderRadius: 9999,
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
                            fontSize: 13,
                            fontWeight: 600,
                            backgroundColor: '#eef2ff',
                            border: '1px solid #c7d2fe',
                            borderRadius: 8,
                            padding: '6px 12px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#e0e7ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#eef2ff';
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
  padding: '16px 20px',
  fontSize: 12,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: '#475569',
  position: 'sticky',
  top: 0
};

const tdStyle: React.CSSProperties = {
  padding: '18px 20px',
  fontSize: 14,
  verticalAlign: 'middle'
};
