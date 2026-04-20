import FeatureCard from "./FeatureCard"

const features = [
  {
    title: "Technical SEO Audit",
    description: "Detect crawl errors, sitemap inconsistencies, and robots.txt misconfigurations instantly.",
    icon: "analytics",
    color: "primary",
  },
  {
    title: "On-Page Analysis",
    description: "Deep-dive into meta tags, heading hierarchies, and semantic keyword structures.",
    icon: "search_insights",
    color: "secondary",
  },
  {
    title: "Performance Engine",
    description: "Real-time Core Web Vitals monitoring and granular load-speed optimization tips.",
    icon: "bolt",
    color: "tertiary",
  },
  {
    title: "Accessibility Checks",
    description: "Automated WCAG compliance audits and contrast ratio validation for search inclusivity.",
    icon: "accessibility_new",
    color: "error",
  },
  {
    title: "AI Engine",
    description: "Generative code fixes and smart recommendations powered by fine-tuned LLMs.",
    icon: "psychology",
    color: "primary-container",
  },
  {
    title: "Issue Prioritization",
    description: "Actionable impact scoring using our proprietary High/Med/Low severity matrix.",
    icon: "priority_high",
    color: "secondary-fixed",
  },
  {
    title: "Competitor Insights",
    description: "Shadow your rivals and identify content gaps before they become market losses.",
    icon: "compare_arrows",
    color: "tertiary-container",
  },
  {
    title: "Automated Reports",
    description: "Schedule white-labeled technical reports for stakeholders and executive teams.",
    icon: "auto_graph",
    color: "surface-tint",
  },
]

export default function FeaturesGrid() {
  return (
    <section className="bg-surface-container-lowest py-24 px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4 tracking-tight text-white">
            Precision Engineering for SEO
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">
            Our modular infrastructure addresses every critical search signal with surgical precision.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
