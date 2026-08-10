/**
 * Static/dummy data for the Lead Management module
 * (components/dashboard/leads/**).
 *
 * Frontend-only module: no API calls, no React Query, no backend, no
 * persistence. Every lead here is sample data standing in for a future
 * CRM/leads API, the same approach used for the Google Ads dashboard
 * (lib/googleAdsDummyData.js). Add/Edit/Delete/Assign/Note/Schedule all
 * mutate the in-memory array held by the page component's React state -
 * nothing survives a refresh, by design.
 *
 * The 24 sample records, users, sources, statuses, priorities and tags
 * below are taken directly from the approved mockup so every value in the
 * UI matches what was reviewed.
 */

export const SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Webinar', 'Trade Show', 'Partner', 'Email Campaign']
export const STATUSES = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost']
export const PRIORITIES = ['High', 'Medium', 'Low']
export const TAGS = ['Enterprise', 'SMB', 'Hot Deal', 'Renewal', 'Upsell', 'Trial', 'Inbound', 'Outbound']

export const USERS = [
  { name: 'Ananya Rao', color: '#7C6CF6' },
  { name: 'Marcus Chen', color: '#5B8DEF' },
  { name: 'Priya Sharma', color: '#F0B429' },
  { name: 'Daniel Osei', color: '#34D399' },
  { name: 'Lena Fischer', color: '#F1665F' },
  { name: 'Rohan Mehta', color: '#9C8CFF' },
]

// Status pill styling - deliberately mapped onto the app's existing Badge
// variants (success/warning/critical/info/secondary) rather than the
// mockup's own bespoke hex palette, per "use the existing design system".
export const STATUS_BADGE_VARIANT = {
  New: 'info',
  Contacted: 'secondary',
  Qualified: 'success',
  'Proposal Sent': 'warning',
  Negotiation: 'warning',
  Won: 'success',
  Lost: 'critical',
}

export const PRIORITY_COLOR_CLASS = {
  High: 'text-destructive',
  Medium: 'text-amber-500',
  Low: 'text-muted-foreground',
}

const RAW_LEADS = [
  ['Isabelle Novak', 'Fenwick Analytics', 'isabelle.novak@fenwickanalytics.com', '+1 (415) 555-0142', 'Website', 'Ananya Rao', 'Qualified', 'High', '2026-07-29', '2026-06-02', ['Enterprise', 'Hot Deal']],
  ['Tomasz Wren', 'Northgate Robotics', 't.wren@northgaterobotics.io', '+1 (206) 555-0187', 'Referral', 'Marcus Chen', 'Negotiation', 'High', '2026-07-28', '2026-05-14', ['Enterprise']],
  ['Sana Kapoor', 'Bluepeak Logistics', 'sana.kapoor@bluepeaklog.com', '+1 (312) 555-0119', 'LinkedIn', 'Priya Sharma', 'New', 'Medium', '2026-07-30', '2026-07-30', ['Inbound']],
  ['Owen Falkner', 'Verity Health Systems', 'owen.falkner@verityhealth.com', '+1 (617) 555-0164', 'Webinar', 'Daniel Osei', 'Contacted', 'Medium', '2026-07-27', '2026-06-21', ['SMB', 'Trial']],
  ['Meiko Tanaka', 'Orbital Freight Co.', 'meiko.tanaka@orbitalfreight.com', '+1 (503) 555-0198', 'Cold Call', 'Lena Fischer', 'New', 'Low', '2026-07-30', '2026-07-29', ['Outbound']],
  ['Callum Ashworth', 'Greystone Capital', 'c.ashworth@greystonecap.com', '+1 (212) 555-0155', 'Partner', 'Rohan Mehta', 'Won', 'High', '2026-07-18', '2026-04-09', ['Enterprise', 'Renewal']],
  ['Priyanka Desai', 'Lumen Retail Group', 'priyanka.desai@lumenretail.com', '+1 (773) 555-0113', 'Trade Show', 'Ananya Rao', 'Qualified', 'Medium', '2026-07-26', '2026-06-30', ['SMB']],
  ['Baxter Cole', 'Ridgeline Manufacturing', 'baxter.cole@ridgelinemfg.com', '+1 (614) 555-0176', 'Email Campaign', 'Marcus Chen', 'Lost', 'Low', '2026-07-10', '2026-05-02', ['Outbound']],
  ['Hana Kobayashi', 'Fathom Data Systems', 'hana.kobayashi@fathomdata.com', '+1 (650) 555-0122', 'Website', 'Priya Sharma', 'Proposal Sent', 'High', '2026-07-29', '2026-06-18', ['Enterprise', 'Hot Deal']],
  ['Desmond Achebe', 'Harborlight Insurance', 'd.achebe@harborlightins.com', '+1 (404) 555-0141', 'Referral', 'Daniel Osei', 'Contacted', 'Medium', '2026-07-25', '2026-06-05', ['Renewal']],
  ['Freya Lindqvist', 'Nordstar Energy', 'freya.lindqvist@nordstarenergy.com', '+1 (720) 555-0133', 'LinkedIn', 'Lena Fischer', 'New', 'Medium', '2026-07-31', '2026-07-31', ['Inbound', 'Upsell']],
  ['Rahul Bhatia', 'Circuitworks Semiconductor', 'rahul.bhatia@circuitworks.io', '+1 (408) 555-0189', 'Webinar', 'Rohan Mehta', 'Qualified', 'High', '2026-07-28', '2026-06-27', ['Enterprise']],
  ['Nora Fitzgerald', 'Cobalt Marine Supply', 'nora.fitzgerald@cobaltmarine.com', '+1 (305) 555-0107', 'Cold Call', 'Ananya Rao', 'New', 'Low', '2026-07-30', '2026-07-28', ['SMB', 'Outbound']],
  ['Emeka Obi', 'Ironclad Security Services', 'emeka.obi@ironcladsec.com', '+1 (972) 555-0161', 'Trade Show', 'Marcus Chen', 'Negotiation', 'High', '2026-07-27', '2026-05-20', ['Enterprise', 'Hot Deal']],
  ['Yuki Sato', 'Pinehollow Realty Group', 'yuki.sato@pinehollowrealty.com', '+1 (206) 555-0148', 'Website', 'Priya Sharma', 'Contacted', 'Low', '2026-07-24', '2026-06-14', ['SMB']],
  ['Alistair Boone', 'Meridian Legal Partners', 'a.boone@meridianlegal.com', '+1 (617) 555-0177', 'Partner', 'Daniel Osei', 'Won', 'Medium', '2026-07-15', '2026-04-28', ['Renewal', 'Upsell']],
  ['Camille Dupont', 'Aurora Biotech Labs', 'camille.dupont@aurorabiotech.com', '+1 (858) 555-0129', 'Email Campaign', 'Lena Fischer', 'Qualified', 'High', '2026-07-29', '2026-06-24', ['Enterprise', 'Trial']],
  ['Theo Marchetti', 'Stonebridge Construction', 'theo.marchetti@stonebridgeco.com', '+1 (312) 555-0195', 'Referral', 'Rohan Mehta', 'New', 'Medium', '2026-07-31', '2026-07-31', ['Inbound']],
  ['Aiyana Redcloud', 'Summit Outdoor Gear', 'aiyana.redcloud@summitoutdoor.com', '+1 (720) 555-0116', 'LinkedIn', 'Ananya Rao', 'Proposal Sent', 'Medium', '2026-07-26', '2026-06-09', ['SMB', 'Hot Deal']],
  ['Julian Voss', 'Lattice Cloud Infrastructure', 'julian.voss@latticecloud.io', '+1 (415) 555-0184', 'Webinar', 'Marcus Chen', 'Contacted', 'High', '2026-07-25', '2026-06-16', ['Enterprise']],
  ['Ester Vaz', 'Coastline Hospitality Group', 'ester.vaz@coastlinehg.com', '+1 (786) 555-0163', 'Cold Call', 'Priya Sharma', 'Lost', 'Low', '2026-07-05', '2026-05-11', ['Outbound']],
  ['Kian Farahani', 'Vantage Aerospace', 'kian.farahani@vantageaero.com', '+1 (562) 555-0102', 'Trade Show', 'Daniel Osei', 'Qualified', 'High', '2026-07-30', '2026-06-29', ['Enterprise', 'Hot Deal']],
  ['Margarethe Voigt', 'Cedarwell Agriculture', 'm.voigt@cedarwellag.com', '+1 (414) 555-0171', 'Website', 'Lena Fischer', 'New', 'Low', '2026-07-31', '2026-07-30', ['SMB', 'Inbound']],
  ['Solomon Adeyemi', 'Brightpath Education', 'solomon.adeyemi@brightpathedu.com', '+1 (267) 555-0158', 'Referral', 'Rohan Mehta', 'Won', 'Medium', '2026-07-20', '2026-05-06', ['Renewal']],
]

