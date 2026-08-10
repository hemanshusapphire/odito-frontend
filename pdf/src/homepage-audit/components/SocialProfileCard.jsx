import React from 'react';
import theme from '../theme';

export default function SocialProfileCard({ platformKey, displayName, connected }) {
  const statusColor = connected ? theme.color.green : theme.color.red;

  return (
    <div
      style={{
        border: `1px solid ${theme.color.border}`,
        borderRadius: 11,
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // Deterministic gap on the parent instead of per-child marginTop —
        // guarantees identical, deliberate spacing rather than two
        // separately-hardcoded values that could drift out of sync.
        gap: 20,
        background: theme.color.card,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <img
        src={`/social-icons/${platformKey}.png`}
        alt={displayName}
        width={56}
        height={56}
        style={{ objectFit: 'contain' }}
      />

      <p
        style={{
          fontFamily: theme.font.display,
          fontSize: 16,
          lineHeight: 1,
          color: theme.color.white,
        }}
      >
        {displayName}
      </p>

      <span
        style={{
          // Same root cause and fix as AuditIssueCard's severity badge:
          // inline-block + symmetric padding does not guarantee visually
          // centered text (font baseline/line-height metrics are rarely
          // symmetric around the glyph). inline-flex centers by actual box
          // geometry instead.
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
          padding: '4px 10px',
          borderRadius: 6,
          border: `1px solid ${statusColor}`,
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 11,
          letterSpacing: '0.04em',
          color: statusColor,
        }}
      >
        {connected ? 'CONNECTED' : 'NOT FOUND'}
      </span>
    </div>
  );
}
