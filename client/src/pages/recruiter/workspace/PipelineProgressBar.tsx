import React from 'react';

// Ordered steps for the progress indicator
const STEPS = [
  { key: 'applied', label: 'Applied' },
  { key: 'resume_screening', label: 'Screening' },
  { key: 'tech_interview', label: 'Tech Interview' },
  { key: 'hr_interview', label: 'HR Interview' },
  { key: 'offer', label: 'Offer' },
  { key: 'terminal', label: 'Decision' }
] as const;

interface PipelineProgressBarProps {
  currentStage: string;
}

function getStepIndex(stage: string): number {
  switch (stage) {
    case 'applied':
      return 0;
    case 'resume_screening':
      return 1;
    case 'technical_interview_scheduled':
    case 'technical_interview_completed':
      return 2;
    case 'hr_interview_scheduled':
    case 'hr_interview_completed':
      return 3;
    case 'offer':
      return 4;
    case 'hired':
    case 'rejected':
      return 5;
    default:
      return 0;
  }
}

export const PipelineProgressBar: React.FC<PipelineProgressBarProps> = ({ currentStage }) => {
  const currentIndex = getStepIndex(currentStage);
  const isRejected = currentStage === 'rejected';

  return (
    <div className="pipeline-progress" aria-label="Pipeline Progression">
      <div className="pipeline-progress__track">
        <div 
          className="pipeline-progress__fill" 
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }} 
        />
      </div>

      <div className="pipeline-progress__steps">
        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          let circleClass = 'pipeline-progress__circle';

          if (isCompleted) {
            circleClass += ' pipeline-progress__circle--completed';
          } else if (isActive) {
            circleClass += ' pipeline-progress__circle--active';
            if (isRejected && step.key === 'terminal') {
              circleClass += ' pipeline-progress__circle--rejected';
            }
          }

          return (
            <div key={step.key} className="pipeline-progress__step">
              <div className={circleClass}>
                {isCompleted ? '✓' : idx + 1}
              </div>
              <span className="pipeline-progress__label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
