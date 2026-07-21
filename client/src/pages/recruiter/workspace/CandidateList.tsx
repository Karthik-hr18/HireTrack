// Lever-style CandidateList Component grouped by Stage Categories
import React, { useMemo } from 'react';
import { CandidateRow, Application } from './CandidateRow';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';
import { EmptyState } from '../../../components/ui/EmptyState';

interface CandidateListProps {
  applications: Application[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STAGE_CATEGORIES: Array<{
  id: string;
  label: string;
  matchStages: string[];
}> = [
  {
    id: 'applied_screening',
    label: 'RECRUITER SCREEN',
    matchStages: ['applied', 'resume_screening'],
  },
  {
    id: 'tech_interview',
    label: '1ST INTERVIEW (TECH)',
    matchStages: ['technical_interview', 'technical_interview_scheduled', 'technical_interview_completed'],
  },
  {
    id: 'hr_interview',
    label: '2ND INTERVIEW (HR)',
    matchStages: ['hr_interview', 'hr_interview_scheduled', 'hr_interview_completed'],
  },
  {
    id: 'offer',
    label: 'OFFER',
    matchStages: ['offer'],
  },
  {
    id: 'hired',
    label: 'HIRED',
    matchStages: ['hired'],
  },
  {
    id: 'rejected',
    label: 'REJECTED',
    matchStages: ['rejected'],
  },
];

export const CandidateList: React.FC<CandidateListProps> = ({
  applications,
  loading,
  error,
  selectedId,
  onSelect,
}) => {
  // Group applications into stage categories
  const groupedSections = useMemo(() => {
    const appsList = applications || [];
    const matchedIds = new Set<string>();

    const sections = STAGE_CATEGORIES.map((cat) => {
      const catApps = appsList.filter((app) => cat.matchStages.includes(app.stage));
      catApps.forEach((app) => matchedIds.add(app._id));
      return {
        id: cat.id,
        label: cat.label,
        apps: catApps,
      };
    }).filter((section) => section.apps.length > 0);

    // Any remaining unmapped apps fall back into an "OTHER" section
    const remainingApps = appsList.filter((app) => !matchedIds.has(app._id));
    if (remainingApps.length > 0) {
      sections.push({
        id: 'other',
        label: 'OTHER CANDIDATES',
        apps: remainingApps,
      });
    }

    return sections;
  }, [applications]);

  if (loading) {
    return <SkeletonLoader variant="list-row" count={6} />;
  }

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Failed to load candidates"
        description={error}
        action={{ label: 'Retry', onClick: () => window.location.reload() }}
      />
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="No candidates found"
        description="Try clearing search filters or choosing another job."
      />
    );
  }

  return (
    <div className="lever-candidate-list" role="listbox" aria-label="Candidates list">
      {groupedSections.map((section) => (
        <section key={section.id} className="lever-stage-section">
          {/* Stage Section Header (e.g. RECRUITER SCREEN) */}
          <div className="lever-stage-section__header">
            <span className="lever-stage-section__title">{section.label}</span>
            <span className="lever-stage-section__count">({section.apps.length})</span>
          </div>

          {/* Section Candidate Rows */}
          <div className="lever-stage-section__rows">
            {section.apps.map((app) => (
              <CandidateRow
                key={app._id}
                application={app}
                isSelected={selectedId === app._id}
                isStale={false}
                onClick={onSelect}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="lever-candidate-list__footer">
        Showing {applications.length} candidate{applications.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};
