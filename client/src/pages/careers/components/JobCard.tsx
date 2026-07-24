import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, ArrowUpRight, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

export interface JobItem {
  _id: string;
  title: string;
  location?: string;
  minExperience?: number;
  maxExperience?: number;
  description: string;
  requirements?: string;
  status?: string;
  createdAt?: string | Date;
  vacancies?: number;
  department?: string;
}

interface JobCardProps {
  job: JobItem;
}

export const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);

  // Infer department from title if not explicitly provided
  const getDepartment = (title: string, dept?: string) => {
    if (dept) return dept;
    const lower = title.toLowerCase();
    if (lower.includes('engineer') || lower.includes('developer') || lower.includes('architect') || lower.includes('backend') || lower.includes('frontend')) return 'Engineering';
    if (lower.includes('design') || lower.includes('ux') || lower.includes('ui')) return 'Product & Design';
    if (lower.includes('product') || lower.includes('pm')) return 'Product Management';
    if (lower.includes('sales') || lower.includes('account') || lower.includes('business')) return 'Sales & Business';
    if (lower.includes('customer') || lower.includes('support')) return 'Customer Success';
    if (lower.includes('recruiter') || lower.includes('hr') || lower.includes('people')) return 'People & HR';
    return 'General';
  };

  const department = getDepartment(job.title, job.department);
  
  // Format posted time
  const formatTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently posted';
    const date = new Date(dateStr);
    const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 'Posted today';
    if (days === 1) return 'Posted yesterday';
    return `Posted ${days}d ago`;
  };

  // Derive mock salary band based on experience for realistic SaaS feel
  const getSalaryBand = (minExp?: number) => {
    const min = (minExp || 0) * 20 + 80;
    const max = min + 40;
    return `$${min}k – $${max}k`;
  };

  return (
    <div className="careers-job-card-wrapper">
      {/* MOBILE COLLAPSIBLE RECTANGLE BAR */}
      <div 
        className="careers-job-card-mobile-bar"
        onClick={() => setIsExpandedMobile(!isExpandedMobile)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, overflow: 'hidden' }}>
          <span style={{
            fontSize: 15,
            fontWeight: 700,
            color: 'var(--gray-text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {job.title}
          </span>
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            color: 'var(--accent)',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}>
            {job.location || 'Remote'}
          </span>
        </div>
        <button
          type="button"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center'
          }}
          aria-label={isExpandedMobile ? 'Collapse job details' : 'Expand job details'}
        >
          {isExpandedMobile ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* CARD CONTENT (Always visible on Desktop; Collapsible on Mobile) */}
      <div 
        className={`careers-card careers-card--hover ${isExpandedMobile ? 'is-expanded-mobile' : 'is-collapsed-mobile'}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 28,
          height: '100%',
          position: 'relative',
        }}
      >
        <div>
          {/* Top Badges */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span 
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '4px 10px',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                color: 'var(--accent)',
                border: '1px solid rgba(79, 70, 229, 0.15)',
              }}
            >
              {department}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              {job.vacancies && job.vacancies > 1 && (
                <span 
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    color: 'var(--accent)',
                    border: '1px solid rgba(79, 70, 229, 0.2)',
                  }}
                >
                  👥 {job.vacancies} Openings
                </span>
              )}
              <span 
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  color: 'var(--success)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                Open Role
              </span>
            </div>
          </div>

          {/* Job Title */}
          <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-text-primary)', marginBottom: 12, lineHeight: 1.3 }}>
            {job.title}
          </h3>

          {/* Metadata pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--gray-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={14} style={{ color: 'var(--accent)' }} />
              {job.location || 'Remote'}
            </span>

            <span style={{ fontSize: 13, color: 'var(--gray-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Briefcase size={14} style={{ color: 'var(--accent)' }} />
              {job.minExperience === 0 || job.minExperience === undefined ? 'Freshers Eligible' : `${job.minExperience}+ Yrs Exp`}
            </span>

            <span style={{ fontSize: 13, color: 'var(--gray-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <DollarSign size={14} style={{ color: 'var(--accent)' }} />
              {getSalaryBand(job.minExperience)}
            </span>
          </div>

          {/* Description snippet */}
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--gray-text-muted)', marginBottom: 20, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {job.description}
          </p>
        </div>

        {/* Footer & Actions */}
        <div style={{ borderTop: '1px solid var(--gray-border)', paddingTop: 16, marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--gray-text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Clock size={12} />
              {formatTimeAgo(typeof job.createdAt === 'string' ? job.createdAt : job.createdAt?.toISOString())}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-text-primary)' }}>
              Full-time
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 10 }}>
            <Link
              to={`/jobs/${job._id}`}
              className="btn-secondary-lg"
              style={{
                padding: '10px 14px',
                fontSize: 13,
                justifyContent: 'center',
                borderRadius: 'var(--radius-default)',
              }}
            >
              Details
            </Link>
            <Link
              to={`/jobs/${job._id}`}
              className="btn-primary-lg"
              style={{
                padding: '10px 14px',
                fontSize: 13,
                justifyContent: 'center',
                borderRadius: 'var(--radius-default)',
                boxShadow: 'none',
              }}
            >
              Apply <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
