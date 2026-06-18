/* ═══════════════════════════════════════════════════════════════
   Site Configuration
   
   Centralized app-wide constants.
   Import: import { siteConfig } from '@/config/site'
   ═══════════════════════════════════════════════════════════════ */

export const siteConfig = {
  name: "Odito",
  description: "AI-powered enterprise SEO + AI visibility auditing platform",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://odito.ai",
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
