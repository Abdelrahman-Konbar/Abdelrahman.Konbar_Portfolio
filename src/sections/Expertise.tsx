import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { EASE, LineReveal, MonoLabel, Reveal, SectionTag } from "../components/ui";
import { contentRepository } from "../content/repository";
import { siteContent } from "../data/site";

export function Expertise() {
  const expertise = contentRepository.getExpertise();
  const content = siteContent.homepage.expertise;
  const [active, setActive] = useState(1);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = expertise[active];

  const onKey = (e: React.KeyboardEvent) => {
    const n = expertise.length;
    let next = active;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (active + 1) % n;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (active - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <section
      id="expertise"
      aria-labelledby="expertise-title"
      className="grain relative bg-obsidian py-28 sm:py-36"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <SectionTag index="02" label="Expertise & contribution" />
        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2
            id="expertise-title"
            className="font-display text-[clamp(2.6rem,6vw,5.6rem)] font-medium leading-[0.92] tracking-[-0.04em] lg:col-span-8"
          >
            <LineReveal
              lines={[content.heading[0], <span className="text-iris">{content.heading[1]}</span>]}
            />
          </h2>
          <Reveal className="lg:col-span-4 lg:pb-3" delay={0.15}>
            <p className="text-[16px] leading-relaxed text-steel">{content.description}</p>
          </Reveal>
        </div>

        {/* Desktop: continuum explorer */}
        <div className="mt-20 hidden lg:block">
          <div
            role="tablist"
            aria-label="Areas of expertise"
            className="relative grid grid-cols-5"
            onKeyDown={onKey}
          >
            <div
              className="absolute left-0 right-0 top-[11px] h-px bg-steel/20"
              aria-hidden="true"
            />
            <motion.div
              aria-hidden="true"
              className="absolute left-0 top-[11px] h-px origin-left bg-iris"
              animate={{ width: `${(active / (expertise.length - 1)) * 80 + 10}%` }}
              transition={{ duration: 0.8, ease: EASE }}
            />
            {expertise.map((x, i) => {
              const selected = i === active;
              return (
                <button
                  key={x.key}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  role="tab"
                  id={`tab-${x.key}`}
                  aria-selected={selected}
                  aria-controls="expertise-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className="group relative flex flex-col items-center text-center"
                >
                  <span
                    className={`relative z-10 grid size-[23px] place-items-center rounded-full border transition-colors duration-500 ${
                      i <= active ? "border-iris bg-obsidian" : "border-steel/30 bg-obsidian"
                    }`}
                  >
                    <span
                      className={`size-[9px] rounded-full transition-all duration-500 ${
                        selected
                          ? "scale-100 bg-lime"
                          : i < active
                            ? "scale-75 bg-iris"
                            : "scale-50 bg-steel/40"
                      }`}
                    />
                  </span>
                  <MonoLabel
                    className={`mt-5 transition-colors ${selected ? "text-iris" : "text-steel/60"}`}
                  >
                    0{i + 1} · {x.short}
                  </MonoLabel>
                  <span
                    className={`mt-3 max-w-[14rem] font-display text-[19px] font-medium leading-tight tracking-[-0.01em] transition-colors duration-300 ${
                      selected ? "text-canvas" : "text-steel/60 group-hover:text-canvas"
                    }`}
                  >
                    {x.title}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id="expertise-panel"
            role="tabpanel"
            aria-labelledby={`tab-${current.key}`}
            className="relative mt-16 min-h-[300px] overflow-hidden rounded-3xl border border-canvas/10 bg-graphite"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="grid grid-cols-12 gap-10 p-12"
              >
                <div className="col-span-2">
                  <span className="font-display text-[7rem] font-medium leading-[0.8] tracking-[-0.06em] text-iris">
                    0{active + 1}
                  </span>
                </div>
                <div className="col-span-6">
                  <h3 className="font-display text-4xl font-medium tracking-[-0.03em]">
                    {current.title}
                  </h3>
                  <p className="mt-5 max-w-xl text-lg leading-relaxed text-steel">{current.body}</p>
                </div>
                <div className="col-span-4 border-l border-canvas/10 pl-10">
                  <MonoLabel className="text-steel/70">In practice</MonoLabel>
                  <ul className="mt-5 space-y-3">
                    {current.detail.map((d, i) => (
                      <motion.li
                        key={d}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.05, duration: 0.4, ease: EASE }}
                        className="flex items-center gap-3 text-[16px] text-canvas"
                      >
                        <span className="h-px w-4 bg-iris" />
                        {d}
                      </motion.li>
                    ))}
                  </ul>
                  <div className="mt-8 flex items-center gap-2 text-steel/70">
                    {active > 0 && <MonoLabel>← {expertise[active - 1].short}</MonoLabel>}
                    {active > 0 && active < expertise.length - 1 && (
                      <span className="text-steel/30">·</span>
                    )}
                    {active < expertise.length - 1 && (
                      <MonoLabel>{expertise[active + 1].short} →</MonoLabel>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile & tablet: vertical continuum */}
        <ol className="relative mt-16 space-y-12 border-l border-steel/20 pl-8 lg:hidden">
          {expertise.map((x, i) => (
            <Reveal as="li" key={x.key} className="relative">
              <span className="absolute -left-[37px] top-1 grid size-[17px] place-items-center rounded-full border border-iris bg-obsidian">
                <span className="size-[7px] rounded-full bg-iris" />
              </span>
              <MonoLabel className="text-iris">
                0{i + 1} · {x.short}
              </MonoLabel>
              <h3 className="mt-2 font-display text-[28px] font-medium leading-tight tracking-[-0.02em]">
                {x.title}
              </h3>
              <p className="mt-3 text-[16px] leading-relaxed text-steel">{x.body}</p>
              <p className="mt-4 text-[14px] text-canvas/80">{x.detail.join(" · ")}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
