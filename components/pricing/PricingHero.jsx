import PricingToggle from "./PricingToggle"

export default function PricingHero({ isYearly, setIsYearly }) {
  return (
    <section className="relative pt-40 pb-20 px-8">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <span className="text-primary tracking-[0.2em] font-semibold text-xs uppercase mb-4 block">
          Engineered for Performance
        </span>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-on-surface mb-8 leading-[1.1]">
          Simple, Transparent{" "}
          <span className="bg-gradient-to-r from-primary via-secondary to-tertiary bg-clip-text text-transparent">
            Pricing
          </span>
        </h1>
        <p className="text-on-surface-variant text-lg md:text-xl max-w-2xl mx-auto mb-12">
          High-performance SaaS precision scaled for your velocity. Choose the plan that aligns with your growth trajectory.
        </p>
        <PricingToggle isYearly={isYearly} setIsYearly={setIsYearly} />
      </div>
    </section>
  )
}
