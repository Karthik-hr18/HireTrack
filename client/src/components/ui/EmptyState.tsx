import React from 'react';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: EmptyStateAction;
  /** Optional extra className for the container */
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`.trim()} role="status" aria-live="polite">
      <span className="empty-state__icon" aria-hidden="true">
        {icon}
      </span>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__desc">{description}</p>
      {action && (
        <button
          className="api-btn empty-state__btn"
          onClick={action.onClick}
          type="button"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
