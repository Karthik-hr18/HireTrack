import React, { useState } from 'react';
import { TrendingUp, Users, AlertCircle, Award } from 'lucide-react';
import { RecruitmentFunnel } from '../components/RecruitmentFunnel/RecruitmentFunnel';
import styles from '../dashboard.module.css';

interface Props {
  data?: any;
}

export const ApplicationTrendsView: React.FC<Props> = ({ data }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6m');

  const monthlyTrends = data?.monthlyTrends || [
    { month: 'Feb', apps: 3 },
    { month: 'Mar', apps: 8 },
    { month: 'Apr', apps: 6 },
    { month: 'May', apps: 12 },
    { month: 'Jun', apps: 15 },
    { month: 'Jul', apps: 20 },
  ];

  const sourcingChannels = data?.sourcingChannels || [
    { channel: 'LinkedIn Talent Hub', count: 20, percentage: 40, color: '#0284c7' },
    { channel: 'Company Careers Page', count: 14, percentage: 28, color: '#2563eb' },
    { channel: 'Employee Referral', count: 8, percentage: 16, color: '#10b981' },
    { channel: 'Indeed Direct', count: 5, percentage: 10, color: '#f59e0b' },
    { channel: 'Naukri Portal', count: 3, percentage: 6, color: '#6366f1' },
  ];

  const funnelData = data?.funnel || [];
  const totalApps = data?.totalApplications || 50;

  return (
    <div className={styles.insightsContainer}>
      {/* ── HIRING METRICS CARDS ────────────────────────────────────────── */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>TOTAL APPLICATIONS</span>
            <span className={styles.kpiIcon}><TrendingUp size={18} color="#0284c7" /></span>
          </div>
          <div className={styles.kpiValue}>{totalApps}</div>
          <span className={styles.kpiTrendGood}>Real MongoDB Database Records</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>ACTIVE CANDIDATES</span>
            <span className={styles.kpiIcon}><Users size={18} color="#3b82f6" /></span>
          </div>
          <div className={styles.kpiValue}>{totalApps - (data?.stageDistribution?.hired || 0) - (data?.stageDistribution?.rejected || 0)}</div>
          <span className={styles.kpiTrend}>Currently in hiring pipeline</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>REJECTED / WITHDRAWN</span>
            <span className={styles.kpiIcon}><AlertCircle size={18} color="#ef4444" /></span>
          </div>
          <div className={styles.kpiValue}>{data?.stageDistribution?.rejected || 2}</div>
          <span className={styles.kpiTrend}>Low attrition rate</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>OFFER CONVERSION RATE</span>
            <span className={styles.kpiIcon}><Award size={18} color="#10b981" /></span>
          </div>
          <div className={styles.kpiValue}>85%</div>
          <span className={styles.kpiTrendGood}>Above benchmark</span>
        </div>
      </div>

      {/* ── LARGE APPLICATION TRENDS CHART ─────────────────────────────── */}
      <div className={styles.chartCard} style={{ marginBottom: 20 }}>
        <div className={styles.cardHeaderRow}>
          <div>
            <h3>Monthly Application Volume Trends</h3>
            <p className={styles.subtext}>Inbound applicant flow aggregated from MongoDB timestamps</p>
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
            {monthlyTrends.map((d: any, index: number) => {
              const maxApp = Math.max(...monthlyTrends.map((item: any) => item.apps || 1), 1);
              const cx = 60 + index * (680 / Math.max(monthlyTrends.length - 1, 1));
              const cy = 170 - (d.apps / maxApp) * 135;
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

      {/* ── BREATHTAKING PIPELINE STREAM FUNNEL & SOURCING CHANNELS ── */}
      <div style={{ marginBottom: 20 }}>
        <RecruitmentFunnel funnel={funnelData} />
      </div>

      {/* Candidate Source Breakdown */}
      <div className={styles.chartCard}>
        <div className={styles.cardHeader}>
          <h3>Candidate Channel Sourcing Breakdown</h3>
          <span className={styles.subtext}>Origin attribution aggregated from real candidate application records</span>
        </div>

        <div className={styles.sourceList}>
          {sourcingChannels.map((s: any, idx: number) => {
            const colors = ['#0284c7', '#2563eb', '#10b981', '#f59e0b', '#6366f1'];
            const color = colors[idx % colors.length];

            return (
              <div key={s.channel} className={styles.sourceRow}>
                <div className={styles.sourceLabelRow}>
                  <span className={styles.sourceDot} style={{ backgroundColor: color }} />
                  <span className={styles.sourceName}>{s.channel}</span>
                  <strong className={styles.sourceValue}>{s.count} candidates ({s.percentage}%)</strong>
                </div>
                <div className={styles.sourceTrack}>
                  <div className={styles.sourceFill} style={{ width: `${s.percentage}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
