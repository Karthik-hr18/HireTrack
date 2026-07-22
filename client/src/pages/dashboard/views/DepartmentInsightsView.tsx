import React from 'react';
import styles from '../dashboard.module.css';

export const DepartmentInsightsView: React.FC = () => {
  const departmentData = [
    { name: 'Engineering', openJobs: 3, candidates: 7, interviews: 4, hires: 3, timeToHire: '16 days', velocity: 'Fast' },
    { name: 'Product', openJobs: 1, candidates: 2, interviews: 1, hires: 1, timeToHire: '12 days', velocity: 'Very Fast' },
    { name: 'Sales', openJobs: 1, candidates: 2, interviews: 2, hires: 1, timeToHire: '14 days', velocity: 'Moderate' },
    { name: 'IT & Infrastructure', openJobs: 1, candidates: 3, interviews: 1, hires: 1, timeToHire: '21 days', velocity: 'Standard' },
    { name: 'Finance', openJobs: 1, candidates: 1, interviews: 0, hires: 0, timeToHire: '18 days', velocity: 'Standard' },
  ];

  return (
    <div className={styles.insightsContainer}>
      {/* ── DEPARTMENT KPIS ────────────────────────────────────────────── */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>TOTAL DEPARTMENTS</span>
            <span className={styles.kpiIcon}>🏢</span>
          </div>
          <div className={styles.kpiValue}>5</div>
          <span className={styles.kpiTrend}> Active hiring units</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>OPEN POSITIONS</span>
            <span className={styles.kpiIcon}>📊</span>
          </div>
          <div className={styles.kpiValue}>12</div>
          <span className={styles.kpiTrend}> Distributed headcount</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>EMPLOYEES HIRED</span>
            <span className={styles.kpiIcon}>🎉</span>
          </div>
          <div className={styles.kpiValue}>6</div>
          <span className={styles.kpiTrendGood}>▲ +2 this quarter</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>HIRING VELOCITY</span>
            <span className={styles.kpiIcon}>⚡</span>
          </div>
          <div className={styles.kpiValue}>14.2 <span style={{ fontSize: 14, fontWeight: 500 }}>days</span></div>
          <span className={styles.kpiTrendGood}> Product is fastest</span>
        </div>
      </div>

      {/* ── CHARTS ROW ─────────────────────────────────────────────────── */}
      <div className={styles.chartsRow}>
        {/* Hiring Share by Department */}
        <div className={styles.chartCard} style={{ flex: 1.5 }}>
          <div className={styles.cardHeader}>
            <h3>Headcount Allocation by Department</h3>
            <span className={styles.subtext}>Active candidate share across departments</span>
          </div>

          <div className={styles.donutContainer}>
            <div className={styles.donutProgressList}>
              {[
                { dept: 'Engineering', count: 7, percent: 45, color: '#0284c7' },
                { dept: 'IT & Infrastructure', count: 3, percent: 20, color: '#10b981' },
                { dept: 'Product', count: 2, percent: 15, color: '#8b5cf6' },
                { dept: 'Sales', count: 2, percent: 12, color: '#f59e0b' },
                { dept: 'Finance', count: 1, percent: 8, color: '#ec4899' },
              ].map(item => (
                <div key={item.dept} className={styles.donutRow}>
                  <div className={styles.donutLabelRow}>
                    <span className={styles.donutDot} style={{ backgroundColor: item.color }} />
                    <span className={styles.donutDeptName}>{item.dept}</span>
                    <strong className={styles.donutCount}>{item.count} candidates ({item.percent}%)</strong>
                  </div>
                  <div className={styles.donutBarTrack}>
                    <div className={styles.donutBarFill} style={{ width: `${item.percent}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recruitment Funnel by Department */}
        <div className={styles.chartCard} style={{ flex: 2 }}>
          <div className={styles.cardHeader}>
            <h3>Department Performance Metrics</h3>
            <span className={styles.subtext}>Interviews vs Hires ratio</span>
          </div>

          <div className={styles.funnelChartBox}>
            {departmentData.map(d => (
              <div key={d.name} className={styles.funnelBarItem}>
                <div className={styles.funnelBarHeader}>
                  <strong>{d.name}</strong>
                  <span>{d.candidates} Candidates • {d.hires} Hired</span>
                </div>
                <div className={styles.stackedBarTrack}>
                  <div className={styles.stackedSegmentScreen} style={{ width: `${(d.candidates / 8) * 100}%` }} title="Candidates" />
                  <div className={styles.stackedSegmentInterview} style={{ width: `${(d.interviews / 8) * 100}%` }} title="Interviews" />
                  <div className={styles.stackedSegmentHired} style={{ width: `${(d.hires / 8) * 100}%` }} title="Hires" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABLE & INSIGHTS PANEL ─────────────────────────────────────── */}
      <div className={styles.tableAndPanelRow}>
        {/* Department Table */}
        <div className={styles.tableCard} style={{ flex: 3 }}>
          <div className={styles.cardHeaderRow}>
            <div>
              <h3>Department Breakdown</h3>
              <p className={styles.subtext}>Real-time department metrics and hiring speed</p>
            </div>
          </div>

          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>DEPARTMENT</th>
                <th>OPEN JOBS</th>
                <th>CANDIDATES</th>
                <th>INTERVIEWS</th>
                <th>HIRES</th>
                <th>AVG TIME TO HIRE</th>
              </tr>
            </thead>
            <tbody>
              {departmentData.map(d => (
                <tr key={d.name}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{d.name}</strong>
                  </td>
                  <td>
                    <span className={styles.deptBadge}>{d.openJobs} Open</span>
                  </td>
                  <td>
                    <strong style={{ color: '#0284c7' }}>{d.candidates}</strong>
                  </td>
                  <td>{d.interviews}</td>
                  <td>
                    <span className="badge badge-hired">{d.hires} Hired</span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>{d.timeToHire}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Department Highlights Panel */}
        <div className={styles.panelCard} style={{ flex: 1.2 }}>
          <h3>Department Highlights</h3>

          <div className={styles.highlightSection}>
            <span className={styles.highlightBadge}>💻 Engineering</span>
            <h4>Highest Applications</h4>
            <p>7 active applicants across Senior Backend & Full-Stack roles.</p>
          </div>

          <div className={styles.highlightSection}>
            <span className={styles.highlightBadgeSuccess}>⚡ Product</span>
            <h4>Fastest Hiring Velocity</h4>
            <p>Average time to hire of 12 days from application to offer.</p>
          </div>

          <div className={styles.highlightSection}>
            <span className={styles.highlightBadgeWarning}>📈 Sales</span>
            <h4>Most Interviews Conducted</h4>
            <p>100% interview conversion rate for Senior Account Executive role.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
