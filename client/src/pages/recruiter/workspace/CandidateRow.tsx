import React from 'react';
import { AvatarInitials } from '../../../components/ui/AvatarInitials';
import { StageBadge } from '../../../components/ui/StageBadge';

export interface Application {
  _id: string;
  candidate: { name: string; email: string } | null;
  job: { _id: string; title: string; location: string } | null;
  stage: string;
  source: string;
  experience: number;
  updatedAt: string;
  createdAt: string;
}

interface CandidateRowProps {
  application: Application;
  isSelected: boolean;
  isStale: boolean;
  onClick: (id: string) => void;
}

function getRelativeTime(dateStr: string): string {
  const ms = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 2)  return 'just now';
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24)  return `${hr}h`;
  const d = Math.floor(hr / 24);
  if (d < 30)   return `${d}d`;
  return `${Math.floor(d / 30)}mo`;
}

export const CandidateRow: React.FC<CandidateRowProps> = ({
  application,
  isSelected,
  isStale,
  onClick,
}) => {
  const name    = application.candidate?.name  || 'Unknown Candidate';
  const jobTitle = application.job?.title       || 'Unknown Position';
  const relTime  = getRelativeTime(application.updatedAt);

  return (
    <button
      type="button"
      className={[
        'candidate-row',
        isSelected ? 'candidate-row--selected' : '',
        isStale    ? 'candidate-row--stale'    : '',
      ].filter(Boolean).join(' ')}
      onClick={() => onClick(application._id)}
      aria-pressed={isSelected}
      aria-label={`${name} — ${jobTitle}, ${(application.stage || 'applied').replace(/_/g, ' ')}`}
    >
      <AvatarInitials name={name} size={36} />

      <div className="candidate-row__body">
        <div className="candidate-row__top">
          <span className="candidate-row__name">{name}</span>
          <span className="candidate-row__time">
            {isStale && <span className="candidate-row__stale-icon" aria-label="Stale">⚠</span>}
            {relTime}
          </span>
        </div>
        <div className="candidate-row__subtitle">{jobTitle}</div>
        <StageBadge stage={application.stage} size="sm" />
      </div>
    </button>
  );
};
