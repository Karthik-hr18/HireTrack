import React, { useRef, useEffect } from 'react';

interface FilterState {
  source: string;
  jobId: string;
}

interface Job {
  _id: string;
  title: string;
  location: string;
}

interface FilterDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  jobs: Job[];
  onChange: (next: FilterState) => void;
  onClear: () => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  isOpen,
  onClose,
  filters,
  jobs,
  onChange,
  onClear,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasActiveFilters = filters.source !== '' || filters.jobId !== '';

  return (
    <div className="filter-dropdown" ref={ref} role="dialog" aria-label="Filters">
      <div className="filter-dropdown__header">
        <span className="filter-dropdown__title">
          Filters
          {hasActiveFilters && <span className="filter-dropdown__active-dot" />}
        </span>
        <button
          className="filter-dropdown__clear-btn"
          onClick={() => { onClear(); }}
          type="button"
          disabled={!hasActiveFilters}
        >
          Clear All
        </button>
      </div>

      {/* Job filter */}
      <div className="filter-dropdown__section">
        <label className="filter-dropdown__label" htmlFor="fd-job">Job</label>
        <select
          id="fd-job"
          className="filter-dropdown__select"
          value={filters.jobId}
          onChange={(e) => onChange({ ...filters, jobId: e.target.value })}
        >
          <option value="">All Jobs</option>
          {jobs.map((j) => (
            <option key={j._id} value={j._id}>
              {j.title} — {j.location}
            </option>
          ))}
        </select>
      </div>

      {/* Source filter */}
      <div className="filter-dropdown__section">
        <label className="filter-dropdown__label" htmlFor="fd-source">
          Application Source
        </label>
        <select
          id="fd-source"
          className="filter-dropdown__select"
          value={filters.source}
          onChange={(e) => onChange({ ...filters, source: e.target.value })}
        >
          <option value="">Any Source</option>
          <option value="careers_page">Careers Page</option>
          <option value="linkedin">LinkedIn</option>
          <option value="indeed">Indeed</option>
          <option value="referral">Referral</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="filter-dropdown__footer">
        <button className="filter-dropdown__done api-btn" onClick={onClose} type="button">
          Apply
        </button>
      </div>
    </div>
  );
};
