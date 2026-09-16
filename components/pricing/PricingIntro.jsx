export default function PricingIntro() {
  return (
    <section className="py-12 px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-on-surface mb-6">
          What you get with every Odito plan
        </h2>
        <div className="text-on-surface-variant text-base md:text-lg leading-relaxed space-y-4 text-left">
          <p>
            Odito is a website auditing and AI search visibility platform. Every plan runs the same
            core audit engine — a combination of technical SEO checks, on-page and accessibility
            analysis, performance scoring, and AI-driven visibility audits that show how your site is
            represented in AI-generated search answers. The plans below don&apos;t change what an audit
            checks; they change how much auditing capacity you have each month.
          </p>
          <p>
            Each plan is built around three simple limits: <strong className="text-on-surface">audit credits</strong>,
            which determine how many new project audits you can start per month; a{" "}
            <strong className="text-on-surface">page-crawl quota</strong>, the total number of pages Odito can
            crawl across your account in a billing cycle; and a{" "}
            <strong className="text-on-surface">keyword tracking limit</strong>, the number of keywords each
            individual project can monitor for ranking changes. Re-running an existing project — through
            a manual recrawl or a quick recheck of previously flagged issues — doesn&apos;t use up another
            credit, since credits are only spent when a new project is created.
          </p>
        </div>
      </div>
    </section>
  )
}
