import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { CandidateRow, Application } from './CandidateRow';
import { FilterDropdown } from './FilterDropdown';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { EmptyState } from '../../../components/ui/EmptyState';

const STALE_THRESHOLD_DAYS = 7;
const STALE_STAGES = ['resume_screening'];
const DEBOUNCE_MS = 300;

function isStaleApplication(app: Application): boolean {
  if (!STALE_STAGES.includes(app.stage)) return false;
  const daysSinceUpdate =
    (Date.now() - new Date(app.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceUpdate > STALE_THRESHOLD_DAYS;
}

interface FilterState {
  source: string;
  jobId: string;
}

interface Job {
  _id: string;
  title: string;
  location: string;
}

interface CandidateListProps {
  /** The currently active stage filter ('' = All) */
  activeStage: string;
  /** Callback fired when the loaded stage counts change (for StageTabBar) */
  onCountsChange: (counts: Record<string, number>) => void;
  /** Currently selected candidate ID */
  selectedId: string | null;
  onSelect: (id: string) => void;
  /** Passes the refresh function up so parent can trigger a reload */
  onRefreshReady?: (refreshFn: () => void) => void;
  /** Callback fired when applications are successfully fetched */
  onApplicationsLoad?: (apps: Application[]) => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  activeStage,
  onCountsChange,
  selectedId,
  onSelect,
  onRefreshReady,
  onApplicationsLoad,
}) => {
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL || '';

  // ── Data states ──────────────────────────────────────────────
  const [allApplications, setAllApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── UI states ────────────────────────────────────────────────
  const [searchRaw, setSearchRaw] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({ source: '', jobId: '' });
  const [filterOpen, setFilterOpen] = useState(false);
  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Debounce search ─────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchRaw.trim()), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchRaw]);


  // ── Fetch ALL applications (high limit for client-side counts) ──
  const fetchApplications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ page: '1', limit: '200' });
      if (filters.jobId) params.append('jobId', filters.jobId);
      if (filters.source) params.append('source', filters.source);

      const res = await fetch(`${apiUrl}/api/applications?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load candidates');
      const data = await res.json();
      const apps = data.applications ?? [];
      setAllApplications(apps);
      onApplicationsLoad?.(apps);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token, apiUrl, filters.jobId, filters.source]);

  // ── Fetch jobs for filter dropdown ──────────────────────────
  useEffect(() => {
    if (!token) return;
    fetch(`${apiUrl}/api/jobs/manage`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setJobs(d.jobs ?? []))
      .catch(() => {});
  }, [token, apiUrl]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  // ── Expose refresh function to parent via onRefreshReady ────
  useEffect(() => {
    onRefreshReady?.(fetchApplications);
  }, [fetchApplications, onRefreshReady]);



  // ── Compute stage counts ────────────────────────────────────
  const counts = useMemo(() => {
    const map: Record<string, number> = { '': allApplications.length };
    for (const app of allApplications) {
      map[app.stage] = (map[app.stage] ?? 0) + 1;
    }
    return map;
  }, [allApplications]);

  useEffect(() => { onCountsChange(counts); }, [counts, onCountsChange]);

  // ── Client-side filter: stage + search ─────────────────────
  const visible = useMemo(() => {
    let list = allApplications;
    if (activeStage) list = list.filter((a) => a.stage === activeStage);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          (a.candidate?.name || '').toLowerCase().includes(q) ||
          (a.candidate?.email || '').toLowerCase().includes(q) ||
          (a.job?.title || '').toLowerCase().includes(q),
      );
    }
    return list;
  }, [allApplications, activeStage, search]);

  // Keyboard Navigation: Up/Down arrow to change candidate selection
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in notes/rationale inputs
      const tag = document.activeElement?.tagName.toLowerCase();
      if (tag === 'textarea' || (tag === 'input' && document.activeElement !== searchInputRef.current)) {
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (visible.length === 0) return;
        const currentIdx = visible.findIndex((app) => app._id === selectedId);
        const nextIdx = currentIdx + 1;
        if (nextIdx < visible.length) {
          onSelect(visible[nextIdx]._id);
        } else if (currentIdx === -1) {
          onSelect(visible[0]._id);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (visible.length === 0) return;
        const currentIdx = visible.findIndex((app) => app._id === selectedId);
        const prevIdx = currentIdx - 1;
        if (prevIdx >= 0) {
          onSelect(visible[prevIdx]._id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, selectedId, onSelect]);

  // ── Active filter chip count ────────────────────────────────
  const activeFilterCount = [filters.source, filters.jobId].filter(Boolean).length;

  // ── Clear all filters ────────────────────────────────────────
  const handleClear = () => {
    setFilters({ source: '', jobId: '' });
    setSearchRaw('');
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="candidate-list">
      {/* Search + filter row */}
      <div className="candidate-list__toolbar">
        <div className="search-bar">
          <span className="search-bar__icon">🔍</span>
          <input
            ref={searchInputRef}
            type="text"
            className="search-bar__input"
            placeholder="Search candidates…"
            value={searchRaw}
            onChange={(e) => setSearchRaw(e.target.value)}
            aria-label="Search candidates"
          />
          {searchRaw && (
            <button
              className="search-bar__clear"
              onClick={() => setSearchRaw('')}
              type="button"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="candidate-list__filter-wrap">
          <button
            ref={filterBtnRef}
            type="button"
            className={`filter-btn ${filterOpen ? 'filter-btn--active' : ''} ${activeFilterCount > 0 ? 'filter-btn--has-filters' : ''}`}
            onClick={() => setFilterOpen((v) => !v)}
            aria-label="Open filters"
            aria-expanded={filterOpen}
          >
            ⚙ Filters
            {activeFilterCount > 0 && (
              <span className="filter-btn__badge">{activeFilterCount}</span>
            )}
          </button>

          <FilterDropdown
            isOpen={filterOpen}
            onClose={() => setFilterOpen(false)}
            filters={filters}
            jobs={jobs}
            onChange={setFilters}
            onClear={handleClear}
          />
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="candidate-list__chips">
          {filters.jobId && (
            <span className="filter-chip">
              {jobs.find((j) => j._id === filters.jobId)?.title ?? 'Job'}
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...f, jobId: '' }))}
                aria-label="Remove job filter"
              >
                ✕
              </button>
            </span>
          )}
          {filters.source && (
            <span className="filter-chip">
              {filters.source.replace(/_/g, ' ')}
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...f, source: '' }))}
                aria-label="Remove source filter"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}

      {/* List content */}
      <div className="candidate-list__scroll" role="listbox" aria-label="Candidates">
        {loading ? (
          <SkeletonLoader variant="list-row" count={6} />
        ) : error ? (
          <EmptyState
            icon="⚠️"
            title="Failed to load candidates"
            description={error}
            action={{ label: 'Retry', onClick: fetchApplications }}
          />
        ) : visible.length === 0 ? (
          search ? (
            <EmptyState
              icon="🔍"
              title={`No results for "${search}"`}
              description="Try adjusting your search or clearing the filters."
              action={{ label: 'Clear Search', onClick: () => setSearchRaw('') }}
            />
          ) : activeStage ? (
            <EmptyState
              icon="○"
              title="No candidates in this stage"
              description="Try a different pipeline stage or clear the stage filter."
              action={{ label: 'View All', onClick: () => {} }}
            />
          ) : (
            <EmptyState
              icon="📋"
              title="No candidates yet"
              description="Share a job link to start receiving applications."
            />
          )
        ) : (
          visible.map((app) => (
            <CandidateRow
              key={app._id}
              application={app}
              isSelected={selectedId === app._id}
              isStale={isStaleApplication(app)}
              onClick={onSelect}
            />
          ))
        )}
      </div>

      {/* Footer count */}
      {!loading && !error && (
        <div className="candidate-list__footer">
          {visible.length} candidate{visible.length !== 1 ? 's' : ''}
          {activeStage || search || activeFilterCount > 0 ? ' (filtered)' : ''}
        </div>
      )}
    </div>
  );
};
