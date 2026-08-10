/**
 * Static/dummy data for the WordPress Management → Users page
 * (components/wordpress/users/**, app/app/wordpress/users/page.jsx).
 *
 * Frontend-only: no API calls, no React Query, no backend, no WordPress
 * authentication, no real user creation/deletion logic. One user
 * ("businessdirector_wpusr") reuses the exact username/email from the
 * approved reference screenshot for continuity; the rest are realistic
 * invented WordPress site users (distinct from the agency's own team in
 * lib/leadsDummyData.js's USERS, which represent Odito's staff, not this
 * WordPress site's users).
 */

export const ROLES = ['Administrator', 'Editor', 'Author', 'Contributor', 'Subscriber', 'Shop Manager', 'SEO Manager']

export const ROLE_TABS = [
  { key: 'Administrator', label: 'Administrators' },
  { key: 'Editor', label: 'Editors' },
  { key: 'Author', label: 'Authors' },
  { key: 'Subscriber', label: 'Subscribers' },
  { key: '__inactive__', label: 'Inactive' },
]

const AVATAR_PALETTE = ['#7C6CF6', '#5B8DEF', '#34D399', '#F0B429', '#F1665F', '#9C8CFF', '#4FC3D9', '#E97CC1']
function hashColor(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
}

function user(u) {
  const initials = `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase() || u.username.slice(0, 2).toUpperCase()
  return {
    status: 'active', twoFactorEnabled: false, postsCreated: 0, comments: 0,
    bio: 'No biographical info', website: null,
    activity: [{ text: 'Account created', time: u.registeredAt }],
    ...u,
    initials,
    tint: hashColor(u.username),
  }
}

export const USERS = [
  user({ id: 'u1', firstName: 'Sarang', lastName: 'Bhosale', username: 'sarang.b', email: 'sarang@ebrandz.com', role: 'Administrator', status: 'active', twoFactorEnabled: true, lastLogin: '2026-07-31T10:15:00', registeredAt: '12 Jan 2024', postsCreated: 12, comments: 4, bio: 'Site super administrator and agency lead.', website: 'ebrandz.com' }),
  user({ id: 'u2', firstName: 'Priya', lastName: 'Sharma', username: 'priya.sharma', email: 'priya.sharma@ebrandz.com', role: 'Administrator', status: 'active', twoFactorEnabled: true, lastLogin: '2026-07-30T16:40:00', registeredAt: '03 Mar 2024', postsCreated: 6, comments: 2, bio: 'Manages content strategy and publishing workflows.' }),
  user({ id: 'u3', firstName: 'Marcus', lastName: 'Chen', username: 'marcus.chen', email: 'marcus.chen@ebrandz.com', role: 'Editor', status: 'active', twoFactorEnabled: true, lastLogin: '2026-07-31T08:05:00', registeredAt: '18 May 2024', postsCreated: 34, comments: 11, bio: 'Reviews and edits all published content.' }),
  user({ id: 'u4', firstName: 'Lena', lastName: 'Fischer', username: 'lena.fischer', email: 'lena.fischer@ebrandz.com', role: 'Editor', status: 'active', lastLogin: '2026-07-29T14:22:00', registeredAt: '02 Jun 2024', postsCreated: 21, comments: 5 }),
  user({ id: 'u5', firstName: 'Daniel', lastName: 'Osei', username: 'daniel.osei', email: 'daniel.osei@ebrandz.com', role: 'Editor', status: 'inactive', lastLogin: '2026-05-14T09:00:00', registeredAt: '11 Jul 2024', postsCreated: 8, comments: 1 }),
  user({ id: 'u6', firstName: 'Rohan', lastName: 'Mehta', username: 'rohan.mehta', email: 'rohan.mehta@ebrandz.com', role: 'Author', status: 'active', lastLogin: '2026-07-31T07:30:00', registeredAt: '22 Aug 2024', postsCreated: 47, comments: 9 }),
  user({ id: 'u7', firstName: 'Ananya', lastName: 'Rao', username: 'ananya.rao', email: 'ananya.rao@ebrandz.com', role: 'Author', status: 'active', lastLogin: '2026-07-30T11:10:00', registeredAt: '02 Sep 2024', postsCreated: 39, comments: 6 }),
  user({ id: 'u8', firstName: '', lastName: '', username: 'businessdirector_wpusr', email: 'rituraj@ebrandz.com', role: 'Author', status: 'active', lastLogin: '2026-07-28T13:00:00', registeredAt: '05 Sep 2024', postsCreated: 3, comments: 0, bio: 'No biographical info' }),
  user({ id: 'u9', firstName: 'Wei', lastName: 'Tan', username: 'wei.tan', email: 'wei.tan@ebrandz.com', role: 'Author', status: 'active', lastLogin: '2026-07-27T15:45:00', registeredAt: '14 Sep 2024', postsCreated: 18, comments: 3 }),
  user({ id: 'u10', firstName: 'Grace', lastName: 'Oduya', username: 'grace.oduya', email: 'grace.oduya@ebrandz.com', role: 'Author', status: 'pending', lastLogin: null, registeredAt: '29 Jul 2026', postsCreated: 0, comments: 0 }),
  user({ id: 'u11', firstName: 'Owen', lastName: 'Falkner', username: 'owen.falkner', email: 'owen.falkner@example.com', role: 'Contributor', status: 'active', lastLogin: '2026-07-26T09:12:00', registeredAt: '10 Oct 2024', postsCreated: 5, comments: 2 }),
  user({ id: 'u12', firstName: 'Yuki', lastName: 'Sato', username: 'yuki.sato', email: 'yuki.sato@example.com', role: 'Contributor', status: 'blocked', lastLogin: '2026-04-02T18:00:00', registeredAt: '19 Nov 2024', postsCreated: 1, comments: 0 }),
  user({ id: 'u13', firstName: 'Camille', lastName: 'Dupont', username: 'camille.dupont', email: 'camille.dupont@example.com', role: 'Shop Manager', status: 'active', twoFactorEnabled: true, lastLogin: '2026-07-31T06:50:00', registeredAt: '01 Dec 2024', postsCreated: 2, comments: 0, bio: 'Manages storefront listings and orders.' }),
  user({ id: 'u14', firstName: 'Julian', lastName: 'Voss', username: 'julian.voss', email: 'julian.voss@example.com', role: 'SEO Manager', status: 'active', lastLogin: '2026-07-30T12:18:00', registeredAt: '15 Dec 2024', postsCreated: 4, comments: 1, bio: 'Owns on-page SEO and search console health.' }),
  ...Array.from({ length: 10 }, (_, i) => user({
    id: `sub${i + 1}`,
    firstName: ['Ester', 'Kian', 'Margarethe', 'Solomon', 'Isabelle', 'Tomasz', 'Callum', 'Hana', 'Desmond', 'Rahul'][i],
    lastName: ['Vaz', 'Farahani', 'Voigt', 'Adeyemi', 'Novak', 'Wren', 'Ashworth', 'Kobayashi', 'Achebe', 'Bhatia'][i],
    username: ['ester.vaz', 'kian.f', 'm.voigt', 'solomon.a', 'isabelle.n', 'tomasz.w', 'callum.a', 'hana.k', 'desmond.a', 'rahul.b'][i],
    email: `${['ester.vaz', 'kian.f', 'm.voigt', 'solomon.a', 'isabelle.n', 'tomasz.w', 'callum.a', 'hana.k', 'desmond.a', 'rahul.b'][i]}@example.com`,
    role: 'Subscriber', status: i === 9 ? 'inactive' : 'active',
    lastLogin: i < 8 ? `2026-07-${28 - i}T10:00:00` : null,
    registeredAt: `0${(i % 9) + 1} ${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][i % 6]} 2026`,
    postsCreated: 0, comments: [2, 0, 1, 3, 0, 1, 2, 0, 1, 0][i],
  })),
]

// ── Statistics ────────────────────────────────────────────────────────
export function computeStats(users) {
  return {
    total: users.length,
    administrators: users.filter((u) => u.role === 'Administrator').length,
    editors: users.filter((u) => u.role === 'Editor').length,
    authors: users.filter((u) => u.role === 'Author').length,
    subscribers: users.filter((u) => u.role === 'Subscriber').length,
    inactive: users.filter((u) => u.status === 'inactive').length,
  }
}

// ── User Activity (dashboard card) ───────────────────────────────────
export const USER_ACTIVITY_METRICS = {
  todaysLogins: 9,
  failedLogins: 2,
  newRegistrations: 3,
  passwordResets: 1,
  activeSessions: 5,
}

// ── Security ──────────────────────────────────────────────────────────
export const SECURITY = {
  twoFactorEnabledCount: 5,
  weakPasswords: 3,
  lockedAccounts: 1,
  securityAlerts: 1,
  lastAudit: '5 days ago',
}

// ── Recent Activity ───────────────────────────────────────────────────
export const RECENT_ACTIVITY = [
  { id: 'ua1', text: 'User Logged In — Marcus Chen', time: '25 min ago' },
  { id: 'ua2', text: 'New Registration — Grace Oduya', time: '2 days ago' },
  { id: 'ua3', text: 'Role Updated — Wei Tan promoted to Author', time: '4 days ago' },
  { id: 'ua4', text: 'Password Reset — Daniel Osei', time: '6 days ago' },
  { id: 'ua5', text: 'User Suspended — Yuki Sato (repeated failed logins)', time: '9 days ago' },
  { id: 'ua6', text: 'User Created — Julian Voss (SEO Manager)', time: '2025-12-15' },
]
