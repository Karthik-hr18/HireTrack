import React from 'react';
import { Quote, Play } from 'lucide-react';
import { ScrollReveal } from '../../../components/ui/ScrollReveal';
import { SectionDivider } from '../../../components/common/SectionDivider';

const STORY_VIDEO = '/assets/istockphoto-1723914138-640_adpp_is.mp4';

export const CompanyStory: React.FC = () => {
  return (
    <>
      <SectionDivider />
      <section id="company-story" style={{ padding: '90px 0', backgroundColor: '#0b0f19' }}>
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

            {/* Grid Block 1: Story & Culture Video (STYLISH MAC MEDIA FRAME) */}
            <div className="company-story-grid" style={{ marginBottom: 60 }}>
              <div
                style={{
                  padding: 1,
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.6) 0%, rgba(168, 85, 247, 0.4) 50%, rgba(59, 130, 246, 0.6) 100%)',
                  borderRadius: 20,
                  boxShadow: '0 25px 60px -10px rgba(99, 102, 241, 0.3)',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    backgroundColor: '#090d16',
                    borderRadius: 19,
                    overflow: 'hidden'
                  }}
                >
                  {/* Mac-Style Window Header */}
                  <div
                    style={{
                      height: 38,
                      padding: '0 16px',
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: '#ef4444' }} />
                      <div style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: '#f59e0b' }} />
                      <div style={{ width: 10, height: 10, borderRadius: 99, backgroundColor: '#10b981' }} />
                    </div>

                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Play size={10} style={{ color: '#10b981', fill: '#10b981' }} />
                      HireTrack Culture Stream · Live
                    </div>

                    <div style={{ fontSize: 10, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase' }}>
                      HD 60 FPS
                    </div>
                  </div>

                  {/* Video Area */}
                  <div style={{ position: 'relative', height: 410, overflow: 'hidden' }}>
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
                </div>
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
    </>
  );
};
