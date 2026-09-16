import Navbar from "@/components/new-landing/Navbar"
import Footer from "@/components/new-landing/Footer"

export const metadata = {
  title: "Privacy Policy | Odito.ai — Data Protection & Security",
  description:
    "Read the Odito.ai Privacy Policy to learn what data we collect, how we use it, and how we protect your information across our SEO audit platform.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 dark-overlay -z-10"></div>
      <div className="absolute inset-0 grid-pattern -z-10 opacity-50"></div>
      <div className="absolute inset-0 -z-10 opacity-15">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] bg-cyan-500/10"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[100px] bg-purple-500/10"></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent -z-10"></div>

      <Navbar />

      <main className="pt-40 pb-24 px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-on-surface mb-4">
            Privacy Policy
          </h1>
          <p className="text-on-surface-variant/70 text-sm mb-12">Last updated: September 2026</p>

          <div className="text-on-surface-variant text-base leading-relaxed space-y-8">
            <p>
              Odito.ai (&quot;Odito&quot;, &quot;we&quot;, &quot;us&quot;) provides an AI-powered SEO auditing
              and website optimization platform. This policy explains what information we collect when you
              use our website and audit tools, how we use it, and the choices you have.
            </p>

            <div>
              <h2 className="text-xl font-bold text-on-surface mb-3">Information we collect</h2>
              <p>
                When you create an account, we collect your name, email address, and password. When you run
                an audit, we collect the URL you submit and the resulting page data. If you subscribe to a
                paid plan, payment details are processed by our payment provider, Stripe — we do not store
                your card details ourselves. If you connect a Google account for integrations, we store the
                connection details needed to provide that feature.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-on-surface mb-3">How we use your information</h2>
              <p>
                We use this information to operate your account, run the audits you request, process
                payments, provide customer support, and improve the reliability and accuracy of our audit
                engine. We do not sell your personal information.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-on-surface mb-3">Third-party services</h2>
              <p>
                We rely on trusted third parties to operate Odito, including Stripe for payment processing
                and Google APIs for optional integrations you choose to connect. Each of these providers
                processes data under its own privacy policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-on-surface mb-3">Cookies</h2>
              <p>
                We use essential cookies to keep you signed in and to remember basic preferences. We do not
                use cookies to sell your data to third parties.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-on-surface mb-3">Data security</h2>
              <p>
                We apply reasonable technical and organizational safeguards to protect your data, including
                encrypted connections (HTTPS) and access controls on our systems. No method of transmission
                or storage is completely secure, but we work to protect your information appropriately.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-on-surface mb-3">Your rights</h2>
              <p>
                You can access, update, or delete your account information at any time from your account
                settings, or by contacting us directly. If you disconnect a Google integration, we stop
                using the associated access.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-on-surface mb-3">Changes to this policy</h2>
              <p>
                We may update this Privacy Policy from time to time. Material changes will be reflected by
                updating the date at the top of this page.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-on-surface mb-3">Contact us</h2>
              <p>
                If you have questions about this Privacy Policy or how we handle your data, contact us at{" "}
                <a href="mailto:hello@odito.ai" className="text-primary hover:underline">hello@odito.ai</a>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
