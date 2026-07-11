import React from 'react';

// Maps every pipeline stage key to its display label
export const STAGE_LABELS: Record<string, string> = {
  applied:                        'Applied',
  resume_screening:               'Resume Screening',
  technical_interview_scheduled:  'Tech Interview Scheduled',
  technical_interview_completed:  'Tech Interview Completed',
  hr_interview_scheduled:         'HR Interview Scheduled',
  hr_interview_completed:         'HR Interview Completed',
  offer:                          'Offer Extended',
  hired:                          'Hired',
  rejected:                       'Rejected',
};

// Maps every stage key to its CSS badge class (defined in index.css)
export const STAGE_BADGE_CLASS: Record<string, string> = {
  applied:                        'badge-stage-applied',
  resume_screening:               'badge-stage-screening',
  technical_interview_scheduled:  'badge-stage-tech-scheduled',
  technical_interview_completed:  'badge-stage-tech-completed',
  hr_interview_scheduled:         'badge-stage-hr-scheduled',
  hr_interview_completed:         'badge-stage-hr-completed',
  offer:                          'badge-stage-offer',
  hired:                          'badge-stage-hired',
  rejected:                       'badge-stage-rejected',
};

interface StageBadgeProps {
  stage: string;
  /** Optional size variant */
  size?: 'sm' | 'md';
  className?: string;
}

export const StageBadge: React.FC<StageBadgeProps> = ({ stage, size = 'md', className = '' }) => {
  const label  = STAGE_LABELS[stage]  ?? stage.replace(/_/g, ' ').toUpperCase();
  const cls    = STAGE_BADGE_CLASS[stage] ?? 'badge-stage-default';
  const sizeClass = size === 'sm' ? 'badge-stage--sm' : '';

  return (
    <span className={`badge badge-stage ${cls} ${sizeClass} ${className}`.trim()}>
      {label}
    </span>
  );
};
