import React, { useRef, useEffect } from "react";
import s from "./QuickAuditResult.module.css";
import HeroSection from "./quick-audit/HeroSection";
import HomepageVideoSection from "./quick-audit/HomepageVideoSection";
// import RecommendationsSection from "./quick-audit/RecommendationsSection"; // HIDDEN FOR NOW
import OnPageSeoSection from "./quick-audit/OnPageSeoSection";
import TechnicalSection from "./quick-audit/TechnicalSection";
import GeoSection from "./quick-audit/GeoSection";
import PerformanceSection from "./quick-audit/PerformanceSection";
import AccessibilitySection from "./quick-audit/AccessibilitySection";
import SocialSection from "./quick-audit/SocialSection";
import LocalSeoSection from "./quick-audit/LocalSeoSection";
import SecuritySection from "./quick-audit/SecuritySection";
//import ChildPagesSection from "./quick-audit/ChildPagesSection";

export default function QuickAuditResult({ data, businessContext }) {
  const resultRef = useRef(null);

  useEffect(() => {
    // Auto-scroll to results after component mounts with a delay
    const timer = setTimeout(() => {
      if (resultRef.current) {
        // Calculate offset to prevent navbar overlap (80px)
        const offset = 80;
        const elementPosition = resultRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    }, 250); // 250ms delay to ensure UI is rendered

    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={resultRef} className={s.wrap}>


      {/* Audit Title */}
      <div className={s.auditTitle}>
        Audit Results for <span>{data.page_info?.url || data.url || 'Unknown URL'}</span>
      </div>

      {/* Hero Section */}
      <HeroSection data={data} />

      {/* Homepage Audit Video Report CTA — lazy, user-triggered only */}
      <HomepageVideoSection auditId={data._audit_id} />

      {/* Sections */}
      {/* <RecommendationsSection data={data} /> */}
      <OnPageSeoSection data={data} />
      
      {/* Technical Section */}
      <div className="pt-12">
        <TechnicalSection data={data} />
      </div>
      
      {/* Security Section */}
      <div className="pt-12">
        <SecuritySection data={data} />
      </div>
      
      <GeoSection data={data} />
      <PerformanceSection data={data} />
      <AccessibilitySection data={data} />
      <SocialSection data={data} />
      <LocalSeoSection data={data} businessContext={businessContext} auditId={data._audit_id} />
      {/* <ChildPagesSection /> */}

      <div style={{ height: "40px" }}></div>
    </div>
  );
}
