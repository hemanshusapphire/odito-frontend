import React from 'react';
import theme from '../theme';

// Shown when a readiness flag is false (readiness.performanceReady /
// readiness.accessibilityReady) — no raw snapshot fields are inspected,
// only the mapper's readiness booleans, per the mapper contract.
export default function ProcessingPlaceholder({ message }) {
  return (
    <div
      style={{
        border: `1px solid ${theme.color.border}`,
        borderRadius: 14,
        padding: '40px 32px',
        textAlign: 'center',
        background: theme.color.card,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <p
        style={{
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 15,
          color: theme.color.textSecondary,
        }}
      >
        {message}
      </p>
    </div>
  );
}
