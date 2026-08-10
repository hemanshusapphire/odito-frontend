import React from 'react';
import theme from '../theme';

export default function BusinessMetaRow({ icon, label, value }) {
  return (
    <div
      style={{
        border: `1px solid ${theme.color.border}`,
        borderRadius: 10,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        background: theme.color.card,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <span
        style={{
          // Already flex-centered (unlike the other badges fixed in this
          // pass) — adding lineHeight:1 only for full consistency, not
          // because this one was broken.
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          lineHeight: 1,
          gap: 6,
          padding: '5px 10px',
          borderRadius: 6,
          background: 'rgba(34,197,94,0.14)',
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 12,
          color: theme.color.green,
        }}
      >
        {icon}
        {label}
      </span>

      <span style={{ fontSize: 13.5, lineHeight: 1.5, color: '#e2e8f0', paddingTop: 2 }}>{value}</span>
    </div>
  );
}
