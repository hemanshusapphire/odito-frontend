export default function Timeline() {
  return (
    <section className="py-32 bg-surface-container-lowest/50 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-8 relative z-10">
        <div className="text-center mb-24">
          <h2 className="text-4xl font-black tracking-tight">The Path to <span className="text-primary">Dominance.</span></h2>
        </div>
        
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary via-secondary to-transparent hidden md:block"></div>
          
          <div className="space-y-32">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12 group">
              <div className="md:w-1/2 md:text-right">
                <h4 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors">Ingest & Audit</h4>
                <p className="text-on-surface-variant">Connect your properties and let Odito conduct a forensic audit of your technical health and existing rankings.</p>
              </div>
              <div className="relative z-10 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(160,120,255,0.6)] border-4 border-surface">
                <span className="text-surface font-black">01</span>
              </div>
              <div className="md:w-1/2"></div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12 group">
              <div className="md:w-1/2 text-left">
                <h4 className="text-2xl font-bold mb-4 group-hover:text-secondary transition-colors">Target Intelligence</h4>
                <p className="text-on-surface-variant">Identify high-intent keyword gaps and discover "quick-win" opportunities where your authority is strongest.</p>
              </div>
              <div className="relative z-10 w-12 h-12 rounded-full bg-secondary flex items-center justify-center shadow-[0_0_20px_rgba(76,215,246,0.6)] border-4 border-surface">
                <span className="text-surface font-black">02</span>
              </div>
              <div className="md:w-1/2"></div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-12 group">
              <div className="md:w-1/2 md:text-right">
                <h4 className="text-2xl font-bold mb-4 group-hover:text-tertiary transition-colors">Automated Optimization</h4>
                <p className="text-on-surface-variant">Execute on-page fixes and backlink outreach through automated pipelines that scale with your growth.</p>
              </div>
              <div className="relative z-10 w-12 h-12 rounded-full bg-tertiary flex items-center justify-center shadow-[0_0_20px_rgba(173,198,255,0.6)] border-4 border-surface">
                <span className="text-surface font-black">03</span>
              </div>
              <div className="md:w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Radial Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full"></div>
    </section>
  );
}
