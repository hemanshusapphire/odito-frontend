import React from 'react';
import theme from '../theme';

// Pure SVG ring — deterministic, no canvas, no CSS transition/animation.
// The interactive dashboard's equivalent ring animates strokeDashoffset on
// mount (`transition: stroke-dashoffset 0.5s ease-in-out`); that must NOT
// be present here — Puppeteer captures a single static frame, and an
// in-flight CSS transition would risk being captured mid-animation,
// rendering a partially-filled ring. This component sets the final
// strokeDashoffset value directly with no transition property at all.
export default function ScoreDonutRing({ score, size = 158, strokeWidth = 20 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score ?? 0));
  const filled = (clamped / 100) * circumference;
  const offset = circumference - filled;

  // Rotation is applied in native SVG space (a <g transform="rotate(...)">
  // attribute), NOT as a CSS `transform` on the <svg> root. html2canvas
  // (used to capture this page for the PDF) has well-known unreliable
  // handling of CSS transforms on SVG root elements — it can miscalculate
  // the rotated bounding box, which visually shifts the ring off-center
  // and can throw off where the arc appears to start. SVG-native <g>
  // rotation is geometry html2canvas parses directly and consistently, so
  // this is a root-cause fix, not a compensating offset.
  const center = size / 2;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <g transform={`rotate(-90 ${center} ${center})`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={theme.color.border}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={theme.color.orange}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </g>
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: theme.font.display,
            fontWeight: 600,
            fontSize: 42,
            lineHeight: 1,
            color: theme.color.white,
          }}
        >
          {clamped}
        </span>
      </div>
    </div>
  );
}
