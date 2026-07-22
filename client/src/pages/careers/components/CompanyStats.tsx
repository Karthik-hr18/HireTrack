import React from 'react';
import { ScrollReveal } from '../../../components/ui/ScrollReveal';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';

const STATS = [
  { value: '150+', label: 'Team Members', subtext: 'Collaborating across 5 continents' },
  { value: '40+', label: 'Countries', subtext: 'Fully remote & async culture' },
  { value: '5000+', label: 'Hires Powered', subtext: 'Through HireTrack platform' },
  { value: '98%', label: 'Satisfaction', subtext: 'Employee retention & approval' },
];

export const CompanyStats: React.FC = () => {
  return (
    <section style={{ padding: '60px 0', borderTop: '1px solid var(--gray-border)' }}>
      <div className="careers-container">
        <ScrollReveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {STATS.map((s, idx) => (
              <div 
                key={idx} 
                className="careers-card careers-card--hover" 
                style={{ padding: '32px 28px', textAlign: 'center' }}
              >
                <AnimatedCounter
                  targetValue={s.value}
                  style={{ 
                    fontSize: 44, 
                    fontWeight: 800, 
                    color: 'var(--accent)', 
                    letterSpacing: '-0.03em', 
                    lineHeight: 1, 
                    marginBottom: 8 
                  }}
                />
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-text-primary)', marginBottom: 4 }}>
                  {s.label}
                </div>
                <div style={{ fontSize: 13, color: 'var(--gray-text-muted)' }}>
                  {s.subtext}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
