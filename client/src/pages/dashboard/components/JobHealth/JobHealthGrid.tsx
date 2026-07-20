import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { JobHealthItem } from '../../../../types/dashboard';
import styles from '../../dashboard.module.css';

interface Props {
  jobs: JobHealthItem[];
}

export const JobHealthGrid: React.FC<Props> = ({ jobs }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className={`${styles.kpiTrendBadge} ${styles.statusHealthy}`}><CheckCircle2 size={12} /> Healthy</span>;
      case 'needs_sourcing':
        return <span className={`${styles.kpiTrendBadge} ${styles.statusAttention}`}><AlertCircle size={12} /> Needs Sourcing</span>;
      case 'critical': default:
        return <span className={`${styles.kpiTrendBadge} ${styles.statusCritical}`}><AlertCircle size={12} /> Critical Bottleneck</span>;
    }
  };

  return (
    <div className={styles.widgetCard}>
      <h3 className={styles.widgetTitle}>Job Health Matrix</h3>
      <p className={styles.widgetSubtitle}>Operational status ratings and candidate throughput for open requisitions</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {jobs.map((job) => (
          <div
            key={job.id}
            style={{
              padding: 16,
              borderRadius: 12,
              backgroundColor: 'var(--gray-bg)',
              border: '1px solid var(--gray-border)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 12
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent)' }}>
                  {job.department}
                </span>
                {getStatusBadge(job.status)}
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--gray-text-primary)', margin: '0 0 4px 0' }}>
                {job.title}
              </h4>
              <div style={{ fontSize: 12, color: 'var(--gray-text-muted)' }}>
                {job.location}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--gray-border)', paddingTop: 10, fontSize: 12 }}>
              <div>
                <strong>{job.applicantsCount}</strong> Applicants
              </div>
              <div>
                <strong>{job.interviewsCount}</strong> Interviews
              </div>
              <div>
                <strong>{job.hiresCount}</strong> Hires
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
