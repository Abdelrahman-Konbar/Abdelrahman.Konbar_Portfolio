import { MonoLabel } from './ui'

type Tone = 'light' | 'dark' | 'clinical'

/**
 * Clearly labelled slot for real project imagery. Pass `src` once assets exist;
 * until then it renders an intentional placeholder — never a fake screenshot.
 */
export function MediaPlaceholder({
  src,
  alt = '',
  label = 'Project visual',
  ratio = '16 / 10',
  tone = 'dark',
  className = '',
  note = 'Placeholder — real project imagery to be added',
}: {
  src?: string
  alt?: string
  label?: string
  ratio?: string
  tone?: Tone
  className?: string
  note?: string
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`w-full rounded-[inherit] object-cover ${className}`}
        style={{ aspectRatio: ratio }}
      />
    )
  }
  const palette = {
    dark: 'bg-graphite text-steel/10 border-steel/15',
    light: 'bg-[#E9E7E0] text-ink/[0.06] border-ink/10',
    clinical: 'bg-white text-[#2f6b5d]/[0.07] border-ink/10',
  }[tone]
  const textTone = tone === 'dark' ? 'text-steel' : 'text-ink/60'
  return (
    <div
      role="img"
      aria-label={`${label}. ${note}.`}
      className={`relative isolate w-full overflow-hidden border ${palette} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <div className="placeholder-hatch absolute inset-0" />
      {/* crop marks */}
      {['left-3 top-3 border-l border-t', 'right-3 top-3 border-r border-t', 'left-3 bottom-3 border-l border-b', 'right-3 bottom-3 border-r border-b'].map(
        (c) => (
          <span key={c} className={`absolute size-4 ${c} ${tone === 'dark' ? 'border-iris/60' : 'border-ink/40'}`} />
        ),
      )}
      <div className={`absolute inset-x-5 bottom-5 flex flex-wrap items-end justify-between gap-2 ${textTone}`}>
        <MonoLabel>{label}</MonoLabel>
        <MonoLabel className="opacity-70">{note}</MonoLabel>
      </div>
    </div>
  )
}
