const CHECK_GROUPS = [
  {
    title: "On-page SEO",
    items: "Title tags, meta descriptions, heading structure (H1–H6), hreflang usage, and page language.",
  },
  {
    title: "Technical SEO",
    items: "Canonical tags, SSL/HTTPS setup, robots.txt, XML sitemap, and structured data (schema.org) presence.",
  },
  {
    title: "Security headers",
    items: "Content-Security-Policy, HSTS, X-Frame-Options, and other response headers that protect your site.",
  },
  {
    title: "AI search visibility",
    items: "Identity schema, llms.txt, LLM readability, FAQ structured data, and content chunking — signals that affect how AI systems read and cite your page.",
  },
  {
    title: "Website performance",
    items: "Page speed and mobile/desktop performance scoring via Google PageSpeed Insights.",
  },
  {
    title: "Accessibility",
    items: "Automated axe-core checks for form labels, focus handling, and semantic landmarks.",
  },
  {
    title: "Social & local",
    items: "Open Graph and Twitter Card tags, plus Google Business Profile signals when a business is identified.",
  },
]

const AUDIENCE = [
  {
    who: "Business owners",
    detail: "get a plain-language read on whether their homepage is technically sound before investing further in marketing.",
  },
  {
    who: "Marketers",
    detail: "check on-page and AI-visibility signals before a campaign push, without waiting on a developer.",
  },
  {
    who: "SEO professionals",
    detail: "use it as a fast first-pass diagnostic before a deeper technical audit.",
  },
  {
    who: "Agencies",
    detail: "get a shareable starting point for a prospect or client conversation.",
  },
  {
    who: "Developers",
    detail: "see concrete, per-check explanations of missing tags, headers, or schema to fix directly in code.",
  },
]

export default function QuickAuditInfo() {
  return (
    <section className="bg-surface-container-lowest py-20 px-6 md:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-on-surface mb-4">
            What is the Odito Quick Audit?
          </h2>
          <p className="text-on-surface-variant text-base md:text-lg leading-relaxed">
            Quick Audit is Odito&apos;s free homepage audit tool. Enter any website&apos;s homepage URL and Odito
            crawls that single page to evaluate its SEO, technical, and AI search visibility signals. It&apos;s
            built for a fast, no-signup first look — not a full multi-page site crawl, which is what the full
            Odito platform handles once you&apos;re ready to go deeper.
          </p>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-on-surface mb-6">
            What the Quick Audit checks
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CHECK_GROUPS.map((group) => (
              <div key={group.title} className="glass-card p-6 rounded-xl border border-outline-variant/10">
                <h3 className="text-base font-bold text-on-surface mb-2">{group.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{group.items}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-on-surface mb-4">
              How the audit works
            </h2>
            <p className="text-on-surface-variant text-base leading-relaxed">
              Enter a homepage URL and confirm (or skip) a quick business-identification step. Odito then
              analyzes the page and evaluates the SEO, technical, and AI visibility checks above, while
              performance and accessibility scoring run in the background. As each result comes in, the page
              updates with pass/fail status per check, an explanation of the issue, and an overall score — no
              account required to see it.
            </p>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-on-surface mb-4">
              What you'll see in the results
            </h2>
            <p className="text-on-surface-variant text-base leading-relaxed">
              An overall grade for the homepage, plus a breakdown by category — on-page SEO, technical SEO,
              security, AI visibility, performance, accessibility, and social/local signals. Each check shows
              a pass or fail status with a plain-language explanation of what was found, so you know exactly
              what to fix and why it matters. Results can be exported as a PDF.
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-on-surface mb-6">
            Who is Quick Audit for?
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
            {AUDIENCE.map((a) => (
              <li key={a.who} className="text-on-surface-variant text-sm leading-relaxed">
                <strong className="text-on-surface">{a.who}</strong> {a.detail}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-on-surface mb-4">
            What happens after the Quick Audit?
          </h2>
          <p className="text-on-surface-variant text-base leading-relaxed">
            The Quick Audit checks a single homepage. If you want to audit more pages, track keywords over
            time, or re-run audits on a schedule, you can continue into the full Odito platform, where audits
            run across your whole site instead of just the homepage. Your Quick Audit result stays saved in
            your browser, so you can come back to it while deciding whether to go further.
          </p>
        </div>
      </div>
    </section>
  )
}
