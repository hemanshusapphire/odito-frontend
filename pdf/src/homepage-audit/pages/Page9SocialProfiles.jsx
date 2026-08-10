import React from 'react';
import PageShell from '../components/PageShell';
import SectionHeader from '../components/SectionHeader';
import { LinkIcon } from '../components/icons';
import SocialProfileGrid from '../components/SocialProfileGrid';
import RecommendationBanner from '../components/RecommendationBanner';
import { PLATFORM_DISPLAY_NAME, PLATFORM_DISPLAY_ORDER, buildSocialRecommendationMessage } from '../presentation/socialPresentation';

/**
 * Homepage Audit PDF — Page 9 (Social Profiles).
 *
 * @param {object} props
 * @param {object} props.pdfData - homepageAuditPdfMapper output.
 */
export default function Page9SocialProfiles({ pdfData }) {
  const socialPresence = pdfData?.sections?.socialPresence || {};
  const platforms = socialPresence.platforms || [];

  const byKey = Object.fromEntries(platforms.map((p) => [p.platform, p]));
  const orderedProfiles = PLATFORM_DISPLAY_ORDER
    .filter((key) => byKey[key])
    .map((key) => ({
      platformKey: key,
      displayName: PLATFORM_DISPLAY_NAME[key] || key,
      connected: byKey[key].connected,
    }));

  const recommendationMessage = buildSocialRecommendationMessage(platforms);

  return (
    <PageShell>
      <div style={{ marginTop: 44 }}>
        <SectionHeader icon={<LinkIcon />} label="Social Profiles" />
      </div>

      <div style={{ marginTop: 26 }}>
        <SocialProfileGrid profiles={orderedProfiles} />
      </div>

      {recommendationMessage && (
        <div style={{ marginTop: 26 }}>
          <RecommendationBanner message={recommendationMessage} />
        </div>
      )}
    </PageShell>
  );
}
