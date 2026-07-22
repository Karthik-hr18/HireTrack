import React, { useState } from 'react';
import styles from '../dashboard.module.css';

interface JobsInsightsViewProps {
  jobs?: any[];
}

export const JobsInsightsView: React.FC<JobsInsightsViewProps> = ({ jobs = [] }) => {
  const [filterDepartment, setFilterDepartment] = useState('all');

  const defaultJobs = [
    { id: '1', title: 'Senior Backend Engineer (Java / Microservices)', department: 'Engineering', location: 'Remote', candidates: 4, status: 'Open', postedDate: 'Jul 15, 2026' },
    { id: '2', title: 'Full-Stack Software Engineer (React / Node)', department: 'Engineering', location: 'Bangalore, India', candidates: 3, status: 'Open', postedDate: 'Jul 18, 2026' },
    { id: '3', title: 'Associate Product Manager', department: 'Product', location: 'Mumbai, India', candidates: 2, status: 'Open', postedDate: 'Jul 12, 2026' },
    { id: '4', title: 'DevOps & Infrastructure Specialist', department: 'IT', location: 'Bangalore, India', candidates: 3, status: 'Open', postedDate: 'Jul 10, 2026' },
    { id: '5', title: 'Senior Account Executive', department: 'Sales', location: 'Bangalore, India', candidates: 2, status: 'Open', postedDate: 'Jul 08, 2026' },
    { id: '6', title: 'Financial Analyst', department: 'Finance', location: 'Remote', candidates: 1, status: 'Open', postedDate: 'Jul 05, 2026' },
    { id: '7', title: 'React Native Developer', department: 'Engineering', location: 'Remote', candidates: 0, status: 'Closed', postedDate: 'Jun 20, 2026' },
  ];

  const jobsList = jobs.length > 0 ? jobs.map(j => ({
    id: j._id || j.id,
    title: j.title,
    department: j.department || 'General',
    location: j.location || 'Remote',
    candidates: j.candidateCount || j.applicantsCount || 0,
    status: j.status === 'open' ? 'Open' : 'Closed',
    postedDate: j.createdAt ? new Date(j.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jul 2026'
  })) : defaultJobs;

  const filteredJobs = filterDepartment === 'all' 
    ? jobsList 
    : jobsList.filter(j => j.department.toLowerCase() === filterDepartment.toLowerCase());

  return (
    <div className={styles.insightsContainer}>
      {/* ── KPI METRICS CARDS ───────────────────────────────────────────── */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>ACTIVE JOBS</span>
            <span className={styles.kpiIcon}>💼</span>
          </div>
          <div className={styles.kpiValue}>6</div>
          <span className={styles.kpiTrend}>▲ +2 this month</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>OPEN POSITIONS</span>
            <span className={styles.kpiIcon}>🎯</span>
          </div>
          <div className={styles.kpiValue}>15</div>
          <span className={styles.kpiTrend}> Across 5 departments</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>CLOSED JOBS</span>
            <span className={styles.kpiIcon}>✅</span>
          </div>
          <div className={styles.kpiValue}>3</div>
          <span className={styles.kpiTrend}> Filled in last 30d</span>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>AVG TIME TO HIRE</span>
            <span className={styles.kpiIcon}>⏱️</span>
          </div>
          <div className={styles.kpiValue}>18 <span style={{ fontSize: 14, fontWeight: 500 }}>days</span></div>
          <span className={styles.kpiTrendGood}>▼ -3.5 days faster</span>
        </div>
      </div>

      {/* ── CHARTS ROW ─────────────────────────────────────────────────── */}
      <div className={styles.chartsRow}>
        {/* Jobs Created by Month Chart */}
        <div className={styles.chartCard} style={{ flex: 2 }}>
          <div className={styles.cardHeader}>
            <h3>Jobs Created by Month</h3>
            <span className={styles.subtext}>Monthly job posting activity</span>
          </div>
          <div className={styles.barChartContainer}>
            {[
              { month: 'Feb', count: 3 },
              { month: 'Mar', count: 5 },
              { month: 'Apr', count: 4 },
              { month: 'May', count: 8 },
              { month: 'Jun', count: 6 },
              { month: 'Jul', count: 9 },
            ].map(b => (
              <div key={b.month} className={styles.barCol}>
                <div className={styles.barTooltip}>{b.count} jobs</div>
                <div className={styles.barFill} style={{ height: `${(b.count / 10) * 140}px` }} />
                <span className={styles.barLabel}>{b.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Applications per Job Chart */}
        <div className={styles.chartCard} style={{ flex: 1.5 }}>
          <div className={styles.cardHeader}>
            <h3>Applications per Job</h3>
            <span className={styles.subtext}>Top candidate volume</span>
          </div>
          <div className={styles.horizBarList}>
            {[
              { role: 'Senior Backend Engineer', count: 4, percent: 100 },
              { role: 'Full-Stack Software Engineer', count: 3, percent: 75 },
              { role: 'DevOps Specialist', count: 3, percent: 75 },
              { role: 'Associate Product Manager', count: 2, percent: 50 },
              { role: 'Senior Account Executive', count: 2, percent: 50 },
            ].map(item => (
              <div key={item.role} className={styles.horizBarRow}>
                <div className={styles.horizBarLabel}>
                  <span>{item.role}</span>
                  <strong>{item.count}</strong>
                </div>
                <div className={styles.horizBarTrack}>
                  <div className={styles.horizBarFill} style={{ width: `${item.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── JOBS TABLE & RIGHT HIGHLIGHTS PANEL ────────────────────────── */}
      <div className={styles.tableAndPanelRow}>
        {/* Recent Jobs Table */}
        <div className={styles.tableCard} style={{ flex: 3 }}>
          <div className={styles.cardHeaderRow}>
            <div>
              <h3>Recent Job Postings</h3>
              <p className={styles.subtext}>Manage & track applicant activity per role</p>
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
            </select>
          </div>

          <table className={styles.customTable}>
            <thead>
              <tr>
                <th>JOB TITLE</th>
                <th>DEPARTMENT</th>
                <th>LOCATION</th>
                <th>CANDIDATES</th>
                <th>STATUS</th>
                <th>POSTED DATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(job => (
                <tr key={job.id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{job.title}</strong>
                  </td>
                  <td>
                    <span className={styles.deptBadge}>{job.department}</span>
                  </td>
                  <td>{job.location}</td>
                  <td>
                    <strong style={{ color: '#0284c7' }}>{job.candidates} applicants</strong>
                  </td>
                  <td>
                    <span className={`badge ${job.status === 'Open' ? 'badge-hired' : 'badge-rejected'}`}>
                      {job.status}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: 12 }}>{job.postedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right Highlights Panel */}
        <div className={styles.panelCard} style={{ flex: 1.2 }}>
          <h3>Job Highlights</h3>

          <div className={styles.highlightSection}>
            <span className={styles.highlightBadge}>🔥 Highest Applications</span>
            <h4>Senior Backend Engineer</h4>
            <p>4 active applicants • 2 interviews in progress</p>
          </div>

          <div className={styles.highlightSection}>
            <span className={styles.highlightBadgeWarning}>⚡ Needs Attention</span>
            <h4>DevOps Specialist</h4>
            <p>No candidates reviewed in last 3 days</p>
          </div>

          <div className={styles.highlightSection}>
            <span className={styles.highlightBadgeSuccess}>✨ Recently Published</span>
            <h4>Financial Analyst</h4>
            <p>Posted 2 days ago • Remote position</p>
          </div>
        </div>
      </div>
    </div>
  );
};
