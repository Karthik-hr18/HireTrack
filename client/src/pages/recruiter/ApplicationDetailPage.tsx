import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;

  // Application Data States
  const [application, setApplication] = useState<any | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [scorecards, setScorecards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Notes States
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Stage Advancement States
  const [submittingAction, setSubmittingAction] = useState(false);

  // Rejection Modal States
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('skills_mismatch');
  const [rejectionNote, setRejectionNote] = useState('');

  // Scheduler States
  const [admins, setAdmins] = useState<any[]>([]);
  const [interviewerId, setInterviewerId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [submittingInterview, setSubmittingInterview] = useState(false);

  // Scorecard Submit States
  const [recommendation, setRecommendation] = useState('pass');
  const [comments, setComments] = useState('');
  const [communication, setCommunication] = useState(5);
  const [cultureFit, setCultureFit] = useState(5);
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [salaryOffered, setSalaryOffered] = useState('');
  const [submittingScorecard, setSubmittingScorecard] = useState(false);

  const fetchApplicationDetails = async () => {
    if (!token || !id) return;
    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/applications/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Application profile not found');
        }
        throw new Error('Failed to retrieve application details');
      }

      const data = await response.json();
      setApplication(data.application);
      setTimeline(data.timeline);
      setInterviews(data.interviews || []);
      setScorecards(data.scorecards || []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchApplicationDetails();
  }, [id, token, navigate]);

  // Determine active phase states
  const isRecruiter = user?.role === 'recruiter';
  const isAdmin = user?.role === 'admin';
  const isTerminalStage = application?.stage === 'hired' || application?.stage === 'rejected';

  // Recruiter restricted stages for progression edits
  const recruiterRestrictedStages = [
    'technical_interview_scheduled',
    'technical_interview_completed',
    'hr_interview_scheduled',
    'hr_interview_completed',
    'offer',
    'hired',
    'rejected'
  ];

  // Enable scheduling for recruiters (Technical Interview only) or admins (Technical or HR)
  const canSchedulePanel = application && (
    (application.stage === 'resume_screening') || 
    (application.stage === 'technical_interview_completed' && isAdmin)
  );

  // Active scheduled interview mapping
  const activeInterview = interviews.find(i => i.status === 'scheduled');
  
  // Set default scorecard recommendation when active interview changes
  useEffect(() => {
    if (activeInterview) {
      if (activeInterview.type === 'technical') {
        setRecommendation('pass');
      } else {
        setRecommendation('hire');
      }
    }
  }, [activeInterview]);

  const canSubmitScorecard = isAdmin && activeInterview;

  // Fetch interviewer Admins list when scheduling is active
  useEffect(() => {
    const fetchAdminsList = async () => {
      if (!token || !canSchedulePanel) return;
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/users/admins`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAdmins(data);
          if (data.length > 0) {
            setInterviewerId(data[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch admin list:', err);
      }
    };

    fetchAdminsList();
  }, [canSchedulePanel, token]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !noteText.trim() || !id) return;

    try {
      setSubmittingNote(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/applications/${id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: noteText.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to add remark');
      }

      setNoteText('');
      await fetchApplicationDetails();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleAdvance = async () => {
    if (!token || !id || !application) return;

    try {
      setSubmittingAction(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/applications/${id}/advance`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to advance stage');
      }

      await fetchApplicationDetails();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id || !interviewerId || !scheduledAt || !application) return;

    const interviewType = application.stage === 'resume_screening' ? 'technical' : 'hr';

    try {
      setSubmittingInterview(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/interviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          applicationId: id,
          interviewerId,
          scheduledAt: new Date(scheduledAt).toISOString(),
          type: interviewType
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to schedule interview');
      }

      setScheduledAt('');
      await fetchApplicationDetails();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmittingInterview(false);
    }
  };

  const handleSubmitScorecard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeInterview || !recommendation || !comments.trim()) return;

    const bodyData: any = {
      recommendation,
      comments: comments.trim()
    };

    if (activeInterview.type === 'hr') {
      bodyData.communication = Number(communication);
      bodyData.cultureFit = Number(cultureFit);
      if (salaryExpectation) bodyData.salaryExpectation = Number(salaryExpectation);
      if (salaryOffered) bodyData.salaryOffered = Number(salaryOffered);
    }

    try {
      setSubmittingScorecard(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/interviews/${activeInterview._id}/scorecard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to submit scorecard');
      }

      setComments('');
      setSalaryExpectation('');
      setSalaryOffered('');
      await fetchApplicationDetails();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmittingScorecard(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !id) return;

    try {
      setSubmittingAction(true);
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/applications/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rejectionReason, rejectionNote })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to reject application');
      }

      setIsRejectModalOpen(false);
      setRejectionNote('');
      await fetchApplicationDetails();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStageLabel = (s: string) => {
    return s.replace(/_/g, ' ').toUpperCase();
  };

  const getNextStageLabel = (current: string) => {
    switch (current) {
      case 'applied':
        return 'Screen Resume';
      case 'hr_interview_completed':
        return 'Proceed to Offer';
      case 'offer':
        return 'Confirm Candidate Acceptance (Hired)';
      default:
        return '';
    }
  };

  const getStageBadgeClass = (s: string) => {
    switch (s) {
      case 'applied':
        return 'badge-applied';
      case 'resume_screening':
        return 'badge-screening';
      case 'technical_interview_scheduled':
      case 'technical_interview_completed':
        return 'badge-interview';
      case 'hr_interview_scheduled':
      case 'hr_interview_completed':
        return 'badge-review';
      case 'offer':
        return 'badge-offer';
      case 'hired':
        return 'badge-hired';
      case 'rejected':
        return 'badge-rejected';
      default:
        return 'badge-default';
    }
  };

  if (loading && !application) {
    return (
      <div style={containerStyle}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ color: 'var(--gray-text-muted)' }}>Syncing candidate records...</h2>
          <div style={spinnerStyle}></div>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div style={containerStyle}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <h2 style={{ color: 'var(--error)' }}>Candidate Not Found</h2>
          <p style={{ color: 'var(--gray-text-muted)', margin: '1rem 0 2rem' }}>{error || 'Failed to locate candidate file.'}</p>
          <Link to="/recruiter/applications" className="api-btn" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Back to Candidates
          </Link>
        </div>
      </div>
    );
  }

  // Determine if manual progression via /advance button is allowed at the current stage
  const canAdvanceManually = !isTerminalStage && 
    (application.stage === 'applied' || (application.stage === 'hr_interview_completed' && isAdmin) || (application.stage === 'offer' && isAdmin));

  const canRejectManually = !isTerminalStage && !(isRecruiter && recruiterRestrictedStages.includes(application.stage));

  return (
    <div style={containerStyle}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/recruiter/applications" style={backLinkStyle}>
          &larr; Back to Pipeline
        </Link>
      </div>

      <header style={detailHeaderStyle}>
        <div>
          <span className={`badge ${getStageBadgeClass(application.stage)}`} style={{ marginBottom: '0.5rem' }}>
            {getStageLabel(application.stage)}
          </span>
          <h1 style={candidateTitleStyle}>{application.candidate?.name}</h1>
          <p style={subTitleStyle}>
            Applying for <strong>{application.job?.title}</strong> ({application.job?.location})
          </p>
        </div>
      </header>

      <div style={mainLayoutGrid}>
        {/* Left Column - Portfolio & Resume */}
        <div style={leftColStyle}>
          
          {/* Metadata details */}
          <section className="card" style={sectionCardStyle}>
            <h3 style={sectionTitleStyle}>Candidate Profile</h3>
            <div style={metaGridStyle}>
              <div>
                <label style={metaLabelStyle}>Email</label>
                <div style={metaValueStyle}>{application.candidate?.email}</div>
              </div>
              <div>
                <label style={metaLabelStyle}>Phone</label>
                <div style={metaValueStyle}>{application.phone || 'N/A'}</div>
              </div>
              <div>
                <label style={metaLabelStyle}>Location</label>
                <div style={metaValueStyle}>
                  {application.address}, {application.country}
                </div>
              </div>
              <div>
                <label style={metaLabelStyle}>Experience</label>
                <div style={metaValueStyle}>
                  {application.experience === 0 ? 'Fresher (No Experience)' : `${application.experience} Years`}
                </div>
              </div>
              {application.currentCompany && (
                <div>
                  <label style={metaLabelStyle}>Current Position</label>
                  <div style={metaValueStyle}>
                    {application.currentTitle} at {application.currentCompany}
                  </div>
                </div>
              )}
              <div>
                <label style={metaLabelStyle}>Applied Via</label>
                <div style={{ ...metaValueStyle, textTransform: 'capitalize' }}>
                  {application.source.replace(/_/g, ' ')}
                </div>
              </div>
            </div>

            {/* Links Block */}
            <div style={linksContainerStyle}>
              {application.linkedinUrl && (
                <a href={application.linkedinUrl} target="_blank" rel="noopener noreferrer" style={profileLinkBtn}>
                  🔗 LinkedIn
                </a>
              )}
              {application.githubUrl && (
                <a href={application.githubUrl} target="_blank" rel="noopener noreferrer" style={profileLinkBtn}>
                  💻 GitHub
                </a>
              )}
              {application.portfolioUrl && (
                <a href={application.portfolioUrl} target="_blank" rel="noopener noreferrer" style={profileLinkBtn}>
                  🌐 Website / Portfolio
                </a>
              )}
            </div>

            {application.coverLetter && (
              <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--gray-border)', paddingTop: '1.25rem' }}>
                <label style={metaLabelStyle}>Cover Letter</label>
                <p style={coverLetterTextStyle}>{application.coverLetter}</p>
              </div>
            )}
          </section>

          {/* Inline Resume PDF Preview */}
          <section className="card" style={sectionCardStyle}>
            <h3 style={sectionTitleStyle}>📄 Resume Portfolio</h3>
            {application.resumeUrl ? (
              <div style={iframeWrapperStyle}>
                <iframe 
                  src={application.resumeUrl} 
                  title="Resume Viewer" 
                  style={iframeStyle}
                />
              </div>
            ) : (
              <p style={{ color: 'var(--gray-text-muted)', margin: 0 }}>No resume uploaded for this candidate.</p>
            )}
          </section>

          {/* Conducted Scorecards list (If any) */}
          {scorecards.length > 0 && (
            <section className="card" style={sectionCardStyle}>
              <h3 style={sectionTitleStyle}>📋 Submitted Scorecard Evaluations</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {scorecards.map((card) => {
                  const correlatedInterview = interviews.find(i => i._id === card.interview || i._id === card.interview?._id);
                  const isHr = correlatedInterview?.type === 'hr';
                  return (
                    <div key={card._id} style={{ padding: '14px', backgroundColor: 'var(--gray-surface)', border: '1px solid var(--gray-border)', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-border)', paddingBottom: '6px', marginBottom: '8px' }}>
                        <span style={{ fontWeight: 700, color: 'var(--accent-hover)', textTransform: 'capitalize' }}>
                          {correlatedInterview?.type} Interview Scorecard
                        </span>
                        <span style={{ 
                          fontWeight: 800, 
                          color: ['hire', 'pass'].includes(card.recommendation) ? '#10b981' : '#ef4444'
                        }}>
                          {card.recommendation.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--gray-text-primary)' }}>
                        <div><strong style={{ color: 'var(--gray-text-muted)' }}>Evaluator:</strong> {card.submittedBy?.name}</div>
                        {isHr && (
                          <>
                            <div><strong style={{ color: 'var(--gray-text-muted)' }}>Culture Fit Score:</strong> {card.cultureFit} / 5</div>
                            <div><strong style={{ color: 'var(--gray-text-muted)' }}>Communication Score:</strong> {card.communication} / 5</div>
                            {card.salaryExpectation && <div><strong style={{ color: 'var(--gray-text-muted)' }}>Salary Expectation:</strong> ${card.salaryExpectation.toLocaleString()}</div>}
                            {card.salaryOffered && <div><strong style={{ color: 'var(--gray-text-muted)' }}>Salary Offered:</strong> ${card.salaryOffered.toLocaleString()}</div>}
                          </>
                        )}
                        <div style={{ marginTop: '6px' }}>
                          <strong style={{ color: 'var(--gray-text-muted)', display: 'block', marginBottom: '2px' }}>Evaluation Notes:</strong>
                          <p style={{ margin: 0, fontStyle: 'italic', lineHeight: 1.4, color: 'var(--gray-text-muted)' }}>"{card.comments}"</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Notes Remarks workspace */}
          <section className="card" style={sectionCardStyle}>
            <h3 style={sectionTitleStyle}>📝 Screening Remarks</h3>
            
            {/* Form */}
            <form onSubmit={handleAddNote} style={{ marginBottom: '1.5rem' }}>
              <textarea 
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write interview notes or screening remarks here..."
                required
                style={noteInputStyle}
              />
              <button 
                type="submit" 
                className="api-btn" 
                style={{ marginTop: '0.5rem' }}
                disabled={submittingNote || !noteText.trim()}
              >
                {submittingNote ? 'Adding note...' : 'Post Screening Note'}
              </button>
            </form>

            {/* Notes List */}
            {application.notes && application.notes.length > 0 ? (
              <div style={notesListStyle}>
                {application.notes.map((note: any, index: number) => (
                  <div key={index} style={noteCardStyle}>
                    <div style={noteHeaderStyle}>
                      <span style={noteAuthorStyle}>{note.author?.name} ({note.author?.role})</span>
                      <span style={noteDateStyle}>
                        {new Date(note.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p style={noteBodyStyle}>{note.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--gray-text-muted)', fontSize: '14px', margin: 0 }}>No remarks posted yet.</p>
            )}
          </section>
        </div>

        {/* Right Column - Pipeline controls & logs history */}
        <div style={rightColStyle}>
          
          {/* Progression Controls */}
          <section className="card" style={{ ...sectionCardStyle, border: '1px solid var(--gray-border)' }}>
            <h3 style={sectionTitleStyle}>🎯 Pipeline Progression</h3>
            
            {application.stage === 'rejected' && (
              <div style={rejectionSummaryCard}>
                <h4 style={{ color: 'var(--error)', margin: '0 0 0.5rem' }}>Application Rejected</h4>
                <div>
                  <span style={rejectionLabel}>Reason:</span>
                  <span style={{ textTransform: 'capitalize', color: 'var(--gray-text-primary)' }}>
                    {application.rejectionReason?.replace(/_/g, ' ')}
                  </span>
                </div>
                {application.rejectionNote && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={rejectionLabel}>Note:</span>
                    <p style={rejectionNoteText}>{application.rejectionNote}</p>
                  </div>
                )}
              </div>
            )}

            {application.stage === 'hired' && (
              <div style={hiredSummaryCard}>
                <h4 style={{ color: 'var(--success)', margin: 0 }}>🎉 Candidate Hired!</h4>
                <p style={{ color: 'var(--gray-text-muted)', fontSize: '13px', margin: '0.5rem 0 0 0' }}>
                  This application has successfully completed the ATS lifecycle.
                </p>
              </div>
            )}

            {/* Active scheduled panel card details */}
            {activeInterview && (
              <div style={scheduledSummaryCard}>
                <h4 style={{ color: 'var(--accent-hover)', margin: '0 0 0.5rem 0', textTransform: 'capitalize' }}>
                  📅 Scheduled {activeInterview.type} Panel
                </h4>
                <div>
                  <span style={rejectionLabel}>Interviewer:</span>
                  <span style={{ color: 'var(--gray-text-primary)' }}>{activeInterview.interviewer?.name}</span>
                </div>
                <div style={{ marginTop: '0.25rem' }}>
                  <span style={rejectionLabel}>Date/Time:</span>
                  <span style={{ color: 'var(--gray-text-primary)' }}>
                    {new Date(activeInterview.scheduledAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Pipeline instruction details card */}
            {!isTerminalStage && !canAdvanceManually && (
              <div style={{ color: 'var(--gray-text-muted)', fontSize: '13px', padding: '10px', backgroundColor: 'var(--gray-surface)', borderRadius: '6px', border: '1px solid var(--gray-border)', marginBottom: '1rem' }}>
                {application.stage === 'resume_screening' && "Waiting for Technical Interview to be scheduled."}
                {application.stage === 'technical_interview_scheduled' && `Waiting for ${activeInterview?.interviewer?.name || 'Admin'} to submit Technical Scorecard.`}
                {application.stage === 'technical_interview_completed' && "Technical evaluation passed! Waiting for Admin to schedule HR Interview."}
                {application.stage === 'hr_interview_scheduled' && `Waiting for ${activeInterview?.interviewer?.name || 'Admin'} to submit HR Scorecard.`}
                {isRecruiter && recruiterRestrictedStages.includes(application.stage) && "Admin authorization required for stage progression updates."}
              </div>
            )}

            {/* Stage advancement actions */}
            {!isTerminalStage && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                {canAdvanceManually && (
                  <button 
                    onClick={handleAdvance} 
                    className="api-btn"
                    style={{ width: '100%', padding: '12px' }}
                    disabled={submittingAction}
                  >
                    {submittingAction ? 'Advancing stage...' : getNextStageLabel(application.stage)} &rarr;
                  </button>
                )}
                {canRejectManually && (
                  <button 
                    onClick={() => setIsRejectModalOpen(true)}
                    style={rejectActionBtn}
                    disabled={submittingAction}
                  >
                    Reject Application
                  </button>
                )}
              </div>
            )}
          </section>

          {/* Admin Scorecard Form */}
          {canSubmitScorecard && (
            <section className="card" style={{ ...sectionCardStyle, border: '1px solid rgba(16, 185, 129, 0.2)', marginTop: '0.5rem' }}>
              <h3 style={sectionTitleStyle}>📝 {activeInterview.type === 'technical' ? 'Technical' : 'HR'} Scorecard</h3>
              <form onSubmit={handleSubmitScorecard} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Recommendation */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={labelStyle}>Recommendation *</label>
                  {activeInterview.type === 'technical' ? (
                    <select 
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      style={selectStyle}
                      required
                    >
                      <option value="pass">Pass (Advance to HR)</option>
                      <option value="reject">Reject Candidate</option>
                    </select>
                  ) : (
                    <select 
                      value={recommendation}
                      onChange={(e) => setRecommendation(e.target.value)}
                      style={selectStyle}
                      required
                    >
                      <option value="hire">Accept & Hire</option>
                      <option value="reject">Reject Candidate</option>
                    </select>
                  )}
                </div>

                {/* Additional HR scorecard rating parameters */}
                {activeInterview.type === 'hr' && (
                  <>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <label style={labelStyle}>Culture Fit (1-5) *</label>
                        <select 
                          value={cultureFit} 
                          onChange={(e) => setCultureFit(Number(e.target.value))} 
                          style={selectStyle}
                        >
                          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <label style={labelStyle}>Communication (1-5) *</label>
                        <select 
                          value={communication} 
                          onChange={(e) => setCommunication(Number(e.target.value))} 
                          style={selectStyle}
                        >
                          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <label style={labelStyle}>Salary Expectation ($) *</label>
                        <input 
                          type="number" 
                          value={salaryExpectation} 
                          onChange={(e) => setSalaryExpectation(e.target.value)} 
                          style={inputStyle}
                          placeholder="e.g. 95000"
                          required
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                        <label style={labelStyle}>Salary Offered ($) *</label>
                        <input 
                          type="number" 
                          value={salaryOffered} 
                          onChange={(e) => setSalaryOffered(e.target.value)} 
                          style={inputStyle}
                          placeholder="e.g. 100000"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Scorecard Notes Comments */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={labelStyle}>Rationale Comments *</label>
                  <textarea 
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Provide details about performance and decision rationale..."
                    style={noteInputStyle}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="api-btn" 
                  style={{ width: '100%', marginTop: '0.5rem', backgroundColor: '#10b981' }}
                  disabled={submittingScorecard || !comments.trim()}
                >
                  {submittingScorecard ? 'Submitting Evaluation...' : 'Submit Evaluation Scorecard'}
                </button>
              </form>
            </section>
          )}

          {/* Schedule Interview Form Panel (Technical for Recruiters/Admins, HR for Admins only) */}
          {canSchedulePanel && (
            <section className="card" style={{ ...sectionCardStyle, border: '1px solid rgba(99, 102, 241, 0.2)' }}>
              <h3 style={sectionTitleStyle}>
                📅 Schedule {application.stage === 'resume_screening' ? 'Technical' : 'HR'} Panel
              </h3>
              <form onSubmit={handleScheduleInterview} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={labelStyle}>Assigned Interviewer *</label>
                  <select 
                    value={interviewerId} 
                    onChange={(e) => setInterviewerId(e.target.value)} 
                    style={selectStyle}
                    required
                  >
                    {admins.map((adm: any) => (
                      <option key={adm._id} value={adm._id}>{adm.name} ({adm.email})</option>
                    ))}
                    {admins.length === 0 && <option value="">No Active Admins Found</option>}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={labelStyle}>Date & Time *</label>
                  <input 
                    type="datetime-local" 
                    value={scheduledAt} 
                    onChange={(e) => setScheduledAt(e.target.value)} 
                    style={inputStyle}
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="api-btn" 
                  style={{ width: '100%', marginTop: '0.5rem' }}
                  disabled={submittingInterview || admins.length === 0 || !scheduledAt}
                >
                  {submittingInterview ? 'Scheduling Panel...' : 'Confirm Interview Panel'}
                </button>
              </form>
            </section>
          )}

          {/* Timeline Audit Trail */}
          <section className="card" style={sectionCardStyle}>
            <h3 style={sectionTitleStyle}>⏳ Activity Timeline</h3>
            <div style={timelineWrapperStyle}>
              {timeline && timeline.length > 0 ? (
                timeline.map((log) => (
                  <div key={log._id} style={timelineItemStyle}>
                    <div style={timelineHeaderStyle}>
                      <span style={timelineActionStyle}>
                        {log.action === 'stage_changed' && (
                          <span>
                            Stage updated to <strong>{getStageLabel(log.metadata?.to || '')}</strong>
                          </span>
                        )}
                        {log.action === 'note_added' && (
                          <span>Posted a remark: <em>"{log.metadata?.text?.substring(0, 40)}..."</em></span>
                        )}
                        {log.action === 'scorecard_submitted' && (
                          <span>Submitted {log.metadata?.interviewType} evaluation: <strong>{log.metadata?.recommendation?.toUpperCase()}</strong></span>
                        )}
                      </span>
                      <span style={timelineDateStyle}>
                        {new Date(log.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div style={timelineActorStyle}>
                      By {log.actor?.name} ({log.actor?.role})
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--gray-text-muted)', fontSize: '13px', margin: 0 }}>No audit logs written.</p>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div style={modalBackdropStyle}>
          <div className="card" style={modalContentStyle}>
            <h3 style={{ margin: '0 0 1.25rem 0', color: 'var(--gray-text-primary)' }}>Reject Application</h3>
            <form onSubmit={handleRejectSubmit}>
              <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={labelStyle}>Rejection Reason *</label>
                <select 
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={modalSelectStyle}
                >
                  <option value="skills_mismatch">Skills Mismatch</option>
                  <option value="experience_mismatch">Experience Mismatch</option>
                  <option value="salary_expectations">Salary Expectations</option>
                  <option value="withdrew">Candidate Withdrew</option>
                  <option value="other">Other / General</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={labelStyle}>Feedback Notes (Optional)</label>
                <textarea 
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="Provide comments about rejection rationale..."
                  style={modalTextareaStyle}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  style={cancelBtnStyle}
                  onClick={() => setIsRejectModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="api-btn"
                  style={{ backgroundColor: '#ef4444' }}
                  disabled={submittingAction}
                >
                  {submittingAction ? 'Rejecting...' : 'Reject Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Styling Parameters
const containerStyle: React.CSSProperties = {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: '2rem 1rem',
  textAlign: 'left'
};

const backLinkStyle: React.CSSProperties = {
  color: 'var(--accent-hover)',
  textDecoration: 'none',
  fontSize: '15px',
  fontWeight: 600
};

const detailHeaderStyle: React.CSSProperties = {
  marginBottom: '2rem',
  borderBottom: '1px solid var(--gray-border)',
  paddingBottom: '1.5rem'
};

const candidateTitleStyle: React.CSSProperties = {
  fontSize: '32px',
  fontWeight: 800,
  color: 'var(--gray-text-primary)',
  margin: '0 0 0.5rem 0'
};

const subTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  color: 'var(--gray-text-muted)',
  margin: 0
};

const mainLayoutGrid: React.CSSProperties = {
  display: 'flex',
  gap: '2rem',
  flexWrap: 'wrap',
  alignItems: 'flex-start'
};

const leftColStyle: React.CSSProperties = {
  flex: '2 1 600px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem'
};

const rightColStyle: React.CSSProperties = {
  flex: '1 1 350px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem'
};

const sectionCardStyle: React.CSSProperties = {
  padding: 'var(--space-5)'
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: 700,
  color: 'var(--gray-text-primary)',
  marginBottom: '1.25rem',
  borderBottom: '1px solid var(--gray-border)',
  paddingBottom: '0.5rem'
};

const metaGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
  gap: '1.25rem'
};

const metaLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: 'var(--gray-text-muted)',
  letterSpacing: '0.05em',
  display: 'block',
  marginBottom: '4px'
};

const metaValueStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--gray-text-primary)',
  fontWeight: 500
};

const linksContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '0.75rem',
  marginTop: '1.5rem',
  flexWrap: 'wrap'
};

const profileLinkBtn: React.CSSProperties = {
  textDecoration: 'none',
  fontSize: '13px',
  fontWeight: 600,
  color: 'var(--gray-text-primary)',
  backgroundColor: 'var(--gray-surface)',
  border: '1px solid var(--gray-border)',
  padding: '6px 12px',
  borderRadius: '6px',
  transition: 'all var(--transition-speed)'
};

const coverLetterTextStyle: React.CSSProperties = {
  fontSize: '14px',
  color: 'var(--gray-text-muted)',
  lineHeight: 1.6,
  margin: 0,
  whiteSpace: 'pre-wrap'
};

// Iframe Preview styles
const iframeWrapperStyle: React.CSSProperties = {
  width: '100%',
  height: '550px',
  borderRadius: '8px',
  overflow: 'hidden',
  border: '1px solid var(--gray-border)',
  backgroundColor: 'var(--gray-surface)'
};

const iframeStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  border: 'none'
};

// Notes style
const noteInputStyle: React.CSSProperties = {
  width: '100%',
  height: '80px',
  boxSizing: 'border-box',
  backgroundColor: 'var(--gray-surface)',
  border: '1px solid var(--gray-border)',
  color: 'var(--gray-text-primary)',
  borderRadius: '6px',
  padding: '10px',
  fontSize: '14px',
  resize: 'vertical'
};

const notesListStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem'
};

const noteCardStyle: React.CSSProperties = {
  padding: '12px',
  backgroundColor: 'var(--gray-surface)',
  borderRadius: 'var(--radius-default)',
  border: '1px solid var(--gray-border)'
};

const noteHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '6px',
  fontSize: '12px'
};

const noteAuthorStyle: React.CSSProperties = {
  fontWeight: 600,
  color: 'var(--accent-hover)'
};

const noteDateStyle: React.CSSProperties = {
  color: 'var(--gray-text-muted)'
};

const noteBodyStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '14px',
  color: 'var(--gray-text-primary)',
  lineHeight: 1.5,
  whiteSpace: 'pre-wrap'
};

// Right column components
const rejectionSummaryCard: React.CSSProperties = {
  backgroundColor: 'rgba(239, 68, 68, 0.08)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  padding: '14px',
  borderRadius: 'var(--radius-default)',
  fontSize: '14px'
};

const scheduledSummaryCard: React.CSSProperties = {
  backgroundColor: 'rgba(99, 102, 241, 0.08)',
  border: '1px solid rgba(99, 102, 241, 0.2)',
  padding: '14px',
  borderRadius: 'var(--radius-default)',
  fontSize: '14px',
  marginBottom: '1rem'
};

const rejectionLabel: React.CSSProperties = {
  fontWeight: 700,
  color: 'var(--gray-text-muted)',
  marginRight: '6px'
};

const rejectionNoteText: React.CSSProperties = {
  margin: '4px 0 0 0',
  color: 'var(--gray-text-muted)',
  lineHeight: 1.4
};

const hiredSummaryCard: React.CSSProperties = {
  backgroundColor: 'rgba(16, 185, 129, 0.08)',
  border: '1px solid rgba(16, 185, 129, 0.2)',
  padding: '14px',
  borderRadius: 'var(--radius-default)',
  textAlign: 'center'
};

const rejectActionBtn: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'rgba(239, 68, 68, 0.1)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  color: '#ef4444',
  padding: '10px',
  cursor: 'pointer',
  fontWeight: 600,
  borderRadius: 'var(--radius-default)',
  transition: 'all 0.2s',
  fontSize: '14px'
};

// Timeline elements
const timelineWrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  position: 'relative'
};

const timelineItemStyle: React.CSSProperties = {
  borderLeft: '2px solid var(--gray-border)',
  paddingLeft: '1rem',
  position: 'relative'
};

const timelineHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
  marginBottom: '2px'
};

const timelineActionStyle: React.CSSProperties = {
  color: 'var(--gray-text-primary)',
  fontWeight: 500
};

const timelineDateStyle: React.CSSProperties = {
  color: 'var(--gray-text-muted)'
};

const timelineActorStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--gray-text-muted)'
};

// Spinner Style
const spinnerStyle: React.CSSProperties = {
  width: '30px',
  height: '30px',
  border: '3px solid rgba(255, 255, 255, 0.1)',
  borderTop: '3px solid var(--accent)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '1.5rem auto 0 auto'
};

// Modal window styles
const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: 'var(--gray-text-muted)',
  letterSpacing: '0.05em'
};

const modalBackdropStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.75)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)'
};

const modalContentStyle: React.CSSProperties = {
  width: '450px',
  padding: '24px',
  boxSizing: 'border-box'
};

const modalSelectStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'var(--gray-surface)',
  border: '1px solid var(--gray-border)',
  color: 'var(--gray-text-primary)',
  height: '38px',
  borderRadius: '6px',
  padding: '0 12px',
  boxSizing: 'border-box',
  fontSize: '14px'
};

const modalTextareaStyle: React.CSSProperties = {
  width: '100%',
  height: '80px',
  backgroundColor: 'var(--gray-surface)',
  border: '1px solid var(--gray-border)',
  color: 'var(--gray-text-primary)',
  borderRadius: '6px',
  padding: '10px',
  fontSize: '14px',
  resize: 'vertical',
  boxSizing: 'border-box'
};

const cancelBtnStyle: React.CSSProperties = {
  backgroundColor: 'transparent',
  border: '1px solid var(--gray-border)',
  color: 'var(--gray-text-muted)',
  padding: '8px 16px',
  cursor: 'pointer',
  borderRadius: '6px',
  fontWeight: 600,
  fontSize: '14px'
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'var(--gray-surface)',
  border: '1px solid var(--gray-border)',
  color: 'var(--gray-text-primary)',
  fontSize: '14px',
  height: '38px',
  borderRadius: '6px',
  padding: '0 12px',
  boxSizing: 'border-box'
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: 'var(--gray-surface)',
  border: '1px solid var(--gray-border)',
  color: 'var(--gray-text-primary)',
  fontSize: '14px',
  height: '38px',
  borderRadius: '6px',
  padding: '0 12px',
  boxSizing: 'border-box'
};
