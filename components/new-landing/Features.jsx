import { BarChart3, ShieldCheck, Brain, Link as LinkIcon, Rocket, Shield } from "lucide-react";

export default function Features() {
  return (
    <section className="py-32 px-8 max-w-7xl mx-auto">
      <div className="text-center mb-24 space-y-4">
        <h2 className="text-4xl font-black tracking-tight">Engineered for <span className="text-secondary">Growth.</span></h2>
        <p className="text-on-surface-variant max-w-2xl mx-auto">Advanced tools designed to dissect search engine algorithms and surface actionable opportunities.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Feature 1 */}
        <div className="glass-panel p-10 rounded-[32px] hover:-translate-y-2 transition-all duration-300 group hover:border-secondary/30">
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
            <BarChart3 className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="text-xl font-bold mb-4">Precision Analytics</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">Deep-dive into keyword performance with sub-second data refresh rates and high-fidelity trend visualization.</p>
        </div>

        {/* Feature 2 */}
        <div className="glass-panel p-10 rounded-[32px] hover:-translate-y-2 transition-all duration-300 group hover:border-primary/30">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-4">Site Vital Monitoring</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">Continuous health checks that alert you the moment a crawl error or performance regression occurs.</p>
        </div>

        {/* Feature 3 */}
        <div className="glass-panel p-10 rounded-[32px] hover:-translate-y-2 transition-all duration-300 group hover:border-tertiary/30">
          <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-colors">
            <Brain className="w-6 h-6 text-tertiary" />
          </div>
          <h3 className="text-xl font-bold mb-4">Neural Rank Prediction</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">Leverage our proprietary ML models to forecast how content changes will impact your SERP position.</p>
        </div>

        {/* Feature 4 */}
        <div className="glass-panel p-10 rounded-[32px] hover:-translate-y-2 transition-all duration-300 group hover:border-secondary/30">
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:bg-secondary/20 transition-colors">
            <LinkIcon className="w-6 h-6 text-secondary" />
          </div>
          <h3 className="text-xl font-bold mb-4">Authority Mapping</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">Visualize your backlink profile and identify high-value opportunities before your competitors do.</p>
        </div>

        {/* Feature 5 */}
        <div className="glass-panel p-10 rounded-[32px] hover:-translate-y-2 transition-all duration-300 group hover:border-primary/30">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-4">Velocity Pipelines</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">Automate content optimization workflows and bridge the gap between analysis and deployment.</p>
        </div>

        {/* Feature 6 */}
        <div className="glass-panel p-10 rounded-[32px] hover:-translate-y-2 transition-all duration-300 group hover:border-tertiary/30">
          <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center mb-6 group-hover:bg-tertiary/20 transition-colors">
            <Shield className="w-6 h-6 text-tertiary" />
          </div>
          <h3 className="text-xl font-bold mb-4">Enterprise Shield</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">Security-first infrastructure with SOC-2 compliance and granular access controls for global teams.</p>
        </div>
      </div>
    </section>
  );
}
