import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Users, TrendingUp, ArrowDownRight, CheckCircle2 } from 'lucide-react';
import { FunnelStage } from '../../../../types/dashboard';
import styles from './RecruitmentFunnel.module.css';

interface Props {
  funnel: FunnelStage[];
}

export const RecruitmentFunnel: React.FC<Props> = ({ funnel }) => {
  const navigate = useNavigate();
  const [hoveredStage, setHoveredStage] = useState<string | null>(null);

  const stageGradients: Record<string, string> = {
    applied: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    screening: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
    technical: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    hr: 'linear-gradient(135deg, #7c3aed 0%, #c026d3 100%)',
    offer: 'linear-gradient(135deg, #c026d3 0%, #0284c7 100%)',
    hired: 'linear-gradient(135deg, #0284c7 0%, #059669 100%)'
  };

  const stageIcons: Record<string, React.ReactNode> = {
    applied: <Users size={16} />,
    screening: <Filter size={16} />,
    technical: <TrendingUp size={16} />,
    hr: <Users size={16} />,
    offer: <TrendingUp size={16} />,
    hired: <CheckCircle2 size={16} />
  };

  const handleStageClick = (stageKey: string) => {
    navigate(`/recruiter/candidates?stage=${stageKey}`);
  };

  const totalCandidates = funnel[0]?.count || 1;

  return (
    <div className={styles.funnelContainer}>
      <div className={styles.funnelHeader}>
        <div>
          <div className={styles.badgeRow}>
            <span className={styles.headerTag}>PIPELINE ANALYTICS</span>
          </div>
          <h3 className={styles.funnelTitle}>Recruitment Pipeline & Conversion Stream</h3>
          <p className={styles.funnelSubtitle}>
            Candidate density flow and stage-to-stage transition metrics
          </p>
        </div>

        <button 
          type="button" 
          onClick={() => navigate('/recruiter/candidates')}
          className={styles.filterBtn}
        >
          <Filter size={14} /> Filter Candidates
        </button>
      </div>

      {/* ── MODULAR CARDS STREAM WITH BEZIER CONNECTORS & FLOATING MICRO-PILLS ── */}
      <div className={styles.streamDeck}>
        {funnel.map((stage, idx) => {
          const isHovered = hoveredStage === stage.stageKey;
          const percentageOfTotal = Math.round((stage.count / totalCandidates) * 100);
          const nextStage = funnel[idx + 1];
          const hasNext = Boolean(nextStage);
          
          const conversionRate = stage.conversionPercent ?? (hasNext && stage.count > 0 ? Math.round((nextStage.count / stage.count) * 100) : 100);
          const dropoffRate = 100 - conversionRate;
          const dropoffCount = hasNext ? stage.count - nextStage.count : 0;

          return (
            <React.Fragment key={stage.stageKey}>
              {/* STAGE STEP CARD */}
              <div
                className={`${styles.stageCard} ${isHovered ? styles.stageCardHovered : ''}`}
                onMouseEnter={() => setHoveredStage(stage.stageKey)}
                onMouseLeave={() => setHoveredStage(null)}
                onClick={() => handleStageClick(stage.stageKey)}
              >
                <div className={styles.cardHeader}>
                  <div 
                    className={styles.iconPill} 
                    style={{ background: stageGradients[stage.stageKey] || stageGradients.applied }}
                  >
                    {stageIcons[stage.stageKey] || <Users size={16} />}
                  </div>
                  <span className={styles.stageLabel}>{stage.label}</span>
                </div>

                <div className={styles.countWrapper}>
                  <span className={styles.countValue}>{stage.count}</span>
                  <span className={styles.countUnit}>candidates</span>
                </div>

                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${Math.max(percentageOfTotal, 6)}%`,
                      background: stageGradients[stage.stageKey] || stageGradients.applied
                    }}
                  />
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.pctTotal}>{percentageOfTotal}% of total</span>
                  <span className={styles.viewLink}>Filter &rarr;</span>
                </div>
              </div>

              {/* FLOATING MICRO-INDICATOR PILL BETWEEN CARDS */}
              {hasNext && (
                <div className={styles.connectorContainer}>
                  <svg className={styles.bezierRibbon} viewBox="0 0 40 40">
                    <path
                      d="M 0,20 C 20,20 20,20 40,20"
                      fill="none"
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                  </svg>

                  <div className={styles.microPill}>
                    <div className={styles.passPill}>
                      {conversionRate}% pass
                    </div>
                    {dropoffRate > 0 && (
                      <div className={styles.dropPill}>
                        <ArrowDownRight size={10} />
                        {dropoffCount} ({dropoffRate}%) drop
                      </div>
                    )}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
