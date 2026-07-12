import React from 'react';
import { AvatarInitials } from '../../../components/ui/AvatarInitials';

// The pipeline stages that make up Kanban columns
const KANBAN_STAGES = [
  { key: 'applied', label: 'Applied' },
  { key: 'resume_screening', label: 'Screening' },
  { key: 'technical_interview_scheduled', label: 'Tech Scheduled' },
  { key: 'technical_interview_completed', label: 'Tech Done' },
  { key: 'hr_interview_scheduled', label: 'HR Scheduled' },
  { key: 'hr_interview_completed', label: 'HR Done' },
  { key: 'offer', label: 'Offer' },
  { key: 'hired', label: 'Hired' },
  { key: 'rejected', label: 'Rejected' }
] as const;

export interface KanbanApplication {
  _id: string;
  stage: string;
  updatedAt: string;
  candidate: { name: string; email: string } | null;
  job: { title: string } | null;
}

interface KanbanBoardProps {
  applications: KanbanApplication[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isStaleCheck: (app: KanbanApplication) => boolean;
}

export const KanbanBoard: React.FC<KanBoardProps> = ({
  applications,
  selectedId,
  onSelect,
  isStaleCheck,
}) => {
  // Group candidates by stage
  const columns = KANBAN_STAGES.map((col) => {
    const list = applications.filter((app) => app.stage === col.key);
    return {
      ...col,
      list
    };
  });

  return (
    <div className="kanban-board" aria-label="Kanban Board View">
      {columns.map((col) => (
        <div key={col.key} className="kanban-column" aria-label={`${col.label} Column`}>
          <div className="kanban-column__header">
            <span className="kanban-column__title">{col.label}</span>
            <span className="kanban-column__count">{col.list.length}</span>
          </div>

          <div className="kanban-column__cards">
            {col.list.map((app) => {
              const name = app.candidate?.name ?? 'Unknown';
              const jobTitle = app.job?.title ?? 'Position';
              const isSelected = selectedId === app._id;
              const isStale = isStaleCheck(app);

              let cardClass = 'kanban-card';
              if (isSelected) cardClass += ' kanban-card--selected';
              if (isStale) cardClass += ' kanban-card--stale';

              return (
                <button
                  key={app._id}
                  type="button"
                  className={cardClass}
                  onClick={() => onSelect(app._id)}
                  aria-selected={isSelected}
                >
                  <div className="kanban-card__top">
                    <span className="kanban-card__name">{name}</span>
                    {isStale && <span className="kanban-card__stale-warning" title="Stale Profile">⚠️</span>}
                  </div>
                  <div className="kanban-card__subtitle">{jobTitle}</div>
                  <div className="kanban-card__footer">
                    <AvatarInitials name={name} size={22} className="kanban-card__avatar" />
                    <span className="kanban-card__time">
                      {new Date(app.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </button>
              );
            })}
            {col.list.length === 0 && (
              <div className="kanban-column__empty">No candidates</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Workaround for board props name typo compilation check
type KanBoardProps = KanbanBoardProps;
