import { ArrowRight } from 'lucide-react'
import { SapphireLogoMark } from './SapphireLogoMark'
import { SocialMediaImage } from './SocialMediaImage'

/** Right "Brand preview" card - reacts live to brand colors, font choice and logo. */
export function BrandPreview({ brandKit, content }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-900">Brand preview</h2>
      <p className="mt-1 text-sm text-slate-500">Here&apos;s an example of how your brand looks in a post.</p>

      <div className="mt-4 flex flex-col overflow-hidden rounded-xl border border-slate-200 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-3 p-6" style={{ background: brandKit.colors.background, fontFamily: brandKit.font }}>
          <div className="flex items-center gap-2">
            {brandKit.logoPreviewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={brandKit.logoPreviewUrl} alt="" className="h-7 w-7 rounded-md object-cover" />
            ) : (
              <SapphireLogoMark primary={brandKit.colors.primary} accent={brandKit.colors.accent} size={28} />
            )}
            <div>
              <p className="text-sm font-bold leading-none" style={{ color: brandKit.colors.primary }}>
                Sapphire
              </p>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-400">Digital Agency</p>
            </div>
          </div>

          <h3 className="text-2xl font-extrabold leading-tight" style={{ color: brandKit.colors.primary }}>
            {content.headline}
          </h3>
          <span className="h-1 w-10 rounded-full" style={{ background: brandKit.colors.accent }} />
          <p className="text-sm leading-relaxed text-slate-600">{content.supportingText}</p>

          <span
            className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm"
            style={{ background: brandKit.colors.accent }}
          >
            {content.cta}
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>

        <SocialMediaImage imageId={content.imageId} className="min-h-[180px] flex-1">
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-black/0" />
          <span className="absolute bottom-3 right-3 text-[10px] font-semibold uppercase tracking-wide text-white/90">
            {content.footerNote}
          </span>
        </SocialMediaImage>
      </div>
    </div>
  )
}

export default BrandPreview
