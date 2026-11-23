import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArchitecturalField, ClinicalField, OperationalField } from '../components/Atmospheres'
import { CompareSlider } from '../components/CompareSlider'
import { DecisionExplorer } from '../components/DecisionExplorer'
import { MediaPlaceholder } from '../components/MediaPlaceholder'
import { Arrow, EASE, LineReveal, MonoLabel, Reveal } from '../components/ui'
import { profile } from '../data/profile'
import { nextProject, sampleDecision, type Project } from '../data/projects'
import { Link } from '../lib/router'

const heroTheme = {
  architectural: { bg: 'bg-canvas text-ink', muted: 'text-ink/60', rule: 'border-ink/15', Field: ArchitecturalField },
  operational: { bg: 'bg-graphite text-canvas', muted: 'text-steel', rule: 'border-canvas/15', Field: OperationalField },
  clinical: { bg: 'bg-[#F9FAF6] text-ink', muted: 'text-ink/60', rule: 'border-ink/12', Field: ClinicalField },
}

const sections = [
  { id: 'overview', title: 'Overview' },
  { id: 'problem', title: 'The problem' },
  { id: 'role', title: 'My role' },
  { id: 'research', title: 'Research & discovery' },
  { id: 'decisions', title: 'Strategy & UX decisions' },
  { id: 'architecture', title: 'Architecture & workflows' },
  { id: 'exploration', title: 'Exploration' },
  { id: 'product', title: 'The product' },
  { id: 'system', title: 'Design system' },
  { id: 'engineering', title: 'Design engineering' },
  { id: 'outcomes', title: 'Outcomes & learnings' },
]

/** Elegant placeholder for content not yet written — never filled with invented facts. */
function Pending({ children, tone = 'light' }: { children: ReactNode; tone?: 'light' | 'dark' }) {
  return (
    <div
      className={`rounded-2xl border border-dashed p-6 ${
        tone === 'light' ? 'border-ink/20 bg-ink/[0.02] text-ink/55' : 'border-canvas/20 bg-canvas/[0.02] text-steel'
      }`}
    >
      <MonoLabel className={tone === 'light' ? 'text-ink/70' : 'text-iris'}>To be written</MonoLabel>
      <p className="mt-2 text-[15px] leading-relaxed">{children}</p>
    </div>
  )
}

function Text({ value, fallback, tone }: { value?: string; fallback: string; tone?: 'light' | 'dark' }) {
  return value ? (
    <p className="text-lg leading-relaxed">{value}</p>
  ) : (
    <Pending tone={tone}>{fallback}</Pending>
  )
}

function Block({
  id,
  index,
  title,
  kicker,
  children,
  tone = 'light',
}: {
  id: string
  index: number
  title: string
  kicker?: string
  children: ReactNode
  tone?: 'light' | 'dark'
}) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-28">
      <div className={`flex items-center gap-3 ${tone === 'light' ? 'text-ink/50' : 'text-steel'}`}>
        <MonoLabel className={tone === 'light' ? 'text-ink' : 'text-iris'}>{String(index + 1).padStart(2, '0')}</MonoLabel>
        <span className={`h-px w-8 ${tone === 'light' ? 'bg-ink/25' : 'bg-steel/30'}`} />
        {kicker && <MonoLabel>{kicker}</MonoLabel>}
      </div>
      <h2
        id={`${id}-h`}
        className="mt-5 font-display text-[clamp(2rem,4vw,3.4rem)] font-medium leading-[0.98] tracking-[-0.035em]"
      >
        {title}
      </h2>
      <div className="mt-10">{children}</div>
    </section>
  )
}

function useActiveSection() {
  const [active, setActive] = useState(sections[0].id)
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-30% 0px -60% 0px' },
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])
  return active
}

