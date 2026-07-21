import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CandidateList } from './CandidateList';
import { StageTabBar } from './StageTabBar';
import { CandidateDetailPanel } from './CandidateDetailPanel';
import { KanbanBoard } from './KanbanBoard';
import { EmptyState } from '../../../components/ui/EmptyState';

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

export const CandidateWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token    = localStorage.getItem('token');


  // Derive parameters directly from searchParams (clean SPA sync)
  const activeStage = searchParams.get('stage') || '';
  const selectedId = searchParams.get('candidate');
  // Tab Memory: Restore last active view mode ('list' | 'kanban') from sessionStorage or URL
  const storedView = sessionStorage.getItem('candidate_view_mode') as 'list' | 'kanban' | null;
  const paramView = searchParams.get('view') as 'list' | 'kanban' | null;
  const viewMode = paramView || storedView || 'list';
  const panelOpen = !!selectedId;

  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  const [allApplications, setAllApplications] = useState<any[]>([]);
  const listRefreshRef = useRef<(() => void) | null>(null);

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

  const handleCountsChange = useCallback((counts: Record<string, number>) => {
    setStageCounts(counts);
  }, []);

  const handleListRefresh = useCallback(() => {
    listRefreshRef.current?.();
  }, []);



  // Listen for Escape key to deselect active candidate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        const tag = document.activeElement?.tagName.toLowerCase();
        if (tag === 'textarea' || tag === 'input') {
          return;
        }
        handleDeselect();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentIdx = selectedId ? allApplications.findIndex((a) => a._id === selectedId) : -1;
  const hasPrevious = currentIdx > 0;
  const hasNext = currentIdx >= 0 && currentIdx < allApplications.length - 1;

  const handleNextCandidate = () => {
    if (hasNext) {
      handleSelect(allApplications[currentIdx + 1]._id);
    }
  };

  const handlePreviousCandidate = () => {
    if (hasPrevious) {
      handleSelect(allApplications[currentIdx - 1]._id);
    }
  };

  return (
    <div className="workspace-container">
      {/* ── WORKSPACE CONTEXT BAR (Stage Tabs + Nested View Switcher) ── */}
      <div className="workspace-contextbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 16 }}>
        <StageTabBar
          activeStage={activeStage}
          counts={stageCounts}
          onStageChange={handleStageChange}
        />

        {/* Nested View Switcher attached to Candidates workspace */}
        <div className="view-switcher" role="group" aria-label="Pipeline View Mode" style={{ flexShrink: 0, marginLeft: 16 }}>
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

      {/* ── WORKSPACE BODY CONTENT ───────────────────────────── */}
      {viewMode === 'list' ? (
        <div className="workspace-body">
          {/* LEFT — Candidate List */}
          <aside className="workspace-left-panel">
            <WorkspaceSectionErrorBoundary fallbackTitle="Candidate List Error">
              <CandidateList
                activeStage={activeStage}
                onCountsChange={handleCountsChange}
                selectedId={selectedId}
                onSelect={handleSelect}
                onRefreshReady={(fn) => { listRefreshRef.current = fn; }}
                onApplicationsLoad={setAllApplications}
              />
            </WorkspaceSectionErrorBoundary>
          </aside>

          {/* RIGHT — Candidate Detail Panel */}
          <main
            className={`workspace-right-panel ${panelOpen ? 'is-open' : ''}`}
            aria-label="Candidate detail"
          >
            <WorkspaceSectionErrorBoundary fallbackTitle="Candidate Profile Error" onReset={handleDeselect}>
              {selectedId ? (
                <CandidateDetailPanel
                  key={selectedId}
                  applicationId={selectedId}
                  onDeselect={handleDeselect}
                  onRefreshList={handleListRefresh}
                  onNext={handleNextCandidate}
                  onPrevious={handlePreviousCandidate}
                  hasNext={hasNext}
                  hasPrevious={hasPrevious}
                />
              ) : (
                <div className="workspace-right-panel__empty">
                  <EmptyState
                    icon="👈"
                    title="Select a candidate"
                    description="Click any candidate on the left to view their profile, resume, timeline, notes, and interview history."
                  />
                </div>
              )}
            </WorkspaceSectionErrorBoundary>
          </main>
        </div>
      ) : (
        <div className="workspace-kanban-container" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Hidden list loader to sync count statistics and candidates */}
          <div style={{ display: 'none' }}>
            <CandidateList
              activeStage={activeStage}
              onCountsChange={handleCountsChange}
              selectedId={selectedId}
              onSelect={handleSelect}
              onRefreshReady={(fn) => { listRefreshRef.current = fn; }}
              onApplicationsLoad={setAllApplications}
            />
          </div>

          <WorkspaceSectionErrorBoundary fallbackTitle="Kanban Board Error">
            <KanbanBoard
              applications={allApplications}
              selectedId={selectedId}
              onSelect={handleSelect}
              isStaleCheck={isStaleApplication}
            />
          </WorkspaceSectionErrorBoundary>

          {/* Centered Modal Overlay for Board View */}
          {selectedId && (
            <div
              className="kanban-modal-overlay"
              onClick={handleDeselect}
              style={{
                position: 'fixed',
                inset: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(6px)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
              }}
            >
              <div
                className="kanban-modal-container"
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: 960,
                  height: '88vh',
                  backgroundColor: 'var(--gray-surface, #ffffff)',
                  borderRadius: 16,
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <WorkspaceSectionErrorBoundary fallbackTitle="Candidate Profile Error" onReset={handleDeselect}>
                  <CandidateDetailPanel
                    key={selectedId}
                    applicationId={selectedId}
                    onDeselect={handleDeselect}
                    onRefreshList={handleListRefresh}
                    onNext={handleNextCandidate}
                    onPrevious={handlePreviousCandidate}
                    hasNext={hasNext}
                    hasPrevious={hasPrevious}
                  />
                </WorkspaceSectionErrorBoundary>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
