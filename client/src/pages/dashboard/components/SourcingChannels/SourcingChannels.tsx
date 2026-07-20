import React from 'react';
import { SourcingChannel } from '../../../../types/dashboard';
import styles from '../../dashboard.module.css';

interface Props {
  channels: SourcingChannel[];
}

export const SourcingChannels: React.FC<Props> = ({ channels }) => {
  return (
    <div className={styles.widgetCard}>
      <h3 className={styles.widgetTitle}>Candidate Sourcing Channels</h3>
      <p className={styles.widgetSubtitle}>Application submission volume breakdown by recruitment channel</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {channels.map((chan) => (
          <div key={chan.channel} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ fontWeight: 700, color: 'var(--gray-text-primary)' }}>{chan.channel}</span>
              <span style={{ fontWeight: 600, color: 'var(--gray-text-muted)' }}>
                {chan.count} applicants ({chan.percentage}%)
              </span>
            </div>
            <div className={styles.funnelTrack} style={{ height: 8 }}>
              <div
                className={styles.funnelFill}
                style={{
                  width: `${Math.max(chan.percentage, 4)}%`,
                  backgroundColor: '#4f46e5'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
