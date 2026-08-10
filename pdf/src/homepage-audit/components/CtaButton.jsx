import React from 'react';
import theme from '../theme';

export default function CtaButton({ label }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <span
        style={{
          // Same root cause/fix as AuditIssueCard's severity badge:
          // inline-block + padding doesn't guarantee visually centered
          // text. inline-flex centers by actual box geometry.
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          padding: '18px 40px',
          borderRadius: 12,
          background: theme.color.orange,
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 17,
          color: '#111827',
          textAlign: 'center',
        }}
      >
        {label}
      </span>
    </div>
  );
}
