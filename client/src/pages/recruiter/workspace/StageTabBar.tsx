import React from 'react';

export const PIPELINE_STAGES = [
  { key: '',                              label: 'All'          },
  { key: 'applied',                       label: 'Applied'      },
  { key: 'resume_screening',              label: 'Screening'    },
  { key: 'technical_interview_scheduled', label: 'Tech Sched.'  },
  { key: 'technical_interview_completed', label: 'Tech Done'    },
  { key: 'hr_interview_scheduled',        label: 'HR Sched.'    },
  { key: 'hr_interview_completed',        label: 'HR Done'      },
  { key: 'offer',                         label: 'Offer'        },
  { key: 'hired',                         label: 'Hired'        },
  { key: 'rejected',                      label: 'Rejected'     },
] as const;

interface StageTabBarProps {
  /** The currently active stage key. Empty string = All. */
  activeStage: string;
  /** Counts per stage key. Key '' = total count. */
  counts: Record<string, number>;
  onStageChange: (stage: string) => void;
}

export const StageTabBar: React.FC<StageTabBarProps> = ({
  activeStage,
  counts,
  onStageChange,
}) => {
  return (
    <nav className="stage-tab-bar" aria-label="Pipeline stage filter" role="tablist">
      {PIPELINE_STAGES.map(({ key, label }) => {
        const count  = counts[key] ?? 0;
        const isActive = activeStage === key;

        // Only render stages that have candidates or are All / the active one
        if (key !== '' && count === 0 && !isActive) return null;

        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            type="button"
            className={`stage-tab ${isActive ? 'stage-tab--active' : ''}`}
            onClick={() => onStageChange(key)}
          >
            {label}
            {count > 0 && (
              <span className="stage-tab__count">{count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
