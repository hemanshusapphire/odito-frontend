import React from "react";
import s from "../QuickAuditResult.module.css";

const childPages = [
  "/about-us/", "/app-development/", "/become-a-partner/", "/blog/",
  "/contact-us/", "/graphics-design/", "/local-seo/", "/national-seo/",
  "/pay-per-click/", "/pay-per-click-display/", "/pay-per-click-shopping-ads/",
  "/pay-per-click-youtube/", "/pricing-packages/", "/privacy-policy/",
  "/shopify-website/", "/sitemap/", "/social-media-advertisement/",
  "/social-media-management/", "/video-creation-content-marketing/",
  "/woocommerce-website/", "/wordpress-website/",
];

export default function ChildPagesSection() {
  return (
    <div className={s.section}>
      <div className={s.sectionTitle}>Review Child Pages</div>
      <div className={s.childGrid}>
        {childPages.map((p, i) => (
          <div key={i}>{p}</div>
        ))}
      </div>
    </div>
  );
}
