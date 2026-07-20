import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import styles from './dashboard.module.css';

interface Props {
  error: string;
  onRetry: () => void;
}

export const DashboardErrorBoundary: React.FC<Props> = ({ error, onRetry }) => {
  return (
    <div className={styles.dashboardContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
      <div className={styles.widgetCard} style={{ maxWidth: 520, textAlign: 'center', padding: 40 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <AlertCircle size={28} />
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-text-primary)', marginBottom: 8 }}>
          Unable to Load Workspace Metrics
        </h3>
        <p style={{ fontSize: 14, color: 'var(--gray-text-muted)', marginBottom: 24 }}>
          {error || 'An unexpected error occurred while syncing ATS operational analytics.'}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className={styles.quickActionPrimary}
          style={{ padding: '10px 24px', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <RefreshCw size={16} /> Retry Syncing Dashboard
        </button>
      </div>
    </div>
  );
};
