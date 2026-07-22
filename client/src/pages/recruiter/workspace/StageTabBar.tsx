import React from 'react';

export const PIPELINE_STAGES = [
  { key: '',                              label: 'All'          },
  { key: 'resume_screening',              label: 'Screening'    },
  { key: 'technical_interview',           label: 'Technical'    },
  { key: 'hr_interview',                  label: 'HR Round'     },
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
        const count   = counts[key] ?? 0;
        const isActive = activeStage === key;
        // Show all tabs always — zero-count tabs are dimmed but stable (prevents height shift)
        const isEmpty  = key !== '' && count === 0;

        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            type="button"
            disabled={isEmpty && !isActive}
            className={`stage-tab ${isActive ? 'stage-tab--active' : ''} ${isEmpty ? 'stage-tab--empty' : ''}`}
            onClick={() => !isEmpty && onStageChange(key)}
            style={{ opacity: isEmpty ? 0.35 : 1, cursor: isEmpty ? 'default' : 'pointer' }}
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
