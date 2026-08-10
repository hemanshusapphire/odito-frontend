import React from 'react';
import theme from '../theme';

// Static — fixed template title for this PDF product, not per-audit data.
// No props (see Page 1 plan: "static vs. dynamic title text is assumed,
// not confirmed" — revisit if multiple report variants are ever needed).
export default function ReportTitle() {
  const lineStyle = {
    fontFamily: theme.font.display,
    fontWeight: 600,
    fontSize: 48,
    lineHeight: 1.08,
    margin: 0,
  };
  return (
    <div>
      <p style={{ ...lineStyle, color: theme.color.white }}>SEO Audit &amp;</p>
      <p style={{ ...lineStyle, color: theme.color.cyan }}>AI Visibility Report</p>
    </div>
  );
}
