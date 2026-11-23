import { LineReveal, MonoLabel, Reveal, SectionTag } from '../components/ui'
import { experience } from '../data/profile'

export function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="relative bg-canvas py-28 text-ink sm:py-36">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <SectionTag index="03" label="Experience" tone="light" />
              <h2
                id="experience-title"
                className="mt-10 font-display text-[clamp(2.6rem,5vw,4.6rem)] font-medium leading-[0.92] tracking-[-0.04em]"
              >
                <LineReveal lines={['Where the', 'practice was', <span className="text-ink/40">built.</span>]} />
              </h2>
              <Reveal delay={0.2}>
                <p className="mt-8 max-w-sm text-[16px] leading-relaxed text-ink/65">
                  From agency work on B2B SaaS to founding my own studio — each role sharpened how I approach
                  complex products.
                </p>
              </Reveal>
            </div>
          </div>

          <ol className="lg:col-span-8">
            {experience.map((e, i) => (
              <Reveal as="li" key={e.org} delay={i * 0.05}>
                <div className="group relative grid gap-4 border-t border-ink/15 py-10 sm:grid-cols-8 sm:gap-8">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-[-1px] h-px w-full origin-left scale-x-0 bg-ink transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-x-100"
                  />
                  <div className="sm:col-span-3">
                    <MonoLabel className="text-ink/45">0{i + 1}</MonoLabel>
                    <h3 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.4rem)] font-medium leading-none tracking-[-0.04em] transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-2">
                      {e.org}
                    </h3>
                  </div>
                  <div className="sm:col-span-5 sm:pt-7">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-display text-[19px] font-medium tracking-[-0.01em]">{e.role}</p>
                      <span className="rounded-full bg-ink/[0.06] px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.1em] text-ink/60">
                        {e.context}
                      </span>
                    </div>
                    <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-ink/65">{e.summary}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <li className="border-t border-ink/15" aria-hidden="true" />
          </ol>
        </div>
      </div>
    </section>
  )
}
