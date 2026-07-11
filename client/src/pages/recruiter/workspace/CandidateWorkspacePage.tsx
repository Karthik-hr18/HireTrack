import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CandidateList } from './CandidateList';
import { StageTabBar } from './StageTabBar';
import { EmptyState } from '../../../components/ui/EmptyState';

export const CandidateWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const token    = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  const user     = userJson ? JSON.parse(userJson) : null;

  // Redirect unauthenticated users
  if (!token) {
    navigate('/login');
    return null;
  }

  // ── Workspace state ───────────────────────────────────────────
  const [activeStage, setActiveStage]   = useState('');
  const [selectedId,  setSelectedId]    = useState<string | null>(null);
  const [stageCounts, setStageCounts]   = useState<Record<string, number>>({});
  // Right panel panel open state (mobile only)
  const [panelOpen,   setPanelOpen]     = useState(false);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setPanelOpen(true);   // mobile: show panel
  };

  const handleDeselect = () => {
    setSelectedId(null);
    setPanelOpen(false);
  };

  const handleCountsChange = useCallback((counts: Record<string, number>) => {
    setStageCounts(counts);
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

      {/* ── CONTEXT BAR (stage tabs) ──────────────────────────── */}
      <div className="workspace-contextbar">
        <StageTabBar
          activeStage={activeStage}
          counts={stageCounts}
          onStageChange={(s) => {
            setActiveStage(s);
            setSelectedId(null);
            setPanelOpen(false);
          }}
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
          />
        </aside>

        {/* RIGHT — Candidate Detail Panel (placeholder for Phase 3) */}
        <main
          className={`workspace-right-panel ${panelOpen ? 'is-open' : ''}`}
          aria-label="Candidate detail"
        >
          {selectedId ? (
            <div className="workspace-right-placeholder">
              {/* Mobile back button */}
              <button
                type="button"
                className="workspace-right-back"
                onClick={handleDeselect}
                aria-label="Back to candidate list"
              >
                ← Back
              </button>
              <div style={{ padding: '2rem', color: 'var(--gray-text-muted)', fontSize: 14 }}>
                <strong style={{ color: 'var(--accent-hover)' }}>Phase 3:</strong>{' '}
                Candidate detail panel coming next.
                <br />
                Selected ID: <code style={{ opacity: 0.6 }}>{selectedId}</code>
              </div>
            </div>
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
