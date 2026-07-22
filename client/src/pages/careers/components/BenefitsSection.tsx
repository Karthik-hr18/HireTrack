import React from 'react';
import { Globe, GraduationCap, Heart, Cpu, TrendingUp, Laptop } from 'lucide-react';
import { ScrollReveal } from '../../../components/ui/ScrollReveal';

const BENEFITS = [
  {
    icon: Globe,
    title: 'Remote-First Freedom',
    description: 'Work from anywhere in the world. We equip you with home office stipends and flexible asynchronous hours.',
  },
  {
    icon: GraduationCap,
    title: 'Continuous Learning',
    description: '$2,500 annual budget for courses, books, conferences, and certifications of your choice.',
  },
  {
    icon: Heart,
    title: 'Comprehensive Health',
    description: 'Premium medical, dental, and mental health coverage for you and your family from day one.',
  },
  {
    icon: Cpu,
    title: 'Cutting-Edge Tech Stack',
    description: 'Build with Modern TypeScript, React, Node, PostgreSQL, and modern AI automation tools.',
  },
  {
    icon: TrendingUp,
    title: 'Accelerated Equity Growth',
    description: 'Competitive compensation packages with stock options so you own a meaningful share of our upside.',
  },
  {
    icon: Laptop,
    title: 'Top-Tier Equipment',
    description: 'Choice of latest MacBook Pro or Linux workstation, 4K display, ergonomic desk setup.',
  },
];

export const BenefitsSection: React.FC = () => {
  return (
    <section id="why-join" style={{ padding: '80px 0', backgroundColor: 'var(--gray-bg)', borderTop: '1px solid var(--gray-border)' }}>
      <div className="careers-container">
        <ScrollReveal>
          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: 600, margin: '0 auto 60px' }}>
            <p style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent)', marginBottom: 12 }}>
              Why Join HireTrack
            </p>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--gray-text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 16 }}>
              Designed for human flourishing and deep focus.
            </h2>
            <p style={{ fontSize: 16, color: 'var(--gray-text-muted)' }}>
              We provide everything you need to do the best work of your career without burnout.
            </p>
          </div>

          {/* Benefits Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {BENEFITS.map((b, idx) => {
              const IconComponent = b.icon;
              return (
                <div key={idx} className="careers-card careers-card--hover" style={{ padding: 32 }}>
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: 'rgba(79, 70, 229, 0.08)',
                    color: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20
                  }}>
                    <IconComponent size={24} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-text-primary)', marginBottom: 10 }}>
                    {b.title}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--gray-text-muted)', margin: 0 }}>
                    {b.description}
                  </p>
                </div>
              );
            })}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
