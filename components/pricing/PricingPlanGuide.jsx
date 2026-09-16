const guide = [
  {
    name: "Starter",
    fit: "Individuals and small sites",
    detail:
      "One site, one full audit a month. A solid starting point if you're not yet running audits across multiple projects.",
  },
  {
    name: "Pro",
    fit: "Growing teams with a handful of sites",
    detail:
      "Five monthly credits and a larger page quota, for onboarding new projects and re-auditing existing ones without watching your limits closely.",
  },
  {
    name: "Premium",
    fit: "Agencies and larger sites",
    detail:
      "Ten credits, a 500-page crawl quota, and up to 30 tracked keywords per project — the most headroom among the fixed plans.",
  },
  {
    name: "Custom",
    fit: "Organizations that outgrow Premium",
    detail:
      "For teams whose credit, page, or keyword needs exceed Premium. Our team scopes a tailored allocation and dedicated support.",
  },
]

export default function PricingPlanGuide() {
  return (
    <section className="py-16 px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-on-surface mb-10 text-center">
          Which plan is right for you?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guide.map((item) => (
            <div key={item.name} className="glass-card p-6 rounded-xl border border-outline-variant/10">
              <h3 className="text-lg font-bold text-on-surface mb-1">{item.name}</h3>
              <p className="text-primary text-xs font-semibold uppercase tracking-wide mb-3">{item.fit}</p>
              <p className="text-on-surface-variant text-sm leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
