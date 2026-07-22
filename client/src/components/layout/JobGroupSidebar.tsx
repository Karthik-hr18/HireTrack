// Lever ATS-Style JobGroupSidebar Component (UI/UX Polish matching Lever reference image)
import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import styles from './JobGroupSidebar.module.css';

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
  selectedSource?: string;
  expandedGroups: string[];
  onToggleGroup: (groupName: string) => void;
  onSelectJob: (jobId?: string) => void;
  onSelectSource?: (sourceKey?: string) => void;
  sourceCounts?: Record<string, number>;
  loading: boolean;
  empty?: boolean;
}

const ORIGIN_SOURCES = [
  { key: '',               label: 'All Sources' },
  { key: 'referral',       label: 'Referral' },
  { key: 'careers_page',   label: 'Careers Page' },
  { key: 'linkedin',       label: 'LinkedIn' },
  { key: 'agency',         label: 'Agency' },
  { key: 'campus',         label: 'Campus' },
  { key: 'direct',         label: 'Direct Sourcing' },
  { key: 'other',          label: 'Other' },
];

export const JobGroupSidebar: React.FC<JobGroupSidebarProps> = ({
  groups,
  selectedJobId,
  selectedSource,
  expandedGroups,
  onToggleGroup,
  onSelectJob,
  onSelectSource,
  sourceCounts = {},
  loading,
}) => {
  const [jobSearch, setJobSearch] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Bottom Accordion state
  const [originOpen, setOriginOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(false);

  if (loading) {
    return (
      <aside className={styles.sidebarContainer} aria-label="Jobs loading">
        <div className={styles.sidebarLoading}>Loading requisitions…</div>
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
    <aside className={styles.sidebarContainer} aria-label="Job postings sidebar">
      {/* ── SIDEBAR HEADER (My jobs | Show all  Q Search) ── */}
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarTitle}>My Jobs</span>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => {
              setJobSearch('');
              onSelectJob(undefined);
            }}
          >
            Show all
          </button>

          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => setShowSearchInput((prev) => !prev)}
            title="Search jobs"
          >
            <Search size={13} /> Search
          </button>
        </div>
      </div>

      {/* Expandable Quick Search Input */}
      {(showSearchInput || jobSearch) && (
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search job requisitions…"
            value={jobSearch}
            onChange={(e) => setJobSearch(e.target.value)}
            className={styles.searchInput}
            autoFocus
          />
        </div>
      )}

      {/* ── ALL JOBS OPTION (When job filter is active) ── */}
      {selectedJobId && (
        <button
          type="button"
          className={styles.allJobsItem}
          onClick={() => onSelectJob(undefined)}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={14} /> All Jobs
          </span>
          <span className={styles.countBadge}>{allJobsCount}</span>
        </button>
      )}

      {/* ── GROUPS & JOB LISTINGS (Compact Lever Style) ── */}
      <div className={styles.groupsScrollArea}>
        {filteredGroups.map((group) => {
          const isCollapsed = expandedGroups.includes(group.name);
          return (
            <div key={group.name} className={styles.groupBlock}>
              {/* Category Header with thin underline matching reference */}
              <div className={styles.groupHeaderWrap}>
                <button
                  type="button"
                  className={styles.groupHeaderBtn}
                  onClick={() => onToggleGroup(group.name)}
                  aria-expanded={!isCollapsed}
                >
                  <span className={styles.groupTitle}>{group.name.toUpperCase()}</span>
                  {isCollapsed ? <ChevronDown size={14} color="#94a3b8" /> : <ChevronUp size={14} color="#94a3b8" />}
                </button>
                <div className={styles.groupLine} />
              </div>

              {!isCollapsed && (
                <ul className={styles.jobList}>
                  {group.jobs.map((job) => {
                    const isSelected = selectedJobId === job.id;
                    return (
                      <li key={job.id} className={styles.jobItem}>
                        <button
                          type="button"
                          className={`${styles.jobBtn} ${isSelected ? styles.jobBtnActive : ''}`}
                          onClick={() => onSelectJob(job.id)}
                        >
                          <span className={`${styles.statusDot} ${isSelected ? styles.statusDotActive : styles.statusDotActive}`} />
                          <span className={styles.jobName} title={job.title}>
                            {job.title}
                          </span>
                          <span className={styles.countBadge}>{job.candidateCount}</span>
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
        <div className={styles.showClosedWrap}>
          <button type="button" className={styles.showClosedBtn}>
            Show closed requisitions
          </button>
        </div>
      </div>

      {/* ── BOTTOM ACCORDIONS (Origin & Tags) ── */}
      <div className={styles.bottomFilters}>
        <div 
          className={styles.accordionRow}
          onClick={() => setOriginOpen((prev) => !prev)}
          style={{ cursor: 'pointer' }}
        >
          <span style={{ fontWeight: 700, fontSize: 13, color: '#334155' }}>Origin</span>
          {originOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>

        {originOpen && (
          <div style={{ padding: '6px 0 10px 0', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {ORIGIN_SOURCES.map((src) => {
              const count = sourceCounts[src.key] ?? (src.key === '' ? sourceCounts[''] ?? 0 : 0);
              const isSelected = (selectedSource || '') === src.key;
              return (
                <button
                  key={src.key}
                  type="button"
                  onClick={() => onSelectSource?.(src.key || undefined)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: isSelected ? '#e0f2fe' : 'transparent',
                    color: isSelected ? '#0284c7' : '#475569',
                    fontSize: 12,
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 120ms ease',
                  }}
                >
                  <span>{src.label}</span>
                  {count > 0 && (
                    <span style={{ fontSize: 10.5, fontWeight: 700, padding: '1px 6px', borderRadius: 99, backgroundColor: isSelected ? '#0284c7' : '#f1f5f9', color: isSelected ? '#ffffff' : '#64748b' }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <div className={styles.accordionDivider} />

        <div 
          className={styles.accordionRow}
          onClick={() => setTagsOpen((prev) => !prev)}
          style={{ cursor: 'pointer' }}
        >
          <span style={{ fontWeight: 700, fontSize: 13, color: '#334155' }}>Tags</span>
          {tagsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>
    </aside>
  );
};