function seedActivities(status, created, lastContact) {
  const acts = [{ type: 'created', text: 'Lead created and added to pipeline', date: created }]
  if (status !== 'New') acts.push({ type: 'contact', text: 'Initial outreach email sent', date: created })
  if (['Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'].includes(status)) {
    acts.push({ type: 'note', text: 'Discovery call completed — requirements captured', date: lastContact })
  }
  if (['Proposal Sent', 'Negotiation', 'Won'].includes(status)) {
    acts.push({ type: 'contact', text: 'Proposal document sent for review', date: lastContact })
  }
  if (status === 'Won') acts.push({ type: 'status', text: 'Deal marked as Won', date: lastContact })
  if (status === 'Lost') acts.push({ type: 'status', text: 'Deal marked as Lost', date: lastContact })
  return acts.reverse()
}

function seedTasks(status, index) {
  if (['Won', 'Lost'].includes(status)) return []
  const day = 2 + (index % 6)
  return [{ id: `t-${index}`, text: `Follow up on ${status === 'New' ? 'first response' : 'open proposal'}`, due: `2026-08-0${day}`, done: false }]
}

export function buildInitialLeads() {
  return RAW_LEADS.map((r, i) => ({
    id: 'LD-' + String(1042 + i),
    name: r[0],
    company: r[1],
    email: r[2],
    phone: r[3],
    source: r[4],
    assignedTo: r[5],
    status: r[6],
    priority: r[7],
    lastContact: r[8],
    created: r[9],
    tags: r[10],
    notes: [],
    activities: seedActivities(r[6], r[9], r[8]),
    tasks: seedTasks(r[6], i),
  }))
}

export const TODAY_ISO = '2026-07-31'

export function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

export function relDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso + 'T00:00:00')
  const now = new Date(TODAY_ISO + 'T00:00:00')
  const diff = Math.round((now - d) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  if (diff > 1 && diff < 7) return `${diff}d ago`
  return fmtDate(iso)
}

export function initials(name) {
  return name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()
}

const AVATAR_PALETTE = ['#7C6CF6', '#5B8DEF', '#34D399', '#F0B429', '#F1665F', '#9C8CFF', '#4FC3D9', '#E97CC1']

export function hashColor(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
}

export function userColor(name) {
  const u = USERS.find((u) => u.name === name)
  return u ? u.color : hashColor(name)
}
