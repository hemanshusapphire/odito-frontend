/** One card in the "Your content pillars" row (Educate / Build trust / Convert). */
export function ContentPillarCard({ pillar }) {
  const Icon = pillar.icon

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${pillar.tint}`}>
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="mt-3 text-base font-bold text-slate-900">{pillar.title}</h3>
      <p className="mt-1 text-sm text-slate-500">{pillar.description}</p>

      <div className="mt-4 flex-1 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Sample ideas</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {pillar.ideas.map((idea) => (
            <li key={idea} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
              {idea}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default ContentPillarCard
