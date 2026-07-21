import React from 'react';

export interface PageContainerProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, style, className = '' }) => {
  return (
    <div 
      className={`page-container ${className}`}
      style={{
        width: '100%',
        maxWidth: 'min(1440px, calc(100vw - 64px))',
        margin: '0 auto',
        padding: '24px 0 48px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
    >
      {children}
    </div>
  );
};
