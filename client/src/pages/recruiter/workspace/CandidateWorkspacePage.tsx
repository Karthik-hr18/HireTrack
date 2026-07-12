import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { CandidateList } from './CandidateList';
import { StageTabBar } from './StageTabBar';
import { CandidateDetailPanel } from './CandidateDetailPanel';
import { EmptyState } from '../../../components/ui/EmptyState';

export const CandidateWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token    = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user     = userJson ? JSON.parse(userJson) : null;

  // ── Workspace state ───────────────────────────────────────────
  const [activeStage, setActiveStage]   = useState(searchParams.get('stage') || '');
  const [selectedId,  setSelectedId]    = useState<string | null>(searchParams.get('candidate'));
  const [stageCounts, setStageCounts]   = useState<Record<string, number>>({});
  const [panelOpen,   setPanelOpen]     = useState(!!searchParams.get('candidate'));
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

  // Listen for external URL changes (back/forward navigation)
  useEffect(() => {
    const stageParam = searchParams.get('stage') || '';
    const candParam = searchParams.get('candidate');
    
    setActiveStage(stageParam);
    setSelectedId(candParam);
    setPanelOpen(!!candParam);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="workspace-root">
      {/* ── TOP BAR ─────────────────────────────────────────── */}
      <header className="workspace-topbar">
        <Link to="/" className="workspace-topbar__logo" aria-label="HireTrack home">
          Hire<span className="gradient-text">Track</span>
        </Link>

        {user && (
          <span className="workspace-topbar__role-badge">
            {user.role.toUpperCase()}
          </span>
        )}

        <nav className="workspace-topbar__nav" aria-label="Main navigation">
          <Link to="/recruiter/jobs"       className="workspace-topbar__link">Jobs</Link>
          <Link to="/recruiter/candidates" className="workspace-topbar__link workspace-topbar__link--active">
            Candidates
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin/interviews" className="workspace-topbar__link">My Interviews</Link>
          )}
          {user?.role === 'admin' && (
            <Link to="/admin/recruiters" className="workspace-topbar__link">Recruiters</Link>
          )}
        </nav>

        <div className="workspace-topbar__user">
          <span className="workspace-topbar__user-name">{user?.name}</span>
          <button
            type="button"
            className="workspace-topbar__signout"
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="workspace-contextbar">
        <StageTabBar
          activeStage={activeStage}
          counts={stageCounts}
          onStageChange={handleStageChange}
        />
      </div>

      {/* ── TWO-PANEL BODY ───────────────────────────────────── */}
      <div className="workspace-body">
        {/* LEFT — Candidate List */}
        <aside className="workspace-left-panel">
          <CandidateList
            activeStage={activeStage}
            onCountsChange={handleCountsChange}
            selectedId={selectedId}
            onSelect={handleSelect}
            onRefreshReady={(fn) => { listRefreshRef.current = fn; }}
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
    </div>
  );
};
