import PricingCard from "./PricingCard"

// Mirrors odito_backend/src/config/plans.js — the single source of truth for
// plan pricing, quota limits, and feature availability. Credits, page quotas,
// keyword caps, and prices here must stay in sync with that file; nothing on
// this page should ever show a number that isn't backed by it.
const plans = [
  {
    name: "Starter",
    price: "$25",
    description: "For individuals and small sites launching their first SEO audit.",
    features: [
      { name: "1 audit credit / month", icon: "check_circle", included: true },
      { name: "100 pages crawled / month", icon: "check_circle", included: true },
      { name: "Track up to 5 keywords per project", icon: "check_circle", included: true },
      { name: "AI SEO & AI visibility audits", icon: "check_circle", included: true },
      { name: "Technical, accessibility & performance checks", icon: "check_circle", included: true },
      { name: "PDF audit reports", icon: "check_circle", included: true },
    ],
    popular: false,
    ctaText: "Start with Starter",
    ctaType: "pay_as_you_go",
  },
  {
    name: "Pro",
    price: "$99",
    description: "For growing teams running audits across more sites.",
    features: [
      { name: "5 audit credits / month", icon: "verified", included: true },
      { name: "250 pages crawled / month", icon: "verified", included: true },
      { name: "Track up to 15 keywords per project", icon: "verified", included: true },
      { name: "AI SEO & AI visibility audits", icon: "verified", included: true },
      { name: "Technical, accessibility & performance checks", icon: "verified", included: true },
      { name: "PDF audit reports", icon: "verified", included: true },
    ],
    popular: true,
    ctaText: "Get Started Now",
    ctaType: "upgrade_premium",
  },
  {
    name: "Premium",
    price: "$179",
    description: "For agencies and larger sites needing the most headroom.",
    features: [
      { name: "10 audit credits / month", icon: "hub", included: true },
      { name: "500 pages crawled / month", icon: "hub", included: true },
      { name: "Track up to 30 keywords per project", icon: "hub", included: true },
      { name: "AI SEO & AI visibility audits", icon: "hub", included: true },
      { name: "Technical, accessibility & performance checks", icon: "hub", included: true },
      { name: "PDF audit reports", icon: "hub", included: true },
    ],
    popular: false,
    ctaText: "Upgrade to Premium",
    ctaType: "upgrade_premium",
  },
  {
    name: "Custom",
    price: "Custom",
    description: "Tailored limits for agencies and organizations that need more than Premium.",
    features: [
      { name: "Custom audit credits", icon: "hub", included: true },
      { name: "Custom page-crawl quota", icon: "hub", included: true },
      { name: "Custom keyword tracking limits", icon: "hub", included: true },
      { name: "Dedicated support", icon: "hub", included: true },
    ],
    popular: false,
    ctaText: "Contact Sales",
    ctaType: "enterprise",
  },
]

export default function PricingGrid({ onCtaClick }) {
  return (
    <section className="py-16 px-8 relative overflow-visible">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {plans.map((plan, index) => (
          <PricingCard
            key={index}
            {...plan}
            onCtaClick={onCtaClick}
          />
        ))}
      </div>
    </section>
  )
}
