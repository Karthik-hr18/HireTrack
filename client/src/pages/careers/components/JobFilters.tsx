import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../../hooks/useDebounce';

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
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onChange({ ...filters, search: debouncedSearch });
    }
  }, [debouncedSearch]);

  const hasActiveFilters = 
    filters.search || 
    filters.department || 
    filters.location || 
    filters.type || 
    filters.experience || 
    filters.sortBy !== 'newest';

  return (
    <div 
      className="careers-filter-bar"
      style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.70) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 18,
        padding: 20,
        marginBottom: 32,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(16px)'
      }}
    >
      <div className="careers-filter-grid">
        {/* Search Input with 300ms Debounce */}
        <div className="careers-search-wrapper" style={{ position: 'relative', flex: 2, minWidth: 240 }}>
          <Search size={18} className="careers-search-icon" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#818cf8', pointerEvents: 'none' }} />
          <input
            type="text"
            className="careers-search-input"
            placeholder="Search roles, skills, keywords..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: '100%',
              height: 44,
              padding: '0 16px 0 42px',
              borderRadius: 12,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: 'rgba(9, 13, 22, 0.85)',
              fontSize: 14,
              color: '#ffffff',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Department Filter */}
        <select
          className="careers-filter-select"
          value={filters.department}
          onChange={(e) => onChange({ ...filters, department: e.target.value })}
          style={{
            flex: 1,
            minWidth: 140,
            height: 44,
            padding: '0 14px',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backgroundColor: 'rgba(9, 13, 22, 0.85)',
            fontSize: 13.5,
            color: '#ffffff',
            cursor: 'pointer'
          }}
        >
          <option value="" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>All Departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>{dept}</option>
          ))}
        </select>

        {/* Location Filter */}
        <select
          className="careers-filter-select"
          value={filters.location}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
          style={{
            flex: 1,
            minWidth: 140,
            height: 44,
            padding: '0 14px',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backgroundColor: 'rgba(9, 13, 22, 0.85)',
            fontSize: 13.5,
            color: '#ffffff',
            cursor: 'pointer'
          }}
        >
          <option value="" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc} style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>{loc}</option>
          ))}
        </select>

        {/* Employment Type */}
        <select
          className="careers-filter-select"
          value={filters.type}
          onChange={(e) => onChange({ ...filters, type: e.target.value })}
          style={{
            flex: 1,
            minWidth: 140,
            height: 44,
            padding: '0 14px',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backgroundColor: 'rgba(9, 13, 22, 0.85)',
            fontSize: 13.5,
            color: '#ffffff',
            cursor: 'pointer'
          }}
        >
          <option value="" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>All Types</option>
          <option value="full-time" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Full-time</option>
          <option value="part-time" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Part-time</option>
          <option value="contract" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Contract</option>
        </select>

        {/* Experience Level */}
        <select
          className="careers-filter-select"
          value={filters.experience}
          onChange={(e) => onChange({ ...filters, experience: e.target.value })}
          style={{
            flex: 1,
            minWidth: 140,
            height: 44,
            padding: '0 14px',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backgroundColor: 'rgba(9, 13, 22, 0.85)',
            fontSize: 13.5,
            color: '#ffffff',
            cursor: 'pointer'
          }}
        >
          <option value="" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>All Experience</option>
          <option value="fresher" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Freshers / Entry Level</option>
          <option value="mid" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Mid Level (1-4 Yrs)</option>
          <option value="senior" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Senior (5+ Yrs)</option>
        </select>

        {/* Sort By */}
        <select
          className="careers-filter-select"
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
          style={{
            flex: 1,
            minWidth: 140,
            height: 44,
            padding: '0 14px',
            borderRadius: 12,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            backgroundColor: 'rgba(9, 13, 22, 0.85)',
            fontSize: 13.5,
            color: '#ffffff',
            cursor: 'pointer'
          }}
        >
          <option value="newest" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Sort: Newest</option>
          <option value="title" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Sort: Title A-Z</option>
          <option value="experience" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>Sort: Min Experience</option>
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
              height: 44,
              padding: '0 14px',
              borderRadius: 12,
              border: '1px solid rgba(239, 68, 68, 0.4)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#fca5a5',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <X size={14} /> Clear ({totalResults} roles found)
          </button>
        )}
      </div>
    </div>
  );
};
