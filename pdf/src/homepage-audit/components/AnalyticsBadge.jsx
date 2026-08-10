import React from 'react';
import theme from '../theme';

// Static — fixed marketing copy, not audit data. No props.
export default function AnalyticsBadge() {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 16px',
        borderRadius: 999,
        background: 'rgba(34,211,238,0.08)',
        border: `1px solid rgba(34,211,238,0.35)`,
      }}
    >
      <span style={{ color: theme.color.cyan, fontSize: 13, lineHeight: 1 }}>⚡</span>
      <span
        style={{
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: '0.04em',
          color: theme.color.cyan,
        }}
      >
        Advanced Analytics Engine
      </span>
    </div>
  );
}
