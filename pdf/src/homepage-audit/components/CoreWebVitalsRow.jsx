import React from 'react';
import theme from '../theme';

// Ratings ('good' | 'needs-improvement' | 'poor') come pre-computed from the
// mapper (which already applies the shared CWV_THRESHOLDS_MS constants) —
// no thresholds are evaluated here, only rating -> color/text presentation.
const RATING_COLOR = {
  good: theme.color.green,
  'needs-improvement': theme.color.amber,
  poor: theme.color.red,
};

const RATING_RANK = { good: 0, 'needs-improvement': 1, poor: 2 };

function deriveStatus(mobileRating, desktopRating) {
  const mobileRank = RATING_RANK[mobileRating] ?? 0;
  const desktopRank = RATING_RANK[desktopRating] ?? 0;
  const worstRank = Math.max(mobileRank, desktopRank);

  if (worstRank === 0) return { text: 'GOOD', color: theme.color.green };
  if (worstRank === 1) return { text: 'NEEDS WORK', color: theme.color.amber };
  // worstRank === 2 (poor)
  if (mobileRank === 2 && desktopRank !== 2) return { text: 'POOR MOBILE', color: theme.color.red };
  if (desktopRank === 2 && mobileRank !== 2) return { text: 'POOR DESKTOP', color: theme.color.red };
  return { text: 'POOR', color: theme.color.red };
}

export default function CoreWebVitalsRow({ metric, mobileValue, mobileRating, desktopValue, desktopRating, isLast }) {
  const status = deriveStatus(mobileRating, desktopRating);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: isLast ? 'none' : `1px solid ${theme.color.border}`,
      }}
    >
      <span
        style={{
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 13,
          color: theme.color.white,
        }}
      >
        {metric}
      </span>
      <span
        style={{
          fontFamily: theme.font.mono,
          fontSize: 13,
          textAlign: 'center',
          color: RATING_COLOR[mobileRating] || theme.color.textSecondary,
        }}
      >
        {mobileValue ?? '—'}
      </span>
      <span
        style={{
          fontFamily: theme.font.mono,
          fontSize: 13,
          textAlign: 'center',
          color: RATING_COLOR[desktopRating] || theme.color.textSecondary,
        }}
      >
        {desktopValue ?? '—'}
      </span>
      <span style={{ textAlign: 'center' }}>
        <span
          style={{
            // Same root cause/fix as AuditIssueCard's severity badge:
            // inline-block + symmetric padding doesn't guarantee visually
            // centered text. inline-flex centers by actual box geometry.
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            padding: '4px 10px',
            borderRadius: 6,
            border: `1px solid ${status.color}`,
            fontFamily: theme.font.display,
            fontWeight: 600,
            fontSize: 10.5,
            color: status.color,
          }}
        >
          {status.text}
        </span>
      </span>
    </div>
  );
}
