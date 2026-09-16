import PricingPageClient from "./PricingPageClient"

// Split for the same reason as app/contact/page.jsx: the interactive pricing
// UI (yearly/monthly toggle, CTA routing) requires a Client Component, but
// `metadata` can only be exported from a Server Component — so this file
// stays server-only and just renders the client component.
export const metadata = {
  description:
    "Explore Odito.ai pricing plans for website audits, SEO monitoring, keyword tracking, AI recommendations, and powerful visibility insights.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return <PricingPageClient />
}
