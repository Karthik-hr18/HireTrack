import React, { useState, useEffect } from 'react';
import { CareersNav } from './components/CareersNav';
import { CareersHero } from './components/CareersHero';
import { CompanyStory } from './components/CompanyStory';
import { BenefitsSection } from './components/BenefitsSection';
import { CompanyStats } from './components/CompanyStats';
import { OpenPositionsSection } from './components/OpenPositionsSection';
import { FAQSection } from './components/FAQSection';
import { CareersFooter } from './components/CareersFooter';

export const CareersPage: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Careers at HireTrack — Build Products That Matter";
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/jobs`);
        if (!response.ok) {
          throw new Error('Failed to fetch job postings');
        }
        const data = await response.json();
        setJobs(data.jobs || []);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    if (!loading && window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }, [loading]);

  return (
    <div style={{ backgroundColor: 'var(--gray-bg)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation */}
      <CareersNav />

      {/* Main Content */}
      <main style={{ flex: 1 }}>
        <CareersHero />
        <CompanyStory />
        <BenefitsSection />
        <CompanyStats />
        {loading ? (
          <div className="careers-container" style={{ padding: '80px 0', textAlign: 'center' }}>
            <div className="careers-card" style={{ padding: 48, maxWidth: 480, margin: '0 auto' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--gray-text-muted)', marginBottom: 16 }}>
                Loading career opportunities...
              </div>
              <div className="skeleton-pulse" style={{ height: 40, width: '100%', borderRadius: 8 }} />
            </div>
          </div>
        ) : error ? (
          <div className="careers-container" style={{ padding: '80px 0', textAlign: 'center' }}>
            <div className="careers-card" style={{ padding: 48, maxWidth: 480, margin: '0 auto', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--error)', marginBottom: 12 }}>
                Unable to load jobs
              </h3>
              <p style={{ fontSize: 14, color: 'var(--gray-text-muted)', marginBottom: 24 }}>{error}</p>
              <button 
                type="button"
                className="btn-primary-lg" 
                onClick={() => window.location.reload()}
                style={{ backgroundColor: 'var(--error)', margin: '0 auto' }}
              >
                Retry Loading
              </button>
            </div>
          </div>
        ) : (
          <OpenPositionsSection jobs={jobs} />
        )}
        <FAQSection />
      </main>

      {/* Footer */}
      <CareersFooter />
    </div>
  );
};
