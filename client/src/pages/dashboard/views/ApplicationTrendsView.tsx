import React, { useState } from 'react';
import styles from '../dashboard.module.css';

export const ApplicationTrendsView: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6m');

  const monthlyTrends = [
    { month: 'Feb', apps: 12, hires: 1 },
    { month: 'Mar', apps: 18, hires: 2 },
    { month: 'Apr', apps: 15, hires: 2 },
    { month: 'May', apps: 24, hires: 3 },
    { month: 'Jun', apps: 32, hires: 4 },
    { month: 'Jul', apps: 41, hires: 6 },
  ];

  const pipelineSummary = [
    { stage: 'Applied', count: 14, percent: '100%', color: '#0284c7' },
    { stage: 'Screening', count: 4, percent: '71%', color: '#3b82f6' },
    { stage: 'Technical Interview', count: 3, percent: '50%', color: '#8b5cf6' },
    { stage: 'HR Interview', count: 2, percent: '35%', color: '#a855f7' },
    { stage: 'Offer', count: 1, percent: '21%', color: '#10b981' },
    { stage: 'Hired', count: 1, percent: '14%', color: '#059669' },
    { stage: 'Rejected', count: 1, percent: '7%', color: '#ef4444' },
  ];

  const candidateSources = [
    { source: 'LinkedIn Job Board', count: 18, percent: 43, color: '#0077b5' },
    { source: 'Company Careers Page', count: 12, percent: 29, color: '#0284c7' },
    { source: 'Employee Referral', count: 6, percent: 15, color: '#10b981' },
    { source: 'Direct Application', count: 3, percent: 7, color: '#f59e0b' },
    { source: 'Indeed & Glassdoor', count: 2, percent: 6, color: '#6366f1' },
  ];

  return (
    <div className={styles.insightsContainer}>
      {/* ── HIRING METRICS CARDS ────────────────────────────────────────── */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>TOTAL APPLICATIONS</span>
            <span className={styles.kpiIcon}>📈</span>
          </div>
          <div className={styles.kpiValue}>41</div>
          <span className={styles.kpiTrendGood}>▲ +28% vs last month</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>ACTIVE CANDIDATES</span>
            <span className={styles.kpiIcon}>👥</span>
          </div>
          <div className={styles.kpiValue}>10</div>
          <span className={styles.kpiTrend}> Currently in pipeline</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>REJECTED / WITHDRAWN</span>
            <span className={styles.kpiIcon}>🛑</span>
          </div>
          <div className={styles.kpiValue}>1</div>
          <span className={styles.kpiTrend}> Low drop-off rate</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>OFFER CONVERSION RATE</span>
            <span className={styles.kpiIcon}>🏆</span>
          </div>
          <div className={styles.kpiValue}>28.5%</div>
          <span className={styles.kpiTrendGood}>▲ Above industry avg</span>
        </div>
      </div>

      {/* ── LARGE APPLICATION TRENDS CHART ─────────────────────────────── */}
      <div className={styles.chartCard} style={{ marginBottom: 20 }}>
        <div className={styles.cardHeaderRow}>
          <div>
            <h3>Monthly Application Volume Trends</h3>
            <p className={styles.subtext}>Inbound applicant flow and successful hires over time</p>
          </div>

          <div className={styles.timeframeToggle}>
            {['1m', '3m', '6m', '1y'].map(t => (
              <button
                key={t}
                type="button"
                className={`${styles.toggleBtn} ${selectedTimeframe === t ? styles.toggleBtnActive : ''}`}
                onClick={() => setSelectedTimeframe(t)}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* SVG Curve Line Chart */}
        <div className={styles.svgChartContainer}>
          <svg viewBox="0 0 800 200" className={styles.svgChart}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1="40" y1="20" x2="760" y2="20" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="40" y1="70" x2="760" y2="70" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="40" y1="120" x2="760" y2="120" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="40" y1="170" x2="760" y2="170" stroke="#cbd5e1" strokeWidth="1" />

            {/* Gradient Area Fill */}
            <path
              d="M 60,150 Q 200,120 340,135 T 620,60 L 740,25 L 740,170 L 60,170 Z"
              fill="url(#chartGradient)"
            />

            {/* Trend Line */}
            <path
              d="M 60,150 Q 200,120 340,135 T 620,60 L 740,25"
              fill="none"
              stroke="#0284c7"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Data Dots */}
            {monthlyTrends.map((d, index) => {
              const cx = 60 + index * 136;
              const cy = 170 - (d.apps / 45) * 145;
              return (
                <g key={d.month}>
                  <circle cx={cx} cy={cy} r="6" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
                  <text x={cx} y="192" textAnchor="middle" fontSize="12" fill="#64748b" fontWeight="600">{d.month}</text>
                  <text x={cx} y={cy - 12} textAnchor="middle" fontSize="11" fill="#0284c7" fontWeight="700">{d.apps}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* ── PIPELINE SUMMARY & SOURCING CHANNELS GRID ───────────────────── */}
      <div className={styles.chartsRow}>
        {/* Pipeline Stage Funnel (Ref Image 1 Style) */}
        <div className={styles.chartCard} style={{ flex: 1.5 }}>
          <div className={styles.cardHeader}>
            <h3>Pipeline Summary & Funnel</h3>
            <span className={styles.subtext}>Stage distribution & drop-off rate</span>
          </div>

          <div className={styles.pipelineFunnelList}>
            {pipelineSummary.map((stage) => (
              <div key={stage.stage} className={styles.pipelineFunnelRow}>
                <div className={styles.stageMeta}>
                  <span className={styles.stageName}>{stage.stage}</span>
                  <strong className={styles.stageCount}>{stage.count}</strong>
                </div>
                <div className={styles.stageBarTrack}>
                  <div
                    className={styles.stageBarFill}
                    style={{ width: `${(stage.count / 14) * 100}%`, backgroundColor: stage.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Candidate Source Breakdown */}
        <div className={styles.chartCard} style={{ flex: 1.2 }}>
          <div className={styles.cardHeader}>
            <h3>Candidate Source Breakdown</h3>
            <span className={styles.subtext}>Origin channel attribution</span>
          </div>

          <div className={styles.sourceList}>
            {candidateSources.map((s) => (
              <div key={s.source} className={styles.sourceRow}>
                <div className={styles.sourceLabelRow}>
                  <span className={styles.sourceDot} style={{ backgroundColor: s.color }} />
                  <span className={styles.sourceName}>{s.source}</span>
                  <strong className={styles.sourceValue}>{s.count} ({s.percent}%)</strong>
                </div>
                <div className={styles.sourceTrack}>
                  <div className={styles.sourceFill} style={{ width: `${s.percent}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
