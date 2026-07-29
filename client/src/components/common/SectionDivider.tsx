import React from 'react';

export const SectionDivider: React.FC = () => {
  return (
    <div style={{ position: 'relative', width: '100%', height: 1, overflow: 'visible', zIndex: 10 }}>
      <div
        style={{
          width: '100%',
          height: 1,
          background: 'linear-gradient(90deg, transparent 0%, rgba(99, 102, 241, 0.45) 30%, rgba(168, 85, 247, 0.45) 70%, transparent 100%)'
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: -12,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 340,
          height: 24,
          background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.35) 0%, transparent 75%)',
          pointerEvents: 'none',
          filter: 'blur(10px)'
        }}
      />
    </div>
  );
};
