import React from 'react';
import { CandidatePipelineDistribution as PipelineType } from '../../../../types/dashboard';
import styles from '../../dashboard.module.css';

interface Props {
  distribution: PipelineType[];
}

export const CandidatePipelineDistribution: React.FC<Props> = ({ distribution }) => {
  return (
    <div className={styles.widgetCard}>
      <h3 className={styles.widgetTitle}>Candidate Workload Distribution</h3>
      <p className={styles.widgetSubtitle}>Share of active candidate volume by workflow stage</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {distribution.map((item) => (
          <div key={item.stageKey} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ fontWeight: 700, color: 'var(--gray-text-primary)' }}>{item.label}</span>
              <span style={{ fontWeight: 600, color: 'var(--gray-text-muted)' }}>
                {item.count} candidates ({item.percentage}%)
              </span>
            </div>
            <div className={styles.funnelTrack} style={{ height: 8 }}>
              <div
                className={styles.funnelFill}
                style={{
                  width: `${Math.max(item.percentage, 4)}%`,
                  backgroundColor: getStageColor(item.stageKey)
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

function getStageColor(stageKey: string): string {
  switch (stageKey) {
    case 'applied': return '#0284c7';
    case 'screening': return '#7c3aed';
    case 'technical': return '#4f46e5';
    case 'hr': return '#d97706';
    case 'offer': return '#059669';
    case 'hired': return '#10b981';
    default: return 'var(--accent)';
  }
}
