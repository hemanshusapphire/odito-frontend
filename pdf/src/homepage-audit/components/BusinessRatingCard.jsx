import React from 'react';
import theme from '../theme';

function Star({ fillPercent }) {
  // Two stacked star glyphs: a muted background star, and an amber star
  // clipped to fillPercent width — renders partial stars deterministically
  // (no canvas, no JS-computed geometry beyond a static percentage).
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: 18, height: 18 }}>
      <svg width="18" height="18" viewBox="0 0 24 24" style={{ position: 'absolute', top: 0, left: 0 }}>
        <path
          d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8-6.1-3.6-6.1 3.6 1.5-6.8-5.2-4.7 6.9-.7Z"
          fill={theme.color.border}
        />
      </svg>
      <span
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${fillPercent}%`,
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path
            d="M12 2.5l2.9 6.3 6.9.7-5.2 4.7 1.5 6.8-6.1-3.6-6.1 3.6 1.5-6.8-5.2-4.7 6.9-.7Z"
            fill={theme.color.amber}
          />
        </svg>
      </span>
    </span>
  );
}

export default function BusinessRatingCard({ rating, reviewCount }) {
  const value = typeof rating === 'number' ? rating : 0;
  const stars = [0, 1, 2, 3, 4].map((i) => Math.round(Math.max(0, Math.min(1, value - i)) * 100));

  return (
    <div
      style={{
        marginTop: 20,
        border: `1px solid ${theme.color.border}`,
        borderRadius: 12,
        padding: '20px 26px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: theme.color.card,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <span
        style={{
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 34,
          color: theme.color.white,
        }}
      >
        {value.toFixed(1)}
      </span>

      <span style={{ display: 'flex', gap: 3 }}>
        {stars.map((fillPercent, i) => (
          <Star key={i} fillPercent={fillPercent} />
        ))}
      </span>

      <span
        style={{
          // Same root cause/fix as AuditIssueCard's severity badge:
          // inline-block + symmetric padding doesn't guarantee visually
          // centered text. inline-flex centers by actual box geometry.
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          padding: '4px 12px',
          borderRadius: 6,
          border: `1px solid ${theme.color.green}`,
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 12,
          color: theme.color.green,
        }}
      >
        {reviewCount ?? 0} Reviews
      </span>
    </div>
  );
}
