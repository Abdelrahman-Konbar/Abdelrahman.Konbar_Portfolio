import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Arrow, LineReveal, LocalTime, MonoLabel, Reveal } from "../components/ui";
import { usePublicContent } from "../content/publicContent";
import { Link } from "../lib/router";

export function Contact() {
  const repository = usePublicContent();
  const content = repository.getHomepageContent().contact;
  const profile = repository.getSiteSettings();
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const [copied, setCopied] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const marqueeX = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["10%", "-25%"]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  return (
    <section
      ref={ref}
      id="contact"
      aria-labelledby="contact-title"
      className="relative isolate overflow-hidden bg-iris text-obsidian"
    >
      <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-28 sm:px-8 sm:pt-36 lg:px-12">
        <div className="flex flex-wrap items-center gap-3">
          <MonoLabel>05</MonoLabel>
          <span className="h-px w-10 bg-obsidian/30" />
          <MonoLabel>Contact</MonoLabel>
          <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-obsidian px-3 py-1.5 text-canvas">
            <span className="size-2 rounded-full bg-lime" />
            <MonoLabel>{content.availability}</MonoLabel>
          </span>
        </div>

        <h2
          id="contact-title"
          className="mt-12 font-display text-[clamp(3rem,10vw,10rem)] font-medium leading-[0.86] tracking-[-0.05em]"
        >
          <LineReveal lines={[content.heading[0], content.heading[1]]} />
        </h2>

        <div className="mt-16 grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="max-w-md text-lg leading-relaxed text-obsidian/75">
              {content.description}
            </p>
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal delay={0.1}>
              <div className="group flex flex-col gap-4 border-y border-obsidian/20 py-6 sm:flex-row sm:items-center sm:justify-between">
                <a
                  href={`mailto:${profile.email}`}
                  className="break-all font-display text-[clamp(1.4rem,3.2vw,2.6rem)] font-medium tracking-[-0.03em] underline-offset-[8px] hover:underline"
                >
                  {profile.email}
                </a>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={copy}
                    className="rounded-full border border-obsidian/25 px-4 py-2.5 text-[14px] font-medium transition-colors hover:bg-obsidian hover:text-canvas"
                  >
                    <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <a
                    href={`mailto:${profile.email}`}
                    className="group/btn inline-flex items-center gap-2 rounded-full bg-obsidian px-5 py-2.5 text-[14px] font-medium text-canvas transition-colors hover:bg-canvas hover:text-obsidian"
                  >
                    Email me <Arrow dir="up-right" className="size-3.5" />
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <ul className="grid sm:grid-cols-2">
                <li className="border-b border-obsidian/20 sm:border-r sm:pr-6">
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between py-6 font-display text-2xl font-medium tracking-[-0.02em]"
                  >
                    LinkedIn
                    <Arrow
                      dir="up-right"
                      className="size-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1"
                    />
                  </a>
                </li>
                <li className="border-b border-obsidian/20 sm:pl-6">
                  <Link
                    to="/resume"
                    className="group flex items-center justify-between py-6 font-display text-2xl font-medium tracking-[-0.02em]"
                  >
                    Resume
                    <Arrow className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </li>
              </ul>
            </Reveal>
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="overflow-hidden pb-4">
        <motion.p
          style={{ x: marqueeX }}
          className="whitespace-nowrap font-display text-[18vw] font-medium leading-[0.8] tracking-[-0.06em] text-obsidian/[0.08]"
        >
          Complexity → Clarity → Complexity → Clarity
        </motion.p>
      </div>
    </section>
  );
}

export function Footer() {
  const profile = usePublicContent().getSiteSettings();
  return (
    <footer className="bg-obsidian text-steel">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-5 py-8 text-[13px] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p>
          <span className="text-canvas">{profile.name}</span> — {profile.role}
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <span>
            {profile.location} · <LocalTime className="tabular-nums" />
          </span>
          <span>© {new Date().getFullYear()}</span>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-canvas hover:text-iris"
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
