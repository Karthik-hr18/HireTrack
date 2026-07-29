import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

const VIDEO_SOURCES = [
  '/assets/istockphoto-1723914138-640_adpp_is.mp4',
  '/assets/istockphoto-2151261126-640_adpp_is.mp4'
];

export const CareersHero: React.FC = () => {
  const [activeVideoIdx, setActiveVideoIdx] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isEntered, setIsEntered] = useState<boolean>(false);
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const videoRef0 = useRef<HTMLVideoElement | null>(null);
  const videoRef1 = useRef<HTMLVideoElement | null>(null);

  // 1. Accessibility: Check prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 2. Randomize initial video selection on mount & set entrance state
  useEffect(() => {
    const randomInitial = Math.floor(Math.random() * VIDEO_SOURCES.length);
    setActiveVideoIdx(randomInitial);

    // Trigger hero entry animation after mount
    const timer = setTimeout(() => {
      setIsEntered(true);
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // 3. Cycle video cross-fade every 22 seconds
  useEffect(() => {
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setActiveVideoIdx((prevIdx) => (prevIdx + 1) % VIDEO_SOURCES.length);
    }, 22000);

    return () => clearInterval(interval);
  }, [prefersReducedMotion]);

  // 4. Tab Visibility API: Pause videos when tab is inactive to preserve performance
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isHidden = document.hidden;
      [videoRef0.current, videoRef1.current].forEach((v) => {
        if (!v) return;
        if (isHidden) {
          v.pause();
        } else {
          v.play().catch(() => {});
        }
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // 5. Scroll Effect: Hero content gradually fades & translates upward as user scrolls
  useEffect(() => {
    if (prefersReducedMotion) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrollProgress(scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReducedMotion]);

  // Calculate dynamic scroll opacity & translation for hero content
  const heroOpacity = prefersReducedMotion ? 1 : Math.max(0, 1 - scrollProgress / 380);
  const heroTranslateY = prefersReducedMotion ? 0 : Math.min(40, (scrollProgress / 380) * 40);

  return (
    <section className="careers-hero" style={{ position: 'relative', overflow: 'hidden', minHeight: '80vh', display: 'flex', alignItems: 'center', backgroundColor: '#0f172a' }}>
      {/* ── FULL-SCREEN BACKGROUND VIDEO LAYER ── */}
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
          transform: prefersReducedMotion ? 'scale(1)' : isEntered ? 'scale(1.0)' : 'scale(1.05)',
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

        {/* Video 0 */}
        <video
          ref={videoRef0}
          src={VIDEO_SOURCES[0]}
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
            opacity: activeVideoIdx === 0 ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
            zIndex: 2
          }}
        />

        {/* Video 1 */}
        <video
          ref={videoRef1}
          src={VIDEO_SOURCES[1]}
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
            opacity: activeVideoIdx === 1 ? 1 : 0,
            transition: 'opacity 1.5s ease-in-out',
            zIndex: 2
          }}
        />
      </div>

      {/* ── VIDEO OVERLAY (Semi-transparent dark gradient) ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, rgba(0, 0, 0, 0.65) 50%, rgba(0, 0, 0, 0.72) 100%)'
        }}
      />

      {/* ── HERO TEXT & BUTTONS CONTENT LAYER ── */}
      <div
        className="careers-container"
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          paddingTop: 100,
          paddingBottom: 100,
          opacity: heroOpacity,
          transform: `translateY(${heroTranslateY}px)`,
          transition: prefersReducedMotion ? 'none' : 'opacity 100ms linear, transform 100ms linear'
        }}
      >
        <div style={{ maxWidth: 680 }}>
          {/* Badge (Fade-in 600ms, Delay 0ms) */}
          <div
            className="careers-hero__badge"
            style={{
              opacity: prefersReducedMotion || isEntered ? 1 : 0,
              transform: prefersReducedMotion || isEntered ? 'translateY(0)' : 'translateY(20px)',
              transition: prefersReducedMotion ? 'none' : 'opacity 600ms ease-out, transform 600ms ease-out',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              borderColor: 'rgba(255, 255, 255, 0.25)',
              color: '#ffffff',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}
          >
            <Sparkles size={14} style={{ color: '#a5b4fc' }} />
            <span>We Are Hiring · Global Remote Team</span>
          </div>

          {/* Heading (Fade-in 600ms, Delay 150ms) */}
          <h1
            className="careers-hero__title"
            style={{
              opacity: prefersReducedMotion || isEntered ? 1 : 0,
              transform: prefersReducedMotion || isEntered ? 'translateY(0)' : 'translateY(24px)',
              transition: prefersReducedMotion ? 'none' : 'opacity 600ms ease-out 150ms, transform 600ms ease-out 150ms',
              color: '#ffffff',
              fontWeight: 800,
              textShadow: '0 2px 14px rgba(0, 0, 0, 0.5)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: 20
            }}
          >
            Build Products <br />
            <span style={{ color: '#a5b4fc', textShadow: '0 2px 14px rgba(0, 0, 0, 0.5)' }}>That Matter.</span>
          </h1>

          {/* Subtitle (Fade-in 600ms, Delay 300ms) */}
          <p
            className="careers-hero__subtitle"
            style={{
              opacity: prefersReducedMotion || isEntered ? 1 : 0,
              transform: prefersReducedMotion || isEntered ? 'translateY(0)' : 'translateY(24px)',
              transition: prefersReducedMotion ? 'none' : 'opacity 600ms ease-out 300ms, transform 600ms ease-out 300ms',
              color: 'rgba(255, 255, 255, 0.90)',
              textShadow: '0 1px 6px rgba(0, 0, 0, 0.5)',
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
            <a href="#open-positions" className="btn-primary-lg">
              Explore Open Roles <ArrowRight size={18} />
            </a>
            <a
              href="#company-story"
              className="btn-secondary-lg"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(8px)',
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
