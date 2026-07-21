// Lever-style CandidateRow Component
import React from 'react';
import { AvatarInitials } from '../../../components/ui/AvatarInitials';

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

function getActionText(stage: string): string {
  switch (stage) {
    case 'resume_screening': return '📅 SCHEDULE';
    case 'technical_interview': return '📋 SCORECARD';
    case 'hr_interview': return '📋 SCORECARD';
    case 'offer': return '✉ OFFER';
    case 'hired': return '✅ HIRED';
    default: return '📅 SCHEDULE';
  }
}

export const CandidateRow: React.FC<CandidateRowProps> = ({
  application,
  isSelected,
  onClick,
}) => {
  const name     = application.candidate?.name  || 'Unknown Candidate';
  const email    = application.candidate?.email || 'Candidate';
  const jobTitle = application.job?.title       || 'General Role';
  const location = application.job?.location    || 'San Francisco';
  const actionText = getActionText(application.stage);

  return (
    <div
      className={`lever-candidate-row ${isSelected ? 'is-selected' : ''}`}
      onClick={() => onClick(application._id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(application._id); }}
    >
      <div className="lever-candidate-row__left">
        <span className="lever-candidate-row__checkbox" />
        <AvatarInitials name={name} size={32} />
        <div className="lever-candidate-row__identity">
          <span className="lever-candidate-row__name">{name}</span>
          <span className="lever-candidate-row__sub">{email}</span>
        </div>
      </div>

      <div className="lever-candidate-row__role">
        <span>{jobTitle}</span>
      </div>

      <div className="lever-candidate-row__location">
        <span>Full-Time · {location}</span>
      </div>

      <div className="lever-candidate-row__action">
        <button
          type="button"
          className="lever-action-btn"
          onClick={(e) => {
            e.stopPropagation();
            onClick(application._id);
          }}
        >
          {actionText}
        </button>
      </div>
    </div>
  );
};
