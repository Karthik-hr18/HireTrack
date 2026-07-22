// Lever-style CandidateRow Component (Production Quality UI Polish)
import React from 'react';
import { Calendar, FileText, Send, CheckCircle2 } from 'lucide-react';
import { AvatarInitials } from '../../../components/ui/AvatarInitials';

export interface Application {
  _id: string;
  candidate: { name: string; email: string } | null;
  job: { _id: string; title: string; location: string } | null;
  stage: string;
  source: string;
  experience: number;
  updatedAt: string;
  createdAt: string;
}

interface CandidateRowProps {
  application: Application;
  isSelected: boolean;
  isStale: boolean;
  onClick: (id: string) => void;
}

export const renderSourceBadge = (source?: string) => {
  const src = (source || 'careers_page').toLowerCase();
  let bg = '#f8fafc';
  let border = '#e2e8f0';
  let color = '#475569';
  let label = 'Careers Page';

  if (src === 'referral') {
    bg = '#f0f9ff';
    border = '#bae6fd';
    color = '#0284c7';
    label = 'Referral';
  } else if (src === 'linkedin') {
    bg = '#eff6ff';
    border = '#bfdbfe';
    color = '#1d4ed8';
    label = 'LinkedIn';
  } else if (src === 'agency') {
    bg = '#faf5ff';
    border = '#e9d5ff';
    color = '#7e22ce';
    label = 'Agency';
  } else if (src === 'campus') {
    bg = '#ecfdf5';
    border = '#a7f3d0';
    color = '#047857';
    label = 'Campus';
  } else if (src === 'direct' || src === 'recruiter_added') {
    bg = '#fff7ed';
    border = '#fed7aa';
    color = '#c2410c';
    label = 'Direct';
  } else if (src === 'naukri') {
    bg = '#f0fdf4';
    border = '#bbf7d0';
    color = '#15803d';
    label = 'Naukri';
  } else if (src === 'indeed') {
    bg = '#eef2ff';
    border = '#c7d2fe';
    color = '#4338ca';
    label = 'Indeed';
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 8px',
      borderRadius: 99,
      backgroundColor: bg,
      border: `1px solid ${border}`,
      color: color,
      fontSize: 10.5,
      fontWeight: 700,
      whiteSpace: 'nowrap'
    }}>
      {label}
    </span>
  );
};

export const CandidateRow: React.FC<CandidateRowProps> = ({
  application,
  isSelected,
  onClick,
}) => {
  const name     = application.candidate?.name  || 'Unknown Candidate';
  const email    = application.candidate?.email || 'Candidate';
  const jobTitle = application.job?.title       || 'General Role';
  const location = application.job?.location    || 'San Francisco';

  const getActionContent = (stage: string) => {
    switch (stage) {
      case 'resume_screening':
        return <><Calendar size={13} /> Schedule</>;
      case 'technical_interview':
      case 'hr_interview':
        return <><FileText size={13} /> Scorecard</>;
      case 'offer':
        return <><Send size={13} /> Send Offer</>;
      case 'hired':
        return <><CheckCircle2 size={13} /> Hired</>;
      default:
        return <><Calendar size={13} /> Review</>;
    }
  };

  return (
    <div
      className={`lever-candidate-row ${isSelected ? 'is-selected' : ''}`}
      onClick={() => onClick(application._id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(application._id); }}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 52,
        padding: '0 16px',
        borderRadius: 8,
        backgroundColor: isSelected ? '#e0f2fe' : '#ffffff',
        border: isSelected ? '1px solid #7dd3fc' : '1px solid #e2e8f0',
        marginBottom: 6,
        cursor: 'pointer',
        transition: 'all 150ms cubic-bezier(0.16, 1, 0.3, 1)',
        boxSizing: 'border-box'
      }}
    >
      <div className="lever-candidate-row__left" style={{ display: 'flex', alignItems: 'center', gap: 12, flex: '0 0 280px' }}>
        <AvatarInitials name={name} size={32} />
        <div className="lever-candidate-row__identity" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <span className="lever-candidate-row__name" style={{ fontSize: 13.5, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
          <span className="lever-candidate-row__sub" style={{ fontSize: 11.5, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email}</span>
        </div>
      </div>

      <div className="lever-candidate-row__role" style={{ flex: '1 1 200px', fontSize: 13, fontWeight: 600, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{jobTitle}</span>
        {renderSourceBadge(application.source)}
      </div>

      <div className="lever-candidate-row__location" style={{ flex: '0 0 160px', fontSize: 12, color: '#64748b' }}>
        <span>Full-Time · {location}</span>
      </div>

      <div className="lever-candidate-row__action" style={{ flexShrink: 0 }}>
        <button
          type="button"
          className="lever-action-btn"
          onClick={(e) => {
            e.stopPropagation();
            onClick(application._id);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 32,
            padding: '0 12px',
            borderRadius: 6,
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#0284c7',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
        >
          {getActionContent(application.stage)}
        </button>
      </div>
    </div>
  );
};
