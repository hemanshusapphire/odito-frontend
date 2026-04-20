export default function FinalCTA() {
  return (
    <section className="py-32 px-8 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 radial-glow from-primary/20 blur-[120px] opacity-40"></div>
      <div className="max-w-3xl mx-auto text-center relative z-10">
        <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 text-white">
          Start Fixing Your SEO Today
        </h2>
        <p className="text-xl text-on-surface-variant mb-12">
          Join thousands of high-performance teams scaling their search presence with Odito Velocity.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-primary text-on-primary font-black px-10 py-5 rounded-xl text-lg hover:shadow-[0_0_40px_rgba(208,188,255,0.4)] transition-all">
            Start Free Trial Now
          </button>
          <button className="glass-card text-on-surface font-black px-10 py-5 rounded-xl text-lg hover:bg-surface-container-high transition-all">
            Talk to Sales
          </button>
        </div>
      </div>
    </section>
  )
}
