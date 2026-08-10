import React from 'react';
import PageShell from '../components/PageShell';
import AnalyticsBadge from '../components/AnalyticsBadge';
import ReportTitle from '../components/ReportTitle';
import AuditMetaLine from '../components/AuditMetaLine';
import SectionHeader from '../components/SectionHeader';
import { BarChartIcon } from '../components/icons';
import ScoreRingCard from '../components/ScoreRingCard';
import IssueStatsColumn from '../components/IssueStatsColumn';
import { getScorePresentation } from '../presentation/scorePresentation';

/**
 * Homepage Audit PDF — Page 1 (Cover + Overall Score Overview).
 *
 * @param {object} props
 * @param {object} props.pdfData - The homepageAuditPdfMapper output (the
 *   `data` field of GET /api/homepage-audit-pdf/:auditId/data). Only
 *   pdfData.metadata, pdfData.scores, and pdfData.issueSummary are read —
 *   never raw snapshot fields, and nothing is recalculated here.
 */
export default function Page1CoverScoreOverview({ pdfData }) {
  const metadata = pdfData?.metadata || {};
  const scores = pdfData?.scores || {};
  const issueSummary = pdfData?.issueSummary || {};
  const computed = scores.computed || {};

  const { label: tierLabel, description } = getScorePresentation(computed.overallScore);

  return (
    <PageShell brand="logo">
      <div style={{ marginTop: 50 }}>
        <AnalyticsBadge />
      </div>

      <div style={{ marginTop: 70 }}>
        <ReportTitle />
      </div>

      <div style={{ marginTop: 42 }}>
        <AuditMetaLine auditedAt={metadata.auditedAt} domain={metadata.domain} />
      </div>

      <div style={{ marginTop: 150 }}>
        <SectionHeader icon={<BarChartIcon />} label="OVERALL SCORE" />
      </div>

      <div style={{ marginTop: 30, display: 'flex', gap: 24 }}>
        <ScoreRingCard
          score={computed.overallScore}
          tierLabel={tierLabel}
          description={description}
          scoreState={computed.scoreState}
        />
        <IssueStatsColumn
          total={issueSummary.total}
          critical={issueSummary.critical}
          warnings={issueSummary.warnings}
          passed={issueSummary.passed}
        />
      </div>
    </PageShell>
  );
}
