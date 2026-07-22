import React, { useState } from 'react';
import { SourcingChannel } from '../../../../types/dashboard';
import styles from './SourcingChannels.module.css';

interface Props {
  channels: SourcingChannel[];
}

export const SourcingChannels: React.FC<Props> = ({ channels }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const colors = ['#0284c7', '#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  const totalCount = channels.reduce((acc, c) => acc + c.count, 0) || 1;

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  return (
    <div className={styles.channelsWidgetCard}>
      <div className={styles.headerRow}>
        <div>
          <span className={styles.topBadge}>CHANNEL ATTRIBUTION</span>
          <h3 className={styles.widgetTitle}>Candidate Sourcing Pie Breakdown</h3>
          <p className={styles.widgetSubtitle}>Application submission origin channels</p>
        </div>
      </div>

      <div className={styles.channelsContainer}>
        {/* SVG Pie / Donut */}
        <div className={styles.donutSvgWrapper}>
          <svg viewBox="0 0 160 160" className={styles.donutSvg}>
            {channels.map((chan, idx) => {
              const pct = chan.count / totalCount;
              const strokeDasharray = `${pct * circumference} ${circumference}`;
              const strokeDashoffset = -accumulatedPercent * circumference;
              accumulatedPercent += pct;
              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={chan.channel}
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

          <div className={styles.donutCenterText}>
            <span className={styles.centerNumber}>{totalCount}</span>
            <span className={styles.centerLabel}>Applicants</span>
          </div>
        </div>

        {/* Legend */}
        <div className={styles.legendList}>
          {channels.map((chan, idx) => {
            const isHovered = hoveredIdx === idx;
            const pct = Math.round((chan.count / totalCount) * 100);

            return (
              <div
                key={chan.channel}
                className={`${styles.legendRow} ${isHovered ? styles.legendRowHovered : ''}`}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                <span className={styles.legendDot} style={{ backgroundColor: colors[idx % colors.length] }} />
                <span className={styles.legendChannelName}>{chan.channel}</span>
                <span className={styles.legendMetrics}>
                  <strong>{chan.count}</strong> ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
