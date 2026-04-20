import { Verified } from "lucide-react"

export default function PricingToggle({ isYearly, setIsYearly }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center justify-center gap-4 mb-6">
        <span className="text-sm font-medium text-on-surface-variant">Monthly</span>
        <div
          onClick={() => setIsYearly(!isYearly)}
          className="w-14 h-7 bg-surface-container-highest rounded-full p-1 flex items-center cursor-pointer group"
        >
          <div className={`w-5 h-5 bg-primary rounded-full transition-all group-hover:shadow-[0_0_10px_rgba(208,188,255,0.5)] ${isYearly ? 'translate-x-7' : ''}`}></div>
        </div>
        <span className="text-sm font-medium text-on-surface">Yearly</span>
        <span className="bg-secondary-container/20 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full border border-secondary/20">
          SAVE 20%
        </span>
      </div>
      <p className="text-sm text-outline flex items-center justify-center gap-2">
        <Verified className="w-[18px] h-[18px]" />
        No credit card required to start
      </p>
    </div>
  )
}
