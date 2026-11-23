import { useId, useState } from 'react'
import { MediaPlaceholder } from './MediaPlaceholder'
import { MonoLabel } from './ui'

/** Before/after comparison for design iterations. Accepts real images via props later. */
export function CompareSlider({
  before,
  after,
  beforeLabel = 'Earlier iteration',
  afterLabel = 'Final direction',
}: {
  before?: string
  after?: string
  beforeLabel?: string
  afterLabel?: string
}) {
  const [pos, setPos] = useState(50)
  const id = useId()
  return (
    <div className="relative overflow-hidden rounded-2xl ring-iris ring-offset-4 has-[input:focus-visible]:ring-2">
      <MediaPlaceholder src={before} label={beforeLabel} tone="light" ratio="16 / 9" note="Placeholder" className="rounded-2xl" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        <MediaPlaceholder src={after} label={afterLabel} tone="dark" ratio="16 / 9" note="Placeholder" className="h-full rounded-2xl" />
      </div>
      <div className="pointer-events-none absolute inset-y-0 w-px bg-iris" style={{ left: `${pos}%` }}>
        <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-iris text-obsidian shadow-lg">
          <svg viewBox="0 0 20 20" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M7 5 2 10l5 5M13 5l5 5-5 5" />
          </svg>
        </span>
      </div>
      <label htmlFor={id} className="sr-only">
        Compare {beforeLabel} and {afterLabel}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
      <div className="pointer-events-none absolute inset-x-4 top-4 flex justify-between">
        <MonoLabel className="rounded-full bg-canvas/90 px-2.5 py-1 text-ink">Before</MonoLabel>
        <MonoLabel className="rounded-full bg-obsidian/90 px-2.5 py-1 text-canvas">After</MonoLabel>
      </div>
    </div>
  )
}
