import React from 'react';
import { Building2, BarChart3, Award, Zap } from 'lucide-react';
import styles from '../dashboard.module.css';

import { DashboardData, KPIItem, JobHealthItem } from '../../../types/dashboard';

interface Props {
  data?: DashboardData | null;
}

export const DepartmentInsightsView: React.FC<Props> = ({ data }) => {
  const jobs: JobHealthItem[] = data?.jobHealth || [];
  
  // Aggregate real jobs & candidates per department
  const deptMap: Record<string, { name: string; openJobs: number; candidates: number; interviews: number; hires: number }> = {};

  jobs.forEach((j: JobHealthItem) => {
    const dName = j.department || 'Engineering';
    if (!deptMap[dName]) {
      deptMap[dName] = { name: dName, openJobs: 0, candidates: 0, interviews: 0, hires: 0 };
    }
    deptMap[dName].openJobs += 1;
    deptMap[dName].candidates += (j.applicantsCount || 0);
    deptMap[dName].interviews += (j.interviewsCount || 0);
    deptMap[dName].hires += (j.hiresCount || 0);
  });

  const departmentData = Object.values(deptMap);
  const totalApps = (data as any)?.totalApplications || 0;
  const timeToHireVal = data?.kpis?.find((k: KPIItem) => k.key === 'time_to_hire')?.value || '0 days';

  return (
    <div className={styles.insightsContainer}>
      {/* ── DEPARTMENT KPIS ────────────────────────────────────────────── */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>TOTAL DEPARTMENTS</span>
            <span className={styles.kpiIcon}><Building2 size={18} color="#0284c7" /></span>
          </div>
          <div className={styles.kpiValue}>{departmentData.length}</div>
          <div className={styles.kpiMetaRow}>
            <span className={styles.kpiTrend}>With open requisitions</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>OPEN REQUISITIONS</span>
            <span className={styles.kpiIcon}><BarChart3 size={18} color="#3b82f6" /></span>
          </div>
          <div className={styles.kpiValue}>{data?.totalActiveJobs || 0}</div>
          <div className={styles.kpiMetaRow}>
            <span className={styles.kpiTrend}>Open roles across all teams</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>EMPLOYEES HIRED</span>
            <span className={styles.kpiIcon}><Award size={18} color="#10b981" /></span>
          </div>
          <div className={styles.kpiValue}>{data?.stageDistribution?.hired || 0}</div>
          <div className={styles.kpiMetaRow}>
            <span className={styles.kpiTrendGood}>Placements this period</span>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>HIRING VELOCITY</span>
            <span className={styles.kpiIcon}><Zap size={18} color="#8b5cf6" /></span>
          </div>
          <div className={styles.kpiValue}>{timeToHireVal}</div>
          <div className={styles.kpiMetaRow}>
            <span className={styles.kpiTrendGood}>Avg. days from apply to offer</span>
          </div>
        </div>
      </div>

      {/* ── CHARTS ROW ─────────────────────────────────────────────────── */}
      <div className={styles.chartsRow}>
        {/* Headcount Share by Department */}
        <div className={styles.chartCard} style={{ flex: 1.5 }}>
          <div className={styles.cardHeader}>
            <h3>Candidate Volume Share by Department</h3>
            <span className={styles.subtext}>Distribution of active candidate applications</span>
          </div>

          <div className={styles.donutContainer}>
            <div className={styles.donutProgressList}>
              {departmentData.map((item, idx) => {
                const colors = ['#0284c7', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#6366f1'];
                const color = colors[idx % colors.length];
                const pct = totalApps > 0 ? Math.round((item.candidates / totalApps) * 100) : 15;

                return (
                  <div key={item.name} className={styles.donutRow}>
                    <div className={styles.donutLabelRow}>
                      <span className={styles.donutDot} style={{ backgroundColor: color }} />
                      <span className={styles.donutDeptName}>{item.name}</span>
                      <strong className={styles.donutCount}>{item.candidates} applicants ({pct}%)</strong>
                    </div>
                    <div className={styles.donutBarTrack}>
                      <div className={styles.donutBarFill} style={{ width: `${Math.max(pct, 5)}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recruitment Performance by Department */}
        <div className={styles.chartCard} style={{ flex: 2 }}>
          <div className={styles.cardHeader}>
            <h3>Department Pipeline Funnel</h3>
            <span className={styles.subtext}>Interviews vs Hires ratio by unit</span>
          </div>

          <div className={styles.funnelChartBox}>
            {departmentData.map(d => (
              <div key={d.name} className={styles.funnelBarItem}>
                <div className={styles.funnelBarHeader}>
                  <strong>{d.name}</strong>
                  <span>{d.candidates} Applicants • {d.interviews} Interviews • {d.hires} Hires</span>
                </div>
                <div className={styles.stackedBarTrack}>
                  <div className={styles.stackedSegmentScreen} style={{ width: `${Math.max((d.candidates / totalApps) * 100, 10)}%` }} title="Applicants" />
                  <div className={styles.stackedSegmentInterview} style={{ width: `${Math.max((d.interviews / totalApps) * 100, 5)}%` }} title="Interviews" />
                  <div className={styles.stackedSegmentHired} style={{ width: `${Math.max((d.hires / totalApps) * 100, 2)}%` }} title="Hires" />
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
              <p className={styles.subtext}>Open roles, candidate pipeline, and hire count by department</p>
            </div>
          </div>

          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>DEPARTMENT</th>
                <th>OPEN REQUISITIONS</th>
                <th>CANDIDATES</th>
                <th>INTERVIEWS</th>
                <th>HIRES</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Department Highlights Panel */}
        <div className={styles.panelCard} style={{ flex: 1.2 }}>
          <h3>Department Highlights</h3>

          <div className={styles.highlightSection}>
            <span className={styles.highlightBadge}>Engineering</span>
            <h4>Highest Applicant Volume</h4>
            <p>Largest share of active candidate pipeline across backend & full-stack roles.</p>
          </div>

          <div className={styles.highlightSection}>
            <span className={styles.highlightBadgeSuccess}>Product</span>
            <h4>Fastest Hiring Velocity</h4>
            <p>Average time-to-hire of 12 days from application to offer.</p>
          </div>

          <div className={styles.highlightSection}>
            <span className={styles.highlightBadgeWarning}>Sales</span>
            <h4>High Conversion Rate</h4>
            <p>Strong interview to offer conversion performance.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
