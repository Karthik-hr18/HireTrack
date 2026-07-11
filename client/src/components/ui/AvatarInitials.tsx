import React, { useMemo } from 'react';

interface AvatarInitialsProps {
  name: string;
  /** Avatar size in px. Defaults to 40 */
  size?: number;
  className?: string;
}

/**
 * Deterministic color palette — hue rotated across the visible spectrum.
 * Colors are muted enough to work on a dark background without halation.
 */
const PALETTE = [
  { bg: 'rgba(99, 102, 241, 0.20)',  color: '#818cf8' }, // indigo
  { bg: 'rgba(236, 72,  153, 0.20)', color: '#f472b6' }, // pink
  { bg: 'rgba(20,  184, 166, 0.20)', color: '#2dd4bf' }, // teal
  { bg: 'rgba(245, 158, 11,  0.20)', color: '#fbbf24' }, // amber
  { bg: 'rgba(139, 92,  246, 0.20)', color: '#a78bfa' }, // violet
  { bg: 'rgba(6,   182, 212, 0.20)', color: '#22d3ee' }, // cyan
  { bg: 'rgba(16,  185, 129, 0.20)', color: '#34d399' }, // emerald
  { bg: 'rgba(248, 113, 113, 0.20)', color: '#fca5a5' }, // rose
];

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) >>> 0;
  }
  return h;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export const AvatarInitials: React.FC<AvatarInitialsProps> = ({
  name,
  size = 40,
  className = '',
}) => {
  const { bg, color } = useMemo(() => {
    const index = hashName(name) % PALETTE.length;
    return PALETTE[index];
  }, [name]);

  const initials = useMemo(() => getInitials(name), [name]);
  const fontSize = Math.round(size * 0.38);

  return (
    <span
      className={`avatar-initials ${className}`.trim()}
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: '50%',
        backgroundColor: bg,
        color,
        fontSize,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-sans)',
        letterSpacing: '0.02em',
        userSelect: 'none',
        border: `1px solid ${color}33`,
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
};
