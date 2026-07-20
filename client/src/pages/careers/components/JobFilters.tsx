import React from 'react';
import { Search, X } from 'lucide-react';

export interface FilterState {
  search: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  sortBy: 'newest' | 'title' | 'experience';
}

interface JobFiltersProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  onClear: () => void;
  departments: string[];
  locations: string[];
  totalResults: number;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  filters,
  onChange,
  onClear,
  departments,
  locations,
  totalResults,
}) => {
  const hasActiveFilters = 
    filters.search || 
    filters.department || 
    filters.location || 
    filters.type || 
    filters.experience || 
    filters.sortBy !== 'newest';

  return (
    <div className="careers-filter-bar">
      <div className="careers-filter-grid">
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 2, minWidth: 240 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-text-muted)' }} />
          <input
            type="text"
            className="careers-filter-input"
            style={{ paddingLeft: 40 }}
            placeholder="Search roles, skills, titles..."
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
          />
        </div>

        {/* Department Filter */}
        <select
          className="careers-filter-select"
          value={filters.department}
          onChange={(e) => onChange({ ...filters, department: e.target.value })}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>

        {/* Location Filter */}
        <select
          className="careers-filter-select"
          value={filters.location}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        {/* Employment Type */}
        <select
          className="careers-filter-select"
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value })}
        >
          <option value="">All Types</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="contract">Contract</option>
        </select>

        {/* Experience Level */}
        <select
          className="careers-filter-select"
          value={filters.experience}
          onChange={(e) => onChange({ ...filters, experience: e.target.value })}
        >
          <option value="">All Experience</option>
          <option value="fresher">Freshers / Entry Level</option>
          <option value="mid">Mid Level (1-4 Yrs)</option>
          <option value="senior">Senior (5+ Yrs)</option>
        </select>

        {/* Sort By */}
        <select
          className="careers-filter-select"
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
        >
          <option value="newest">Sort: Newest</option>
          <option value="title">Sort: Title A-Z</option>
          <option value="experience">Sort: Min Experience</option>
        </select>

        {/* Clear Trigger */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              height: 42,
              padding: '0 14px',
              borderRadius: 'var(--radius-default)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              color: 'var(--error)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <X size={14} /> Clear ({totalResults} roles found)
          </button>
        )}
      </div>
    </div>
  );
};
