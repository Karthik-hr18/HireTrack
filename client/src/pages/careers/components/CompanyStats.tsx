import React from 'react';
import { ScrollReveal } from '../../../components/ui/ScrollReveal';
import { AnimatedCounter } from '../../../components/ui/AnimatedCounter';
import { SectionDivider } from '../../../components/common/SectionDivider';

const STATS = [
  { value: '150+', label: 'Team Members', subtext: 'Collaborating across 5 continents' },
  { value: '40+', label: 'Countries', subtext: 'Fully remote & async culture' },
  { value: '5000+', label: 'Hires Powered', subtext: 'Through HireTrack platform' },
  { value: '98%', label: 'Satisfaction', subtext: 'Employee retention & approval' },
];

export const CompanyStats: React.FC = () => {
  return (
    <>
      <SectionDivider />
      <section style={{ padding: '70px 0', backgroundColor: '#0b0f19' }}>
        <div className="careers-container">
          <ScrollReveal>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
              {STATS.map((s, idx) => (
                <div 
                  key={idx} 
                  className="careers-card careers-card--hover" 
                  style={{
                    padding: '32px 28px',
                    textAlign: 'center',
                    backgroundColor: 'rgba(15, 23, 42, 0.65)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  <AnimatedCounter
                    targetValue={s.value}
                    style={{ 
                      fontSize: 44, 
                      fontWeight: 800, 
                      color: '#a5b4fc', 
                      letterSpacing: '-0.03em', 
                      lineHeight: 1, 
                      marginBottom: 8 
                    }}
                  />
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fafc', marginBottom: 4 }}>
                    {s.label}
                  </div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>
                    {s.subtext}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};
