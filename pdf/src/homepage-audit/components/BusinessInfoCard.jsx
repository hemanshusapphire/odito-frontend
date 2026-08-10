import React from 'react';
import theme from '../theme';

export default function BusinessInfoCard({ businessName, category }) {
  return (
    <div
      style={{
        border: `1px solid ${theme.color.border}`,
        borderRadius: 12,
        padding: '28px 26px',
        background: theme.color.card,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <p
        style={{
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 28,
          color: theme.color.white,
        }}
      >
        {businessName}
      </p>

      {category && (
        <span
          style={{
            // Same root cause/fix as AuditIssueCard's severity badge:
            // inline-block + symmetric padding doesn't guarantee visually
            // centered text (font baseline/line-height metrics aren't
            // symmetric around the glyph). inline-flex centers by actual
            // box geometry instead.
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            marginTop: 14,
            padding: '4px 12px',
            borderRadius: 6,
            border: `1px solid ${theme.color.green}`,
            fontFamily: theme.font.display,
            fontWeight: 600,
            fontSize: 12,
            color: theme.color.green,
          }}
        >
          {category}
        </span>
      )}
    </div>
  );
}
