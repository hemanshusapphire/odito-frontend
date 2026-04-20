export default function PricingCTA() {
  return (
    <section className="py-24 px-8 mb-24">
      <div className="max-w-6xl mx-auto relative rounded-3xl overflow-hidden bg-surface-container-high p-12 md:p-24 text-center">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/10 blur-[100px]"></div>
        <div className="relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-on-surface mb-8 tracking-tighter">
            Start Your First SEO Audit Today
          </h2>
          <p className="text-on-surface-variant text-lg mb-12 max-w-xl mx-auto">
            Join thousands of high-growth teams using Odito to dominate the search rankings.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="px-10 py-5 bg-primary text-on-primary-container rounded-xl font-black text-lg hover:scale-105 transition-transform shadow-2xl shadow-primary/20">
              Get Started Free
            </button>
            <button className="px-10 py-5 border border-outline-variant text-on-surface rounded-xl font-bold text-lg hover:bg-surface-container-highest transition-colors">
              Book Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
