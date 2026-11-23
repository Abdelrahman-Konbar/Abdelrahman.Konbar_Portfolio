import { motion, useReducedMotion } from 'motion/react'

/** MASAR — architectural: drafting grid, measurement ticks, bilingual watermark. */
export function ArchitecturalField() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hairline-grid absolute inset-0 text-ink/[0.05]" style={{ backgroundSize: '96px 96px' }} />
      <div className="absolute inset-y-0 left-[8%] w-px bg-ink/10" />
      <div className="absolute inset-y-0 right-[8%] w-px bg-ink/10" />
      <div className="absolute left-0 right-0 top-[14%] h-px bg-ink/10" />
      <div className="absolute left-[8%] top-0 flex h-full flex-col justify-between py-10">
        {Array.from({ length: 24 }).map((_, i) => (
          <span key={i} className={`block h-px bg-ink/30 ${i % 4 === 0 ? 'w-4' : 'w-2'}`} />
        ))}
      </div>
    </div>
  )
}

/** MERIDIAN — operational: slowly turning meridian lines in a dark field. */
export function OperationalField() {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute left-1/2 top-1/2 size-[120vmax] -translate-x-1/2 -translate-y-1/2 opacity-30"
        style={{ background: 'radial-gradient(closest-side, rgba(166,160,255,0.45), transparent 70%)' }}
      />
      <motion.svg
        viewBox="0 0 800 800"
        className="absolute -right-[15%] top-1/2 size-[110vmin] -translate-y-1/2 text-iris"
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 160, ease: 'linear', repeat: Infinity }}
      >
        {[60, 130, 200, 270, 340, 390].map((rx, i) => (
          <ellipse
            key={rx}
            cx="400"
            cy="400"
            rx={rx}
            ry="390"
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1 + i * 0.03}
          />
        ))}
        {[100, 220, 400, 580, 700].map((y) => {
          const half = Math.sqrt(390 * 390 - (y - 400) * (y - 400))
          return (
            <line key={y} x1={400 - half} x2={400 + half} y1={y} y2={y} stroke="currentColor" strokeOpacity="0.12" />
          )
        })}
        <circle cx="400" cy="10" r="4" fill="#D9F36A" />
        <circle cx="790" cy="400" r="3" fill="currentColor" />
      </motion.svg>
    </div>
  )
}

/** PharmacyOS — clinical: calm, precise dot matrix. */
export function ClinicalField() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(rgba(18,20,28,0.13) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
        }}
      />
    </div>
  )
}
