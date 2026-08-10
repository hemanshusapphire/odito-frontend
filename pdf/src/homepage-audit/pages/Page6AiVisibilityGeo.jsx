import React from 'react';
import PageShell from '../components/PageShell';
import SectionHeader from '../components/SectionHeader';
import { BrainIcon } from '../components/icons';
import LlmReachScoreCard from '../components/LlmReachScoreCard';
import AuditIssueCard from '../components/AuditIssueCard';

/**
 * Homepage Audit PDF — Page 6 (AI Visibility & GEO).
 *
 * @param {object} props
 * @param {object} props.pdfData - homepageAuditPdfMapper output.
 */
export default function Page6AiVisibilityGeo({ pdfData }) {
  const aiVisibility = pdfData?.sections?.aiVisibility || {};
  const failingChecks = (aiVisibility.checks || []).filter((c) => c.status !== 'pass');

  return (
    <PageShell>
      <div style={{ marginTop: 44 }}>
        <SectionHeader icon={<BrainIcon />} label="AI Visibility & GEO" />
      </div>

      <div style={{ marginTop: 26 }}>
        <LlmReachScoreCard label="LLM Reach Score" value={aiVisibility.score} />
      </div>

      <div
        style={{
          marginTop: 26,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 20,
        }}
      >
        {failingChecks.map((check) => (
          <AuditIssueCard
            key={check.ruleId || check.name}
            severity={check.severity}
            severityLabel={check.severityLabel}
            title={check.name}
            description={check.message}
            recommendation={check.recommendation}
            width="100%"
          />
        ))}
      </div>
    </PageShell>
  );
}
