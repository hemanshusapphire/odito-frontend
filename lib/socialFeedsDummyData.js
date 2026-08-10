/**
 * Static/dummy data for the Social Media Feeds page
 * (components/dashboard/social/feeds/**, app/app/social/feeds/page.jsx).
 *
 * Frontend-only: no API calls, no React Query, no backend, no persistence -
 * same approach as the rest of the Social Media module
 * (lib/socialMediaDummyData.js). Reuses that module's platform
 * icon/name/color config rather than redeclaring it, and continues this
 * session's "Bellhaven Family Dental" sample account for continuity with
 * the Google Ads module.
 */

import { PLATFORMS } from './socialMediaDummyData'

export const FEED_PLATFORMS = PLATFORMS.map((p) => ({ id: p.id, name: p.name, icon: p.icon, color: p.brandColor }))

export const STATUSES = ['Published', 'Scheduled', 'Draft']

// Small dummy week-over-week trend shown on each FeedStats tile.
export const FEED_TRENDS = { facebook: '+8%', linkedin: '+4%', instagram: '+12%', x: '-2%', tiktok: '+21%' }

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'engaged', label: 'Most Engaged' },
]

const ACCOUNT_NAME = 'Bellhaven Family Dental'
const ACCOUNT_INITIALS = 'BF'

function post({ id, platform, status, publishedAt, text, media, likes, comments, shares, reach, reactions }) {
  return {
    id,
    platform,
    status,
    publishedAt,
    author: { name: ACCOUNT_NAME, initials: ACCOUNT_INITIALS },
    text,
    media: media || { type: 'none' },
    metrics: { likes, comments, shares, reach, reactions },
  }
}

