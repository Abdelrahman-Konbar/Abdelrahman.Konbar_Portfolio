import { motion, useReducedMotion } from 'motion/react'
import { useEffect, useState, type ReactNode } from 'react'
import { profile } from '../data/profile'

export const EASE = [0.16, 1, 0.3, 1] as const

export function Arrow({ className = '', dir = 'right' }: { className?: string; dir?: 'right' | 'up-right' | 'down' }) {
  const rot = dir === 'up-right' ? -45 : dir === 'down' ? 90 : 0
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      style={{ transform: `rotate(${rot}deg)` }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden="true"
    >
      <path d="M3 10h13M11 4.5 16.5 10 11 15.5" strokeLinecap="square" />
    </svg>
  )
}

export function MonoLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`font-mono text-[11px] uppercase tracking-[0.14em] ${className}`}>{children}</span>
  )
}

export function SectionTag({ index, label, tone = 'dark' }: { index: string; label: string; tone?: 'dark' | 'light' }) {
  return (
    <div className={`flex items-center gap-3 ${tone === 'dark' ? 'text-steel' : 'text-ink/60'}`}>
      <MonoLabel className={tone === 'dark' ? 'text-iris' : 'text-ink'}>{index}</MonoLabel>
      <span className={`h-px w-10 ${tone === 'dark' ? 'bg-steel/30' : 'bg-ink/25'}`} />
      <MonoLabel>{label}</MonoLabel>
    </div>
  )
}

/** Fades and lifts content into view once. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'li' | 'p' | 'span'
}) {
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
    >
      {children}
    </Comp>
  )
}

/** Masked line reveal for display typography. */
export function LineReveal({
  lines,
  className = '',
  lineClassName = '',
  delay = 0,
  inView = true,
}: {
  lines: ReactNode[]
  className?: string
  lineClassName?: string
  delay?: number
  inView?: boolean
}) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <motion.span
            className={`block ${lineClassName}`}
            initial={{ y: '110%' }}
            {...(inView
              ? { whileInView: { y: '0%' }, viewport: { once: true, margin: '-5% 0px' } }
              : { animate: { y: '0%' } })}
            transition={{ duration: 1.1, ease: EASE, delay: delay + i * 0.09 }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

export function LocalTime({ className = '' }: { className?: string }) {
  const format = () =>
    new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: profile.timezone,
    }).format(new Date())
  const [time, setTime] = useState(format)
  useEffect(() => {
    const id = setInterval(() => setTime(format()), 15000)
    return () => clearInterval(id)
  }, [])
  return (
    <time className={className} suppressHydrationWarning>
      {time}
    </time>
  )
}

export function AvailabilityDot({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion()
  return (
    <span className={`relative inline-flex size-2 ${className}`} aria-hidden="true">
      {!reduce && <span className="absolute inset-0 animate-ping rounded-full bg-lime opacity-60" />}
      <span className="relative size-2 rounded-full bg-lime" />
    </span>
  )
}

export const btn = {
  primary:
    'group inline-flex items-center gap-3 rounded-full bg-iris px-6 py-3.5 font-display text-[15px] font-medium text-obsidian transition-[background-color,transform] duration-300 hover:bg-canvas active:scale-[0.98]',
  ghostDark:
    'group inline-flex items-center gap-3 rounded-full border border-canvas/20 px-6 py-3.5 font-display text-[15px] font-medium text-canvas transition-colors duration-300 hover:border-canvas hover:bg-canvas hover:text-obsidian',
  ghostLight:
    'group inline-flex items-center gap-3 rounded-full border border-ink/20 px-6 py-3.5 font-display text-[15px] font-medium text-ink transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-canvas',
  text: 'group inline-flex items-center gap-2 font-display text-[15px] font-medium underline-offset-[6px] hover:underline',
}
