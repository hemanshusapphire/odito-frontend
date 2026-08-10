import React from 'react';
import theme from '../theme';
import PageShell from '../components/PageShell';
import SectionHeader from '../components/SectionHeader';
import { PinIcon, PhoneIcon, GlobeIcon } from '../components/icons';
import BusinessInfoCard from '../components/BusinessInfoCard';
import BusinessRatingCard from '../components/BusinessRatingCard';
import BusinessMetaRow from '../components/BusinessMetaRow';
import ProcessingPlaceholder from '../components/ProcessingPlaceholder';

/**
 * Homepage Audit PDF — Page 10 (Local Business Presence).
 *
 * @param {object} props
 * @param {object} props.pdfData - homepageAuditPdfMapper output.
 */
export default function Page10LocalBusiness({ pdfData }) {
  const readiness = pdfData?.readiness || {};
  const localSeo = pdfData?.sections?.localSeo || {};

  return (
    <PageShell>
      <div style={{ marginTop: 44 }}>
        <SectionHeader icon={<PinIcon />} label="Local Business Presence" iconBg="#3730a3" />
      </div>

      <div style={{ marginTop: 26 }}>
        {readiness.gbpAvailable === false ? (
          <ProcessingPlaceholder message="Google Business Profile data is not available for this audit." />
        ) : (
          <>
            <BusinessInfoCard businessName={localSeo.businessName} category={localSeo.category} />
            <BusinessRatingCard rating={localSeo.rating} reviewCount={localSeo.reviewCount} />

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <BusinessMetaRow icon={<PinIcon color={theme.color.green} />} label="Address" value={localSeo.address} />
              <BusinessMetaRow icon={<PhoneIcon color={theme.color.green} />} label="Phone" value={localSeo.phone} />
              <BusinessMetaRow icon={<GlobeIcon color={theme.color.green} />} label="Website" value={localSeo.website} />
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
