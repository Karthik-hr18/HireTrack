import React, { useState } from 'react';
import { Search, Calendar, Users, Send } from 'lucide-react';
import { QuickActionsBar } from '../QuickActions/QuickActionsBar';
import { QuickActionItem } from '../../../../types/dashboard';
import styles from '../../dashboard.module.css';

interface Props {
  userName: string;
  userRole: string;
  summary: {
    interviewsTodayCount: number;
    awaitingReviewCount: number;
    offersPendingCount: number;
  };
  quickActions: QuickActionItem[];
}

export const WorkspaceHeader: React.FC<Props> = ({
  userName,
  userRole,
  summary,
  quickActions
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={styles.workspaceHeader}>
      <div className={styles.headerTopRow}>
        <div>
          <h1 className={styles.greetingTitle}>
            Good Morning, {userName}
          </h1>
          <p className={styles.greetingSubtitle}>
            <strong style={{ textTransform: 'capitalize', color: 'var(--accent)' }}>{userRole}</strong>
          </p>
        </div>

        {/* Search Input Bar (⌘K / Ctrl+K trigger) */}
        <div className={styles.searchBarWrapper}>
          <Search size={16} style={{ color: 'var(--gray-text-muted)' }} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search candidates, job roles, or applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd className={styles.shortcutKbd}>⌘K</kbd>
        </div>
      </div>

      {/* Summary Pills Bar */}
      <div className={styles.summaryPillBar}>
        <div className={styles.summaryBadge}>
          <Calendar size={14} />
          <span>{summary.interviewsTodayCount} Interviews Today</span>
        </div>

        <div className={styles.summaryBadge} style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', color: '#b45309', borderColor: 'rgba(234, 179, 8, 0.25)' }}>
          <Users size={14} />
          <span>{summary.awaitingReviewCount} Awaiting Review</span>
        </div>

        <div className={styles.summaryBadge} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#047857', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
          <Send size={14} />
          <span>{summary.offersPendingCount} Offers Pending</span>
        </div>
      </div>

      {/* Role-Configured Quick Actions Toolbar */}
      <QuickActionsBar actions={quickActions} />
    </div>
  );
};
