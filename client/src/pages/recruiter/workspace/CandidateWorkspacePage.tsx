import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CandidateList } from './CandidateList';
import { StageTabBar } from './StageTabBar';
import { CandidateDetailPanel } from './CandidateDetailPanel';
import { KanbanBoard } from './KanbanBoard';
import { EmptyState } from '../../../components/ui/EmptyState';

export const CandidateWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token    = localStorage.getItem('token');

  // ── Workspace state ───────────────────────────────────────────
  const [activeStage, setActiveStage]   = useState(searchParams.get('stage') || '');
  const [selectedId,  setSelectedId]    = useState<string | null>(searchParams.get('candidate'));
  const [stageCounts, setStageCounts]   = useState<Record<string, number>>({});
  const [panelOpen,   setPanelOpen]     = useState(!!searchParams.get('candidate'));
  
  // view mode: 'list' (default) or 'kanban'
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>(
    (searchParams.get('view') as 'list' | 'kanban') || 'list'
  );
  
  // Stores raw loaded applications from list component (for kanban rendering)
  const [allApplications, setAllApplications] = useState<any[]>([]);

  // Ref to trigger list refresh from inside the detail panel
  const listRefreshRef = useRef<(() => void) | null>(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  // Sync state changes with URL Search Params
  const handleSelect = (id: string) => {
    setSelectedId(id);
    setPanelOpen(true);
    setSearchParams((prev) => {
      prev.set('candidate', id);
      return prev;
    });
  };

  const handleDeselect = () => {
    setSelectedId(null);
    setPanelOpen(false);
    setSearchParams((prev) => {
      prev.delete('candidate');
      return prev;
    });
  };

  const handleStageChange = (s: string) => {
    setActiveStage(s);
    setSelectedId(null);
    setPanelOpen(false);
    setSearchParams((prev) => {
      if (s) {
        prev.set('stage', s);
      } else {
        prev.delete('stage');
      }
      prev.delete('candidate');
      return prev;
    });
  };

  const handleViewModeChange = (mode: 'list' | 'kanban') => {
    setViewMode(mode);
    setSearchParams((prev) => {
      if (mode === 'kanban') {
        prev.set('view', 'kanban');
      } else {
        prev.delete('view');
      }
      return prev;
    });
  };

  // Listen for external URL changes (back/forward navigation)
  useEffect(() => {
    const stageParam = searchParams.get('stage') || '';
    const candParam = searchParams.get('candidate');
    const viewParam = searchParams.get('view') || 'list';
    
    setActiveStage(stageParam);
    setSelectedId(candParam);
    setPanelOpen(!!candParam);
    setViewMode(viewParam as 'list' | 'kanban');
  }, [searchParams]);

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



  const isStaleApplication = (app: any): boolean => {
    if (app.stage !== 'resume_screening') return false;
    const daysSinceUpdate = (Date.now() - new Date(app.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 7;
  };

  return (
    <div className="workspace-root">
      {/* ── CONTEXT BAR (stage tabs & view toggle) ──────────────── */}
      <div className="workspace-contextbar">
        <StageTabBar
          activeStage={activeStage}
          counts={stageCounts}
          onStageChange={handleStageChange}
        />
        
        {/* View Mode Toggle Controls */}
        <div className="view-mode-toggle" role="group" aria-label="View mode selector">
          <button 
            type="button"
            className={`view-mode-toggle__btn ${viewMode === 'list' ? 'view-mode-toggle__btn--active' : ''}`}
            onClick={() => handleViewModeChange('list')}
            title="List View"
          >
            ☰ List
          </button>
          <button 
            type="button"
            className={`view-mode-toggle__btn ${viewMode === 'kanban' ? 'view-mode-toggle__btn--active' : ''}`}
            onClick={() => handleViewModeChange('kanban')}
            title="Kanban Board View"
          >
            ⊞ Board
          </button>
        </div>
      </div>

      {/* ── WORKSPACE BODY CONTENT ───────────────────────────── */}
      {viewMode === 'list' ? (
        <div className="workspace-body">
          {/* LEFT — Candidate List */}
          <aside className="workspace-left-panel">
            <CandidateList
              activeStage={activeStage}
              onCountsChange={handleCountsChange}
              selectedId={selectedId}
              onSelect={handleSelect}
              onRefreshReady={(fn) => { listRefreshRef.current = fn; }}
              onApplicationsLoad={setAllApplications}
            />
          </aside>

          {/* RIGHT — Candidate Detail Panel */}
          <main
            className={`workspace-right-panel ${panelOpen ? 'is-open' : ''}`}
            aria-label="Candidate detail"
          >
            {selectedId ? (
              <CandidateDetailPanel
                key={selectedId}
                applicationId={selectedId}
                onDeselect={handleDeselect}
                onRefreshList={handleListRefresh}
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

          <KanbanBoard
            applications={allApplications}
            selectedId={selectedId}
            onSelect={handleSelect}
            isStaleCheck={isStaleApplication}
          />

          {/* Slide-out detail drawer overlay over the Kanban board */}
          <main
            className={`workspace-right-panel kanban-drawer ${panelOpen ? 'is-open' : ''}`}
            aria-label="Candidate detail drawer"
          >
            {selectedId ? (
              <CandidateDetailPanel
                key={selectedId}
                applicationId={selectedId}
                onDeselect={handleDeselect}
                onRefreshList={handleListRefresh}
              />
            ) : (
              <div className="workspace-right-panel__empty">
                <EmptyState
                  icon="👉"
                  title="Select a candidate card"
                  description="Click any candidate card on the Kanban columns to open their detail drawer overlay."
                />
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
};
