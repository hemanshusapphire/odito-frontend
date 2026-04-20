export default function AboutMission() {
  return (
    <section className="py-32 px-8 bg-surface-container-low">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="p-8 border-l border-primary/30">
          <h4 className="text-lg font-bold mb-4 text-white">Transparency</h4>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Open systems and honest data. No black boxes in our methodology.
          </p>
        </div>
        <div className="p-8 border-l border-secondary/30">
          <h4 className="text-lg font-bold mb-4 text-white">Innovation</h4>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Constantly pushing the boundaries of what AI can achieve in search.
          </p>
        </div>
        <div className="p-8 border-l border-tertiary/30">
          <h4 className="text-lg font-bold mb-4 text-white">Simplicity</h4>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Removing the noise to focus on what actually moves the needle.
          </p>
        </div>
        <div className="p-8 border-l border-error/30">
          <h4 className="text-lg font-bold mb-4 text-white">Performance</h4>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Relentless pursuit of speed and result-driven metrics.
          </p>
        </div>
      </div>
    </section>
  )
}
