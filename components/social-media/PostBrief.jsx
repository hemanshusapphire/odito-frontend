import { CALENDAR_PLATFORM_META, APPROVAL_BRIEF_ICONS } from '@/lib/socialMediaAIDummyData'

function BriefRow({ icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-50 py-2.5 last:border-0">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        {icon}
        {label}
      </span>
      <span className="truncate text-sm font-semibold text-slate-800">{value}</span>
    </div>
  )
}

/** Right-side "Post brief" card summarizing the selected post's strategy context. */
export function PostBrief({ post }) {
  const platform = CALENDAR_PLATFORM_META[post.platform]
  const PlatformIcon = platform.icon
  const GoalIcon = APPROVAL_BRIEF_ICONS.goal
  const FormatIcon = APPROVAL_BRIEF_ICONS.format
  const DateIcon = APPROVAL_BRIEF_ICONS.plannedDate
  const VoiceIcon = APPROVAL_BRIEF_ICONS.voice

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h2 className="text-base font-bold text-slate-900">Post brief</h2>
      <div className="mt-3 flex flex-col">
        <BriefRow icon={<GoalIcon className="h-4 w-4 text-slate-400" />} label="Goal" value={post.goal} />
        <BriefRow
          icon={
            <span className={`flex h-4 w-4 items-center justify-center rounded-full ${platform.badgeClass}`}>
              <PlatformIcon className="h-2.5 w-2.5" />
            </span>
          }
          label="Platform"
          value={platform.label}
        />
        <BriefRow icon={<FormatIcon className="h-4 w-4 text-slate-400" />} label="Format" value={post.format} />
        <BriefRow icon={<DateIcon className="h-4 w-4 text-slate-400" />} label="Planned date" value={post.plannedDate} />
        <BriefRow icon={<VoiceIcon className="h-4 w-4 text-slate-400" />} label="Voice" value={post.voice} />
      </div>
    </div>
  )
}

export default PostBrief
