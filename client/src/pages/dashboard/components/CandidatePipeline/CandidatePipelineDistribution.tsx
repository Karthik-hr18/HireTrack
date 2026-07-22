import React, { useState } from 'react';
import { CandidatePipelineDistribution as PipelineType } from '../../../../types/dashboard';
import styles from './CandidatePipelineDistribution.module.css';

interface Props {
  distribution: PipelineType[];
}

export const CandidatePipelineDistribution: React.FC<Props> = ({ distribution }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const colors = ['#0284c7', '#3b82f6', '#4f46e5', '#7c3aed', '#c026d3', '#059669', '#ef4444'];
  const totalCount = distribution.reduce((acc, item) => acc + item.count, 0) || 1;

  // Calculate SVG stroke dash offsets for Donut Chart
  const radius = 65;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className={styles.pieWidgetCard}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.topBadge}>VISUAL DISTRIBUTION</span>
          <h3 className={styles.widgetTitle}>Candidate Pipeline Distribution</h3>
          <p className={styles.widgetSubtitle}>Proportional candidate allocation by workflow stage</p>
        </div>
      </div>

      <div className={styles.pieContainer}>
        {/* SVG Donut Chart */}
        <div className={styles.donutSvgWrapper}>
          <svg viewBox="0 0 160 160" className={styles.donutSvg}>
            {distribution.map((item, idx) => {
              const pct = item.count / totalCount;
              const strokeDasharray = `${pct * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += pct;
              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={item.stageKey}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={colors[idx % colors.length]}
                  strokeWidth={isHovered ? 18 : 14}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className={styles.donutSegment}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center Glow Summary */}
          <div className={styles.donutCenterText}>
            <span className={styles.centerNumber}>{totalCount}</span>
            <span className={styles.centerLabel}>Candidates</span>
          </div>
        </div>

        {/* Legend List */}
        <div className={styles.legendList}>
          {distribution.map((item, idx) => {
            const isHovered = hoveredIdx === idx;
            const pct = Math.round((item.count / totalCount) * 100);

            return (
              <div
                key={item.stageKey}
                className={`${styles.legendRow} ${isHovered ? styles.legendRowHovered : ''}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <span className={styles.legendDot} style={{ backgroundColor: colors[idx % colors.length] }} />
                <span className={styles.legendStageName}>{item.label}</span>
                <span className={styles.legendMetrics}>
                  <strong>{item.count}</strong> ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
