import React, { useState, useEffect, useCallback } from 'react';
import { StageBadge } from '../../../components/ui/StageBadge';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { PipelineProgressBar } from './PipelineProgressBar';
import { ActionCard } from './ActionCard';
import { SchedulingCard } from './SchedulingCard';
import { RejectionCard } from './RejectionCard';

// ─── Tab configuration ────────────────────────────────────────────────────────
export type DetailTab =
  | 'overview'
  | 'resume'
  | 'timeline'
  | 'notes'
  | 'interviews'
  | 'scorecards';

const TABS: { key: DetailTab; label: string }[] = [
  { key: 'overview',   label: 'Overview'    },
  { key: 'resume',     label: 'Resume'      },
  { key: 'timeline',   label: 'Timeline'    },
  { key: 'notes',      label: 'Notes'       },
  { key: 'interviews', label: 'Interviews'  },
  { key: 'scorecards', label: 'Scorecards'  },
];

// ─── Data types ───────────────────────────────────────────────────────────────
export interface DetailApplication {
  _id: string;
  stage: string;
  source: string;
  experience: number;
  resumeUrl?: string;
  phone?: string;
  address?: string;
  country?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  coverLetter?: string;
  currentCompany?: string;
  currentTitle?: string;
  rejectionReason?: string;
  rejectionNote?: string;
  createdAt: string;
  updatedAt: string;
  candidate: { _id: string; name: string; email: string } | null;
  job: { _id: string; title: string; location: string } | null;
  notes: {
    _id: string;
    text: string;
    createdAt: string;
    author: { _id: string; name: string; role: string } | null;
  }[];
}

export interface TimelineEvent {
  _id: string;
  action: string;
  metadata?: Record<string, any>;
  createdAt: string;
  actor: { _id: string; name: string; role: string } | null;
}

export interface Interview {
  _id: string;
  type: 'technical' | 'hr';
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledAt: string;
  interviewer: { _id: string; name: string; email: string } | null;
}

export interface Scorecard {
  _id: string;
  recommendation: string;
  comments: string;
  communication?: number;
  cultureFit?: number;
  salaryExpectation?: number;
  salaryOffered?: number;
  createdAt: string;
  interview: string;
  submittedBy: { _id: string; name: string; role: string } | null;
}

