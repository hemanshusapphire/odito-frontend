"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/new-landing/Navbar";
import Footer from "@/components/new-landing/Footer";
import {
  ShieldCheck,
  Scale,
  CreditCard,
  Globe,
  Bot,
  Sparkles,
  Lock,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Search,
  Copy,
  Check,
  Printer,
  ExternalLink,
  ChevronRight,
  ArrowUp,
  FileText,
  Mail,
  RefreshCw,
  SlidersHorizontal,
  Server,
  Zap,
} from "lucide-react";

export default function TermsPageClient() {
  const [activeSection, setActiveSection] = useState("acceptance");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSection, setCopiedSection] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Track scroll position for active section & back to top
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const sectionElements = document.querySelectorAll("[data-terms-section]");
      let current = "";
      const scrollY = window.scrollY + 200;

      sectionElements.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
          current = section.getAttribute("id");
        }
      });

      if (current) {
        setActiveSection(current);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Copy anchor link
  const handleCopyAnchor = (id) => {
    const url = `${window.location.origin}/terms#${id}`;
    navigator.clipboard.writeText(url);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  // Copy full page link
  const handleCopyPageUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Section definitions
  const sections = useMemo(
    () => [
      {
        id: "acceptance",
        number: "01",
        title: "Acceptance of Terms & Eligibility",
        category: "general",
        icon: <ShieldCheck className="size-5 text-cyan-400" />,
        summary:
          "By accessing Odito.ai, running an audit, or creating an account, you agree to these legally binding terms.",
      },
      {
        id: "services",
        number: "02",
        title: "Description of Odito Services",
        category: "platform",
        icon: <Sparkles className="size-5 text-purple-400" />,
        summary:
          "Overview of AI SEO audits, crawling infrastructure, Core Web Vitals diagnostics, and generative search tools.",
      },
      {
        id: "accounts",
        number: "03",
        title: "User Accounts, Workspaces & Security",
        category: "general",
        icon: <Lock className="size-5 text-emerald-400" />,
        summary:
          "Your obligations regarding account credentials, workspace management, and security notifications.",
      },
      {
        id: "billing",
        number: "04",
        title: "Subscriptions, Payments & Cancellation",
        category: "billing",
        icon: <CreditCard className="size-5 text-amber-400" />,
        summary:
          "Monthly/annual recurring plans via Stripe, cancellation procedures, and refund policy conditions.",
      },
      {
        id: "crawling",
        number: "05",
        title: "Authorized Website Crawling & Audits",
        category: "platform",
        icon: <Server className="size-5 text-blue-400" />,
        summary:
          "User warranty that you hold explicit authority to analyze target domains, polite bot behavior, and crawler safety.",
      },
      {
        id: "acceptable-use",
        number: "06",
        title: "Acceptable Use Policy (AUP)",
        category: "compliance",
        icon: <SlidersHorizontal className="size-5 text-rose-400" />,
        summary:
          "Prohibitions on reverse engineering, malicious scanning, automated scraping, and unauthorized reselling.",
      },
      {
        id: "ai-disclaimer",
        number: "07",
        title: "AI Search, Ranking Predictions & Disclaimers",
        category: "platform",
        icon: <Bot className="size-5 text-cyan-300" />,
        summary:
          "Advisory nature of AI heuristics; critical disclaimer that Odito does NOT guarantee specific Google or AI search rankings.",
      },
      {
        id: "integrations",
        number: "08",
        title: "Google API & Third-Party Integrations",
        category: "compliance",
        icon: <Globe className="size-5 text-indigo-400" />,
        summary:
          "Adherence to Google API Services User Data Policy, read-only permissions, and integration disconnection options.",
      },
      {
        id: "intellectual-property",
        number: "09",
        title: "Intellectual Property & Audit Report License",
        category: "legal",
        icon: <FileText className="size-5 text-violet-400" />,
        summary:
          "You own your domain and content; Odito retains software rights while granting you full rights to generated audit reports.",
      },
      {
        id: "data-privacy",
        number: "10",
        title: "Data Privacy & Security Safeguards",
        category: "compliance",
        icon: <Lock className="size-5 text-teal-400" />,
        summary:
          "Integration with our Privacy Policy, end-to-end transport encryption (TLS/HTTPS), and data protection standards.",
      },
      {
        id: "disclaimer-warranties",
        number: "11",
        title: "Disclaimers of Warranties",
        category: "legal",
        icon: <AlertTriangle className="size-5 text-yellow-400" />,
        summary:
          "Services provided strictly on an 'as is' and 'as available' basis without express or implied guarantees.",
      },
      {
        id: "limitation-liability",
        number: "12",
        title: "Limitation of Liability",
        category: "legal",
        icon: <Scale className="size-5 text-orange-400" />,
        summary:
          "Consequential damages disclaimer and liability aggregate cap limited to amounts paid in the prior 12 months.",
      },
      {
        id: "indemnification",
        number: "13",
        title: "Indemnification",
        category: "legal",
        icon: <ShieldCheck className="size-5 text-emerald-400" />,
        summary:
          "Agreement to hold Odito harmless against claims arising from unauthorized crawling, unlawful content, or terms violations.",
      },
      {
        id: "termination",
        number: "14",
        title: "Account Suspension & Termination",
        category: "legal",
        icon: <RefreshCw className="size-5 text-rose-400" />,
        summary:
          "Terms under which either party may terminate access, plus survival of intellectual property and liability covenants.",
      },
      {
        id: "modifications",
        number: "15",
        title: "Modifications to Terms & Platform",
        category: "general",
        icon: <Zap className="size-5 text-purple-400" />,
        summary:
          "How revisions are communicated via site notices or registered email, and your ongoing rights.",
      },
      {
        id: "governing-law",
        number: "16",
        title: "Governing Law & Dispute Resolution",
        category: "legal",
        icon: <Scale className="size-5 text-blue-400" />,
        summary:
          "Mandatory 30-day informal negotiation window prior to any binding arbitration or jurisdiction filing.",
      },
      {
        id: "contact",
        number: "17",
        title: "Contact & Official Legal Inquiries",
        category: "general",
        icon: <Mail className="size-5 text-cyan-400" />,
        summary:
          "Direct communication channels with the Odito legal and compliance department at hello@odito.ai.",
      },
    ],
    []
  );

  // Filter sections by search and category
  const filteredSections = useMemo(() => {
    return sections.filter((sec) => {
      const matchesCategory =
        selectedCategory === "all" || sec.category === selectedCategory;
      const matchesSearch =
        searchQuery === "" ||
        sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sec.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [sections, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-200 relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Ambience */}
      <div className="absolute inset-0 dark-overlay -z-10"></div>
      <div className="absolute inset-0 grid-pattern -z-10 opacity-40"></div>

      {/* Decorative Cyan / Purple Orbs */}
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-[-5%] right-[-10%] w-[700px] h-[700px] rounded-full blur-[140px] bg-cyan-500/15 animate-pulse"></div>
        <div className="absolute top-[35%] left-[-15%] w-[600px] h-[600px] rounded-full blur-[130px] bg-purple-600/15"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[550px] h-[550px] rounded-full blur-[120px] bg-cyan-500/10"></div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#0a0a0f] to-transparent -z-10"></div>

      <Navbar />

      <main className="pt-32 md:pt-40 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-8 max-w-5xl mx-auto lg:mx-0"
        >
          <Link
            href="/"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            Home
          </Link>
          <ChevronRight className="size-3.5 text-slate-600" />
          <span className="text-slate-400">Legal Documentation</span>
          <ChevronRight className="size-3.5 text-slate-600" />
          <span className="text-cyan-400 font-semibold">Terms of Service</span>
        </nav>

        {/* Hero Header */}
        <header className="mb-14 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Legal Agreement & Service Guidelines
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 leading-[1.1]">
            Terms of{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-300 to-purple-500">
              Service
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl mb-8">
            Please read these terms carefully before accessing or using Odito.ai.
            These terms establish the legal parameters governing our AI-powered
            SEO audit platform, crawling infrastructure, diagnostic tools, and API
            integrations.
          </p>

          {/* Metadata Badges & Quick Action Bar */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2 border-t border-white/10 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10">
              <span className="font-medium text-slate-200">Last Updated:</span>
              <span className="text-cyan-300">October 2026</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10">
              <span className="font-medium text-slate-200">Version:</span>
              <span className="text-slate-300">2.4 (Enterprise & SaaS)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10">
              <span className="font-medium text-slate-200">Entity:</span>
              <span className="text-slate-300">Odito.ai Platform Inc.</span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleCopyPageUrl}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer"
                title="Copy shareable link to this page"
              >
                {copiedLink ? (
                  <>
                    <Check className="size-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5 text-cyan-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>

              <button
                onClick={handlePrint}
                type="button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer"
                title="Print or export as PDF"
              >
                <Printer className="size-3.5 text-purple-400" />
                <span>Print / PDF</span>
              </button>
            </div>
          </div>
        </header>

        {/* Highlights / At-a-Glance Cards */}
        <section
          aria-label="Terms at a Glance"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/30 transition-all backdrop-blur-md relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400 group-hover:scale-105 transition-transform">
              <ShieldCheck className="size-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-1.5">
              Target Site Authority
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              You warrant that you own or possess explicit permission to crawl and
              analyze any target website entered into Odito.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-all backdrop-blur-md relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4 text-purple-400 group-hover:scale-105 transition-transform">
              <Bot className="size-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-1.5">
              AI Insights Disclaimer
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              We deliver high-fidelity diagnostic scores and predictive models, but
              cannot guarantee third-party Google rank positions.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 transition-all backdrop-blur-md relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400 group-hover:scale-105 transition-transform">
              <CreditCard className="size-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-1.5">
              Transparent Billing
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Secure Stripe processing, cancel anytime via self-service portal, with
              transparent prorations and annual refund windows.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition-all backdrop-blur-md relative overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400 group-hover:scale-105 transition-transform">
              <Lock className="size-5" />
            </div>
            <h2 className="text-base font-bold text-white mb-1.5">
              Your Data Stays Yours
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              You retain 100% intellectual property ownership of your content, code,
              and domain assets, with full license to use all reports.
            </p>
          </div>
        </section>

        {/* Search and Category Filter Toolbar */}
        <section
          aria-label="Filter terms"
          className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md mb-12 flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div className="relative w-full md:w-96">
            <Search className="size-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search terms (e.g., refund, crawling, Stripe, liability)..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Category:
            </span>
            {[
              { id: "all", label: "All Terms" },
              { id: "platform", label: "Platform & AI" },
              { id: "billing", label: "Billing & Plans" },
              { id: "compliance", label: "Compliance & Safety" },
              { id: "legal", label: "Legal & Liability" },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                    : "bg-white/[0.02] text-slate-400 border border-white/10 hover:bg-white/[0.06] hover:text-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Main Content Layout: Sticky Sidebar + Main Legal Text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Sticky Table of Contents (Desktop) */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="sticky top-28 p-6 rounded-2xl bg-[#111118]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-cyan-400" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
                    Table of Contents
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-slate-400">
                  {filteredSections.length} sections
                </span>
              </div>

              <nav className="space-y-1">
                {filteredSections.map((sec) => {
                  const isActive = activeSection === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-cyan-300 border border-cyan-500/30 font-semibold"
                          : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span
                          className={`font-mono text-[10px] ${
                            isActive
                              ? "text-cyan-400"
                              : "text-slate-500 group-hover:text-slate-400"
                          }`}
                        >
                          {sec.number}
                        </span>
                        <span className="truncate">{sec.title}</span>
                      </div>
                      <ChevronRight
                        className={`size-3 transition-transform ${
                          isActive
                            ? "text-cyan-400 translate-x-0.5"
                            : "opacity-0 group-hover:opacity-100 text-slate-500"
                        }`}
                      />
                    </a>
                  );
                })}
              </nav>

              {/* Quick Legal Help Box in Sidebar */}
              <div className="pt-4 border-t border-white/10">
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 via-purple-950/20 to-black border border-cyan-500/20 text-xs">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1">
                    <HelpCircle className="size-4" />
                    <span>Have Legal Questions?</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed mb-3">
                    Need custom enterprise terms or have questions regarding data
                    processing agreements (DPA)?
                  </p>
                  <a
                    href="mailto:hello@odito.ai"
                    className="inline-flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-medium transition-all"
                  >
                    <Mail className="size-3.5" />
                    <span>Email hello@odito.ai</span>
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Comprehensive Terms Sections */}
          <div className="lg:col-span-8 space-y-12">
            {filteredSections.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white/[0.02] border border-white/10">
                <Search className="size-10 text-slate-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-1">
                  No matching terms found
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  No sections matched &ldquo;{searchQuery}&rdquo;. Try another
                  keyword or clear your filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold hover:bg-cyan-500/30 transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : null}

            {/* SECTION 01 */}
            <section
              id="acceptance"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    01
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Acceptance of Terms & Eligibility
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("acceptance")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "acceptance" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <p>
                  These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally
                  binding agreement between you (whether individually or on behalf
                  of an entity you represent, &ldquo;User&rdquo;, &ldquo;you&rdquo;,
                  or &ldquo;your&rdquo;) and <strong>Odito.ai</strong> (&ldquo;Odito&rdquo;,
                  &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), governing
                  your access to and use of the Odito website located at{" "}
                  <Link href="/" className="text-cyan-400 hover:underline">
                    odito.ai
                  </Link>
                  , our dashboard applications, automated website auditing tools,
                  and associated APIs (collectively, the &ldquo;Service&rdquo;).
                </p>

                <p>
                  By creating an account, clicking &ldquo;I Agree&rdquo;, submitting
                  a website URL for analysis, initiating an audit, connecting a
                  third-party integration, or continuing to use any part of the
                  platform, you acknowledge that you have read, understood, and
                  agree to be bound by these Terms and our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-cyan-400 hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  . If you do not agree to these Terms, you must immediately cease
                  all use of the Service.
                </p>

                <div className="p-4 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/20 text-xs text-slate-300 space-y-2">
                  <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <CheckCircle2 className="size-4" />
                    <span>Legal Age & Commercial Authority</span>
                  </div>
                  <p>
                    You represent and warrant that you are at least 18 years of age
                    (or the age of legal majority in your jurisdiction) and possess
                    the full legal capacity and corporate authority to enter into
                    these Terms. If you register or use Odito on behalf of a company,
                    agency, or enterprise, you represent that you hold authority to
                    bind that entity to these Terms.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 02 */}
            <section
              id="services"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    02
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Description of Odito Services
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("services")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "services" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <p>
                  Odito provides an intelligent, AI-augmented search engine
                  optimization (SEO) auditing and website performance diagnostic
                  platform. Our core offerings encompass:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-cyan-400 font-semibold text-xs block">
                      ⚡ Automated Website Audits
                    </span>
                    <p className="text-xs text-slate-400">
                      Technical SEO scans, Core Web Vitals profiling, on-page DOM
                      examinations, accessibility checks (WCAG), and schema tag
                      validations.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-purple-400 font-semibold text-xs block">
                      🤖 AI Search Optimization (AISO / GEO)
                    </span>
                    <p className="text-xs text-slate-400">
                      Simulation of generative search engines (OpenAI SearchGPT,
                      Perplexity, Google AI Overviews) and ranking citation
                      preparedness models.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-emerald-400 font-semibold text-xs block">
                      📊 Google Ecosystem Sync
                    </span>
                    <p className="text-xs text-slate-400">
                      Optional OAuth integrations for Google Search Console, Google
                      Ads keyword analysis, and Google Business Profile reputation
                      monitoring.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <span className="text-amber-400 font-semibold text-xs block">
                      🛠️ Fix Recommendations & Reports
                    </span>
                    <p className="text-xs text-slate-400">
                      Prioritized issue severity matrices, automated code snippets,
                      interactive fix panels, and downloadable client-ready PDF
                      reports.
                    </p>
                  </div>
                </div>

                <p>
                  We continuously improve Odito. We reserve the right to enhance,
                  modify, temporarily suspend, or retire any feature or tool at our
                  discretion, with reasonable prior notice for material changes where
                  practicable.
                </p>
              </div>
            </section>

            {/* SECTION 03 */}
            <section
              id="accounts"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    03
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    User Accounts, Workspaces & Security
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("accounts")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "accounts" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <p>
                  To unlock full platform capabilities, you must register an
                  account. When creating an account, you agree to:
                </p>

                <ul className="space-y-2.5 list-none pl-1">
                  <li className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Provide accurate, current, and complete registration
                      information, including a valid business email address.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Maintain and promptly update your account profile and billing
                      contact information to ensure continuous delivery of notices.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Maintain strict confidentiality over your authentication
                      credentials, passwords, single sign-on (SSO) tokens, and API
                      keys.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Assume full responsibility for all activities, audits, crawls,
                      and data changes executed through your user account or
                      workspace seats.
                    </span>
                  </li>
                </ul>

                <p>
                  You must immediately notify Odito by email at{" "}
                  <a
                    href="mailto:hello@odito.ai"
                    className="text-cyan-400 hover:underline"
                  >
                    hello@odito.ai
                  </a>{" "}
                  upon becoming aware of any breach of security, unauthorized access,
                  or suspected compromise of your login credentials. Odito cannot
                  and will not be liable for any loss resulting from your failure to
                  safeguard your credentials.
                </p>
              </div>
            </section>

            {/* SECTION 04 */}
            <section
              id="billing"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    04
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Subscriptions, Payments & Cancellation
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("billing")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "billing" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <p>
                  Odito offers both free tiers (with limited audit credits and crawl
                  depths) and premium recurring subscription plans (e.g., Starter,
                  Pro, Agency, and Custom Enterprise).
                </p>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <h3 className="font-semibold text-white text-xs">
                      1. Payment Processing via Stripe
                    </h3>
                    <p className="text-xs text-slate-400">
                      Payments are processed through our PCI-DSS compliant third-party
                      payment gateway, Stripe. By subscribing to a paid tier, you
                      authorize Odito (via Stripe) to charge your payment method on a
                      recurring monthly or annual basis until cancelled. Odito does not
                      store raw payment card credentials on its servers.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <h3 className="font-semibold text-white text-xs">
                      2. Automatic Renewal
                    </h3>
                    <p className="text-xs text-slate-400">
                      Paid subscriptions automatically renew at the end of each
                      billing period (monthly or annually) at the then-current
                      subscription rate, unless you cancel prior to the renewal date.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <h3 className="font-semibold text-white text-xs">
                      3. Self-Service Cancellation
                    </h3>
                    <p className="text-xs text-slate-400">
                      You may cancel your subscription at any time directly through
                      your <strong>Account Settings &rarr; Subscription</strong> page.
                      Upon cancellation, your subscription will remain active until
                      the end of the paid billing cycle, after which your account will
                      revert to the free tier limits without further recurring
                      charges.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <h3 className="font-semibold text-white text-xs">
                      4. Refund Policy
                    </h3>
                    <p className="text-xs text-slate-400">
                      <strong>Annual Subscriptions:</strong> First-time annual
                      subscribers may request a full refund within 14 calendar days of
                      initial purchase by contacting support at{" "}
                      <a
                        href="mailto:hello@odito.ai"
                        className="text-cyan-400 hover:underline"
                      >
                        hello@odito.ai
                      </a>
                      , provided plan crawl credits have not been disproportionately
                      exhausted.
                      <br />
                      <strong>Monthly Subscriptions & Add-On Credits:</strong> Due to
                      the computational overhead of real-time web crawlers, monthly
                      subscription fees and one-time credit top-ups are non-refundable
                      once the billing period has commenced.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Odito reserves the right to adjust subscription pricing upon at least
                  30 days advance notice to active subscribers via email. Your
                  continued subscription following price modification constitutes
                  acceptance of the updated pricing.
                </p>
              </div>
            </section>

            {/* SECTION 05 */}
            <section
              id="crawling"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    05
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Authorized Website Crawling & Audits
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("crawling")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "crawling" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <p>
                  The core engine of Odito relies on automated web crawlers that
                  inspect HTML source code, document structures, performance metrics,
                  and network assets of submitted URLs.
                </p>

                <div className="p-4 rounded-xl bg-blue-500/[0.05] border border-blue-500/20 text-xs text-slate-300 space-y-2">
                  <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                    <ShieldCheck className="size-4" />
                    <span>Your Warranty of Domain Authorization</span>
                  </div>
                  <p>
                    You explicitly represent and warrant that you own, operate, or
                    have received explicit authorization from the legitimate domain
                    owner to audit and crawl any URL or website hostname you input into
                    Odito. You shall not submit URLs for the purpose of malicious
                    surveillance, competitor harassment, or unauthorized security
                    probing.
                  </p>
                </div>

                <div className="space-y-2 text-xs text-slate-400">
                  <h3 className="font-semibold text-slate-200">
                    Our Crawling Principles:
                  </h3>
                  <ul className="space-y-2 pl-1">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Rate Limiting & Server Politeness:</strong> Our
                        crawlers enforce polite request throttling and concurrent
                        connection limits designed to minimize load on host web
                        servers.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>User-Agent Identification:</strong> Odito crawlers
                        identify themselves transparently using standard HTTP
                        User-Agent strings (e.g.,{" "}
                        <code className="text-cyan-300 bg-white/[0.05] px-1 py-0.5 rounded">
                          OditoBot/1.0
                        </code>
                        ).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="size-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>No Exploitation:</strong> Odito conducts read-only
                        auditing of public or authorized web pages. We do NOT perform
                        destructive vulnerability exploits, SQL injection attempts, or
                        denial-of-service stress tests.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* SECTION 06 */}
            <section
              id="acceptable-use"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    06
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Acceptable Use Policy (AUP)
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("acceptable-use")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "acceptable-use" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <p>
                  You agree that you will not engage in any activity that abuses,
                  disrupts, or interferes with the operation of Odito. Specifically,
                  you shall NOT:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                    <span className="text-rose-400 font-bold block">
                      ✕ Reverse Engineering
                    </span>
                    <p className="text-slate-400">
                      Decompile, reverse engineer, disassemble, or attempt to derive
                      source code, proprietary weights, or scoring algorithms of
                      Odito.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                    <span className="text-rose-400 font-bold block">
                      ✕ Rate Limit Circumvention
                    </span>
                    <p className="text-slate-400">
                      Circumvent or spoof crawl quotas, concurrent project
                      thresholds, seat counts, or tier limitations via bot farms or
                      proxy pools.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                    <span className="text-rose-400 font-bold block">
                      ✕ Platform Scraping
                    </span>
                    <p className="text-slate-400">
                      Scrape or extract internal dashboard data, subscriber metrics,
                      or user directories without express written API consent.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                    <span className="text-rose-400 font-bold block">
                      ✕ Unlawful Content
                    </span>
                    <p className="text-slate-400">
                      Use the platform in connection with material that contains
                      child sexual abuse material, illegal hate speech, malware, or
                      phishing campaigns.
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Any violation of this Acceptable Use Policy constitutes grounds for
                  immediate suspension or termination of your account without notice
                  or refund.
                </p>
              </div>
            </section>

            {/* SECTION 07 */}
            <section
              id="ai-disclaimer"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    07
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    AI Search, Ranking Predictions & Disclaimers
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("ai-disclaimer")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "ai-disclaimer" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <p>
                  Odito harnesses advanced neural network algorithms, machine
                  learning models, and large language model (LLM) agents to evaluate
                  search performance, simulate generative search engines (such as
                  SearchGPT, Perplexity AI, Google AI Overviews), and recommend code
                  fixes.
                </p>

                <div className="p-4 rounded-xl bg-amber-500/[0.08] border border-amber-500/25 text-xs text-amber-200/90 space-y-2">
                  <div className="font-bold text-amber-300 flex items-center gap-1.5 text-sm">
                    <AlertTriangle className="size-4 shrink-0" />
                    <span>IMPORTANT: No Guarantee of Search Engine Rankings</span>
                  </div>
                  <p className="leading-relaxed">
                    Search engine algorithms (including Google, Microsoft Bing,
                    Yahoo, and emerging generative answer engines) are proprietary,
                    autonomous, and undergo frequent updates beyond our control.
                    While Odito applies industry best practices, <strong>ODITO DOES
                    NOT AND CANNOT GUARANTEE</strong> that applying our audit
                    recommendations will result in specific ranking positions (such as
                    &ldquo;#1 on Google&rdquo;), guaranteed organic traffic, revenue
                    multipliers, or indexing inclusion.
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  <strong>Verification of Suggested Code:</strong> Code modifications
                  suggested in the Odito Fix Panel (e.g., canonical tags, JSON-LD
                  schema, server redirects, robots directives, or heading structures)
                  are provided as advisory technical blueprints. You or your
                  engineering team remain solely responsible for validating and
                  testing all code prior to publishing it in your production
                  environment.
                </p>
              </div>
            </section>

            {/* SECTION 08 */}
            <section
              id="integrations"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    08
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Google API & Third-Party Integrations
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("integrations")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "integrations" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <p>
                  Odito provides optional integration mechanisms with third-party
                  ecosystems, notably Google APIs (Google Search Console, Google
                  Business Profile, and Google Ads).
                </p>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 text-xs">
                  <span className="font-semibold text-white block">
                    Google API Services User Data Policy Compliance
                  </span>
                  <p className="text-slate-400 leading-relaxed">
                    Odito&apos;s use and transfer to any other app of information
                    received from Google APIs adheres strictly to the{" "}
                    <a
                      href="https://developers.google.com/terms/api-services-user-data-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
                    >
                      Google API Services User Data Policy
                      <ExternalLink className="size-3" />
                    </a>
                    , including the Limited Use requirements. We request only
                    read-level or authorized operational scopes necessary to display
                    analytics inside your Odito project view.
                  </p>
                </div>

                <p className="text-xs text-slate-400">
                  You retain complete authority to revoke access to any Google
                  integration at any time from your Odito project settings or via
                  your Google Account Security dashboard. Disconnecting stops all
                  future synchronization immediately.
                </p>
              </div>
            </section>

            {/* SECTION 09 */}
            <section
              id="intellectual-property"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    09
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Intellectual Property & Audit Report License
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("intellectual-property")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "intellectual-property" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <h3 className="font-semibold text-white text-xs">
                      1. Customer Data Ownership
                    </h3>
                    <p className="text-xs text-slate-400">
                      You retain all right, title, and interest in and to your target
                      domains, source code, brand assets, proprietary keywords, and
                      business information. Nothing in these Terms grants Odito
                      ownership of your website content.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <h3 className="font-semibold text-white text-xs">
                      2. Odito Intellectual Property
                    </h3>
                    <p className="text-xs text-slate-400">
                      Odito, the Odito brand, logo, platform software, UI/UX designs,
                      backend microservices, machine learning classifiers, and
                      scoring rubrics are the exclusive property of Odito.ai and its
                      licensors, protected under worldwide copyright, trademark, and
                      patent laws.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <h3 className="font-semibold text-white text-xs">
                      3. Report License Granted to You
                    </h3>
                    <p className="text-xs text-slate-400">
                      Subject to compliance with these Terms, Odito grants you a
                      perpetual, worldwide, royalty-free license to use, download,
                      reproduce, distribute, and display the audit reports and PDF
                      exports generated by your account for internal business
                      operations and client deliverables.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 10 */}
            <section
              id="data-privacy"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    10
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Data Privacy & Security Safeguards
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("data-privacy")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "data-privacy" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <p>
                  We treat your privacy with extreme seriousness. Our data handling
                  practices are set forth in our{" "}
                  <Link
                    href="/privacy-policy"
                    className="text-cyan-400 hover:underline font-semibold"
                  >
                    Privacy Policy
                  </Link>
                  , which is incorporated into these Terms by reference.
                </p>

                <p className="text-xs text-slate-400">
                  Odito deploys state-of-the-art security controls, including TLS/HTTPS
                  cryptographic transport protection, strict role-based access
                  controls (RBAC), and SOC2-compliant hosting providers. We do not
                  sell personal information or monetize customer crawling inputs to
                  unauthorized third parties.
                </p>
              </div>
            </section>

            {/* SECTION 11 */}
            <section
              id="disclaimer-warranties"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                    11
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Disclaimers of Warranties
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("disclaimer-warranties")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "disclaimer-warranties" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <p className="uppercase text-xs tracking-wider text-slate-400 font-semibold">
                  Disclaimer Notice to All Users
                </p>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 leading-relaxed">
                  TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE IS
                  PROVIDED STRICTLY ON AN &ldquo;AS IS&rdquo; AND &ldquo;AS
                  AVAILABLE&rdquo; BASIS, WITHOUT WARRANTIES OF ANY KIND, WHETHER
                  EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT
                  LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                  PARTICULAR PURPOSE, TITLE, QUIET ENJOYMENT, OR NON-INFRINGEMENT.
                  ODITO DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
                  ERROR-FREE, BUG-FREE, OR FREE OF HARMFUL COMPONENTS.
                </div>
              </div>
            </section>

            {/* SECTION 12 */}
            <section
              id="limitation-liability"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    12
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Limitation of Liability
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("limitation-liability")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "limitation-liability" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 leading-relaxed space-y-3">
                  <p>
                    IN NO EVENT SHALL ODITO.AI, ITS AFFILIATES, OFFICERS, DIRECTORS,
                    EMPLOYEES, AGENTS, OR SUPPLIERS BE LIABLE FOR ANY INDIRECT,
                    INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
                    INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF REVENUE,
                    LOSS OF ORGANIC SEARCH TRAFFIC, LOSS OF GOODWILL, OR BUSINESS
                    INTERRUPTION, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
                    DAMAGES.
                  </p>
                  <p>
                    <strong>AGGREGATE LIABILITY CAP:</strong> IN NO EVENT SHALL
                    ODITO&apos;S TOTAL AGGREGATE LIABILITY ARISING OUT OF OR RELATING
                    TO THESE TERMS OR THE SERVICE EXCEED THE GREATER OF: (A) ONE
                    HUNDRED UNITED STATES DOLLARS ($100 USD), OR (B) THE TOTAL FEES
                    ACTUALLY PAID BY YOU TO ODITO IN THE TWELVE (12) MONTHS
                    IMMEDIATELY PRECEDING THE OCCURRENCE GIVING RISE TO LIABILITY.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 13 */}
            <section
              id="indemnification"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    13
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Indemnification
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("indemnification")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "indemnification" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <p>
                  You agree to defend, indemnify, and hold harmless Odito.ai, its
                  parents, affiliates, officers, directors, employees, and agents
                  from and against any and all claims, liabilities, damages, losses,
                  costs, or expenses (including reasonable legal and accounting fees)
                  arising out of or in any way connected with:
                </p>

                <ul className="space-y-2 list-none pl-1 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Your breach or violation of these Terms or applicable laws;</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Any claim alleging that a target website URL or domain crawled
                      at your instruction was unauthorized or infringed third-party
                      rights;
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>
                      Your unauthorized distribution or modification of audit reports.
                    </span>
                  </li>
                </ul>
              </div>
            </section>

            {/* SECTION 14 */}
            <section
              id="termination"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    14
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Account Suspension & Termination
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("termination")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "termination" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <p>
                  These Terms remain effective as long as you maintain an account or
                  access the Service.
                </p>

                <p className="text-xs text-slate-400">
                  <strong>Termination by You:</strong> You may close your account at
                  any time through your Account Settings or by sending written
                  notice to{" "}
                  <a
                    href="mailto:hello@odito.ai"
                    className="text-cyan-400 hover:underline"
                  >
                    hello@odito.ai
                  </a>
                  .
                </p>

                <p className="text-xs text-slate-400">
                  <strong>Suspension or Termination by Odito:</strong> We reserve the
                  right to suspend or terminate your access immediately if: (a) you
                  commit a material breach of these Terms, (b) your payment fails or
                  is delinquent, (c) you abuse crawler quotas, or (d) we are compelled
                  to do so by legal process.
                </p>

                <p className="text-xs text-slate-400">
                  Upon termination, your right to use the platform ends. Provisions
                  concerning Intellectual Property, Disclaimers, Limitation of
                  Liability, Indemnification, and Governing Law shall survive
                  termination.
                </p>
              </div>
            </section>

            {/* SECTION 15 */}
            <section
              id="modifications"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    15
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Modifications to Terms & Platform
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("modifications")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "modifications" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <p>
                  We may revise these Terms periodically to reflect evolving
                  technologies, legal mandates, or product updates. If we make
                  material revisions, we will provide at least 15 days notice prior
                  to the changes taking effect, either via an announcement banner on
                  the platform or an email sent to the address associated with your
                  account.
                </p>
                <p className="text-xs text-slate-400">
                  By continuing to access or use Odito following the effective date
                  of revised Terms, you agree to be bound by the updated terms. If
                  you disagree with any modification, your sole recourse is to
                  discontinue using the Service.
                </p>
              </div>
            </section>

            {/* SECTION 16 */}
            <section
              id="governing-law"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-white/10 hover:border-white/20 transition-all backdrop-blur-md relative"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    16
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Governing Law & Dispute Resolution
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("governing-law")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "governing-law" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4">
                <p>
                  These Terms shall be governed by and construed in accordance with
                  the laws of the jurisdiction where Odito is legally organized,
                  without giving effect to any principles of conflicts of law.
                </p>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 space-y-2">
                  <div className="font-semibold text-white">
                    Mandatory Informal Dispute Resolution
                  </div>
                  <p className="text-slate-400">
                    Before filing a formal claim against Odito, you agree to attempt
                    to resolve the dispute informally by contacting our legal team at{" "}
                    <a
                      href="mailto:hello@odito.ai"
                      className="text-cyan-400 hover:underline"
                    >
                      hello@odito.ai
                    </a>
                    . We will attempt in good faith to resolve the matter informally
                    within thirty (30) days of receiving your notice before either
                    party initiates formal proceedings.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 17 */}
            <section
              id="contact"
              data-terms-section
              className="scroll-mt-32 p-7 sm:p-9 rounded-2xl bg-[#0f0f16]/80 border border-cyan-500/30 hover:border-cyan-500/50 transition-all backdrop-blur-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                    17
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">
                    Contact & Official Legal Inquiries
                  </h2>
                </div>
                <button
                  onClick={() => handleCopyAnchor("contact")}
                  type="button"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.05] transition-colors"
                  title="Copy link to this section"
                >
                  {copiedSection === "contact" ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </button>
              </div>

              <div className="text-sm leading-relaxed text-slate-300 space-y-4 relative z-10">
                <p>
                  If you have questions, notices, or inquiries regarding these Terms
                  of Service, or need a signed Data Processing Agreement (DPA) for
                  enterprise compliance, please contact our team:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <a
                    href="mailto:hello@odito.ai"
                    className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all flex flex-col items-start group"
                  >
                    <Mail className="size-5 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-slate-400">Direct Email</span>
                    <span className="text-sm font-semibold text-white group-hover:text-cyan-300">
                      hello@odito.ai
                    </span>
                  </a>

                  <Link
                    href="/contact"
                    className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all flex flex-col items-start group"
                  >
                    <Globe className="size-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-slate-400">Contact Portal</span>
                    <span className="text-sm font-semibold text-white group-hover:text-purple-300">
                      odito.ai/contact
                    </span>
                  </Link>

                  <Link
                    href="/privacy-policy"
                    className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition-all flex flex-col items-start group"
                  >
                    <ShieldCheck className="size-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-slate-400">Privacy Policy</span>
                    <span className="text-sm font-semibold text-white group-hover:text-emerald-300">
                      odito.ai/privacy-policy
                    </span>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <section className="mt-24 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-[#0f0f18] border border-cyan-500/20 text-center relative overflow-hidden backdrop-blur-xl">
          <div className="absolute inset-0 bg-radial-gradient from-cyan-500/10 via-transparent to-transparent pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ready to Accelerate Your SEO Intelligence?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Run real-time technical audits, track generative search visibility,
              and fix SEO issues with precision.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-cyan-400 text-black font-bold text-sm hover:bg-cyan-300 hover:shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
              >
                Get Started Free
              </Link>
              <Link
                href="/quickaudit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-semibold text-sm transition-all cursor-pointer"
              >
                Run Quick Audit
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          type="button"
          className="fixed bottom-8 right-8 z-40 p-3 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md transition-all hover:scale-110 cursor-pointer"
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp className="size-5" />
        </button>
      )}

      <Footer />
    </div>
  );
}
