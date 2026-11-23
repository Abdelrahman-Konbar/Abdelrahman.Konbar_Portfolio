import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { ArchitecturalField, ClinicalField, OperationalField } from '../components/Atmospheres'
import { MediaPlaceholder } from '../components/MediaPlaceholder'
import { Arrow, LineReveal, MonoLabel, Reveal, SectionTag } from '../components/ui'
import { projects, type Project } from '../data/projects'
import { Link } from '../lib/router'

const theme = {
  architectural: {
    bg: 'bg-canvas',
    text: 'text-ink',
    muted: 'text-ink/60',
    rule: 'border-ink/15',
    chip: 'border-ink/20 text-ink',
    cta: 'bg-ink text-canvas hover:bg-iris hover:text-obsidian',
    media: 'light' as const,
    Field: ArchitecturalField,
  },
  operational: {
    bg: 'bg-graphite',
    text: 'text-canvas',
    muted: 'text-steel',
    rule: 'border-canvas/15',
    chip: 'border-iris/40 text-iris',
    cta: 'bg-iris text-obsidian hover:bg-canvas',
    media: 'dark' as const,
    Field: OperationalField,
  },
  clinical: {
    bg: 'bg-[#F9FAF6]',
    text: 'text-ink',
    muted: 'text-ink/60',
    rule: 'border-ink/12',
    chip: 'border-ink/15 text-ink',
    cta: 'bg-ink text-canvas hover:bg-lime hover:text-ink',
    media: 'clinical' as const,
    Field: ClinicalField,
  },
}

