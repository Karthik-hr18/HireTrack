import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { JobCard, JobItem } from './JobCard';
import { JobFilters, FilterState } from './JobFilters';
import { Frown } from 'lucide-react';
import { ScrollReveal } from '../../../components/ui/ScrollReveal';

interface OpenPositionsSectionProps {
  jobs: JobItem[];
}

export const OpenPositionsSection: React.FC<OpenPositionsSectionProps> = ({ jobs }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<FilterState>(() => ({
    search: searchParams.get('search') || '',
    department: searchParams.get('department') || '',
    location: searchParams.get('location') || '',
    type: searchParams.get('type') || '',
    experience: searchParams.get('experience') || '',
    sortBy: (searchParams.get('sortBy') as FilterState['sortBy']) || 'newest',
  }));

  const updateFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    const params: Record<string, string> = {};
    if (newFilters.search) params.search = newFilters.search;
    if (newFilters.department) params.department = newFilters.department;
    if (newFilters.location) params.location = newFilters.location;
    if (newFilters.type) params.type = newFilters.type;
    if (newFilters.experience) params.experience = newFilters.experience;
    if (newFilters.sortBy && newFilters.sortBy !== 'newest') params.sortBy = newFilters.sortBy;
    setSearchParams(params, { replace: true });
  };

  const handleClearFilters = () => {
    updateFilters({
      search: '',
      department: '',
      location: '',
      type: '',
      experience: '',
      sortBy: 'newest',
    });
  };

  // Derive unique departments & locations
  const departments = useMemo(() => {
    const set = new Set<string>();
    for (const j of jobs) {
      const lower = j.title.toLowerCase();
      if (lower.includes('engineer') || lower.includes('developer')) set.add('Engineering');
      else if (lower.includes('design') || lower.includes('ux')) set.add('Product & Design');
      else if (lower.includes('product') || lower.includes('pm')) set.add('Product Management');
      else if (lower.includes('sales') || lower.includes('business')) set.add('Sales & Business');
      else set.add('General');
    }
    return Array.from(set);
  }, [jobs]);

  const locations = useMemo(() => {
    const set = new Set<string>();
    for (const j of jobs) {
      if (j.location) set.add(j.location);
    }
    return Array.from(set);
  }, [jobs]);

  // Client-side filtering & sorting
  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    // Search query
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          (j.location && j.location.toLowerCase().includes(q))
      );
    }

    // Location
    if (filters.location) {
      result = result.filter((j) => j.location === filters.location);
    }

    // Experience
    if (filters.experience === 'fresher') {
      result = result.filter((j) => (j.minExperience || 0) === 0);
    } else if (filters.experience === 'mid') {
      result = result.filter((j) => (j.minExperience || 0) >= 1 && (j.minExperience || 0) <= 4);
    } else if (filters.experience === 'senior') {
      result = result.filter((j) => (j.minExperience || 0) >= 5);
    }

    // Sort
    if (filters.sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (filters.sortBy === 'experience') {
      result.sort((a, b) => (a.minExperience || 0) - (b.minExperience || 0));
    } else {
      // Default: newest first
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return result;
  }, [jobs, filters]);

  return (
    <section id="open-positions" style={{ padding: '80px 0', borderTop: '1px solid var(--gray-border)' }}>
      <div className="careers-container">
        <ScrollReveal>
          {/* Section Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 10 }}>
                Available Opportunities
              </p>
              <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--gray-text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Open Positions ({filteredJobs.length})
              </h2>
            </div>
            <p style={{ fontSize: 15, color: 'var(--gray-text-muted)', maxWidth: 460, margin: 0 }}>
              Explore opportunities across engineering, design, and operations. All roles include remote flexibility.
            </p>
          </div>

          {/* Filter Controls */}
          <JobFilters
            filters={filters}
            onChange={updateFilters}
            onClear={handleClearFilters}
            departments={departments}
            locations={locations}
            totalResults={filteredJobs.length}
          />

          {/* Job Grid or Empty State */}
          {filteredJobs.length > 0 ? (
            <div className="careers-job-grid">
              {filteredJobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <div 
              className="careers-card"
              style={{
                padding: '60px 24px',
                textAlign: 'center',
                maxWidth: 540,
                margin: '40px auto',
              }}
            >
              <div style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: 'var(--error)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <Frown size={28} />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-text-primary)', marginBottom: 10 }}>
                No roles match your filters
              </h3>
              <p style={{ fontSize: 14, color: 'var(--gray-text-muted)', marginBottom: 24 }}>
                Try loosening your search keywords or resetting active department and location filters.
              </p>
              <button
                type="button"
                className="btn-secondary-lg"
                onClick={handleClearFilters}
                style={{ padding: '10px 24px', fontSize: 14 }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </ScrollReveal>
      </div>
    </section>
  );
};
