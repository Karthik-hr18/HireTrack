import React, { useState, useEffect } from 'react';

interface AdminDashboardProps {
  token: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ token }) => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/analytics/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          throw new Error('Failed to retrieve analytics metrics');
        }

        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [token]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <h2 style={{ color: 'var(--gray-text-muted)' }}>Syncing analytics metrics...</h2>
        <div style={spinnerStyle}></div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div style={errorContainerStyle}>
        ⚠️ Failed to load metrics: {error || 'Unknown error'}
      </div>
    );
  }

  const { totalActiveJobs, totalApplications, stageDistribution } = metrics;

  // Calculate Hire Rate
  const hiredCount = stageDistribution['hired'] || 0;
  const rejectedCount = stageDistribution['rejected'] || 0;
  const closedApplications = hiredCount + rejectedCount;
  const hireRate = closedApplications > 0 ? Math.round((hiredCount / closedApplications) * 100) : 0;

  // Find max count for relative stage bar scaling
  const maxStageCount = Math.max(...Object.values(stageDistribution as Record<string, number>), 1);

  const getStageLabel = (s: string) => {
    return s.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div>
      {/* Metrics Cards Grid */}
      <div style={statsGridStyle}>
        <div className="card" style={statCardStyle}>
          <div style={statHeaderStyle}>
            <span style={statTitleStyle}>Active Job Openings</span>
            <span style={iconStyle}>💼</span>
          </div>
          <div style={statNumberStyle}>{totalActiveJobs}</div>
          <p style={statSubStyle}>Open opportunities receiving submissions</p>
        </div>

        <div className="card" style={statCardStyle}>
          <div style={statHeaderStyle}>
            <span style={statTitleStyle}>Total Received Applications</span>
            <span style={iconStyle}>📄</span>
          </div>
          <div style={statNumberStyle}>{totalApplications}</div>
          <p style={statSubStyle}>Total candidate profile submissions</p>
        </div>

        <div className="card" style={statCardStyle}>
          <div style={statHeaderStyle}>
            <span style={statTitleStyle}>Hiring Placement Rate</span>
            <span style={iconStyle}>📈</span>
          </div>
          <div style={statNumberStyle}>{hireRate}%</div>
          <p style={statSubStyle}>Successful selections vs. rejections</p>
        </div>
      </div>

      {/* Distribution Analytics Card */}
      <div className="card" style={{ padding: '24px', marginTop: '2rem' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: 'var(--gray-text-primary)' }}>🎯 Candidate Pipeline Distribution</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(stageDistribution).map(([stageName, count]) => {
            const percentage = Math.round(((count as number) / maxStageCount) * 100);
            return (
              <div key={stageName} style={stageRowStyle}>
                <div style={stageInfoStyle}>
                  <span style={stageLabelStyle}>{getStageLabel(stageName)}</span>
                  <span style={stageCountStyle}>{count as number} Candidates</span>
                </div>
                <div style={progressBarContainerStyle}>
                  <div style={{ ...progressBarFillStyle, width: `${Math.max(percentage, 2)}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Styles
const statsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '1.5rem'
};

const statCardStyle: React.CSSProperties = {
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  textAlign: 'left'
};

const statHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const statTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: 'var(--gray-text-muted)',
  letterSpacing: '0.05em'
};

const iconStyle: React.CSSProperties = {
  fontSize: '20px'
};

const statNumberStyle: React.CSSProperties = {
  fontSize: '36px',
  fontWeight: 800,
  color: 'var(--gray-text-primary)'
};

const statSubStyle: React.CSSProperties = {
  fontSize: '12px',
  color: 'var(--gray-text-muted)',
  margin: 0
};

const errorContainerStyle: React.CSSProperties = {
  color: 'var(--error)',
  backgroundColor: 'rgba(239, 68, 68, 0.08)',
  padding: '12px',
  borderRadius: 'var(--radius-default)',
  fontSize: '14px',
  border: '1px solid rgba(239, 68, 68, 0.2)'
};

const spinnerStyle: React.CSSProperties = {
  width: '30px',
  height: '30px',
  border: '3px solid var(--gray-border)',
  borderTop: '3px solid var(--accent)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  margin: '1.5rem auto 0 auto'
};

const stageRowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const stageInfoStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '13px',
  fontWeight: 600
};

const stageLabelStyle: React.CSSProperties = {
  color: 'var(--gray-text-primary)'
};

const stageCountStyle: React.CSSProperties = {
  color: 'var(--gray-text-muted)'
};

const progressBarContainerStyle: React.CSSProperties = {
  width: '100%',
  height: '8px',
  backgroundColor: 'var(--gray-surface)',
  borderRadius: '4px',
  overflow: 'hidden'
};

const progressBarFillStyle: React.CSSProperties = {
  height: '100%',
  backgroundColor: 'var(--accent)',
  borderRadius: '4px',
  transition: 'width 0.5s ease-out-in'
};
