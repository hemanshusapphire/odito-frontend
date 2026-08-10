import React from 'react';
import PageShell from '../components/PageShell';
import SectionHeader from '../components/SectionHeader';
import AuditIssueCard from '../components/AuditIssueCard';
import { LockIcon } from '../components/icons';

/**
 * Homepage Audit PDF — Page 5 (Security Audit).
 *
 * @param {object} props
 * @param {object} props.pdfData - homepageAuditPdfMapper output.
 */
export default function Page5SecurityAudit({ pdfData }) {
  const security = pdfData?.sections?.security || {};
  const securityFailing = (security.checks || []).filter((c) => c.status !== 'pass');

  return (
    <PageShell>
      <div style={{ marginTop: 44 }}>
        <SectionHeader icon={<LockIcon />} label="Security Audit" />
      </div>

      <div
        style={{
          marginTop: 26,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 20,
        }}
      >
        {securityFailing.map((check) => (
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
