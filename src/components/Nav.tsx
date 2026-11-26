import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { usePublicContent } from "../content/publicContent";
import { Link, useRouter } from "../lib/router";
import { supabase } from "../lib/supabase";
import { Arrow, EASE, MonoLabel } from "./ui";

const links = [
  { label: "Work", section: "work" },
  { label: "Expertise", section: "expertise" },
  { label: "Experience", section: "experience" },
  { label: "Approach", section: "approach" },
];

export function Nav() {
  const profile = usePublicContent().getSiteSettings();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { path } = useRouter();
const [avatarUrl, setAvatarUrl] = useState("");

useEffect(() => {
  const mediaId = profile.avatarMediaId;
  setAvatarUrl("");
  if (!mediaId || !supabase) return;

  let active = true;
  void supabase.functions
    .invoke("media-url", { body: { mediaId } })
    .then(({ data, error }) => {
      if (active && !error && typeof data?.url === "string") {
        setAvatarUrl(data.url);
      }
    });

  return () => {
    active = false;
  };
}, [profile.avatarMediaId]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          const main = document.getElementById("main");
          main?.setAttribute("tabindex", "-1");
          main?.focus();
        }}
        className="sr-only rounded-full bg-iris px-4 py-2 text-obsidian focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <motion.nav
        aria-label="Primary"
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
        className={`mx-auto flex max-w-[1440px] items-center justify-between rounded-full border py-2 pl-4 pr-2 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled || open
            ? "border-canvas/10 bg-obsidian/75 backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <Link
          to="/"
          className="group flex items-center gap-3 rounded-full"
          aria-label={`${profile.name} — home`}
        >
          <span className="grid size-8 place-items-center overflow-hidden rounded-full bg-canvas font-display text-[13px] font-bold tracking-tight text-obsidian transition-colors duration-300 group-hover:bg-iris">
  {avatarUrl ? (
    <img
      src={avatarUrl}
      alt=""
      className="h-full w-full object-cover"
      onError={() => setAvatarUrl("")}
    />
  ) : (
    "AK"
  )}
</span>
          <span className="hidden font-display text-[15px] font-medium tracking-tight text-canvas sm:block">
            {profile.name}
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.section}>
              <Link
                to="/"
                section={l.section}
                className="rounded-full px-3.5 py-2 text-[14px] text-steel transition-colors hover:text-canvas"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <Link
            to="/resume"
            className="hidden rounded-full px-4 py-2 text-[14px] text-canvas transition-colors hover:text-iris sm:block"
          >
            Resume
          </Link>
          <Link
            to="/"
            section="contact"
            className="group hidden items-center gap-2 rounded-full bg-canvas px-4 py-2 text-[14px] font-medium text-obsidian transition-colors hover:bg-iris sm:inline-flex"
          >
            Contact
            <Arrow className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="grid size-10 place-items-center rounded-full bg-canvas text-obsidian md:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className="relative block h-3 w-4" aria-hidden="true">
              <span
                className={`absolute left-0 h-[1.5px] w-4 bg-current transition-all duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-4 bg-current transition-all duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`}
              />
            </span>
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="grain fixed inset-0 -z-10 flex flex-col justify-between bg-obsidian px-6 pb-8 pt-28 md:hidden"
          >
            <ul className="space-y-1">
              {[...links, { label: "Contact", section: "contact" }].map((l, i) => (
                <motion.li
                  key={l.section}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: EASE }}
                >
                  <Link
                    to="/"
                    section={l.section}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 py-1 font-display text-5xl font-medium tracking-tight text-canvas"
                  >
                    <MonoLabel className="text-iris">0{i + 1}</MonoLabel>
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="space-y-4">
              <Link
                to="/resume"
                className="flex items-center justify-between rounded-full bg-iris px-6 py-4 font-display text-lg font-medium text-obsidian"
              >
                View resume <Arrow className="size-4" />
              </Link>
              <a href={`mailto:${profile.email}`} className="block text-center text-steel">
                {profile.email}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
