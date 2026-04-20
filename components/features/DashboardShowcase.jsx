export default function DashboardShowcase() {
  return (
    <section className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-8">
        <div className="mb-16 text-center">
          <h2 className="text-4xl font-black mb-4 text-white">Command Center Control</h2>
          <p className="text-on-surface-variant">A unified interface for global SEO monitoring.</p>
        </div>
        <div className="relative group">
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-primary/20 blur-[100px] opacity-30"></div>
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-secondary/20 blur-[100px] opacity-30"></div>
          <div className="glass-card rounded-[2rem] overflow-hidden border-outline-variant/20 shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
            <img
              className="w-full h-auto opacity-95"
              alt="Wide shot of a professional analytics dashboard"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8q9HHXcs9JdR0cQIXVHhMIGiWPhHLqjDqMg5JXpai7xyGhjUwctqzeAekmX23vlruHKdpfVhQvjhNE6-Aaue_YxJTIQRucmO64qUw7eIItBKPOXE3p6cEpu8TlFDUxpDKqqN3l5AQUWZ-drMVWxYNPeVtpXV41k-H0QOKBW4ne-ua88d1_QC4lJUjroM3TRLxGiWj-PsJJIBl_yGHcRLced03XsoDKXsfihDQOnDyZSxnQEHVUTvobcX-L-_-Ekm3qZRjd7_KVPY"
            />
            <div className="absolute top-10 right-10 glass-card p-8 rounded-2xl shadow-2xl animate-pulse">
              <div className="text-xs font-black uppercase text-secondary mb-2">Live Impressions</div>
              <div className="text-5xl font-black tracking-tighter text-white">1.2M</div>
            </div>
            <div className="absolute bottom-10 left-10 glass-card p-6 rounded-2xl flex items-center gap-6 shadow-2xl">
              <div className="text-center">
                <div className="text-xs font-bold text-on-surface-variant uppercase mb-1">Health</div>
                <div className="text-2xl font-black text-green-400">92%</div>
              </div>
              <div className="w-px h-12 bg-outline-variant/30"></div>
              <div className="text-center">
                <div className="text-xs font-bold text-on-surface-variant uppercase mb-1">Growth</div>
                <div className="text-2xl font-black text-primary">+24%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
