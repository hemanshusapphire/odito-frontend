import { DesignCard } from './DesignCard'

/** "Choose from 3 AI designs" grid. */
export function DesignGrid({ designs, selectedDesignId, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {designs.map((design) => (
        <DesignCard key={design.id} design={design} selected={design.id === selectedDesignId} onSelect={onSelect} />
      ))}
    </div>
  )
}

export default DesignGrid
