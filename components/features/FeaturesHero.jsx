export default function FeaturesHero() {
  return (
    <section className="relative px-8 pt-24 pb-32 overflow-hidden bg-surface">
      <div className="absolute -top-24 -left-24 w-96 h-96 radial-glow from-primary/10 opacity-50 blur-3xl"></div>
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] radial-glow from-secondary/10 opacity-40 blur-3xl"></div>
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="z-10">
          <span className="inline-block px-3 py-1 mb-6 text-xs font-bold uppercase tracking-[0.2em] text-secondary border border-secondary/20 rounded-full bg-secondary/5">
            Optimization Suite
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-on-background mb-8 leading-tight">
            Everything You Need to <span className="text-primary">Fix and Scale</span> Your SEO
          </h1>
          <p className="text-lg text-on-surface-variant mb-10 max-w-xl leading-relaxed">
            From technical audits to AI-powered fixes — Odito gives you complete visibility and control over your digital search performance.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_30px_rgba(160,120,255,0.4)] transition-all active:scale-95">
              Start Free Audit
            </button>
            <button className="glass-card px-8 py-4 rounded-xl font-bold text-lg text-on-surface hover:bg-surface-container-high transition-all">
              View Demo
            </button>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700"></div>
          <div className="glass-card rounded-2xl overflow-hidden border-outline-variant/20 shadow-2xl">
            <img
              className="w-full h-auto opacity-90 group-hover:scale-[1.02] transition-transform duration-700"
              alt="A futuristic dark mode software interface showing colorful SEO data visualizations"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJu5eZYs3QGfVHFas--PqFhrU7kRiCvUhKbI92upsMta6Dca2BQGEHePqLHQlfjB0QP7Up3qwwPke1PI-lAZ8R9jDRk9n7qtMdbV8DGn8AJMZXPDTP1hrV-jFahmToCi1tHHcfYu2heezgjsIMa3_uB2MH4U4LefwVJJqu5qgjS-PajzFg5CJZ5MAELh5lkEOEe_yYVm0kVip_8n1NIAelNZmjwDPpy0Ib7jftuUQ3XkuplpU0u7yKW2nPX__qpji1KhPEFHB12iA"
            />
          </div>
          <div className="absolute -bottom-6 -left-6 glass-card p-6 rounded-xl shadow-2xl">
            <div className="text-xs font-bold text-primary mb-1">HEALTH SCORE</div>
            <div className="text-3xl font-black text-on-background">
              98<span className="text-sm font-medium text-secondary ml-1">+12%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
