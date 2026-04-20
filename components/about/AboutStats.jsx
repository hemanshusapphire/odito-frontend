export default function AboutStats() {
  return (
    <>
      <section className="py-40 px-8 relative overflow-hidden bg-surface-container">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{backgroundImage: "radial-gradient(circle at 50% 50%, #d0bcff 0%, transparent 70%)"}}></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-8 text-white">
            Built for clarity, not confusion.
          </h2>
          <div className="inline-flex items-center space-x-4 text-2xl md:text-3xl font-medium text-primary">
            <span>Performance</span>
            <span className="w-2 h-2 rounded-full bg-outline"></span>
            <span className="text-white">Accuracy Driven</span>
          </div>
        </div>
      </section>

      <section className="py-24 px-8 border-y border-outline-variant/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <div className="text-4xl md:text-5xl font-black text-white mb-2" style={{textShadow: "0 0 20px rgba(208, 188, 255, 0.4)"}}>
              10,000+
            </div>
            <div className="text-sm uppercase tracking-widest text-on-surface-variant font-bold">
              Audits
            </div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-white mb-2" style={{textShadow: "0 0 20px rgba(208, 188, 255, 0.4)"}}>
              500+
            </div>
            <div className="text-sm uppercase tracking-widest text-on-surface-variant font-bold">
              Enterprise Users
            </div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-white mb-2" style={{textShadow: "0 0 20px rgba(208, 188, 255, 0.4)"}}>
              1M+
            </div>
            <div className="text-sm uppercase tracking-widest text-on-surface-variant font-bold">
              Pages Indexed
            </div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black text-white mb-2" style={{textShadow: "0 0 20px rgba(208, 188, 255, 0.4)"}}>
              99.9%
            </div>
            <div className="text-sm uppercase tracking-widest text-on-surface-variant font-bold">
              Uptime
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
