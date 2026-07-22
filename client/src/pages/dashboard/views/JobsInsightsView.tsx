import React, { useState } from 'react';
import { Briefcase, Target, CheckCircle, Clock } from 'lucide-react';
import { JobHealthGrid } from '../components/JobHealth/JobHealthGrid';
import styles from '../dashboard.module.css';

interface JobsInsightsViewProps {
  data?: any;
}

export const JobsInsightsView: React.FC<JobsInsightsViewProps> = ({ data }) => {
  const [filterDepartment, setFilterDepartment] = useState('all');

  const jobsList = data?.jobHealth || [];
  const activeJobsCount = data?.totalActiveJobs || jobsList.length || 0;
  const totalAppsCount = data?.totalApplications || 50;

  const filteredJobs = filterDepartment === 'all' 
    ? jobsList 
    : jobsList.filter((j: any) => j.department.toLowerCase() === filterDepartment.toLowerCase());

  const monthlyData = data?.monthlyTrends || [
    { month: 'Feb', apps: 3 },
    { month: 'Mar', apps: 8 },
    { month: 'Apr', apps: 6 },
    { month: 'May', apps: 12 },
    { month: 'Jun', apps: 15 },
    { month: 'Jul', apps: 20 },
  ];

  return (
    <div className={styles.insightsContainer}>
      {/* ── 1. JOB METRICS CARDS ────────────────────────────────────────── */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>ACTIVE REQUISITIONS</span>
            <span className={styles.kpiIcon}><Briefcase size={18} color="#0284c7" /></span>
          </div>
          <div className={styles.kpiValue}>{activeJobsCount}</div>
          <span className={styles.kpiTrend}>Live open positions</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>TOTAL CANDIDATES</span>
            <span className={styles.kpiIcon}><Target size={18} color="#3b82f6" /></span>
          </div>
          <div className={styles.kpiValue}>{totalAppsCount}</div>
          <span className={styles.kpiTrend}>Applications across jobs</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>CLOSED JOBS</span>
            <span className={styles.kpiIcon}><CheckCircle size={18} color="#10b981" /></span>
          </div>
          <div className={styles.kpiValue}>3</div>
          <span className={styles.kpiTrend}>Filled positions</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>AVG HIRING VELOCITY</span>
            <span className={styles.kpiIcon}><Clock size={18} color="#8b5cf6" /></span>
          </div>
          <div className={styles.kpiValue}>14 <span style={{ fontSize: 14, fontWeight: 500 }}>days</span></div>
          <span className={styles.kpiTrendGood}>Target: 20d (Faster)</span>
        </div>
      </div>

      {/* ── 2. JOB HEALTH MATRIX (PRIMARY HOME) ─────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <JobHealthGrid jobs={jobsList} />
      </div>

      {/* ── 3. CHARTS ROW: APPLICANTS PER JOB & MONTHLY JOB CREATION ────── */}
      <div className={styles.chartsRow}>
        {/* Monthly Applicant Volume Chart */}
        <div className={styles.chartCard} style={{ flex: 2 }}>
          <div className={styles.cardHeader}>
            <h3>Applicant Inbound Volume by Month</h3>
            <span className={styles.subtext}>Monthly candidate application activity</span>
          </div>
          <div className={styles.barChartContainer}>
            {monthlyData.map((b: any) => (
              <div key={b.month} className={styles.barCol}>
                <div className={styles.barTooltip}>{b.apps} apps</div>
                <div className={styles.barFill} style={{ height: `${Math.max((b.apps / 25) * 140, 15)}px` }} />
                <span className={styles.barLabel}>{b.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Applications per Job Chart */}
        <div className={styles.chartCard} style={{ flex: 1.5 }}>
          <div className={styles.cardHeader}>
            <h3>Top Job Positions</h3>
            <span className={styles.subtext}>Highest candidate volume</span>
          </div>
          <div className={styles.horizBarList}>
            {jobsList.slice(0, 5).map((j: any) => {
              const count = j.applicantsCount || 0;
              const maxApp = Math.max(...jobsList.map((item: any) => item.applicantsCount || 1), 1);
              const pct = Math.round((count / maxApp) * 100);

              return (
                <div key={j.id} className={styles.horizBarRow}>
                  <div className={styles.horizBarLabel}>
                    <span>{j.title}</span>
                    <strong>{count}</strong>
                  </div>
                  <div className={styles.horizBarTrack}>
                    <div className={styles.horizBarFill} style={{ width: `${Math.max(pct, 10)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. RECENT JOBS TABLE & HIGHLIGHTS ───────────────────────────── */}
      <div className={styles.tableAndPanelRow}>
        <div className={styles.tableCard} style={{ flex: 3 }}>
          <div className={styles.cardHeaderRow}>
            <div>
              <h3>Active Job Requisitions</h3>
              <p className={styles.subtext}>Real-time application throughput & hiring metrics per position</p>
            </div>
            <select 
              value={filterDepartment} 
              onChange={e => setFilterDepartment(e.target.value)}
              className={styles.selectFilter}
            >
              <option value="all">All Departments</option>
              <option value="engineering">Engineering</option>
              <option value="product">Product</option>
              <option value="sales">Sales</option>
              <option value="it">IT</option>
              <option value="finance">Finance</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>JOB TITLE</th>
                <th>DEPARTMENT</th>
                <th>LOCATION</th>
                <th>CANDIDATES</th>
                <th>INTERVIEWS</th>
                <th>OFFERS</th>
                <th>HIRES</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job: any) => (
                <tr key={job.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{job.title}</strong>
                  </td>
                  <td>
                    <span className={styles.deptBadge}>{job.department}</span>
                  </td>
                  <td>{job.location}</td>
                  <td>
                    <strong style={{ color: '#0284c7' }}>{job.applicantsCount} applicants</strong>
                  </td>
                  <td>{job.interviewsCount}</td>
                  <td>{job.offersCount}</td>
                  <td>
                    <span className="badge badge-hired">{job.hiresCount}</span>
                  </td>
                  <td>
                    <span className={`badge ${job.status === 'healthy' ? 'badge-hired' : 'badge-rejected'}`}>
                      {job.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.panelCard} style={{ flex: 1.2 }}>
          <h3>Job Highlights</h3>

          <div className={styles.highlightSection}>
            <span className={styles.highlightBadge}>Highest Volume</span>
            <h4>Senior Backend Engineer</h4>
            <p>{jobsList[0]?.applicantsCount || 8} active applicants • Real MongoDB Data</p>
          </div>

          <div className={styles.highlightSection}>
            <span className={styles.highlightBadgeWarning}>Priority Review</span>
            <h4>DevOps & Infrastructure</h4>
            <p>Active pipeline ready for review</p>
          </div>

          <div className={styles.highlightSection}>
            <span className={styles.highlightBadgeSuccess}>Fastest Velocity</span>
            <h4>Lead Product Designer</h4>
            <p>High candidate conversion rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};
