import { useState } from 'react';

function App() {
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApiConnection = async () => {
    setLoading(true);
    setHealthStatus(null);
    try {
      // In development, this will be proxied by Vite to http://localhost:5000/health
      // In production, we'll fetch from the absolute Render backend URL
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      setHealthStatus({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1>
        <span className="gradient-text">HireTrack</span> ATS
      </h1>
      <p className="tagline">The Applicant Tracking System for growing companies</p>
      
      <span className="badge badge-success">Day 1 — Foundation Active</span>

      <div className="tech-grid">
        <div className="tech-item">MERN Stack</div>
        <div className="tech-item">TypeScript Strict</div>
        <div className="tech-item">JWT & RBAC</div>
        <div className="tech-item">MongoDB Atlas</div>
        <div className="tech-item">Render & Vercel</div>
      </div>

      <div className="status-section">
        <h3>Backend Integration Test</h3>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Verify connection between the Vercel-bound React frontend and the Render-hosted Express API.
        </p>
        <button 
          className="api-btn" 
          onClick={testApiConnection}
          disabled={loading}
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>

        {healthStatus && (
          <div className="api-response">
            <pre>{JSON.stringify(healthStatus, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
