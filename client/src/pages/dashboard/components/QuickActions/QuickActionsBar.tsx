import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, UserPlus, Calendar, Users, Briefcase, FileText } from 'lucide-react';
import { QuickActionItem } from '../../../../types/dashboard';
import styles from '../../dashboard.module.css';

interface Props {
  actions: QuickActionItem[];
}

export const QuickActionsBar: React.FC<Props> = ({ actions }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'PlusCircle': return <PlusCircle size={16} />;
      case 'UserPlus': return <UserPlus size={16} />;
      case 'Calendar': return <Calendar size={16} />;
      case 'Users': return <Users size={16} />;
      case 'Briefcase': return <Briefcase size={16} />;
      case 'FileText': default: return <FileText size={16} />;
    }
  };

  return (
    <div className={styles.quickActionsRow}>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gray-text-muted)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
        Quick Actions:
      </span>
      {actions.map((act) => (
        <Link
          key={act.id}
          to={act.url || '#'}
          className={`${styles.quickActionBtn} ${act.primary ? styles.quickActionPrimary : ''}`}
        >
          {getIcon(act.icon)}
          <span>{act.label}</span>
        </Link>
      ))}
    </div>
  );
};
