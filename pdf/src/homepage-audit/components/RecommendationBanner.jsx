import React from 'react';
import theme from '../theme';

export default function RecommendationBanner({ message }) {
  if (!message) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '16px 20px',
        borderRadius: 10,
        background: 'rgba(217,119,6,0.14)',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1, flexShrink: 0 }}>⚠️</span>
      <span
        style={{
          fontSize: 14,
          color: theme.color.amber,
        }}
      >
        {message}
      </span>
    </div>
  );
}
