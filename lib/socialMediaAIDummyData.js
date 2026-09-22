/**
 * Static/dummy data for the Social Media AI module
 * (components/social-media/**, app/app/social-media/**).
 *
 * Frontend-only: no API calls, no React Query, no backend, no persistence.
 * This module is fully isolated from the real, OAuth-backed Social Media
 * Management feature at app/app/social/ (see lib/socialMediaDummyData.js) -
 * it is a separate, mocked "Social Media AI" product surface modeled after
 * an external reference screenshot.
 */

import {
  FileText,
  ImagePlus,
  Send,
  BarChart3,
  GraduationCap,
  Heart,
  Megaphone,
  Globe,
  Briefcase,
  Users,
  Facebook,
  Instagram,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Share2,
  Calendar,
  Linkedin,
  Target,
  Layers,
  Link2,
  UserCheck,
  Clock,
  Info,
} from 'lucide-react'

export const WORKSPACE = {
  id: 'sapphire-digital-agency',
  name: 'Sapphire Digital Agency',
}

export const CONNECTED_ACCOUNTS = [
  { id: 'facebook', name: 'Facebook', connected: true },
  { id: 'instagram', name: 'Instagram', connected: true },
]

export const OVERVIEW_STATS = [
  { id: 'content-reviews', label: 'Content reviews', value: 6, icon: FileText, href: '/app/social-media/content-approvals' },
  { id: 'designs-to-approve', label: 'Designs to approve', value: 4, icon: ImagePlus, href: '/app/social-media/creative-studio' },
  { id: 'scheduled', label: 'Scheduled', value: 12, icon: Send, href: '/app/social-media/scheduled-posts' },
  { id: 'published', label: 'Published', value: 18, icon: BarChart3, href: '/app/social-media/scheduled-posts?tab=published' },
]

// `imageId` keys into SOCIAL_MEDIA_IMAGES (lib/socialMediaImages.js) - each
// entry has its own real image, never shared with another post's slot.
export const ATTENTION_POSTS = [
  {
    id: 'attn-1',
    title: '5 ways a strong brand builds customer trust',
    type: 'Carousel',
    platform: 'instagram',
    status: 'Needs review',
    pillar: 'Educational',
    imageId: 'social-post-01',
  },
  {
    id: 'attn-2',
    title: 'Behind the scenes at Sapphire Digital',
    type: 'Image',
    platform: 'facebook',
    status: 'Needs review',
    pillar: 'Brand story',
    imageId: 'social-post-02',
  },
  {
    id: 'attn-3',
    title: 'Client success: 3x more leads in 90 days',
    type: 'Image',
    platform: 'instagram',
    status: 'Needs review',
    pillar: 'Case study',
    imageId: 'social-post-03',
  },
]

export const PILLAR_STYLES = {
  Educational: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  'Brand story': 'bg-sky-50 text-sky-600 border-sky-100',
  'Case study': 'bg-emerald-50 text-emerald-600 border-emerald-100',
}

export const UPCOMING_POSTS = [
  {
    id: 'up-1',
    title: 'Small steps create big results',
    platform: 'instagram',
    date: 'Tue, Apr 23',
    time: '10:00 AM',
    imageId: 'social-post-04',
  },
  {
    id: 'up-2',
    title: 'Building brands for a brighter tomorrow',
    platform: 'facebook',
    date: 'Wed, Apr 24',
    time: '1:00 PM',
    imageId: 'social-post-05',
  },
  {
    id: 'up-3',
    title: 'Great ideas happen together',
    platform: 'instagram',
    date: 'Fri, Apr 26',
    time: '11:00 AM',
    imageId: 'social-post-06',
  },
]

export const AI_INSIGHT = {
  title: 'Build trust before asking for the sale',
  body: 'Your audience engages 3.2x more with educational and behind-the-scenes content than direct promotional posts. Focus on showcasing your expertise, process and client results to build trust and drive long-term growth.',
  quote: '"People don’t buy what you do. They buy why you do it." — Simon Sinek',
  ctaLabel: 'Review strategy',
  ctaHref: '/app/social-media/ai-strategy',
}

// ── Connect Accounts ─────────────────────────────────────────────────

export const SETUP_STEPS = [
  { id: 'connect-accounts', label: 'Connect accounts' },
  { id: 'business-profile', label: 'Business profile' },
  { id: 'ai-strategy', label: 'AI strategy' },
]

export const SOCIAL_ACCOUNTS = {
  facebook: {
    connected: true,
    name: 'Sapphire Digital Agency',
    handle: '@SapphireDigitalAgency',
    followers: '2.4K followers',
    permissionsGranted: true,
    permissionsNote: 'We can access your page, posts, insights and media.',
  },
  instagram: {
    connected: false,
  },
}

export const BUSINESS_PROFILE_DEFAULTS = {
  website: 'sapphiredigitalagency.com',
  industry: 'digital-marketing',
  location: 'Nashik, India',
  description:
    'We are a digital marketing agency helping brands grow through social media, performance marketing and creative content. We build strategies that drive real results.',
}

export const BUSINESS_DESCRIPTION_MAX_LENGTH = 500

export const INDUSTRY_OPTIONS = [
  { value: 'digital-marketing', label: 'Digital marketing' },
  { value: 'ecommerce', label: 'E-commerce & retail' },
  { value: 'health-wellness', label: 'Health & wellness' },
  { value: 'real-estate', label: 'Real estate' },
  { value: 'hospitality', label: 'Hospitality & travel' },
  { value: 'professional-services', label: 'Professional services' },
  { value: 'other', label: 'Other' },
]

export const AI_ANALYSIS_ITEMS = [
  { id: 'website', label: 'Website', description: 'Your products, services and brand messaging', icon: Globe },
  { id: 'services', label: 'Services', description: 'What you offer and your unique value', icon: Briefcase },
  { id: 'audience', label: 'Audience', description: 'Your target audience and market', icon: Users },
  { id: 'existing-posts', label: 'Existing posts', description: 'Your content style, topics and performance', icon: FileText },
]

