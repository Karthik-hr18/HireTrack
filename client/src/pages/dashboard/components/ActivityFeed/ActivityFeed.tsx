import React from 'react';
import { Activity, Clock } from 'lucide-react';
import { ActivityItem } from '../../../../types/dashboard';
import styles from '../../dashboard.module.css';

interface Props {
  activities: ActivityItem[];
}

export const ActivityFeed: React.FC<Props> = ({ activities }) => {
  return (
    <div className={styles.widgetCard}>
      <h3 className={styles.widgetTitle}>Live Activity Audit Stream</h3>
      <p className={styles.widgetSubtitle}>Real-time pipeline movements, interview schedules, and scorecards</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {activities.map((act) => (
          <div
            key={act.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              paddingBottom: 12,
              borderBottom: '1px solid var(--gray-border)'
            }}
          >
            <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(79, 70, 229, 0.08)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 2 }}>
              <Activity size={16} />
            </div>

            <div style={{ flex: 1, fontSize: 13 }}>
              <div style={{ color: 'var(--gray-text-primary)' }}>
                <strong>{act.actorName}</strong> {act.action} for <strong>{act.candidateName}</strong> {act.jobTitle ? `(${act.jobTitle})` : ''}
              </div>
              <div style={{ fontSize: 11, color: 'var(--gray-text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={11} /> {act.timeAgo}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
