import PricingCard from "./PricingCard"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      { name: "1 Domain", icon: "check_circle", included: true },
      { name: "100 Pages scanned", icon: "check_circle", included: true },
      { name: "Weekly SEO reports", icon: "check_circle", included: true },
    ],
    popular: false,
    ctaText: "Start for free",
    ctaType: "pay_as_you_go",
  },
  {
    name: "Pro",
    price: { monthly: "$49", yearly: "$290" },
    description: "Best for growing businesses",
    features: [
      { name: "10 Domains", icon: "verified", included: true },
      { name: "5,000 Pages scanned", icon: "verified", included: true },
      { name: "AI Optimization insights", icon: "verified", included: true },
      { name: "Priority support", icon: "verified", included: true },
      { name: "Custom performance dashboard", icon: "verified", included: true },
    ],
    popular: true,
    ctaText: "Get Started Now",
    ctaType: "upgrade_premium",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      { name: "Unlimited Domains", icon: "hub", included: true },
      { name: "Custom Page limits", icon: "hub", included: true },
      { name: "SSO & SAML Integration", icon: "hub", included: true },
      { name: "Dedicated Success Manager", icon: "hub", included: true },
    ],
    popular: false,
    ctaText: "Contact Sales",
    ctaType: "enterprise",
  },
]

export default function PricingGrid({ isYearly, onCtaClick }) {
  return (
    <section className="py-16 px-8 relative overflow-visible">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <PricingCard
            key={index}
            {...plan}
            isYearly={isYearly}
            onCtaClick={onCtaClick}
          />
        ))}
      </div>
    </section>
  )
}
