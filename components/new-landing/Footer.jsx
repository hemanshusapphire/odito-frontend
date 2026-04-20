export default function Footer() {
  return (
    <footer className="w-full rounded-t-[40px] mt-20 bg-surface-container-low dark:bg-[#131318]">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-12 py-24 max-w-7xl mx-auto font-inter text-body-md leading-relaxed">
        <div className="col-span-1 md:col-span-1">
          <div className="text-xl font-bold tracking-tighter text-on-surface mb-6">Odito</div>
          <p className="text-on-surface-variant/70 text-sm">Empowering digital leaders with high-velocity ranking intelligence and precision SEO infrastructure.</p>
        </div>

        <div>
          <h4 className="text-primary font-semibold mb-6">Platform</h4>
          <ul className="space-y-4">
            <li>
              <a className="text-on-surface-variant/70 hover:text-secondary dark:hover:text-cyan-400 transition-colors hover:translate-x-1 inline-block" href="#">
                Integrations
              </a>
            </li>
            <li>
              <a className="text-on-surface-variant/70 hover:text-secondary dark:hover:text-cyan-400 transition-colors hover:translate-x-1 inline-block" href="#">
                API Docs
              </a>
            </li>
            <li>
              <a className="text-on-surface-variant/70 hover:text-secondary dark:hover:text-cyan-400 transition-colors hover:translate-x-1 inline-block" href="#">
                Status
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-primary font-semibold mb-6">Company</h4>
          <ul className="space-y-4">
            <li>
              <a className="text-on-surface-variant/70 hover:text-secondary dark:hover:text-cyan-400 transition-colors hover:translate-x-1 inline-block" href="#">
                Security
              </a>
            </li>
            <li>
              <a className="text-on-surface-variant/70 hover:text-secondary dark:hover:text-cyan-400 transition-colors hover:translate-x-1 inline-block" href="#">
                Contact
              </a>
            </li>
            <li>
              <a className="text-on-surface-variant/70 hover:text-secondary dark:hover:text-cyan-400 transition-colors hover:translate-x-1 inline-block" href="#">
                Careers
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-primary font-semibold mb-6">Legal</h4>
          <ul className="space-y-4">
            <li>
              <a className="text-on-surface-variant/70 hover:text-secondary dark:hover:text-cyan-400 transition-colors hover:translate-x-1 inline-block" href="#">
                Privacy Policy
              </a>
            </li>
            <li>
              <a className="text-on-surface-variant/70 hover:text-secondary dark:hover:text-cyan-400 transition-colors hover:translate-x-1 inline-block" href="#">
                Terms of Service
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-outline-variant/10 py-10 px-12 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-on-surface-variant/50">
        <p>© 2024 Odito Velocity. Built for performance.</p>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a className="hover:text-primary transition-colors" href="#">Twitter</a>
          <a className="hover:text-primary transition-colors" href="#">LinkedIn</a>
          <a className="hover:text-primary transition-colors" href="#">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
