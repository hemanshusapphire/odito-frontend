import React from 'react';
import theme from '../theme';

// Title + value + progress bar, in a bordered card. Generic (not hardcoded
// to "LLM Reach") so it's reusable for other single-metric score rows.
export default function LlmReachScoreCard({ label, value, color = theme.color.purple }) {
  const clamped = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div
      style={{
        border: `1px solid ${theme.color.border}`,
        borderRadius: 14,
        padding: '22px 28px',
        background: theme.color.card,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontFamily: theme.font.display,
            fontWeight: 600,
            fontSize: 19,
            color: theme.color.white,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: theme.font.display,
            fontWeight: 600,
            fontSize: 32,
            color,
          }}
        >
          {value ?? '—'}
        </span>
      </div>

      <div
        style={{
          marginTop: 16,
          position: 'relative',
          height: 6,
          borderRadius: 3,
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
            borderRadius: 3,
            background: color,
          }}
        />
      </div>
    </div>
  );
}
