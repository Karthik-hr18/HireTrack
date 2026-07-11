import React from 'react';

type SkeletonVariant =
  | 'list-row'        // Left panel candidate row
  | 'panel-header'    // Right panel sticky header
  | 'panel-content'   // Right panel tab content block
  | 'text-line'       // Generic single-line placeholder
  | 'text-block';     // Generic multi-line placeholder

interface SkeletonLoaderProps {
  variant: SkeletonVariant;
  /** Number of repeated skeleton items (for list-row and panel-content) */
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ variant, count = 1 }) => {
  if (variant === 'list-row') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-list-row">
            <div className="skeleton-avatar skeleton-pulse" />
            <div className="skeleton-list-row__body">
              <div className="skeleton-bar skeleton-pulse" style={{ width: '65%', height: 14 }} />
              <div className="skeleton-bar skeleton-pulse" style={{ width: '45%', height: 11, marginTop: 6 }} />
              <div className="skeleton-bar skeleton-pulse" style={{ width: '55%', height: 11, marginTop: 4 }} />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (variant === 'panel-header') {
    return (
      <div className="skeleton-panel-header">
        <div className="skeleton-bar skeleton-pulse" style={{ width: '40%', height: 22 }} />
        <div className="skeleton-bar skeleton-pulse" style={{ width: '60%', height: 14, marginTop: 8 }} />
        <div className="skeleton-bar skeleton-pulse" style={{ width: '50%', height: 12, marginTop: 6 }} />
      </div>
    );
  }

  if (variant === 'panel-content') {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="skeleton-panel-block">
            <div className="skeleton-bar skeleton-pulse" style={{ width: '30%', height: 12, marginBottom: 10 }} />
            <div className="skeleton-bar skeleton-pulse" style={{ width: '100%', height: 14 }} />
            <div className="skeleton-bar skeleton-pulse" style={{ width: '85%',  height: 14, marginTop: 6 }} />
            <div className="skeleton-bar skeleton-pulse" style={{ width: '70%',  height: 14, marginTop: 6 }} />
          </div>
        ))}
      </>
    );
  }

  if (variant === 'text-line') {
    return <div className="skeleton-bar skeleton-pulse" style={{ width: '100%', height: 14 }} />;
  }

  // text-block
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-bar skeleton-pulse" style={{ width: i % 3 === 2 ? '70%' : '100%', height: 14 }} />
      ))}
    </div>
  );
};