export const FEED_POSTS = [
  post({
    id: 'p1', platform: 'facebook', status: 'Published', publishedAt: '2026-07-30T14:33:00',
    text: "Thanksgiving is a time to express gratitude, and we want to extend our heartfelt thanks to our amazing patients for your unwavering trust. Wishing you and your loved ones a joyous holiday filled with warmth and smiles! 🦷✨ #ThankfulThursday #GratefulHeart #PatientAppreciation",
    media: { type: 'image', tone: '#1877F2' },
    likes: 214, comments: 18, shares: 12, reach: 4820, reactions: 231,
  }),
  post({
    id: 'p2', platform: 'linkedin', status: 'Published', publishedAt: '2026-07-30T09:15:00',
    text: 'Proud to share that our team completed 40 hours of continuing education this quarter on the latest in restorative dentistry. Investing in our clinicians means better care for every patient who walks through our doors. #ContinuingEducation #DentalCare #TeamGrowth',
    media: { type: 'none' },
    likes: 86, comments: 9, shares: 14, reach: 2310, reactions: 92,
  }),
  post({
    id: 'p3', platform: 'instagram', status: 'Published', publishedAt: '2026-07-29T18:02:00',
    text: 'Swipe through our newly renovated waiting room ✨ Designed with our youngest patients in mind — because a calmer visit starts the moment you walk in. #DentalOffice #KidsDentist #OfficeTour',
    media: { type: 'carousel', tone: '#E1306C', count: 4 },
    likes: 342, comments: 27, shares: 6, reach: 6110, reactions: 356,
  }),
  post({
    id: 'p4', platform: 'x', status: 'Published', publishedAt: '2026-07-29T11:41:00',
    text: "Did you know brushing too hard can wear down enamel just as much as not brushing enough? Gentle, consistent care wins every time. 🪥 #DentalTips #OralHealth",
    media: { type: 'none' },
    likes: 58, comments: 4, shares: 21, reach: 1870, reactions: 61,
  }),
  post({
    id: 'p5', platform: 'tiktok', status: 'Published', publishedAt: '2026-07-28T16:20:00',
    text: '60 seconds on what actually happens during a routine cleaning 👀 (it is less scary than you think) #DentistTok #OralHygiene #BehindTheScenes',
    media: { type: 'video', tone: '#111827' },
    likes: 1204, comments: 96, shares: 210, reach: 18400, reactions: 1310,
  }),
  post({
    id: 'p6', platform: 'facebook', status: 'Scheduled', publishedAt: '2026-08-02T08:00:00',
    text: 'Reminder: our office will be closed this Labor Day so our whole team can rest and recharge. Emergency line stays open as always. See you back on the 3rd! 🎉',
    media: { type: 'none' },
    likes: 0, comments: 0, shares: 0, reach: 0, reactions: 0,
  }),
  post({
    id: 'p7', platform: 'instagram', status: 'Published', publishedAt: '2026-07-27T13:10:00',
    text: 'Before & after: a same-day crown that saved this patient a second visit entirely. Modern dentistry, meet modern schedules. ✨🦷 #SameDayCrown #ModernDentistry',
    media: { type: 'image', tone: '#E1306C' },
    likes: 275, comments: 31, shares: 8, reach: 5230, reactions: 289,
  }),
  post({
    id: 'p8', platform: 'linkedin', status: 'Published', publishedAt: '2026-07-25T10:05:00',
    text: "We're hiring! Looking for a warm, detail-oriented dental hygienist to join our growing family practice. Full benefits, flexible scheduling, and a team that actually likes each other. Apply via the link in our bio. #Hiring #DentalHygienist #NowHiring",
    media: { type: 'none' },
    likes: 41, comments: 6, shares: 19, reach: 1540, reactions: 47,
  }),
  post({
    id: 'p9', platform: 'x', status: 'Draft', publishedAt: '2026-07-24T09:00:00',
    text: 'Draft: back-to-school dental checklist thread — 5 tips before the first bell rings 🎒🦷',
    media: { type: 'none' },
    likes: 0, comments: 0, shares: 0, reach: 0, reactions: 0,
  }),
  post({
    id: 'p10', platform: 'tiktok', status: 'Published', publishedAt: '2026-07-22T19:45:00',
    text: 'POV: you finally found a dentist that explains what they are doing step by step 😌 #DentalTok #PatientExperience',
    media: { type: 'video', tone: '#111827' },
    likes: 892, comments: 54, shares: 133, reach: 11200, reactions: 940,
  }),
  post({
    id: 'p11', platform: 'facebook', status: 'Published', publishedAt: '2026-07-20T15:30:00',
    text: "Meet Dr. Alvarez, the newest member of our care team! With 8 years of pediatric dentistry experience, she's already a favorite with our smallest patients. Welcome aboard! 👋",
    media: { type: 'image', tone: '#1877F2' },
    likes: 198, comments: 22, shares: 5, reach: 3980, reactions: 214,
  }),
  post({
    id: 'p12', platform: 'instagram', status: 'Published', publishedAt: '2026-07-18T12:00:00',
    text: 'Flossing isn’t optional, it’s foundational. A quick reminder from your favorite dental team 💛 #FlossDaily #DentalHealth #SmileCare',
    media: { type: 'image', tone: '#E1306C' },
    likes: 163, comments: 11, shares: 4, reach: 2940, reactions: 171,
  }),
  post({
    id: 'p13', platform: 'linkedin', status: 'Scheduled', publishedAt: '2026-08-05T09:00:00',
    text: 'Next month we’re sponsoring the community health fair downtown — free dental screenings for kids ages 5-12. Details to follow. #CommunityHealth #GivingBack',
    media: { type: 'none' },
    likes: 0, comments: 0, shares: 0, reach: 0, reactions: 0,
  }),
  post({
    id: 'p14', platform: 'x', status: 'Published', publishedAt: '2026-07-15T08:22:00',
    text: 'Whitening myths, debunked in one thread: charcoal toothpaste, lemon juice, and baking soda are NOT your friends. Talk to your dentist first. 🧵',
    media: { type: 'none' },
    likes: 112, comments: 15, shares: 47, reach: 3320, reactions: 127,
  }),
]

export function platformConfig(id) {
  return FEED_PLATFORMS.find((p) => p.id === id)
}
