const faqs = [
  {
    question: "What's included in an Odito audit?",
    answer:
      "Technical SEO checks, on-page and accessibility analysis, performance scoring, and an AI visibility audit with prioritized recommendations — the same audit engine on every plan.",
  },
  {
    question: "How many pages can I audit?",
    answer:
      "Each plan includes a monthly page-crawl quota — 100 on Starter, 250 on Pro, 500 on Premium — shared across your projects. Need more before renewal? Purchase extra page capacity without upgrading.",
  },
  {
    question: "Can I track keywords?",
    answer:
      "Yes, every project tracks ranking changes for up to 5 keywords on Starter, 15 on Pro, and 30 on Premium. Custom plans can scope a higher allocation.",
  },
  {
    question: "Are Google integrations available?",
    answer:
      "Yes, you can connect a Google account to a project. Which integration features become active depends on the connected account's data, not your plan tier.",
  },
  {
    question: "Can I run additional recrawls?",
    answer:
      "Manual recrawls and quick rechecks of an existing project don't use a credit — credits are only spent when you create a new project. Projects can also be set to recrawl automatically on a recurring schedule.",
  },
  {
    question: "What happens when I reach a plan limit?",
    answer:
      "You can wait for your next billing cycle, when credits and pages reset, or purchase additional credits or pages instantly without changing plans.",
  },
]

export default function PricingFAQ() {
  return (
    <section className="py-16 px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-black tracking-tight text-on-surface mb-10 text-center">
          Pricing FAQ
        </h2>
        <div className="space-y-6">
          {faqs.map((item) => (
            <div key={item.question} className="border-b border-outline-variant/10 pb-6 last:border-b-0">
              <h3 className="text-base font-bold text-on-surface mb-2">{item.question}</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
