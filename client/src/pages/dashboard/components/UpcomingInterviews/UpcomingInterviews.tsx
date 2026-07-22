import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { InterviewScheduleItem } from '../../../../types/dashboard';
import styles from '../../dashboard.module.css';

interface Props {
  interviews: InterviewScheduleItem[];
}

export const UpcomingInterviews: React.FC<Props> = ({ interviews }) => {
  const userJson = localStorage.getItem('user');
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdminOrInterviewer = user?.role === 'admin' || user?.role === 'interviewer';

  return (
    <div className={styles.widgetCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>EVALUATION SCHEDULE</span>
          <h3 className={styles.widgetTitle}>Upcoming Interview Schedule</h3>
          <p className={styles.widgetSubtitle}>Assigned screening panels and live evaluation sessions</p>
        </div>
      </div>

      {interviews.length === 0 ? (
        <div style={{ padding: '32px 20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: 12, border: '1px solid #f1f5f9' }}>
          <CheckCircle2 size={32} style={{ color: '#10b981', marginBottom: 8 }} />
          <h4 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            No Pending Panels!
          </h4>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px 0' }}>
            No interview sessions scheduled for today.
          </p>
          <Link to="/recruiter/candidates" className={styles.quickActionPrimary} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 8, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            Review Candidates <ArrowRight size={14} />
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
                backgroundColor: '#f8fafc',
                border: '1px solid #f1f5f9'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800 }}>
                  {iv.candidateName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                    {iv.candidateName}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{iv.jobTitle}</span>
                    <span>•</span>
                    <span style={{ fontWeight: 700, color: iv.type === 'technical' ? '#0284c7' : '#059669' }}>
                      {iv.type === 'technical' ? 'Technical Round' : 'HR Round'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ textAlign: 'right', fontSize: 12 }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={12} /> {new Date(iv.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div style={{ color: '#64748b' }}>
                    {new Date(iv.scheduledAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {isAdminOrInterviewer ? (
                  <Link
                    to={`/admin/interviews/${iv.interviewId}/conduct`}
                    className={styles.quickActionPrimary}
                    style={{ padding: '6px 12px', fontSize: 12, borderRadius: 8, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                  >
                    Conduct <ArrowRight size={12} />
                  </Link>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 6,
                      backgroundColor: '#eff6ff',
                      color: '#1d4ed8',
                      border: '1px solid #bfdbfe'
                    }}
                  >
                    <Clock size={12} /> Scheduled
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
