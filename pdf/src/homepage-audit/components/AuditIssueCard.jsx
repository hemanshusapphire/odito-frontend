import React from 'react';
import theme from '../theme';

// Generic issue card — accent top bar + severity badge + title + description
// + optional AI recommendation callout. Originally built as SeoIssueCard for
// Page 2's On-Page SEO issues; renamed/generalized here since it's already
// category-agnostic (nothing on-page-specific in its props) and Page 3
// reuses it as-is for Security issues. `width` is configurable (Page 2 uses
// a fixed 218px 3-column grid; Page 3 uses a 2-column grid where cards fill
// their grid cell) — defaults to 218 so Page 2's already-approved rendering
// is unchanged.
const SEVERITY_COLOR = {
  critical: theme.color.red,
  high: theme.color.red,
  medium: theme.color.amber,
  low: theme.color.green,
};

// Approved badge copy (Figma): critical/high share "CRITICAL", medium is
// "WARNING", low is "Low Level" — not a straight uppercase of the raw
// severity string, so callers can't just derive it inline.
const SEVERITY_LABEL = {
  critical: 'CRITICAL',
  high: 'CRITICAL',
  medium: 'WARNING',
  low: 'Low Level',
};

export default function AuditIssueCard({ severity, severityLabel, title, description, recommendation, width = 218 }) {
  const accent = SEVERITY_COLOR[severity] || theme.color.textMuted;
  const label = severityLabel || SEVERITY_LABEL[severity] || (severity || '').toUpperCase();

  return (
    <div
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        borderRadius: 11,
        // Every side declared explicitly and independently — no shorthand
        // `border` overridden by a separate `borderTop`. That
        // shorthand-plus-override pattern is the same class of ambiguous
        // CSS that caused the SVG-rotation bug on Page 1: html2canvas's
        // synthetic capture can miscalculate the effective border
        // thickness/box origin when a shorthand property is partially
        // overridden, which was eating into the badge's top clearance.
        borderTop: `4px solid ${accent}`,
        borderRight: `1px solid ${theme.color.border}`,
        borderBottom: `1px solid ${theme.color.border}`,
        borderLeft: `1px solid ${theme.color.border}`,
        overflow: 'hidden',
        boxSizing: 'border-box',
        breakInside: 'avoid',
        pageBreakInside: 'avoid',
      }}
    >
      <div
        style={{
          // Explicit, calculated top clearance (not a uniform side-effect
          // of a generic `padding`): 20px minimum gap + a buffer matching
          // the 4px top border, so the badge clears the border with margin
          // to spare even if a renderer's border-box math is slightly off.
          paddingTop: 24,
          paddingRight: 20,
          paddingBottom: 20,
          paddingLeft: 20,
        }}
      >
        <span
          style={{
            // Root cause of the vertical-centering bug: `inline-block` +
            // symmetric padding does NOT guarantee visually centered text —
            // inline-block content is positioned by the font's
            // baseline/line-height metrics, which are rarely symmetric
            // around the glyph (most fonts allocate more space above the
            // baseline than below, for ascenders/accents), so the glyph
            // sits low even with equal top/bottom padding. `inline-flex`
            // with alignItems/justifyContent centers the content in the
            // actual box geometrically, independent of font metrics.
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
            padding: '4px 10px',
            borderRadius: 6,
            border: `1px solid ${accent}`,
            fontFamily: theme.font.display,
            fontWeight: 600,
            fontSize: 11,
            color: accent,
          }}
        >
          {label}
        </span>

        <p
          style={{
            marginTop: 12,
            fontFamily: theme.font.display,
            fontWeight: 600,
            fontSize: 21,
            color: theme.color.white,
          }}
        >
          {title}
        </p>

        <p
          style={{
            marginTop: 10,
            fontSize: 13.5,
            lineHeight: 1.55,
            color: '#cbd5e1',
          }}
        >
          {description}
        </p>

        {recommendation && (
          <div
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 8,
              borderLeft: `2px solid ${theme.color.cyan}`,
              background: 'rgba(148,163,184,0.08)',
            }}
          >
            <p
              style={{
                fontFamily: theme.font.display,
                fontWeight: 600,
                fontSize: 10,
                letterSpacing: '0.06em',
                color: theme.color.cyan,
                textTransform: 'uppercase',
              }}
            >
              AI Recommendation
            </p>
            <p
              style={{
                marginTop: 6,
                fontSize: 12,
                lineHeight: 1.5,
                color: theme.color.textSecondary,
              }}
            >
              {recommendation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
