import React from 'react';
import PageShell from '../components/PageShell';
import InlineSectionHeader from '../components/InlineSectionHeader';
import AuditIssueCard from '../components/AuditIssueCard';

// Page shows at most 6 issue cards (a fixed PDF page, not an infinite
// scroll) — critical/high first, then medium, then low. This is
// presentation/pagination logic only; the underlying checks array from
// the mapper is untouched.
const SEVERITY_RANK = { critical: 3, high: 3, medium: 2, warning: 2, low: 1 };
const MAX_VISIBLE_ISSUES = 6;

function sortBySeverity(checks) {
  return [...checks].sort((a, b) => {
    const rankA = SEVERITY_RANK[(a.severity || '').toLowerCase()] ?? 1;
    const rankB = SEVERITY_RANK[(b.severity || '').toLowerCase()] ?? 1;
    return rankB - rankA;
  });
}

/**
 * Homepage Audit PDF — Page 3 (On Page SEO).
 *
 * @param {object} props
 * @param {object} props.pdfData - homepageAuditPdfMapper output.
 */
export default function Page3OnPageSeo({ pdfData }) {
  const onPageSeo = pdfData?.sections?.onPageSeo || {};
  const failingChecks = (onPageSeo.checks || []).filter((c) => c.status !== 'pass');
  const visibleIssues = sortBySeverity(failingChecks).slice(0, MAX_VISIBLE_ISSUES);

  return (
    <PageShell>
      <div style={{ marginTop: 44 }}>
        <InlineSectionHeader label="On Page SEO" />
      </div>

      <div
        style={{
          marginTop: 38,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
        }}
      >
        {visibleIssues.map((check) => (
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
