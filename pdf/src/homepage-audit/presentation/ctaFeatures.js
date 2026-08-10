// Fully static — no data binding, no props, no API dependency. Shared
// between Page11AuditBenefits (cards 1-3) and Page12FinalCta (cards 4-6),
// so the six feature descriptions live in exactly one place.
const CTA_FEATURES = [
  {
    number: 1,
    title: 'Website-Wide\nSEO Analysis',
    bullets: [
      { text: 'Go beyond a single page and analyze up to 25 pages with the Starter Plan.' },
      {
        text: 'Discover issues related to:',
      },
      {
        text: 'On-Page SEO',
        subItems: [
          'Technical SEO',
          'Metadata Optimization',
          'Structured Data & Schema',
          'Internal Linking',
          'Crawlability & Indexability',
          'Content Quality & Search Readiness',
        ],
      },
    ],
  },
  {
    number: 2,
    title: 'Dedicated AI\nVisibility Audits',
    bullets: [
      { text: 'The AI Visibility section included in this report is only a preview.' },
      {
        text: 'A Full Audit provides dedicated analysis for:',
        subItems: [
          'AISO (AI Search Optimization)',
          'AEO (Answer Engine Optimization)',
          'GEO (Generative Engine Optimization)',
        ],
      },
      {
        text:
          "You'll receive detailed issue breakdowns, scoring, and recommendations specifically focused on AI search visibility.",
      },
    ],
  },
  {
    number: 3,
    title: 'Accessibility & User\nExperience Analysis',
    bullets: [
      { text: 'Ensure your website is accessible, user-friendly, and compliant with modern standards.' },
      {
        text: 'The Full Audit includes:',
        subItems: [
          'Accessibility Auditing',
          'WCAG Compliance Checks',
          'Navigation & UX Reviews',
          'Mobile Experience Validation',
          'User Experience Recommendations',
        ],
      },
    ],
  },
  {
    number: 4,
    title: 'AI-Powered\nRecommendation Engine',
    bullets: [
      {
        text: 'Every issue identified during the audit is accompanied by intelligent recommendations that help you understand:',
        subItems: ['What the issue is', 'Why it matters', 'Its potential impact', 'Recommended actions to resolve it'],
      },
      {
        text: 'No guesswork. No generic suggestions. Just actionable insights designed to improve visibility and performance.',
      },
    ],
  },
  {
    number: 5,
    title: 'Optimization\nCenter',
    bullets: [
      { text: 'Track, manage, and prioritize improvements from a centralized workspace.' },
      {
        text: 'Monitor:',
        subItems: ['Open Issues', 'Completed Fixes', 'Optimization Progress', 'Verification Status', 'Ongoing Improvements'],
      },
      { text: 'Stay organized while turning insights into measurable results.' },
    ],
  },
  {
    number: 6,
    title: 'Keyword Tracking &\nVisibility Monitoring',
    bullets: [
      { text: 'Understand how your website performs over time.' },
      {
        text: 'Track:',
        subItems: ['Keyword Rankings', 'Search Visibility', 'Ranking Changes', 'Performance Trends', 'Growth Opportunities'],
      },
      {
        text: 'Monitor the impact of your optimization efforts and identify new opportunities to improve search presenc',
      },
    ],
  },
];

export default CTA_FEATURES;
