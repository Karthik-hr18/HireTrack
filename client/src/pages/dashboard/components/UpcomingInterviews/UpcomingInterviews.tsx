import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { InterviewScheduleItem } from '../../../../types/dashboard';
import styles from '../../dashboard.module.css';

interface Props {
  interviews: InterviewScheduleItem[];
}

export const UpcomingInterviews: React.FC<Props> = ({ interviews }) => {
  return (
    <div className={styles.widgetCard}>
      <h3 className={styles.widgetTitle}>
        <span>Upcoming Interview Schedule</span>
        <Link to="/admin/interviews" style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>
          View Schedule →
        </Link>
      </h3>
      <p className={styles.widgetSubtitle}>Assigned screening panels and live evaluation sessions</p>

      {interviews.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', backgroundColor: 'var(--gray-bg)', borderRadius: 12, border: '1px solid var(--gray-border)' }}>
          <CheckCircle2 size={32} style={{ color: '#10b981', marginBottom: 8 }} />
          <h4 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-text-primary)', margin: '0 0 4px 0' }}>
            You're All Caught Up!
          </h4>
          <p style={{ fontSize: 13, color: 'var(--gray-text-muted)', margin: '0 0 16px 0' }}>
            No interview sessions scheduled for today.
          </p>
          <Link to="/recruiter/candidates" className={styles.quickActionPrimary} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 8, textDecoration: 'none' }}>
            Review Candidates →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {interviews.map((iv) => (
            <div
              key={iv.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 14,
                borderRadius: 12,
                backgroundColor: 'var(--gray-bg)',
                border: '1px solid var(--gray-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 }}>
                  {iv.candidateName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-text-primary)' }}>
                    {iv.candidateName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-text-muted)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{iv.jobTitle}</span>
                    <span>•</span>
                    <span style={{ fontWeight: 700, color: iv.type === 'technical' ? 'var(--accent)' : '#059669' }}>
                      {iv.type === 'technical' ? 'Technical Round' : 'HR Round'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ textAlign: 'right', fontSize: 12 }}>
                  <div style={{ fontWeight: 700, color: 'var(--gray-text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} /> {new Date(iv.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ color: 'var(--gray-text-muted)' }}>
                    {new Date(iv.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <Link
                  to={`/admin/interviews/${iv.interviewId}/conduct`}
                  className={styles.quickActionPrimary}
                  style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  Conduct <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
