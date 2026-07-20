import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Clock, Send, ChevronRight } from 'lucide-react';
import { AttentionItem } from '../../../../types/dashboard';
import styles from '../../dashboard.module.css';

interface Props {
  items: AttentionItem[];
}

export const NeedsAttention: React.FC<Props> = ({ items }) => {
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return styles.statusCritical;
      case 'attention': return styles.statusAttention;
      case 'info': default: return styles.statusInfo;
    }
  };

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle size={18} />;
      case 'attention': return <Clock size={18} />;
      case 'info': default: return <Send size={18} />;
    }
  };

  return (
    <div className={styles.widgetCard}>
      <h3 className={styles.widgetTitle}>
        <span>Needs Attention — Priority Action Center</span>
        <span style={{ fontSize: 12, color: 'var(--gray-text-muted)', fontWeight: 600 }}>
          High Priority Tasks
        </span>
      </h3>
      <p className={styles.widgetSubtitle}>Operational bottlenecks requiring immediate team resolution</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item) => (
          <div
            key={item.id}
            className={getSeverityStyle(item.severity)}
            style={{
              padding: '14px 18px',
              borderRadius: 12,
              border: '1px solid',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {getIcon(item.severity)}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
                  {item.count} {item.title}
                </div>
                <div style={{ fontSize: 12, opacity: 0.85, margin: 0 }}>
                  {item.subtitle}
                </div>
              </div>
            </div>

            <Link
              to={item.actionUrl}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 12,
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              Resolve <ChevronRight size={14} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};
