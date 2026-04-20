import { Rocket, Eye, Code, Bolt, BarChart3 } from "lucide-react"

export default function AboutStory() {
  return (
    <>
      <section className="py-32 px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="space-y-8">
          <div className="w-16 h-1 bg-primary"></div>
          <h2 className="text-4xl font-bold tracking-tight text-white">Clarity in Complexity</h2>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            The world of SEO has become a labyrinth of fragmented data and shifting algorithms. We saw teams spending more time debating metrics than driving growth.
          </p>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Odito was born from the belief that AI shouldn't just provide more data—it should provide more clarity. We've built an engine that distills millions of signals into actionable paths, turning SEO from a guessing game into a precision science.
          </p>
        </div>
        <div className="relative group">
          <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-2xl group-hover:blur-3xl transition-all"></div>
          <img
            alt="Dashboard visualization"
            className="relative rounded-2xl border border-outline-variant/20 shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUG41xk115glfo0C0JtBzaF65-VtthJ_sS6GlZ4GqJBlb9vEq_V58wB-PPpA8MNmeyHvuNp87mvyjvGSpHqDTHVefQU2zSOpgfa0G_jvYex-h2OpbZGlxO4b2kP1KupjaSsBtE2p-dI3eoFOG4uq1hoQIgb4Ot6FBmfb8ItRy-XVnMzLpXsHBLee05nQltpYrQv9gyyUoCx02CgX4bP-f8zioUHSEt0Szt3QnZ6umAvutLM4Gvl0QVGiL13QoUY3ZN1Gq88c2NzI4"
          />
        </div>
      </section>

      <section className="py-24 px-8 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card p-12 rounded-2xl transition-all duration-300">
            <Rocket className="w-10 h-10 text-primary mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-white">Our Mission</h3>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Make SEO simple, actionable, and accessible for everyone. We lower the barrier to elite performance through intelligent automation.
            </p>
          </div>
          <div className="glass-card p-12 rounded-2xl transition-all duration-300">
            <Eye className="w-10 h-10 text-secondary mb-6" />
            <h3 className="text-2xl font-bold mb-4 text-white">Our Vision</h3>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Become the most intelligent SEO analysis platform powered by AI, setting the global standard for how digital growth is measured.
            </p>
          </div>
        </div>
      </section>

      <section className="py-32 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4 text-white">The Odito Advantage</h2>
          <p className="text-on-surface-variant">Engineering excellence meets marketing intelligence.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-8 rounded-xl transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
            <h4 className="text-lg font-bold mb-3 text-white">AI Insights</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Deep neural networks that identify patterns human audits miss.
            </p>
          </div>
          <div className="glass-card p-8 rounded-xl transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-6">
              <Code className="w-6 h-6 text-secondary" />
            </div>
            <h4 className="text-lg font-bold mb-3 text-white">Dev-First</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Built by engineers for engineers. Robust APIs and seamless SDKs.
            </p>
          </div>
          <div className="glass-card p-8 rounded-xl transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center mb-6">
              <Bolt className="w-6 h-6 text-tertiary" />
            </div>
            <h4 className="text-lg font-bold mb-3 text-white">Real-time</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Latency-free indexing that keeps you ahead of SERP volatility.
            </p>
          </div>
          <div className="glass-card p-8 rounded-xl transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6 text-error" />
            </div>
            <h4 className="text-lg font-bold mb-3 text-white">Actionable Reports</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              No fluff. Just clear directives to increase your organic visibility.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
