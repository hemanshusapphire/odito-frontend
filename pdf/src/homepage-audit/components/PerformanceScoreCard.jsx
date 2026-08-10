import React from 'react';
import theme from '../theme';

// Centered label + big score + progress bar, in a bordered card.
export default function PerformanceScoreCard({ label, score, color }) {
  const clamped = Math.max(0, Math.min(100, score ?? 0));
  return (
    <div
      style={{
        flex: 1,
        border: `1px solid ${theme.color.border}`,
        borderRadius: 14,
        padding: '28px 32px',
        background: theme.color.card,
        textAlign: 'center',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <span
        style={{
          fontFamily: theme.font.mono,
          fontSize: 14,
          letterSpacing: '0.15em',
          color: theme.color.textSecondary,
        }}
      >
        {label}
      </span>

      <p
        style={{
          marginTop: 12,
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 40,
          color,
        }}
      >
        {score ?? '—'}
      </p>

      <div
        style={{
          marginTop: 14,
          position: 'relative',
          height: 4,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.12)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${clamped}%`,
            borderRadius: 2,
            background: color,
          }}
        />
      </div>
    </div>
  );
}
