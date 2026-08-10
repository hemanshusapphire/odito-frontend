import React from 'react';
import theme from '../theme';
import CoreWebVitalsRow from './CoreWebVitalsRow';

const METRICS = [
  { key: 'lcp', label: 'LCP' },
  { key: 'tbt', label: 'TBT' },
  { key: 'fcp', label: 'FCP' },
  { key: 'cls', label: 'CLS' },
];

// mobile/desktop shape: { fcp: {raw, rating}, lcp: {...}, tbt: {...}, cls: {...} }
// — exactly what homepageAuditPdfMapper's _buildCwvMetrics already produces.
export default function CoreWebVitalsTable({ mobile, desktop }) {
  return (
    <div
      style={{
        border: `1px solid ${theme.color.border}`,
        borderRadius: 14,
        overflow: 'hidden',
        background: theme.color.card,
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <p
        style={{
          padding: '20px 20px 16px',
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 19,
          color: theme.color.white,
        }}
      >
        Core Web Vitals
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          padding: '0 20px 12px',
        }}
      >
        {['Metric', 'Mobile', 'Desktop', 'Status'].map((h, i) => (
          <span
            key={h}
            style={{
              fontFamily: theme.font.display,
              fontWeight: 600,
              fontSize: 11.5,
              letterSpacing: '0.05em',
              color: theme.color.white,
              textTransform: 'uppercase',
              textAlign: i === 0 ? 'left' : 'center',
            }}
          >
            {h}
          </span>
        ))}
      </div>

      <div style={{ padding: '0 20px' }}>
        {METRICS.map((m, idx) => (
          <CoreWebVitalsRow
            key={m.key}
            metric={m.label}
            mobileValue={mobile?.[m.key]?.raw}
            mobileRating={mobile?.[m.key]?.rating}
            desktopValue={desktop?.[m.key]?.raw}
            desktopRating={desktop?.[m.key]?.rating}
            isLast={idx === METRICS.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
