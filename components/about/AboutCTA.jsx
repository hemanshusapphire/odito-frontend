export default function AboutCTA() {
  return (
    <section className="py-40 px-8">
      <div className="max-w-5xl mx-auto glass-card rounded-[2rem] p-16 md:p-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10"></div>
        <div className="relative z-10">
          <h2 className="text-5xl md:text-6xl font-black tracking-tighter mb-8 text-white">
            Join Us in Redefining SEO
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="w-full sm:w-auto bg-primary text-on-primary-container px-10 py-4 rounded-xl font-bold text-lg hover:shadow-[0_0_30px_rgba(208,188,255,0.4)] transition-all">
              Create Free Account
            </button>
            <button className="w-full sm:w-auto border border-outline-variant/50 hover:bg-white/5 px-10 py-4 rounded-xl font-bold text-lg text-white transition-all">
              Contact Sales
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
