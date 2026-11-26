import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { MonoLabel, Reveal, SectionTag } from "../components/ui";
import { usePublicContent } from "../content/publicContent";

function Word({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block whitespace-pre">
      {word}{" "}
    </motion.span>
  );
}

export function Philosophy() {
  const { manifesto, tenets } = usePublicContent().getHomepageContent().philosophy;
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  const words = manifesto.split(" ");

  return (
    <section
      id="approach"
      aria-labelledby="approach-title"
      className="grain relative overflow-hidden bg-obsidian py-28 sm:py-40"
    >
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
        <SectionTag index="04" label="Approach" />
        <h2 id="approach-title" className="sr-only">
          Design approach
        </h2>
        <div ref={ref} className="mt-12 max-w-[68rem]">
          <p className="font-display text-[clamp(1.9rem,4.4vw,4.2rem)] font-medium leading-[1.06] tracking-[-0.03em] text-canvas">
            {reduce
              ? manifesto
              : words.map((w, i) => (
                  <Word
                    key={i}
                    word={w}
                    progress={scrollYProgress}
                    range={[i / words.length, (i + 1) / words.length]}
                  />
                ))}
          </p>
        </div>

        <div className="mt-24 grid gap-px overflow-hidden rounded-3xl border border-canvas/10 bg-canvas/10 md:grid-cols-3">
          {tenets.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.08} className="group relative bg-obsidian p-8 sm:p-10">
              <div className="flex items-start justify-between">
                <span className="font-display text-5xl font-light text-iris/70 transition-colors duration-500 group-hover:text-lime">
                  {t.numeral}
                </span>
                <MonoLabel className="text-steel/50">Principle</MonoLabel>
              </div>
              <h3 className="mt-16 font-display text-[26px] font-medium leading-[1.1] tracking-[-0.02em] sm:mt-24">
                {t.title}
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-steel">{t.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
