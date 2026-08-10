import React from 'react';
import theme from '../theme';

// Static — logo mark, wordmark, divider. No props: branding is fixed for
// this report template, not per-audit data.
export default function BrandHeader() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            border: `2px solid ${theme.color.white}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke={theme.color.white} strokeWidth="2" />
            <path d="M7 12a5 5 0 0 1 5-5" stroke={theme.color.white} strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <span
          style={{
            // Root cause of the icon/wordmark misalignment: no explicit
            // lineHeight meant the text's default (asymmetric) line box
            // didn't match the icon's symmetric 44px circle, so the glyph
            // sat off the shared center axis even though flex align-items:
            // center was already centering both items' boxes correctly.
            fontFamily: theme.font.display,
            fontWeight: 600,
            fontSize: 26,
            lineHeight: 1,
            margin: 0,
            padding: 0,
            letterSpacing: '0.02em',
            color: theme.color.white,
          }}
        >
          LOGO
        </span>
      </div>
      <div
        style={{
          marginTop: 14,
          width: 350,
          height: 2,
          background: theme.color.white,
        }}
      />
    </div>
  );
}
