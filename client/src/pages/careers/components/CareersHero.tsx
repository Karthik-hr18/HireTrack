import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CareersHero: React.FC = () => {
  return (
    <section className="careers-hero">
      <div className="careers-container">
        <div className="careers-hero__grid">
          <div>
            <div className="careers-hero__badge">
              <Sparkles size={14} />
              <span>We Are Hiring · Global Remote Team</span>
            </div>

            <h1 className="careers-hero__title">
              Build Products <br />
              <span style={{ color: 'var(--accent)' }}>That Matter.</span>
            </h1>

            <p className="careers-hero__subtitle">
              We are a team of engineers, designers, and builders crafting next-generation talent infrastructure. Join us to shape the future of modern hiring.
            </p>

            <div className="careers-hero__actions">
              <a href="#open-positions" className="btn-primary-lg">
                Explore Open Roles <ArrowRight size={18} />
              </a>
              <a href="#company-story" className="btn-secondary-lg">
                Our Story
              </a>
            </div>
          </div>

          <div className="careers-hero__image-wrapper">
            <img 
              src="/assets/careers_hero.png" 
              alt="Engineers working at HireTrack" 
              className="careers-hero__image"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
