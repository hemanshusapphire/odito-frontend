export default function AboutHero() {
  return (
    <section className="relative min-h-[716px] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full"></div>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <span className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-[0.2em] uppercase bg-surface-container-high text-primary border border-outline-variant/30 rounded-full">
          Evolution of SEO
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-[1.1]">
          We're Building the{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-tertiary">
            Future
          </span>{" "}
          of SEO Intelligence
        </h1>
        <p className="text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed mb-10">
          Odito was created to simplify complex SEO problems using AI and precision-driven insights.
        </p>
      </div>
    </section>
  )
}
