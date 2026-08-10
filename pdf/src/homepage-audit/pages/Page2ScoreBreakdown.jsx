import React from 'react';
import theme from '../theme';
import PageShell from '../components/PageShell';
import SectionLabel from '../components/SectionLabel';
import ScoreCategoryCard from '../components/ScoreCategoryCard';

const SCORE_CATEGORIES = [
  { key: 'ai', label: 'AI Visibility', color: theme.color.purple },
  { key: 'technical', label: 'Technical', color: theme.color.green },
  { key: 'performance', label: 'Performance', color: theme.color.orange },
  { key: 'accessibility', label: 'Accessibility', color: theme.color.cyan },
  { key: 'onPage', label: 'On Page', color: theme.color.green },
  { key: 'security', label: 'Security', color: theme.color.red },
];

/**
 * Homepage Audit PDF — Page 2 (Score Breakdown).
 *
 * @param {object} props
 * @param {object} props.pdfData - homepageAuditPdfMapper output.
 */
export default function Page2ScoreBreakdown({ pdfData }) {
  const scores = pdfData?.scores || {};

  return (
    <PageShell>
      <div style={{ marginTop: 38 }}>
        <SectionLabel text="Section 01" />
      </div>

      <div
        style={{
          marginTop: 95,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 218px)',
          gap: 20,
        }}
      >
        {SCORE_CATEGORIES.map((cat) => (
          <ScoreCategoryCard
            key={cat.key}
            label={cat.label}
            value={scores[cat.key]?.value}
            color={cat.color}
          />
        ))}
      </div>
    </PageShell>
  );
}
