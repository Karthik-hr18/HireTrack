import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { HiringInsight } from '../../../../types/dashboard';
import styles from '../../dashboard.module.css';

interface Props {
  insights: HiringInsight[];
}

export const HiringInsights: React.FC<Props> = ({ insights }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'positive': return <TrendingUp size={16} style={{ color: '#047857' }} />;
      case 'warning': return <AlertTriangle size={16} style={{ color: '#b45309' }} />;
      case 'info': default: return <Info size={16} style={{ color: '#1d4ed8' }} />;
    }
  };

  return (
    <div className={styles.widgetCard}>
      <h3 className={styles.widgetTitle}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Sparkles size={18} style={{ color: 'var(--accent)' }} /> Operational Hiring Insights
        </span>
      </h3>
      <p className={styles.widgetSubtitle}>Actionable data takeaways to optimize team velocity and stage conversion</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {insights.map((ins) => (
          <div
            key={ins.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: 14,
              borderRadius: 12,
              backgroundColor: 'var(--gray-bg)',
              border: '1px solid var(--gray-border)',
              fontSize: 13,
              color: 'var(--gray-text-primary)'
            }}
          >
            <div style={{ marginTop: 2 }}>{getIcon(ins.type)}</div>
            <div style={{ lineHeight: 1.4, fontWeight: 500 }}>{ins.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