function FeaturedProject({ project }: { project: Project }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const t = theme[project.atmosphere]
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 0.15'] })
  const inset = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['6%', '0%'])
  const radius = useTransform(scrollYProgress, [0, 1], reduce ? ['0px', '0px'] : ['40px', '0px'])
  const clipPath = useTransform([inset, radius], ([i, r]) => `inset(0 ${i} round ${r})`)

  const { scrollYProgress: through } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const mediaY = useTransform(through, [0, 1], reduce ? [0, 0] : [60, -60])
  const titleX = useTransform(through, [0, 1], reduce ? ['0%', '0%'] : ['4%', '-6%'])

  return (
    <motion.article
      ref={ref}
      style={{ clipPath }}
      aria-labelledby={`${project.slug}-title`}
      className={`relative isolate overflow-hidden ${t.bg} ${t.text}`}
    >
      <t.Field />
      {project.nameAlt && (
        <span
          aria-hidden="true"
          lang="ar"
          className="pointer-events-none absolute -bottom-[0.25em] right-[4%] select-none font-arabic text-[32vw] font-bold leading-none text-ink/[0.035] lg:text-[22vw]"
        >
          {project.nameAlt}
        </span>
      )}

      <div className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-20 sm:px-8 sm:pb-24 sm:pt-28 lg:px-12">
        <div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-5 ${t.rule}`}>
          <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${t.muted}`}>
            <MonoLabel className={t.text}>{project.index} / 03</MonoLabel>
            <MonoLabel>{project.kind}</MonoLabel>
            <MonoLabel>{project.category}</MonoLabel>
          </div>
          <MonoLabel className={`rounded-full border px-3 py-1 ${t.chip}`}>Case study in progress</MonoLabel>
        </div>

        <motion.h3
          id={`${project.slug}-title`}
          style={{ x: titleX }}
          className="mt-8 whitespace-nowrap font-display text-[clamp(4.5rem,17vw,17rem)] font-medium leading-[0.8] tracking-[-0.06em]"
        >
          {project.name}
        </motion.h3>

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="font-display text-[clamp(1.6rem,2.4vw,2.2rem)] font-medium leading-[1.1] tracking-[-0.02em]">
                {project.tagline}
              </p>
              <p className={`mt-5 text-[16px] leading-relaxed ${t.muted}`}>{project.description}</p>
            </Reveal>

            <Reveal delay={0.1} className={`mt-10 border-t pt-6 ${t.rule}`}>
              <MonoLabel className={t.muted}>Problem space</MonoLabel>
              <ul className="mt-4 space-y-2.5">
                {project.focus.map((f) => (
                  <li key={f} className="flex items-baseline gap-3 text-[15px]">
                    <span className={`size-1.5 shrink-0 translate-y-[-2px] rounded-[1px] ${project.atmosphere === 'operational' ? 'bg-iris' : 'bg-ink'}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.15} className={`mt-8 border-t pt-6 ${t.rule}`}>
              <MonoLabel className={t.muted}>My contribution</MonoLabel>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.contribution.map((c) => (
                  <li key={c} className={`rounded-full border px-3 py-1.5 text-[13px] ${t.chip}`}>
                    {c}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.2} className="mt-10">
              <Link
                to={`/work/${project.slug}`}
                className={`group inline-flex items-center gap-3 rounded-full px-6 py-3.5 font-display text-[15px] font-medium transition-colors duration-300 ${t.cta}`}
              >
                Open case study
                <Arrow className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>

          <motion.div style={{ y: mediaY }} className="lg:col-span-8">
            <Link to={`/work/${project.slug}`} className="group block rounded-2xl" aria-label={`Open ${project.name} case study`}>
              <div className="overflow-hidden rounded-2xl transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[0.985]">
                <MediaPlaceholder
                  src={project.media.cover}
                  alt={`${project.name} product overview`}
                  label={`${project.name} — cover visual`}
                  tone={t.media}
                  ratio="16 / 11"
                  className="rounded-2xl transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.article>
  )
}

function CompactProject({ project }: { project: Project }) {
  const t = theme[project.atmosphere]
  return (
    <article aria-labelledby={`${project.slug}-title`} className={`relative isolate overflow-hidden ${t.bg} ${t.text}`}>
      <t.Field />
      <div className="relative mx-auto max-w-[1440px] px-5 pb-20 pt-20 sm:px-8 sm:pb-28 sm:pt-28 lg:px-12">
        <div className={`flex flex-wrap items-center justify-between gap-4 border-b pb-5 ${t.rule}`}>
          <div className={`flex flex-wrap items-center gap-x-5 gap-y-2 ${t.muted}`}>
            <MonoLabel className={t.text}>{project.index} / 03</MonoLabel>
            <MonoLabel>{project.kind}</MonoLabel>
            <MonoLabel>{project.category}</MonoLabel>
          </div>
          <MonoLabel className={`rounded-full border bg-white px-3 py-1 ${t.chip}`}>Case study in progress</MonoLabel>
        </div>

        {/* Title owns its own row so it never competes with the media frame. */}
        <Reveal y={30}>
          <h3
            id={`${project.slug}-title`}
            className="relative z-10 mt-8 font-display text-[clamp(3.5rem,12vw,11rem)] font-medium leading-[0.85] tracking-[-0.055em]"
          >
            Pharmacy<span className="text-ink/35">OS</span>
          </h3>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:items-start lg:gap-10">
          <div className="lg:col-span-4">
            <Reveal>
              <p className="font-display text-[clamp(1.6rem,2.4vw,2.2rem)] font-medium leading-[1.1] tracking-[-0.02em]">
                {project.tagline}
              </p>
              <p className={`mt-5 text-[16px] leading-relaxed ${t.muted}`}>{project.description}</p>
            </Reveal>
            <Reveal delay={0.1} className={`mt-10 border-t pt-6 ${t.rule}`}>
              <MonoLabel className={t.muted}>Problem space</MonoLabel>
              <ul className="mt-4 flex flex-wrap gap-2">
                {project.focus.map((f) => (
                  <li key={f} className={`rounded-full border bg-white px-3 py-1.5 text-[13px] ${t.chip}`}>
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.15} className={`mt-8 border-t pt-6 ${t.rule}`}>
              <MonoLabel className={t.muted}>My contribution</MonoLabel>
              <p className="mt-3 text-[15px]">{project.contribution.join(' · ')}</p>
            </Reveal>
            <Reveal delay={0.2} className="mt-10">
              <Link
                to={`/work/${project.slug}`}
                className={`group inline-flex items-center gap-3 rounded-full px-6 py-3.5 font-display text-[15px] font-medium transition-colors duration-300 ${t.cta}`}
              >
                Open case study
                <Arrow className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
          <Reveal className="lg:col-span-8" y={40}>
            <Link to={`/work/${project.slug}`} className="group block rounded-[22px]" aria-label={`Open ${project.name} case study`}>
              <div className="rounded-[22px] border border-ink/10 bg-white p-2 shadow-[0_30px_80px_-40px_rgba(18,20,28,0.35)] transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[0.985]">
                <MediaPlaceholder
                  src={project.media.cover}
                  alt={`${project.name} interface`}
                  label="PharmacyOS — interface visual"
                  tone="clinical"
                  ratio="16 / 10"
                  className="rounded-2xl"
                />
              </div>
            </Link>
          </Reveal>
        </div>
      </div>
    </article>
  )
}

export function SelectedWork() {
  return (
    <section id="work" aria-labelledby="work-title" className="scroll-mt-0 bg-obsidian">
      <div className="mx-auto max-w-[1440px] px-5 pb-20 pt-28 sm:px-8 sm:pt-36 lg:px-12">
        <SectionTag index="01" label="Selected work" />
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2
            id="work-title"
            className="font-display text-[clamp(2.6rem,6.2vw,6rem)] font-medium leading-[0.92] tracking-[-0.04em] lg:col-span-8"
          >
            <LineReveal lines={['Every product here', <span className="text-steel">was a system before</span>, 'it was a screen.']} />
          </h2>
          <Reveal className="lg:col-span-4 lg:pb-3" delay={0.2}>
            <p className="text-[16px] leading-relaxed text-steel">
              Enterprise construction, logistics operations, and pharmacy retail — three domains where the
              hard part is the structure underneath the interface.
            </p>
            <p className="mt-4 flex items-start gap-2 text-[13px] text-steel/80">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-lime" />
              Full case studies and project visuals are being prepared.
            </p>
          </Reveal>
        </div>
      </div>
      <div className="flex flex-col">
        {projects.map((p) =>
          p.featured ? <FeaturedProject key={p.slug} project={p} /> : <CompactProject key={p.slug} project={p} />,
        )}
      </div>
    </section>
  )
}
