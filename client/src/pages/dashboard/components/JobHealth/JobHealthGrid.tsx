import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { JobHealthItem } from '../../../../types/dashboard';
import styles from '../../dashboard.module.css';

interface Props {
  jobs: JobHealthItem[];
}

export const JobHealthGrid: React.FC<Props> = ({ jobs }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'fully_staffed':
        return <span className={`${styles.kpiTrendBadge} ${styles.statusHealthy}`}><CheckCircle2 size={12} /> Fully Staffed</span>;
      case 'overstaffed':
        return <span className={`${styles.kpiTrendBadge}`} style={{ backgroundColor: '#f3e8ff', color: '#6b21a8', border: '1px solid #d8b4fe' }}><CheckCircle2 size={12} /> Overstaffed</span>;
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
      <p className={styles.widgetSubtitle}>Operational status ratings and candidate throughput for open requisitions (Click card to view employees)</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {jobs.map((job) => {
          const reqCount = job.requiredHeadcount || 5;

          return (
            <div
              key={job.id}
              onClick={() => navigate(`/recruiter/employees?jobId=${job.id}`)}
              style={{
                padding: 16,
                borderRadius: 12,
                backgroundColor: 'var(--gray-bg)',
                border: '1px solid var(--gray-border)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12,
                cursor: 'pointer',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
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
                  <strong style={{ color: job.hiresCount >= reqCount ? '#10b981' : '#0284c7' }}>
                    {job.hiresCount}/{reqCount}
                  </strong> Hires
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
