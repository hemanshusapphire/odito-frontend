import React from 'react';
import theme from '../theme';

const VARIANT_COLOR = {
  neutral: theme.color.white,
  critical: theme.color.red,
  warning: theme.color.amber,
  passed: theme.color.green,
};

export default function IssueStatCard({ value, label, variant = 'neutral' }) {
  const color = VARIANT_COLOR[variant] || VARIANT_COLOR.neutral;
  return (
    <div
      style={{
        width: 176,
        height: 68,
        background: theme.color.card,
        border: `1px solid ${theme.color.border}`,
        borderRadius: 12,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // Systematic spacing via flex `gap` on the parent, not a per-child
        // marginTop — guarantees identical spacing across every
        // IssueStatCard instance (Total Issues/Critical/Warnings/Passed)
        // since they all render through this one shared component.
        gap: 10,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <span
        style={{
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 26,
          color,
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 9,
          lineHeight: 1,
          letterSpacing: '0.1em',
          color: theme.color.textMuted,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  );
}
