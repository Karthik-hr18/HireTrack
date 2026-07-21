import React from 'react';
import { CandidateRow, Application } from './CandidateRow';
import { EmptyState } from '../../../components/ui/EmptyState';
import { SkeletonLoader } from '../../../components/ui/SkeletonLoader';

interface FilteredCandidateListProps {
  applications: Application[];
  loading: boolean;
  error?: string;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const FilteredCandidateList: React.FC<FilteredCandidateListProps> = ({
  applications,
  loading,
  error,
  selectedId,
  onSelect,
}) => {
  if (loading) {
    return (
      <div className="candidate-list">
        <SkeletonLoader variant="list-row" count={5} />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon="⚠️"
        title="Failed to load candidates"
        description={error}
      />
    );
  }

  if (applications.length === 0) {
    return (
      <EmptyState
        icon="🔍"
        title="No candidates"
        description="Try adjusting the filters or search term."
      />
    );
  }

  return (
    <div className="candidate-list">
      {applications.map((app) => (
        <CandidateRow
          key={app._id}
          application={app}
          isSelected={selectedId === app._id}
          isStale={false}
          onClick={onSelect}
        />
      ))}
    </div>
  );
};
