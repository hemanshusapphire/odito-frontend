import React from 'react';
import theme from '../theme';
import PageShell from '../components/PageShell';
import FeatureCard from '../components/FeatureCard';
import CTA_FEATURES from '../presentation/ctaFeatures';

const FEATURES_PART_1 = CTA_FEATURES.slice(0, 3);

/**
 * Homepage Audit PDF — Page 11 (Audit Benefits, part 1 of 2).
 *
 * First half of the "Your Homepage Is Only Part Of The Story" CTA section —
 * title + intro copy + feature cards 1-3. Cards 4-6 plus the closing copy
 * and CTA button live on Page12FinalCta. Split purely to give each half its
 * own physical page (no CSS pagination tricks involved).
 */
export default function Page11AuditBenefits() {
  return (
    <PageShell>
      <p
        style={{
          marginTop: 40,
          fontFamily: theme.font.display,
          fontWeight: 600,
          fontSize: 33,
          color: theme.color.white,
        }}
      >
        Your Homepage Is Only Part Of The Story
      </p>
      <div style={{ marginTop: 18, height: 1, background: theme.color.border }} />

      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#cbd5e1' }}>
          This report analyzed only your homepage and provides a high-level snapshot of your website's current SEO, AI
          Visibility, Accessibility, and Performance.
        </p>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#cbd5e1' }}>
          While homepage audits can uncover important opportunities, many critical issues often exist across service
          pages, landing pages, product pages, blog content, and other key areas of your website.
        </p>
        <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#cbd5e1' }}>
          To understand your website's true visibility potential, a broader analysis is required.
        </p>
      </div>

      <div
        style={{
          marginTop: 26,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 18,
        }}
      >
        {FEATURES_PART_1.map((f) => (
          <FeatureCard key={f.number} number={f.number} title={f.title} bullets={f.bullets} />
        ))}
      </div>
    </PageShell>
  );
}
