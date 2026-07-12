import React, { useState, useEffect, useCallback } from 'react';
import { StageBadge } from '../../../components/ui/StageBadge';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { EmptyState } from '../../../components/ui/EmptyState';

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
  metadata?: Record<string, unknown>;
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

  // ── State ────────────────────────────────────────────────────────────────
  const [detail,  setDetail]  = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  /** Controls fade-out before loading new candidate */
  const [fading,  setFading]  = useState(false);

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

    // Small delay to let fade-out render before loading new content
    const t = setTimeout(() => fetchDetail(applicationId), 80);
    return () => clearTimeout(t);
  }, [applicationId, fetchDetail]);

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
  onRefresh: () => void;
}

const TabContent: React.FC<TabContentProps> = ({ tab, detail }) => {
  const { application: app, timeline, interviews, scorecards } = detail;

  switch (tab) {
    // ── Overview ─────────────────────────────────────────────────────────
    case 'overview':
      return (
        <div className="tab-content tab-content--overview">
          {/* Action Card — Phase 4 will replace this placeholder */}
          <div className="action-card-placeholder">
            <div className="acp__label">PIPELINE ACTION</div>
            <div className="acp__stage">
              Current stage: <strong>{app.stage.replace(/_/g, ' ')}</strong>
            </div>
            <p className="acp__note">
              Full action cards (scheduling, rejection, advancement) are built in Phase 5.
            </p>
          </div>

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
                      {formatTimelineAction(event.action)}
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
          {scorecards.length === 0 ? (
            <EmptyState
              icon="🏆"
              title="No scorecards yet"
              description="Schedule a Technical Interview from the Overview tab to begin evaluation."
              action={{ label: 'Go to Overview', onClick: () => {} }}
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

function formatTimelineAction(action: string): string {
  const map: Record<string, string> = {
    stage_changed:          '🔄 Stage changed',
    note_added:             '📝 Note added',
    interview_scheduled:    '🗓 Interview scheduled',
    scorecard_submitted:    '📋 Scorecard submitted',
    application_submitted:  '📄 Application submitted',
    rejected:               '✗ Application rejected',
    hired:                  '✅ Candidate hired',
  };
  return map[action] ?? action.replace(/_/g, ' ');
}
