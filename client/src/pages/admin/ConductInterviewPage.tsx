import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, Calendar, Star, 
  CheckCircle2, XCircle, AlertCircle, Sparkles, Send, Award, Clock
} from 'lucide-react';

import { PdfViewerModal } from '../../components/ui/PdfViewerModal';
import { SchedulingCard } from '../recruiter/workspace/SchedulingCard';

export const ConductInterviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || '';

  // Interview & Application Data
  const [interview, setInterview] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  // Scorecard Evaluation Form State
  const [recommendation, setRecommendation] = useState<'pass' | 'hire' | 'reject'>('pass');
  const [comments, setComments] = useState('');
  const [techRating, setTechRating] = useState(4);
  const [commRating, setCommRating] = useState(4);
  const [cultureRating, setCultureRating] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showHrScheduler, setShowHrScheduler] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    if (user?.role === 'recruiter') {
      setError('Recruiters manage candidate pipelines and scheduling. Conducting evaluation sessions is restricted to assigned Interviewers and Administrators.');
      setLoading(false);
      return;
    }

    const fetchInterview = async () => {
      try {
        setLoading(true);
        setError(null);

        // Retrieve assigned interviews list to match current interview id
        const res = await fetch(`${apiUrl}/api/interviews/mine`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!res.ok) {
          throw new Error('Failed to load interview details');
        }

        const list = await res.json();
        const found = list.find((item: any) => item._id === id || item.application?._id === id);

        if (found) {
          setInterview(found);
          // Default recommendation based on type
          if (found.type === 'technical') {
            setRecommendation('pass');
          } else {
            setRecommendation('hire');
          }
        } else {
          // If not found in mine, try fetching candidate application profile directly
          const appRes = await fetch(`${apiUrl}/api/applications/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (appRes.ok) {
            const appData = await appRes.json();
            const schedInt = appData.interviews?.find((i: any) => i.status === 'scheduled');
            if (schedInt) {
              setInterview({
                _id: schedInt._id,
                type: schedInt.type || 'technical',
                scheduledAt: schedInt.scheduledAt,
                application: appData.application
              });
              setRecommendation(schedInt.type === 'hr' ? 'hire' : 'pass');
            } else {
              throw new Error('No scheduled interview found for this candidate profile.');
            }
          } else {
            throw new Error('Interview not found or you are not authorized.');
          }
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id, token, apiUrl, navigate]);

  const handleSubmitScorecard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interview || !token) return;

    if (!comments.trim()) {
      setError('Please provide detailed interviewer feedback notes.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const targetInterviewId = interview._id;
      const response = await fetch(`${apiUrl}/api/interviews/${targetInterviewId}/scorecard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          recommendation,
          comments,
          ratings: { technical: techRating },
          communication: commRating,
          cultureFit: cultureRating
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to submit interview scorecard.');
      }

      setSuccess(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Sparkles className="animate-spin" size={32} style={{ color: 'var(--accent)', marginBottom: 12 }} />
          <h3 style={{ color: 'var(--gray-text-primary)', fontSize: 16 }}>Loading Conduct Workspace...</h3>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div style={{ padding: 40, maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: 24, borderRadius: 16 }}>
          <AlertCircle size={36} style={{ color: 'var(--error)', marginBottom: 12 }} />
          <h3 style={{ fontSize: 18, color: 'var(--gray-text-primary)', marginBottom: 8 }}>Interview Conduct Workspace Error</h3>
          <p style={{ fontSize: 14, color: 'var(--gray-text-muted)', marginBottom: 20 }}>{error || 'Unable to access interview session.'}</p>
          <button 
            type="button" 
            onClick={() => navigate('/recruiter/candidates')}
            className="btn-primary-md"
          >
            Return to Candidate Pipeline
          </button>
        </div>
      </div>
    );
  }

  const app = interview.application;
  const candidate = app?.candidate || app;
  const job = app?.job;
  const isTech = interview.type === 'technical';

  if (success) {
    return (
      <>
        {/* Dimmed overlay backdrop */}
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ maxWidth: 520, width: '100%', backgroundColor: '#ffffff', border: '1px solid var(--gray-border)', borderRadius: 16, padding: 32, boxShadow: '0 24px 64px rgba(15, 23, 42, 0.2)', position: 'relative' }}>

            {/* Show inline HR scheduling form */}
            {showHrScheduler ? (
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-text-primary)', marginBottom: 16 }}>
                  📅 Schedule HR Interview for {candidate?.name}
                </h3>
                <SchedulingCard
                  applicationId={app?._id || id || ''}
                  interviewType="hr"
                  onCancel={() => setShowHrScheduler(false)}
                  onSuccess={() => {
                    navigate('/recruiter/candidates');
                  }}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <CheckCircle2 size={48} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
                <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-text-primary)', marginBottom: 8 }}>
                  Scorecard Submitted!
                </h2>
                <p style={{ fontSize: 14, color: 'var(--gray-text-muted)', marginBottom: 24 }}>
                  Evaluation for <strong>{candidate?.name}</strong> has been saved.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {isTech && (recommendation === 'pass' || recommendation === 'hire') && (
                    <button
                      type="button"
                      className="btn-primary-md"
                      onClick={() => setShowHrScheduler(true)}
                      style={{ width: '100%', padding: '12px 20px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 700 }}
                    >
                      📅 Schedule HR Interview Now
                    </button>
                  )}

                  {!isTech && (recommendation === 'pass' || recommendation === 'hire') && (
                    <button
                      type="button"
                      className="btn-primary-md"
                      onClick={async () => {
                        try {
                          await fetch(`${apiUrl}/api/applications/${app?._id || id}/advance`, {
                            method: 'POST',
                            headers: { Authorization: `Bearer ${token}` }
                          });
                        } catch (_e) { /* proceed anyway */ }
                        navigate(`/recruiter/candidates?candidate=${app?._id || id}`);
                      }}
                      style={{ width: '100%', padding: '12px 20px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 14, fontWeight: 700, backgroundColor: 'var(--success)' }}
                    >
                      ✉️ Issue Offer Letter
                    </button>
                  )}

                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => navigate('/recruiter/candidates')}
                    style={{ width: '100%', padding: '12px 20px', borderRadius: 10, fontSize: 14 }}
                  >
                    Return to Candidates Pipeline
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--gray-bg)', minHeight: '100vh', paddingBottom: 60 }}>
      {/* ── TOP HEADER ──────────────────────────────────────────────────────── */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--gray-border)', padding: '16px 24px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              type="button"
              onClick={() => navigate('/recruiter/candidates')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--gray-text-muted)', fontSize: 14, fontWeight: 600 }}
            >
              <ArrowLeft size={18} />
              <span>Back to Pipeline</span>
            </button>
            <div style={{ height: 20, width: 1, backgroundColor: 'var(--gray-border)' }} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {isTech ? 'Technical Interview Round' : 'HR Culture Round'}
              </div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-text-primary)', margin: 0 }}>
                Conduct Evaluation — {candidate?.name || 'Candidate Profile'}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 'var(--radius-pill)', backgroundColor: 'rgba(79, 70, 229, 0.1)', color: 'var(--accent)', border: '1px solid rgba(79, 70, 229, 0.2)' }}>
              {interview.status?.toUpperCase() || 'SCHEDULED'}
            </span>
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE CONTENT ─────────────────────────────────────────── */}
      <main style={{ maxWidth: 1200, margin: '32px auto 0', padding: '0 24px' }}>
        
        {success && (
          <div style={{ backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', padding: 20, borderRadius: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle2 size={24} />
            <div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Scorecard Submitted Successfully!</h4>
              <p style={{ margin: 0, fontSize: 13 }}>Application stage updated and timeline activity logged. Redirecting to Candidate Pipeline...</p>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>
          
          {/* ── LEFT COLUMN: CANDIDATE SUMMARY & INTEL ───────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* Candidate Identity Card */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800 }}>
                  {candidate?.name ? candidate.name.charAt(0).toUpperCase() : 'C'}
                </div>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-text-primary)', margin: 0 }}>
                    {candidate?.name || 'Candidate Name'}
                  </h3>
                  <div style={{ fontSize: 13, color: 'var(--gray-text-muted)' }}>
                    {candidate?.email}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 16, borderTop: '1px solid var(--gray-border)', fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-text-muted)' }}>Applied Position:</span>
                  <strong style={{ color: 'var(--gray-text-primary)' }}>{job?.title || 'Engineer'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-text-muted)' }}>Location:</span>
                  <strong style={{ color: 'var(--gray-text-primary)' }}>{job?.location || 'Remote'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-text-muted)' }}>Experience:</span>
                  <strong style={{ color: 'var(--gray-text-primary)' }}>{app?.experience || 0} years</strong>
                </div>
                {app?.currentCompany && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-text-muted)' }}>Current Company:</span>
                    <strong style={{ color: 'var(--gray-text-primary)' }}>{app.currentCompany}</strong>
                  </div>
                )}
              </div>

              {/* PDF Resume Link Button */}
              {app?.resumeUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewPdfUrl(app.resumeUrl)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    marginTop: 16,
                    padding: '10px 16px',
                    borderRadius: 10,
                    backgroundColor: 'var(--gray-bg)',
                    border: '1px solid var(--gray-border)',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <FileText size={16} /> View Candidate PDF Resume
                </button>
              )}
            </div>

            {/* Interview Schedule Details */}
            <div style={cardStyle}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-text-primary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} style={{ color: 'var(--accent)' }} /> Interview Schedule Details
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray-text-primary)' }}>
                  <Calendar size={14} style={{ color: 'var(--gray-text-muted)' }} />
                  <span>{new Date(interview.scheduledAt).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--gray-text-primary)' }}>
                  <Award size={14} style={{ color: 'var(--gray-text-muted)' }} />
                  <span>Round: <strong>{isTech ? 'Technical Competency' : 'HR & Culture Alignment'}</strong></span>
                </div>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: INTERACTIVE EVALUATION & SCORECARD FORM ────── */}
          <div style={cardStyle}>
            <div style={{ marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--gray-border)' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--gray-text-primary)', marginBottom: 4 }}>
                Candidate Evaluation Scorecard
              </h2>
              <p style={{ fontSize: 14, color: 'var(--gray-text-muted)', margin: 0 }}>
                Rate performance across evaluation criteria, provide structured notes, and select your recommendation.
              </p>
            </div>

            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--error)', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmitScorecard} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* 1. Recommendation Selector */}
              <div>
                <label style={labelStyle}>Overall Stage Recommendation *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  
                  {isTech ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setRecommendation('pass')}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 12,
                          border: `2px solid ${recommendation === 'pass' ? 'var(--accent)' : 'var(--gray-border)'}`,
                          backgroundColor: recommendation === 'pass' ? 'rgba(79, 70, 229, 0.06)' : 'var(--gray-bg)',
                          color: recommendation === 'pass' ? 'var(--accent)' : 'var(--gray-text-primary)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          fontSize: 14
                        }}
                      >
                        <CheckCircle2 size={18} /> Pass (Advance Stage)
                      </button>

                      <button
                        type="button"
                        onClick={() => setRecommendation('reject')}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 12,
                          border: `2px solid ${recommendation === 'reject' ? 'var(--error)' : 'var(--gray-border)'}`,
                          backgroundColor: recommendation === 'reject' ? 'rgba(239, 68, 68, 0.06)' : 'var(--gray-bg)',
                          color: recommendation === 'reject' ? 'var(--error)' : 'var(--gray-text-primary)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          fontSize: 14
                        }}
                      >
                        <XCircle size={18} /> Reject Application
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setRecommendation('hire')}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 12,
                          border: `2px solid ${recommendation === 'hire' ? 'var(--accent)' : 'var(--gray-border)'}`,
                          backgroundColor: recommendation === 'hire' ? 'rgba(79, 70, 229, 0.06)' : 'var(--gray-bg)',
                          color: recommendation === 'hire' ? 'var(--accent)' : 'var(--gray-text-primary)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          fontSize: 14
                        }}
                      >
                        <CheckCircle2 size={18} /> Hire (Offer Candidate)
                      </button>

                      <button
                        type="button"
                        onClick={() => setRecommendation('reject')}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 12,
                          border: `2px solid ${recommendation === 'reject' ? 'var(--error)' : 'var(--gray-border)'}`,
                          backgroundColor: recommendation === 'reject' ? 'rgba(239, 68, 68, 0.06)' : 'var(--gray-bg)',
                          color: recommendation === 'reject' ? 'var(--error)' : 'var(--gray-text-primary)',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 8,
                          fontSize: 14
                        }}
                      >
                        <XCircle size={18} /> Reject Application
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* 2. Interactive Ratings Criteria (1 to 5 Stars) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 16, backgroundColor: 'var(--gray-bg)', borderRadius: 12, border: '1px solid var(--gray-border)' }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-text-primary)', margin: 0 }}>
                  Rating Criteria (1 = Weak, 5 = Exceptional)
                </h4>

                {/* Technical / Problem Solving Rating */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-text-primary)' }}>
                    Technical & Problem Solving
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setTechRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                      >
                        <Star 
                          size={20} 
                          fill={star <= techRating ? '#f59e0b' : 'none'} 
                          color={star <= techRating ? '#f59e0b' : '#cbd5e1'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Communication Rating */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-text-primary)' }}>
                    Communication & Articulation
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCommRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                      >
                        <Star 
                          size={20} 
                          fill={star <= commRating ? '#f59e0b' : 'none'} 
                          color={star <= commRating ? '#f59e0b' : '#cbd5e1'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Culture Fit Rating */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-text-primary)' }}>
                    Culture Alignment & Collaboration
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCultureRating(star)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                      >
                        <Star 
                          size={20} 
                          fill={star <= cultureRating ? '#f59e0b' : 'none'} 
                          color={star <= cultureRating ? '#f59e0b' : '#cbd5e1'} 
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Detailed Interviewer Feedback & Notes */}
              <div>
                <label style={labelStyle}>Structured Interviewer Notes & Feedback *</label>
                <textarea
                  rows={5}
                  placeholder="Provide detailed feedback on candidate strengths, problem-solving approach, technical answers, and key observations during the interview..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 10,
                    border: '1px solid var(--gray-border)',
                    backgroundColor: 'var(--gray-bg)',
                    fontSize: 14,
                    color: 'var(--gray-text-primary)',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              {/* 4. Submit Scorecard Action */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 16, borderTop: '1px solid var(--gray-border)' }}>
                <button
                  type="button"
                  onClick={() => navigate('/recruiter/candidates')}
                  className="btn-ghost"
                  style={{ padding: '10px 20px', borderRadius: 10 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary-md"
                  style={{ padding: '10px 24px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <Send size={16} />
                  <span>{submitting ? 'Submitting Scorecard...' : 'Submit Evaluation Scorecard'}</span>
                </button>
              </div>

            </form>
          </div>

        </div>
      </main>

      {/* PDF VIEWER MODAL */}
      <PdfViewerModal
        isOpen={!!previewPdfUrl}
        onClose={() => setPreviewPdfUrl(null)}
        pdfUrl={previewPdfUrl || ''}
        candidateName={candidate?.name || 'Candidate'}
      />
    </div>
  );
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  border: '1px solid var(--gray-border)',
  padding: 24,
  boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--gray-text-primary)',
  marginBottom: 8
};
