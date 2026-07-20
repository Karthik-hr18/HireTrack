import React from 'react';
import { Briefcase, FileText, Users, Calendar, Send, Award, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { KPIItem } from '../../../../types/dashboard';
import styles from '../../dashboard.module.css';

interface Props {
  kpi: KPIItem;
}

export const KpiCard: React.FC<Props> = ({ kpi }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Briefcase': return <Briefcase size={18} style={{ color: 'var(--accent)' }} />;
      case 'FileText': return <FileText size={18} style={{ color: '#0284c7' }} />;
      case 'Users': return <Users size={18} style={{ color: '#7c3aed' }} />;
      case 'Calendar': return <Calendar size={18} style={{ color: '#d97706' }} />;
      case 'Send': return <Send size={18} style={{ color: '#059669' }} />;
      case 'Award': return <Award size={18} style={{ color: '#dc2626' }} />;
      case 'Clock': return <Clock size={18} style={{ color: '#4f46e5' }} />;
      case 'CheckCircle2': default: return <CheckCircle2 size={18} style={{ color: '#10b981' }} />;
    }
  };

  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiHeader}>
        <span className={styles.kpiLabel}>{kpi.label}</span>
        {getIcon(kpi.iconName)}
      </div>

      <div className={styles.kpiValue}>{kpi.value}</div>

      <div className={styles.kpiMetaRow}>
        {kpi.changePercent !== undefined && kpi.changePercent !== 0 && (
          <span className={`${styles.kpiTrendBadge} ${styles.kpiTrendPositive}`}>
            <TrendingUp size={12} />
            <span>+{kpi.changePercent}%</span>
          </span>
        )}
        <span className={styles.kpiTrendSubtext}>{kpi.changeLabel || 'vs last month'}</span>
      </div>
    </div>
  );
};
