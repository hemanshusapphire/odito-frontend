import React from 'react';
import theme from '../theme';

// Generic "all checks passed" state — reusable across any section (this
// page uses it for Technical SEO; other sections can reuse it later with
// their own title/description/footerLabel).
export default function SuccessSummaryCard({ title, description, footerLabel }) {
  return (
    <div
      style={{
        border: `1.5px solid ${theme.color.green}`,
        borderRadius: 18,
        padding: '48px 40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 14,
          border: `2px solid ${theme.color.white}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path
            d="M5 12.5l4.5 4.5L19 7"
            stroke={theme.color.white}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <p
        style={{
          marginTop: 20,
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 22,
          color: theme.color.white,
        }}
      >
        {title}
      </p>

      <p
        style={{
          marginTop: 12,
          fontSize: 14,
          lineHeight: 1.6,
          color: theme.color.textSecondary,
          maxWidth: 480,
        }}
      >
        {description}
      </p>

      <div
        style={{
          marginTop: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.color.green }} />
        <span
          style={{
            fontFamily: theme.font.mono,
            fontSize: 13,
            color: theme.color.green,
          }}
        >
          {footerLabel}
        </span>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.color.green }} />
      </div>
    </div>
  );
}
