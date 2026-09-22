/**
 * Centralized image registry for the Social Media AI module.
 *
 * Every visual placeholder identified in the image audit lives here as one
 * entry - path, alt text, category and aspect ratio - so no component ever
 * hardcodes an image URL. Data records in socialMediaAIDummyData.js hold an
 * `imageId` string that keys into this map; components resolve it through
 * getSocialMediaImage() and render it via <SocialMediaImage>, which already
 * knows how to fall back safely if the file hasn't been dropped into
 * public/social-media/ yet.
 *
 * IMPORTANT: each entry here is a genuinely distinct real-world image. The
 * original dummy data reused a handful of CSS gradients across unrelated
 * posts purely because that was a convenient placeholder palette - that is
 * NOT a signal that those posts should share a real photo. The only
 * intentional shared asset below is `approval-post-01`, which is the same
 * "Website tips" post carried from Content Approvals into Creative Studio's
 * approved-content banner. Every other entry is used in exactly one place.
 *
 * category: 'post' (generic content creative/graphic) | 'people' (business,
 * team, workspace or client photography) | 'design' (Creative Studio AI
 * design preview)
 * ratio: '1:1' (square) | '16:9' (wide banner)
 */

export const SOCIAL_MEDIA_IMAGES = {
  // ── Overview ──────────────────────────────────────────────────────
  'social-post-01': {
    src: '/social-media/posts/social-post-01.png',
    alt: 'Instagram carousel cover for "5 ways a strong brand builds customer trust"',
    category: 'post',
    ratio: '1:1',
  },
  'social-post-02': {
    src: '/social-media/people/social-post-02.png',
    alt: 'Behind-the-scenes photo of the Sapphire Digital Agency team at work',
    category: 'people',
    ratio: '1:1',
  },
  'social-post-03': {
    src: '/social-media/posts/social-post-03.png',
    alt: 'Dark stat graphic for "Client success: 3x more leads in 90 days"',
    category: 'post',
    ratio: '1:1',
  },
  'social-post-04': {
    src: '/social-media/posts/social-post-04.png',
    alt: 'Quote card graphic for "Small steps create big results"',
    category: 'post',
    ratio: '16:9',
  },
  'social-post-05': {
    src: '/social-media/posts/social-post-05.png',
    alt: 'Colorful brand graphic for "Building brands for a brighter tomorrow"',
    category: 'post',
    ratio: '16:9',
  },
  'social-post-06': {
    src: '/social-media/people/social-post-06.png',
    alt: 'Team collaborating for "Great ideas happen together"',
    category: 'people',
    ratio: '16:9',
  },

  // ── Content Calendar ──────────────────────────────────────────────
  'calendar-post-01': {
    src: '/social-media/people/calendar-post-01.png',
    alt: 'Sapphire Digital Agency team portrait for "Meet our team"',
    category: 'people',
    ratio: '16:9',
  },
  'calendar-post-02': {
    src: '/social-media/people/calendar-post-02.png',
    alt: 'Workspace flat lay for "Behind the scenes"',
    category: 'people',
    ratio: '16:9',
  },
  'calendar-post-03': {
    src: '/social-media/posts/calendar-post-03.png',
    alt: 'Dark quote graphic for "Client story"',
    category: 'post',
    ratio: '16:9',
  },
  'calendar-post-04': {
    src: '/social-media/posts/calendar-post-04.png',
    alt: 'Checklist graphic for "Growth checklist"',
    category: 'post',
    ratio: '16:9',
  },

  // ── Content Approvals (also reused by Creative Studio banner) ─────
  'approval-post-01': {
    src: '/social-media/posts/approval-post-01.png',
    alt: 'Woman working on a laptop for "Website tips" / "Build your online presence"',
    category: 'post',
    ratio: '1:1',
  },
  'approval-post-02': {
    src: '/social-media/posts/approval-post-02.png',
    alt: 'Small business owner at work for "Small business growth"',
    category: 'post',
    ratio: '1:1',
  },
  'approval-post-03': {
    src: '/social-media/posts/approval-post-03.png',
    alt: 'Gold abstract graphic for "Marketing mindset"',
    category: 'post',
    ratio: '1:1',
  },
  'approval-post-04': {
    src: '/social-media/people/approval-post-04.png',
    alt: 'Client meeting photo for "Client success story"',
    category: 'people',
    ratio: '1:1',
  },
  'approval-post-05': {
    src: '/social-media/posts/approval-post-05.png',
    alt: 'Blue website graphic for "Weekly tip: SEO basics"',
    category: 'post',
    ratio: '1:1',
  },
  'approval-post-06': {
    src: '/social-media/people/approval-post-06.png',
    alt: 'Marketing team portrait for "Team spotlight"',
    category: 'people',
    ratio: '1:1',
  },
  'approval-post-07': {
    src: '/social-media/posts/approval-post-07.png',
    alt: 'Before-and-after web design mockup for "Before & after: homepage redesign"',
    category: 'post',
    ratio: '1:1',
  },
  'approval-post-08': {
    src: '/social-media/posts/approval-post-08.png',
    alt: 'Website speed graphic for "Why fast websites win"',
    category: 'post',
    ratio: '1:1',
  },
  'approval-post-09': {
    src: '/social-media/people/approval-post-09.png',
    alt: 'Riverside Cafe interior for "Client testimonial: Riverside Cafe"',
    category: 'people',
    ratio: '1:1',
  },
  'approval-post-10': {
    src: '/social-media/posts/approval-post-10.png',
    alt: 'Website redesign graphic for "5 signs your website needs a refresh"',
    category: 'post',
    ratio: '1:1',
  },
  'approval-post-11': {
    src: '/social-media/people/approval-post-11.png',
    alt: 'Founder portrait for "Meet the founder"',
    category: 'people',
    ratio: '1:1',
  },
  'approval-post-12': {
    src: '/social-media/posts/approval-post-12.png',
    alt: 'Mint green abstract graphic for "Marketing myth: more is better"',
    category: 'post',
    ratio: '1:1',
  },
  'approval-post-13': {
    src: '/social-media/posts/approval-post-13.png',
    alt: 'Data report graphic for "Free audit results: what we found"',
    category: 'post',
    ratio: '1:1',
  },
  'approval-post-14': {
    src: '/social-media/posts/approval-post-14.png',
    alt: 'Instagram branding graphic for "Instagram bio doesn’t match brand voice"',
    category: 'post',
    ratio: '1:1',
  },
  'approval-post-15': {
    src: '/social-media/posts/approval-post-15.png',
    alt: 'Promotional sale graphic for "Promo: limited spots this month"',
    category: 'post',
    ratio: '1:1',
  },

  // ── Creative Studio (each AI design slot is its own image) ─────────
  'creative-design-01': {
    src: '/social-media/designs/creative-design-01.png',
    alt: 'Ornate star-patterned marble ceiling detail, default "Build your online presence" design',
    category: 'design',
    ratio: '1:1',
  },
  'creative-design-02': {
    src: '/social-media/designs/creative-design-02.png',
    alt: 'Wooden letterpress blocks spelling out "graphic design", regenerated design variant',
    category: 'design',
    ratio: '1:1',
  },
  'creative-design-03': {
    src: '/social-media/designs/creative-design-03.png',
    alt: 'Desktop monitor and laptop mockups displaying a red "Design" presentation slide, regenerated design variant',
    category: 'design',
    ratio: '1:1',
  },
  'creative-design-04': {
    src: '/social-media/designs/creative-design-04.png',
    alt: 'Art deco cut-paper "Designer" typography in blue and gold, default workspace design',
    category: 'design',
    ratio: '1:1',
  },
  'creative-design-05': {
    src: '/social-media/designs/creative-design-05.png',
    alt: 'Abstract red and white paint brush stroke, regenerated design variant',
    category: 'design',
    ratio: '1:1',
  },
  'creative-design-06': {
    src: '/social-media/designs/creative-design-06.png',
    alt: 'Close-up wooden letterpress blocks spelling "Design" on a wood table, regenerated design variant',
    category: 'design',
    ratio: '1:1',
  },

  // ── Scheduled Posts (Scheduled tab, 12) ─────────────────────────────
  'scheduled-post-01': {
    src: '/social-media/people/scheduled-post-01.png',
    alt: 'Workspace photo for "A stronger tomorrow starts with a stronger online presence"',
    category: 'people',
    ratio: '1:1',
  },
  'scheduled-post-02': {
    src: '/social-media/posts/scheduled-post-02.png',
    alt: 'Dark quote graphic for "Turn ideas into impact"',
    category: 'post',
    ratio: '1:1',
  },
  'scheduled-post-03': {
    src: '/social-media/posts/scheduled-post-03.png',
    alt: 'Dark quote graphic for "Consistency compounds"',
    category: 'post',
    ratio: '1:1',
  },
  'scheduled-post-04': {
    src: '/social-media/people/scheduled-post-04.png',
    alt: 'Team and client photo for "Real people. Real stories. Real growth."',
    category: 'people',
    ratio: '1:1',
  },
  'scheduled-post-05': {
    src: '/social-media/people/scheduled-post-05.png',
    alt: 'Consultation photo for "Free audit, real answers"',
    category: 'people',
    ratio: '1:1',
  },
  'scheduled-post-06': {
    src: '/social-media/people/scheduled-post-06.png',
    alt: 'Team photo for "Meet the team behind the work"',
    category: 'people',
    ratio: '1:1',
  },
  'scheduled-post-07': {
    src: '/social-media/people/scheduled-post-07.png',
    alt: 'Workspace photo for "The mindset behind every growing brand"',
    category: 'people',
    ratio: '1:1',
  },
  'scheduled-post-08': {
    src: '/social-media/posts/scheduled-post-08.png',
    alt: 'SEO tip graphic for "One SEO habit worth building this month"',
    category: 'post',
    ratio: '1:1',
  },
  'scheduled-post-09': {
    src: '/social-media/posts/scheduled-post-09.png',
    alt: 'Homepage mockup graphic for "Before & after: a homepage that finally converts"',
    category: 'post',
    ratio: '1:1',
  },
  'scheduled-post-10': {
    src: '/social-media/posts/scheduled-post-10.png',
    alt: 'Website speed graphic for "Why fast websites win"',
    category: 'post',
    ratio: '1:1',
  },
  'scheduled-post-11': {
    src: '/social-media/posts/scheduled-post-11.png',
    alt: 'Checklist graphic for "Small steps, bigger results"',
    category: 'post',
    ratio: '1:1',
  },
  'scheduled-post-12': {
    src: '/social-media/people/scheduled-post-12.png',
    alt: 'Brand storytelling photo for "Your brand, told well"',
    category: 'people',
    ratio: '1:1',
  },

  // ── Scheduled Posts (Published tab, 18) ─────────────────────────────
  'published-post-01': {
    src: '/social-media/posts/published-post-01.png',
    alt: 'Before-and-after homepage mockup for "A homepage redesign that doubled enquiries"',
    category: 'post',
    ratio: '1:1',
  },
  'published-post-02': {
    src: '/social-media/posts/published-post-02.png',
    alt: 'Website speed graphic for "Why fast websites win"',
    category: 'post',
    ratio: '1:1',
  },
  'published-post-03': {
    src: '/social-media/people/published-post-03.png',
    alt: 'Riverside Cafe client photo for "What Riverside Cafe had to say"',
    category: 'people',
    ratio: '1:1',
  },
  'published-post-04': {
    src: '/social-media/posts/published-post-04.png',
    alt: 'Website refresh graphic for "5 signs your website needs a refresh"',
    category: 'post',
    ratio: '1:1',
  },
  'published-post-05': {
    src: '/social-media/people/published-post-05.png',
    alt: 'Founder portrait for "Meet the founder"',
    category: 'people',
    ratio: '1:1',
  },
  'published-post-06': {
    src: '/social-media/posts/published-post-06.png',
    alt: 'Abstract graphic for "Marketing myth: more is better"',
    category: 'post',
    ratio: '1:1',
  },
  'published-post-07': {
    src: '/social-media/posts/published-post-07.png',
    alt: 'Audit report graphic for "Free audit results: what we found"',
    category: 'post',
    ratio: '1:1',
  },
  'published-post-08': {
    src: '/social-media/people/published-post-08.png',
    alt: 'Small business owner photo for "Small business, big results"',
    category: 'people',
    ratio: '1:1',
  },
  'published-post-09': {
    src: '/social-media/posts/published-post-09.png',
    alt: 'Call-to-action graphic for "The power of a clear CTA"',
    category: 'post',
    ratio: '1:1',
  },
  'published-post-10': {
    src: '/social-media/people/published-post-10.png',
    alt: 'Office and team photo for "Behind the scenes at Sapphire Digital"',
    category: 'people',
    ratio: '1:1',
  },
  'published-post-11': {
    src: '/social-media/people/published-post-11.png',
    alt: 'Client success photo for "Client success: 3x more leads in 90 days"',
    category: 'people',
    ratio: '1:1',
  },
  'published-post-12': {
    src: '/social-media/posts/published-post-12.png',
    alt: 'Website tips graphic for "5 website tips to attract more customers"',
    category: 'post',
    ratio: '1:1',
  },
  'published-post-13': {
    src: '/social-media/posts/published-post-13.png',
    alt: 'Checklist graphic for "Growth checklist for this quarter"',
    category: 'post',
    ratio: '1:1',
  },
  'published-post-14': {
    src: '/social-media/posts/published-post-14.png',
    alt: 'Brand graphic for "Building brands for a brighter tomorrow"',
    category: 'post',
    ratio: '1:1',
  },
  'published-post-15': {
    src: '/social-media/people/published-post-15.png',
    alt: 'Team collaboration photo for "Great ideas happen together"',
    category: 'people',
    ratio: '1:1',
  },
  'published-post-16': {
    src: '/social-media/people/published-post-16.png',
    alt: 'Consultation photo for "Book a free consultation today"',
    category: 'people',
    ratio: '1:1',
  },
  'published-post-17': {
    src: '/social-media/posts/published-post-17.png',
    alt: 'Website performance graphic for "Your website should work as hard as you do"',
    category: 'post',
    ratio: '1:1',
  },
  'published-post-18': {
    src: '/social-media/people/published-post-18.png',
    alt: 'Team celebration photo for "One year of Sapphire Digital Agency"',
    category: 'people',
    ratio: '1:1',
  },

  // ── Scheduled Posts (Failed tab, 1) ─────────────────────────────────
  'failed-post-01': {
    src: '/social-media/posts/failed-post-01.png',
    alt: 'Promotional graphic for "Limited spots this month"',
    category: 'post',
    ratio: '1:1',
  },

  // ── Analytics ─────────────────────────────────────────────────────
  'analytics-post-01': {
    src: '/social-media/posts/analytics-post-01.png',
    alt: 'Social media tips graphic for "5 social media tips for small businesses"',
    category: 'post',
    ratio: '1:1',
  },
  'analytics-post-02': {
    src: '/social-media/people/analytics-post-02.png',
    alt: 'Brand story photo for "Why brand purpose still matters in 2026"',
    category: 'people',
    ratio: '1:1',
  },
  'analytics-post-03': {
    src: '/social-media/people/analytics-post-03.png',
    alt: 'Team process photo for "Behind the scenes: Our creative process"',
    category: 'people',
    ratio: '1:1',
  },
  'analytics-post-04': {
    src: '/social-media/people/analytics-post-04.png',
    alt: 'Strategy session photo for "From strategy to real results"',
    category: 'people',
    ratio: '1:1',
  },

  // ── Settings ──────────────────────────────────────────────────────
  'brand-preview-01': {
    src: '/social-media/people/brand-preview-01.png',
    alt: 'Workspace photo used in the Brand kit live preview',
    category: 'people',
    ratio: '1:1',
  },
}

/** Looks up a registry entry by imageId. Returns null for a missing/unknown id - callers render the safe fallback in that case. */
export function getSocialMediaImage(imageId) {
  return SOCIAL_MEDIA_IMAGES[imageId] || null
}
