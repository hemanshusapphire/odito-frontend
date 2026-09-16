/* ═══════════════════════════════════════════════════════════════
   Site Configuration
   
   Centralized app-wide constants.
   Import: import { siteConfig } from '@/config/site'
   ═══════════════════════════════════════════════════════════════ */

export const siteConfig = {
  name: "Odito",
  description: "AI-powered enterprise SEO + AI visibility auditing platform",
  // Single source of truth for the production origin used by metadataBase /
  // canonical URLs (see app/layout.js) — never hardcode the domain in any
  // individual page. Falls back to the real production domain (not
  // localhost) so canonical tags are always correct even if
  // NEXT_PUBLIC_APP_URL is left unset in a given environment.
  url: process.env.NEXT_PUBLIC_APP_URL || "https://oditoai.com",
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL,
  },
  features: {
    darkModeOnly: true,
    maxProjectsPerUser: 10,
  },
  meta: {
    title: "Odito — AI SEO Intelligence",
    description: "Enterprise-grade AI-powered SEO auditing and visibility platform",
  },
};
