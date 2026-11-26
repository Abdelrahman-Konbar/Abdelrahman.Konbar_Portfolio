import { useEffect } from "react";
import { Arrow, LineReveal, MonoLabel, Reveal } from "../components/ui";
import { usePublicContent } from "../content/publicContent";
import { Link } from "../lib/router";
import { siteContent } from "../data/site";

export function Resume() {
  const contentRepository = usePublicContent();
  const profile = contentRepository.getSiteSettings();
  const experience = contentRepository.getExperience();
  const expertise = contentRepository.getExpertise();
  const projects = contentRepository.getProjects();
  useEffect(() => {
    document.title = `Resume · ${profile.name}`;
  }, []);

  return (
    <div className="bg-canvas text-ink print:bg-white">
      <div className="mx-auto max-w-[1100px] px-5 pb-24 pt-32 sm:px-8 sm:pt-40 print:pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 text-[14px] text-ink/60 hover:text-ink"
          >
            <Arrow className="size-4 rotate-180 transition-transform group-hover:-translate-x-1" />{" "}
            Back to portfolio
          </Link>
          <div className="flex flex-wrap gap-2">
            {profile.resumePdfUrl ? (
              <a
                href={profile.resumePdfUrl}
                download
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-[14px] font-medium text-canvas hover:bg-iris hover:text-obsidian"
              >
                Download PDF <Arrow dir="down" className="size-3.5" />
              </a>
            ) : null}
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full border border-ink/20 px-5 py-2.5 text-[14px] font-medium transition-colors hover:bg-ink hover:text-canvas"
            >
              Print / save as PDF
            </button>
          </div>
        </div>

        <header className="mt-14 border-b border-ink/15 pb-10 print:mt-0">
          <MonoLabel className="text-ink/50">Resume</MonoLabel>
          <h1 className="mt-4 font-display text-[clamp(3rem,8vw,6.5rem)] font-medium leading-[0.88] tracking-[-0.05em]">
            <LineReveal inView={false} delay={0.1} lines={[profile.firstName, profile.lastName]} />
          </h1>
          <p className="mt-6 font-display text-2xl font-medium tracking-[-0.02em]">
            {profile.role}
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-ink/70">
            <li>{profile.location}</li>
            <li>{profile.availability}</li>
            <li>
              <a
                href={`mailto:${profile.email}`}
                className="text-ink underline underline-offset-4 hover:text-iris"
              >
                {profile.email}
              </a>
            </li>
            <li>
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="text-ink underline underline-offset-4 hover:text-iris"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </header>

        <div className="grid gap-12 py-12 md:grid-cols-12">
          <MonoLabel className="text-ink/50 md:col-span-3">Profile</MonoLabel>
          <p className="text-lg leading-relaxed md:col-span-9">{siteContent.resume.profile}</p>
        </div>

        <div className="grid gap-12 border-t border-ink/15 py-12 md:grid-cols-12">
          <MonoLabel className="text-ink/50 md:col-span-3">Experience</MonoLabel>
          <ol className="space-y-10 md:col-span-9">
            {experience.map((e, i) => (
              <Reveal as="li" key={e.org} delay={i * 0.05}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-2xl font-medium tracking-[-0.02em]">{e.org}</h2>
                  <MonoLabel className="text-ink/50">{e.context}</MonoLabel>
                </div>
                <p className="mt-1 font-medium">{e.role}</p>
                <p className="mt-2 text-ink/65">{e.summary}</p>
              </Reveal>
            ))}
          </ol>
        </div>

        <div className="grid gap-12 border-t border-ink/15 py-12 md:grid-cols-12">
          <MonoLabel className="text-ink/50 md:col-span-3">Expertise</MonoLabel>
          <ul className="grid gap-6 sm:grid-cols-2 md:col-span-9">
            {expertise.map((x) => (
              <li key={x.key}>
                <h3 className="font-medium">{x.title}</h3>
                <p className="mt-1 text-[15px] text-ink/65">{x.detail.join(" · ")}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-12 border-t border-ink/15 py-12 md:grid-cols-12">
          <MonoLabel className="text-ink/50 md:col-span-3">Selected work</MonoLabel>
          <ul className="divide-y divide-ink/10 border-y border-ink/10 md:col-span-9">
            {projects.map((p) => (
              <li key={p.slug}>
                <Link
                  to={`/work/${p.slug}`}
                  className="group flex items-center justify-between gap-4 py-4"
                >
                  <span>
                    <span className="font-display text-xl font-medium tracking-[-0.02em]">
                      {p.name}
                    </span>
                    <span className="ml-3 text-[15px] text-ink/60">{p.category}</span>
                  </span>
                  <Arrow className="size-4 transition-transform group-hover:translate-x-1 print:hidden" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {!profile.resumePdfUrl && (
          <p className="mt-6 text-[14px] text-ink/50 print:hidden">
            A downloadable PDF version is coming soon. In the meantime, use “Print / save as PDF” or{" "}
            <a
              href={`mailto:${profile.email}?subject=Resume%20request`}
              className="underline underline-offset-4 hover:text-ink"
            >
              request it by email
            </a>
            .
          </p>
        )}
      </div>
    </div>
  );
}
