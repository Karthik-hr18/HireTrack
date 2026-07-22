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

  // Bottom Accordion state
  const [originOpen, setOriginOpen] = useState(false);
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
        >
          <span>Origin</span>
          {originOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
        
        <div className={styles.accordionDivider} />
        
        <div 
          className={styles.accordionRow}
          onClick={() => setTagsOpen((prev) => !prev)}
        >
          <span>Tags</span>
          {tagsOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>
    </aside>
  );
};
