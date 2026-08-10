import React from 'react';
import theme from '../theme';

// Static content card — number badge, title, and a bullet list where each
// top-level bullet can optionally have plain (unmarked) indented sub-items.
export default function FeatureCard({ number, title, bullets }) {
  return (
    <div
      style={{
        border: `1px solid ${theme.color.border}`,
        borderRadius: 12,
        padding: '22px 20px',
        background: theme.color.card,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 30,
          height: 30,
          borderRadius: 6,
          border: `1px solid ${theme.color.green}`,
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 14,
          color: theme.color.green,
        }}
      >
        {number}
      </span>

      <p
        style={{
          marginTop: 16,
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 17,
          lineHeight: 1.3,
          color: theme.color.white,
          whiteSpace: 'pre-line',
        }}
      >
        {title}
      </p>

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {bullets.map((bullet, i) => (
          <div key={i}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span
                style={{
                  marginTop: 5,
                  width: 6,
                  height: 6,
                  flexShrink: 0,
                  background: theme.color.green,
                  transform: 'rotate(45deg)',
                }}
              />
              <span style={{ fontSize: 12.5, lineHeight: 1.55, color: '#cbd5e1' }}>{bullet.text}</span>
            </div>
            {bullet.subItems && (
              <div style={{ marginLeft: 14, marginTop: 4 }}>
                {bullet.subItems.map((sub, j) => (
                  <p key={j} style={{ fontSize: 12.5, lineHeight: 1.55, color: '#cbd5e1' }}>
                    - {sub}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