export function CaseStudy({ project }: { project: Project }) {
  const t = heroTheme[project.atmosphere]
  const cs = project.caseStudy
  const next = nextProject(project.slug)
  const active = useActiveSection()
  const reduce = useReducedMotion()
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 0.6], reduce ? [0, 0] : [0, -40])
  const mediaTone = project.atmosphere === 'operational' ? 'dark' : project.atmosphere === 'clinical' ? 'clinical' : 'light'

  useEffect(() => {
    document.title = `${project.name} — Case study · ${profile.name}`
  }, [project])

  return (
    <article>
      {/* Hero */}
      <header ref={heroRef} className={`relative isolate overflow-hidden ${t.bg}`}>
        <t.Field />
        <motion.div style={{ y: heroY }} className="relative mx-auto max-w-[1440px] px-5 pb-16 pt-32 sm:px-8 sm:pt-40 lg:px-12">
          <Link to="/" section="work" className={`group inline-flex items-center gap-2 text-[14px] ${t.muted} hover:opacity-100`}>
            <Arrow className="size-4 rotate-180 transition-transform group-hover:-translate-x-1" /> All work
          </Link>
          <div className={`mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 ${t.muted}`}>
            <MonoLabel>Case study {project.index}</MonoLabel>
            <MonoLabel>{project.category}</MonoLabel>
          </div>
          <h1 className="mt-6 font-display text-[clamp(4rem,16vw,15rem)] font-medium leading-[0.8] tracking-[-0.06em]">
            <LineReveal inView={false} delay={0.15} lines={[project.name]} />
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.45 }}
            className="mt-8 max-w-3xl font-display text-[clamp(1.5rem,2.8vw,2.4rem)] font-medium leading-[1.12] tracking-[-0.02em]"
          >
            {project.tagline}
          </motion.p>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.6 }}
            className={`mt-14 grid grid-cols-2 gap-6 border-t pt-6 md:grid-cols-4 ${t.rule}`}
          >
            {[
              ['Product', project.kind],
              ['Domain', project.category],
              ['Contribution', project.contribution.join(', ')],
              ['Status', 'Case study in progress'],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className={t.muted}>
                  <MonoLabel>{k}</MonoLabel>
                </dt>
                <dd className="mt-2 text-[15px]">{v}</dd>
              </div>
            ))}
          </motion.dl>
        </motion.div>
        <div className="relative mx-auto max-w-[1440px] px-5 pb-16 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 40, clipPath: 'inset(8% 4% 0 4% round 24px)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0 0% round 24px)' }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.5 }}
          >
            <MediaPlaceholder src={project.media.cover} label={`${project.name} — hero visual`} tone={mediaTone} ratio="21 / 9" className="rounded-3xl" />
          </motion.div>
        </div>
      </header>

      {/* Status notice */}
      <div className="border-y border-ink/10 bg-lime text-ink">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-[14px] sm:px-8 lg:px-12">
          <MonoLabel>Work in progress</MonoLabel>
          <span>This case study is being written. The structure below shows what it will cover — no content here is invented.</span>
        </div>
      </div>

      {/* Body */}
      <div className="bg-canvas text-ink">
        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-24 sm:px-8 lg:grid-cols-12 lg:px-12">
          <nav aria-label="Case study sections" className="hidden lg:col-span-3 lg:block">
            <ol className="sticky top-28 space-y-1 border-l border-ink/10">
              {sections.map((s, i) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(s.id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })
                    }}
                    aria-current={active === s.id ? 'true' : undefined}
                    className={`-ml-px flex items-center gap-3 border-l py-1.5 pl-4 text-[14px] transition-colors ${
                      active === s.id ? 'border-ink text-ink' : 'border-transparent text-ink/45 hover:text-ink'
                    }`}
                  >
                    <span className="font-mono text-[11px]">{String(i + 1).padStart(2, '0')}</span>
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="space-y-32 lg:col-span-9">
            <Block id="overview" index={0} title="Overview" kicker="Executive summary">
              <div className="grid gap-10 md:grid-cols-5">
                <div className="md:col-span-3">
                  {cs.summary ? (
                    <p className="font-display text-[clamp(1.4rem,2.2vw,1.9rem)] font-medium leading-[1.25] tracking-[-0.015em]">{cs.summary}</p>
                  ) : (
                    <>
                      <p className="font-display text-[clamp(1.4rem,2.2vw,1.9rem)] font-medium leading-[1.25] tracking-[-0.015em]">
                        {project.description}
                      </p>
                      <div className="mt-8">
                        <Pending>A short executive summary: what the product is, who uses it, and the core challenge this work addressed.</Pending>
                      </div>
                    </>
                  )}
                </div>
                <div className="md:col-span-2">
                  <MonoLabel className="text-ink/50">Problem space</MonoLabel>
                  <ul className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
                    {project.focus.map((f) => (
                      <li key={f} className="py-3 text-[15px]">
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Block>

            <Block id="problem" index={1} title="The problem" kicker="Business & user">
              <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/10 bg-ink/10 md:grid-cols-2">
                {[
                  ['Business problem', cs.businessProblem, 'What the organisation needed, and why the existing approach fell short.'],
                  ['User problem', cs.userProblem, 'What people using the product struggled with in their day-to-day work.'],
                ].map(([label, value, fallback]) => (
                  <div key={label} className="bg-canvas p-8">
                    <MonoLabel className="text-ink/50">{label}</MonoLabel>
                    <div className="mt-5">
                      <Text value={value} fallback={fallback!} />
                    </div>
                  </div>
                ))}
              </div>
            </Block>

            <Block id="role" index={2} title="My role" kicker="Responsibilities">
              <div className="grid gap-10 md:grid-cols-5">
                <div className="md:col-span-2">
                  <MonoLabel className="text-ink/50">Contribution</MonoLabel>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {project.contribution.map((c) => (
                      <li key={c} className="rounded-full bg-ink px-3.5 py-1.5 text-[14px] text-canvas">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="md:col-span-3">
                  {cs.responsibilities?.length ? (
                    <ul className="space-y-3 text-lg">{cs.responsibilities.map((r) => <li key={r}>{r}</li>)}</ul>
                  ) : (
                    <Pending>Specific responsibilities, team composition, collaborators, and the scope of individual ownership.</Pending>
                  )}
                </div>
              </div>
            </Block>

            <Block id="research" index={3} title="Research & discovery" kicker="Included only where conducted">
              <Text
                value={cs.research}
                fallback="Research methods and findings — included only if research was actually conducted for this project. Otherwise this section is removed."
              />
            </Block>
          </div>
        </div>

        {/* Full-bleed dark band: decisions */}
        <div className="grain relative bg-obsidian text-canvas">
          <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-28 sm:px-8 lg:grid-cols-12 lg:px-12">
            <div className="lg:col-span-3" />
            <div className="lg:col-span-9">
              <Block id="decisions" index={4} title="Strategy & UX decisions" kicker="Reasoning, not decoration" tone="dark">
                <div className="mb-10 max-w-2xl">
                  <Text value={cs.strategy} tone="dark" fallback="The product strategy and the principles that guided design decisions." />
                </div>
                {(cs.decisions?.length ? cs.decisions : [sampleDecision]).map((d, i) => (
                  <div key={i} className={i > 0 ? 'mt-8' : ''}>
                    <DecisionExplorer decision={d} />
                  </div>
                ))}
              </Block>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-28 sm:px-8 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-3" />
          <div className="space-y-32 lg:col-span-9">
            <Block id="architecture" index={5} title="Information architecture & workflows" kicker="Structure">
              <MediaPlaceholder label="IA / workflow diagram" tone="light" ratio="21 / 9" className="rounded-2xl" note="Diagram to be added" />
              <div className="mt-8 max-w-2xl">
                <Text value={cs.architecture} fallback="How roles, objects, and workflows were structured — and why that structure was chosen." />
              </div>
            </Block>

            <Block id="exploration" index={6} title="Design exploration & iterations" kicker="Drag to compare">
              <CompareSlider />
              <div className="mt-8 max-w-2xl">
                <Text value={cs.exploration} fallback="Directions explored, what was learned from each iteration, and what changed as a result." />
              </div>
            </Block>
          </div>
        </div>

        {/* Full-bleed product gallery */}
        <section id="product" aria-labelledby="product-h" className="scroll-mt-20 bg-obsidian py-28 text-canvas">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 text-steel">
                  <MonoLabel className="text-iris">08</MonoLabel>
                  <span className="h-px w-8 bg-steel/30" />
                  <MonoLabel>Product imagery</MonoLabel>
                </div>
                <h2 id="product-h" className="mt-5 font-display text-[clamp(2rem,4vw,3.4rem)] font-medium tracking-[-0.035em]">
                  The product
                </h2>
              </div>
              <p className="max-w-sm text-[15px] text-steel">High-fidelity screens will be placed here once final assets are prepared.</p>
            </div>
            <div className="mt-12 grid gap-4 md:grid-cols-6">
              <Reveal className="md:col-span-4 md:row-span-2">
                <MediaPlaceholder src={project.media.gallery?.[0]} label="Primary screen" ratio="4 / 3" className="h-full rounded-2xl" />
              </Reveal>
              <Reveal className="md:col-span-2" delay={0.08}>
                <MediaPlaceholder src={project.media.gallery?.[1]} label="Detail" ratio="4 / 3" className="rounded-2xl" />
              </Reveal>
              <Reveal className="md:col-span-2" delay={0.14}>
                <MediaPlaceholder src={project.media.gallery?.[2]} label="Mobile / state" ratio="4 / 3" className="rounded-2xl" />
              </Reveal>
              <Reveal className="md:col-span-6" delay={0.1}>
                <MediaPlaceholder src={project.media.gallery?.[3]} label="Flow overview" ratio="21 / 8" className="rounded-2xl" />
              </Reveal>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-28 sm:px-8 lg:grid-cols-12 lg:px-12">
          <div className="lg:col-span-3" />
          <div className="space-y-32 lg:col-span-9">
            <Block id="system" index={8} title="Design system & interaction details" kicker="Components & behaviour">
              <div className="grid gap-4 sm:grid-cols-3">
                {['Tokens', 'Components', 'Interaction states'].map((l) => (
                  <MediaPlaceholder key={l} label={l} tone="light" ratio="1 / 1" note="To be added" className="rounded-2xl" />
                ))}
              </div>
              <div className="mt-8 max-w-2xl">
                <Text value={cs.designSystem} fallback="The component system, tokens, and interaction details that keep the product consistent." />
              </div>
            </Block>

            <Block id="engineering" index={9} title="Design engineering & implementation" kicker="Design → code">
              <div className="grid gap-8 md:grid-cols-5">
                <div className="md:col-span-2">
                  <Text value={cs.engineering} fallback="How the design was implemented, the technical decisions involved, and how design and code stayed aligned." />
                </div>
                <div className="md:col-span-3">
                  <div className="overflow-hidden rounded-2xl border border-ink/10 bg-obsidian">
                    <div className="flex items-center gap-1.5 border-b border-canvas/10 px-4 py-3">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="size-2.5 rounded-full bg-steel/25" />
                      ))}
                      <MonoLabel className="ml-3 text-steel/70">implementation</MonoLabel>
                    </div>
                    <MediaPlaceholder label="Code / implementation detail" ratio="16 / 9" note="To be added" className="border-0" />
                  </div>
                </div>
              </div>
            </Block>

            <Block id="outcomes" index={10} title="Outcomes & learnings" kicker="Verified only">
              {cs.outcomes?.length ? (
                <ul className="grid gap-4 md:grid-cols-2">
                  {cs.outcomes.map((o) => (
                    <li key={o} className="rounded-2xl border border-ink/10 p-6 text-lg">
                      {o}
                    </li>
                  ))}
                </ul>
              ) : (
                <Pending>Only verified outcomes will appear here. If results weren’t measured, this section will focus on learnings instead.</Pending>
              )}
              <div className="mt-6 max-w-2xl">
                <Text value={cs.learnings} fallback="What this project taught me, and what I’d approach differently next time." />
              </div>
            </Block>
          </div>
        </div>
      </div>

      {/* Next project */}
      <Link to={`/work/${next.slug}`} className="group relative block overflow-hidden bg-obsidian text-canvas">
        <span
          aria-hidden="true"
          className="absolute inset-0 origin-bottom scale-y-0 bg-iris transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-y-100"
        />
        <div className="relative mx-auto max-w-[1440px] px-5 py-20 transition-colors duration-500 group-hover:text-obsidian sm:px-8 sm:py-28 lg:px-12">
          <MonoLabel className="opacity-70">Next case study — {next.index}</MonoLabel>
          <div className="mt-6 flex items-end justify-between gap-6">
            <span className="font-display text-[clamp(3.5rem,12vw,11rem)] font-medium leading-[0.8] tracking-[-0.06em]">{next.name}</span>
            <Arrow className="mb-3 size-10 shrink-0 transition-transform duration-500 group-hover:translate-x-2 sm:size-16" />
          </div>
          <p className="mt-6 max-w-lg opacity-70">{next.tagline}</p>
        </div>
      </Link>

      {/* Contact CTA */}
      <div className="border-t border-canvas/10 bg-obsidian text-canvas">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-14 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <p className="font-display text-2xl font-medium tracking-[-0.02em] sm:text-3xl">Want the full story behind this project?</p>
          <div className="flex flex-wrap gap-3">
            <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 rounded-full bg-iris px-5 py-3 font-medium text-obsidian transition-colors hover:bg-canvas">
              Get in touch <Arrow dir="up-right" className="size-4" />
            </a>
            <Link to="/resume" className="rounded-full border border-canvas/20 px-5 py-3 font-medium transition-colors hover:bg-canvas hover:text-obsidian">
              View resume
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
