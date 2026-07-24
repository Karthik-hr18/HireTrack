import React from 'react';
import styles from './SkeletonLoader.module.css';

interface SkeletonLoaderProps {
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ count = 3 }) => {
  return (
    <div className="skeleton-container">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className={styles.skeletonCard}>
          <div className={styles.skeletonHeader}>
            <div className={styles.skeletonTitle} />
            <div className={styles.skeletonBadge} />
          </div>
          <div className={styles.skeletonText} />
          <div className={styles.skeletonText} style={{ width: '65%' }} />
          <div className={styles.skeletonMetaRow}>
            <div className={styles.skeletonMetaItem} />
            <div className={styles.skeletonMetaItem} />
            <div className={styles.skeletonMetaItem} />
          </div>
        </div>
      ))}
    </div>
  );
};
