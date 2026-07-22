import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CandidateList } from './CandidateList';
import { StageTabBar } from './StageTabBar';
import { CandidateDetailModal } from '../../../components/modal/CandidateDetailModal';
import { KanbanBoard } from './KanbanBoard';
import { JobGroupSidebar } from '../../../components/layout/JobGroupSidebar';
import { useCandidateWorkspace } from '../../../hooks/useCandidateWorkspace';

const STALE_THRESHOLD_DAYS = 7;
const STALE_STAGES = ['resume_screening'];

function isStaleApplication(app: any): boolean {
  if (!app || !app.stage || !STALE_STAGES.includes(app.stage)) return false;
  const daysSinceUpdate =
    (Date.now() - new Date(app.updatedAt || app.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate > STALE_THRESHOLD_DAYS;
}

// ── Localized Workspace Section Error Boundary ────────────────────────────────
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class WorkspaceSectionErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Workspace Section Error Captured]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 32, textAlign: 'center', backgroundColor: '#ffffff', borderRadius: 16, border: '1px solid var(--gray-border, #e2e8f0)', margin: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--error, #ef4444)', marginBottom: 8 }}>
            {this.props.fallbackTitle || 'Section Display Error'}
          </h3>
          <p style={{ fontSize: 13, color: 'var(--gray-text-muted, #64748b)', marginBottom: 16 }}>
            {this.state.error?.message || 'An unexpected rendering error occurred in this workspace section.'}
          </p>
          <button
            type="button"
            className="btn-primary-sm"
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onReset?.();
            }}
          >
            Reload Section
          </button>
        </div>
      );
    }

    return (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {this.props.children}
      </div>
    );
  }
}

const FUNNEL_STAGES = [
  { key: 'resume_screening',   label: 'RECRUITER SCREEN' },
  { key: 'technical_interview', label: '1ST INTERVIEW' },
  { key: 'hr_interview',       label: '2ND INTERVIEW' },
  { key: 'offer',              label: 'OFFER' },
  { key: 'hired',              label: 'HIRED' },
  { key: 'rejected',           label: 'REJECTED' },
];

