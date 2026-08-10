'use client';

import { useEffect, useState, use } from 'react';
import apiService from '@/lib/apiService';
import Page1CoverScoreOverview from '@/pdf/src/homepage-audit/pages/Page1CoverScoreOverview';
import Page2ScoreBreakdown from '@/pdf/src/homepage-audit/pages/Page2ScoreBreakdown';
import Page3OnPageSeo from '@/pdf/src/homepage-audit/pages/Page3OnPageSeo';
import Page4TechnicalSeo from '@/pdf/src/homepage-audit/pages/Page4TechnicalSeo';
import Page5SecurityAudit from '@/pdf/src/homepage-audit/pages/Page5SecurityAudit';
import Page6AiVisibilityGeo from '@/pdf/src/homepage-audit/pages/Page6AiVisibilityGeo';
import Page7Performance from '@/pdf/src/homepage-audit/pages/Page7Performance';
import Page8Accessibility from '@/pdf/src/homepage-audit/pages/Page8Accessibility';
import Page9SocialProfiles from '@/pdf/src/homepage-audit/pages/Page9SocialProfiles';
import Page10LocalBusiness from '@/pdf/src/homepage-audit/pages/Page10LocalBusiness';
import Page11AuditBenefits from '@/pdf/src/homepage-audit/pages/Page11AuditBenefits';
import Page12FinalCta from '@/pdf/src/homepage-audit/pages/Page12FinalCta';
import homepageAuditTheme from '@/pdf/src/homepage-audit/theme';

export default function HomepageAuditReportPage({ params: paramsPromise }) {
  const params = use(paramsPromise);
  const auditId = params?.auditId;

  const [pdfData, setPdfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!auditId) return;

    async function fetchData() {
      try {
        console.log('[HA_REPORT] Fetching PDF data for:', auditId);
        const res = await apiService.getHomepageAuditPdfData(auditId);
        if (!res?.success || !res?.data) {
          throw new Error(res?.message || 'Failed to load Homepage Audit PDF data');
        }
        setPdfData(res.data);
      } catch (err) {
        console.error('[HA_REPORT] Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [auditId]);

  useEffect(() => {
    if (!pdfData) return;

    async function checkReadiness() {
      // 1. Wait for document fonts to be ready
      try {
        await document.fonts.ready;
        console.log('[HA_REPORT] Fonts resolved');
      } catch (e) {
        console.warn('[HA_REPORT] Fonts failed to load, continuing anyway:', e);
      }

      // 2. Wait for images to load
      const images = Array.from(document.querySelectorAll('img'));
      const imagePromises = images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // don't block forever if image fails to load
        });
      });
      await Promise.all(imagePromises);
      console.log('[HA_REPORT] Images resolved');

      // 3. Mark PDF as ready
      window.__PDF_READY__ = true;
      console.log('[HA_REPORT] window.__PDF_READY__ set to true');
    }

    // Give a short layout flush delay before running readiness check
    const timer = setTimeout(checkReadiness, 500);
    return () => clearTimeout(timer);
  }, [pdfData]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: homepageAuditTheme.color.background,
        color: '#ffffff',
        fontFamily: homepageAuditTheme.font.display
      }}>
        Loading Report Data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: homepageAuditTheme.color.background,
        color: homepageAuditTheme.color.red,
        fontFamily: homepageAuditTheme.font.display
      }}>
        Error loading report: {error}
      </div>
    );
  }

  const pages = [
    <Page1CoverScoreOverview key="page1" pdfData={pdfData} />,
    <Page2ScoreBreakdown key="page2" pdfData={pdfData} />,
    <Page3OnPageSeo key="page3" pdfData={pdfData} />,
    <Page4TechnicalSeo key="page4" pdfData={pdfData} />,
    <Page5SecurityAudit key="page5" pdfData={pdfData} />,
    <Page6AiVisibilityGeo key="page6" pdfData={pdfData} />,
    <Page7Performance key="page7" pdfData={pdfData} />,
    <Page8Accessibility key="page8" pdfData={pdfData} />,
    <Page9SocialProfiles key="page9" pdfData={pdfData} />,
    <Page10LocalBusiness key="page10" pdfData={pdfData} />,
    <Page11AuditBenefits key="page11" />,
    <Page12FinalCta key="page12" />
  ];

  return (
    <div style={{ background: homepageAuditTheme.color.background }}>
      {/* Container for multi-page vertical stack */}
      <div className="pdf-container">
        {pages.map((page, index) => (
          <div
            key={index}
            style={{
              width: homepageAuditTheme.page.width, // 794px
              minHeight: homepageAuditTheme.page.height, // 1123px
              overflow: 'hidden',
              // Only force a break AFTER a page if there's another page
              // following it — forcing one after the last page makes Chrome
              // start a new physical page that never receives any content,
              // producing a trailing blank page in the PDF.
              ...(index !== pages.length - 1 && {
                pageBreakAfter: 'always',
                breakAfter: 'page',
              }),
              position: 'relative'
            }}
          >
            {page}
          </div>
        ))}
      </div>
      {/* Loaded indicator for Puppeteer */}
      <div id="report-loaded" style={{ display: 'none' }} />
    </div>
  );
}