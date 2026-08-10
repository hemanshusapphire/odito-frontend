import React from 'react';
import theme from '../theme';
import PageShell from '../components/PageShell';
import SectionHeader from '../components/SectionHeader';
import { LightningIcon } from '../components/icons';
import PerformanceScoreCard from '../components/PerformanceScoreCard';
import CoreWebVitalsTable from '../components/CoreWebVitalsTable';
import ProcessingPlaceholder from '../components/ProcessingPlaceholder';

function scoreColor(score) {
  if (score === null || score === undefined) return theme.color.textMuted;
  if (score >= 85) return theme.color.green;
  if (score >= 50) return theme.color.amber;
  return theme.color.red;
}

/**
 * Homepage Audit PDF — Page 7 (Performance & Core Web Vitals).
 *
 * @param {object} props
 * @param {object} props.pdfData - homepageAuditPdfMapper output.
 */
export default function Page7Performance({ pdfData }) {
  const readiness = pdfData?.readiness || {};
  const performance = pdfData?.sections?.performance || {};

  return (
    <PageShell>
      <div style={{ marginTop: 30 }}>
        <SectionHeader icon={<LightningIcon />} label="Performance & Core Web Vitals" />
      </div>

      <div style={{ marginTop: 26 }}>
        {readiness.performanceReady === false ? (
          <ProcessingPlaceholder message="Performance analysis is still in progress." />
        ) : (
          <>
            <div style={{ display: 'flex', gap: 20 }}>
              <PerformanceScoreCard
                label="MOBILE SCORE"
                score={performance.mobile?.score}
                color={scoreColor(performance.mobile?.score)}
              />
              <PerformanceScoreCard
                label="DESKTOP SCORE"
                score={performance.desktop?.score}
                color={scoreColor(performance.desktop?.score)}
              />
            </div>

            <div style={{ marginTop: 16 }}>
              <CoreWebVitalsTable mobile={performance.mobile} desktop={performance.desktop} />
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
