import React from 'react';
import theme from '../theme';

export default function ScoreCategoryCard({ label, value, color }) {
  const clamped = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div
      style={{
        width: 218,
        height: 116,
        border: `1.5px solid ${color}`,
        borderRadius: 11,
        padding: 19,
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        // Deterministic gap instead of space-between's implicit,
        // content-height-dependent distribution — guarantees identical,
        // deliberate breathing room between title/value/bar on all 6 cards.
        gap: 10,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <span
        style={{
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 12,
          lineHeight: 1,
          letterSpacing: '0.08em',
          color: theme.color.white,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 34,
          color,
          lineHeight: 1,
        }}
      >
        {value ?? '—'}
      </span>

      <div
        style={{
          position: 'relative',
          height: 3,
          borderRadius: 2,
          background: 'rgba(255,255,255,0.15)',
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