export const STRATEGY = {
  goalLabel: 'Primary goal',
  goal: 'Brand awareness',
  description: 'Increase visibility and establish Sapphire Digital Agency as a trusted digital partner.',
  contentMix: [
    { id: 'educational', label: 'Educational content', percentage: 50, icon: GraduationCap, color: 'text-sky-600 bg-sky-50' },
    { id: 'trust', label: 'Trust & behind the scenes', percentage: 30, icon: Heart, color: 'text-rose-500 bg-rose-50' },
    { id: 'promotional', label: 'Promotional content', percentage: 20, icon: Megaphone, color: 'text-indigo-600 bg-indigo-50' },
  ],
}

// ── AI Strategy ───────────────────────────────────────────────────────

export const AI_STRATEGY_STATUS = {
  title: 'Analysis complete',
  subtitle: 'Your strategy is ready',
}

export const CONNECTED_SOURCES = [
  { id: 'website', label: 'Website', value: 'sapphireagency.com', icon: Globe, iconClass: 'bg-sky-50 text-sky-600' },
  { id: 'facebook', label: 'Facebook', value: 'Sapphire Digital Agency', icon: Facebook, iconClass: 'bg-[#1877F2] text-white' },
  { id: 'instagram', label: 'Instagram', value: '@sapphireagency', icon: Instagram, iconClass: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white' },
]

export const RECOMMENDED_STRATEGY = {
  title: 'Recommended: Content mix',
  subtitle: 'Build a balanced content strategy across different post types.',
}

export const POST_TYPES = [
  {
    id: 'informational',
    name: 'Informational',
    description: 'Share useful information, industry updates, facts and insights that keep your audience informed.',
    examples: ['Industry updates', 'Useful facts', 'Trends & news', 'Quick information'],
    icon: Info,
    tint: 'bg-sky-50 text-sky-600',
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Teach your audience through practical tips, how-to content and actionable knowledge.',
    examples: ['How-to guides', 'Tips & best practices', 'Tutorials', 'Step-by-step content'],
    icon: GraduationCap,
    tint: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'soft_sell',
    name: 'Soft sell',
    description: 'Promote your services naturally through value-driven content, stories and problem-solving.',
    examples: ['Service benefits', 'Case studies', 'Client stories', 'Problem → solution posts'],
    icon: Heart,
    tint: 'bg-rose-50 text-rose-500',
  },
  {
    id: 'hard_sell',
    name: 'Hard sell',
    description: 'Use direct promotional content with clear offers, CTAs and conversion-focused messaging.',
    examples: ['Service offers', 'Promotions', 'Book a consultation', 'Limited-time offers'],
    icon: Megaphone,
    tint: 'bg-violet-50 text-violet-600',
  },
]

export const DEFAULT_SELECTED_POST_TYPE_IDS = ['informational', 'educational', 'soft_sell', 'hard_sell']

export const DEFAULT_POST_TYPE_DISTRIBUTION = {
  informational: 25,
  educational: 35,
  soft_sell: 30,
  hard_sell: 10,
}

export const BUSINESS_SNAPSHOT = [
  { id: 'audience', label: 'Audience', value: 'Small business owners', icon: Users },
  { id: 'services', label: 'Services', value: 'Web design and digital marketing', icon: Briefcase },
  { id: 'voice', label: 'Voice', value: 'Clear and helpful', icon: MessageSquare },
]

export const CONTENT_PILLARS = [
  {
    id: 'educate',
    title: 'Educate',
    description: 'Share useful knowledge, tips, insights and practical information.',
    icon: GraduationCap,
    tint: 'bg-emerald-100 text-emerald-600',
    ideas: ['Web design tips for small businesses', 'Social media best practices', 'Short how-to videos'],
  },
  {
    id: 'build-trust',
    title: 'Build trust',
    description: 'Show expertise, experience, processes and real customer stories.',
    icon: ShieldCheck,
    tint: 'bg-sky-100 text-sky-600',
    ideas: ['Before & after project showcases', 'Client testimonials', 'Behind-the-scenes content'],
  },
  {
    id: 'convert',
    title: 'Convert',
    description: 'Present your services, offers and clear calls to action.',
    icon: TrendingUp,
    tint: 'bg-rose-100 text-rose-500',
    ideas: ['Service spotlights', 'Limited time offers', 'Clear calls to action'],
  },
]

export const STRATEGY_SETTINGS = [
  { id: 'frequency', value: '12 posts / month', label: 'Consistent and sustainable', icon: FileText },
  { id: 'platforms', value: 'Facebook + Instagram', label: '2 platforms', icon: Share2 },
  { id: 'timeframe', value: 'Next 30 days', label: 'Sep 2026 – Oct 2026', icon: Calendar },
]

// ── Content Calendar ─────────────────────────────────────────────────

// The Monday of the week the mock calendar is built around - matches the
// reference screenshot exactly ("21 - 27 September 2026") rather than the
// real device date, so the calendar always opens populated. "Today" resets
// the displayed week back to this anchor; Prev/Next move away from it into
// genuinely empty weeks, same as a real calendar with only one week planned.
export const CALENDAR_WEEK_ANCHOR = '2026-09-21'

export const CALENDAR_PLATFORM_META = {
  facebook: { label: 'Facebook', icon: Facebook, badgeClass: 'bg-[#1877F2] text-white' },
  instagram: { label: 'Instagram', icon: Instagram, badgeClass: 'bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white' },
  linkedin: { label: 'LinkedIn', icon: Linkedin, badgeClass: 'bg-[#0A66C2] text-white' },
}

export const CALENDAR_PLATFORM_FILTERS = [
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
]

export const CALENDAR_STATUS_META = {
  draft: { label: 'Draft', dotClass: 'bg-slate-400', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' },
  'content-review': { label: 'Content review', dotClass: 'bg-amber-500', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  'design-review': { label: 'Design review', dotClass: 'bg-sky-500', badgeClass: 'bg-sky-50 text-sky-700 border-sky-200' },
  scheduled: { label: 'Scheduled', dotClass: 'bg-emerald-500', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
}

export const CALENDAR_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'content-review', label: 'Content review' },
  { value: 'design-review', label: 'Design review' },
  { value: 'scheduled', label: 'Scheduled' },
]

// `imageId` keys into SOCIAL_MEDIA_IMAGES for posts far enough along to
// have a visual (design-review/scheduled) and is `null` for posts still in
// draft/content review - the calendar renders a skeleton placeholder
// instead, which doubles as a visual cue for how far each post is through
// the workflow (Draft -> Content Review -> Design Review -> Scheduled).
export const CALENDAR_POSTS = [
  {
    id: 'cal-1',
    title: 'Meet our team',
    platform: 'facebook',
    date: '2026-09-21',
    time: '10:00 AM',
    status: 'scheduled',
    imageId: 'calendar-post-01',
    contentPillar: 'Build trust',
    contentFormat: 'Photo',
    caption: 'Say hello to the people behind Sapphire Digital Agency - the team turning your growth goals into results.',
  },
  {
    id: 'cal-2',
    title: 'Behind the scenes',
    platform: 'instagram',
    date: '2026-09-22',
    time: '11:00 AM',
    status: 'design-review',
    imageId: 'calendar-post-02',
    contentPillar: 'Build trust',
    contentFormat: 'Photo',
    caption: 'A look at how our team plans and builds every campaign, from strategy call to final launch.',
  },
  {
    id: 'cal-3',
    title: 'Website tips',
    platform: 'instagram',
    date: '2026-09-23',
    time: '10:00 AM',
    status: 'content-review',
    imageId: null,
    contentPillar: 'Educate',
    contentFormat: 'Carousel',
    caption: "5 website tips to help your business attract more customers online. Swipe to learn practical ways to improve your site's performance ...",
  },
  {
    id: 'cal-4',
    title: 'Client story',
    platform: 'linkedin',
    date: '2026-09-24',
    time: '03:00 PM',
    status: 'scheduled',
    imageId: 'calendar-post-03',
    contentPillar: 'Convert',
    contentFormat: 'Photo',
    caption: 'Real businesses, real growth - see how we helped a local client triple their qualified leads in 90 days.',
  },
  {
    id: 'cal-5',
    title: 'Free audit',
    platform: 'facebook',
    date: '2026-09-25',
    time: '11:00 AM',
    status: 'draft',
    imageId: null,
    contentPillar: 'Convert',
    contentFormat: 'Text',
    caption: 'Not sure where your website stands? Claim a free audit and get a clear action plan within 48 hours.',
  },
  {
    id: 'cal-6',
    title: 'Growth checklist',
    platform: 'instagram',
    date: '2026-09-27',
    time: '02:00 PM',
    status: 'design-review',
    imageId: 'calendar-post-04',
    contentPillar: 'Educate',
    contentFormat: 'Carousel',
    caption: 'Small steps, big results - our 10-point checklist for sustainable social growth this quarter.',
  },
]

export const CALENDAR_DEFAULT_SELECTED_POST_ID = 'cal-3'

// ── Content Approvals ────────────────────────────────────────────────
// Reuses CALENDAR_PLATFORM_META for platform icons/colors - one platform
// map for the whole module instead of a second copy here.

export const APPROVAL_BRIEF_ICONS = {
  goal: Target,
  format: Layers,
  plannedDate: Calendar,
  voice: MessageSquare,
}

export const APPROVAL_POSTS = [
  {
    id: 'appr-1',
    title: 'Website tips',
    date: 'Sep 23, 2024',
    platform: 'instagram',
    imageId: 'approval-post-01',
    status: 'pending',
    topic: '3 ways to improve your website',
    caption: 'Make your first impression count. Keep your website fast, simple and easy to navigate. Ready for a website that works harder for your business?',
    cta: 'Book a free consultation',
    hashtags: ['#WebDesign', '#SmallBusiness', '#DigitalGrowth'],
    goal: 'Brand awareness',
    format: 'Carousel',
    plannedDate: 'Sep 23, 2024',
    voice: 'Helpful and confident',
  },
  {
    id: 'appr-2',
    title: 'Small business growth',
    date: 'Sep 25, 2024',
    platform: 'linkedin',
    imageId: 'approval-post-02',
    status: 'pending',
    topic: 'Simple wins for small business growth',
    caption: "Growth doesn't have to mean a bigger budget. Here are three low-cost moves that compound over time - and where most small businesses leave results on the table.",
    cta: 'Get your free growth plan',
    hashtags: ['#SmallBusiness', '#GrowthTips', '#MarketingStrategy'],
    goal: 'Lead generation',
    format: 'Single image',
    plannedDate: 'Sep 25, 2024',
    voice: 'Confident and direct',
  },
  {
    id: 'appr-3',
    title: 'Marketing mindset',
    date: 'Sep 27, 2024',
    platform: 'facebook',
    imageId: 'approval-post-03',
    status: 'pending',
    topic: 'The mindset shift behind every growing brand',
    caption: "The brands that grow fastest aren't the ones with the biggest budgets - they're the ones that show up consistently. Here's the mindset shift that changes everything.",
    cta: 'Learn more',
    hashtags: ['#MarketingTips', '#BrandGrowth', '#MindsetMatters'],
    goal: 'Brand awareness',
    format: 'Single image',
    plannedDate: 'Sep 27, 2024',
    voice: 'Inspiring and warm',
  },
  {
    id: 'appr-4',
    title: 'Client success story',
    date: 'Sep 30, 2024',
    platform: 'instagram',
    imageId: 'approval-post-04',
    status: 'pending',
    topic: 'How we helped a client triple their leads',
    caption: 'Real businesses, real growth. Swipe through to see how a 90-day strategy helped one client triple their qualified leads.',
    cta: 'Read the full story',
    hashtags: ['#ClientSuccess', '#CaseStudy', '#RealResults'],
    goal: 'Lead generation',
    format: 'Carousel',
    plannedDate: 'Sep 30, 2024',
    voice: 'Proud and credible',
  },
  {
    id: 'appr-5',
    title: 'Weekly tip: SEO basics',
    date: 'Oct 2, 2024',
    platform: 'facebook',
    imageId: 'approval-post-05',
    status: 'pending',
    topic: 'One SEO habit worth building this month',
    caption: 'SEO doesn’t have to be complicated. This week, focus on one thing: writing page titles real people would actually click.',
    cta: 'Get more tips like this',
    hashtags: ['#SEOTips', '#SmallBusiness', '#WebsiteTraffic'],
    goal: 'Brand awareness',
    format: 'Single image',
    plannedDate: 'Oct 2, 2024',
    voice: 'Helpful and confident',
  },
  {
    id: 'appr-6',
    title: 'Team spotlight',
    date: 'Oct 4, 2024',
    platform: 'instagram',
    imageId: 'approval-post-06',
    status: 'pending',
    topic: 'Meet the people behind the work',
    caption: 'Great work starts with a great team. This week we’re spotlighting the people who make it happen behind the scenes.',
    cta: 'Meet the team',
    hashtags: ['#TeamSpotlight', '#BehindTheScenes', '#OurStory'],
    goal: 'Brand awareness',
    format: 'Carousel',
    plannedDate: 'Oct 4, 2024',
    voice: 'Warm and personal',
  },
  {
    id: 'appr-7',
    title: 'Before & after: homepage redesign',
    date: 'Sep 12, 2024',
    platform: 'instagram',
    imageId: 'approval-post-07',
    status: 'approved',
    topic: 'A homepage redesign that doubled enquiries',
    caption: 'Same business, same offer - a clearer homepage changed everything. Swipe to see the before and after.',
    cta: 'See more transformations',
    hashtags: ['#WebDesign', '#BeforeAndAfter', '#CaseStudy'],
    goal: 'Lead generation',
    format: 'Carousel',
    plannedDate: 'Sep 12, 2024',
    voice: 'Proud and credible',
  },
  {
    id: 'appr-8',
    title: 'Why fast websites win',
    date: 'Sep 13, 2024',
    platform: 'facebook',
    imageId: 'approval-post-08',
    status: 'approved',
    topic: 'Page speed and why it matters for conversions',
    caption: 'Every extra second your site takes to load costs you customers. Here’s what fast actually looks like - and why it’s worth fixing first.',
    cta: 'Check your site speed',
    hashtags: ['#PageSpeed', '#WebDesign', '#Conversions'],
    goal: 'Brand awareness',
    format: 'Single image',
    plannedDate: 'Sep 13, 2024',
    voice: 'Helpful and confident',
  },
  {
    id: 'appr-9',
    title: 'Client testimonial: Riverside Cafe',
    date: 'Sep 15, 2024',
    platform: 'instagram',
    imageId: 'approval-post-09',
    status: 'approved',
    topic: 'What Riverside Cafe had to say',
    caption: '"Bookings doubled within a month of launching the new site." Hear more from the Riverside Cafe team.',
    cta: 'Read more reviews',
    hashtags: ['#ClientLove', '#Testimonial', '#RealResults'],
    goal: 'Lead generation',
    format: 'Single image',
    plannedDate: 'Sep 15, 2024',
    voice: 'Warm and personal',
  },
  {
    id: 'appr-10',
    title: '5 signs your website needs a refresh',
    date: 'Sep 17, 2024',
    platform: 'linkedin',
    imageId: 'approval-post-10',
    status: 'approved',
    topic: 'Signs your website is holding your business back',
    caption: 'If any of these five signs sound familiar, your website might be costing you more customers than it’s winning.',
    cta: 'Get a free website review',
    hashtags: ['#WebDesign', '#SmallBusiness', '#DigitalMarketing'],
    goal: 'Lead generation',
    format: 'Carousel',
    plannedDate: 'Sep 17, 2024',
    voice: 'Confident and direct',
  },
  {
    id: 'appr-11',
    title: 'Meet the founder',
    date: 'Sep 18, 2024',
    platform: 'facebook',
    imageId: 'approval-post-11',
    status: 'approved',
    topic: 'The story behind Sapphire Digital Agency',
    caption: 'Every agency has a starting point. Here’s why we started Sapphire Digital Agency - and what still drives us today.',
    cta: 'Learn our story',
    hashtags: ['#OurStory', '#FounderStory', '#SapphireDigital'],
    goal: 'Brand awareness',
    format: 'Single image',
    plannedDate: 'Sep 18, 2024',
    voice: 'Warm and personal',
  },
  {
    id: 'appr-12',
    title: 'Marketing myth: more is better',
    date: 'Sep 19, 2024',
    platform: 'instagram',
    imageId: 'approval-post-12',
    status: 'approved',
    topic: 'Debunking the "post more, grow faster" myth',
    caption: 'Posting more isn’t the same as posting well. Here’s what actually moves the needle for small business marketing.',
    cta: 'Get a free strategy call',
    hashtags: ['#MarketingTips', '#SocialStrategy', '#SmallBusiness'],
    goal: 'Brand awareness',
    format: 'Carousel',
    plannedDate: 'Sep 19, 2024',
    voice: 'Confident and direct',
  },
  {
    id: 'appr-13',
    title: 'Free audit results: what we found',
    date: 'Sep 20, 2024',
    platform: 'linkedin',
    imageId: 'approval-post-13',
    status: 'approved',
    topic: 'Common issues we find in free website audits',
    caption: 'We’ve run over 100 free website audits this year. Here are the three issues that show up again and again.',
    cta: 'Claim your free audit',
    hashtags: ['#WebsiteAudit', '#SEOTips', '#DigitalMarketing'],
    goal: 'Lead generation',
    format: 'Single image',
    plannedDate: 'Sep 20, 2024',
    voice: 'Helpful and confident',
  },
  {
    id: 'appr-14',
    title: 'Instagram bio doesn’t match brand voice',
    date: 'Sep 22, 2024',
    platform: 'instagram',
    imageId: 'approval-post-14',
    status: 'needs-changes',
    topic: 'Refreshing our Instagram bio and pinned post',
    caption: 'Draft caption for a bio refresh post - needs a clearer hook before this is ready. Current version reads flat compared to the rest of the calendar.',
    cta: 'See our latest work',
    hashtags: ['#BrandRefresh', '#Instagram', '#SapphireDigital'],
    goal: 'Brand awareness',
    format: 'Single image',
    plannedDate: 'Sep 22, 2024',
    voice: 'Helpful and confident',
  },
  {
    id: 'appr-15',
    title: 'Promo: limited spots this month',
    date: 'Sep 26, 2024',
    platform: 'facebook',
    imageId: 'approval-post-15',
    status: 'needs-changes',
    topic: 'Limited-time offer for new clients',
    caption: 'Draft promo copy - reviewer flagged the offer terms need to be confirmed with the team before this goes back into review.',
    cta: 'Claim your spot',
    hashtags: ['#LimitedOffer', '#NewClients', '#DigitalMarketing'],
    goal: 'Lead generation',
    format: 'Single image',
    plannedDate: 'Sep 26, 2024',
    voice: 'Confident and direct',
  },
]

export const APPROVAL_TABS = [
  { id: 'pending', label: 'Pending review', status: 'pending' },
  { id: 'approved', label: 'Approved', status: 'approved' },
  { id: 'needs-changes', label: 'Needs changes', status: 'needs-changes' },
]

// ── Creative Studio ──────────────────────────────────────────────────
// The content this screen designs around - the same "Website tips" copy
// approved in Content Approvals, carried forward one step in the workflow.

export const CREATIVE_APPROVED_CONTENT = {
  // Intentional shared asset - this is literally the same "Website tips"
  // post approved in Content Approvals, so it reuses that same imageId.
  imageId: 'approval-post-01',
  title: 'Build your online presence',
  description: "A strong online presence opens doors to new opportunities. Let's grow your brand together.",
  hashtags: ['#DigitalMarketing', '#BusinessGrowth', '#OnlinePresence'],
}

// Each design keeps a fixed `brandStyle` "slot" (photo / dark / light) so
// regenerating never changes what KIND of creative a card is, only its
// copy and image - the same way real AI variations stay on-brief. 'dark' is
// a deliberate typography-only card (no photo needed), so it keeps a plain
// CSS `background` color instead of an `imageId`.
export const CREATIVE_DESIGNS = [
  {
    id: 'design-1',
    brandStyle: 'photo',
    imageId: 'creative-design-01',
    kicker: 'Your partner in digital growth',
    title: 'Build your online presence',
    description: 'Strategic content. Real results. A stronger tomorrow.',
    cta: 'Book a free consultation',
    footerNote: 'Strategy • Content • Growth',
    format: 'Instagram (1:1)',
    selected: true,
  },
  {
    id: 'design-2',
    brandStyle: 'dark',
    background: '#141a2c',
    kicker: 'Ideas • Strategy • Real growth',
    title: 'Build your online presence',
    titleAccent: 'presence',
    description: 'Turn your brand into opportunity.',
    cta: 'Book a free consultation',
    footerNote: 'Brands / People / Progress',
    format: 'Instagram (1:1)',
    selected: false,
  },
  {
    id: 'design-3',
    brandStyle: 'light',
    imageId: 'creative-design-04',
    kicker: null,
    title: 'Build your online presence',
    description: 'More visibility.\nMore customers.\nA brighter tomorrow.',
    cta: 'Book a free consultation',
    footerNote: 'Good brands grow brighter results',
    format: 'Instagram (1:1)',
    selected: false,
  },
]

// Alternate copy/image per brandStyle "slot", cycled through by Regenerate
// all / Regenerate selected instead of a real AI call. Every photo/light
// variant here is its own distinct imageId - regenerating was never meant
// to imply these are the same real photo, just alternate AI attempts.
export const CREATIVE_DESIGN_VARIANTS = {
  photo: [
    {
      imageId: 'creative-design-01',
      kicker: 'Your partner in digital growth',
      description: 'Strategic content. Real results. A stronger tomorrow.',
      footerNote: 'Strategy • Content • Growth',
    },
    {
      imageId: 'creative-design-02',
      kicker: 'Grow with a partner who gets it',
      description: 'Clear strategy. Consistent content. Measurable growth.',
      footerNote: 'Clarity • Consistency • Growth',
    },
    {
      imageId: 'creative-design-03',
      kicker: 'Built for small business growth',
      description: 'Real strategy, built around your business goals.',
      footerNote: 'Focused • Practical • Proven',
    },
  ],
  dark: [
    {
      background: '#141a2c',
      kicker: 'Ideas • Strategy • Real growth',
      description: 'Turn your brand into opportunity.',
      footerNote: 'Brands / People / Progress',
    },
    {
      background: '#1c1433',
      kicker: 'Bold ideas • Bigger results',
      description: 'A brand that stands out, built to last.',
      footerNote: 'Bold / Clear / Consistent',
    },
    {
      background: '#0f2033',
      kicker: 'Strategy first • Growth always',
      description: 'Every post backed by a plan that works.',
      footerNote: 'Plan / Create / Grow',
    },
  ],
  light: [
    {
      imageId: 'creative-design-04',
      kicker: null,
      description: 'More visibility.\nMore customers.\nA brighter tomorrow.',
      footerNote: 'Good brands grow brighter results',
    },
    {
      imageId: 'creative-design-05',
      kicker: null,
      description: 'Clearer message.\nStronger presence.\nSteady growth.',
      footerNote: 'Simple ideas, real results',
    },
    {
      imageId: 'creative-design-06',
      kicker: null,
      description: 'Warmer brand.\nClearer voice.\nLoyal customers.',
      footerNote: 'Made to be remembered',
    },
  ],
}

export const CREATIVE_BRAND_SETTINGS = {
  logoLabel: 'Sapphire Digital Agency',
  colors: [
    { id: 'primary', label: 'Primary', hex: '#0F1B3D' },
    { id: 'accent', label: 'Accent', hex: '#7C3AED' },
    { id: 'background', label: 'Background', hex: '#FFFFFF' },
  ],
  fontOptions: ['Inter', 'Poppins', 'Sora', 'Manrope'],
  defaultFont: 'Inter',
  formatOptions: [
    { value: 'instagram-1-1', label: 'Instagram (1:1)' },
    { value: 'instagram-story', label: 'Instagram Story (9:16)' },
    { value: 'facebook-post', label: 'Facebook Post (4:5)' },
    { value: 'linkedin-post', label: 'LinkedIn Post (1.91:1)' },
  ],
  defaultFormat: 'instagram-1-1',
}

export const CREATIVE_WORKFLOW_STEPS = [
  { id: 'content-approved', label: 'Content approved' },
  { id: 'design-review', label: 'Design review' },
  { id: 'schedule', label: 'Schedule' },
]

// ── Scheduled Posts ──────────────────────────────────────────────────
// `date` is a plain ISO date ('YYYY-MM-DD') - the list/panel format it into
// both the compact ("Wed, 23 Sep 2026") and full ("Wednesday, 23 September
// 2026") labels shown in the reference, so there is one source of truth
// per post instead of two hand-typed strings that could drift apart.

export const SCHEDULE_TABS = [
  { id: 'scheduled', label: 'Scheduled', status: 'scheduled' },
  { id: 'published', label: 'Published', status: 'published' },
  { id: 'failed', label: 'Failed', status: 'failed' },
]

export const SCHEDULE_TIMEZONE_OPTIONS = [
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'America/New_York', label: 'America/New_York (EST)' },
  { value: 'Europe/London', label: 'Europe/London (GMT)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
]

export const SCHEDULED_POSTS = [
  {
    id: 'sched-1',
    title: "A stronger tomorrow starts with a stronger online presence.",
    description: "Show up. Stand out. Grow further. Let's build a digital presence that works for you....",
    imageId: 'scheduled-post-01',
    platform: 'facebook',
    date: '2026-09-23',
    time: '10:00 AM',
    status: 'scheduled',
    contentApproved: true,
    designApproved: true,
    timezone: 'Asia/Kolkata (IST)',
    connectionAtRisk: false,
  },
  {
    id: 'sched-2',
    title: 'Turn ideas into impact.',
    description: "Your next customer is already scrolling. Make sure they find you....",
    imageId: 'scheduled-post-02',
    platform: 'instagram',
    date: '2026-09-23',
    time: '03:30 PM',
    status: 'scheduled',
    contentApproved: true,
    designApproved: true,
    timezone: 'Asia/Kolkata (IST)',
    connectionAtRisk: true,
  },
  {
    id: 'sched-3',
    title: 'Consistency compounds.',
    description: "Small, consistent steps create big results. Let's keep your brand in the right conversations....",
    imageId: 'scheduled-post-03',
    platform: 'instagram',
    date: '2026-09-25',
    time: '11:00 AM',
    status: 'scheduled',
    contentApproved: true,
    designApproved: true,
    timezone: 'Asia/Kolkata (IST)',
    connectionAtRisk: false,
  },
  {
    id: 'sched-4',
    title: 'Real people. Real stories. Real growth.',
    description: "Behind every brand is a story worth sharing. Let's tell yours....",
    imageId: 'scheduled-post-04',
    platform: 'facebook',
    date: '2026-09-25',
    time: '04:00 PM',
    status: 'scheduled',
    contentApproved: true,
    designApproved: true,
    timezone: 'Asia/Kolkata (IST)',
    connectionAtRisk: false,
  },
  {
    id: 'sched-5',
    title: 'Free audit, real answers.',
    description: 'Not sure where your website stands? Get a clear, honest breakdown in 48 hours....',
    imageId: 'scheduled-post-05',
    platform: 'facebook',
    date: '2026-09-26',
    time: '09:30 AM',
    status: 'scheduled',
    contentApproved: true,
    designApproved: true,
    timezone: 'Asia/Kolkata (IST)',
    connectionAtRisk: false,
  },
  {
    id: 'sched-6',
    title: 'Meet the team behind the work.',
    description: 'Great work starts with a great team - here are the people making it happen....',
    imageId: 'scheduled-post-06',
    platform: 'instagram',
    date: '2026-09-26',
    time: '01:00 PM',
    status: 'scheduled',
    contentApproved: true,
    designApproved: true,
    timezone: 'Asia/Kolkata (IST)',
    connectionAtRisk: false,
  },
  {
    id: 'sched-7',
    title: 'The mindset behind every growing brand.',
    description: "The brands that grow fastest show up consistently, not just when it's convenient....",
    imageId: 'scheduled-post-07',
    platform: 'facebook',
    date: '2026-09-28',
    time: '10:00 AM',
    status: 'scheduled',
    contentApproved: true,
    designApproved: true,
    timezone: 'Asia/Kolkata (IST)',
    connectionAtRisk: false,
  },
  {
    id: 'sched-8',
    title: 'One SEO habit worth building this month.',
    description: "SEO doesn't have to be complicated - start with page titles people actually click....",
    imageId: 'scheduled-post-08',
    platform: 'instagram',
    date: '2026-09-28',
    time: '02:30 PM',
    status: 'scheduled',
    contentApproved: true,
    designApproved: true,
    timezone: 'Asia/Kolkata (IST)',
    connectionAtRisk: false,
  },
  {
    id: 'sched-9',
    title: 'Before & after: a homepage that finally converts.',
    description: 'Same business, same offer - a clearer homepage changed everything....',
    imageId: 'scheduled-post-09',
    platform: 'facebook',
    date: '2026-09-30',
    time: '11:30 AM',
    status: 'scheduled',
    contentApproved: true,
    designApproved: true,
    timezone: 'Asia/Kolkata (IST)',
    connectionAtRisk: false,
  },
  {
    id: 'sched-10',
    title: 'Why fast websites win.',
    description: 'Every extra second of load time costs you customers - see what fast really looks like....',
    imageId: 'scheduled-post-10',
    platform: 'instagram',
    date: '2026-09-30',
    time: '05:00 PM',
    status: 'scheduled',
    contentApproved: true,
    designApproved: true,
    timezone: 'Asia/Kolkata (IST)',
    connectionAtRisk: false,
  },
  {
    id: 'sched-11',
    title: 'Small steps, bigger results.',
    description: 'Our 10-point checklist for sustainable social growth this quarter....',
    imageId: 'scheduled-post-11',
    platform: 'facebook',
    date: '2026-10-02',
    time: '09:00 AM',
    status: 'scheduled',
    contentApproved: true,
    designApproved: true,
    timezone: 'Asia/Kolkata (IST)',
    connectionAtRisk: false,
  },
  {
    id: 'sched-12',
    title: 'Your brand, told well.',
    description: "Every business has a story worth telling - let's make sure yours gets heard....",
    imageId: 'scheduled-post-12',
    platform: 'instagram',
    date: '2026-10-02',
    time: '12:00 PM',
    status: 'scheduled',
    contentApproved: true,
    designApproved: true,
    timezone: 'Asia/Kolkata (IST)',
    connectionAtRisk: false,
  },
]

const PUBLISHED_TITLES = [
  ['A homepage redesign that doubled enquiries.', 'Same business, same offer - see the before and after.', 'instagram'],
  ['Why fast websites win.', 'Page speed and why it matters for conversions.', 'facebook'],
  ['What Riverside Cafe had to say.', 'Bookings doubled within a month of launch.', 'instagram'],
  ['5 signs your website needs a refresh.', 'If these sound familiar, it might be costing you customers.', 'facebook'],
  ['Meet the founder.', 'The story behind Sapphire Digital Agency.', 'instagram'],
  ['Marketing myth: more is better.', "Posting more isn't the same as posting well.", 'facebook'],
  ['Free audit results: what we found.', 'Three issues that show up again and again.', 'instagram'],
  ['Small business, big results.', 'How a focused strategy beat a bigger budget.', 'facebook'],
  ['The power of a clear CTA.', "One line can be the difference between a click and a bounce.", 'instagram'],
  ['Behind the scenes at Sapphire Digital.', 'A look at how we plan and build every campaign.', 'facebook'],
  ['Client success: 3x more leads in 90 days.', 'Real strategy, real results.', 'instagram'],
  ['5 website tips to attract more customers.', 'Practical ways to improve performance today.', 'facebook'],
  ['Growth checklist for this quarter.', 'Ten small steps, one sustainable strategy.', 'instagram'],
  ['Building brands for a brighter tomorrow.', 'Consistency is still the most underrated growth lever.', 'facebook'],
  ['Great ideas happen together.', 'Why we build every strategy as a true partnership.', 'instagram'],
  ['Book a free consultation today.', "No pressure - just a clear plan for what's next.", 'facebook'],
  ['Your website should work as hard as you do.', 'Fast, simple, and easy to navigate - that’s the bar.', 'instagram'],
  ['One year of Sapphire Digital Agency.', 'Thank you to every client who trusted us with their growth.', 'facebook'],
]

// Published posts are backdated one per day, most recent first, starting
// the day before the earliest scheduled post above (2026-09-22).
function isoDaysBefore(isoDate, days) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const date = new Date(y, m - 1, d - days)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export const PUBLISHED_POSTS = PUBLISHED_TITLES.map(([title, description, platform], index) => ({
  id: `pub-${index + 1}`,
  title,
  description,
  imageId: `published-post-${String(index + 1).padStart(2, '0')}`,
  platform,
  date: isoDaysBefore('2026-09-22', index),
  time: index % 2 === 0 ? '10:00 AM' : '02:00 PM',
  status: 'published',
  contentApproved: true,
  designApproved: true,
  timezone: 'Asia/Kolkata (IST)',
}))

export const FAILED_POSTS = [
  {
    id: 'failed-1',
    title: 'Limited spots this month.',
    description: 'A short promo push for new client enquiries this month....',
    imageId: 'failed-post-01',
    platform: 'instagram',
    date: '2026-09-20',
    time: '10:00 AM',
    status: 'failed',
    contentApproved: true,
    designApproved: true,
    timezone: 'Asia/Kolkata (IST)',
    failReason: 'Instagram connection expired before this post could publish.',
  },
]

export const CONNECTION_WARNING = {
  title: '1 post needs attention',
  description: 'Instagram connection expired. Reconnect to publish scheduled posts.',
  actionLabel: 'Reconnect',
}

// ── Analytics ─────────────────────────────────────────────────────────

export const ANALYTICS_DATE_RANGE_OPTIONS = [
  { id: '7d', label: 'Last 7 days', range: 'Sep 24 – Sep 30, 2026' },
  { id: '30d', label: 'Last 30 days', range: 'Sep 1, 2026 – Sep 30, 2026' },
  { id: '90d', label: 'Last 90 days', range: 'Jul 2 – Sep 30, 2026' },
  { id: 'this-month', label: 'This month', range: 'Sep 1 – Sep 30, 2026' },
  { id: 'prev-month', label: 'Previous month', range: 'Aug 1 – Aug 31, 2026' },
]

export const ANALYTICS_DEFAULT_DATE_RANGE = '30d'

export const ANALYTICS_PLATFORM_OPTIONS = [
  { id: 'all', label: 'Facebook + Instagram' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'instagram', label: 'Instagram' },
]

// Scaled per platform filter (values for the combined view roughly equal
// the sum of the two single-platform views) so switching the filter
// visibly changes the numbers rather than just relabeling the same ones.
export const ANALYTICS_SUMMARY_BY_PLATFORM = {
  all: [
    { id: 'reach', label: 'Reach', value: '24.8K', change: '+12%', supportingText: 'vs previous 30 days', icon: Users, tint: 'bg-emerald-50 text-emerald-600' },
    { id: 'engagements', label: 'Engagements', value: '1.2K', change: '+18%', supportingText: 'vs previous 30 days', icon: Heart, tint: 'bg-rose-50 text-rose-500' },
    { id: 'link-clicks', label: 'Link clicks', value: '386', change: '+26%', supportingText: 'vs previous 30 days', icon: Link2, tint: 'bg-violet-50 text-violet-600' },
    { id: 'tracked-leads', label: 'Tracked leads', value: '24', change: '+33%', supportingText: 'vs previous 30 days', icon: UserCheck, tint: 'bg-emerald-50 text-emerald-600' },
  ],
  facebook: [
    { id: 'reach', label: 'Reach', value: '10.6K', change: '+9%', supportingText: 'vs previous 30 days', icon: Users, tint: 'bg-emerald-50 text-emerald-600' },
    { id: 'engagements', label: 'Engagements', value: '514', change: '+11%', supportingText: 'vs previous 30 days', icon: Heart, tint: 'bg-rose-50 text-rose-500' },
    { id: 'link-clicks', label: 'Link clicks', value: '155', change: '+19%', supportingText: 'vs previous 30 days', icon: Link2, tint: 'bg-violet-50 text-violet-600' },
    { id: 'tracked-leads', label: 'Tracked leads', value: '9', change: '+20%', supportingText: 'vs previous 30 days', icon: UserCheck, tint: 'bg-emerald-50 text-emerald-600' },
  ],
  instagram: [
    { id: 'reach', label: 'Reach', value: '14.2K', change: '+15%', supportingText: 'vs previous 30 days', icon: Users, tint: 'bg-emerald-50 text-emerald-600' },
    { id: 'engagements', label: 'Engagements', value: '686', change: '+23%', supportingText: 'vs previous 30 days', icon: Heart, tint: 'bg-rose-50 text-rose-500' },
    { id: 'link-clicks', label: 'Link clicks', value: '231', change: '+31%', supportingText: 'vs previous 30 days', icon: Link2, tint: 'bg-violet-50 text-violet-600' },
    { id: 'tracked-leads', label: 'Tracked leads', value: '15', change: '+41%', supportingText: 'vs previous 30 days', icon: UserCheck, tint: 'bg-emerald-50 text-emerald-600' },
  ],
}

export const TOP_PERFORMING_POSTS = [
  {
    id: 'perf-1',
    title: '5 social media tips for small businesses',
    date: 'Sep 12, 2026',
    platform: 'instagram',
    imageId: 'analytics-post-01',
    reach: '8.4K',
    engagement: '512',
    clicks: '167',
  },
  {
    id: 'perf-2',
    title: 'Why brand purpose still matters in 2026',
    date: 'Sep 5, 2026',
    platform: 'facebook',
    imageId: 'analytics-post-02',
    reach: '6.1K',
    engagement: '318',
    clicks: '102',
  },
  {
    id: 'perf-3',
    title: 'Behind the scenes: Our creative process',
    date: 'Sep 18, 2026',
    platform: 'instagram',
    imageId: 'analytics-post-03',
    reach: '5.3K',
    engagement: '274',
    clicks: '64',
  },
  {
    id: 'perf-4',
    title: 'From strategy to real results',
    date: 'Sep 22, 2026',
    platform: 'facebook',
    imageId: 'analytics-post-04',
    reach: '4.9K',
    engagement: '196',
    clicks: '53',
  },
]

export const AI_RECOMMENDATIONS = [
  {
    id: 'rec-1',
    title: 'Create more educational posts',
    description: 'Educational content drives 42% higher engagement. Share tips, how-tos and guides relevant to your audience.',
    icon: GraduationCap,
  },
  {
    id: 'rec-2',
    title: 'Test a stronger consultation CTA',
    description: 'Posts with a clear “Book a Consultation” CTA see 28% more clicks. Try alternate copy and visuals.',
    icon: Megaphone,
  },
  {
    id: 'rec-3',
    title: 'Compare morning and evening slots',
    description: 'Your evening posts are performing 34% better on average. Test more content in the 6–9 PM window.',
    icon: Clock,
  },
]

export const LEAD_TRACKING = {
  status: 'Connected',
  description: 'Track conversions from your website forms.',
  integration: { id: 'website-forms', label: 'Website forms', connectedNote: 'Connected on Sep 3, 2026', status: 'Active' },
  footerNote: 'Only tracked conversions appear as leads.',
}

export const STRATEGY_UPDATE = {
  eyebrow: 'Strategy update',
  title: 'Suggested next month: Awareness + lead generation',
  description: 'Based on your performance, we recommend focusing on brand awareness and lead generation in October 2026.',
  alertTitle: 'User approval required',
  alertDescription: 'Strategy changes need your approval before applying.',
  reviewSummary: [
    'Shift content mix to 40% educational, 35% trust-building, 25% promotional for October.',
    'Increase evening posting (6–9 PM) from 20% to 45% of the schedule.',
    'Add a consultation CTA to at least 2 posts per week.',
  ],
}

// ── Settings ──────────────────────────────────────────────────────────

export const SETTINGS_TABS = [
  { id: 'business-profile', label: 'Business profile' },
  { id: 'brand-kit', label: 'Brand kit' },
  { id: 'publishing', label: 'Publishing' },
  { id: 'team-approvals', label: 'Team & approvals' },
  { id: 'notifications', label: 'Notifications' },
]

export const BRAND_KIT_DEFAULTS = {
  logoLabel: 'Sapphire Digital Agency',
  colors: { primary: '#0F2D6B', accent: '#7C3AED', background: '#FFFFFF' },
  font: 'Inter',
  voice: 'Helpful and confident',
  language: 'English',
  prohibitedPhrases: '',
}

export const SETTINGS_FONT_OPTIONS = ['Inter', 'Poppins', 'Roboto', 'DM Sans', 'Manrope']
export const SETTINGS_VOICE_OPTIONS = ['Helpful and confident', 'Professional', 'Friendly', 'Bold', 'Educational', 'Conversational']
export const SETTINGS_LANGUAGE_OPTIONS = ['English', 'Hindi', 'Marathi', 'Spanish', 'French']

export const BRAND_PREVIEW_CONTENT = {
  headline: 'Build your online presence',
  supportingText: 'Strategic content. Real engagement. Measurable growth.',
  cta: "Let's grow together",
  imageId: 'brand-preview-01',
  footerNote: 'A brighter digital tomorrow',
}

export const PUBLISHING_RULES_DEFAULTS = {
  contentApprovalRequired: true,
  designApprovalRequired: true,
  autoPublishApproved: true,
  timezone: 'asia-kolkata',
}

export const SETTINGS_TIMEZONE_OPTIONS = [
  { value: 'asia-kolkata', label: 'Asia/Kolkata (GMT +5:30)' },
  { value: 'utc', label: 'UTC' },
  { value: 'america-new-york', label: 'America/New_York' },
  { value: 'america-los-angeles', label: 'America/Los_Angeles' },
  { value: 'europe-london', label: 'Europe/London' },
  { value: 'asia-dubai', label: 'Asia/Dubai' },
  { value: 'asia-singapore', label: 'Asia/Singapore' },
]

export const BUSINESS_NAME_DEFAULT = 'Sapphire Digital Agency'

export const DEFAULT_PUBLISHING_PLATFORMS = ['facebook', 'instagram']

export const TEAM_MEMBERS = [
  { id: 'team-1', name: 'Sarvesh Shah', email: 'sarvesh@sapphiredigitalagency.com', role: 'Admin', canApproveContent: true, canApproveDesign: true },
  { id: 'team-2', name: 'Priya Nair', email: 'priya@sapphiredigitalagency.com', role: 'Content reviewer', canApproveContent: true, canApproveDesign: false },
  { id: 'team-3', name: 'Rohan Mehta', email: 'rohan@sapphiredigitalagency.com', role: 'Designer', canApproveContent: false, canApproveDesign: true },
]

export const NOTIFICATION_SETTINGS_DEFAULTS = [
  { id: 'content-ready', label: 'Content ready for review', description: 'Get notified when AI-generated copy needs your approval.', enabled: true },
  { id: 'design-ready', label: 'Design ready for review', description: 'Get notified when AI-generated designs need your approval.', enabled: true },
  { id: 'post-published', label: 'Post successfully published', description: 'Get notified when a scheduled post goes live.', enabled: true },
  { id: 'publish-failed', label: 'Publishing failure', description: 'Get notified immediately if a post fails to publish.', enabled: true },
  { id: 'weekly-summary', label: 'Weekly analytics summary', description: 'A weekly digest of reach, engagement and leads.', enabled: false },
]
