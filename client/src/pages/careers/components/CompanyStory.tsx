import React from 'react';
import { Quote } from 'lucide-react';
import { ScrollReveal } from '../../../components/ui/ScrollReveal';

export const CompanyStory: React.FC = () => {
  return (
    <section id="company-story" style={{ padding: '80px 0', borderTop: '1px solid var(--gray-border)' }}>
      <div className="careers-container">
        <ScrollReveal>
          {/* Section Header */}
          <div style={{ maxWidth: 680, marginBottom: 60 }}>
            <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 12 }}>
              Inside HireTrack
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--gray-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              A journey through how we work, build, and innovate together.
            </h2>
          </div>

          {/* Grid Block 1: Story & Photo */}
          <div className="company-story-grid">
            <div className="company-story-img-wrapper">
              <img 
                src="/assets/careers_culture.png" 
                alt="Engineering team collaboration" 
                className="company-story-img"
              />
            </div>

            <div className="company-story-text">
              <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--gray-text-primary)', marginBottom: 16 }}>
                Crafted for high impact and zero fluff
              </h3>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--gray-text-muted)', marginBottom: 20 }}>
                We believe great engineering is born from small, focused teams with absolute autonomy. We don't measure success by hours seated or slide decks presented — we measure it by software shipped that real people rely on.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--gray-text-muted)' }}>
                From distributed systems to intuitive front-end design, every line of code is written with obsessive craft and respect for the end user.
              </p>
            </div>
          </div>

          {/* Quote & Value Card */}
          <div className="careers-card" style={{ padding: 40, backgroundColor: 'rgba(79, 70, 229, 0.03)', border: '1px solid rgba(79, 70, 229, 0.15)' }}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: 'var(--accent)', color: '#fff', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Quote size={24} />
              </div>
              <div>
                <p style={{ fontSize: 20, fontWeight: 600, color: 'var(--gray-text-primary)', lineHeight: 1.5, marginBottom: 12 }}>
                  "We ship exclusively based on the quality of work and the care of our staff. I've never seen more agency and speed given to developers anywhere else."
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-text-muted)' }}>
                  Christina H. — <span style={{ color: 'var(--gray-text-primary)' }}>Head of Engineering</span>
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
