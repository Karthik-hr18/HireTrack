import React, { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  targetValue: string;
  durationMs?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  targetValue,
  durationMs = 1200,
  className = '',
  style,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [displayValue, setDisplayValue] = useState('0');
  const [hasAnimated, setHasAnimated] = useState(false);

  // Extract raw number and suffix (e.g. "150+" -> 150, "+")
  const numericMatch = targetValue.match(/^(\d+)(.*)$/);
  const targetNum = numericMatch ? parseInt(numericMatch[1], 10) : 0;
  const suffix = numericMatch ? numericMatch[2] : '';

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated || targetNum === 0) return;

    if (typeof IntersectionObserver === 'undefined') {
      setDisplayValue(targetValue);
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.unobserve(el);

          let startTimestamp: number | null = null;

          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / durationMs, 1);
            // Ease-out cubic formula for natural deceleration
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = Math.floor(easeProgress * targetNum);

            setDisplayValue(`${currentCount}${suffix}`);

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setDisplayValue(targetValue);
            }
          };

          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [targetValue, targetNum, suffix, durationMs, hasAnimated]);

  return (
    <div ref={ref} className={className} style={style}>
      {hasAnimated ? displayValue : `0${suffix}`}
    </div>
  );
};
