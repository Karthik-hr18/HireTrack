import React from 'react';
import { StageBadge } from '../../../components/ui/StageBadge';

interface Application {
  _id: string;
  stage: string;
  rejectionReason?: string;
  rejectionNote?: string;
  candidate?: { name: string } | null;
}

interface ActiveInterview {
  _id: string;
  type: string;
  scheduledAt: string;
  interviewer?: { name: string } | null;
}

interface ActionCardProps {
  application: Application;
  activeInterview: ActiveInterview | null;
  isAdmin: boolean;
  isRecruiter: boolean;
  onAdvanceClick?: () => void;
  onRejectClick?: () => void;
  onScheduleClick?: () => void;
  submittingAction?: boolean;
}

const recruiterRestrictedStages = [
  'technical_interview_scheduled',
  'technical_interview_completed',
  'hr_interview_scheduled',
  'hr_interview_completed',
  'offer',
  'hired',
  'rejected'
];

export const ActionCard: React.FC<ActionCardProps> = ({
  application,
  activeInterview,
  isAdmin,
  isRecruiter,
  onAdvanceClick,
  onRejectClick,
  onScheduleClick,
  submittingAction = false
}) => {
  const current = application.stage;
  const isTerminal = ['hired', 'rejected'].includes(current);

  // Determine manual progression allowance (same logic as ApplicationDetailPage)
  const canAdvanceManually = !isTerminal && 
    (current === 'applied' || (current === 'hr_interview_completed' && isAdmin) || (current === 'offer' && isAdmin));

  const canRejectManually = !isTerminal && !(isRecruiter && recruiterRestrictedStages.includes(current));

  const getNextStageLabel = (stage: string) => {
    switch (stage) {
      case 'applied':
        return 'Screen Resume (Advance)';
      case 'hr_interview_completed':
        return 'Proceed to Offer';
      case 'offer':
        return 'Confirm Candidate Acceptance (Hired)';
      default:
        return '';
    }
  };

  if (current === 'rejected') {
    return (
      <div className="action-card action-card--rejected">
        <h4 className="action-card__title action-card__title--rejected">✗ Application Rejected</h4>
        <div className="action-card__details">
          {application.rejectionReason && (
            <div className="action-card__row">
              <span className="action-card__label">Reason:</span>
              <span className="action-card__value action-card__value--capitalize">
                {application.rejectionReason.replace(/_/g, ' ')}
              </span>
            </div>
          )}
          {application.rejectionNote && (
            <div className="action-card__row">
              <span className="action-card__label">Note:</span>
              <p className="action-card__note-text">{application.rejectionNote}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (current === 'hired') {
    return (
      <div className="action-card action-card--hired">
        <h4 className="action-card__title action-card__title--hired">🎉 Candidate Hired!</h4>
        <p className="action-card__desc">
          This application has successfully completed the hiring lifecycle.
        </p>
      </div>
    );
  }

  // Active scheduled interview display
  const showScheduledInfo = activeInterview && (current === 'technical_interview_scheduled' || current === 'hr_interview_scheduled');

  return (
    <div className="action-card">
      <div className="action-card__header">
        <span className="action-card__stage-prefix">Next Step in Stage:</span>
        <StageBadge stage={current} size="sm" />
      </div>

      {showScheduledInfo && activeInterview && (
        <div className="action-card__scheduled">
          <h5 className="action-card__scheduled-title">
            📅 Scheduled {(activeInterview.type || 'interview').toUpperCase()} Panel
          </h5>
          <div className="action-card__row">
            <span className="action-card__label">Interviewer:</span>
            <span className="action-card__value">{activeInterview.interviewer?.name ?? 'TBD'}</span>
          </div>
          <div className="action-card__row">
            <span className="action-card__label">Date/Time:</span>
            <span className="action-card__value">
              {new Date(activeInterview.scheduledAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      )}

      {/* Passive instruction texts */}
      {!isTerminal && !canAdvanceManually && !showScheduledInfo && (
        <p className="action-card__instruction">
          {current === 'resume_screening' && "Waiting for Technical Interview to be scheduled."}
          {current === 'technical_interview_scheduled' && `Waiting for ${activeInterview?.interviewer?.name || 'Admin'} to submit Technical Scorecard.`}
          {current === 'technical_interview_completed' && (
            isAdmin ? "Technical evaluation passed! Schedule HR Interview below." : "Technical evaluation passed! Waiting for Admin to schedule HR Interview."
          )}
          {current === 'hr_interview_scheduled' && `Waiting for ${activeInterview?.interviewer?.name || 'Admin'} to submit HR Scorecard.`}
          {isRecruiter && recruiterRestrictedStages.includes(current) && "Admin authorization required for stage progression updates."}
        </p>
      )}

      {/* Interactive options */}
      <div className="action-card__buttons">
        {/* If recruiter needs to schedule a Technical Interview, or Admin needs to schedule tech/HR interview */}
        {((current === 'resume_screening') || (current === 'technical_interview_completed' && isAdmin)) && onScheduleClick && (
          <button 
            onClick={onScheduleClick}
            className="api-btn action-card__btn-schedule"
            type="button"
            disabled={submittingAction}
          >
            📅 Schedule {current === 'resume_screening' ? 'Technical' : 'HR'} Interview
          </button>
        )}

        {canAdvanceManually && onAdvanceClick && (
          <button
            onClick={onAdvanceClick}
            className="api-btn"
            style={{ width: '100%' }}
            type="button"
            disabled={submittingAction}
          >
            {submittingAction ? 'Advancing stage...' : getNextStageLabel(current)} &rarr;
          </button>
        )}

        {canRejectManually && onRejectClick && (
          <button
            onClick={onRejectClick}
            className="action-card__btn-reject"
            type="button"
            disabled={submittingAction}
          >
            Reject Application
          </button>
        )}
      </div>
    </div>
  );
};
