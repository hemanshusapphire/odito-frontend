import { SocialMediaImage } from './SocialMediaImage'

/** Large 1:1 preview of the REAL post (its first image and caption) shown at the top of the Confirm Schedule panel. */
export function SchedulePreview({ post, accountName }) {
  return (
    <SocialMediaImage src={post.imageSrc} alt="" className="aspect-square w-full rounded-xl">
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/75 to-white/0" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white/85 to-white/0" />
      <div className="relative flex h-full flex-col justify-between p-4">
        <h3 className="line-clamp-4 break-words text-xl font-extrabold leading-tight text-slate-900 sm:text-2xl">{post.title}</h3>
        {accountName && (
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0b2a52] text-[10px] font-bold text-white">
              {accountName.trim().charAt(0).toUpperCase()}
            </span>
            <span className="truncate text-xs font-medium text-slate-700">{accountName}</span>
          </div>
        )}
      </div>
    </SocialMediaImage>
  )
}

export default SchedulePreview
