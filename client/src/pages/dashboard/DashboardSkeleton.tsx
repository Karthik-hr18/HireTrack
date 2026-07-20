import React from 'react';
import styles from './dashboard.module.css';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className={styles.dashboardContainer}>
      {/* Header Skeleton */}
      <div className={styles.workspaceHeader}>
        <div className={styles.headerTopRow}>
          <div>
            <div className={styles.skeletonBox} style={{ width: 220, height: 28, marginBottom: 8 }} />
            <div className={styles.skeletonBox} style={{ width: 340, height: 16 }} />
          </div>
          <div className={styles.skeletonBox} style={{ width: 260, height: 38, borderRadius: 12 }} />
        </div>
      </div>

      {/* KPI Grid Skeleton */}
      <div className={styles.kpiGrid}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className={styles.kpiCard} style={{ height: 110 }}>
            <div className={styles.skeletonBox} style={{ width: 100, height: 14, marginBottom: 12 }} />
            <div className={styles.skeletonBox} style={{ width: 80, height: 32, marginBottom: 8 }} />
            <div className={styles.skeletonBox} style={{ width: 130, height: 12 }} />
          </div>
        ))}
      </div>

      {/* Layer 2 Skeleton */}
      <div className={styles.layerGrid2}>
        <div className={styles.widgetCard} style={{ height: 320 }}>
          <div className={styles.skeletonBox} style={{ width: 200, height: 20, marginBottom: 16 }} />
          <div className={styles.skeletonBox} style={{ width: '100%', height: 200 }} />
        </div>
        <div className={styles.widgetCard} style={{ height: 320 }}>
          <div className={styles.skeletonBox} style={{ width: 180, height: 20, marginBottom: 16 }} />
          <div className={styles.skeletonBox} style={{ width: '100%', height: 200 }} />
        </div>
      </div>
    </div>
  );
};
