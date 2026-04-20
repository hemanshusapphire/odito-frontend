import { Check, X, Network, Verified } from "lucide-react"

const iconMap = {
  check_circle: Check,
  close: X,
  hub: Network,
  verified: Verified,
}

export default function PricingCard({
  name,
  price,
  description,
  features,
  popular = false,
  ctaText,
  ctaType,
  onCtaClick,
  isYearly,
}) {
  const displayPrice = typeof price === 'string' ? price : (isYearly ? price.yearly : price.monthly)

  return (
    <div
      className={`glass-card p-10 rounded-xl hover:scale-[1.02] transition-all duration-300 flex flex-col group ${
        popular ? 'glow-border scale-105 relative z-20 hover:scale-[1.07]' : 'border-outline-variant/10'
      }`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-on-primary-container text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
          Most Popular
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-xl font-bold text-on-surface mb-2">{name}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-black text-on-surface">{displayPrice}</span>
          {typeof price !== 'string' && (
            <span className="text-outline text-sm uppercase tracking-wider">/{isYearly ? 'year' : 'month'}</span>
          )}
        </div>
        {description && (
          <p className="mt-2 text-sm text-on-surface-variant">{description}</p>
        )}
      </div>

      <ul className="space-y-4 mb-10 flex-grow">
        {features.map((feature, index) => {
          const Icon = iconMap[feature.icon] || Check
          return (
            <li key={index} className={`flex items-center gap-3 ${popular ? 'text-on-surface' : 'text-on-surface-variant'} text-sm`}>
              <Icon className={`w-5 h-5 ${feature.included === false ? 'text-error' : popular ? 'text-primary' : 'text-primary'}`} />
              {feature.name}
            </li>
          )
        })}
      </ul>

      <button
        onClick={() => onCtaClick(ctaType)}
        className={`w-full py-4 rounded-xl font-bold transition-all active:scale-[0.98] ${
          popular
            ? 'bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-black hover:shadow-xl hover:shadow-primary/30'
            : 'border border-outline-variant text-on-surface hover:bg-surface-container-highest'
        }`}
      >
        {ctaText}
      </button>
    </div>
  )
}