export const CandidateWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token    = localStorage.getItem('token');

  // Derive parameters directly from searchParams (clean SPA sync)
  const activeStage = searchParams.get('stage') || '';
  const selectedJobId = searchParams.get('job') || undefined;

  // Workspace state via hook
  const {
    groups,
    loadingJobs,
    expandedGroups,
    toggleGroup,
    applications,
    loadingApps,
    appsError,
    searchTerm,
    setSearchTerm,
    stageCounts,
    refreshApplications,
  } = useCandidateWorkspace({ activeStage, selectedJobId });

  const selectedId = searchParams.get('candidate');
  const storedView = sessionStorage.getItem('candidate_view_mode') as 'list' | 'kanban' | null;
  const paramView = searchParams.get('view') as 'list' | 'kanban' | null;
  const viewMode = paramView || storedView || 'list';
  const panelOpen = !!selectedId;

  // Sync stored view mode if missing from URL
  useEffect(() => {
    if (!paramView && storedView) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (storedView === 'kanban') {
          next.set('view', 'kanban');
        }
        return next;
      }, { replace: true });
    }
  }, [paramView, storedView, setSearchParams]);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSelectJob = (jobId?: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (jobId) {
        next.set('job', jobId);
      } else {
        next.delete('job');
      }
      next.delete('stage');
      next.delete('candidate');
      return next;
    }, { replace: false });
  };

  // Sync state changes with URL Search Params
  const handleSelect = (id: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('candidate', id);
      return next;
    }, { replace: false });
  };

  const handleDeselect = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('candidate');
      return next;
    }, { replace: false });
  };

  const handleStageChange = (s: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (s) {
        next.set('stage', s);
      } else {
        next.delete('stage');
      }
      next.delete('candidate');
      return next;
    }, { replace: false });
  };

  const handleViewModeChange = (mode: 'list' | 'kanban') => {
    sessionStorage.setItem('candidate_view_mode', mode);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (mode === 'kanban') {
        next.set('view', 'kanban');
      } else {
        next.delete('view');
      }
      return next;
    }, { replace: true });
  };

  const currentIdx = selectedId ? applications.findIndex((a) => a._id === selectedId) : -1;
  const hasPrevious = currentIdx > 0;
  const hasNext = currentIdx >= 0 && currentIdx < applications.length - 1;

  const handleNextCandidate = () => {
    if (hasNext) {
      handleSelect(applications[currentIdx + 1]._id);
    }
  };

  const handlePreviousCandidate = () => {
    if (hasPrevious) {
      handleSelect(applications[currentIdx - 1]._id);
    }
  };

  return (
    <div className="workspace-container">
      {/* ── LEFT SIDEBAR (Lever Jobs Column) ── */}
      <JobGroupSidebar
        groups={groups}
        selectedJobId={selectedJobId}
        expandedGroups={expandedGroups}
        onToggleGroup={toggleGroup}
        onSelectJob={handleSelectJob}
        loading={loadingJobs}
        empty={groups.length === 0 && !loadingJobs}
      />

      {/* ── MAIN CONTENT AREA ── */}
      <div className="workspace-main-area" style={{ padding: '24px 32px 60px' }}>
        {/* ── TOP HEADER BAR (Title, Search & View Switcher) ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>Candidates Pipeline</h2>
            {selectedJobId && (
              <span className="badge badge-success" style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>Filtered by Job</span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="text"
              placeholder="Search candidates, roles, emails…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="workspace-search-input"
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                width: 260,
                outline: 'none',
                backgroundColor: '#ffffff'
              }}
            />
            <div className="view-switcher" role="group" aria-label="Pipeline View Mode" style={{ flexShrink: 0 }}>
              <button
                type="button"
                className={`view-switcher__btn ${viewMode === 'list' ? 'is-active' : ''}`}
                onClick={() => handleViewModeChange('list')}
                aria-pressed={viewMode === 'list'}
              >
                List
              </button>
              <button
                type="button"
                className={`view-switcher__btn ${viewMode === 'kanban' ? 'is-active' : ''}`}
                onClick={() => handleViewModeChange('kanban')}
                aria-pressed={viewMode === 'kanban'}
              >
                Board
              </button>
            </div>
          </div>
        </div>

        {/* ── STAGE TABS BAR ── */}
        <div style={{ marginBottom: 16 }}>
          <StageTabBar
            activeStage={activeStage}
            counts={stageCounts}
            onStageChange={handleStageChange}
          />
        </div>

        {/* ── PIPELINE FUNNEL METRICS BAR (Matching Lever Design) ── */}
        <div className="lever-funnel-bar" style={{ marginBottom: 20 }}>
          {FUNNEL_STAGES.map((s) => {
            const count = stageCounts[s.key] || 0;
            const isActive = activeStage === s.key;
            return (
              <button
                key={s.key}
                type="button"
                className={`lever-funnel-card ${isActive ? 'is-active' : ''}`}
                onClick={() => handleStageChange(isActive ? '' : s.key)}
              >
                <span className="lever-funnel-count">{count}</span>
                <span className="lever-funnel-label">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── WORKSPACE BODY CONTENT (Smooth Data Update with Zero Layout Shift) ── */}
        {viewMode === 'list' ? (
          <div className="workspace-body" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <WorkspaceSectionErrorBoundary fallbackTitle="Candidate List Error">
              <CandidateList
                applications={applications}
                loading={loadingApps}
                error={appsError}
                selectedId={selectedId}
                onSelect={handleSelect}
              />
            </WorkspaceSectionErrorBoundary>
          </div>
        ) : (
          <div className="workspace-kanban-container" style={{ position: 'relative', overflow: 'hidden', flex: 1 }}>
            <WorkspaceSectionErrorBoundary fallbackTitle="Kanban Board Error">
              <KanbanBoard
                applications={applications}
                selectedId={selectedId}
                onSelect={handleSelect}
                isStaleCheck={isStaleApplication}
              />
            </WorkspaceSectionErrorBoundary>
          </div>
        )}

        {/* Candidate Detail Modal */}
        {selectedId && (
          <CandidateDetailModal
            isOpen={panelOpen}
            applicationId={selectedId}
            onClose={handleDeselect}
            onRefreshList={refreshApplications}
            onNext={handleNextCandidate}
            onPrevious={handlePreviousCandidate}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
          />
        )}
      </div>
    </div>
  );
};
