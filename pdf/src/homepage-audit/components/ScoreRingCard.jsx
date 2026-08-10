import React from 'react';
import theme from '../theme';
import ScoreDonutRing from './ScoreDonutRing';

// scoreState is read directly from pdfData.scores.computed.scoreState —
// 'preliminary' renders a small absolutely-positioned corner badge with
// zero effect on the card's measured layout (see Page 1 plan: "Preliminary
// badge placement strategy"). 'final' renders nothing extra — the approved
// layout is unchanged.
export default function ScoreRingCard({ score, tierLabel, description, scoreState }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 490,
        minHeight: 270,
        border: `1.5px solid ${theme.color.orange}`,
        borderRadius: 20,
        padding: 36,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      {scoreState === 'preliminary' && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '3px 9px',
            borderRadius: 999,
            background: 'rgba(148,163,184,0.12)',
            border: `1px solid ${theme.color.textMuted}`,
          }}
        >
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: theme.color.amber,
            }}
          />
          <span
            style={{
              fontFamily: theme.font.display,
              fontWeight: 600,
              fontSize: 9,
              letterSpacing: '0.08em',
              color: theme.color.textSecondary,
            }}
          >
            PRELIMINARY
          </span>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <ScoreDonutRing score={score} />
        <span
          style={{
            fontFamily: theme.font.display,
            fontWeight: 600,
            fontSize: 20,
            color: theme.color.orange,
          }}
        >
          {tierLabel}
        </span>
      </div>

      <p
        style={{
          marginTop: 14,
          fontFamily: theme.font.display,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.15em',
          color: theme.color.textSecondary,
          textTransform: 'uppercase',
        }}
      >
        Overall Score
      </p>

      <p
        style={{
          marginTop: 10,
          fontSize: 13,
          color: '#e2e8f0',
          textAlign: 'center',
        }}
      >
        {description}
      </p>
    </div>
  );
}
