import { ArrowRight } from "lucide-react"

export default function UseCases() {
  const useCases = [
    {
      title: "For Developers",
      description: "Automate SEO in your build pipeline. Get precise JSON reports and code fixes that fit into your existing PR workflow.",
      link: "Explore API",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCST09lRuAN7p5dHEJ_D0V5FzS6nzrw6RyaS2-dry-QW721TBEC6OyuffeFnb_bdQyrMr5xxsfxeR7T-XC-BAatpqy_g4GbSHMRnV-HEhbXOMxw_SBcCcoBwwGzJGfkpvwWGJJRfw7L5UebIcWu78xE9mcuNzin1Vy8nkGkrERuIeKyc62Ptw40G1m9au8pUh3xLKAHiDSvWl_wz9Y62T92MZw0Mg9ahNUHljltmTNIqsXj4Qa4YNkqfHzyIMXJHCn9ONfxSZIZvZs",
    },
    {
      title: "For Agencies",
      description: "Manage hundreds of clients from one dashboard. Deliver stunning, white-labeled automated reports that prove value.",
      link: "Scale Operations",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuArLicRq_HARzcQMHciwzQF4mrJSUi6ZO0IJh7aWo15qZcoNaJN5x8SViU97zLQpUzvI1ULTzzwL7KCRg_L7VOOME4wvxT8fnsb7h61Fuwnn7fQzhO7CllwmMts_o2DwlIdZH2EunhL3Z4lFS09i7TL5WXFqyYhrXBNgEaYWi8hKZSVARJzp0K4JqGzbU34cMC022tR4RvSwB_-MOZybI6aBBclSZt3x5TQ__XbBOUGOAEoXyWQkitLIwlmG_qnyCv2wT0rYRyWBZs",
    },
    {
      title: "For Founders",
      description: "Fix your SEO without hiring an expert. Let our AI guide your strategy and automate the technical heavy lifting.",
      link: "Get Started",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcEgM5yOHKm7eEfi7bdm2Vwe1PvrSWQYudVEeb45sg5LDr7d4qwYbXZ4WdJMICv8CwqQUcY-yTRH6rE8MPCSQxrYgUdMFjH8bm1CTqa3zgGqHxj53DBlQbm7gzy1xUGk1Dv0iQLmepvPLFclm6NzoUwY27iuha07-I7pWx5zXwbY_U0-UwCpYL-IlkE3fOfVa9FJMigZU0Ejoh8EILOIs2-_eWgxvNmuXBlUPKdt09W4oAwPDgf4GNwTL38JOWfi7Mtq68cr03A2w",
    },
  ]

  return (
    <section className="py-24 px-8 bg-surface-container">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {useCases.map((useCase, index) => (
            <div key={index} className="flex flex-col h-full">
              <img
                className="w-full h-48 object-cover rounded-2xl mb-8 grayscale hover:grayscale-0 transition-all duration-500 shadow-lg"
                alt={useCase.title}
                src={useCase.image}
              />
              <h3 className="text-2xl font-black mb-4 text-white">{useCase.title}</h3>
              <p className="text-on-surface-variant mb-6 leading-relaxed">{useCase.description}</p>
              <a className="mt-auto text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all" href="#">
                {useCase.link} <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
