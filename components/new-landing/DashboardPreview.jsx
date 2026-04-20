import { Check, Zap } from "lucide-react";

export default function DashboardPreview() {
  return (
    <section className="py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-8">
        <div className="glass-panel rounded-[48px] p-8 lg:p-20 relative overflow-hidden border-outline-variant/20">
          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-black mb-8 leading-tight">One Dashboard. <br/><span className="text-gradient">Infinite Insight.</span></h2>
              
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold">Real-time Rank Tracking</h5>
                    <p className="text-sm text-on-surface-variant">Monitor positions across 140+ countries and 50+ languages instantly.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold">Content Intelligence AI</h5>
                    <p className="text-sm text-on-surface-variant">Get semantic keyword suggestions based on high-ranking competitor pages.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold">API Access</h5>
                    <p className="text-sm text-on-surface-variant">Connect your data to Looker Studio, Tableau, or custom internal tools.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <img 
                alt="High-fidelity dashboard mockup" 
                className="relative rounded-2xl border border-outline-variant/30 w-full" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5SMi1E6WerZdhyjjd2_pYrS5eV1F2Ig6XUmmOQSXxfg8Isf85mEqANbWfyBcrkn5KFHYqv7RBqrQBwC0ABu5DfiQv4P1PkvzZrDgqmShO65E81zbiHOLSMykVvBbxW-k6crypXAE-4uEK3U6Ig4Fd_kyVRPfaoWmc1mrKdQcz8hZZ5sHalbvcQLasFzDZfQT9sqIQ53QaQ7yHhoFbNRx6iq5S_xhT_uP76PN8QXpPiqFtrMNMhVmFFKDBf2V39gZuZLhGrW1V6Jo"
              />
              
              {/* Floating UI Chip */}
              <div className="absolute -bottom-6 -left-6 glass-panel px-6 py-4 rounded-2xl shadow-2xl border-secondary/50">
                <div className="flex items-center gap-3">
                  <Zap className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Sync Speed</p>
                    <p className="text-sm font-bold">0.4s Global Latency</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Background Glow */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full"></div>
        </div>
      </div>
    </section>
  );
}
