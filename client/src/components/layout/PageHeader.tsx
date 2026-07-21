import React from 'react';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, actions }) => {
  return (
    <div className="page-header" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
      gap: 16,
      flexWrap: 'wrap'
    }}>
      <div>
        <h1 style={{
          fontSize: 24,
          fontWeight: 800,
          color: 'var(--gray-text-primary)',
          letterSpacing: '-0.02em',
          margin: 0
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{
            fontSize: 14,
            fontWeight: 400,
            color: 'var(--gray-text-muted)',
            marginTop: 4,
            marginBottom: 0
          }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {actions}
        </div>
      )}
    </div>
  );
};
