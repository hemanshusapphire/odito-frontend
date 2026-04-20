import { BarChart3, ShieldCheck, Brain, Link as LinkIcon, Rocket, Shield, Zap, Activity } from "lucide-react"

const iconMap = {
  analytics: BarChart3,
  search_insights: ShieldCheck,
  bolt: Zap,
  accessibility_new: Activity,
  psychology: Brain,
  priority_high: Shield,
  compare_arrows: LinkIcon,
  auto_graph: BarChart3,
  schema: Brain,
  description: Activity,
}

export default function FeatureCard({ title, description, icon, color = "primary" }) {
  const Icon = iconMap[icon] || Activity

  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    tertiary: "text-tertiary",
    error: "text-error",
    "primary-container": "text-primary-container",
    "secondary-fixed": "text-secondary-fixed",
    "tertiary-container": "text-tertiary-container",
    "surface-tint": "text-surface-tint",
  }

  return (
    <div className="glass-card p-8 rounded-2xl hover:translate-y-[-8px] transition-all duration-300 group">
      <span className={`material-symbols-outlined ${colorClasses[color]} mb-6 scale-125`}>
        <Icon className="w-8 h-8" />
      </span>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-sm text-on-surface-variant leading-relaxed">{description}</p>
    </div>
  )
}
