// Lever ATS-Style JobGroupSidebar Component (UI/UX Polish matching Lever reference image)
import React, { useState } from 'react';

export interface JobGroupSidebarProps {
  groups: Array<{
    name: string;
    totalCount: number;
    jobs: Array<{
      id: string;
      title: string;
      candidateCount: number;
    }>;
  }>;
  selectedJobId?: string;
  expandedGroups: string[];
  onToggleGroup: (groupName: string) => void;
  onSelectJob: (jobId?: string) => void;
  loading: boolean;
  empty?: boolean;
}

export const JobGroupSidebar: React.FC<JobGroupSidebarProps> = ({
  groups,
  selectedJobId,
  expandedGroups,
  onToggleGroup,
  onSelectJob,
  loading,
}) => {
  const [jobSearch, setJobSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  if (loading) {
    return (
      <aside className="lever-sidebar lever-sidebar--loading" aria-label="Jobs loading">
        <div className="lever-sidebar__spinner">Loading jobs…</div>
      </aside>
    );
  }

  const allJobsCount = groups.reduce((sum, g) => sum + g.totalCount, 0);

  // Filter groups by search term if provided
  const filteredGroups = groups
    .map((g) => ({
      ...g,
      jobs: g.jobs.filter((j) => j.title.toLowerCase().includes(jobSearch.toLowerCase())),
    }))
    .filter((g) => g.jobs.length > 0 || !jobSearch);

  return (
    <aside className="lever-sidebar" aria-label="Job postings sidebar">
      {/* ── SIDEBAR HEADER (My jobs | Show all  Q Search  ↑↓) ── */}
      <div className="lever-sidebar__header">
        <span className="lever-sidebar__title">My jobs</span>
        <div className="lever-sidebar__header-actions">
          <button
            type="button"
            className="lever-sidebar__action-btn"
            onClick={() => {
              setJobSearch('');
              onSelectJob(undefined);
            }}
          >
            Show all
          </button>
          <button
            type="button"
            className="lever-sidebar__action-btn"
            onClick={() => setShowSearchInput((prev) => !prev)}
            title="Search jobs"
          >
            🔍 Search
          </button>
          <span className="lever-sidebar__sort-icon" title="Sort">↑↓</span>
        </div>
      </div>

      <div className="lever-sidebar__divider" />

      {/* Expandable Quick Search Input */}
      {(showSearchInput || jobSearch) && (
        <div className="lever-sidebar__search-box">
          <input
            type="text"
            placeholder="Filter jobs…"
            value={jobSearch}
            onChange={(e) => setJobSearch(e.target.value)}
            className="lever-sidebar__search-input"
            autoFocus
          />
        </div>
      )}

      {/* ── ALL JOBS OPTION (When job filter active) ── */}
      {selectedJobId && (
        <button
          type="button"
          className="lever-sidebar__all-item"
          onClick={() => onSelectJob(undefined)}
        >
          <span className="lever-sidebar__all-name">‹ All Jobs</span>
          <span className="lever-sidebar__count-num">{allJobsCount}</span>
        </button>
      )}

      {/* ── GROUPS & JOB LISTINGS (Compact Lever Style) ── */}
      <div className="lever-sidebar__groups">
        {filteredGroups.map((group) => {
          const isCollapsed = expandedGroups.includes(group.name);
          return (
            <div key={group.name} className="lever-sidebar__group">
              {/* Category Header with thin underline matching reference */}
              <div className="lever-sidebar__group-header-wrap">
                <button
                  type="button"
                  className="lever-sidebar__group-header"
                  onClick={() => onToggleGroup(group.name)}
                  aria-expanded={!isCollapsed}
                >
                  <span className="lever-sidebar__group-title">{group.name.toUpperCase()}</span>
                </button>
                <div className="lever-sidebar__group-line" />
              </div>

              {!isCollapsed && (
                <ul className="lever-sidebar__job-list">
                  {group.jobs.map((job) => {
                    const isSelected = selectedJobId === job.id;
                    return (
                      <li key={job.id} className="lever-sidebar__job-item">
                        <button
                          type="button"
                          className={`lever-sidebar__job-btn ${isSelected ? 'is-active' : ''}`}
                          onClick={() => onSelectJob(job.id)}
                        >
                          <span className={`lever-sidebar__dot ${isSelected ? 'lever-sidebar__dot--active' : ''}`} />
                          <span className="lever-sidebar__job-name" title={job.title}>
                            {job.title}
                          </span>
                          <span className="lever-sidebar__count-num">{job.candidateCount}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        {/* Muted "Show closed" link matching reference image */}
        <div className="lever-sidebar__show-closed-wrap">
          <button type="button" className="lever-sidebar__show-closed-btn">
            Show closed
          </button>
        </div>
      </div>

      {/* ── BOTTOM ACCORDIONS (Origin ˅, Tags ˅) ── */}
      <div className="lever-sidebar__filters">
        <div className="lever-sidebar__filter-divider" />
        <div className="lever-sidebar__filter-row">
          <span>Origin</span>
          <span className="lever-sidebar__chevron">˅</span>
        </div>
        <div className="lever-sidebar__filter-divider" />
        <div className="lever-sidebar__filter-row">
          <span>Tags</span>
          <span className="lever-sidebar__chevron">˅</span>
        </div>
      </div>
    </aside>
  );
};
