import { motion, useReducedMotion } from 'motion/react'
import { useRef, useState } from 'react'
import { LivingSystem } from '../components/LivingSystem'
import { AvailabilityDot, Arrow, btn, EASE, LocalTime, MonoLabel } from '../components/ui'
import { profile } from '../data/profile'
import { Link } from '../lib/router'

// Letters arrive scattered and settle into place: complexity becoming order.
function ScatterWord({ word, delay }: { word: string; delay: number }) {
  const reduce = useReducedMotion()
  const seeds = [0.8, -0.6, 0.3, -0.9, 0.5, -0.2, 0.7]
  return (
    <span className="inline-block whitespace-nowrap" aria-hidden="true">
      {word.split('').map((ch, i) => {
        const s = seeds[i % seeds.length]
        return (
          <motion.span
            key={i}
            className="inline-block"
            initial={reduce ? false : { y: `${s * 60}%`, x: `${s * -30}%`, rotate: s * 24, opacity: 0 }}
            animate={{ y: 0, x: 0, rotate: 0, opacity: 1 }}
            transition={{ duration: 1.3, ease: EASE, delay: delay + i * 0.045 }}
          >
            {ch}
          </motion.span>
        )
      })}
    </span>
  )
}

export function Hero() {
  const reduce = !!useReducedMotion()
  const [resolved, setResolved] = useState(false)
  const readout = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease: EASE, delay },
  })

  return (
    <section
      aria-labelledby="hero-title"
      className="grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-obsidian pt-24 sm:pt-28"
    >
      {/* atmospheric field */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[20%] top-[10%] -z-10 size-[70vmax] rounded-full opacity-[0.16] blur-3xl"
        style={{ background: 'radial-gradient(closest-side, #A6A0FF, transparent)' }}
      />
      <div aria-hidden="true" className="hairline-grid pointer-events-none absolute inset-0 -z-10 text-canvas/[0.035]" />

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-5 sm:px-8 lg:px-12">
        {/* identity row */}
        <motion.div {...fade(0.15)} className="flex flex-wrap items-center gap-x-6 gap-y-2 text-steel">
          <MonoLabel className="text-canvas">{profile.name}</MonoLabel>
          <span className="hidden h-px w-8 bg-steel/30 sm:block" />
          <MonoLabel>{profile.role}</MonoLabel>
        </motion.div>

        <div className="relative mt-8 grid flex-1 grid-cols-1 lg:mt-6 lg:grid-cols-12">
          {/* copy */}
          <div className="relative z-10 flex flex-col justify-center lg:col-span-7 lg:pb-10 xl:col-span-7">
            <h1
              id="hero-title"
              className="font-display text-[clamp(3.1rem,9.4vw,9.5rem)] font-medium leading-[0.88] tracking-[-0.045em] text-canvas"
            >
              <span className="sr-only">I make complex products feel simple.</span>
              <span aria-hidden="true" className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block"
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
                >
                  I make
                </motion.span>
              </span>
              <span aria-hidden="true" className="block text-steel">
                <ScatterWord word="complex" delay={0.3} />
              </span>
              <span aria-hidden="true" className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className="block"
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.42 }}
                >
                  products
                </motion.span>
              </span>
              <span aria-hidden="true" className="block overflow-hidden pb-[0.1em]">
                <motion.span
                  className="block"
                  initial={{ y: '105%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.52 }}
                >
                  feel{' '}
                  <span className="relative inline-block text-iris">
                    simple.
                    <motion.span
                      className="absolute -bottom-[0.02em] left-0 h-[0.06em] w-full origin-left bg-lime"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 1, ease: EASE, delay: 1.2 }}
                    />
                  </span>
                </motion.span>
              </span>
            </h1>

            <motion.p
              {...fade(0.75)}
              className="mt-8 max-w-[34rem] text-[17px] leading-relaxed text-steel sm:text-lg"
            >
              <span className="text-canvas">Product Designer &amp; Design Engineer</span> for B2B SaaS and
              enterprise software. I turn tangled workflows, roles, and data into products people understand at
              first glance — and help build them.
            </motion.p>

            <motion.div {...fade(0.9)} className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/" section="work" className={btn.primary}>
                Explore work
                <Arrow dir="down" className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
              </Link>
              <Link to="/resume" className={btn.ghostDark}>
                View resume
              </Link>
              <Link to="/" section="contact" className={`${btn.text} ml-2 text-canvas`}>
                Contact
                <Arrow className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>

          {/* living system */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="relative -mx-5 mt-10 h-[56vh] min-h-[340px] sm:-mx-8 lg:absolute lg:-right-12 lg:top-[-4rem] lg:bottom-0 lg:mx-0 lg:mt-0 lg:h-auto lg:w-[56%]"
          >
            <LivingSystem
              resolved={resolved}
              reducedMotion={reduce}
              className="absolute inset-0 size-full"
              onClarity={(v) => {
                const pct = Math.round(v * 100)
                if (readout.current) readout.current.textContent = String(pct).padStart(2, '0')
                if (bar.current) bar.current.style.transform = `scaleX(${v})`
              }}
            />
            <div className="absolute bottom-4 right-5 z-10 flex items-center gap-4 sm:right-8 lg:bottom-10 lg:right-12">
              <div className="hidden w-32 sm:block" aria-hidden="true">
                <div className="flex justify-between text-steel">
                  <MonoLabel>Clarity</MonoLabel>
                  <MonoLabel className="text-canvas">
                    <span ref={readout}>00</span>%
                  </MonoLabel>
                </div>
                <div className="mt-2 h-px w-full bg-steel/20">
                  <span ref={bar} className="block h-px origin-left bg-iris" style={{ transform: 'scaleX(0)' }} />
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResolved((r) => !r)}
                aria-pressed={resolved}
                className="rounded-full border border-iris/40 bg-obsidian/60 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-iris backdrop-blur transition-colors hover:bg-iris hover:text-obsidian"
              >
                {resolved ? 'Release' : 'Resolve all'}
              </button>
            </div>
          </motion.div>
        </div>

        {/* meta strip */}
        <motion.dl
          {...fade(1.05)}
          className="relative z-10 mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-canvas/10 py-6 text-[13px] sm:grid-cols-4 lg:mt-0"
        >
          <div>
            <dt className="text-steel/70"><MonoLabel>Based in</MonoLabel></dt>
            <dd className="mt-1.5 text-canvas">Alexandria, EG · <LocalTime className="tabular-nums" /></dd>
          </div>
          <div>
            <dt className="text-steel/70"><MonoLabel>Availability</MonoLabel></dt>
            <dd className="mt-1.5 flex items-center gap-2 text-canvas">
              <AvailabilityDot /> Open to remote roles
            </dd>
          </div>
          <div>
            <dt className="text-steel/70"><MonoLabel>Focus</MonoLabel></dt>
            <dd className="mt-1.5 text-canvas">B2B SaaS · Enterprise</dd>
          </div>
          <div>
            <dt className="text-steel/70"><MonoLabel>Practice</MonoLabel></dt>
            <dd className="mt-1.5 text-canvas">Design → Code</dd>
          </div>
        </motion.dl>
      </div>
    </section>
  )
}
