import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import styles from '../../dashboard.module.css';

interface Props {
  data?: unknown;
}

export const RecentApplications: React.FC<Props> = () => {
  const navigate = useNavigate();

  const recentApps = [
    { id: '1', name: 'Alex Morgan', role: 'Full-Stack Software Engineer', stage: 'Applied', timeAgo: '10m ago' },
    { id: '2', name: 'Alice Smith', role: 'Senior Backend Engineer', stage: 'Screening', timeAgo: '45m ago' },
    { id: '3', name: 'Bob Jones', role: 'Associate Product Manager', stage: 'Tech Interview', timeAgo: '2h ago' },
    { id: '4', name: 'Emma Watson', role: 'Lead Product Designer', stage: 'Offer Extended', timeAgo: '4h ago' },
    { id: '5', name: 'David Miller', role: 'DevOps Specialist', stage: 'Applied', timeAgo: '6h ago' }
  ];

  return (
    <div className={styles.widgetCard} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>DAILY REVIEWS</span>
            <h3 className={styles.widgetTitle}>Recent Applications</h3>
            <p className={styles.widgetSubtitle}>Latest applicant submissions requiring initial evaluation</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/recruiter/candidates')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12,
              fontWeight: 700,
              color: '#0284c7',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer'
            }}
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recentApps.map((app) => (
            <div
              key={app.id}
              onClick={() => navigate('/recruiter/candidates')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 8,
                backgroundColor: '#f8fafc',
                border: '1px solid #f1f5f9',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                  {app.name.charAt(0)}
                </div>
                <div>
                  <strong style={{ fontSize: 13, color: '#0f172a', display: 'block', lineHeight: 1.2 }}>{app.name}</strong>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{app.role}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className="badge badge-hired" style={{ fontSize: 10, padding: '2px 8px' }}>
                  {app.stage}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{app.timeAgo}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
