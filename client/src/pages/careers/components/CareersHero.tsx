import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles, Shield, Zap, Globe } from 'lucide-react';

const HERO_VIDEO = '/assets/istockphoto-2151261126-640_adpp_is.mp4';

export const CareersHero: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isEntered, setIsEntered] = useState<boolean>(false);
  const [typedWords, setTypedWords] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 1. Accessibility: Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 2. Entrance Animation & Text Word-by-Word Generation
  useEffect(() => {
    const entranceTimer = setTimeout(() => {
      setIsEntered(true);
    }, 50);

    // Stagger word typing effect on opening
    const wordsInterval = setInterval(() => {
      setTypedWords((prev) => {
        if (prev >= 4) {
          clearInterval(wordsInterval);
          return 4;
        }
        return prev + 1;
      });
    }, 180);

    return () => {
      clearTimeout(entranceTimer);
      clearInterval(wordsInterval);
    };
  }, []);

  // 3. Tab Visibility API: Pause video when tab is inactive to preserve battery & performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!videoRef.current) return;
      if (document.hidden) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 4. Scroll Parallax Fade Effect
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      setScrollProgress(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  // Calculate dynamic scroll opacity & translation for hero content
  const heroOpacity = prefersReducedMotion ? 1 : Math.max(0, 1 - scrollProgress / 400);
  const heroTranslateY = prefersReducedMotion ? 0 : Math.min(40, (scrollProgress / 400) * 40);

  return (
    <section className="careers-hero" style={{ position: 'relative', overflow: 'hidden', minHeight: '85vh', display: 'flex', alignItems: 'center', backgroundColor: '#090d16' }}>
      {/* ── FULL-SCREEN BACKGROUND VIDEO (VIDEO 1) ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          zIndex: 1,
          pointerEvents: 'none',
          transform: prefersReducedMotion ? 'scale(1)' : isEntered ? 'scale(1.0)' : 'scale(1.06)',
          transition: prefersReducedMotion ? 'none' : 'transform 2.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Poster Image Fallback */}
        <img
          src="/assets/careers_hero.png"
          alt="Careers Hero Poster"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 0 : 1,
            transition: 'opacity 1s ease-in-out',
            zIndex: 1
          }}
        />

        {/* Video 1 */}
        <video
          ref={videoRef}
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onLoadedData={() => setIsLoaded(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 1s ease-in-out',
            zIndex: 2
          }}
        />
      </div>

      {/* ── UNIFIED DARK GRADIENT OVERLAY ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(9, 13, 22, 0.70) 0%, rgba(9, 13, 22, 0.82) 60%, rgba(9, 13, 22, 0.96) 100%)'
        }}
      />

      {/* ── FLOATING ASSEMBLING DECORATIVE PILLS ("Parts Come and Join") ── */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          right: '8%',
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          pointerEvents: 'none',
          opacity: prefersReducedMotion || isEntered ? 1 : 0,
          transform: prefersReducedMotion || isEntered ? 'translate(0, 0)' : 'translate(60px, -30px)',
          transition: prefersReducedMotion ? 'none' : 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 400ms'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', backgroundColor: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 99, color: '#e2e8f0', fontSize: 12, fontWeight: 600, backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <Zap size={14} style={{ color: '#fbbf24' }} /> High Impact Projects
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', backgroundColor: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: 99, color: '#e2e8f0', fontSize: 12, fontWeight: 600, backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', marginLeft: 30 }}>
          <Globe size={14} style={{ color: '#38bdf8' }} /> 100% Async Remote
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', backgroundColor: 'rgba(15, 23, 42, 0.75)', border: '1px solid rgba(52, 211, 153, 0.3)', borderRadius: 99, color: '#e2e8f0', fontSize: 12, fontWeight: 600, backdropFilter: 'blur(12px)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <Shield size={14} style={{ color: '#34d399' }} /> Top Tier Equity & Perks
        </div>
      </div>

      {/* ── HERO TEXT & BUTTONS CONTENT LAYER ── */}
      <div
        className="careers-container"
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          paddingTop: 110,
          paddingBottom: 100,
          opacity: heroOpacity,
          transform: `translateY(${heroTranslateY}px)`,
          transition: prefersReducedMotion ? 'none' : 'opacity 100ms linear, transform 100ms linear'
        }}
      >
        <div style={{ maxWidth: 680 }}>
          {/* Badge (Fade-in 600ms) */}
          <div
            className="careers-hero__badge"
            style={{
              opacity: prefersReducedMotion || isEntered ? 1 : 0,
              transform: prefersReducedMotion || isEntered ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion ? 'none' : 'opacity 600ms ease-out, transform 600ms ease-out',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              borderColor: 'rgba(129, 140, 248, 0.35)',
              color: '#c7d2fe',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.2)'
            }}
          >
            <Sparkles size={14} style={{ color: '#a5b4fc' }} />
            <span>We Are Hiring · Global Remote Team</span>
          </div>

          {/* Heading with Word-by-Word Generation / Shimmer Effect */}
          <h1
            className="careers-hero__title"
            style={{
              opacity: prefersReducedMotion || isEntered ? 1 : 0,
              transform: prefersReducedMotion || isEntered ? 'translateY(0)' : 'translateY(24px)',
              transition: prefersReducedMotion ? 'none' : 'opacity 600ms ease-out 150ms, transform 600ms ease-out 150ms',
              color: '#ffffff',
              fontWeight: 800,
              textShadow: '0 2px 16px rgba(0, 0, 0, 0.6)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: 20
            }}
          >
            <span style={{ opacity: typedWords >= 1 ? 1 : 0.2, transition: 'opacity 250ms ease-in' }}>Build </span>
            <span style={{ opacity: typedWords >= 2 ? 1 : 0.2, transition: 'opacity 250ms ease-in' }}>Products </span>
            <br />
            <span
              style={{
                opacity: typedWords >= 3 ? 1 : 0.2,
                transition: 'opacity 250ms ease-in',
                background: 'linear-gradient(135deg, #a5b4fc 0%, #c084fc 50%, #e879f9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            >
              That Matter.
            </span>
          </h1>

          {/* Subtitle (Fade-in 600ms, Delay 300ms) */}
          <p
            className="careers-hero__subtitle"
            style={{
              opacity: prefersReducedMotion || isEntered ? 1 : 0,
              transform: prefersReducedMotion || isEntered ? 'translateY(0)' : 'translateY(24px)',
              transition: prefersReducedMotion ? 'none' : 'opacity 600ms ease-out 300ms, transform 600ms ease-out 300ms',
              color: '#cbd5e1',
              textShadow: '0 1px 8px rgba(0, 0, 0, 0.5)',
              fontSize: 18,
              lineHeight: 1.6,
              marginBottom: 36,
              maxWidth: 540
            }}
          >
            We are a team of engineers, designers, and builders crafting next-generation talent infrastructure. Join us to shape the future of modern hiring.
          </p>

          {/* Action Buttons (Fade-in 600ms, Delay 450ms) */}
          <div
            className="careers-hero__actions"
            style={{
              opacity: prefersReducedMotion || isEntered ? 1 : 0,
              transform: prefersReducedMotion || isEntered ? 'translateY(0)' : 'translateY(24px)',
              transition: prefersReducedMotion ? 'none' : 'opacity 600ms ease-out 450ms, transform 600ms ease-out 450ms'
            }}
          >
            <a href="#open-positions" className="btn-primary-lg" style={{ backgroundColor: '#6366f1', color: '#ffffff', boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' }}>
              Explore Open Roles <ArrowRight size={18} />
            </a>
            <a
              href="#company-story"
              className="btn-secondary-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.10)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(12px)',
                textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)'
              }}
            >
              Our Story
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
