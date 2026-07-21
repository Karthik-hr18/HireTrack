import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Menu, X, Home, Users, Briefcase, Calendar, Settings, LogOut, Sparkles, BarChart2 } from 'lucide-react';
import { CandidateList } from './CandidateList';
import { StageTabBar } from './StageTabBar';
import { CandidateDetailPanel } from './CandidateDetailPanel';
import { KanbanBoard } from './KanbanBoard';
import { EmptyState } from '../../../components/ui/EmptyState';

export const CandidateWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const token    = localStorage.getItem('token');
  const userJson = localStorage.getItem('user');
  let user: any = null;
  try {
    user = userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    user = null;
  }
  const [menuOpen, setMenuOpen] = useState(false);

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



  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMenuOpen(false);
    navigate('/');
  };

  const isStaleApplication = (app: any): boolean => {
    if (app.stage !== 'resume_screening') return false;
    const daysSinceUpdate = (Date.now() - new Date(app.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 7;
  };

  return (
    <div className="workspace-root">
      {/* ── CONTEXT BAR (stage tabs, view toggle, and 3-bar Hamburger Menu) ──────────────── */}
      <div className="workspace-contextbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <StageTabBar
          activeStage={activeStage}
          counts={stageCounts}
          onStageChange={handleStageChange}
        />
        
        {/* Controls: View Mode Toggle + 3-BAR HAMBURGER MENU BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="view-mode-toggle" role="group" aria-label="View mode selector">
            <button 
              type="button"
              className={`view-mode-toggle__btn ${viewMode === 'list' ? 'view-mode-toggle__btn--active' : ''}`}
              onClick={() => handleViewModeChange('list')}
              title="List View"
            >
              List
            </button>
            <button 
              type="button"
              className={`view-mode-toggle__btn ${viewMode === 'kanban' ? 'view-mode-toggle__btn--active' : ''}`}
              onClick={() => handleViewModeChange('kanban')}
              title="Kanban Board View"
            >
              Board
            </button>
          </div>

          {/* 3-BAR HAMBURGER MENU BUTTON (EXCLUSIVELY FOR CANDIDATE PIPELINE) */}
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open Workspace Navigation Menu"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: 10,
              border: '1px solid var(--gray-border)',
              backgroundColor: 'var(--gray-surface)',
              color: 'var(--gray-text-primary)',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-card-subtle)',
              transition: 'all 0.15s ease',
            }}
            title="Candidate Pipeline Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* SIDE MENU DRAWER (SLIDE-OUT PANEL ON 3-BAR CLICK) */}
      {menuOpen && (
        <>
          <div 
            className="side-menu-overlay" 
            onClick={() => setMenuOpen(false)} 
            aria-hidden="true"
          />

          <aside className="side-menu-drawer" aria-label="Candidate Pipeline Navigation Menu">
            <div className="side-menu-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, fontWeight: 800, color: 'var(--gray-text-primary)' }}>
                <Sparkles size={18} style={{ color: 'var(--accent)' }} /> Pipeline Menu
              </div>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* User Info Pill */}
            <div className="side-menu-user-pill">
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-text-primary)', marginBottom: 2 }}>
                {user?.name || 'Recruiter'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray-text-muted)', marginBottom: 8 }}>
                {user?.email}
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                color: 'var(--accent)',
                border: '1px solid rgba(79, 70, 229, 0.15)'
              }}>
                {user?.role}
              </span>
            </div>

            {/* Side Menu List */}
            <nav className="side-menu-list">
              {/* HOME OPTION */}
              <Link 
                to="/" 
                className="side-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                <Home size={18} style={{ color: 'var(--accent)' }} />
                <span>Home (Careers)</span>
              </Link>

              {/* ANALYTICS DASHBOARD OPTION */}
              <Link 
                to="/dashboard" 
                className="side-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                <BarChart2 size={18} style={{ color: 'var(--accent)' }} />
                <span>Analytics Dashboard</span>
              </Link>

              <Link 
                to="/recruiter/candidates" 
                className="side-menu-item side-menu-item--active"
                onClick={() => setMenuOpen(false)}
              >
                <Users size={18} />
                <span>Candidate Pipeline</span>
              </Link>

              <Link 
                to="/recruiter/jobs" 
                className="side-menu-item"
                onClick={() => setMenuOpen(false)}
              >
                <Briefcase size={18} />
                <span>Manage Jobs</span>
              </Link>

              {user?.role === 'admin' && (
                <Link 
                  to="/admin/interviews" 
                  className="side-menu-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <Calendar size={18} />
                  <span>Assigned Interviews</span>
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link 
                  to="/admin/recruiters" 
                  className="side-menu-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <Settings size={18} />
                  <span>Manage Recruiters</span>
                </Link>
              )}
            </nav>

            {/* Sign Out Action */}
            <div style={{ borderTop: '1px solid var(--gray-border)', paddingTop: 16, marginTop: 'auto' }}>
              <button
                type="button"
                onClick={handleLogout}
                className="side-menu-item"
                style={{ width: '100%', color: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.08)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </>
      )}

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
