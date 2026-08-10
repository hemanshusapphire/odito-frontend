import React from 'react';
import PageShell from '../components/PageShell';
import SectionHeader from '../components/SectionHeader';
import SuccessSummaryCard from '../components/SuccessSummaryCard';
import AuditIssueCard from '../components/AuditIssueCard';
import { GearIcon } from '../components/icons';

/**
 * Homepage Audit PDF — Page 4 (Technical SEO).
 *
 * @param {object} props
 * @param {object} props.pdfData - homepageAuditPdfMapper output.
 */
export default function Page4TechnicalSeo({ pdfData }) {
  const technical = pdfData?.sections?.technicalSeo || {};
  const technicalFailing = (technical.checks || []).filter((c) => c.status !== 'pass');

  return (
    <PageShell>
      <div style={{ marginTop: 44 }}>
        <SectionHeader icon={<GearIcon />} label="Technical SEO" />
      </div>

      <div style={{ marginTop: 26 }}>
        {technicalFailing.length === 0 ? (
          <SuccessSummaryCard
            title="All Technical SEO Checks Passed"
            description={`All ${technical.checksCount ?? technical.checks?.length ?? 0} checks passed successfully — ${(technical.checks || [])
              .map((c) => c.name)
              .join(', ')}`}
            footerLabel="Excellent Performance"
          />
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
            {technicalFailing.map((check) => (
              <AuditIssueCard
                key={check.ruleId || check.name}
                severity={check.severity}
                severityLabel={check.severityLabel}
                title={check.name}
                description={check.message}
                recommendation={check.recommendation}
              />
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
