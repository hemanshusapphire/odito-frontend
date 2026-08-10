import React from 'react';
import theme from '../theme';
import PageShell from '../components/PageShell';
import FeatureCard from '../components/FeatureCard';
import CtaButton from '../components/CtaButton';
import CTA_FEATURES from '../presentation/ctaFeatures';

const FEATURES_PART_2 = CTA_FEATURES.slice(3, 6);

/**
 * Homepage Audit PDF — Page 12 (Final CTA, part 2 of 2).
 *
 * Second half of the "Your Homepage Is Only Part Of The Story" CTA section —
 * feature cards 4-6, then the closing copy and CTA button. Title + intro
 * copy + cards 1-3 live on Page11AuditBenefits.
 */
export default function Page12FinalCta() {
  return (
    <PageShell>
      <div
        style={{
          marginTop: 40,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 18,
        }}
      >
        {FEATURES_PART_2.map((f) => (
          <FeatureCard key={f.number} number={f.number} title={f.title} bullets={f.bullets} />
        ))}
      </div>

      <div style={{ marginTop: 26 }}>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, fontWeight: 600, color: theme.color.white }}>
          A homepage audit provides a valuable starting point. A Full Audit provides the complete picture.
        </p>
        <p style={{ marginTop: 6, fontSize: 13.5, lineHeight: 1.6, color: '#cbd5e1' }}>
          Analyze up to 25 pages, uncover hidden issues, receive AI-powered recommendations, track keyword
          performance, and gain access to dedicated SEO, AISO, AEO, GEO, Accessibility, and Optimization insights
          designed to help improve your website's visibility across both traditional search engines and modern AI
          platforms.
        </p>
      </div>

      <div style={{ marginTop: 34 }}>
        <CtaButton label="Ready To See What Your Entire Website Is Missing?" />
      </div>
    </PageShell>
  );
}
