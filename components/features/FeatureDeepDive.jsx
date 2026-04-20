import { Check } from "lucide-react"

export default function FeatureDeepDive() {
  const deepDives = [
    {
      badge: "INFRASTRUCTURE",
      badgeColor: "primary",
      title: "Technical SEO Audit Engine",
      description: "Our proprietary crawler mimics Googlebot's behavior at 10x the speed. We scan for broken links, redirect loops, and orphaned pages across millions of URLs in seconds.",
      features: [
        "10,000+ pages scanned per minute",
        "Multi-region crawling capabilities",
        "Javascript rendering support",
      ],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2JDAVZsh12TUOWGDuaoTgX5sLlYDvfGcOu2wHpaIrOgDCLWZy9bJJ4QYGESYeVxqqLQ57LNgchZdp53MfK0a1ny1n8zcLmYGFnLQbOsZ6iSQIWnZrv7zKQ6d9IcbVqnew4gQwOpR-AKkDIvS5TKwU49WqAMfl4AYxxSpkJCKvd-x-OHuMjWbyBOWjwnby0qnH5CwuOtbGkE5M9hh_FRREdpxl408R_rVkxbg-M7gvYOCW1KxUSaaPcan5UCTKkjhSyiqMPoLyOn0",
      progress: 89,
      reversed: false,
    },
    {
      badge: "AI & AUTOMATION",
      badgeColor: "secondary",
      title: "AI-Powered Fixes",
      description: "Don't just identify problems—solve them. Odito's AI Engine generates ready-to-deploy code fixes for sitemaps, schema markup, and meta tags.",
      features: [],
      image: null,
      codeExample: true,
      reversed: true,
    },
  ]

  return (
    <section className="py-24 px-8 space-y-32">
      {deepDives.map((dive, index) => (
        <div
          key={index}
          className={`max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 ${
            dive.reversed ? "lg:flex-row-reverse" : ""
          }`}
        >
          <div className="flex-1">
            <div
              className={`inline-flex items-center px-3 py-1 mb-6 rounded-full bg-${dive.badgeColor}/10 border border-${dive.badgeColor}/20 text-${dive.badgeColor} text-xs font-bold tracking-widest`}
            >
              {dive.badge}
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tighter text-white">
              {dive.title}
            </h2>
            <p className="text-lg text-on-surface-variant leading-relaxed mb-8">
              {dive.description}
            </p>
            {dive.features.length > 0 && (
              <ul className="space-y-4">
                {dive.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 font-semibold text-white">
                    <Check className="w-5 h-5 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
            {dive.codeExample && (
              <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-6 font-mono text-sm overflow-hidden">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/30"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/30"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/30"></div>
                </div>
                <div className="text-zinc-500">// Fix generated for missing Schema</div>
                <div className="text-primary-container">&lt;script type="application/ld+json"&gt;</div>
                <div className="pl-4 text-on-surface-variant">"@context": "https://schema.org",</div>
                <div className="pl-4 text-on-surface-variant">"@type": "Product",</div>
                <div className="text-primary-container">&lt;/script&gt;</div>
                <div className="mt-6">
                  <button className="bg-secondary text-on-secondary px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90">
                    Apply Fix
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 w-full bg-surface-container rounded-3xl p-4 border border-outline-variant/10 shadow-2xl relative">
            <div className="absolute -inset-4 radial-glow from-primary/10 blur-3xl opacity-30"></div>
            {dive.image ? (
              <>
                <img
                  className="rounded-2xl w-full h-80 object-cover opacity-80 mb-4"
                  alt="Technical infrastructure visualization"
                  src={dive.image}
                />
                <div className="glass-card p-6 rounded-xl">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold uppercase tracking-widest opacity-60 text-white">
                      Scan Progress
                    </span>
                    <span className="text-primary font-bold">{dive.progress}%</span>
                  </div>
                  <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full shadow-[0_0_10px_rgba(208,188,255,0.5)]"
                      style={{ width: `${dive.progress}%` }}
                    ></div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-6">
                <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-secondary scale-125">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <div>
                      <div className="font-bold text-white">Missing Breadcrumbs</div>
                      <div className="text-xs text-on-surface-variant">Recommended fix available</div>
                    </div>
                  </div>
                  <button className="text-secondary font-bold text-sm">Deploy</button>
                </div>
                <div className="glass-card p-6 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary scale-125">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <div>
                      <div className="font-bold text-white">Duplicate Title Tags</div>
                      <div className="text-xs text-on-surface-variant">AI rewriting active</div>
                    </div>
                  </div>
                  <button className="text-secondary font-bold text-sm">Deploy</button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </section>
  )
}
