import React from 'react';
import { Quote } from 'lucide-react';
import { ScrollReveal } from '../../../components/ui/ScrollReveal';

const STORY_VIDEO = '/assets/istockphoto-1723914138-640_adpp_is.mp4';

export const CompanyStory: React.FC = () => {
  return (
    <section id="company-story" style={{ padding: '90px 0', backgroundColor: '#0b0f19', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <div className="careers-container">
        <ScrollReveal>
          {/* Section Header */}
          <div style={{ maxWidth: 680, marginBottom: 60 }}>
            <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#818cf8', marginBottom: 12 }}>
              Inside HireTrack
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              A journey through how we work, build, and innovate together.
            </h2>
          </div>

          {/* Grid Block 1: Story & Culture Video (VIDEO 2) */}
          <div className="company-story-grid">
            <div
              className="careers-hero__image-wrapper animate-hero-image"
              style={{
                position: 'relative',
                overflow: 'hidden',
                height: 440,
                borderRadius: 'var(--radius-card-large)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
              }}
            >
              <video
                src={STORY_VIDEO}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/assets/careers_culture.png"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
              />
            </div>

            <div className="company-story-text">
              <h3 style={{ fontSize: 24, fontWeight: 700, color: '#f8fafc', marginBottom: 16 }}>
                Crafted for high impact and zero fluff
              </h3>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: '#94a3b8', marginBottom: 20 }}>
                We believe great engineering is born from small, focused teams with absolute autonomy. We don't measure success by hours seated or slide decks presented — we measure it by software shipped that real people rely on.
              </p>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: '#94a3b8' }}>
                From distributed systems to intuitive front-end design, every line of code is written with obsessive craft and respect for the end user.
              </p>
            </div>
          </div>

          {/* Quote & Value Card */}
          <div
            className="careers-card"
            style={{
              padding: 40,
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              borderRadius: 'var(--radius-card-large)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ backgroundColor: '#6366f1', color: '#fff', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)' }}>
                <Quote size={24} />
              </div>
              <div>
                <p style={{ fontSize: 20, fontWeight: 600, color: '#f8fafc', lineHeight: 1.5, marginBottom: 12 }}>
                  "We ship exclusively based on the quality of work and the care of our staff. I've never seen more agency and speed given to developers anywhere else."
                </p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#94a3b8' }}>
                  Christina H. — <span style={{ color: '#818cf8' }}>Head of Engineering</span>
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
