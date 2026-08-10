import React from 'react';
import PageShell from '../components/PageShell';
import SectionHeader from '../components/SectionHeader';
import { AccessibilityIcon } from '../components/icons';
import AuditIssueCard from '../components/AuditIssueCard';
import ProcessingPlaceholder from '../components/ProcessingPlaceholder';

/**
 * Homepage Audit PDF — Page 8 (Accessibility).
 *
 * @param {object} props
 * @param {object} props.pdfData - homepageAuditPdfMapper output.
 */
export default function Page8Accessibility({ pdfData }) {
  const readiness = pdfData?.readiness || {};
  const accessibility = pdfData?.sections?.accessibility || {};
  const accessibilityFailing = (accessibility.checks || []).filter((c) => c.status !== 'pass');

  return (
    <PageShell>
      <div style={{ marginTop: 44 }}>
        <SectionHeader icon={<AccessibilityIcon />} label="Accessibility" />
      </div>

      <div style={{ marginTop: 26 }}>
        {readiness.accessibilityReady === false ? (
          <ProcessingPlaceholder message="Accessibility analysis is still in progress." />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
            }}
          >
            {accessibilityFailing.map((check) => (
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
        )}
      </div>
    </PageShell>
  );
}