export interface ApplicationDetail {
  application: DetailApplication;
  timeline: TimelineEvent[];
  interviews: Interview[];
  scorecards: Scorecard[];
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface CandidateDetailPanelProps {
  applicationId: string;
  onDeselect: () => void;
  /** Callback to refresh the candidate list after a write action */
  onRefreshList?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const CandidateDetailPanel: React.FC<CandidateDetailPanelProps> = ({
  applicationId,
  onDeselect,
  onRefreshList,
}) => {
  const token  = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || '';

  // ── User Identity ────────────────────────────────────────────────────────
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isRecruiter = user?.role === 'recruiter';
  const isAdmin = user?.role === 'admin';

  // ── State ────────────────────────────────────────────────────────────────
  const [detail,  setDetail]  = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  /** Controls fade-out before loading new candidate */
  const [fading,  setFading]  = useState(false);

  // Form toggles
  const [actionState, setActionState] = useState<'none' | 'scheduling' | 'rejecting'>('none');
  const [submittingAction, setSubmittingAction] = useState(false);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchDetail = useCallback(async (id: string) => {
    if (!token) return;
    try {
      setError(null);
      const res = await fetch(`${apiUrl}/api/applications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load candidate profile');
      const data: ApplicationDetail = await res.json();
      setDetail(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setFading(false);
    }
  }, [token, apiUrl]);

  // ── Re-fetch when candidate changes — with fade transition ───────────────
  useEffect(() => {
    setFading(true);
    setLoading(true);
    setDetail(null);
    setActiveTab('overview'); // always reset to Overview on new selection
    setActionState('none');

    // Small delay to let fade-out render before loading new content
    const t = setTimeout(() => fetchDetail(applicationId), 80);
    return () => clearTimeout(t);
  }, [applicationId, fetchDetail]);

  // ── Advance Stage Logic ──────────────────────────────────────────────────
  const handleAdvance = async () => {
    if (!token || !applicationId) return;
    try {
      setSubmittingAction(true);
      const res = await fetch(`${apiUrl}/api/applications/${applicationId}/advance`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to advance stage');
      }
      await fetchDetail(applicationId);
      onRefreshList?.();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSubmittingAction(false);
    }
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const app       = detail?.application;
  const name      = app?.candidate?.name  ?? 'Unknown Candidate';
  const jobTitle  = app?.job?.title        ?? 'Unknown Position';
  const jobLoc    = app?.job?.location     ?? '';

  // ── Render: Loading ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`detail-panel ${fading ? 'detail-panel--fading' : ''}`}>
        <div className="detail-panel__header">
          <SkeletonLoader variant="panel-header" />
        </div>
        <nav className="detail-panel__tabs" aria-label="Candidate sections">
          {TABS.map((t) => (
            <button key={t.key} className="detail-tab" disabled>{t.label}</button>
          ))}
        </nav>
        <div className="detail-panel__content">
          <SkeletonLoader variant="panel-content" count={3} />
        </div>
      </div>
    );
  }

  // ── Render: Error ────────────────────────────────────────────────────────
  if (error || !detail) {
    return (
      <div className="detail-panel">
        <div className="detail-panel__header detail-panel__header--error">
          <button className="detail-panel__back" onClick={onDeselect} aria-label="Back to list">
            ←
          </button>
          <span className="detail-panel__title-area">
            <span className="detail-panel__name" style={{ color: 'var(--error)' }}>
              Profile Not Found
            </span>
          </span>
        </div>
        <div className="detail-panel__content">
          <EmptyState
            icon="⚠️"
            title="Could not load candidate"
            description={error ?? 'Unknown error'}
            action={{ label: 'Retry', onClick: () => { setLoading(true); fetchDetail(applicationId); } }}
          />
        </div>
      </div>
    );
  }

  // ── Render: Loaded ───────────────────────────────────────────────────────
  const appliedDate = app?.createdAt
    ? new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  return (
    <div className={`detail-panel ${fading ? 'detail-panel--fading' : ''}`}>

      {/* ── STICKY HEADER ─────────────────────────────────────────────── */}
      <div className="detail-panel__header">
        {/* Mobile / deselect button */}
        <button
          className="detail-panel__back"
          onClick={onDeselect}
          aria-label="Back to candidate list"
          title="Close panel"
        >
          ←
        </button>

        <div className="detail-panel__title-area">
          <div className="detail-panel__name-row">
            <span className="detail-panel__name">{name}</span>
            {app?.stage && <StageBadge stage={app.stage} size="sm" />}
          </div>
          <div className="detail-panel__subtitle">
            Applied for <strong>{jobTitle}</strong>
            {jobLoc && <span className="detail-panel__subtitle-loc"> · {jobLoc}</span>}
          </div>
          <div className="detail-panel__meta-row">
            {appliedDate && <span className="detail-panel__meta-item">📅 {appliedDate}</span>}
            {app?.experience !== undefined && (
              <span className="detail-panel__meta-item">
                💼 {app.experience === 0 ? 'Fresher' : `${app.experience}yr`}
              </span>
            )}
            {app?.country && (
              <span className="detail-panel__meta-item">📍 {app.country}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── TAB BAR ───────────────────────────────────────────────────── */}
      <nav
        className="detail-panel__tabs"
        aria-label="Candidate detail sections"
        role="tablist"
      >
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeTab === key}
            type="button"
            className={`detail-tab ${activeTab === key ? 'detail-tab--active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* ── TAB CONTENT (scrollable) ───────────────────────────────────── */}
      <div
        className="detail-panel__content"
        role="tabpanel"
        aria-label={`${activeTab} tab`}
      >
        <TabContent
          tab={activeTab}
          detail={detail}
          isAdmin={isAdmin}
          isRecruiter={isRecruiter}
          actionState={actionState}
          setActionState={setActionState}
          submittingAction={submittingAction}
          onAdvance={handleAdvance}
          onRefresh={() => {
            fetchDetail(applicationId);
            onRefreshList?.();
          }}
        />
      </div>
    </div>
  );
};

// ─── Tab content router ───────────────────────────────────────────────────────
interface TabContentProps {
  tab: DetailTab;
  detail: ApplicationDetail;
  isAdmin: boolean;
  isRecruiter: boolean;
  actionState: 'none' | 'scheduling' | 'rejecting';
  setActionState: (state: 'none' | 'scheduling' | 'rejecting') => void;
  submittingAction: boolean;
  onAdvance: () => Promise<void>;
  onRefresh: () => void;
}

const TabContent: React.FC<TabContentProps> = ({
  tab,
  detail,
  isAdmin,
  isRecruiter,
  actionState,
  setActionState,
  submittingAction,
  onAdvance,
  onRefresh,
}) => {
  const { application: app, timeline, interviews, scorecards } = detail;

  // Derive active scheduled interview
  const activeInterview = interviews.find((i) => i.status === 'scheduled') ?? null;
  const canSubmitScorecard = isAdmin && activeInterview;

  switch (tab) {
    // ── Overview ─────────────────────────────────────────────────────────
    case 'overview':
      return (
        <div className="tab-content tab-content--overview">
          {/* Progress Tracker */}
          <PipelineProgressBar currentStage={app.stage} />

          {/* Action form overrides */}
          {actionState === 'scheduling' && (
            <SchedulingCard
              applicationId={app._id}
              interviewType={app.stage === 'resume_screening' ? 'technical' : 'hr'}
              onCancel={() => setActionState('none')}
              onSuccess={() => {
                setActionState('none');
                onRefresh();
              }}
            />
          )}

          {actionState === 'rejecting' && (
            <RejectionCard
              applicationId={app._id}
              onCancel={() => setActionState('none')}
              onSuccess={() => {
                setActionState('none');
                onRefresh();
              }}
            />
          )}

          {/* Standard CTA actions card */}
          {actionState === 'none' && (
            <ActionCard
              application={app}
              activeInterview={activeInterview}
              isAdmin={isAdmin}
              isRecruiter={isRecruiter}
              onAdvanceClick={onAdvance}
              onRejectClick={() => setActionState('rejecting')}
              onScheduleClick={() => setActionState('scheduling')}
              submittingAction={submittingAction}
            />
          )}

          {/* Candidate Snapshot */}
          <section className="detail-section">
            <h4 className="detail-section__title">Candidate Info</h4>
            <div className="detail-meta-grid">
              <span className="detail-meta-grid__label">Email</span>
              <span className="detail-meta-grid__value">{app.candidate?.email ?? '—'}</span>

              <span className="detail-meta-grid__label">Phone</span>
              <span className="detail-meta-grid__value">{app.phone || '—'}</span>

              {app.address && (
                <>
                  <span className="detail-meta-grid__label">Location</span>
                  <span className="detail-meta-grid__value">{app.address}, {app.country}</span>
                </>
              )}

              {app.currentCompany && (
                <>
                  <span className="detail-meta-grid__label">Current Role</span>
                  <span className="detail-meta-grid__value">{app.currentTitle} at {app.currentCompany}</span>
                </>
              )}

              <span className="detail-meta-grid__label">Source</span>
              <span className="detail-meta-grid__value" style={{ textTransform: 'capitalize' }}>
                {app.source.replace(/_/g, ' ')}
              </span>

              <span className="detail-meta-grid__label">Experience</span>
              <span className="detail-meta-grid__value">
                {app.experience === 0 ? 'Fresher' : `${app.experience} years`}
              </span>
            </div>

            {/* Social links */}
            {(app.linkedinUrl || app.githubUrl || app.portfolioUrl) && (
              <div className="detail-links">
                {app.linkedinUrl && (
                  <a href={app.linkedinUrl} target="_blank" rel="noopener noreferrer" className="detail-link-btn">
                    🔗 LinkedIn
                  </a>
                )}
                {app.githubUrl && (
                  <a href={app.githubUrl} target="_blank" rel="noopener noreferrer" className="detail-link-btn">
                    💻 GitHub
                  </a>
                )}
                {app.portfolioUrl && (
                  <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="detail-link-btn">
                    🌐 Portfolio
                  </a>
                )}
              </div>
            )}

            {/* Cover letter */}
            {app.coverLetter && (
              <div className="detail-cover-letter">
                <span className="detail-meta-grid__label">Cover Letter</span>
                <p className="detail-cover-letter__text">{app.coverLetter}</p>
              </div>
            )}
          </section>
        </div>
      );

    // ── Resume ───────────────────────────────────────────────────────────
    case 'resume':
      return (
        <div className="tab-content tab-content--resume">
          {app.resumeUrl ? (
            <>
              <div className="resume-tab__header">
                <span className="resume-tab__filename">📄 Resume</span>
                <a
                  href={app.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resume-tab__open-link"
                >
                  Open in new tab ↗
                </a>
              </div>
              <div className="resume-tab__viewer">
                <iframe
                  src={app.resumeUrl}
                  title="Candidate Resume"
                  className="resume-tab__iframe"
                />
              </div>
            </>
          ) : (
            <EmptyState
              icon="📄"
              title="No resume uploaded"
              description="This candidate did not upload a resume with their application."
            />
          )}
        </div>
      );

    // ── Timeline ─────────────────────────────────────────────────────────
    case 'timeline':
      return (
        <div className="tab-content tab-content--timeline">
          {timeline.length === 0 ? (
            <EmptyState icon="📋" title="No activity yet" description="Events will appear here as the candidate progresses through the pipeline." />
          ) : (
            <div className="timeline-feed">
              {timeline.map((event) => (
                <div key={event._id} className="timeline-event">
                  <div className="timeline-event__dot" />
                  <div className="timeline-event__body">
                    <div className="timeline-event__action">
                      {formatTimelineEventText(event, app.stage)}
                    </div>
                    <div className="timeline-event__meta">
                      {event.actor?.name ?? 'System'}
                      {event.actor?.role && (
                        <span className="timeline-event__role"> · {event.actor.role}</span>
                      )}
                      <span className="timeline-event__time">
                        {' · '}{formatRelativeDate(event.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    // ── Notes ────────────────────────────────────────────────────────────
    case 'notes':
      return (
        <div className="tab-content tab-content--notes">
          <NotesTabContent app={app} />
        </div>
      );

    // ── Interviews ───────────────────────────────────────────────────────
    case 'interviews':
      return (
        <div className="tab-content tab-content--interviews">
          {interviews.length === 0 ? (
            <EmptyState
              icon="🗓"
              title="No interviews scheduled"
              description="When a Technical or HR interview is scheduled, it will appear here."
            />
          ) : (
            <div className="interviews-list">
              {interviews.map((iv) => (
                <div key={iv._id} className="interview-card">
                  <div className="interview-card__header">
                    <span className="interview-card__type">
                      {iv.type === 'technical' ? '🖥 Technical Interview' : '🤝 HR Interview'}
                    </span>
                    <span className={`interview-card__status interview-card__status--${iv.status}`}>
                      {iv.status}
                    </span>
                  </div>
                  <div className="interview-card__detail">
                    Interviewer: <strong>{iv.interviewer?.name ?? 'TBD'}</strong>
                  </div>
                  <div className="interview-card__detail">
                    Scheduled: <strong>
                      {new Date(iv.scheduledAt).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    // ── Scorecards ───────────────────────────────────────────────────────
    case 'scorecards':
      return (
        <div className="tab-content tab-content--scorecards">
          {/* Submit Scorecard form section for Admin */}
          {canSubmitScorecard && activeInterview && (
            <ScorecardFormContent
              interviewId={activeInterview._id}
              interviewType={activeInterview.type}
              onSubmitSuccess={onRefresh}
            />
          )}

          {/* List of submitted scorecards */}
          {scorecards.length === 0 ? (
            <EmptyState
              icon="🏆"
              title="No scorecards yet"
              description="Scorecards will appear here once submitted by an evaluator."
            />
          ) : (
            <div className="scorecards-list">
              {scorecards.map((sc) => {
                const interview = interviews.find((iv) => iv._id === sc.interview);
                const isHr = interview?.type === 'hr';
                const recClass = sc.recommendation === 'hire' || sc.recommendation === 'pass'
                  ? 'scorecard__rec--pass' : 'scorecard__rec--reject';

                return (
                  <div key={sc._id} className="scorecard-card">
                    <div className="scorecard-card__header">
                      <span className="scorecard-card__type">
                        {isHr ? '🤝 HR Scorecard' : '🖥 Technical Scorecard'}
                      </span>
                      <span className={`scorecard-card__rec ${recClass}`}>
                        {sc.recommendation.toUpperCase()}
                      </span>
                    </div>
                    <div className="scorecard-card__meta">
                      Submitted by <strong>{sc.submittedBy?.name ?? 'Admin'}</strong>
                      {' · '}
                      {new Date(sc.createdAt).toLocaleDateString()}
                    </div>

                    {isHr && (
                      <div className="scorecard-card__ratings">
                        <div className="scorecard-card__rating-row">
                          <span>Communication</span>
                          <StarRating value={sc.communication ?? 0} />
                        </div>
                        <div className="scorecard-card__rating-row">
                          <span>Culture Fit</span>
                          <StarRating value={sc.cultureFit ?? 0} />
                        </div>
                        {sc.salaryExpectation && (
                          <div className="scorecard-card__rating-row">
                            <span>Salary Expected</span>
                            <span>₹{sc.salaryExpectation.toLocaleString()}</span>
                          </div>
                        )}
                        {sc.salaryOffered && (
                          <div className="scorecard-card__rating-row">
                            <span>Salary Offered</span>
                            <span>₹{sc.salaryOffered.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {sc.comments && (
                      <div className="scorecard-card__comments">
                        <span className="scorecard-card__comments-label">Notes</span>
                        <p>{sc.comments}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
};

// ─── Scorecard Form sub-component ───────────────────────────────────────────
interface ScorecardFormContentProps {
  interviewId: string;
  interviewType: 'technical' | 'hr';
  onSubmitSuccess: () => void;
}

const ScorecardFormContent: React.FC<ScorecardFormContentProps> = ({
  interviewId,
  interviewType,
  onSubmitSuccess,
}) => {
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const [recommendation, setRecommendation] = useState(interviewType === 'technical' ? 'pass' : 'hire');
  const [comments, setComments] = useState('');
  const [communication, setCommunication] = useState(3);
  const [cultureFit, setCultureFit] = useState(3);
  const [salaryExpectation, setSalaryExpectation] = useState('');
  const [salaryOffered, setSalaryOffered] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !comments.trim()) return;

    const bodyData: any = {
      recommendation,
      comments: comments.trim()
    };

    if (interviewType === 'hr') {
      bodyData.communication = communication;
      bodyData.cultureFit = cultureFit;
      if (salaryExpectation) bodyData.salaryExpectation = Number(salaryExpectation);
      if (salaryOffered) bodyData.salaryOffered = Number(salaryOffered);
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await fetch(`${apiUrl}/api/interviews/${interviewId}/scorecard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to submit scorecard');
      }

      onSubmitSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="scorecard-form">
      <h5 className="scorecard-form__title">
        Submit {interviewType === 'technical' ? 'Technical' : 'HR'} Evaluation
      </h5>

      <div className="scorecard-form__field">
        <label htmlFor="sf-rec">Recommendation *</label>
        {interviewType === 'technical' ? (
          <select id="sf-rec" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} required>
            <option value="pass">Pass (Advance to HR)</option>
            <option value="reject">Reject Candidate</option>
          </select>
        ) : (
          <select id="sf-rec" value={recommendation} onChange={(e) => setRecommendation(e.target.value)} required>
            <option value="hire">Accept & Hire</option>
            <option value="reject">Reject Candidate</option>
          </select>
        )}
      </div>

      {interviewType === 'hr' && (
        <>
          <div className="scorecard-form__row-2">
            <div className="scorecard-form__field">
              <label htmlFor="sf-culture">Culture Fit (1-5)</label>
              <select id="sf-culture" value={cultureFit} onChange={(e) => setCultureFit(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="scorecard-form__field">
              <label htmlFor="sf-comm">Communication (1-5)</label>
              <select id="sf-comm" value={communication} onChange={(e) => setCommunication(Number(e.target.value))}>
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>

          <div className="scorecard-form__row-2">
            <div className="scorecard-form__field">
              <label htmlFor="sf-sal-exp">Salary Expectation ($)</label>
              <input
                id="sf-sal-exp"
                type="number"
                placeholder="e.g. 95000"
                value={salaryExpectation}
                onChange={(e) => setSalaryExpectation(e.target.value)}
                required
              />
            </div>
            <div className="scorecard-form__field">
              <label htmlFor="sf-sal-off">Salary Offered ($)</label>
              <input
                id="sf-sal-off"
                type="number"
                placeholder="e.g. 100000"
                value={salaryOffered}
                onChange={(e) => setSalaryOffered(e.target.value)}
                required
              />
            </div>
          </div>
        </>
      )}

      <div className="scorecard-form__field">
        <label htmlFor="sf-comments">Comments / Rationale *</label>
        <textarea
          id="sf-comments"
          placeholder="Provide details about performance and decision rationale..."
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          required
        />
      </div>

      {error && <div className="scorecard-form__error">⚠️ {error}</div>}

      <button type="submit" className="api-btn scorecard-form__submit" disabled={submitting || !comments.trim()}>
        {submitting ? 'Submitting...' : 'Submit Evaluation Scorecard'}
      </button>
    </form>
  );
};

// ─── Notes sub-component (has its own form state) ─────────────────────────────
const NotesTabContent: React.FC<{ app: DetailApplication }> = ({ app }) => {
  const token  = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const [notes,        setNotes]        = useState(app.notes ?? []);
  const [noteText,     setNoteText]     = useState('');
  const [submitting,   setSubmitting]   = useState(false);
  const [noteError,    setNoteError]    = useState<string | null>(null);

  // Keep local notes in sync when app prop changes
  useEffect(() => { setNotes(app.notes ?? []); }, [app._id, app.notes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !token) return;
    try {
      setSubmitting(true);
      setNoteError(null);
      const res = await fetch(`${apiUrl}/api/applications/${app._id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: noteText.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message ?? 'Failed to post note');
      }
      const updated = await res.json();
      setNotes(updated.application?.notes ?? notes);
      setNoteText('');
    } catch (err) {
      setNoteError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Compose */}
      <form className="notes-compose" onSubmit={handleSubmit}>
        <textarea
          className="notes-compose__input"
          placeholder="Write a screening note…"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={3}
          disabled={submitting}
        />
        {noteError && <p className="notes-compose__error">{noteError}</p>}
        <div className="notes-compose__footer">
          <button
            type="submit"
            className="api-btn notes-compose__submit"
            disabled={submitting || !noteText.trim()}
          >
            {submitting ? 'Posting…' : 'Post Note'}
          </button>
        </div>
      </form>

      {/* Feed */}
      {notes.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No notes yet"
          description="Add your first observation about this candidate above."
        />
      ) : (
        <div className="notes-feed">
          {[...notes].reverse().map((note) => (
            <div key={note._id} className="note-item">
              <div className="note-item__header">
                <span className="note-item__author">{note.author?.name ?? 'You'}</span>
                {note.author?.role && (
                  <span className="note-item__role-badge">{note.author.role}</span>
                )}
                <span className="note-item__time">{formatRelativeDate(note.createdAt)}</span>
              </div>
              <p className="note-item__text">{note.text}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// ─── Star rating display ──────────────────────────────────────────────────────
const StarRating: React.FC<{ value: number; max?: number }> = ({ value, max = 5 }) => (
  <span className="star-rating" aria-label={`${value} out of ${max}`}>
    {Array.from({ length: max }).map((_, i) => (
      <span key={i} className={i < value ? 'star-rating__star--filled' : 'star-rating__star--empty'}>
        ★
      </span>
    ))}
  </span>
);

// ─── Utilities ────────────────────────────────────────────────────────────────
function formatRelativeDate(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 2)  return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24)  return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 30)   return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatTimelineEventText(event: TimelineEvent, currentStage: string): React.ReactNode {
  const label = event.metadata?.to
    ? event.metadata.to.replace(/_/g, ' ').toUpperCase()
    : currentStage.replace(/_/g, ' ').toUpperCase();

  switch (event.action) {
    case 'stage_changed':
      return (
        <span>
          🔄 Stage updated to <strong>{label}</strong>
        </span>
      );
    case 'note_added':
      return (
        <span>
          📝 Posted remark: <em>"{event.metadata?.text?.substring(0, 50)}..."</em>
        </span>
      );
    case 'interview_scheduled':
      return (
        <span>
          🗓 Interview Scheduled: <strong>{event.metadata?.interviewType?.toUpperCase()}</strong>
        </span>
      );
    case 'scorecard_submitted':
      return (
        <span>
          📋 Submitted evaluation: <strong>{event.metadata?.recommendation?.toUpperCase()}</strong>
        </span>
      );
    case 'application_submitted':
      return <span>📄 Application submitted</span>;
    case 'rejected':
      return <span>✗ Application rejected</span>;
    case 'hired':
      return <span>✅ Candidate hired</span>;
    default:
      return <span>{event.action.replace(/_/g, ' ')}</span>;
  }
}
