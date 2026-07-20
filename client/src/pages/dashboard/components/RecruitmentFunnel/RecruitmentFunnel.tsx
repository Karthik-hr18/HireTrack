import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter } from 'lucide-react';
import { FunnelStage } from '../../../../types/dashboard';
import styles from '../../dashboard.module.css';

interface Props {
  funnel: FunnelStage[];
}

export const RecruitmentFunnel: React.FC<Props> = ({ funnel }) => {
  const navigate = useNavigate();
  const maxCount = Math.max(...funnel.map((f) => f.count), 1);

  const handleStageClick = (stageKey: string) => {
    navigate(`/recruiter/candidates?stage=${stageKey}`);
  };

  return (
    <div className={styles.widgetCard}>
      <h3 className={styles.widgetTitle}>
        <span>Recruitment Pipeline Funnel</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Filter size={14} /> Click stage to filter candidates
        </span>
      </h3>
      <p className={styles.widgetSubtitle}>
        Stage conversion rates & drop-off metrics across hiring workflow
      </p>

      <div className={styles.funnelList}>
        {funnel.map((stage) => {
          const widthPercent = Math.max(Math.round((stage.count / maxCount) * 100), 8);

          return (
            <div
              key={stage.stageKey}
              className={styles.funnelRow}
              onClick={() => handleStageClick(stage.stageKey)}
              style={{ cursor: 'pointer' }}
            >
              <div className={styles.funnelLabelRow}>
                <span className={styles.funnelStageName}>{stage.label}</span>
                <div className={styles.funnelMeta}>
                  <span className={styles.funnelCount}>{stage.count} candidates</span>
                  <span className={styles.funnelConversion}>
                    {stage.conversionPercent}% pass
                  </span>
                  {stage.dropoffPercent > 0 && (
                    <span className={styles.funnelDropoff}>
                      ({stage.dropoffPercent}% drop)
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.funnelTrack}>
                <div
                  className={styles.funnelFill}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
